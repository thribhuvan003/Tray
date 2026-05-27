import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { resolveTenant, getTenantSlugFromHeaders } from "@/lib/tenant";
import { getServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { StudentOrdersView } from "@/components/portal-student/student-orders-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrdersPage() {
  const h = await headers();
  const slug = getTenantSlugFromHeaders(h);
  const tenant = await resolveTenant(slug);
  if (!tenant) notFound();

  const user = await getCurrentUser();
  if (!user) redirect(`/c/${tenant.slug}/login?next=/c/${tenant.slug}/orders`);

  const supabase = await getServerClient(tenant.id);
  const { data: orders } = await supabase
    .from("orders")
    .select("id, short_code, status, total_paise, placed_at")
    .eq("user_id", user.id)
    .eq("tenant_id", tenant.id)
    .order("placed_at", { ascending: false })
    .limit(100)
    .returns<{ id: string; short_code: string; status: string; total_paise: number; placed_at: string }[]>();

  return (
    <StudentOrdersView
      initialOrders={orders ?? []}
      tenantSlug={tenant.slug}
      tenantId={tenant.id}
      userId={user.id}
    />
  );
}
