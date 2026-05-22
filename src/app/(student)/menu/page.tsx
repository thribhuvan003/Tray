import { headers } from "next/headers";
import { resolveTenant } from "@/lib/tenant";
import { getServerClient } from "@/lib/supabase/server";
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

  return (
    <>
      <ClosedBanner
        tenantName={tenant.name}
        isClosed={isClosed}
        pausedUntil={pausedUntil}
      />
      <MenuBoard categories={cats ?? []} items={items ?? []} tenantId={tenant.id} tenantSlug={tenant.slug} />
    </>
  );
}
