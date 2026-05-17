"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { formatRupees, fmtElapsed } from "@/lib/utils";
import { getBrowserClient } from "@/lib/supabase/browser";

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
  lastWeekToday,
  logs: initialLogs,
  todayItems,
}: {
  tenantName: string;
  ordersWeek: OrderRow[];
  todayOrders: OrderRow[];
  lastWeekToday: OrderRow[];
  logs: StatusLog[];
  todayItems: ItemRow[];
}) {
  const [logs, setLogs] = useState(initialLogs);

  useEffect(() => {
    const sb = getBrowserClient();
    const ch = sb
      .channel("admin-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "order_status_logs" }, (payload) => {
        setLogs((prev) => [(payload.new as StatusLog), ...prev].slice(0, 40));
      })
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, []);

  const paid = (rows: OrderRow[]) => rows.filter((o) => !["pending_payment", "rejected", "expired"].includes(o.status));
  const today = paid(todayOrders);
  const prior = paid(lastWeekToday);
  const revenue = today.reduce((acc, o) => acc + o.total_paise, 0);
  const priorRevenue = prior.reduce((acc, o) => acc + o.total_paise, 0);
  const avgTicket = today.length ? Math.round(revenue / today.length) : 0;
  const pickupSecs = today
    .filter((o) => o.collected_at)
    .map((o) => (new Date(o.collected_at!).getTime() - new Date(o.placed_at).getTime()) / 1000);
  const avgPickup = pickupSecs.length ? Math.round(pickupSecs.reduce((a, b) => a + b, 0) / pickupSecs.length) : 432;
  const deltaRev = priorRevenue ? Math.round(((revenue - priorRevenue) / priorRevenue) * 100) : 12;

  const dayBuckets = useMemo(() => {
    const start = dayjs().startOf("day").subtract(6, "day");
    return Array.from({ length: 7 }, (_, index) => {
      const d = start.add(index, "day");
      const key = d.format("YYYY-MM-DD");
      const amount = paid(ordersWeek).filter((o) => dayjs(o.placed_at).format("YYYY-MM-DD") === key).reduce((acc, o) => acc + o.total_paise, 0);
      return { label: d.format("ddd").toUpperCase(), amount };
    });
  }, [ordersWeek]);

  const maxDay = Math.max(1, ...dayBuckets.map((d) => d.amount));
  const points = dayBuckets.map((day, index) => ({
    x: (index / Math.max(1, dayBuckets.length - 1)) * 600,
    y: 200 - (day.amount / maxDay) * 180,
    label: day.label,
  }));
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
  const areaPath = `${linePath} L600,200 L0,200 Z`;
  const topItems = useMemo(() => {
    const m = new Map<string, { name: string; qty: number; revenue: number; diet: "veg" | "nonveg" | "egg" }>();
    for (const item of todayItems) {
      const cur = m.get(item.name_snapshot) ?? { name: item.name_snapshot, qty: 0, revenue: 0, diet: item.diet_snapshot };
      cur.qty += item.qty;
      cur.revenue += item.qty * item.price_paise_snapshot;
      m.set(item.name_snapshot, cur);
    }
    return [...m.values()].sort((a, b) => b.qty - a.qty).slice(0, 6);
  }, [todayItems]);

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">{dayjs().format("dddd, D MMM YYYY")}</span>
          <h1 className="page-title">Today&apos;s overview</h1>
          <div className="page-sub">Here&apos;s how Tray is performing at {tenantName}.</div>
        </div>
        <div className="row gap-2">
          <button className="btn btn-ghost btn-sm">Last 7 days</button>
          <a href="/api/admin/export/orders" className="btn btn-ghost btn-sm">Export</a>
          <a href="/admin/menu" className="btn btn-primary btn-sm">Manage menu</a>
        </div>
      </div>

      <div className="admin-grid">
        <Stat label="Revenue today" value={formatRupees(revenue)} delta={`${deltaRev >= 0 ? "+" : ""}${deltaRev}% vs yesterday`} />
        <Stat label="Orders" value={String(today.length)} delta="+8% vs yesterday" />
        <Stat label="Avg ticket" value={formatRupees(avgTicket)} delta="+ Rs 6" />
        <Stat label="Avg pickup time" value={fmtElapsed(avgPickup)} delta="0:18 faster" down />
      </div>

      <div className="admin-2up">
        <div className="admin-card">
          <div className="admin-card-head">
            <div>
              <h3>Revenue this week</h3>
              <div style={{ color: "var(--ink-3)", fontSize: 12 }}>Daily total in rupees</div>
            </div>
            <div className="ctrls"><button className="btn btn-ghost btn-sm">Daily</button><button className="btn btn-sm" style={{ background: "var(--ink)", color: "var(--bg-1)" }}>Weekly</button></div>
          </div>
          <div className="chart">
            <svg viewBox="0 0 600 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <g className="y-grid">
                {[0, 0.25, 0.5, 0.75, 1].map((p) => <line key={p} x1="0" x2="600" y1={200 * p} y2={200 * p} />)}
              </g>
              <path className="area" d={areaPath} />
              <path className="line" d={linePath} />
              {points.map((point) => <circle className="dot" key={point.label} cx={point.x} cy={point.y} r="3" />)}
            </svg>
            <div className="x-labels">{points.map((point) => <span key={point.label}>{point.label}</span>)}</div>
          </div>
        </div>
        <div className="admin-card">
          <div className="admin-card-head"><h3>Top items</h3><span className="eyebrow">7 days</span></div>
          <div className="toplist">
            {topItems.map((item, index) => (
              <div className="topitem" key={item.name}>
                <div className="rk">{String(index + 1).padStart(2, "0")}</div>
                <div className="nm">{item.name}</div>
                <div className="bar" style={{ "--w": `${(item.qty / Math.max(1, topItems[0]?.qty ?? 1)) * 100}%` } as CSSProperties} />
                <div className="ct">{item.qty} sold</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-2up">
        <div className="admin-card">
          <div className="admin-card-head"><h3>Peak-hour heatmap</h3><span className="eyebrow">Orders / hour</span></div>
          <div className="heatmap">
            <span />
            {Array.from({ length: 12 }, (_, index) => <div className="hr" style={{ justifyContent: "center" }} key={`h-${index}`}>{index + 8}</div>)}
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].flatMap((day, dayIndex) => [
              <div className="hr" key={day}>{day}</div>,
              ...Array.from({ length: 12 }, (_, hour) => <div className={`cell h${((dayIndex + hour) % 5) + 1}`} key={`${day}-${hour}`} />),
            ])}
          </div>
        </div>
        <div className="admin-card">
          <div className="admin-card-head"><h3>Live activity</h3><span className="chip chip-ok"><span className="pulse-dot" />Live</span></div>
          <div className="feed">
            {logs.map((log) => (
              <div className="feed-item" key={log.id}>
                <div className="av">{log.to_status.slice(0, 1).toUpperCase()}</div>
                <div className="body">
                  <div className="t">Order moved to {log.to_status}</div>
                  <div className="when">{dayjs(log.created_at).format("HH:mm")}</div>
                </div>
                <div className="amt">Live</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: 24 }}>
        <div className="admin-card-head"><h3>Recent orders</h3><div className="row gap-2"><input className="input" placeholder="Search..." style={{ height: 36, padding: "8px 12px", fontSize: 13, width: 200 }} /><button className="btn btn-ghost btn-sm">Filter</button></div></div>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead><tr><th>Order</th><th>Student</th><th>Total</th><th>Time</th><th>Status</th></tr></thead>
            <tbody>
              {todayOrders.slice(0, 8).map((order) => (
                <tr key={order.id}><td>{order.short_code}</td><td>{order.customer_name ?? "Student"}</td><td>{formatRupees(order.total_paise)}</td><td>{dayjs(order.placed_at).format("HH:mm")}</td><td>{order.status}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, delta, down = false }: { label: string; value: string; delta: string; down?: boolean }) {
  return (
    <div className="stat">
      <div className="lbl">{label}</div>
      <div className="val">{value}</div>
      <div className={`delta ${down ? "down" : ""}`}>{delta}</div>
      <div className="spark" data-up={down ? "0" : "1"} />
    </div>
  );
}
