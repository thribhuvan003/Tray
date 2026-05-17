"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/db/types";

let _client: ReturnType<typeof create> | null = null;

function create(tenantId: string | null) {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    tenantId ? { global: { headers: { "x-tenant-id": tenantId } } } : undefined
  );
}

/**
 * Returns a memoised browser Supabase client scoped to the current tenant id.
 * The tenant id is read once from the document's `data-tenant-id` root
 * attribute (set in the root layout) and sent as `x-tenant-id` on every call.
 */
export function getBrowserClient() {
  if (_client) return _client;
  const tid =
    typeof document === "undefined"
      ? null
      : document.documentElement.dataset.tenantId ?? null;
  _client = create(tid);
  return _client;
}
