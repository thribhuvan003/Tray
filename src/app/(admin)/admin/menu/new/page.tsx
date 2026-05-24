import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { resolveTenant, getTenantSlugFromHeaders } from "@/lib/tenant";
import { createMenuItem } from "@/app/(admin)/admin/_actions";
import { NewItemForm } from "./new-item-form";

export const dynamic = "force-dynamic";

export default async function NewMenuItemPage() {
  const h = await headers();
  const slug = getTenantSlugFromHeaders(h);
  const tenant = await resolveTenant(slug);
  if (!tenant) return null;

  // Inline server action — captures tenant from closure for correct redirect
  async function handleCreate(formData: FormData) {
    "use server";
    const name = (formData.get("name") as string | null)?.trim() ?? "";
    const priceRaw = formData.get("price") as string | null;
    const price_paise = Math.round(parseFloat(priceRaw ?? "0") * 100);

    if (!name || !(price_paise > 0)) {
      redirect(`/c/${tenant!.slug}/admin/menu/new?err=1`);
      return;
    }

    const description = (formData.get("description") as string | null)?.trim() || null;
    const diet = (formData.get("diet") as "veg" | "nonveg" | "egg") ?? "veg";
    const category_id = (formData.get("category_id") as string | null) || null;
    const image_url = (formData.get("image_url") as string | null)?.trim() || null;
    const sort_order = parseInt((formData.get("sort_order") as string | null) ?? "0", 10) || 0;

    const result = await createMenuItem({
      name,
      description,
      price_paise,
      diet,
      category_id,
      image_url,
      sort_order,
    });

    if (result.ok) {
      redirect(`/c/${tenant!.slug}/admin/menu?created=1`);
    } else {
      redirect(`/c/${tenant!.slug}/admin/menu/new?err=${encodeURIComponent(result.error ?? "failed")}`);
    }
  }

  return <NewItemForm tenantSlug={tenant.slug} action={handleCreate} />;
}
