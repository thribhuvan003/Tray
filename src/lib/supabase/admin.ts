import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "@/lib/db/types";

/**
 * Service-role client. Bypasses RLS. NEVER use in a user-facing route handler
 * unless every input is server-validated. Reserved for webhooks, scheduled
 * jobs, and trusted server actions.
 */
export function getAdminClient(tenantId?: string) {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY missing — admin client unavailable");
  }
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: tenantId ? { headers: { "x-tenant-id": tenantId } } : undefined,
  });
}
