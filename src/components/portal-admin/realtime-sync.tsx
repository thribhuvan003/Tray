"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/browser";

export function AdminRealtimeSync({ tenantId }: { tenantId: string }) {
  const router = useRouter();

  useEffect(() => {
    const sb = getBrowserClient();
    const ch = sb
      .channel("admin-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `tenant_id=eq.${tenantId}` },
        () => {
          router.refresh();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_items", filter: `tenant_id=eq.${tenantId}` },
        () => {
          router.refresh();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_status_logs", filter: `tenant_id=eq.${tenantId}` },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      sb.removeChannel(ch);
    };
  }, [tenantId, router]);

  return null;
}
