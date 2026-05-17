import { headers } from "next/headers";
import { resolveTenant } from "@/lib/tenant";
import { getServerClient } from "@/lib/supabase/server";
import { DashboardView } from "@/components/portal-admin/dashboard-view";

type OrderRow = {
  id: string;
  short_code: string;
  status: "pending_payment" | "placed" | "preparing" | "ready" | "collected" | "rejected" | "expired";
  total_paise: number;
  placed_at: string;
  collected_at: string | null;
  ready_at: string | null;
  customer_name: string | null;
  order_type: "takeaway" | "dine_in";
};

type StatusLog = {
  id: string;
  order_id: string;
  to_status: string;
  from_status: string | null;
  created_at: string;
  note: string | null;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  name_snapshot: string;
  qty: number;
  diet_snapshot: "veg" | "nonveg" | "egg";
  price_paise_snapshot: number;
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const h = await headers();
  const slug = h.get("x-tenant-slug") ?? "aditya";
  const tenant = await resolveTenant(slug);
  if (!tenant) return null;
  const supabase = await getServerClient(tenant.id);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const start7d = new Date();
  start7d.setDate(start7d.getDate() - 6);
  start7d.setHours(0, 0, 0, 0);

  const [{ data: ordersWeek }, { data: logs }, { data: items }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, short_code, status, total_paise, placed_at, collected_at, ready_at, customer_name, order_type")
      .eq("tenant_id", tenant.id)
      .gte("placed_at", start7d.toISOString())
      .order("placed_at", { ascending: false })
      .limit(800)
      .returns<OrderRow[]>(),
    supabase
      .from("order_status_logs")
      .select("id, order_id, to_status, from_status, created_at, note")
      .eq("tenant_id", tenant.id)
      .gte("created_at", startOfDay.toISOString())
      .order("created_at", { ascending: false })
      .limit(40)
      .returns<StatusLog[]>(),
    supabase
      .from("order_items")
      .select("id, order_id, name_snapshot, qty, diet_snapshot, price_paise_snapshot")
      .eq("tenant_id", tenant.id)
      .returns<OrderItemRow[]>(),
  ]);

  const todayIso = startOfDay.toISOString();
  const todayOrders = (ordersWeek ?? []).filter((o) => o.placed_at >= todayIso);
  const todayIds = new Set(todayOrders.map((o) => o.id));
  const todayItems = (items ?? []).filter((i) => todayIds.has(i.order_id));

  return (
    <DashboardView
      tenantName={tenant.name}
      ordersWeek={ordersWeek ?? []}
      todayOrders={todayOrders}
      logs={logs ?? []}
      todayItems={todayItems}
    />
  );
}
