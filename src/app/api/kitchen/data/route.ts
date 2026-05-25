import { NextResponse, type NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/get-user";

export const dynamic = "force-dynamic";

// IST offset: UTC+5:30 = 5.5 hours = 19800 seconds
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function todayISTStart(): Date {
  const nowIST = new Date(Date.now() + IST_OFFSET_MS);
  const d = new Date(nowIST);
  d.setUTCHours(0, 0, 0, 0);
  return new Date(d.getTime() - IST_OFFSET_MS);
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tenantSlug = searchParams.get("tenant");

  // ── SECURITY: require auth — kitchen_staff, canteen_admin, or super_admin ──
  // Tenant slug is required (no "aditya" default)
  if (!tenantSlug) {
    return NextResponse.json({ error: "Tenant slug required" }, { status: 400 });
  }

  // Resolve tenant first (needed for requireRole)
  const admin = getAdminClient();
  const { data: tenant } = await admin
    .from("tenants")
    .select("id, name, slug")
    .eq("slug", tenantSlug)
    .maybeSingle<{ id: string; name: string; slug: string }>();

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  // Auth gate — must be kitchen staff or admin of this specific tenant
  const user = await requireRole(["kitchen_staff", "canteen_admin", "super_admin"], tenant.id);
  if (!user) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  // ── Fetch today's active orders (IST midnight start) ──────────────────────
  const todayStart = todayISTStart();

  const { data: orders } = await admin
    .from("orders")
    .select("id, short_code, status, total_paise, placed_at, customer_name, order_type, table_label, ready_at, collected_at")
    .eq("tenant_id", tenant.id)
    .or(`status.in.(placed,preparing,ready),and(status.eq.collected,placed_at.gte.${todayStart.toISOString()})`)
    .order("placed_at", { ascending: false });

  const statusMap: Record<string, string> = {
    placed: "incoming",
    preparing: "preparing",
    ready: "ready",
    collected: "collected",
  };

  const orderIds = (orders ?? []).map((o) => o.id);
  let orderItems: any[] = [];
  let pickupSecrets: any[] = [];

  if (orderIds.length > 0) {
    const [itemsRes, secretsRes] = await Promise.all([
      admin
        .from("order_items")
        .select("id, order_id, name_snapshot, qty, diet_snapshot, menu_items(category_id, prep_target_seconds, menu_categories(name))")
        .in("order_id", orderIds),
      // OTP only returned to authenticated kitchen staff — safe here
      admin
        .from("pickup_secrets")
        .select("order_id, otp_plain")
        .in("order_id", orderIds),
    ]);
    orderItems = itemsRes.data ?? [];
    pickupSecrets = secretsRes.data ?? [];
  }

  const itemsByOrder = new Map<string, any[]>();
  for (const it of orderItems) {
    if (!itemsByOrder.has(it.order_id)) itemsByOrder.set(it.order_id, []);
    const isSpecial = it.menu_items?.menu_categories?.name === "Specials";
    itemsByOrder.get(it.order_id)!.push({
      name: it.name_snapshot,
      diet: it.diet_snapshot,
      q: it.qty,
      special: isSpecial,
      tgt: Math.max(1, Math.round((it.menu_items?.prep_target_seconds ?? 360) / 60)),
    });
  }

  const secretsMap = new Map<string, string>();
  for (const s of pickupSecrets) {
    secretsMap.set(s.order_id, s.otp_plain);
  }

  const mappedOrders = (orders ?? []).map((o) => {
    const items = itemsByOrder.get(o.id) ?? [];
    return {
      dbId: o.id,
      id: o.short_code.startsWith("T-") ? o.short_code : `T-${o.short_code}`,
      items,
      total: o.total_paise / 100,
      otp: secretsMap.get(o.id) ?? "0000",
      status: statusMap[o.status] ?? "incoming",
      placedAt: new Date(o.placed_at).getTime(),
      readyAt: o.ready_at ? new Date(o.ready_at).getTime() : null,
      collectedAt: o.collected_at ? new Date(o.collected_at).getTime() : null,
      target: items.reduce((max: number, it: any) => Math.max(max, it.tgt), 0) * 60,
      student: o.customer_name ?? "Student",
    };
  });

  // Specials
  const { data: menuCategories } = await admin
    .from("menu_categories")
    .select("id")
    .eq("tenant_id", tenant.id)
    .eq("name", "Specials")
    .maybeSingle<{ id: string }>();

  let specialsList: any[] = [];
  if (menuCategories) {
    const { data: items } = await admin
      .from("menu_items")
      .select("id, name, description, price_paise, diet, prep_target_seconds")
      .eq("tenant_id", tenant.id)
      .eq("category_id", menuCategories.id)
      .eq("status", "live");

    specialsList = (items ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      desc: item.description ?? "",
      price: item.price_paise / 100,
      prep: Math.round(item.prep_target_seconds / 60),
      diet: item.diet,
    }));
  }

  // Live menu items for walk-in autocomplete
  const { data: liveMenuItems } = await admin
    .from("menu_items")
    .select("id, name, price_paise, diet")
    .eq("tenant_id", tenant.id)
    .eq("status", "live")
    .eq("in_stock", true)
    .order("name");

  const kpis = {
    incoming: mappedOrders.filter((o) => o.status === "incoming").length,
    preparing: mappedOrders.filter((o) => o.status === "preparing").length,
    ready: mappedOrders.filter((o) => o.status === "ready").length,
    collected: mappedOrders.filter((o) => o.status === "collected").length,
  };

  return NextResponse.json({
    canteen: { id: tenant.id, name: tenant.name, slug: tenant.slug },
    orders: mappedOrders,
    specials: specialsList,
    menuItems: liveMenuItems || [],
    kpis,
  });
}
