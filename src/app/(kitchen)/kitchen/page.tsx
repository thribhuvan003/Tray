import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { resolveTenant } from "@/lib/tenant";
import { getServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/get-user";
import { KitchenBoard } from "@/components/portal-kitchen/board";
import { demoLines, demoMenuItems, demoOrders } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  short_code: string;
  status: "placed" | "preparing" | "ready" | "collected" | "pending_payment" | "rejected" | "expired";
  total_paise: number;
  placed_at: string;
  ready_at: string | null;
  collected_at: string | null;
  customer_name: string | null;
  order_type: "takeaway" | "dine_in";
  table_label: string | null;
};
type LineRow = {
  id: string;
  order_id: string;
  name_snapshot: string;
  qty: number;
  diet_snapshot: "veg" | "nonveg" | "egg";
};
type MarqueeRow = { id: string; name: string; price_paise: number; diet: "veg" | "nonveg" | "egg" };

export default async function KitchenPage() {
  const h = await headers();
  const slug = h.get("x-tenant-slug") ?? "aditya";
  const tenant = await resolveTenant(slug);
  if (!tenant) return null;

  const user = await requireRole(["kitchen_staff", "canteen_admin", "super_admin"]);
  if (!user) redirect(`/login?next=/kitchen`);

  const supabase = await getServerClient(tenant.id);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const [{ data: orders }, { data: marquee }] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "id, short_code, status, total_paise, placed_at, ready_at, collected_at, customer_name, order_type, table_label"
      )
      .eq("tenant_id", tenant.id)
      .in("status", ["placed", "preparing", "ready", "collected"])
      .gte("placed_at", todayIso)
      .order("placed_at", { ascending: true })
      .limit(120)
      .returns<OrderRow[]>(),
    supabase
      .from("menu_items")
      .select("id, name, price_paise, diet")
      .eq("tenant_id", tenant.id)
      .eq("status", "live")
      .eq("in_stock", true)
      .order("sort_order")
      .limit(24)
      .returns<MarqueeRow[]>(),
  ]);

  const orderIds = (orders ?? []).map((o) => o.id);
  let filteredLines: LineRow[] = [];
  if (orderIds.length > 0) {
    const { data: lines } = await supabase
      .from("order_items")
      .select("id, order_id, name_snapshot, qty, diet_snapshot")
      .in("order_id", orderIds)
      .returns<LineRow[]>();
    filteredLines = lines ?? [];
  }

  const displayOrders = orders?.length ? orders : demoOrders();
  const displayLines = filteredLines.length ? filteredLines : demoLines();
  const displayMarquee = marquee?.length ? marquee : demoMenuItems(tenant.id).map((item) => ({
    id: item.id,
    name: item.name,
    price_paise: item.price_paise,
    diet: item.diet,
  }));

  return (
    <KitchenBoard
      tenantId={tenant.id}
      tenantName={tenant.name}
      orders={displayOrders}
      lines={displayLines}
      marquee={displayMarquee}
    />
  );
}
