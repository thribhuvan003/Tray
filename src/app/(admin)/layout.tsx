import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { resolveTenant } from "@/lib/tenant";
import { requireRole } from "@/lib/auth/get-user";
import { AdminShell } from "@/components/portal-admin/shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const slug = h.get("x-tenant-slug") ?? "aditya";
  const tenant = await resolveTenant(slug);
  if (!tenant) redirect("/");
  const user = await requireRole(["canteen_admin", "super_admin"]);
  if (!user) redirect(`/login?next=/admin/dashboard`);
  return (
    <div className="page active" data-screen-label="09 Admin">
      <AdminShell tenantName={tenant.name} tenantSlug={tenant.slug} userEmail={user.email}>
        {children}
      </AdminShell>
    </div>
  );
}
