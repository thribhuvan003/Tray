import { headers } from "next/headers";
import { resolveTenant } from "@/lib/tenant";
import { getServerClient } from "@/lib/supabase/server";
import dayjs from "dayjs";
import { formatRupees } from "@/lib/utils";

export const dynamic = "force-dynamic";

type O = { id: string; total_paise: number; placed_at: string; collected_at: string | null; status: string; order_type: "takeaway" | "dine_in" };

export default async function AnalyticsPage() {
  const h = await headers();
  const slug = h.get("x-tenant-slug") ?? "aditya";
  const tenant = await resolveTenant(slug);
  if (!tenant) return null;
  const supabase = await getServerClient(tenant.id);
  const start = dayjs().subtract(30, "day").startOf("day").toISOString();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, total_paise, placed_at, collected_at, status, order_type")
    .eq("tenant_id", tenant.id)
    .gte("placed_at", start)
    .returns<O[]>();

  const paid = (orders ?? []).filter((o) => !["pending_payment", "rejected", "expired"].includes(o.status));
  const total = paid.reduce((acc, o) => acc + o.total_paise, 0);
  const count = paid.length;
  const avg = count ? Math.round(total / count) : 0;
  const dineInRatio = count ? Math.round((paid.filter((o) => o.order_type === "dine_in").length / count) * 100) : 0;
  const pickups = paid
    .filter((o) => o.collected_at)
    .map((o) => (new Date(o.collected_at!).getTime() - new Date(o.placed_at).getTime()) / 1000);
  const avgPickup = pickups.length ? Math.round(pickups.reduce((a, b) => a + b, 0) / pickups.length) : 0;

  const cells = [
    { label: "30-day revenue", value: formatRupees(total) },
    { label: "30-day orders", value: String(count) },
    { label: "Avg ticket", value: formatRupees(avg) },
    { label: "Avg pickup time", value: `${Math.floor(avgPickup / 60)}m ${avgPickup % 60}s` },
    { label: "Dine-in share", value: `${dineInRatio}%` },
    { label: "Repeat-customer rate", value: "—" },
  ];

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-[26px] sm:text-[30px] font-semibold tracking-tight">Insights</h1>
        <div className="text-[11px] font-mono uppercase tracking-[0.12em] text-graphite-400 mt-0.5">
          Last 30 days
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {cells.map((c) => (
          <div key={c.label} className="bg-graphite-700 border border-graphite-200/[0.08] rounded-xl p-5">
            <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-graphite-400">{c.label}</div>
            <div className="font-display text-[28px] sm:text-[32px] font-medium tabular leading-none text-graphite-200 mt-2">
              {c.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
