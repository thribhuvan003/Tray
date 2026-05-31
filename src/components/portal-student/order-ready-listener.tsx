"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getBrowserClient } from "@/lib/supabase/browser";

/**
 * Global Realtime listener that surfaces order status changes to the student
 * via toast notifications, no matter which page they're on (menu / orders /
 * track). Subscribes to INSERT events on the `order_events` table filtered by
 * `tenant_id`, so the student sees a toast the moment the kitchen flips their
 * order to "preparing" or "ready" — even if they're browsing the menu.
 */
export function OrderReadyListener({
  userId,
  tenantSlug,
  tenantId,
}: {
  userId: string | null;
  tenantSlug: string;
  tenantId: string;
}) {
  const router = useRouter();
  const shownRef = useRef<Set<string>>(new Set());
  const [activeOrders, setActiveOrders] = useState<Record<string, string>>({}); // orderId -> shortCode

  // Stable ref to keep track of activeOrders to avoid subscription churn
  const activeOrdersRef = useRef<Record<string, string>>({});
  useEffect(() => {
    activeOrdersRef.current = activeOrders;
  }, [activeOrders]);

  // 1. Fetch the student's active orders on mount
  useEffect(() => {
    if (!userId) return;
    const uid = userId;
    const sb = getBrowserClient();
    let isMounted = true;

    async function loadActiveOrders() {
      try {
        const { data, error } = await sb
          .from("orders")
          .select("id, short_code")
          .eq("user_id", uid)
          .in("status", ["pending_payment", "placed", "preparing", "ready"]);
        if (!error && data && isMounted) {
          const mapping: Record<string, string> = {};
          (data as { id: string; short_code: string }[]).forEach((o) => {
            mapping[o.id] = o.short_code;
          });
          setActiveOrders(mapping);
        }
      } catch {
        // Non-fatal — toast notifications degrade gracefully without active order list
      }
    }

    void loadActiveOrders();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    const sb = getBrowserClient();
    const activeChannels: ReturnType<typeof sb.channel>[] = [];

    // 2. Subscribe to order_events updates if logged in
    if (userId) {
      const orderCh = sb
        .channel(`student-tenant-events:${tenantId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "order_events",
            filter: `tenant_id=eq.${tenantId}`,
          },
          (payload) => {
            const row = payload.new as {
              order_id: string;
              event_type: string;
              payload?: Record<string, unknown>;
            } | null;
            if (!row) return;

            const orderId = row.order_id;

            // Check if this event belongs to one of our active orders
            const shortCode = activeOrdersRef.current[orderId];
            if (!shortCode) return; // Not our order

            const eventType = row.event_type;
            const status =
              eventType === "status_changed"
                ? (row.payload?.to as string)
                : eventType;
            const key = `${orderId}:${status}`;
            if (shownRef.current.has(key)) return;

            if (status === "placed") {
              shownRef.current.add(key);
              toast.success(`Order ${shortCode ?? ""} has been placed!`, {
                duration: 8000,
                action: {
                  label: "Track",
                  onClick: () =>
                    router.push(`/c/${tenantSlug}/track/${orderId}`),
                },
              });
              router.refresh();
            } else if (status === "ready") {
              shownRef.current.add(key);
              toast.success(
                `Order ${shortCode ?? ""} is ready! Head to the counter.`,
                {
                  duration: 12000,
                  action: {
                    label: "View",
                    onClick: () =>
                      router.push(`/c/${tenantSlug}/track/${orderId}`),
                  },
                }
              );
              setActiveOrders((prev) => {
                const next = { ...prev };
                delete next[orderId];
                return next;
              });
              router.refresh();
            } else if (status === "preparing") {
              shownRef.current.add(key);
              toast(`Order ${shortCode ?? ""} is being prepared.`, {
                duration: 5000,
              });
              router.refresh();
            } else if (
              [
                "collected",
                "rejected",
                "expired",
                "cancelled_by_student",
                "refunded",
              ].includes(status)
            ) {
              shownRef.current.add(key);
              setActiveOrders((prev) => {
                const next = { ...prev };
                delete next[orderId];
                return next;
              });
              router.refresh();
            }
          }
        )
        .subscribe();
      activeChannels.push(orderCh);
    }

    // 3. Cross-canteen order status subscription (scenario 60).
    // The order_events subscription above only covers the current canteen (filtered by tenant_id).
    // A student with an order at Canteen B while viewing Canteen A would miss the "Ready" toast.
    // This second channel subscribes to the orders table filtered by user_id — catches ALL
    // status transitions across every canteen the student has ever ordered from.
    if (userId) {
      const crossCanteenCh = sb
        .channel(`student-orders-cross:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const updated = payload.new as {
              id: string;
              status: string;
              tenant_id?: string;
            } | null;
            if (!updated) return;

            // Only handle cross-canteen orders (same tenant is already covered above)
            if (updated.tenant_id === tenantId) return;

            const orderId = updated.id;
            const shortCode = activeOrdersRef.current[orderId];
            if (!shortCode) return; // Not a tracked active order

            const key = `${orderId}:${updated.status}:cross`;
            if (shownRef.current.has(key)) return;

            if (updated.status === "ready") {
              shownRef.current.add(key);
              toast.success(`Order ${shortCode} is ready at another counter! Head there now.`, {
                duration: 12000,
                action: {
                  label: "View",
                  onClick: () => router.push(`/orders`),
                },
              });
            } else if (updated.status === "preparing") {
              shownRef.current.add(key);
              toast(`Order ${shortCode} is being prepared at another counter.`, { duration: 5000 });
            } else if (
              ["collected", "rejected", "expired", "cancelled_by_student", "refunded"].includes(
                updated.status
              )
            ) {
              shownRef.current.add(key);
              setActiveOrders((prev) => {
                const next = { ...prev };
                delete next[orderId];
                return next;
              });
            }

            router.refresh();
          }
        )
        .subscribe();
      activeChannels.push(crossCanteenCh);
    }

    // 4. Current-canteen status subscription (open/close, pause, UPI changes).
    // Filtered to the student's current tenant only — an unfiltered "global-tenants"
    // channel was firing router.refresh() for EVERY canteen change across the
    // entire platform, causing a refresh storm at VIT with 10+ canteens.
    const tenantsCh = sb
      .channel(`tenant-status:${tenantId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tenants",
          filter: `id=eq.${tenantId}`,
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();
    activeChannels.push(tenantsCh);

    // 4. Fallback client-side polling: refreshes page data every 15 seconds
    const pollInterval = setInterval(() => {
      router.refresh();
    }, 15000);

    return () => {
      clearInterval(pollInterval);
      activeChannels.forEach((ch) => {
        sb.removeChannel(ch);
      });
    };
  }, [userId, tenantSlug, tenantId, router]);

  return null;
}
