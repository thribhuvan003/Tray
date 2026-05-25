"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/browser";
import { motion } from "framer-motion";
import { Download, RefreshCw } from "lucide-react";
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
  placed: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  preparing: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ready: "bg-[var(--admin-lime)]/15 text-[var(--admin-lime)] border-[var(--admin-lime)]/30",
  collected: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  rejected: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  expired: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  cancelled_by_kitchen: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  cancelled_by_student: "bg-orange-500/15 text-orange-400 border-orange-500/30",
};

export function OrdersView({
  orders: initialOrders,
  todayRevenue,
  todayCount,
  todayExportUrl,
  allExportUrl,
  tenantId,
  tenantSlug,
  statusFilter,
  statuses,
}: {
  orders: Row[];
  todayRevenue: number;
  todayCount: number;
  todayExportUrl: string;
  allExportUrl: string;
  tenantId: string;
  tenantSlug: string;
  statusFilter: string;
  statuses: string[];
}) {
  const router = useRouter();
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Live subscription — refresh when any order_event fires
  useEffect(() => {
    const sb = getBrowserClient();
    let debounce: ReturnType<typeof setTimeout> | null = null;
    const ch = sb
      .channel("orders-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "order_events", filter: `tenant_id=eq.${tenantId}` },
        () => {
          if (debounce) clearTimeout(debounce);
          debounce = setTimeout(() => {
            router.refresh();
            setLastRefresh(new Date());
          }, 300);
        }
      )
      .subscribe();
    return () => { sb.removeChannel(ch); };
  }, [tenantId, router]);

  const orders = initialOrders;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-8 border-b border-[var(--admin-line)] pb-5">
        <div>
          <h1 className="font-display text-[30px] sm:text-[36px] font-medium tracking-tight text-[var(--admin-ink)]">
            Customer <span className="it text-[var(--admin-lime)]">Orders</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--admin-ink-3)]">
              Last 500 · updates live
            </div>
            {lastRefresh && (
              <span className="inline-flex items-center gap-1 text-[9px] font-mono text-[var(--admin-lime)] bg-[var(--admin-lime)]/10 border border-[var(--admin-lime)]/20 px-1.5 py-0.5 rounded">
                <RefreshCw size={8} /> Updated {lastRefresh.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={todayExportUrl}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md border border-[var(--admin-line-2)] bg-[var(--admin-bg-2)] text-[11px] font-mono uppercase tracking-wider text-[var(--admin-ink-2)] hover:border-[var(--admin-lime)] hover:text-[var(--admin-lime)] transition-colors"
          >
            <Download size={11} /> Export today
          </a>
          <a
            href={allExportUrl}
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
          <div className="font-display text-[22px] font-semibold text-[var(--admin-ink)] leading-tight mt-1">{todayCount}</div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--admin-ink-3)]">Today&apos;s revenue</div>
          <div className="font-display text-[22px] font-semibold text-[var(--admin-lime)] leading-tight mt-1">
            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(todayRevenue / 100)}
          </div>
        </div>
        {/* Live indicator */}
        <div className="ml-auto flex items-center gap-2 self-center">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--admin-lime)] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--admin-lime)]" />
          </span>
          <span className="text-[10px] font-mono text-[var(--admin-lime)]">Live updates</span>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {statuses.map((s) => (
          <a
            key={s}
            href={`?status=${s}`}
            className={[
              "h-7 px-3 rounded-full text-[10px] font-mono uppercase tracking-wider border transition-colors",
              statusFilter === s
                ? "border-[var(--admin-lime)] text-[var(--admin-lime)] bg-[var(--admin-lime)]/10"
                : "border-[var(--admin-line-2)] text-[var(--admin-ink-3)] hover:border-[var(--admin-lime)]/50 hover:text-[var(--admin-ink-2)]",
            ].join(" ")}
          >
            {s === "all" ? "All" : s.replace(/_/g, " ")}
          </a>
        ))}
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
              {orders.map((o) => (
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
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[var(--admin-ink-3)] text-[13.5px]">
                    No orders{statusFilter !== "all" ? ` with status "${statusFilter}"` : ""} yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
