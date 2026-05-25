"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/browser";
import { formatRupees, formatDateIST, formatTimeIST } from "@/lib/utils";
import { ChefHat, BellRing, HandPlatter, Check, Clock, RefreshCw } from "lucide-react";

type Order = {
  id: string;
  short_code: string;
  status: string;
  total_paise: number;
  placed_at: string;
};

const ACTIVE_STATUSES = new Set(["placed", "preparing", "ready", "partially_ready"]);
const TERMINAL_STATUSES = new Set(["collected", "rejected", "expired", "cancelled_by_kitchen", "refunded", "cancelled_by_student"]);

const STATUS_META: Record<string, { label: string; icon: typeof Clock; color: string; pulse: boolean }> = {
  pending_payment: { label: "Awaiting payment", icon: Clock, color: "text-amber-500", pulse: true },
  placed:          { label: "Order received",   icon: Check,       color: "text-ocean-500",   pulse: true  },
  preparing:       { label: "Preparing",        icon: ChefHat,    color: "text-amber-500",  pulse: true  },
  partially_ready: { label: "Partially ready",  icon: ChefHat,    color: "text-amber-500",  pulse: true  },
  ready:           { label: "Ready for pickup", icon: BellRing,   color: "text-emerald-500", pulse: true  },
  collected:       { label: "Collected",        icon: HandPlatter,color: "text-emerald-600", pulse: false },
  rejected:        { label: "Rejected",         icon: Clock,      color: "text-rose-500",    pulse: false },
  expired:         { label: "Expired",          icon: Clock,      color: "text-rose-500",    pulse: false },
  cancelled_by_kitchen: { label: "Cancelled",   icon: Clock,      color: "text-rose-500",    pulse: false },
  refunded:        { label: "Refunded",         icon: Clock,      color: "text-rose-500",    pulse: false },
};

const PROGRESS: Record<string, number> = {
  placed: 25, preparing: 50, partially_ready: 60, ready: 80, collected: 100,
};

export function StudentOrdersView({
  initialOrders,
  tenantSlug,
  tenantId,
  userId,
}: {
  initialOrders: Order[];
  tenantSlug: string;
  tenantId: string;
  userId: string;
}) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Keep local state in sync if the server passes new data
  // H8: Maintain a ref so the realtime handler always reads the latest orders
  // without creating a stale closure over the initial value.
  const ordersRef = useRef<Order[]>(initialOrders);
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  useEffect(() => {
    setOrders(initialOrders);
    ordersRef.current = initialOrders;
  }, [initialOrders]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 800);
    setLastUpdate(new Date());
  }, [router]);

  // Realtime subscription — listen to order_events for any of the user's active orders
  useEffect(() => {
    if (!userId) return;
    const sb = getBrowserClient();
    let debounce: ReturnType<typeof setTimeout> | null = null;

    // Subscribe to order_events for this tenant — filter client-side by our order IDs
    const ch = sb
      .channel(`student-orders-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "order_events",
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          const ev = payload.new as {
            order_id: string;
            event_type: string;
            payload?: Record<string, unknown>;
          };
          // H8: Use ref instead of stale closure over orders state
          const myOrder = ordersRef.current.find((o) => o.id === ev.order_id);
          if (!myOrder) return;

          // Map event_type → new status
          const statusFromEvent: Record<string, string> = {
            placed: "placed",
            preparing: "preparing",
            ready: "ready",
            collected: "collected",
            rejected: "rejected",
            expired: "expired",
            cancelled_by_student: "cancelled_by_student",
            cancelled_by_kitchen: "cancelled_by_kitchen",
            refunded: "refunded",
          };
          let newStatus =
            ev.event_type === "status_changed"
              ? (ev.payload?.to as string)
              : statusFromEvent[ev.event_type];

          if (newStatus) {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === ev.order_id ? { ...o, status: newStatus! } : o
              )
            );
            setLastUpdate(new Date());
          }

          // Debounced server refresh to pick up any new orders too
          if (debounce) clearTimeout(debounce);
          debounce = setTimeout(() => router.refresh(), 1200);
        }
      )
      .subscribe();

    return () => {
      sb.removeChannel(ch);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, userId, router]);

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.has(o.status) || o.status === "pending_payment");
  const pastOrders = orders.filter((o) => !ACTIVE_STATUSES.has(o.status) && o.status !== "pending_payment");

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-8 pb-20">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-display text-[clamp(32px,5.5vw,48px)] font-medium tracking-tight leading-none">
            Your <span className="italic text-ocean-500">orders.</span>
          </h1>
          <p className="text-[13px] text-[color:var(--color-ink)]/55 mt-1.5">
            {activeOrders.length > 0
              ? `${activeOrders.length} active order${activeOrders.length > 1 ? "s" : ""} · updates live`
              : "All caught up · tap any order for details"}
          </p>
        </div>
        <button
          onClick={refresh}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-[color:var(--color-line)] text-[11px] font-mono text-[color:var(--color-ink)]/60 hover:border-ocean-500/40 hover:text-ocean-500 transition-colors"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          {lastUpdate ? lastUpdate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "Refresh"}
        </button>
      </div>

      {/* ── ACTIVE ORDERS QUEUE ── */}
      {activeOrders.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ocean-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-ocean-500" />
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-ocean-500">
              Active orders · live
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {activeOrders.map((o) => {
              const meta = STATUS_META[o.status] ?? STATUS_META.placed;
              const Icon = meta.icon;
              const progress = PROGRESS[o.status] ?? 25;
              const href =
                o.status === "pending_payment"
                  ? `/c/${tenantSlug}/pay/${o.id}`
                  : `/c/${tenantSlug}/track/${o.id}`;

              return (
                <Link
                  key={o.id}
                  href={href}
                  className="block rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-paper)] overflow-hidden hover:border-ocean-500/40 transition-all active:scale-[0.99] shadow-sm hover:shadow-md"
                >
                  {/* Progress bar */}
                  <div className="h-0.5 bg-[color:var(--color-line)] w-full">
                    <div
                      className="h-full bg-ocean-500 transition-all duration-700 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`h-11 w-11 shrink-0 rounded-xl bg-ocean-50 dark:bg-ocean-500/10 inline-flex items-center justify-center ${meta.pulse ? "animate-pulse" : ""}`}
                        >
                          <Icon size={20} className={meta.color} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[15px] font-semibold tabular text-[color:var(--color-ink)]">
                            {o.short_code}
                          </div>
                          <div className="text-[12px] font-mono text-[color:var(--color-ink)]/50 mt-0.5">
                            {formatTimeIST(o.placed_at)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[15px] font-bold tabular text-[color:var(--color-ink)]">
                          {formatRupees(o.total_paise)}
                        </div>
                        <span
                          className={`inline-block mt-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            o.status === "ready"
                              ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                              : o.status === "preparing" || o.status === "partially_ready"
                              ? "bg-amber-500/15 text-amber-600 border border-amber-500/30"
                              : "bg-ocean-500/15 text-ocean-700 border border-ocean-500/30"
                          }`}
                        >
                          {meta.label}
                        </span>
                      </div>
                    </div>
                    {o.status === "ready" && (
                      <div className="mt-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-[12px] text-emerald-700 font-medium">
                        🔔 Your order is ready! Tap to get your pickup code.
                      </div>
                    )}
                    {o.status === "pending_payment" && (
                      <div className="mt-3 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-[12px] text-amber-700 font-medium">
                        💳 Payment pending · tap to complete payment
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── PAST ORDERS ── */}
      {pastOrders.length > 0 && (
        <section>
          {activeOrders.length > 0 && (
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[color:var(--color-ink)]/45 mb-3">
              Past orders
            </div>
          )}
          <ul className="flex flex-col gap-2">
            {pastOrders.map((o) => {
              const meta = STATUS_META[o.status] ?? { label: o.status, color: "text-[color:var(--color-ink)]/60", pulse: false };
              const isGood = o.status === "collected";
              return (
                <li key={o.id}>
                  <Link
                    href={`/c/${tenantSlug}/track/${o.id}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-paper)] p-4 hover:border-ocean-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-[color:var(--color-line)]/30 text-[color:var(--color-ink)]/50 inline-flex items-center justify-center font-mono text-[10px] font-bold">
                        {o.short_code.replace(/^T-/, "").slice(-3)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-medium truncate text-[color:var(--color-ink)]">
                          {o.short_code}
                        </div>
                        <div className="text-[11px] font-mono text-[color:var(--color-ink)]/45 truncate">
                          {formatDateIST(o.placed_at)} · {formatTimeIST(o.placed_at)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13.5px] font-semibold tabular text-[color:var(--color-ink)]">
                        {formatRupees(o.total_paise)}
                      </div>
                      <span
                        className={`inline-block mt-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isGood
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-rose-500/10 text-rose-500"
                        }`}
                      >
                        {meta.label}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Empty state */}
      {orders.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-[color:var(--color-line)] p-12 text-center">
          <p className="text-[15px] text-[color:var(--color-ink)]/55">No orders yet.</p>
          <Link
            href={`/c/${tenantSlug}/menu`}
            className="mt-4 inline-flex items-center gap-1.5 h-11 px-5 rounded-full bg-ocean-500 text-black text-[13px] font-medium hover:bg-ocean-600 transition-colors"
          >
            Browse the menu →
          </Link>
        </div>
      )}
    </div>
  );
}
