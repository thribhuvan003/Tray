import Link from "next/link";
import { headers } from "next/headers";
import { Download } from "lucide-react";
import { resolveTenant, getTenantSlugFromHeaders } from "@/lib/tenant";
import { getServerClient } from "@/lib/supabase/server";
import { formatRupees, formatDateIST, formatTimeIST } from "@/lib/utils";
import { OrdersView } from "@/components/portal-admin/orders-view";

type Row = {
  id: string;
  short_code: string;
  status: string;
  total_paise: number;
  placed_at: string;
  customer_name: string | null;
  order_type: "takeaway" | "dine_in";
  table_label: string | null;
};

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const statusFilter = typeof sp.status === "string" ? sp.status : "all";

  const h = await headers();
  const slug = getTenantSlugFromHeaders(h);
  const tenant = await resolveTenant(slug);
  if (!tenant) return null;
  const supabase = await getServerClient(tenant.id);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayIso = startOfDay.toISOString();

  let query = supabase
    .from("orders")
    .select("id, short_code, status, total_paise, placed_at, customer_name, order_type, table_label")
    .eq("tenant_id", tenant.id)
    .order("placed_at", { ascending: false })
    .limit(500);

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data: orders } = await query.returns<Row[]>();

  const allOrders = orders ?? [];
  const todayOrders = allOrders.filter((o) => o.placed_at >= todayIso);
  const todayRevenue = todayOrders
    .filter((o) => !["pending_payment", "rejected", "expired", "cancelled_by_kitchen"].includes(o.status))
    .reduce((acc, o) => acc + o.total_paise, 0);

  const todayExportUrl = `/api/admin/export/orders?from=${encodeURIComponent(todayIso)}&tenant=${tenant.slug}`;

  const statuses = ["all", "placed", "preparing", "ready", "collected", "pending_payment", "rejected", "expired"];

  return (
    <OrdersView
      orders={allOrders}
      todayRevenue={todayRevenue}
      todayCount={todayOrders.length}
      todayExportUrl={todayExportUrl}
      allExportUrl={`/api/admin/export/orders?tenant=${tenant.slug}`}
      tenantId={tenant.id}
      tenantSlug={tenant.slug}
      statusFilter={statusFilter}
      statuses={statuses}
    />
  );
}
