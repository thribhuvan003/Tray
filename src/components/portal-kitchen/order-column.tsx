"use client";

import { useEffect, useState } from "react";
import { formatRupees, elapsedSeconds, fmtElapsed } from "@/lib/utils";

type Status = "placed" | "preparing" | "ready" | "collected";
type Order = {
  id: string;
  short_code: string;
  status: Status | "pending_payment" | "rejected" | "expired";
  total_paise: number;
  placed_at: string;
  ready_at: string | null;
  collected_at: string | null;
  customer_name: string | null;
  order_type: "takeaway" | "dine_in";
  table_label: string | null;
};
type Line = {
  id: string;
  order_id: string;
  name_snapshot: string;
  qty: number;
  diet_snapshot: "veg" | "nonveg" | "egg";
};

export function OrderColumn({
  title,
  subtitle,
  status,
  orders,
  linesByOrder,
  onAction,
}: {
  title: string;
  subtitle: string;
  status: Status;
  orders: Order[];
  linesByOrder: Map<string, Line[]>;
  onAction: (id: string, action: "start" | "ready" | "verify") => void;
}) {
  return (
    <section>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, lineHeight: 1 }}>{title}</h2>
          <div className="eyebrow">{subtitle}</div>
        </div>
        <span className="chip chip-accent">{orders.length}</span>
      </header>
      {orders.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">0</div>
          <div>No orders in this lane.</div>
        </div>
      ) : (
        orders.map((order) => (
          <KitchenTicket key={order.id} order={order} status={status} lines={linesByOrder.get(order.id) ?? []} onAction={onAction} />
        ))
      )}
    </section>
  );
}

function KitchenTicket({
  order,
  status,
  lines,
  onAction,
}: {
  order: Order;
  status: Status;
  lines: Line[];
  onAction: (id: string, action: "start" | "ready" | "verify") => void;
}) {
  const [elapsed, setElapsed] = useState(elapsedSeconds(order.placed_at));
  useEffect(() => {
    const id = setInterval(() => setElapsed(elapsedSeconds(order.placed_at)), 1000);
    return () => clearInterval(id);
  }, [order.placed_at]);

  const action =
    status === "placed"
      ? { label: "Start preparing", value: "start" as const }
      : status === "preparing"
      ? { label: "Mark ready", value: "ready" as const }
      : status === "ready"
      ? { label: "Verify OTP & hand over", value: "verify" as const }
      : null;

  return (
    <article className={`korder ${elapsed > 480 ? "priority" : ""}`} data-id={order.id}>
      <div className="korder-head">
        <div>
          <div className="oid">{order.short_code}</div>
          <div className="when">{fmtElapsed(elapsed)} - {order.customer_name ?? "Student"}</div>
        </div>
        <div className="timer">{order.order_type === "dine_in" ? `Table ${order.table_label}` : "Takeaway"}</div>
      </div>
      <div className="korder-items">
        {lines.map((line) => (
          <div className="korder-item" key={line.id}>
            <span className="nm">{line.name_snapshot}</span>
            <span className="q">{line.qty}x</span>
            <span className={`veg-mark ${line.diet_snapshot === "veg" ? "" : "nv"}`} />
          </div>
        ))}
      </div>
      <div className="korder-foot">
        <span className="mono">{formatRupees(order.total_paise)}</span>
        {action && (
          <button className="btn btn-primary" onClick={() => onAction(order.id, action.value)}>
            {action.label}
          </button>
        )}
      </div>
    </article>
  );
}
