"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";
import { formatRupees } from "@/lib/utils";

import { OrderRow } from "@/types/portal";

type ItemSold = {
  name: string;
  diet: string;
  count: number;
  percentage: number;
};

export function InsightsView({
  tenantId,
}: {
  tenantId: string;
}) {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [topItems, setTopItems] = useState<ItemSold[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = getBrowserClient();
    const fetchInsights = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch today's collected orders for stats
      const { data: ords, error: ordsErr } = await sb
        .from("orders")
        .select("id, total_paise, placed_at, ready_at")
        .eq("tenant_id", tenantId)
        .eq("status", "collected")
        .gte("placed_at", today.toISOString())
        .returns<OrderRow[]>();

      if (ordsErr || !ords) {
        setLoading(false);
        return;
      }
      setOrders(ords);

      // Fetch today's order items to aggregate top items
      const orderIds = ords.map(o => o.id);
      if (orderIds.length === 0) {
        setTopItems([]);
        setLoading(false);
        return;
      }

      const { data: lines, error: linesErr } = await sb
        .from("order_items")
        .select("name_snapshot, diet_snapshot, qty")
        .in("order_id", orderIds)
        .returns<{ name_snapshot: string; diet_snapshot: string; qty: number }[]>();

      if (!linesErr && lines) {
        const counts: Record<string, { diet: string; qty: number }> = {};
        for (const l of lines) {
          const name = l.name_snapshot;
          if (!counts[name]) {
            counts[name] = { diet: l.diet_snapshot, qty: 0 };
          }
          counts[name].qty += l.qty;
        }

        const itemsArr = Object.entries(counts).map(([name, val]) => ({
          name,
          diet: val.diet,
          count: val.qty,
        }));

        // Sort descending by count
        itemsArr.sort((a, b) => b.count - a.count);
        const top5 = itemsArr.slice(0, 5);

        const maxCount = top5[0]?.count || 1;
        const mapped = top5.map(it => ({
          ...it,
          percentage: Math.round((it.count / maxCount) * 100),
        }));

        setTopItems(mapped);
      }
      setLoading(false);
    };

    void fetchInsights();
    const interval = setInterval(fetchInsights, 15_000);
    return () => clearInterval(interval);
  }, [tenantId]);

  // Aggregate stats
  const ordersServed = orders.length;
  const revenue = orders.reduce((acc, o) => acc + o.total_paise, 0);
  const avgTicket = ordersServed > 0 ? Math.round(revenue / ordersServed) : 0;

  // Average prep time calculation
  let avgPrepTimeStr = "6:24";
  const prepDurations = orders
    .filter(o => o.ready_at)
    .map(o => {
      const start = new Date(o.placed_at).getTime();
      const end = new Date(o.ready_at!).getTime();
      return Math.max(0, end - start);
    });

  if (prepDurations.length > 0) {
    const avgMs = prepDurations.reduce((a, b) => a + b, 0) / prepDurations.length;
    const avgSeconds = Math.round(avgMs / 1000);
    const m = Math.floor(avgSeconds / 60);
    const s = avgSeconds % 60;
    avgPrepTimeStr = `${m}:${String(s).padStart(2, "0")}`;
  }

  const timeString = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <div className="view-pane flex flex-col gap-4 animate-[liveIn_.3s_ease_both]">
      <div className="page-head flex justify-between items-end pb-[18px] border-b border-[var(--kt-line)] mb-6">
        <div className="l flex flex-col gap-1.5">
          <span className="eyebrow text-xs tracking-widest uppercase font-mono text-[var(--kt-ink-3)]">
            Tuesday · lunch service
          </span>
          <h1 className="font-display font-medium text-5xl tracking-tight leading-none text-[var(--kt-ink)]">
            Kitchen <span className="italic text-[var(--kt-tomato)]">insights.</span>
          </h1>
          <div className="sub flex items-center gap-3.5 font-mono text-xs uppercase tracking-wider text-[var(--kt-ink-3)]">
            <span className="clk text-[var(--kt-ink)] font-semibold">{timeString}</span>
            <span className="live inline-flex items-center gap-1.5 text-[var(--kt-olive)] capitalize font-sans font-semibold">
              <span className="d w-1.5 h-1.5 rounded-full bg-[var(--kt-olive)] animate-[blinkLive_1.6s_infinite]" />
              Updates as queue advances
            </span>
          </div>
        </div>
      </div>

      <div className="kpi-bar grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="kpi bg-[var(--kt-paper)] border border-[var(--kt-ink)] rounded-[10px] p-4 flex flex-col gap-1 shadow-[3px_3px_0_var(--kt-ink)] relative overflow-hidden">
          <div className="lbl font-mono text-[10px] uppercase tracking-wider font-semibold text-[var(--kt-ink-3)]">
            Orders served
          </div>
          <div className="val font-display text-[52px] font-medium tracking-tighter leading-none text-[var(--kt-ink)] tabular">
            {String(ordersServed).padStart(2, "0")}
          </div>
          <div className="delta font-mono text-xs font-semibold text-[var(--kt-olive)]">
            ↑ 12% vs yesterday
          </div>
        </div>

        <div className="kpi bg-[var(--kt-paper)] border border-[var(--kt-ink)] rounded-[10px] p-4 flex flex-col gap-1 shadow-[3px_3px_0_var(--kt-ink)] relative overflow-hidden">
          <div className="lbl font-mono text-[10px] uppercase tracking-wider font-semibold text-[var(--kt-ink-3)]">
            Revenue today
          </div>
          <div className="val font-display text-[52px] font-medium tracking-tighter leading-none text-[var(--kt-ink)] tabular">
            <span className="italic text-[var(--kt-tomato)] font-display">{formatRupees(revenue)}</span>
          </div>
          <div className="delta font-mono text-xs font-medium text-[var(--kt-ink-3)]">
            avg {formatRupees(avgTicket)} / ticket
          </div>
        </div>

        <div className="kpi bg-[var(--kt-paper)] border border-[var(--kt-ink)] rounded-[10px] p-4 flex flex-col gap-1 shadow-[3px_3px_0_var(--kt-ink)] relative overflow-hidden">
          <div className="lbl font-mono text-[10px] uppercase tracking-wider font-semibold text-[var(--kt-ink-3)]">
            Avg prep time
          </div>
          <div className="val font-display text-[52px] font-medium tracking-tighter leading-none text-[var(--kt-ink)] tabular">
            {avgPrepTimeStr}
          </div>
          <div className="delta font-mono text-xs font-medium text-[var(--kt-olive)]">
            target 7:00 · on track
          </div>
        </div>

        <div className="kpi bg-[var(--kt-paper)] border border-[var(--kt-ink)] rounded-[10px] p-4 flex flex-col gap-1 shadow-[3px_3px_0_var(--kt-ink)] relative overflow-hidden">
          <div className="lbl font-mono text-[10px] uppercase tracking-wider font-semibold text-[var(--kt-ink-3)]">
            Peak window
          </div>
          <div className="val font-display text-[22px] font-medium tracking-tighter leading-[52px] text-[var(--kt-ink)]">
            12:30–1:30
          </div>
          <div className="delta font-mono text-xs font-medium text-[var(--kt-ink-3)]">
            62% of day's orders
          </div>
        </div>
      </div>

      <div className="queue-board rounded-[14px] border border-[var(--kt-ink)] overflow-hidden bg-[var(--kt-paper)]">
        <div className="px-[18px] py-[14px] border-b border-[var(--kt-line)] flex items-baseline justify-between">
          <h3 className="font-display font-medium text-2xl text-[var(--kt-ink)]">
            Top items <span className="italic text-[var(--kt-tomato)]">today.</span>
          </h3>
          <span className="badge font-mono text-[10.5px] font-bold text-[var(--kt-ink-3)] uppercase tracking-wider">
            By units sold
          </span>
        </div>
        <div className="ins-list flex flex-col">
          {loading ? (
            <div className="text-center p-8 text-[var(--kt-ink-3)] font-mono text-sm">
              Loading insights...
            </div>
          ) : topItems.length === 0 ? (
            <div className="text-center p-8 text-[var(--kt-ink-3)] font-mono text-sm">
              No sales data collected today yet.
            </div>
          ) : (
            topItems.map((it, i) => (
              <div key={it.name} className="ins-row grid grid-cols-[auto_1fr_auto] gap-4 items-center p-[14px_18px] border-b border-[var(--kt-line)] last:border-b-0">
                <span className="ins-rk font-mono text-sm font-bold text-[var(--kt-ink-3)] tracking-wider">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="ins-info min-w-0">
                  <div className="ins-n text-sm font-semibold text-[var(--kt-ink)] mb-1.5 flex items-center">
                    <span
                      className={`veg-dot ${it.diet === "nonveg" ? "nv" : ""} inline-block w-2.5 h-2.5 rounded-[2px] mr-2`}
                    />
                    {it.name}
                  </div>
                  <div className="ins-bar h-1.5 bg-[var(--kt-cream-3)] rounded-[3px] overflow-hidden">
                    <i
                      className="block h-full bg-[var(--kt-ink)] rounded-[3px] transition-all duration-[600ms] ease-out"
                      style={{ width: `${it.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="ins-c font-mono text-sm font-bold text-[var(--kt-ink)] text-right">
                  {it.count}
                  <small className="block font-mono text-[10px] font-medium text-[var(--kt-ink-3)] uppercase tracking-wider mt-0.5">
                    orders
                  </small>
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
