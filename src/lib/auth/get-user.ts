import "server-only";
import { cache } from "react";
import { getServerClient } from "@/lib/supabase/server";
import { resolveTenant, getTenantSlugFromHeaders } from "@/lib/tenant";
import { headers } from "next/headers";
import type { MemberRole } from "@/lib/db/types";

import { getAdminClient } from "@/lib/supabase/admin";

import { unstable_cache } from "next/cache";

export type CurrentUser = {
  id: string;
  email: string | null;
  tenantId: string;
  tenantSlug: string;
  role: MemberRole | null;
  displayName: string | null;
};

const fetchUserRoleCached = (userId: string, tenantId: string) => unstable_cache(
  async () => {
    const admin = getAdminClient(tenantId);
    const { data: m, error: memError } = await admin
      .from("tenant_memberships")
      .select("role, display_name")
      .eq("user_id", userId)
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .maybeSingle<{ role: MemberRole; display_name: string | null }>();

    if (process.env.NODE_ENV === "development") {
      console.log("[fetchUserRoleCached] MEMBERSHIP FOUND:", m?.role ?? null, "ERROR:", memError?.message);
    }

    let role: MemberRole | null = m?.role ?? null;
    let displayName: string | null = m?.display_name ?? null;

    if (!role) {
      const { data: tenantData } = await admin
        .from("tenants")
        .select("college_id")
        .eq("id", tenantId)
        .maybeSingle<{ college_id: string | null }>();

      if (tenantData?.college_id) {
        const { data: cm } = await admin
          .from("college_memberships")
          .select("is_active")
          .eq("user_id", userId)
          .eq("college_id", tenantData.college_id)
          .eq("is_active", true)
          .limit(1)
          .maybeSingle();

        if (cm) {
          role = "canteen_admin";
          displayName = "College Admin";
        }
      }
    }

    return { role, displayName };
  },
  ["user-tenant-role", userId, tenantId],
  { revalidate: 300, tags: ["user-role"] }
)();

export const getCurrentUser = cache(async (tenantIdOverride?: string): Promise<CurrentUser | null> => {
  const h = await headers();
  let tenant;
  if (tenantIdOverride) {
    const admin = getAdminClient(tenantIdOverride);
    const { data: t } = await admin.from("tenants").select("slug, name").eq("id", tenantIdOverride).single();
    if (!t) return null;
    tenant = { id: tenantIdOverride, slug: t.slug, name: t.name };
  } else {
    const slug = getTenantSlugFromHeaders(h);
    tenant = await resolveTenant(slug);
  }
  
  if (process.env.NODE_ENV === "development") {
    console.log("[getCurrentUser] RESOLVED SLUG:", tenant?.slug, "TENANT FOUND:", !!tenant);
  }
  if (!tenant) return null;

  const supabase = await getServerClient(tenant.id);
  const { data, error: userError } = await supabase.auth.getUser();
  if (process.env.NODE_ENV === "development") {
    console.log("[getCurrentUser] USER RESOLVED:", data?.user?.email ? "[redacted]" : null, "ERROR:", userError?.message);
  }
  if (!data.user) return null;

  const { role, displayName } = await fetchUserRoleCached(data.user.id, tenant.id);

  // Fallback for displayName if not set in membership
  const finalDisplayName = displayName || data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Staff";

  return {
    id: data.user.id,
    email: data.user.email ?? null,
    tenantId: tenant.id,
    tenantSlug: tenant.slug,
    role,
    displayName: finalDisplayName,
  };
});


export async function requireRole(roles: MemberRole[], tenantIdOverride?: string) {
  const u = await getCurrentUser(tenantIdOverride);
  if (!u || !u.role || !roles.includes(u.role)) {
    return null;
  }
  return u;
}
