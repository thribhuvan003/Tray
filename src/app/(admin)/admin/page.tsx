import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getTenantSlugFromHeaders } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function AdminRootPage() {
  const h = await headers();
  const slug = getTenantSlugFromHeaders(h);
  redirect(`/c/${slug}/admin/dashboard`);
}
