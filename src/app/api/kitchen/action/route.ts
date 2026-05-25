import { NextResponse, type NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import bcrypt from "bcryptjs";
import { randomOtp } from "@/lib/utils";
import { requireRole } from "@/lib/auth/get-user";

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

  // Security Check: Guard endpoint against unauthorized access
  const user = await requireRole(["kitchen_staff", "canteen_admin", "super_admin"], tenant.id);
  if (!user) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  const dbClient = getAdminClient(tenant.id);

  if (action === "walk-in") {
    const { items: itemsInput } = body;
    let validated: { item: { id: string; name: string; price_paise: number; diet: "veg" | "nonveg" | "egg"; prep_target_seconds: number }; qty: number }[] = [];

    if (itemsInput && Array.isArray(itemsInput) && itemsInput.length > 0) {
      for (const input of itemsInput) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.idOrName);
        let query = dbClient
          .from("menu_items")
          .select("id, name, price_paise, diet, prep_target_seconds")
          .eq("tenant_id", tenant.id)
          .eq("status", "live")
          .eq("in_stock", true);

        if (isUuid) {
          query = query.eq("id", input.idOrName);
        } else {
          query = query.eq("name", input.idOrName);
        }

        let { data: matchItem } = await query.maybeSingle<{ id: string; name: string; price_paise: number; diet: "veg" | "nonveg" | "egg"; prep_target_seconds: number }>();

        if (!matchItem && !isUuid) {
          const { data: partialMatch } = await dbClient
            .from("menu_items")
            .select("id, name, price_paise, diet, prep_target_seconds")
            .eq("tenant_id", tenant.id)
            .eq("status", "live")
            .eq("in_stock", true)
            .ilike("name", `%${input.idOrName}%`)
            .limit(1);
          if (partialMatch && partialMatch[0]) {
            matchItem = partialMatch[0] as any;
          }
        }

        if (!matchItem) {
          return NextResponse.json({ error: `Item "${input.idOrName}" not found or out of stock.` }, { status: 400 });
        }

        validated.push({ item: matchItem, qty: Math.max(1, input.qty) });
      }
    } else {
      const { data: fetchedItems } = await dbClient
        .from("menu_items")
        .select("id, name, price_paise, diet, prep_target_seconds")
        .eq("tenant_id", tenant.id)
        .eq("status", "live")
        .eq("in_stock", true)
        .limit(10);

      let items = fetchedItems || [];

      if (items.length === 0) {
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
            .select("id, name, price_paise, diet, prep_target_seconds")
            .single<{ id: string; name: string; price_paise: number; diet: "veg" | "nonveg" | "egg"; prep_target_seconds: number }>();

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

      validated = selected.map((item) => {
        const qty = 1 + Math.floor(Math.random() * 2);
        return { item: item as any, qty };
      });
    }

    let total = 0;
    for (const v of validated) {
      total += v.item.price_paise * v.qty;
    }

    const { data: codeData, error: codeErr } = await dbClient.rpc("next_order_short_code", {
      p_tenant: tenant.id,
    });
    const shortCode = (!codeErr && codeData != null) ? String(codeData) : String(1000 + Math.floor(Math.random() * 9000));

    const { data: newOrder, error: orderErr } = await dbClient
      .from("orders")
      .insert({
        tenant_id: tenant.id,
        user_id: null,
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

    // Insert status log
    await dbClient.from("order_status_logs").insert({
      tenant_id: tenant.id,
      order_id: newOrder.id,
      from_status: null,
      to_status: "placed",
      actor_user_id: user.id,
      note: "Walk-in order created at counter",
    });

    // Insert audit log
    await dbClient.from("audit_logs").insert({
      tenant_id: tenant.id,
      actor_user_id: user.id,
      action: "order.walk_in_created",
      target_type: "order",
      target_id: newOrder.id,
      meta: { total_paise: total, itemsCount: validated.length },
    });

    await dbClient.from("payments").insert({
      tenant_id: tenant.id,
      order_id: newOrder.id,
      razorpay_order_id: null,
      razorpay_payment_id: `pay_walkin_${newOrder.id.slice(0, 8)}`,
      amount_paise: total,
      status: "captured",
    });

    // Fetch full details to embed in the realtime payload
    const { data: updatedOrder } = await dbClient
      .from("orders")
      .select("id, short_code, status, total_paise, placed_at, ready_at, collected_at, customer_name, order_type, table_label")
      .eq("id", newOrder.id)
      .single();

    const { data: orderLines } = await dbClient
      .from("order_items")
      .select("id, order_id, name_snapshot, qty, diet_snapshot")
      .eq("order_id", newOrder.id);

    // Emit status change event for realtime queue updates
    await dbClient.from("order_events").insert({
      order_id: newOrder.id,
      tenant_id: tenant.id,
      event_type: "placed",
      payload: {
        actor: "counter",
        order: updatedOrder,
        lines: orderLines || []
      },
    });

    return NextResponse.json({ ok: true, orderId: newOrder.id });
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

    // Insert status log
    await dbClient.from("order_status_logs").insert({
      tenant_id: tenant.id,
      order_id: o.id,
      from_status: o.status as any,
      to_status: nextStatus as any,
      actor_user_id: user.id,
      note: nextStatus === "ready" ? "OTP issued" : nextStatus === "collected" ? "Handed over" : null,
    });

    // Insert audit log
    await dbClient.from("audit_logs").insert({
      tenant_id: tenant.id,
      actor_user_id: user.id,
      action: `order.${nextStatus}`,
      target_type: "order",
      target_id: o.id,
    });

    // Emit event for realtime sync
    await dbClient.from("order_events").insert({
      order_id: o.id,
      tenant_id: tenant.id,
      event_type: nextStatus,
      payload: { actor: "kitchen" },
    });

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

    const { data: o } = await query.maybeSingle<{ id: string }>();
    if (!o) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Call the atomic verify_and_increment_otp_limit function
    const { data: result, error: rpcErr } = await (dbClient as any).rpc("verify_and_increment_otp_limit", {
      p_order_id: o.id,
      p_tenant_id: tenant.id,
      p_input_otp: otp,
    });

    if (rpcErr || !result) {
      return NextResponse.json({ ok: false, error: rpcErr?.message ?? "Error verifying OTP" }, { status: 400 });
    }

    const res = result as { ok: boolean; error?: string; attemptsLeft?: number };
    if (!res.ok) {
      const left = res.attemptsLeft ?? 0;
      return NextResponse.json({ ok: false, error: res.error || "Wrong code", attemptsLeft: left });
    }

    // Clean up pickup secret
    await dbClient.from("pickup_secrets").delete().eq("order_id", o.id);

    // Insert status log
    await dbClient.from("order_status_logs").insert({
      tenant_id: tenant.id,
      order_id: o.id,
      from_status: "ready",
      to_status: "collected",
      actor_user_id: user.id,
      note: "OTP verified",
    });

    // Insert audit log
    await dbClient.from("audit_logs").insert({
      tenant_id: tenant.id,
      actor_user_id: user.id,
      action: "order.collected",
      target_type: "order",
      target_id: o.id,
    });

    // Emit event for realtime sync
    await dbClient.from("order_events").insert({
      order_id: o.id,
      tenant_id: tenant.id,
      event_type: "collected",
      payload: { actor: "kitchen" },
    });

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
