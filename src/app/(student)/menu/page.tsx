import { headers } from "next/headers";
import { resolveTenant, collegeCanteensUncached, getTenantSlugFromHeaders } from "@/lib/tenant";
import { getServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/get-user";
import { MenuBoard } from "@/components/portal-student/menu-board";
import { ClosedBanner } from "@/components/portal-student/closed-banner";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StudentMenuPage() {
  const h = await headers();
  const slug = getTenantSlugFromHeaders(h);
  const tenant = await resolveTenant(slug);
  if (!tenant) notFound();

  const supabase = await getServerClient(tenant.id);
  const [{ data: cats }, { data: items }, { data: tenantStatus }, { data: adminMember }] = await Promise.all([
    supabase
      .from("menu_categories")
      .select("*")
      .eq("tenant_id", tenant.id)
      .order("sort_order"),
    supabase
      .from("menu_items")
      .select("*")
      .eq("tenant_id", tenant.id)
      .eq("status", "live")
      .order("sort_order"),
    supabase
      .from("tenants")
      .select("is_open, paused_until")
      .eq("id", tenant.id)
      .maybeSingle<{ is_open: boolean; paused_until: string | null }>(),
    supabase
      .from("tenant_memberships")
      .select("display_name")
      .eq("tenant_id", tenant.id)
      .eq("role", "canteen_admin")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle<{ display_name: string | null }>(),
  ]);

  const isClosed = tenantStatus ? !tenantStatus.is_open : false;
  const pausedUntil = tenantStatus?.paused_until ?? null;
  const adminName = adminMember?.display_name ?? null;

  // Fetch sibling canteens for the switcher segments
  const siblings = tenant.college_slug
    ? await collegeCanteensUncached(tenant.college_slug).catch(() => [])
    : [];

  if (siblings.length > 0) {
    try {
      const admin = getAdminClient();
      // Scope to only sibling slugs — avoids full-table scan
      const siblingSlugSet = siblings.map((s) => s.slug);
      const { data: counts } = await admin
        .from("menu_items")
        .select("id, tenants!inner(slug)")
        .in("tenants.slug", siblingSlugSet)
        .eq("status", "live");

      if (counts) {
        const dishCountsMap: Record<string, number> = {};
        for (const item of counts) {
          const s = (item.tenants as any)?.slug;
          if (s) {
            dishCountsMap[s] = (dishCountsMap[s] || 0) + 1;
          }
        }
        for (const sib of siblings) {
          sib.dishCount = dishCountsMap[sib.slug] ?? 0;
        }
      }
    } catch (err) {
      console.error("Failed to fetch dish counts for siblings:", err);
    }
  }

  const user = await getCurrentUser();
  const currentSibling = siblings.find((s) => s.slug === tenant.slug);
  const pendingCount = currentSibling ? Number(currentSibling.pending_orders_count || 0) : 0;

  return (
    <>
      <ClosedBanner
        tenantName={tenant.name}
        isClosed={isClosed}
        pausedUntil={pausedUntil}
      />
      <MenuBoard
        categories={cats ?? []}
        items={items ?? []}
        tenantId={tenant.id}
        tenantSlug={tenant.slug}
        tenantName={tenant.name}
        siblings={siblings}
        user={user}
        adminName={adminName}
        isOpen={!isClosed}
        pausedUntil={pausedUntil}
        pendingCount={pendingCount}
        collegeSlug={tenant.college_slug}
      />
    </>
  );
}
