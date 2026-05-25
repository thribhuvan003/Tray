import { NextResponse, type NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Kitchen history + insights endpoint — called by kitchen.html
// Returns today's collected orders + KPIs from real DB data
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tenantSlug = searchParams.get("tenant") ?? "aditya";

  const admin = getAdminClient();
  const { data: tenant } = await admin
    .from("tenants")
    .select("id, name, slug")
    .eq("slug", tenantSlug)
    .maybeSingle<{ id: string; name: string; slug: string }>();

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  // Today's window (midnight IST → now)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  // Fetch ALL of today's non-pending orders for history + insights
  const { data: todayOrders } = await admin
    .from("orders")
    .select("id, short_code, status, total_paise, placed_at, ready_at, collected_at, customer_name, order_type")
    .eq("tenant_id", tenant.id)
    .in("status", ["placed", "preparing", "ready", "collected"])
    .gte("placed_at", todayIso)
    .order("placed_at", { ascending: false })
    .limit(500);

  const orders = todayOrders ?? [];

  // Fetch order items for today's orders
  const orderIds = orders.map((o) => o.id);
  let allItems: { order_id: string; name_snapshot: string; qty: number; price_paise_snapshot: number; diet_snapshot: string }[] = [];
  if (orderIds.length > 0) {
    const { data: items } = await admin
      .from("order_items")
      .select("order_id, name_snapshot, qty, price_paise_snapshot, diet_snapshot")
      .in("order_id", orderIds);
    allItems = items ?? [];
  }

  // Group items by order_id
  const itemsByOrder = new Map<string, typeof allItems>();
  for (const it of allItems) {
    if (!itemsByOrder.has(it.order_id)) itemsByOrder.set(it.order_id, []);
    itemsByOrder.get(it.order_id)!.push(it);
  }

  // Build history rows (collected orders)
  const collected = orders.filter((o) => o.status === "collected");
  const historyRows = collected.map((o) => ({
    id: o.short_code.startsWith("T-") ? o.short_code : `T-${o.short_code}`,
    placedAt: new Date(o.placed_at).getTime(),
    collectedAt: o.collected_at ? new Date(o.collected_at).getTime() : null,
    student: o.customer_name ?? "Student",
    total: o.total_paise / 100,
    items: (itemsByOrder.get(o.id) ?? []).map((it) => ({
      name: it.name_snapshot,
      qty: it.qty,
      diet: it.diet_snapshot,
    })),
  }));

  // Build top items from today
  const itemCounts = new Map<string, { name: string; diet: string; count: number; revenue: number }>();
  for (const it of allItems) {
    const order = orders.find((o) => o.id === it.order_id);
    if (!order || order.status === "placed" || order.status === "preparing") continue;
    const cur = itemCounts.get(it.name_snapshot) ?? { name: it.name_snapshot, diet: it.diet_snapshot, count: 0, revenue: 0 };
    cur.count += it.qty;
    cur.revenue += it.qty * it.price_paise_snapshot;
    itemCounts.set(it.name_snapshot, cur);
  }
  const topItems = [...itemCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((it) => ({ ...it, revenue: it.revenue / 100 }));

  // Calculate real KPIs
  const totalRevenue = collected.reduce((acc, o) => acc + o.total_paise, 0) / 100;
  const totalCollected = collected.length;
  const avgTicket = totalCollected > 0 ? Math.round(totalRevenue / totalCollected) : 0;

  // Avg prep time: placed_at → ready_at (seconds)
  const prepTimes = orders
    .filter((o) => o.ready_at && o.placed_at)
    .map((o) => (new Date(o.ready_at!).getTime() - new Date(o.placed_at).getTime()) / 1000);
  const avgPrepSecs = prepTimes.length > 0
    ? Math.round(prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length)
    : 0;
  const avgPrepMin = Math.floor(avgPrepSecs / 60);
  const avgPrepSecRem = avgPrepSecs % 60;
  const avgPrepDisplay = avgPrepSecs > 0
    ? `${avgPrepMin}:${String(avgPrepSecRem).padStart(2, "0")}`
    : "—";

  // Peak hour analysis from today's orders
  const hourCounts: Record<number, number> = {};
  for (const o of orders) {
    const h = new Date(o.placed_at).getHours();
    hourCounts[h] = (hourCounts[h] ?? 0) + 1;
  }
  const peakHour = Object.entries(hourCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0];
  const peakDisplay = peakHour
    ? `${peakHour[0]}:00–${Number(peakHour[0]) + 1}:00`
    : "—";

  // Queue counts by status
  const kpis = {
    incoming: orders.filter((o) => o.status === "placed").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
    collected: totalCollected,
    totalRevenue,
    avgTicket,
    avgPrepDisplay,
    peakDisplay,
  };

  return NextResponse.json({
    historyRows,
    topItems,
    kpis,
    generatedAt: Date.now(),
  });
}
