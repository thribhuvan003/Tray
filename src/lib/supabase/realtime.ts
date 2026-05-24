// src/lib/supabase/realtime.ts
"use client";

import { getBrowserClient } from "@/lib/supabase/browser";

export type RealtimeEvent = "order_updates" | "insight_updates" | "history_updates" | "menu_updates";

/**
 * Subscribe to a tenant‑scoped realtime channel.
 * @param tenantId The UUID of the tenant.
 * @param event Which event you want to listen for.
 * @param handler Callback invoked with the payload when the event fires.
 * @returns Unsubscribe function.
 */
export function subscribeToTenant(
  tenantId: string,
  event: RealtimeEvent,
  handler: (payload: any) => void
): () => void {
  const sb = getBrowserClient();
  const channelName = `admin-${event}`;
  const ch = sb
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: event === "order_updates" ? "orders" : event === "insight_updates" ? "orders" : event === "history_updates" ? "order_status_logs" : "menu_items",
        filter: `tenant_id=eq.${tenantId}`,
      },
      handler
    )
    .subscribe();

  return () => {
    sb.removeChannel(ch);
  };
}
