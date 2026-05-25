import { NextResponse, type NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tenantSlug = searchParams.get("tenant") ?? "";
  const dateStr = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

  if (!tenantSlug) {
    return NextResponse.json({ error: "tenant param required" }, { status: 400 });
  }

  const admin = getAdminClient();
  const { data: tenant } = await admin
    .from("tenants")
    .select("id, name, slug")
    .eq("slug", tenantSlug)
    .maybeSingle<{ id: string; name: string; slug: string }>();

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  // Parse date and build IST-aware range
  // dateStr is YYYY-MM-DD in local timezone
  const [year, month, day] = dateStr.split("-").map(Number);
  // Build start/end of the day in IST (+05:30) — offset 330 minutes from UTC
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const startLocal = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0) - IST_OFFSET_MS);
  const endLocal = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999) - IST_OFFSET_MS);

  const { data: orders, error } = await admin
    .from("orders")
    .select(
      "id, short_code, status, total_paise, placed_at, customer_name, order_type, collected_at, ready_at"
    )
    .eq("tenant_id", tenant.id)
    .gte("placed_at", startLocal.toISOString())
    .lte("placed_at", endLocal.toISOString())
    .order("placed_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const orderIds = (orders ?? []).map((o) => o.id);
  let orderItems: {
    id: string;
    order_id: string;
    name_snapshot: string;
    qty: number;
    diet_snapshot: string;
    price_paise_snapshot: number;
  }[] = [];

  if (orderIds.length > 0) {
    const { data: items } = await admin
      .from("order_items")
      .select("id, order_id, name_snapshot, qty, diet_snapshot, price_paise_snapshot")
      .in("order_id", orderIds);
    orderItems = items ?? [];
  }

  const itemsByOrder = new Map<string, { name: string; diet: string; q: number; price: number }[]>();
  for (const it of orderItems) {
    if (!itemsByOrder.has(it.order_id)) itemsByOrder.set(it.order_id, []);
    itemsByOrder.get(it.order_id)!.push({
      name: it.name_snapshot,
      diet: it.diet_snapshot,
      q: it.qty,
      price: it.price_paise_snapshot,
    });
  }

  const STATUS_MAP: Record<string, string> = {
    placed: "incoming",
    preparing: "preparing",
    ready: "ready",
    collected: "collected",
  };

  const mappedOrders = (orders ?? []).map((o) => ({
    id: o.short_code.startsWith("T-") ? o.short_code : `T-${o.short_code}`,
    dbId: o.id,
    items: itemsByOrder.get(o.id) ?? [],
    total: o.total_paise / 100,
    status: STATUS_MAP[o.status] ?? o.status,
    placedAt: new Date(o.placed_at).getTime(),
    collectedAt: o.collected_at ? new Date(o.collected_at).getTime() : null,
    readyAt: o.ready_at ? new Date(o.ready_at).getTime() : null,
    student: o.customer_name ?? "Customer",
  }));

  // Compute daily stats
  const collected = mappedOrders.filter((o) => o.status === "collected");
  const totalRevenue = collected.reduce((a, o) => a + o.total, 0);
  const avgTicket = collected.length ? Math.round(totalRevenue / collected.length) : 0;

  // Avg prep time
  let avgPrepSecs = 0;
  const prepTimes = collected
    .filter((o) => o.collectedAt && o.placedAt)
    .map((o) => (o.collectedAt! - o.placedAt) / 1000);
  if (prepTimes.length > 0) {
    avgPrepSecs = Math.round(prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length);
  }

  // Top items by units
  const counts: Record<string, { name: string; diet: string; count: number }> = {};
  for (const o of mappedOrders) {
    for (const it of o.items) {
      if (!counts[it.name]) counts[it.name] = { name: it.name, diet: it.diet, count: 0 };
      counts[it.name].count += it.q;
    }
  }
  const sortedItems = Object.values(counts).sort((a, b) => b.count - a.count);
  const maxCount = sortedItems.length > 0 ? sortedItems[0].count : 1;
  const topItems = sortedItems.slice(0, 8).map((it) => ({
    name: it.name,
    diet: it.diet,
    count: it.count,
    pct: Math.round((it.count / maxCount) * 100),
  }));

  return NextResponse.json({
    date: dateStr,
    orders: mappedOrders,
    stats: {
      total: mappedOrders.length,
      collected: collected.length,
      revenue: totalRevenue,
      avgTicket,
      avgPrepSecs,
    },
    topItems,
  });
}
