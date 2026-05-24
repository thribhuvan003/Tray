import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { resolveTenant, getTenantSlugFromHeaders } from "@/lib/tenant";
import { getAdminClient } from "@/lib/supabase/admin";
import { NewItemForm } from "./new-item-form";

export const dynamic = "force-dynamic";

export default async function NewMenuItemPage() {
  const h = await headers();
  const slug = getTenantSlugFromHeaders(h);
  const tenant = await resolveTenant(slug);
  if (!tenant) return null;

  const supabase = getAdminClient(tenant.id);
  let { data: cats } = await supabase
    .from("menu_categories")
    .select("id, name")
    .eq("tenant_id", tenant.id)
    .order("sort_order")
    .returns<{ id: string; name: string }[]>();

  if (!cats || cats.length === 0) {
    const defaultCats = [
      { tenant_id: tenant.id, name: "Specials", sort_order: 1 },
      { tenant_id: tenant.id, name: "Mains", sort_order: 2 },
      { tenant_id: tenant.id, name: "Snacks", sort_order: 3 },
      { tenant_id: tenant.id, name: "Drinks", sort_order: 4 },
    ];
    const { data: inserted } = await supabase
      .from("menu_categories")
      .insert(defaultCats)
      .select("id, name")
      .returns<{ id: string; name: string }[]>();
    if (inserted) {
      cats = inserted;
    }
  }

  return <NewItemForm tenantSlug={tenant.slug} cats={cats || []} />;
}
