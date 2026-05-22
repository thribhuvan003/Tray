"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getBrowserClient } from "@/lib/supabase/browser";

/**
 * Global Realtime listener that surfaces order status changes to the student
 * via toast notifications, no matter which page they're on (menu / orders /
 * track). Subscribes to UPDATE events on the `orders` table filtered by
 * `user_id`, so the student sees a toast the moment the kitchen flips their
 * order to "preparing" or "ready" — even if they're browsing the menu.
 *
 * The component renders nothing; it's mounted once in the student layout.
 *
 * Dedupes on (orderId, status) so the same status change doesn't fire
 * multiple toasts if the underlying row gets updated twice (e.g. status +
 * ready_at fields written separately).
 */
export function OrderReadyListener({
    userId,
    tenantSlug,
}: {
    userId: string | null;
    tenantSlug: string;
}) {
    const router = useRouter();
    const shownRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!userId) return;
        const sb = getBrowserClient();

        const channel = sb
            .channel(`student-orders:${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "orders",
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const row = payload.new as
                        | { id: string; status: string; short_code?: string }
                        | null;
                    if (!row) return;

                    const key = `${row.id}:${row.status}`;
                    if (shownRef.current.has(key)) return;

                    if (row.status === "ready") {
                        shownRef.current.add(key);
                        toast.success(
                            `Order ${row.short_code ?? ""} is ready! Head to the counter.`,
                            {
                                duration: 12000,
                                action: {
                                    label: "View",
                                    onClick: () =>
                                        router.push(`/c/${tenantSlug}/track/${row.id}`),
                                },
                            }
                        );
                    } else if (row.status === "preparing") {
                        shownRef.current.add(key);
                        toast(`Order ${row.short_code ?? ""} is being prepared.`, {
                            duration: 5000,
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            sb.removeChannel(channel);
        };
    }, [userId, tenantSlug, router]);

    return null;
}
