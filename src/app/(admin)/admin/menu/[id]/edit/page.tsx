import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { resolveTenant, getTenantSlugFromHeaders } from "@/lib/tenant";
import { getAdminClient } from "@/lib/supabase/admin";
import { EditItemForm } from "./edit-item-form";
import type { MenuItem } from "@/lib/db/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditMenuItemPage({ params }: Props) {
  const { id } = await params;
  const h = await headers();
  const slug = getTenantSlugFromHeaders(h);
  const tenant = await resolveTenant(slug);
  if (!tenant) return null;
  const supabase = getAdminClient(tenant.id);

  const [{ data: item }, { data: cats }] = await Promise.all([
    supabase
      .from("menu_items")
      .select(
        "id, name, description, price_paise, diet, category_id, image_url, sort_order, status, in_stock"
      )
      .eq("id", id)
      .eq("tenant_id", tenant.id)
      .returns<MenuItem[]>()
      .then(r => ({ data: r.data?.[0] ?? null, error: r.error })),
    supabase
      .from("menu_categories")
      .select("id, name")
      .eq("tenant_id", tenant.id)
      .order("sort_order")
      .returns<{ id: string; name: string }[]>(),
  ]);

  if (!item) notFound();

  return (
    <EditItemForm
      item={item}
      cats={cats || []}
      tenantSlug={tenant.slug}
    />
  );
}
