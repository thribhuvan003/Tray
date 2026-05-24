import Link from "next/link";
import { headers } from "next/headers";
import { Download } from "lucide-react";
import { resolveTenant, getTenantSlugFromHeaders } from "@/lib/tenant";
import { getServerClient } from "@/lib/supabase/server";
import { formatRupees, formatDateIST, formatTimeIST } from "@/lib/utils";

type Row = {
  id: string;
  short_code: string;
  status: string;
  total_paise: number;
  placed_at: string;
  customer_name: string | null;
  order_type: "takeaway" | "dine_in";
  table_label: string | null;
};

const TONE: Record<string, string> = {
  pending_payment: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  placed: "bg-ocean-500/15 text-ocean-500 border-ocean-500/30",
  preparing: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ready: "bg-[var(--admin-lime)]/15 text-[var(--admin-lime)] border-[var(--admin-lime)]/30",
  collected: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  rejected: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  expired: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const h = await headers();
  const slug = getTenantSlugFromHeaders(h);
  const tenant = await resolveTenant(slug);
  if (!tenant) return null;
  const supabase = await getServerClient(tenant.id);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayIso = startOfDay.toISOString();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, short_code, status, total_paise, placed_at, customer_name, order_type, table_label")
    .eq("tenant_id", tenant.id)
    .order("placed_at", { ascending: false })
    .limit(100)
    .returns<Row[]>();

  const allOrders = orders ?? [];
  const todayOrders = allOrders.filter((o) => o.placed_at >= todayIso);
  const todayRevenue = todayOrders
    .filter((o) => !["pending_payment", "rejected", "expired"].includes(o.status))
    .reduce((acc, o) => acc + o.total_paise, 0);

  // Build today's export URL
  const todayExportUrl = `/api/admin/export/orders?from=${encodeURIComponent(todayIso)}&tenant=${tenant.slug}`;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-8 border-b border-[var(--admin-line)] pb-5">
        <div>
          <h1 className="font-display text-[30px] sm:text-[36px] font-medium tracking-tight text-[var(--admin-ink)]">
            Customer <span className="it text-[var(--admin-lime)]">Orders</span>
          </h1>
          <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--admin-ink-3)] mt-1">
            Last 100 · all statuses
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={todayExportUrl}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md border border-[var(--admin-line-2)] bg-[var(--admin-bg-2)] text-[11px] font-mono uppercase tracking-wider text-[var(--admin-ink-2)] hover:border-[var(--admin-lime)] hover:text-[var(--admin-lime)] transition-colors"
          >
            <Download size={11} /> Export today&apos;s CSV
          </a>
          <a
            href={`/api/admin/export/orders?tenant=${tenant.slug}`}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md border border-[var(--admin-line-2)] bg-[var(--admin-bg-2)] text-[11px] font-mono uppercase tracking-wider text-[var(--admin-ink-2)] hover:border-[var(--admin-lime)] hover:text-[var(--admin-lime)] transition-colors"
          >
            <Download size={11} /> Export all
          </a>
        </div>
      </div>

      {/* Today's summary strip */}
      <div className="mb-6 flex flex-wrap gap-6 rounded-xl border border-[var(--admin-line-2)] bg-[var(--admin-bg-2)] px-5 py-3 shadow-sm">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--admin-ink-3)]">Today&apos;s orders</div>
          <div className="font-display text-[22px] font-semibold text-[var(--admin-ink)] leading-tight mt-1">{todayOrders.length}</div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--admin-ink-3)]">Today&apos;s revenue</div>
          <div className="font-display text-[22px] font-semibold text-[var(--admin-lime)] leading-tight mt-1">
            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(todayRevenue / 100)}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--admin-line-2)] bg-[var(--admin-bg-2)] shadow-sm">
      <div className="min-w-[640px] overflow-hidden">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--admin-lime)] border-b border-[var(--admin-line)]">
              <th className="text-left px-5 py-4 font-medium">Code</th>
              <th className="text-left px-5 py-4 font-medium">Placed</th>
              <th className="text-left px-5 py-4 font-medium">Customer</th>
              <th className="text-left px-5 py-4 font-medium">Type</th>
              <th className="text-right px-5 py-4 font-medium">Total</th>
              <th className="text-left px-5 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="border-b border-[var(--admin-line)] last:border-0 hover:bg-[var(--admin-bg-3)]/60 transition-colors">
                <td className="px-5 py-3.5 font-mono tabular text-[var(--admin-ink)]">{o.short_code}</td>
                <td className="px-5 py-3.5 text-[var(--admin-ink-2)] font-mono tabular">
                  {formatDateIST(o.placed_at).split(",")[0]} · {formatTimeIST(o.placed_at)}
                </td>
                <td className="px-5 py-3.5 text-[var(--admin-ink-2)]">{o.customer_name ?? "—"}</td>
                <td className="px-5 py-3.5 text-[var(--admin-ink-2)]">
                  {o.order_type === "dine_in" ? `Dine-in · ${o.table_label ?? "—"}` : "Takeaway"}
                </td>
                <td className="px-5 py-3.5 text-right font-mono tabular text-[var(--admin-ink)]">
                  {formatRupees(o.total_paise)}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={
                      "inline-block text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border " +
                      (TONE[o.status] ?? "bg-[var(--admin-bg-3)] text-[var(--admin-ink-3)] border-[var(--admin-line-2)]")
                    }
                  >
                    {o.status.replace("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-[var(--admin-ink-3)] text-[13.5px]">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}
