import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { resolveTenant, getTenantSlugFromHeaders } from "@/lib/tenant";
import { NewItemForm } from "./new-item-form";

export const dynamic = "force-dynamic";

export default async function NewMenuItemPage() {
  const h = await headers();
  const slug = getTenantSlugFromHeaders(h);
  const tenant = await resolveTenant(slug);
  if (!tenant) return null;

  return <NewItemForm tenantSlug={tenant.slug} />;
}
