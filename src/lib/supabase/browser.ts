"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/db/types";

const cache = new Map<string, ReturnType<typeof create>>();

function create(tenantId: string | null) {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    tenantId ? { global: { headers: { "x-tenant-id": tenantId } } } : undefined
  );
}

/**
 * One Supabase browser client per tenant id. Reading dataset.tenantId every
 * call means a `?tenant=` switch in the same tab still routes to the right
 * client (and RLS), instead of a stale module-cached one.
 */
export function getBrowserClient() {
  const tid =
    typeof document === "undefined"
      ? null
      : document.documentElement.dataset.tenantId ?? null;
  const key = tid ?? "_anon";
  let c = cache.get(key);
  if (!c) {
    c = create(tid);
    cache.set(key, c);
  }
  return c;
}
