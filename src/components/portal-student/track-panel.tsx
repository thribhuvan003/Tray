"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChefHat, BellRing, HandPlatter, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { formatRupees, formatTimeIST, cn } from "@/lib/utils";
import { getBrowserClient } from "@/lib/supabase/browser";
import { getMyOrderOtp, cancelOrderByStudent } from "@/app/(student)/_actions";

type Status =
  | "pending_payment"
  | "placed"
  | "preparing"
  | "ready"
  | "collected"
  | "rejected"
  | "expired"
  | "cancelled_by_kitchen"
  | "partially_ready"
  | "refunded";
type Order = {
  id: string;
  short_code: string;
  status: Status;
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
  name_snapshot: string;
  qty: number;
  diet_snapshot: "veg" | "nonveg" | "egg";
  price_paise_snapshot: number;
};

const STEPS: { v: Status; label: string; icon: typeof Check; copy: string }[] = [
  { v: "placed", label: "Placed", icon: Check, copy: "We've got your order!" },
  { v: "preparing", label: "Preparing", icon: ChefHat, copy: "The kitchen is on it." },
  { v: "ready", label: "Ready", icon: BellRing, copy: "Your order is ready!" },
  { v: "collected", label: "Collected", icon: HandPlatter, copy: "Enjoy. ☕" },
];

const FIVE_MIN_MS = 5 * 60 * 1000;

export function TrackPanel({ tenantSlug, tenantName, order: initial, lines }: { tenantSlug: string; tenantName: string; order: Order; lines: Line[] }) {
  const [order, setOrder] = useState(initial);
  const [otp, setOtp] = useState<string | null>(null);
  const [cancelPending, startCancel] = useTransition();
  const [cancelError, setCancelError] = useState<string | null>(null);
  const router = useRouter();

  // Keep local state in sync if the server-fetched order changes
  // (router.refresh() will re-run the page and pass a fresh `initial`).
  useEffect(() => {
    setOrder(initial);
  }, [initial]);

  // Direct Supabase database polling fallback for instant, robust status updates
  useEffect(() => {
    if (order.status === "collected" || order.status === "rejected" || order.status === "expired") return;

    const sb = getBrowserClient();
    const interval = setInterval(async () => {
      const { data, error } = await sb
        .from("orders")
        .select("status, ready_at, collected_at")
        .eq("id", order.id)
        .maybeSingle();

      const orderRef = data as { status: string; ready_at: string | null; collected_at: string | null } | null;

      if (orderRef && orderRef.status !== order.status) {
        setOrder((prev) => ({
          ...prev,
          status: orderRef.status as Status,
          ready_at: orderRef.ready_at,
          collected_at: orderRef.collected_at,
        }));
      }
    }, 15000); // Relaxed fallback to conserve database CPU resources

    return () => clearInterval(interval);
  }, [order.id, order.status]);

  useEffect(() => {
    const sb = getBrowserClient();
    const ch = sb
      .channel(`order-${order.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "order_events", filter: `order_id=eq.${order.id}` },
        (payload) => {
          console.log("Instant order event sync received:", payload);
          const newRow = payload.new as { event_type: string; payload?: Record<string, unknown> } | null;
          if (newRow) {
            let nextStatus: Status | null = null;
            if (newRow.event_type === "status_changed") {
              nextStatus = newRow.payload?.to as Status;
            } else if (
              [
                "placed",
                "preparing",
                "ready",
                "collected",
                "rejected",
                "expired",
                "cancelled_by_student",
                "refunded"
              ].includes(newRow.event_type)
            ) {
              nextStatus = newRow.event_type as Status;
            }

            if (nextStatus) {
              setOrder((prev) => ({
                ...prev,
                status: nextStatus!,
                ready_at: nextStatus === "ready" ? new Date().toISOString() : prev.ready_at,
                collected_at: nextStatus === "collected" ? new Date().toISOString() : prev.collected_at,
              }));
            }
          }
          // order_events is the source of truth signal; refetch the order
          // server-side via the existing page loader in the background.
          router.refresh();
        }
      )
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, [order.id, router]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [router]);

  useEffect(() => {
    if (order.status === "ready") {
      getMyOrderOtp(order.id).then((r) => setOtp(r.otp));
    } else {
      setOtp(null);
    }
  }, [order.status, order.id]);

  // Student-initiated cancel: only available while still `placed` and within
  // the 5-minute grace window (server re-checks this; UI is best-effort).
  const placedAtMs = useMemo(() => new Date(order.placed_at).getTime(), [order.placed_at]);
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    if (order.status !== "placed") return;
    const t = window.setInterval(() => setNow(Date.now()), 5_000);
    return () => window.clearInterval(t);
  }, [order.status]);
  const cancelWindowOpen = order.status === "placed" && now - placedAtMs < FIVE_MIN_MS;

  if (order.status === "rejected" || order.status === "expired") {
    const isUncollected = order.status === "expired" && order.ready_at !== null;
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 pt-12 pb-20 text-center">
        <XCircle size={56} className="mx-auto text-rose-500 mb-4" />
        <h1 className="font-display text-[36px] font-medium tracking-tight">
          {isUncollected
            ? "Collection window expired."
            : order.status === "expired"
            ? "Payment expired."
            : "Order rejected."}
        </h1>
        <p className="text-[14px] text-[color:var(--color-ink)]/65 mt-2">
          {isUncollected
            ? "Your order was ready for pickup but was not collected within the 30-minute window. Please contact canteen staff if you believe this is an error."
            : order.status === "expired"
            ? "We didn't see the UPI payment in time. No money was charged."
            : "The canteen couldn't accept this order. If you paid, a refund is on its way."}
        </p>
        <Link
          href={`/c/${tenantSlug}/menu`}
          className="mt-6 inline-flex items-center gap-1.5 h-11 px-5 rounded-full bg-ocean-500 text-black text-[13px] font-medium hover:bg-ocean-600 transition-colors"
        >
          Try another order
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === "cancelled_by_kitchen" || order.status === "refunded";
  const isPartiallyReady = order.status === "partially_ready";
  // Map partially_ready onto the "preparing" step so the progress stepper
  // renders correctly; it will also show a dedicated banner below.
  const effectiveStatus: Status = isPartiallyReady ? "preparing" : order.status;
  const currentIdx = Math.max(0, STEPS.findIndex((s) => s.v === effectiveStatus));
  const isReady = order.status === "ready";
  const isCollected = order.status === "collected";
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-6 pb-12 pb-[max(3rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/c/${tenantSlug}/menu`}
          className="inline-flex items-center gap-1.5 text-[13px] text-[color:var(--color-ink)]/60 hover:text-ocean-500"
        >
          <ArrowLeft size={14} /> Menu
        </Link>
        <span className="text-[color:var(--color-line-strong)]">·</span>
        <Link
          href={`/c/${tenantSlug}/orders`}
          className="inline-flex items-center gap-1.5 text-[13px] text-[color:var(--color-ink)]/60 hover:text-ocean-500"
        >
          All orders
        </Link>
      </div>

      {isReady ? (
        /* ====================================================================
           READY FOR PICKUP VIEW (matches student_mobile_otp_delivered.png)
           ==================================================================== */
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="mb-8 text-center">
            <h1 className="font-display text-[clamp(32px,5vw,42px)] font-medium tracking-tight leading-tight mb-2">
              Ready for <span className="italic text-ocean-500">pickup.</span>
            </h1>
            <p className="text-[14.5px] text-[color:var(--color-ink)]/60">
              Show this 4-digit code at the counter to verify your order.
            </p>
          </div>

          {otp ? (
            <div
              onClick={() => {
                navigator.clipboard.writeText(otp).catch(() => null);
                toast.success("Code copied!");
              }}
              className="otp-display select-none mx-auto max-w-md"
              title="Click to copy pickup code"
            >
              <p className="otp-label">Pickup code</p>
              <div className="otp-digits">
                {otp.split("").map((digit, i) => (
                  <span key={i} className="otp-digit">
                    {digit}
                  </span>
                ))}
              </div>
              <p className="otp-hint">Show this code at the counter. Tap to copy.</p>
            </div>
          ) : (
            <div className="mx-auto max-w-md rounded-3xl border border-amber-500/30 bg-amber-500/5 p-5 text-[13px] text-[color:var(--color-ink)]/70 flex items-center justify-center gap-3">
              <span className="animate-spin inline-block h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full shrink-0" />
              <span>Your order is ready — fetching your pickup code…</span>
            </div>
          )}

          <div className="text-center font-mono text-[13px] text-[color:var(--color-ink)]/50 my-6">
            {order.short_code}
          </div>

          <div className="mx-auto max-w-md mt-6">
            <Link
              href={`/c/${tenantSlug}/menu`}
              className="w-full h-12 text-[15px] inline-flex items-center justify-center rounded-xl bg-ocean-500 text-black font-bold hover:bg-ocean-600 transition-all active:scale-[0.98] shadow-sm"
            >
              ← Back to menu
            </Link>
          </div>
        </div>
      ) : (
        /* ====================================================================
           PREPARING / TRACKING VIEW (matches student_mobile_paying_loader.png)
           ==================================================================== */
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="mb-6">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/55">
              {tenantName} · {order.short_code}
            </div>
            <h1 className="font-display text-[clamp(28px,5vw,40px)] font-medium tracking-tight leading-tight mt-1">
              Order <span className="italic text-ocean-500">status.</span>
            </h1>
            <p className="text-[13.5px] text-[color:var(--color-ink)]/65 mt-1.5 font-medium">
              {isCancelled ? "Your order was cancelled." : "We're preparing your food."}
            </p>
          </div>

          {isCancelled && (
            <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-display text-[18px] font-medium tracking-tight text-[color:var(--color-ink)]">
                  Your order was cancelled.
                </div>
                <p className="text-[13.5px] text-[color:var(--color-ink)]/70 mt-1">
                  {order.status === "refunded"
                    ? "Refund has been completed. It should reflect in your UPI app within 3–5 business days."
                    : "Refund has been initiated. It should reflect in your UPI app within 3–5 business days."}
                </p>
              </div>
            </div>
          )}

          {!isCancelled && (
            <div className="success-note">
              Order confirmed. We&rsquo;ve got your order!
            </div>
          )}

          {!isCancelled && !isCollected && (
            <div className="pickup-ribbon">
              <span className="pickup-ribbon__eta">
                {order.order_type === "dine_in" ? "~6 min" : "~4 min"}
              </span>
              <span className="pickup-ribbon__text">
                {order.order_type === "dine_in"
                  ? (order.table_label
                      ? `We'll bring your order to table ${order.table_label} when ready.`
                      : "Find a seat — we'll call your table.")
                  : "Walk to the pickup counter when status hits ready."}
              </span>
            </div>
          )}

          {!isCancelled && (
            <div className="progress-bar my-6">
              <div
                className="progress-bar__fill"
                style={{
                  width:
                    effectiveStatus === "placed"
                      ? "25%"
                      : effectiveStatus === "preparing"
                      ? "50%"
                      : effectiveStatus === "ready"
                      ? "75%"
                      : "100%",
                }}
              />
            </div>
          )}

          {isPartiallyReady && (
            <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-[13.5px] font-medium text-[color:var(--color-ink)]">Some items still preparing</div>
                <p className="text-[12px] text-[color:var(--color-ink)]/65 mt-0.5">
                  Part of your order is almost ready — the kitchen will call you when everything&rsquo;s done.
                </p>
              </div>
            </div>
          )}

          {!isCancelled && (
            <ol className="track-steps mb-8">
              {STEPS.map((s, i) => {
                const done = i < currentIdx || isCollected;
                const active = i === currentIdx && !isCollected;
                const Icon = s.icon;
                
                // Dynamic description matching screenshots
                let stepCopy = s.copy;
                if (s.v === "placed") {
                  stepCopy = done ? `Order confirmed · ${formatTimeIST(order.placed_at)}` : "Waiting for kitchen to accept";
                } else if (s.v === "preparing") {
                  stepCopy = done ? "Prepared by kitchen" : active ? "Collect at the pickup counter" : "Waiting to start";
                } else if (s.v === "ready") {
                  stepCopy = done ? "Ready for pickup" : active ? `Otp: ${otp || "—"}` : "Otp: —";
                } else if (s.v === "collected") {
                  stepCopy = "Handed over";
                }

                return (
                  <li
                    key={s.v}
                    className={cn(
                      "track-step",
                      done ? "is-done" : active ? "is-current" : "is-pending"
                    )}
                  >
                    <div className="track-dot">
                      {done ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Icon size={14} className={cn(active ? "text-ocean-500" : "text-graphite-400")} />
                      )}
                    </div>
                    <div className="track-step__body">
                      <h4 className={cn("text-[16px] font-semibold", active ? "text-ocean-500" : "text-[color:var(--color-ink)]")}>
                        {s.label}
                      </h4>
                      <p className="text-[13.5px] text-[color:var(--color-ink)]/55">
                        {stepCopy}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {cancelWindowOpen && (
            <div className="rounded-2xl border border-[color:var(--color-line)] p-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-[13.5px] font-medium">Changed your mind?</div>
                <p className="text-[12px] text-[color:var(--color-ink)]/55">
                  You can cancel for a full refund within 5 minutes of placing.
                </p>
                {cancelError && (
                  <p className="text-[12px] text-rose-500 mt-1">{cancelError}</p>
                )}
              </div>
              <button
                type="button"
                disabled={cancelPending}
                onClick={() => {
                  setCancelError(null);
                  startCancel(async () => {
                    const res = await cancelOrderByStudent(order.id);
                    if (!res.ok) {
                      setCancelError(res.error ?? "Could not cancel");
                      return;
                    }
                    router.refresh();
                  });
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-rose-500/40 text-rose-600 text-[13px] font-medium hover:bg-rose-500/10 transition-colors",
                  cancelPending && "opacity-60 cursor-not-allowed"
                )}
              >
                {cancelPending ? "Cancelling…" : "Cancel order"}
              </button>
            </div>
          )}

          <div className="rounded-2xl border border-[color:var(--color-line)] p-5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/55 mb-3">
              You ordered
            </div>
            <ul className="flex flex-col gap-2">
              {lines.map((l) => (
                <li key={l.id} className="flex items-center gap-3 text-[14px]">
                  <span
                    className={cn(
                      "h-3.5 w-3.5 inline-flex items-center justify-center border-2 rounded-sm",
                      l.diet_snapshot === "veg"
                        ? "border-emerald-500"
                        : l.diet_snapshot === "egg"
                        ? "border-amber-500"
                        : "border-rose-500"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        l.diet_snapshot === "veg"
                          ? "bg-emerald-500"
                          : l.diet_snapshot === "egg"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      )}
                    />
                  </span>
                  <span className="flex-1 min-w-0 truncate">
                    {l.qty} × {l.name_snapshot}
                  </span>
                  <span className="tabular text-[color:var(--color-ink)]/70">
                    {formatRupees(l.qty * l.price_paise_snapshot)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-[color:var(--color-line)] flex justify-between items-baseline">
              <span className="text-[12px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/55">
                {isCancelled ? "Refund amount" : "Total paid"}
              </span>
              <span className="font-display text-[20px] font-medium tabular">{formatRupees(order.total_paise)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
