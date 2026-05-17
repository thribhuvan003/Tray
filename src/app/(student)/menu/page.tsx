import { headers } from "next/headers";
import { resolveTenant } from "@/lib/tenant";
import { getServerClient } from "@/lib/supabase/server";
import { MenuBoard } from "@/components/portal-student/menu-board";
import { notFound } from "next/navigation";
import { demoCategories, demoMenuItems } from "@/lib/demo-data";

export const revalidate = 15;

export default async function MenuPage() {
  const h = await headers();
  const slug = h.get("x-tenant-slug") ?? "aditya";
  const tenant = await resolveTenant(slug);
  if (!tenant) notFound();

  const supabase = await getServerClient(tenant.id);
  const [{ data: cats }, { data: items }] = await Promise.all([
    supabase
      .from("menu_categories")
      .select("*")
      .eq("tenant_id", tenant.id)
      .order("sort_order"),
    supabase
      .from("menu_items")
      .select("*")
      .eq("tenant_id", tenant.id)
      .eq("status", "live")
      .order("sort_order"),
  ]);

  const categories = cats?.length ? cats : demoCategories(tenant.id);
  const menuItems = items?.length ? items : demoMenuItems(tenant.id);

  return <MenuBoard categories={categories} items={menuItems} />;
}
