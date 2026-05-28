import "server-only";
import { cache } from "react";
import { getServerClient } from "@/lib/supabase/server";
import { resolveTenant } from "@/lib/tenant";
import { headers } from "next/headers";
import type { MemberRole } from "@/lib/db/types";

export type CurrentUser = {
  id: string;
  email: string | null;
  tenantId: string;
  tenantSlug: string;
  role: MemberRole | null;
  displayName: string | null;
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const h = await headers();
  const slug = h.get("x-tenant-slug") ?? "";
  const tenant = slug ? await resolveTenant(slug) : null;
  if (!tenant) return null;

  const supabase = await getServerClient(tenant.id);
  // Use getSession() instead of getUser() — getUser() makes a network round-trip
  // to Supabase's auth API on every server render which can time out and return
  // null even with a valid session, causing the admin layout to redirect to login
  // mid-session. getSession() reads the JWT from cookies locally and auto-refreshes
  // via the refresh token without a blocking network call.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  const user = session.user;

  const { data: m } = await supabase
    .from("tenant_memberships")
    .select("role, display_name")
    .eq("user_id", user.id)
    .eq("tenant_id", tenant.id)
    .eq("is_active", true)
    .maybeSingle<{ role: MemberRole; display_name: string | null }>();

  return {
    id: user.id,
    email: user.email ?? null,
    tenantId: tenant.id,
    tenantSlug: tenant.slug,
    role: m?.role ?? null,
    displayName: m?.display_name ?? null,
  };
});

export async function requireRole(roles: MemberRole[]) {
  const u = await getCurrentUser();
  if (!u || !u.role || !roles.includes(u.role)) {
    return null;
  }
  return u;
}
