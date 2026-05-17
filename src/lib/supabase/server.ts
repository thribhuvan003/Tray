import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { env } from "@/lib/env";
import type { Database } from "@/lib/db/types";

const TENANT_HEADER = "x-tenant-id";

/**
 * Creates a Supabase server client bound to the current request's cookies and
 * the resolved tenant id. The tenant id is sent as `x-tenant-id` on every
 * PostgREST request; a Postgres `pre_request` hook reads it and sets
 * `app.current_tenant`, which RLS policies key off of.
 */
export async function getServerClient(tenantId?: string | null) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const tid = tenantId ?? headerStore.get(TENANT_HEADER);

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(set: { name: string; value: string; options: CookieOptions }[]) {
          try {
            for (const { name, value, options } of set) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component — cookies are read-only.
          }
        },
      },
      global: tid ? { headers: { [TENANT_HEADER]: tid } } : undefined,
    }
  );
}
