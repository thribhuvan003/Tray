import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { resolveTenant, collegeCanteensUncached, getTenantSlugFromHeaders } from "@/lib/tenant";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getAdminClient } from "@/lib/supabase/admin";
import { StudentTopBar } from "@/components/portal-student/top-bar";
import { CartDrawer } from "@/components/portal-student/cart-drawer";
import { CartTenantSync } from "@/components/portal-student/cart-tenant-sync";
import { OrderReadyListener } from "@/components/portal-student/order-ready-listener";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const slug = getTenantSlugFromHeaders(h);
  const tenant = await resolveTenant(slug);
  if (!tenant) notFound();

  // Fetch sibling canteens from the same college so the CanteenSwitcher can
  // list them. Falls back to empty array if college_slug is unavailable or the
  // query fails — the switcher hides itself when there's only one canteen.
  const siblings = tenant.college_slug
    ? await collegeCanteensUncached(tenant.college_slug).catch(() => [])
    : [];

  if (siblings.length > 0) {
    try {
      const admin = getAdminClient();
      const { data: counts } = await admin
        .from("menu_items")
        .select("id, tenants!inner(slug)")
        .eq("status", "live");

      if (counts) {
        const dishCountsMap: Record<string, number> = {};
        for (const item of counts) {
          const s = (item.tenants as any)?.slug;
          if (s) {
            dishCountsMap[s] = (dishCountsMap[s] || 0) + 1;
          }
        }
        for (const sib of siblings) {
          sib.dishCount = dishCountsMap[sib.slug] ?? 0;
        }
      }
    } catch (err) {
      console.error("Failed to fetch dish counts for siblings:", err);
    }
  }

  // Auth is optional on the student portal (browse without sign-in is fine).
  // We pass the user id to OrderReadyListener so it can subscribe; nullable
  // means the listener no-ops for guests.
  const user = await getCurrentUser();

  return (
    <div
      data-portal="student"
      className="min-h-screen font-sans bg-[color:var(--color-paper)] text-[color:var(--color-ink)] antialiased"
    >
      <CartTenantSync slug={tenant.slug} />
      <OrderReadyListener userId={user?.id ?? null} tenantSlug={tenant.slug} />
      <StudentTopBar tenant={tenant} siblings={siblings} user={user} />
      {/* Desktop reserves a 20rem right column for the sticky cart sidebar.
          Mobile stays single-column; the CartDrawer self-promotes to a
          floating button + Vaul drawer below the lg breakpoint. */}
      <main
        className="pb-32 sm:pb-20 lg:pb-12 lg:grid lg:grid-cols-[1fr,20rem] lg:gap-6 lg:max-w-7xl lg:mx-auto lg:px-6"
        style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="min-w-0">{children}</div>
        <CartDrawer tenantSlug={tenant.slug} tenantName={tenant.name} />
      </main>
    </div>
  );
}
