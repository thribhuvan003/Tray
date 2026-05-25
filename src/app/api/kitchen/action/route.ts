import { NextResponse, type NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import bcrypt from "bcryptjs";
import { randomOtp } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, tenant: tenantSlug } = body;

  const admin = getAdminClient();
  const { data: tenant } = await admin
    .from("tenants")
    .select("id, name")
    .eq("slug", tenantSlug)
    .maybeSingle<{ id: string; name: string }>();

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const dbClient = getAdminClient(tenant.id);

  if (action === "walk-in") {
    // 1. Fetch 1-3 random menu items
    const { data: fetchedItems } = await dbClient
      .from("menu_items")
      .select("id, name, price_paise, diet")
      .eq("tenant_id", tenant.id)
      .eq("status", "live")
      .eq("in_stock", true)
      .limit(10);

    let items = fetchedItems || [];

    if (items.length === 0) {
      // Find or create Specials category
      let { data: cat } = await dbClient
        .from("menu_categories")
        .select("id")
        .eq("tenant_id", tenant.id)
        .eq("name", "Specials")
        .maybeSingle<{ id: string }>();

      if (!cat) {
        const { data: newCat } = await dbClient
          .from("menu_categories")
          .insert({ tenant_id: tenant.id, name: "Specials", sort_order: 99 })
          .select("id")
          .single<{ id: string }>();
        cat = newCat;
      }

      if (cat) {
        const { data: newItem } = await dbClient
          .from("menu_items")
          .insert({
            tenant_id: tenant.id,
            category_id: cat.id,
            name: "Samosa",
            description: "Fresh crispy samosa",
            price_paise: 2000,
            diet: "veg",
            status: "live",
            prep_target_seconds: 300,
            in_stock: true,
            sort_order: 999,
          })
          .select("id, name, price_paise, diet")
          .single<{ id: string; name: string; price_paise: number; diet: "veg" | "nonveg" | "egg" }>();

        if (newItem) {
          items = [newItem];
        }
      }
    }

    if (items.length === 0) {
      return NextResponse.json({ error: "No menu items available" }, { status: 400 });
    }

    const numItems = Math.min(items.length, 1 + Math.floor(Math.random() * 3));
    const selected = [...items].sort(() => 0.5 - Math.random()).slice(0, numItems);

    let total = 0;
    const validated = selected.map((item) => {
      const qty = 1 + Math.floor(Math.random() * 2);
      total += item.price_paise * qty;
      return { item, qty };
    });

    const { data: codeData, error: codeErr } = await dbClient.rpc("next_order_short_code", {
      p_tenant: tenant.id,
    });
    const shortCode = (!codeErr && codeData != null) ? String(codeData) : String(1000 + Math.floor(Math.random() * 9000));

    const { data: newOrder, error: orderErr } = await dbClient
      .from("orders")
      .insert({
        tenant_id: tenant.id,
        short_code: shortCode,
        status: "placed",
        total_paise: total,
        order_type: "takeaway",
        customer_name: "Walk-in · counter",
        notes: "Walk-in order",
        placed_at: new Date().toISOString(),
      })
      .select("id")
      .single<{ id: string }>();

    if (orderErr || !newOrder) {
      return NextResponse.json({ error: orderErr?.message ?? "Failed to create order" }, { status: 500 });
    }

    await dbClient.from("order_items").insert(
      validated.map((v) => ({
        tenant_id: tenant.id,
        order_id: newOrder.id,
        menu_item_id: v.item.id,
        name_snapshot: v.item.name,
        price_paise_snapshot: v.item.price_paise,
        diet_snapshot: v.item.diet,
        qty: v.qty,
      }))
    );

    await dbClient.from("payments").insert({
      tenant_id: tenant.id,
      order_id: newOrder.id,
      amount_paise: total,
      status: "captured",
    });

    return NextResponse.json({ ok: true });
  }

  if (action === "advance") {
    const { orderId } = body;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
    
    // Resolve order by ID or short code
    let query = dbClient
      .from("orders")
      .select("id, status")
      .eq("tenant_id", tenant.id);
      
    if (isUuid) {
      query = query.or(`id.eq.${orderId},short_code.eq.${orderId.replace("T-", "")}`);
    } else {
      query = query.eq("short_code", orderId.replace("T-", ""));
    }

    const { data: o } = await query.maybeSingle<{ id: string; status: string }>();

    if (!o) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const statusFlow: Record<string, string> = {
      placed: "preparing",
      preparing: "ready",
      ready: "collected",
    };

    const nextStatus = statusFlow[o.status];
    if (!nextStatus) return NextResponse.json({ error: `Cannot advance from ${o.status}` }, { status: 400 });

    if (nextStatus === "ready") {
      const otp = randomOtp();
      const hash = await bcrypt.hash(otp, 4);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

      await dbClient
        .from("orders")
        .update({ status: nextStatus as any, otp_hash: hash, ready_at: new Date().toISOString() })
        .eq("id", o.id);

      await dbClient.from("pickup_secrets").upsert(
        { order_id: o.id, tenant_id: tenant.id, otp_plain: otp, expires_at: expiresAt },
        { onConflict: "order_id" }
      );
    } else if (nextStatus === "collected") {
      await dbClient
        .from("orders")
        .update({ status: nextStatus as any, collected_at: new Date().toISOString() })
        .eq("id", o.id);
      await dbClient.from("pickup_secrets").delete().eq("order_id", o.id);
    } else {
      await dbClient
        .from("orders")
        .update({ status: nextStatus as any })
        .eq("id", o.id);
    }

    return NextResponse.json({ ok: true });
  }

  if (action === "verify-otp") {
    const { orderId, otp } = body;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
    
    let query = dbClient
      .from("orders")
      .select("id")
      .eq("tenant_id", tenant.id);

    if (isUuid) {
      query = query.or(`id.eq.${orderId},short_code.eq.${orderId.replace("T-", "")}`);
    } else {
      query = query.eq("short_code", orderId.replace("T-", ""));
    }

    const { data: o } = await query.maybeSingle<{ id: string; status: string; otp_hash: string | null }>();
    if (!o) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (!o.otp_hash) return NextResponse.json({ error: "Order not ready for pickup" }, { status: 400 });
    if (o.status !== "ready") return NextResponse.json({ error: `Order is "${o.status}"` }, { status: 400 });

    // Call the new atomic verify_and_increment_otp_limit function
    const { data: result, error: rpcErr } = await (dbClient as any).rpc("verify_and_increment_otp_limit", {
      p_order_id: o.id,
      p_tenant_id: tenant.id,
      p_input_otp: otp,
      p_expected_hash: o.otp_hash,
    });

    if (rpcErr || !result) {
      return NextResponse.json({ ok: false, error: rpcErr?.message ?? "Error verifying OTP" }, { status: 400 });
    }

    const res = result as { ok: boolean; error?: string; attemptsLeft?: number };
    if (!res.ok) {
      const left = res.attemptsLeft ?? 0;
      return NextResponse.json({ ok: false, error: res.error || "Wrong code", attemptsLeft: left });
    }

    // Clean up pickup secret; verify_and_increment_otp_limit already sets status to 'collected' and updates timestamp
    await dbClient.from("pickup_secrets").delete().eq("order_id", o.id);

    return NextResponse.json({ ok: true });
  }

  if (action === "special-push") {
    const { name, description, price, prep, diet } = body;

    // Find or create Specials category
    let { data: cat } = await dbClient
      .from("menu_categories")
      .select("id")
      .eq("tenant_id", tenant.id)
      .eq("name", "Specials")
      .maybeSingle<{ id: string }>();

    if (!cat) {
      const { data: newCat } = await dbClient
        .from("menu_categories")
        .insert({ tenant_id: tenant.id, name: "Specials", sort_order: 99 })
        .select("id")
        .single<{ id: string }>();
      cat = newCat;
    }

    if (!cat) return NextResponse.json({ error: "Could not resolve Specials category" }, { status: 500 });

    const { data: item, error: itemErr } = await dbClient
      .from("menu_items")
      .insert({
        tenant_id: tenant.id,
        category_id: cat.id,
        name,
        description,
        price_paise: Math.round(price * 100),
        diet,
        status: "live",
        prep_target_seconds: prep * 60,
        in_stock: true,
        sort_order: 999,
      })
      .select("id")
      .single<{ id: string }>();

    if (itemErr || !item) {
      return NextResponse.json({ error: itemErr?.message ?? "Failed to push item" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, itemId: item.id });
  }

  if (action === "special-remove") {
    const { itemId } = body;
    await dbClient
      .from("menu_items")
      .update({ status: "archived" })
      .eq("id", itemId)
      .eq("tenant_id", tenant.id);

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
