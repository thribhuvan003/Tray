import { headers } from "next/headers";
import { resolveTenant, collegeCanteensUncached } from "@/lib/tenant";
import { getServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { MenuBoard } from "@/components/portal-student/menu-board";
import { ClosedBanner } from "@/components/portal-student/closed-banner";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StudentMenuPage() {
  const h = await headers();
  const slug = h.get("x-tenant-slug") ?? "aditya";
  const tenant = await resolveTenant(slug);
  if (!tenant) notFound();

  const supabase = await getServerClient(tenant.id);
  const [{ data: cats }, { data: items }, { data: tenantStatus }] = await Promise.all([
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
  ]);

  const isClosed = tenantStatus ? !tenantStatus.is_open : false;
  const pausedUntil = tenantStatus?.paused_until ?? null;

  // Fetch sibling canteens for the switcher segments
  const siblings = tenant.college_slug
    ? await collegeCanteensUncached(tenant.college_slug).catch(() => [])
    : [];

  if (siblings.length > 0) {
    try {
      const admin = getAdminClient();
      const { data: counts } = await admin
        .from("menu_items")
        .select("id, tenants!inner(slug)")
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
        siblings={siblings}
      />
    </>
  );
}
