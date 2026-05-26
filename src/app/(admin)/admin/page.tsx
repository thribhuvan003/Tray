import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function AdminRootPage() {
  const h = await headers();
  const slug = h.get("x-tenant-slug") ?? "";
  redirect(`/c/${slug}/admin/dashboard`);
}
