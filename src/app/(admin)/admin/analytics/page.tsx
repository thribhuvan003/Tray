import { headers } from "next/headers";
import { resolveTenant, getTenantSlugFromHeaders } from "@/lib/tenant";
import { getServerClient } from "@/lib/supabase/server";
import dayjs from "dayjs";
import { formatRupees } from "@/lib/utils";
import { AnalyticsView } from "@/components/portal-admin/analytics-view";

export const dynamic = "force-dynamic";

type O = {
  id: string;
  user_id: string | null;
  total_paise: number;
  placed_at: string;
  collected_at: string | null;
  status: string;
  order_type: "takeaway" | "dine_in";
};

export default async function AnalyticsPage() {
  const h = await headers();
  const slug = getTenantSlugFromHeaders(h);
  const tenant = await resolveTenant(slug);
  if (!tenant) return null;
  const supabase = await getServerClient(tenant.id);

  const start30d = dayjs().subtract(30, "day").startOf("day").toISOString();
  const start7d = dayjs().subtract(7, "day").startOf("day").toISOString();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, user_id, total_paise, placed_at, collected_at, status, order_type")
    .eq("tenant_id", tenant.id)
    .gte("placed_at", start30d)
    .order("placed_at", { ascending: true })
    .returns<O[]>();

  const all = orders ?? [];
  const paid = all.filter((o) => !["pending_payment", "rejected", "expired", "cancelled_by_kitchen"].includes(o.status));

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const total30d = paid.reduce((acc, o) => acc + o.total_paise, 0);
  const count30d = paid.length;
  const avg = count30d ? Math.round(total30d / count30d) : 0;
  const dineInCount = paid.filter((o) => o.order_type === "dine_in").length;
  const dineInRatio = count30d ? Math.round((dineInCount / count30d) * 100) : 0;

  const pickupSecs = paid
    .filter((o) => o.collected_at)
    .map((o) => (new Date(o.collected_at!).getTime() - new Date(o.placed_at).getTime()) / 1000);
  const avgPickup = pickupSecs.length ? Math.round(pickupSecs.reduce((a, b) => a + b, 0) / pickupSecs.length) : 0;

  // Repeat-customer rate: users with ≥2 paid orders in last 30d
  const userOrderCounts = new Map<string, number>();
  for (const o of paid) {
    if (!o.user_id) continue;
    userOrderCounts.set(o.user_id, (userOrderCounts.get(o.user_id) ?? 0) + 1);
  }
  const totalUniqueUsers = userOrderCounts.size;
  const returningUsers = [...userOrderCounts.values()].filter((c) => c >= 2).length;
  const repeatRate = totalUniqueUsers > 0 ? Math.round((returningUsers / totalUniqueUsers) * 100) : 0;

  // ── Daily buckets for chart (last 30 days) ────────────────────────────────
  const dailyBuckets: { label: string; key: string; revenue: number; orders: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = dayjs().subtract(i, "day");
    dailyBuckets.push({ label: d.format("D MMM"), key: d.format("YYYY-MM-DD"), revenue: 0, orders: 0 });
  }
  for (const o of paid) {
    const k = dayjs(o.placed_at).format("YYYY-MM-DD");
    const b = dailyBuckets.find((x) => x.key === k);
    if (b) { b.revenue += o.total_paise; b.orders += 1; }
  }

  // ── Last 7-day vs prior 7-day delta ──────────────────────────────────────
  const paid7d = paid.filter((o) => o.placed_at >= start7d);
  const revenue7d = paid7d.reduce((a, o) => a + o.total_paise, 0);
  const prior7dStart = dayjs().subtract(14, "day").startOf("day").toISOString();
  const paidPrior7d = paid.filter((o) => o.placed_at >= prior7dStart && o.placed_at < start7d);
  const revenuePrior = paidPrior7d.reduce((a, o) => a + o.total_paise, 0);
  const revDelta = revenuePrior > 0 ? ((revenue7d - revenuePrior) / revenuePrior) * 100 : null;

  const cells = [
    { label: "30-day revenue", value: formatRupees(total30d), sub: `${count30d} paid orders` },
    { label: "Avg ticket", value: formatRupees(avg), sub: "per order" },
    { label: "Avg pickup time", value: avgPickup ? `${Math.floor(avgPickup / 60)}m ${avgPickup % 60}s` : "—", sub: "placed → collected" },
    { label: "Dine-in share", value: `${dineInRatio}%`, sub: `${dineInCount} of ${count30d} orders` },
    { label: "Repeat-customer rate", value: totalUniqueUsers > 0 ? `${repeatRate}%` : "—", sub: `${returningUsers} of ${totalUniqueUsers} users ordered 2+×` },
    {
      label: "7-day revenue",
      value: formatRupees(revenue7d),
      sub: revDelta !== null ? `${revDelta >= 0 ? "+" : ""}${revDelta.toFixed(1)}% vs prior week` : "vs prior week",
      highlight: revDelta !== null && revDelta >= 0,
    },
  ];

  // ── UPI payment reconciliation (last 30 days) ─────────────────────────────
  // Fetch UPI logs so admin can see exactly which payments arrived and to which VPA
  let upiLogs: { id: string; amount_paise: number; upi_vpa: string; student_name: string | null; short_code: string | null; created_at: string }[] = [];
  try {
    const { data: logs } = await supabase
      .from("upi_payment_logs" as any)
      .select("id, amount_paise, upi_vpa, student_name, short_code, created_at")
      .eq("tenant_id", tenant.id)
      .gte("created_at", start30d)
      .order("created_at", { ascending: false })
      .limit(200);
    if (logs) upiLogs = logs as any;
  } catch {
    // Table may not exist yet (migration pending) — degrade gracefully
    upiLogs = [];
  }

  return (
    <AnalyticsView
      cells={cells}
      dailyBuckets={dailyBuckets}
      tenantId={tenant.id}
      upiLogs={upiLogs}
    />
  );
}
