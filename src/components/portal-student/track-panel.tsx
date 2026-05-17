"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatRupees } from "@/lib/utils";
import { getBrowserClient } from "@/lib/supabase/browser";
import { getMyOrderOtp } from "@/app/(student)/_actions";

type Status = "pending_payment" | "placed" | "preparing" | "ready" | "collected" | "rejected" | "expired";
type Order = {
  id: string;
  short_code: string;
  status: Status;
  total_paise: number;
  placed_at: string;
  ready_at: string | null;
  collected_at: string | null;
  customer_name: string | null;
};
type Line = {
  id: string;
  name_snapshot: string;
  qty: number;
  diet_snapshot: "veg" | "nonveg" | "egg";
  price_paise_snapshot: number;
};

const STEPS: Array<{ status: Status; title: string; when: string; desc: string }> = [
  { status: "placed", title: "Order placed", when: "0 min", desc: "Your tray is in the queue. Kitchen has been notified." },
  { status: "placed", title: "Payment confirmed", when: "UPI", desc: "Receipt sent to your email." },
  { status: "preparing", title: "Preparing your meal", when: "~6 min remaining", desc: "Chef is on it. Watch the live status update." },
  { status: "ready", title: "Ready for pickup", when: "Estimated soon", desc: "You'll get a notification with your pickup code." },
  { status: "collected", title: "Collected", when: "After OTP verification", desc: "Counter staff closes the order after handover." },
];

const rank: Record<Status, number> = {
  pending_payment: 0,
  placed: 1,
  preparing: 2,
  ready: 3,
  collected: 4,
  rejected: 0,
  expired: 0,
};

export function TrackPanel({ tenantName, order: initial, lines }: { tenantName: string; order: Order; lines: Line[] }) {
  const [order, setOrder] = useState(initial);
  const [otp, setOtp] = useState<string | null>(null);

  useEffect(() => {
    const sb = getBrowserClient();
    const refresh = async () => {
      const { data } = await sb
        .from("orders")
        .select("id, short_code, status, total_paise, placed_at, ready_at, collected_at, customer_name")
        .eq("id", initial.id)
        .maybeSingle<Order>();
      if (data) setOrder(data);
    };

    const ch = sb
      .channel(`order:${initial.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${initial.id}` }, (payload) => {
        setOrder((prev) => ({ ...prev, ...(payload.new as Partial<Order>) }));
      })
      .subscribe();

    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      sb.removeChannel(ch);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [initial.id]);

  useEffect(() => {
    if (order.status === "ready") getMyOrderOtp(order.id).then((r) => setOtp(r.otp));
  }, [order.id, order.status]);

  const progress = useMemo(() => Math.min(100, rank[order.status] * 25), [order.status]);
  const activeRank = rank[order.status];

  if (order.status === "rejected" || order.status === "expired") {
    return (
      <div className="order-page" style={{ textAlign: "center" }}>
        <span className="chip chip-err">{order.status}</span>
        <h1 style={{ marginTop: 16 }}>{order.status === "expired" ? "Payment expired." : "Order rejected."}</h1>
        <p className="lead">Start a new order from the live menu.</p>
        <Link href="/menu" className="btn btn-primary btn-lg" style={{ marginTop: 24 }}>Back to menu</Link>
      </div>
    );
  }

  return (
    <div className="order-page">
      <div className="order-head">
        <div>
          <span className="eyebrow">{tenantName} - Order {order.short_code}</span>
          <h1>
            Almost <span className="it">there.</span>
          </h1>
        </div>
        <div className="meta">
          <div>Placed - ETA soon</div>
          <div style={{ marginTop: 6 }}>
            <span className="chip chip-accent">{order.status}</span>
          </div>
        </div>
      </div>

      <div className="timeline">
        <div className="tl-rail"><div className="fill" style={{ height: `${progress}%` }} /></div>
        <div className="tl-events">
          {STEPS.map((step, idx) => {
            const stepRank = idx <= 1 ? 1 : rank[step.status];
            const state = activeRank > stepRank ? "done" : activeRank === stepRank ? "now" : "todo";
            return (
              <div className={`tl-event ${state}`} key={`${step.title}-${idx}`}>
                <div className="node" />
                <div>
                  <h3>{step.title}</h3>
                  <div className="when">{step.when}</div>
                  <div className="desc">{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {order.status === "ready" && otp && (
        <div className="collect-card">
          <span className="eyebrow" style={{ color: "var(--accent)" }}>Your pickup code</span>
          <div className="otp-display">
            {otp.split("").map((digit, idx) => <span className="d" key={`${digit}-${idx}`}>{digit}</span>)}
          </div>
          <p style={{ color: "var(--ink-2)", textAlign: "center", maxWidth: "32ch" }}>
            Show this code at the counter to collect your order.
          </p>
        </div>
      )}

      <div className="surface" style={{ padding: 16 }}>
        <div className="eyebrow">You ordered</div>
        <div className="col gap-2" style={{ marginTop: 12 }}>
          {lines.map((line) => (
            <div className="row between" key={line.id}>
              <span>{line.qty} x {line.name_snapshot}</span>
              <span className="mono">{formatRupees(line.qty * line.price_paise_snapshot)}</span>
            </div>
          ))}
          <div className="divider" />
          <div className="row between">
            <b>Total paid</b>
            <b>{formatRupees(order.total_paise)}</b>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ color: "var(--ink-3)", fontSize: 13 }}>Need help? Contact kitchen</div>
        <Link className="btn btn-ghost btn-sm" href="/menu">Back to menu</Link>
      </div>
    </div>
  );
}
