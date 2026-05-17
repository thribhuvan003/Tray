import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { resolveTenant } from "@/lib/tenant";
import { StudentTopBar } from "@/components/portal-student/top-bar";
import { CartDrawer } from "@/components/portal-student/cart-drawer";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const slug = h.get("x-tenant-slug") ?? "aditya";
  const tenant = await resolveTenant(slug);
  if (!tenant) notFound();
  return (
    <div data-portal="student" className="min-h-screen bg-[color:var(--color-paper)] text-[color:var(--color-ink)] antialiased">
      <StudentTopBar tenant={tenant} />
      <main className="pb-32 sm:pb-20">{children}</main>
      <CartDrawer tenantUpi={tenant.name} />
    </div>
  );
}
