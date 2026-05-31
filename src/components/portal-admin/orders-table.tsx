"use client";

import { useState } from "react";
import { formatRupees, formatDateIST, formatTimeIST } from "@/lib/utils";
import { CancelOrderButton } from "./cancel-order-button";
import { RefundOrderButton } from "./refund-order-button";

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
  placed: "bg-[color:var(--admin-sky-soft)] text-[color:var(--admin-sky)] border-[color:var(--admin-sky)]/30",
  preparing: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ready: "bg-lime/15 text-lime border-lime/30",
  collected: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  rejected: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  expired: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  payment_failed: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  cancelled_by_kitchen: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  refunded: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

export function OrdersTable({ orders }: { orders: Row[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const needle = search.trim().toLowerCase();
  const filtered = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (!needle) return true;
    return (
      o.short_code.toLowerCase().includes(needle) ||
      (o.customer_name ?? "").toLowerCase().includes(needle)
    );
  });

  const statuses = ["all", "placed", "preparing", "ready", "collected", "pending_payment", "rejected", "expired"];

  return (
    <>
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <input
          type="search"
          placeholder="Search by code or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 px-3 rounded-md border border-graphite-200/15 bg-graphite-700 text-[13px] text-graphite-200 placeholder:text-graphite-500 outline-none focus:border-lime/40 transition-colors min-w-[200px]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 rounded-md border border-graphite-200/15 bg-graphite-700 text-[12px] text-graphite-300 font-mono outline-none focus:border-lime/40 transition-colors cursor-pointer"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        {(search || statusFilter !== "all") && (
          <span className="text-[11px] font-mono text-graphite-400">
            {filtered.length} of {orders.length}
          </span>
        )}
      </div>

      <div className="bg-graphite-700 border border-graphite-200/[0.08] rounded-xl overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-[10px] font-mono uppercase tracking-wider text-graphite-400 border-b border-graphite-200/[0.08]">
              <th className="text-left px-4 py-3 font-medium">Code</th>
              <th className="text-left px-4 py-3 font-medium">Placed</th>
              <th className="text-left px-4 py-3 font-medium">Customer</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-right px-4 py-3 font-medium">Total</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b border-graphite-200/[0.05] last:border-0 hover:bg-graphite-200/[0.03]">
                <td className="px-4 py-2.5 font-mono tabular text-graphite-200">{o.short_code}</td>
                <td className="px-4 py-2.5 text-graphite-300 font-mono tabular">
                  {formatDateIST(o.placed_at).split(",")[0]} · {formatTimeIST(o.placed_at)}
                </td>
                <td className="px-4 py-2.5 text-graphite-300">{o.customer_name ?? "—"}</td>
                <td className="px-4 py-2.5 text-graphite-300">
                  {o.order_type === "dine_in" ? `Dine-in · ${o.table_label ?? "—"}` : "Takeaway"}
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular text-graphite-200">
                  {formatRupees(o.total_paise)}
                </td>
                <td className="px-4 py-2.5">
                  <span className={"inline-block text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border " + (TONE[o.status] ?? "bg-graphite-600 text-graphite-300 border-graphite-500/30")}>
                    {o.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-2.5 flex items-center gap-1.5">
                  {["placed", "preparing", "pending_payment"].includes(o.status) && (
                    <CancelOrderButton orderId={o.id} shortCode={o.short_code} />
                  )}
                  {["collected", "cancelled_by_kitchen"].includes(o.status) && (
                    <RefundOrderButton orderId={o.id} shortCode={o.short_code} />
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-graphite-400 text-[13px]">
                  {search || statusFilter !== "all" ? "No orders match your search." : "No orders yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
