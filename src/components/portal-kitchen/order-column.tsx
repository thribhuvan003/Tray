"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ChefHat, Hand, KeyRound, ShoppingBag, UtensilsCrossed, X } from "lucide-react";
import { toast } from "sonner";
import { cn, formatRupees, formatTimeIST, elapsedSeconds, fmtElapsed } from "@/lib/utils";

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

const COL_CFG: Record<
  Status,
  { tone: string; badge: string; cta: { label: string; icon: typeof ChefHat } | null }
> = {
  placed: { tone: "border-amber-500", badge: "bg-amber-500", cta: { label: "Start →", icon: ChefHat } },
  preparing: { tone: "border-ocean-500", badge: "bg-ocean-500", cta: { label: "Ready →", icon: CheckCircle2 } },
  ready: { tone: "border-tomato-500", badge: "bg-tomato-500", cta: { label: "Verify OTP", icon: KeyRound } },
  collected: { tone: "border-emerald-500", badge: "bg-emerald-500", cta: null },
};

export function OrderColumn({
  title,
  subtitle,
  status,
  orders,
  linesByOrder,
  onAction,
  onReject,
}: {
  title: string;
  subtitle: string;
  status: Status;
  orders: Order[];
  linesByOrder: Map<string, Line[]>;
  onAction: (id: string, action: "start" | "ready" | "verify") => void;
  onReject?: (id: string, reason: string) => Promise<void>;
}) {
  const cfg = COL_CFG[status];
  return (
    <section className="flex flex-col gap-2">
      <header className="flex items-end justify-between">
        <div>
          <div className="font-display text-[20px] sm:text-[22px] font-medium leading-none tracking-tight">
            {title}
          </div>
          <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-tomato-900/55 dark:text-cream-200/55 mt-1">
            {subtitle}
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center justify-center min-w-[28px] h-[22px] px-2 rounded-full text-white text-[12px] font-mono tabular",
            cfg.badge
          )}
        >
          {orders.length}
        </span>
      </header>
      <div className="flex flex-col gap-2">
        {orders.length === 0 ? (
          <div className="border-2 border-dashed border-tomato-900/15 dark:border-cream-200/15 rounded-lg p-6 text-center text-[12px] text-tomato-900/45 dark:text-cream-200/45">
            Nothing here right now.
          </div>
        ) : (
          orders.map((o, idx) => (
            <TicketCard
              key={o.id}
              order={o}
              lines={linesByOrder.get(o.id) ?? []}
              rotation={idx % 2 === 0 ? "-rotate-[0.4deg]" : "rotate-[0.3deg]"}
              cfg={cfg}
              onAction={(act) => onAction(o.id, act)}
              onReject={onReject ? (reason) => onReject(o.id, reason) : undefined}
            />
          ))
        )}
      </div>
    </section>
  );
}

function TicketCard({
  order,
  lines,
  rotation,
  cfg,
  onAction,
  onReject,
}: {
  order: Order;
  lines: Line[];
  rotation: string;
  cfg: (typeof COL_CFG)[Status];
  onAction: (action: "start" | "ready" | "verify") => void;
  onReject?: (reason: string) => Promise<void>;
}) {
  const [elapsed, setElapsed] = useState(elapsedSeconds(order.placed_at));
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const reasonRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const id = setInterval(() => setElapsed(elapsedSeconds(order.placed_at)), 1000);
    return () => clearInterval(id);
  }, [order.placed_at]);

  useEffect(() => {
    if (showReject) setTimeout(() => reasonRef.current?.focus(), 30);
  }, [showReject]);

  const overtime = order.status !== "collected" && elapsed > 480;
  const isCollected = order.status === "collected";

  const handle = () => {
    if (order.status === "placed") onAction("start");
    else if (order.status === "preparing") onAction("ready");
    else if (order.status === "ready") onAction("verify");
  };

  const submitReject = async () => {
    if (!onReject) return;
    const trimmed = reason.trim();
    if (!trimmed) {
      toast.error("Enter a reason before rejecting");
      reasonRef.current?.focus();
      return;
    }
    setRejecting(true);
    try {
      await onReject(trimmed);
      setShowReject(false);
      setReason("");
    } finally {
      setRejecting(false);
    }
  };

  return (
    <article
      className={cn(
        "relative bg-cream-50 dark:bg-graphite-800 border-2 border-tomato-900 dark:border-cream-200/30 p-3 shadow-[5px_5px_0_0_var(--color-tomato-900)] dark:shadow-[5px_5px_0_0_rgba(247,200,194,0.3)]",
        rotation
      )}
    >
      {isCollected && (
        <div className="absolute -right-1 top-2 rotate-[-8deg] pointer-events-none select-none">
          <span className="font-display font-bold text-[20px] tracking-wider text-emerald-600 border-2 border-emerald-600 px-2 py-0.5 rounded-sm bg-emerald-50/80 dark:bg-emerald-950/40">
            COLLECTED
          </span>
        </div>
      )}
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[16px] font-semibold tabular tracking-tight">
            {order.short_code}
          </div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-tomato-900/55 dark:text-cream-200/55 mt-0.5 flex items-center gap-1.5">
            {order.order_type === "dine_in" ? (
              <>
                <UtensilsCrossed size={9} /> Table {order.table_label}
              </>
            ) : (
              <>
                <ShoppingBag size={9} /> Takeaway
              </>
            )}
            <span>·</span>
            <span>{formatTimeIST(order.placed_at)}</span>
          </div>
        </div>
        <span
          className={cn(
            "font-mono tabular text-[14px] font-semibold tracking-tight",
            overtime ? "text-tomato-500 animate-pulse" : "text-tomato-900 dark:text-cream-200"
          )}
        >
          {fmtElapsed(elapsed)}
        </span>
      </div>

      <ul className="mt-3 flex flex-col gap-1 text-[13px]">
        {lines.map((l) => (
          <li key={l.id} className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex h-3 w-3 items-center justify-center border-2 rounded-sm shrink-0",
                l.diet_snapshot === "veg"
                  ? "border-emerald-500"
                  : l.diet_snapshot === "egg"
                  ? "border-amber-500"
                  : "border-tomato-500"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  l.diet_snapshot === "veg"
                    ? "bg-emerald-500"
                    : l.diet_snapshot === "egg"
                    ? "bg-amber-500"
                    : "bg-tomato-500"
                )}
              />
            </span>
            <span className="font-medium tabular shrink-0 w-6">{l.qty}×</span>
            <span className="flex-1 truncate">{l.name_snapshot}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 pt-2 border-t border-tomato-900/20 dark:border-cream-200/20 flex items-center justify-between gap-2">
        <div className="text-[11px] font-mono text-tomato-900/55 dark:text-cream-200/55">
          {order.customer_name ?? "Customer"} · {formatRupees(order.total_paise)}
        </div>
        <div className="flex items-center gap-1.5">
          {/* Reject button — only on placed orders */}
          {order.status === "placed" && onReject && !showReject && (
            <button
              type="button"
              onClick={() => setShowReject(true)}
              title="Reject this order"
              aria-label="Reject order"
              className="inline-flex items-center justify-center h-11 w-11 rounded-md border-2 border-tomato-900/30 dark:border-cream-200/25 text-tomato-900/50 dark:text-cream-200/50 hover:border-tomato-500 hover:text-tomato-500 active:scale-95 transition-colors"
            >
              <X size={15} />
            </button>
          )}
          {cfg.cta && (
            <button
              onClick={handle}
              className="inline-flex items-center gap-1.5 h-11 px-4 rounded-md bg-tomato-500 text-white text-[13px] font-semibold hover:bg-tomato-600 active:scale-95 transition-colors"
            >
              <cfg.cta.icon size={14} /> {cfg.cta.label}
            </button>
          )}
          {isCollected && order.collected_at && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600">
              <Hand size={10} /> {formatTimeIST(order.collected_at)}
            </span>
          )}
        </div>
      </div>

      {/* Reject inline form — slides in below the card footer */}
      {showReject && (
        <div className="mt-3 pt-3 border-t-2 border-tomato-500/30">
          <p className="text-[11px] font-mono uppercase tracking-wider text-tomato-500 mb-1.5">
            Reject reason (required)
          </p>
          <textarea
            ref={reasonRef}
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, 200))}
            rows={2}
            maxLength={200}
            placeholder="e.g. Item unavailable, wrong order, etc."
            className="w-full resize-none border-2 border-tomato-900/30 dark:border-cream-200/25 bg-cream-50 dark:bg-graphite-700 text-[12px] p-2 focus:outline-none focus:border-tomato-500 rounded-sm"
          />
          <div className="text-right text-[10px] font-mono text-tomato-900/40 dark:text-cream-200/40 mb-2">
            {reason.length}/200
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setShowReject(false); setReason(""); }}
              disabled={rejecting}
              className="flex-1 h-8 rounded-md border-2 border-tomato-900/30 dark:border-cream-200/25 text-[12px] font-medium hover:bg-tomato-900/5 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void submitReject()}
              disabled={rejecting || !reason.trim()}
              className="flex-1 h-8 rounded-md bg-tomato-500 text-white text-[12px] font-semibold hover:bg-tomato-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {rejecting ? "Rejecting…" : "Confirm reject"}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
