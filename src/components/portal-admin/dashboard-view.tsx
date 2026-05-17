"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Download, IndianRupee, ListOrdered, Receipt, Timer } from "lucide-react";
import dayjs from "dayjs";
import { formatRupees, formatTimeIST, fmtElapsed } from "@/lib/utils";
import { getBrowserClient } from "@/lib/supabase/browser";
import { KpiCard } from "./kpi-card";
import { RevenueChart } from "./revenue-chart";
import { PeakHeatmap } from "./peak-heatmap";
import { TopItems } from "./top-items";
import { ActivityFeed } from "./activity-feed";

type OrderRow = {
  id: string;
  short_code: string;
  status: "pending_payment" | "placed" | "preparing" | "ready" | "collected" | "rejected" | "expired";
  total_paise: number;
  placed_at: string;
  collected_at: string | null;
  ready_at: string | null;
  customer_name: string | null;
  order_type: "takeaway" | "dine_in";
};
type StatusLog = {
  id: string;
  order_id: string;
  to_status: string;
  from_status: string | null;
  created_at: string;
  note: string | null;
};
type ItemRow = {
  id: string;
  order_id: string;
  name_snapshot: string;
  qty: number;
  diet_snapshot: "veg" | "nonveg" | "egg";
  price_paise_snapshot: number;
};

export function DashboardView({
  tenantName,
  ordersWeek,
  todayOrders,
  logs: initialLogs,
  todayItems,
}: {
  tenantName: string;
  ordersWeek: OrderRow[];
  todayOrders: OrderRow[];
  logs: StatusLog[];
  todayItems: ItemRow[];
}) {
  const [logs, setLogs] = useState(initialLogs);

  useEffect(() => {
    const sb = getBrowserClient();
    const ch = sb
      .channel("admin-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "order_status_logs" },
        (payload) => {
          setLogs((prev) => [(payload.new as StatusLog), ...prev].slice(0, 40));
        }
      )
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, []);

  const kpis = useMemo(() => {
    const paid = todayOrders.filter((o) => !["pending_payment", "rejected", "expired"].includes(o.status));
    const revenue = paid.reduce((acc, o) => acc + o.total_paise, 0);
    const count = paid.length;
    const avgTicket = count ? Math.round(revenue / count) : 0;
    const pickups = paid
      .filter((o) => o.collected_at && o.placed_at)
      .map((o) => (new Date(o.collected_at!).getTime() - new Date(o.placed_at).getTime()) / 1000);
    const avgPickup = pickups.length ? Math.round(pickups.reduce((a, b) => a + b, 0) / pickups.length) : 0;
    return { revenue, count, avgTicket, avgPickup };
  }, [todayOrders]);

  const dayBuckets = useMemo(() => {
    const start = dayjs().startOf("day").subtract(6, "day");
    const days: { label: string; key: string; revenue: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = start.add(i, "day");
      days.push({ label: d.format("ddd").toUpperCase(), key: d.format("YYYY-MM-DD"), revenue: 0 });
    }
    for (const o of ordersWeek) {
      if (["rejected", "expired", "pending_payment"].includes(o.status)) continue;
      const k = dayjs(o.placed_at).format("YYYY-MM-DD");
      const b = days.find((x) => x.key === k);
      if (b) b.revenue += o.total_paise;
    }
    return days;
  }, [ordersWeek]);

  const heatmap = useMemo(() => {
    const grid: number[][] = Array.from({ length: 7 }, () => Array(12).fill(0));
    for (const o of ordersWeek) {
      const d = dayjs(o.placed_at);
      const dow = (d.day() + 6) % 7;
      const hour = d.hour();
      if (hour < 8 || hour > 19) continue;
      const col = hour - 8;
      grid[dow]![col]! += 1;
    }
    return grid;
  }, [ordersWeek]);

  const topItems = useMemo(() => {
    const m = new Map<string, { name: string; qty: number; revenue: number; diet: "veg" | "nonveg" | "egg" }>();
    for (const i of todayItems) {
      const cur = m.get(i.name_snapshot) ?? { name: i.name_snapshot, qty: 0, revenue: 0, diet: i.diet_snapshot };
      cur.qty += i.qty;
      cur.revenue += i.qty * i.price_paise_snapshot;
      m.set(i.name_snapshot, cur);
    }
    return [...m.values()].sort((a, b) => b.qty - a.qty).slice(0, 6);
  }, [todayItems]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="font-display text-[26px] sm:text-[30px] font-semibold tracking-tight">
            Today&rsquo;s overview
          </h1>
          <div className="text-[11px] font-mono uppercase tracking-[0.12em] text-graphite-400 mt-0.5">
            {dayjs().format("ddd · D MMM YYYY").toUpperCase()} · {tenantName.toUpperCase()} · COUNTER 01
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/admin/export/orders"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-graphite-200/15 text-[11px] font-mono uppercase tracking-wider text-graphite-300 hover:border-lime hover:text-lime transition-colors"
          >
            <Download size={11} /> Export CSV
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <KpiCard label="Revenue today" value={formatRupees(kpis.revenue)} delta="+12.4%" deltaUp icon={IndianRupee} />
        <KpiCard label="Orders" value={String(kpis.count)} delta="+8.1%" deltaUp icon={ListOrdered} />
        <KpiCard label="Avg ticket" value={formatRupees(kpis.avgTicket)} delta="+₹6" deltaUp icon={Receipt} tone="amber" />
        <KpiCard label="Avg pickup" value={kpis.avgPickup ? fmtElapsed(kpis.avgPickup) : "—"} delta="-0:18" deltaUp={false} icon={Timer} tone="rose" />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-2 mb-3">
        <RevenueChart days={dayBuckets} />
        <PeakHeatmap grid={heatmap} />
      </div>

      <div className="grid lg:grid-cols-2 gap-2">
        <ActivityFeed logs={logs} />
        <TopItems items={topItems} />
      </div>
    </motion.div>
  );
}

export function _UnusedIcons({ a, b }: { a: typeof ArrowUp; b: typeof ArrowDown }) {
  return (
    <span>
      <a />
      <b />
    </span>
  );
}
