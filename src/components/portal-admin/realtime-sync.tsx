"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/browser";

/**
 * AdminRealtimeSync ensures the Admin Dashboard is updated live in the background.
 * It subscribes to `order_events` (since `orders` and `order_status_logs` are omitted
 * from publication) and `menu_items` changes, using a 100ms debounce window to prevent
 * excessive re-renders during high-volume bulk orders.
 */
export function AdminRealtimeSync({ tenantId }: { tenantId: string }) {
  const router = useRouter();

  useEffect(() => {
    const sb = getBrowserClient();
    let debounceTimeout: NodeJS.Timeout | null = null;

    const triggerRefresh = () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        router.refresh();
      }, 100);
    };

    const ch = sb
      .channel("admin-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "order_events", filter: `tenant_id=eq.${tenantId}` },
        () => {
          triggerRefresh();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_items", filter: `tenant_id=eq.${tenantId}` },
        () => {
          triggerRefresh();
        }
      )
      .subscribe();

    return () => {
      sb.removeChannel(ch);
      if (debounceTimeout) clearTimeout(debounceTimeout);
    };
  }, [tenantId, router]);

  return null;
}
