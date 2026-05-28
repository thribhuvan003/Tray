import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { resolveTenant } from "@/lib/tenant";
import { requireRole } from "@/lib/auth/get-user";
import { AdminShell } from "@/components/portal-admin/shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const slug = h.get("x-tenant-slug") ?? "";
  const tenant = await resolveTenant(slug);
  if (!tenant) redirect("/");
  const user = await requireRole(["canteen_admin", "super_admin"]);
  // role=owner ensures the login form routes back to the admin dashboard
  // rather than falling through to the student menu on re-login.
  if (!user) redirect(`/c/${tenant.slug}/login?role=owner&next=${encodeURIComponent(`/c/${tenant.slug}/admin/dashboard`)}`);
  return (
    <div
      data-portal="admin"
      className="min-h-screen bg-admin-bg text-admin-ink relative overflow-x-hidden transition-colors duration-200"
    >
      <div className="grid-paper fixed inset-0 z-0" />
      <AdminShell tenantName={tenant.name} tenantSlug={tenant.slug} userEmail={user.email}>
        {children}
      </AdminShell>
    </div>
  );
}
