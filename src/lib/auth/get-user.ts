import "server-only";
import { cache } from "react";
import { getServerClient } from "@/lib/supabase/server";
import { resolveTenant, getTenantSlugFromHeaders } from "@/lib/tenant";
import { headers } from "next/headers";
import type { MemberRole } from "@/lib/db/types";

import { getAdminClient } from "@/lib/supabase/admin";

export type CurrentUser = {
  id: string;
  email: string | null;
  tenantId: string;
  tenantSlug: string;
  role: MemberRole | null;
  displayName: string | null;
};

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
  
  console.log("[getCurrentUser] RESOLVED SLUG:", tenant?.slug, "TENANT FOUND:", !!tenant);
  if (!tenant) return null;

  const supabase = await getServerClient(tenant.id);
  const { data, error: userError } = await supabase.auth.getUser();
  console.log("[getCurrentUser] USER RESOLVED:", data?.user?.email, "ERROR:", userError?.message);
  if (!data.user) return null;

  const { data: m, error: memError } = await supabase
    .from("tenant_memberships")
    .select("role, display_name")
    .eq("user_id", data.user.id)
    .eq("tenant_id", tenant.id)
    .eq("is_active", true)
    .maybeSingle<{ role: MemberRole; display_name: string | null }>();

  console.log("[getCurrentUser] MEMBERSHIP FOUND:", m, "ERROR:", memError?.message);

  let role: MemberRole | null = m?.role ?? null;
  let displayName: string | null = m?.display_name ?? null;

  if (!role) {
    const { data: tenantData } = await supabase
      .from("tenants")
      .select("college_id")
      .eq("id", tenant.id)
      .maybeSingle<{ college_id: string | null }>();

    if (tenantData?.college_id) {
      const { data: cm } = await supabase
        .from("college_memberships")
        .select("is_active")
        .eq("user_id", data.user.id)
        .eq("college_id", tenantData.college_id)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (cm) {
        role = "canteen_admin";
        displayName = data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "College Admin";
      }
    }
  }

  return {
    id: data.user.id,
    email: data.user.email ?? null,
    tenantId: tenant.id,
    tenantSlug: tenant.slug,
    role,
    displayName,
  };
});

export async function requireRole(roles: MemberRole[], tenantIdOverride?: string) {
  const u = await getCurrentUser(tenantIdOverride);
  if (!u || !u.role || !roles.includes(u.role)) {
    return null;
  }
  return u;
}
