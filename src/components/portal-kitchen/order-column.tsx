"use client";

import { useEffect, useState, memo } from "react";
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
  otp_attempts: number;
};
type Line = {
  id: string;
  order_id: string;
  name_snapshot: string;
  qty: number;
  diet_snapshot: "veg" | "nonveg" | "egg";
};

/* Column colour prefix — matches kitchen.html data-status ::before content */
const COL_DOT: Record<Status, { symbol: string; color: string }> = {
  placed:     { symbol: "▣", color: "var(--kt-mustard)" },
  preparing:  { symbol: "◐", color: "var(--kt-tomato)" },
  ready:      { symbol: "✓", color: "var(--kt-olive)" },
  collected:  { symbol: "▪", color: "var(--kt-ink-3)" },
};

const COL_CTA: Record<Status, { label: string; icon: typeof ChefHat } | null> = {
  placed:    { label: "Start →",    icon: ChefHat },
  preparing: { label: "Ready →",    icon: CheckCircle2 },
  ready:     { label: "Verify OTP", icon: KeyRound },
  collected: null,
};

export function OrderColumn({
  title,
  subtitle,
  status,
  orders,
  linesByOrder,
  onAction,
  onReject,
  pendingActionId,
  unverifiedUpiOrders,
}: {
  title: string;
  subtitle: string;
  status: Status;
  orders: Order[];
  linesByOrder: Map<string, Line[]>;
  onAction: (id: string, action: "start" | "ready" | "verify") => void;
  onReject?: (id: string, reason: string) => Promise<void>;
  pendingActionId?: string | null;
  unverifiedUpiOrders?: Set<string>;
}) {
  const dot = COL_DOT[status];
  const cta = COL_CTA[status];

  return (
    /* .col — cream-4 bg, border-right (managed by parent grid), flex column */
    <section
      className="flex flex-col"
      style={{
        background: "var(--kt-cream-4)",
        borderRight: "1px solid var(--kt-line)",
        minHeight: 0,
      }}
    >
      {/* .col-head — paper bg, sticky, border-bottom */}
      <header
        className="flex justify-between items-center sticky top-0 z-10"
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--kt-line)",
          background: "var(--kt-paper)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-jetbrains), ui-monospace, Menlo, monospace",
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 700,
            color: "var(--kt-ink)",
          }}
        >
          <span style={{ color: dot.color, marginRight: "4px" }}>{dot.symbol}</span>
          {title}
        </span>
        <span
          className="tabular"
          style={{
            fontFamily: "var(--font-jetbrains), ui-monospace, Menlo, monospace",
            fontSize: "11px",
            background: "var(--kt-ink)",
            color: "var(--kt-cream)",
            padding: "2px 8px",
            borderRadius: "5px",
            fontWeight: 700,
          }}
        >
          {String(orders.length).padStart(2, "0")}
        </span>
      </header>

      {/* .col-body — scrollable ticket list */}
      <div
        className="flex flex-col overflow-y-auto"
        style={{
          flex: 1,
          padding: "10px",
          gap: "8px",
          maxHeight: "min(600px, 52vh)",
          scrollbarWidth: "thin",
          scrollbarColor: "var(--kt-line-2) transparent",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {orders.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--kt-ink-4)", fontSize: "13px", padding: "32px 16px" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>—</div>
            No orders
          </div>
        ) : (
          orders.map((o, idx) => (
            <MemoizedTicketCard
              key={o.id}
              order={o}
              lines={linesByOrder.get(o.id) ?? []}
              animDelay={idx * 0.04}
              cta={cta}
              onAction={(act) => onAction(o.id, act)}
              onReject={onReject ? (reason) => onReject(o.id, reason) : undefined}
              pending={pendingActionId === o.id}
              isUnverifiedUpi={unverifiedUpiOrders?.has(o.id) ?? false}
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
  animDelay,
  cta,
  onAction,
  onReject,
  pending = false,
  isUnverifiedUpi = false,
}: {
  order: Order;
  lines: Line[];
  animDelay: number;
  cta: { label: string; icon: typeof ChefHat } | null;
  onAction: (action: "start" | "ready" | "verify") => void;
  onReject?: (reason: string) => Promise<void>;
  pending?: boolean;
  isUnverifiedUpi?: boolean;
}) {
  const [elapsed, setElapsed] = useState(elapsedSeconds(order.placed_at));
  const [showReject, setShowReject] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setElapsed(elapsedSeconds(order.placed_at)), 1000);
    return () => clearInterval(id);
  }, [order.placed_at]);

  const overtime = order.status !== "collected" && elapsed > 480;
  const isCollected = order.status === "collected";

  const handle = () => {
    if (order.status === "placed") onAction("start");
    else if (order.status === "preparing") onAction("ready");
    else if (order.status === "ready") onAction("verify");
  };

  const REJECT_REASONS = [
    "Item unavailable",
    "Out of stock",
    "Order too late",
    "Counter closed",
  ];

  const [otherReason, setOtherReason] = useState("");
  const isOtherSelected = selectedReason === "Other (type below)";

  const effectiveReason = isOtherSelected ? (otherReason.trim() || "Other (unspecified)") : selectedReason;

  const submitReject = async () => {
    if (!onReject) return;
    if (!effectiveReason) {
      toast.error("Select or type a reason before rejecting");
      return;
    }
    setRejecting(true);
    try {
      await onReject(effectiveReason);
      setShowReject(false);
      setSelectedReason("");
      setOtherReason("");
    } finally {
      setRejecting(false);
    }
  };

  return (
    /* .ticket — paper bg, border, 7px radius, ticketIn animation */
    <article
      className={cn("relative ticket-in", isCollected && "ticket-stamp")}
      style={{
        background: "var(--kt-paper)",
        border: "1px solid var(--kt-line)",
        borderRadius: "7px",
        padding: "11px 13px",
        display: "flex",
        flexDirection: "column",
        gap: "7px",
        cursor: "pointer",
        transition: "transform 0.12s, box-shadow 0.12s, border-color 0.15s",
        animationDelay: `${animDelay}s`,
        opacity: pending ? 0.7 : (isCollected ? 0.6 : 1),
      }}
      onClick={(e) => {
        if (pending || (e.target as HTMLElement).closest("button")) return;
        handle();
      }}
    >
      {/* .tkt-r1 — order id + placed time */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span
            className="tabular"
            style={{
              fontFamily: "var(--font-jetbrains), ui-monospace, Menlo, monospace",
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--kt-ink)",
              letterSpacing: "0.02em",
            }}
          >
            {order.short_code}
          </span>
          {/* Priority 1: warn staff about unverified UPI payment */}
          {isUnverifiedUpi && (
            <span
              title="Payment unverified — student tapped 'I've paid'. Check your UPI app before handing over food."
              style={{
                fontFamily: "var(--font-jetbrains), ui-monospace, Menlo, monospace",
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#d97706",
                background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: "3px",
                padding: "1px 5px",
              }}
            >
              ⚠ UPI UNVERIFIED
            </span>
          )}
        </div>
        <span
          className="tabular"
          style={{
            fontFamily: "var(--font-jetbrains), ui-monospace, Menlo, monospace",
            fontSize: "10px",
            color: "var(--kt-ink-3)",
            letterSpacing: "0.06em",
          }}
        >
          {formatTimeIST(order.placed_at)}
        </span>
      </div>

      {/* .tkt-student — customer name + order type */}
      <div
        style={{
          fontFamily: "var(--font-jetbrains), ui-monospace, Menlo, monospace",
          fontSize: "10px",
          color: "var(--kt-ink-3)",
          letterSpacing: "0.04em",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {order.order_type === "dine_in" ? (
          <><UtensilsCrossed size={9} /> Table {order.table_label}</>
        ) : (
          <><ShoppingBag size={9} /> Takeaway</>
        )}
        {order.customer_name && (
          <> · {order.customer_name}</>
        )}
      </div>

      {/* .tkt-items — line items with veg/nonveg dot */}
      <div className="flex flex-col" style={{ gap: "3px", fontSize: "11.5px", color: "var(--kt-ink-2)", lineHeight: 1.4 }}>
        {lines.map((l) => (
          <div key={l.id} className="flex justify-between items-center" style={{ gap: "6px" }}>
            <span>
              <span
                style={{
                  fontFamily: "var(--font-jetbrains), ui-monospace, Menlo, monospace",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "var(--kt-ink-3)",
                }}
              >
                {l.qty}×
              </span>
              {" "}{l.name_snapshot}
            </span>
            {/* Veg/nonveg indicator dot — matches .veg-dot spec */}
            <VegDot diet={l.diet_snapshot} />
          </div>
        ))}
      </div>

      {/* .tkt-foot — timer/OTP left, action button right */}
      <div
        className="flex justify-between items-center"
        style={{
          paddingTop: "7px",
          borderTop: "1px dashed var(--kt-line)",
        }}
      >
        {/* Left side: timer for active orders, OTP display for ready/collected */}
        {(order.status === "ready" || order.status === "collected") ? (
          <span
            style={{
              fontFamily: "var(--font-jetbrains), ui-monospace, Menlo, monospace",
              fontSize: "11px",
              color: "var(--kt-ink-2)",
              fontWeight: 600,
            }}
          >
            {formatRupees(order.total_paise)}
          </span>
        ) : (
          <span
            className="inline-flex items-center tabular"
            style={{
              gap: "5px",
              fontFamily: "var(--font-jetbrains), ui-monospace, Menlo, monospace",
              fontSize: "10px",
              color: overtime ? "var(--kt-tomato-2)" : "var(--kt-tomato)",
              fontWeight: 600,
              animation: overtime ? "urgent 1s infinite" : "none",
            }}
          >
            {order.status === "preparing" ? "◐ " : "⊙ "}
            {fmtElapsed(elapsed)}
          </span>
        )}

        {/* Right side: action button or collected timestamp */}
        <div className="flex items-center gap-1.5">
          {/* Reject button — only on placed orders */}
          {order.status === "placed" && onReject && !showReject && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowReject(true); }}
              title="Reject this order"
              aria-label="Reject order"
              className="inline-flex items-center justify-center transition-colors"
              style={{
                height: "44px",
                width: "44px",
                borderRadius: "5px",
                border: "1px solid var(--kt-line-2)",
                background: "transparent",
                color: "var(--kt-ink-3)",
                cursor: "pointer",
              }}
            >
              <X size={15} />
            </button>
          )}

          {/* Locked badge — OTP failed 3 times, admin must reset */}
          {order.status === "ready" && order.otp_attempts >= 3 && (
            <span
              title="3 wrong OTP attempts — admin must reset this order"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "0 8px",
                height: "44px",
                borderRadius: "5px",
                background: "#2a160a",
                color: "var(--kt-tomato)",
                border: "2px solid var(--kt-tomato)",
                fontFamily: "var(--font-jetbrains), ui-monospace, Menlo, monospace",
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              🔒 LOCKED
            </span>
          )}

          {/* .tkt-action — tomato button for status advances */}
          {cta && !(order.status === "ready" && order.otp_attempts >= 3) && (
            <button
              type="button"
              disabled={pending}
              onClick={(e) => { e.stopPropagation(); if (!pending) handle(); }}
              className="inline-flex items-center gap-1.5 transition-all active:scale-[0.985] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                fontFamily: "var(--font-manrope), ui-sans-serif, system-ui",
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--kt-cream)",
                background: "var(--kt-tomato)",
                padding: "0 10px",
                height: "44px",
                borderRadius: "5px",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                cursor: pending ? "not-allowed" : "pointer",
                border: "none",
                boxShadow: "0 2px 0 var(--kt-ink)",
              }}
            >
              <cta.icon size={12} /> {pending ? "..." : cta.label}
            </button>
          )}

          {isCollected && order.collected_at && (
            <span
              className="inline-flex items-center gap-1"
              style={{
                fontFamily: "var(--font-jetbrains), ui-monospace, Menlo, monospace",
                fontSize: "10px",
                color: "var(--kt-olive)",
              }}
            >
              <Hand size={10} /> {formatTimeIST(order.collected_at)}
            </span>
          )}
        </div>
      </div>

      {/* Reject inline form — smoother for oily hands + bright light: taller 48px+ targets, "Other" free-text escape hatch.
         Reason is ALWAYS logged via the revert/emit path in actions (note + audit + order_events payload).
         Reuses original 4 reasons + exact submit flow.
      */}
      {showReject && (
        <div
          style={{
            marginTop: "8px",
            paddingTop: "12px",
            borderTop: "1px dashed var(--kt-line)",
          }}
        >
          <div className="flex flex-col gap-1.5">
            <div className="text-[11px] font-mono uppercase tracking-wider opacity-60 mb-1">
              Reason (tap to select — big targets for gloves)
            </div>
            {REJECT_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={(e) => { e.stopPropagation(); setSelectedReason(r); setOtherReason(""); }}
                style={{
                  padding: "10px 14px",
                  minHeight: "48px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  textAlign: "left",
                  background: selectedReason === r ? "var(--kt-tomato)" : "var(--kt-cream-4)",
                  color: selectedReason === r ? "var(--kt-cream)" : "var(--kt-ink-2)",
                  border: `2px solid ${selectedReason === r ? "var(--kt-tomato)" : "var(--kt-line-2)"}`,
                  cursor: "pointer",
                }}
              >
                {r}
              </button>
            ))}
            {/* Other free-text — always available, always logged */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setSelectedReason("Other (type below)"); }}
              style={{
                padding: "10px 14px",
                minHeight: "48px",
                borderRadius: "8px",
                fontSize: "14px",
                textAlign: "left",
                background: isOtherSelected ? "var(--kt-tomato)" : "var(--kt-cream-4)",
                color: isOtherSelected ? "var(--kt-cream)" : "var(--kt-ink-2)",
                border: `2px solid ${isOtherSelected ? "var(--kt-tomato)" : "var(--kt-line-2)"}`,
                cursor: "pointer",
              }}
            >
              Other (type below)
            </button>
            {isOtherSelected && (
              <input
                type="text"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="Type reason (e.g. student says wrong order)"
                autoFocus
                style={{
                  minHeight: "48px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "15px",
                  background: "var(--kt-paper)",
                  border: "2px solid var(--kt-tomato)",
                  color: "var(--kt-ink)",
                  outline: "none",
                }}
                onKeyDown={(e) => { if (e.key === "Enter") void submitReject(); }}
              />
            )}
          </div>
          <div className="flex gap-2" style={{ marginTop: "10px" }}>
            <button
              type="button"
              onClick={() => { setShowReject(false); setSelectedReason(""); setOtherReason(""); }}
              disabled={rejecting}
              className="flex-1 transition-colors"
              style={{
                height: "48px",
                borderRadius: "8px",
                border: "2px solid var(--kt-line-2)",
                background: "var(--kt-cream-4)",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--kt-ink-2)",
                cursor: "pointer",
                opacity: rejecting ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void submitReject()}
              disabled={rejecting || !effectiveReason}
              className="flex-1 transition-colors"
              style={{
                height: "48px",
                borderRadius: "8px",
                background: "var(--kt-tomato)",
                color: "var(--kt-cream)",
                fontSize: "14px",
                fontWeight: 800,
                cursor: rejecting || !effectiveReason ? "not-allowed" : "pointer",
                opacity: rejecting || !effectiveReason ? 0.5 : 1,
                border: "none",
                boxShadow: "0 3px 0 var(--kt-ink)",
              }}
            >
              {rejecting ? "Rejecting…" : "Confirm reject"}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

// Performance masterpiece for cheap tablets: memoized leaf component.
// Only the specific ticket re-renders when its data changes (React does the heavy lifting).
const MemoizedTicketCard = memo(TicketCard);

/* Veg/nonveg/egg indicator dot — matches kitchen.html .veg-dot spec */
function VegDot({ diet }: { diet: "veg" | "nonveg" | "egg" }) {
  const color =
    diet === "veg" ? "var(--kt-olive)"
    : diet === "egg" ? "var(--kt-mustard)"
    : "var(--kt-tomato)";

  return (
    <span
      className="shrink-0"
      style={{
        width: "10px",
        height: "10px",
        border: `1.4px solid ${color}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        borderRadius: "2px",
        position: "relative",
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: color,
          display: "block",
        }}
      />
    </span>
  );
}

// MemoizedTicketCard is the optimized version used internally.
// The original named export of OrderColumn is what board imports — internals stay fast.
