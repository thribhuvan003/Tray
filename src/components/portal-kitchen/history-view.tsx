"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";
import { formatRupees } from "@/lib/utils";
import { toast } from "sonner";

import { OrderRow, LineRow } from "@/types/portal";

export function HistoryView({
  tenantId,
}: {
  tenantId: string;
}) {
  const [rows, setRows] = useState<(OrderRow & { items: LineRow[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = getBrowserClient();
    const fetchHistory = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch today's collected orders
      const { data: orders, error: ordersErr } = await sb
        .from("orders")
        .select("id, short_code, status, total_paise, placed_at, customer_name")
        .eq("tenant_id", tenantId)
        .eq("status", "collected")
        .gte("placed_at", today.toISOString())
        .order("placed_at", { ascending: false })
        .returns<OrderRow[]>();

      if (ordersErr || !orders) {
        setLoading(false);
        return;
      }

      const typedOrders = orders;
      const orderIds = typedOrders.map((o) => o.id);
      if (orderIds.length === 0) {
        setRows([]);
        setLoading(false);
        return;
      }

      // Fetch line items for these orders
      const { data: lines, error: linesErr } = await sb
        .from("order_items")
        .select("id, order_id, name_snapshot, qty")
        .in("order_id", orderIds)
        .returns<LineRow[]>();

      const linesMap = new Map<string, LineRow[]>();
      if (!linesErr && lines) {
        const typedLines = lines as LineRow[];
        for (const l of typedLines) {
          if (!linesMap.has(l.order_id)) {
            linesMap.set(l.order_id, []);
          }
          linesMap.get(l.order_id)!.push(l);
        }
      }

      const merged = typedOrders.map((o) => ({
        ...o,
        items: linesMap.get(o.id) || [],
      }));

      setRows(merged);
      setLoading(false);
    };

    void fetchHistory();
    const interval = setInterval(fetchHistory, 15_000);
    return () => clearInterval(interval);
  }, [tenantId]);

  const totalPaise = rows.reduce((acc, r) => acc + r.total_paise, 0);

  const exportCsv = () => {
    try {
      const headers = ["Ticket", "Time", "Student", "Item", "Qty", "Total (Rs)", "Status"];
      const csvRows = [headers.join(",")];

      for (const r of rows) {
        const time = new Date(r.placed_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
        const student = r.customer_name || "Guest";
        const item = r.items[0]?.name_snapshot || "—";
        const qty = r.items[0]?.qty || 1;
        const total = (r.total_paise / 100).toFixed(2);
        const status = "collected";

        csvRows.push([r.short_code, time, `"${student}"`, `"${item}"`, qty, total, status].join(","));
      }

      const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("href", url);
      a.setAttribute("download", `history-${new Date().toISOString().split("T")[0]}.csv`);
      a.click();
      toast.success("CSV export downloaded successfully!");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  return (
    <div className="view-pane flex flex-col gap-4 animate-[liveIn_.3s_ease_both]">
      <div className="page-head flex justify-between items-end pb-[18px] border-b border-[var(--kt-line)] mb-6">
        <div className="l flex flex-col gap-1.5">
          <span className="eyebrow text-xs tracking-widest uppercase font-mono text-[var(--kt-ink-3)]">
            Last 24 hours · {rows.length} completed
          </span>
          <h1 className="font-display font-medium text-5xl tracking-tight leading-none text-[var(--kt-ink)]">
            Order <span className="italic text-[var(--kt-tomato)]">history.</span>
          </h1>
          <div className="sub flex items-center gap-3.5 font-mono text-xs uppercase tracking-wider text-[var(--kt-ink-3)]">
            <span className="clk text-[var(--kt-ink)] font-semibold">{formatRupees(totalPaise)} total</span>
            <span className="live inline-flex items-center gap-1.5 text-[var(--kt-olive)] capitalize font-sans font-semibold">
              <span className="d w-1.5 h-1.5 rounded-full bg-[var(--kt-olive)] animate-[blinkLive_1.6s_infinite]" />
              Auto-refreshes as orders complete
            </span>
          </div>
        </div>
        <div className="r flex gap-2 items-center">
          <button
            className="btn btn-ghost btn-sm text-xs font-semibold px-3 py-1.5 rounded-[7px] border border-[var(--kt-line-2)] background-[var(--kt-cream-4)] transition-all hover:background-[var(--kt-paper)]"
            onClick={exportCsv}
          >
            ⇣ Export CSV
          </button>
          <button
            className="btn btn-pri btn-sm text-xs font-semibold px-3 py-1.5 rounded-[7px] bg-[var(--kt-ink)] text-[var(--kt-cream)] transition-all hover:translate-y-[-1px]"
            onClick={() => window.print()}
          >
            🖶 Print
          </button>
        </div>
      </div>

      <div className="queue-board rounded-[14px] border border-[var(--kt-ink)] overflow-hidden bg-[var(--kt-paper)]">
        <table className="hist-table w-full border-collapse">
          <thead>
            <tr className="bg-[var(--kt-cream-3)] border-b border-[var(--kt-line)]">
              <th className="text-left font-mono text-[13px] uppercase tracking-wider font-semibold text-[var(--kt-ink-3)] p-3 pl-4">
                Ticket
              </th>
              <th className="text-left font-mono text-[13px] uppercase tracking-wider font-semibold text-[var(--kt-ink-3)] p-3">
                Time
              </th>
              <th className="text-left font-mono text-[13px] uppercase tracking-wider font-semibold text-[var(--kt-ink-3)] p-3">
                Student
              </th>
              <th className="text-left font-mono text-[13px] uppercase tracking-wider font-semibold text-[var(--kt-ink-3)] p-3">
                Item
              </th>
              <th className="text-left font-mono text-[13px] uppercase tracking-wider font-semibold text-[var(--kt-ink-3)] p-3">
                Qty
              </th>
              <th className="text-right font-mono text-[13px] uppercase tracking-wider font-semibold text-[var(--kt-ink-3)] p-3 pr-4">
                Total
              </th>
              <th className="text-right font-mono text-[13px] uppercase tracking-wider font-semibold text-[var(--kt-ink-3)] p-3 pr-4">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center p-8 text-[var(--kt-ink-3)] font-mono text-sm">
                  Loading order history...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-8 text-[var(--kt-ink-3)] font-mono text-sm">
                  No orders completed today yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const item = r.items[0];
                const itemName = item?.name_snapshot || "—";
                const extraCount = r.items.length > 1 ? r.items.length - 1 : 0;
                const timeStr = new Date(r.placed_at).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                });

                return (
                  <tr key={r.id} className="border-b border-[var(--kt-line)] hover:bg-[var(--kt-cream-3)] transition-colors">
                    <td className="p-3 pl-4">
                      <span className="hist-id font-mono text-[14px] font-semibold bg-[var(--kt-ink)] text-[var(--kt-cream)] px-2 py-0.5 rounded-[5px] tracking-wide">
                        {r.short_code}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-sm text-[var(--kt-ink-2)]">{timeStr}</td>
                    <td className="p-3 text-[var(--kt-ink)] text-base font-medium">{r.customer_name || "Guest"}</td>
                    <td className="p-3 text-[var(--kt-ink)] text-base">
                      {itemName}
                      {extraCount > 0 && (
                        <span className="text-[var(--kt-ink-3)] font-mono text-xs ml-1.5">+{extraCount}</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-sm text-[var(--kt-ink-2)]">{item?.qty || 1}×</td>
                    <td className="p-3 text-right font-mono text-sm text-[var(--kt-ink-2)] font-semibold pr-4">
                      {formatRupees(r.total_paise)}
                    </td>
                    <td className="p-3 text-right pr-4">
                      <span className="stat-pill inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 bg-[rgba(94,122,56,0.1)] text-[var(--kt-olive)] rounded-[4px] uppercase tracking-wider">
                        ✓ Done
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
