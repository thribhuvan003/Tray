import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { resolveTenant, getTenantSlugFromHeaders } from "@/lib/tenant";
import { requireRole } from "@/lib/auth/get-user";
import { AdminShell } from "@/components/portal-admin/shell";
import { AdminRealtimeSync } from "@/components/portal-admin/realtime-sync";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const slug = getTenantSlugFromHeaders(h);
  const tenant = await resolveTenant(slug);
  if (!tenant) redirect("/");
  const user = await requireRole(["canteen_admin", "super_admin"]);
  if (!user) redirect(`/c/${tenant.slug}/login?next=/c/${tenant.slug}/admin/dashboard`);
  return (
    <div
      data-portal="admin"
      className="min-h-screen font-sans bg-[var(--admin-bg)] text-[var(--admin-ink)] relative"
    >
      <div className="grid-paper fixed inset-0 z-0" />
      <AdminRealtimeSync tenantId={tenant.id} />
      <AdminShell tenantName={tenant.name} tenantSlug={tenant.slug} userEmail={user.email}>
        {children}
      </AdminShell>
    </div>
  );
}
