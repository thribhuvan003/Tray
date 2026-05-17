import { headers } from "next/headers";
import { resolveTenant } from "@/lib/tenant";
import { getServerClient } from "@/lib/supabase/server";
import { MenuTable } from "@/components/portal-admin/menu-table";
import { demoCategories, demoMenuItems } from "@/lib/demo-data";

type Row = {
  id: string;
  name: string;
  category_id: string | null;
  diet: "veg" | "nonveg" | "egg";
  price_paise: number;
  status: "draft" | "live" | "archived";
  in_stock: boolean;
  stock_qty: number | null;
  prep_target_seconds: number;
};

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const h = await headers();
  const slug = h.get("x-tenant-slug") ?? "aditya";
  const tenant = await resolveTenant(slug);
  if (!tenant) return null;
  const supabase = await getServerClient(tenant.id);
  const [{ data: items }, { data: cats }] = await Promise.all([
    supabase
      .from("menu_items")
      .select("id, name, category_id, diet, price_paise, status, in_stock, stock_qty, prep_target_seconds")
      .eq("tenant_id", tenant.id)
      .order("sort_order")
      .returns<Row[]>(),
    supabase
      .from("menu_categories")
      .select("id, name")
      .eq("tenant_id", tenant.id)
      .returns<{ id: string; name: string }[]>(),
  ]);

  const displayItems = items?.length
    ? items
    : demoMenuItems(tenant.id).map((item) => ({
        id: item.id,
        name: item.name,
        category_id: item.category_id,
        diet: item.diet,
        price_paise: item.price_paise,
        status: item.status,
        in_stock: item.in_stock,
        stock_qty: item.stock_qty,
        prep_target_seconds: item.prep_target_seconds,
      }));
  const displayCats = cats?.length ? cats : demoCategories(tenant.id).map((cat) => ({ id: cat.id, name: cat.name }));

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Catalogue - {displayItems.length} dishes - {displayCats.length} categories</span>
          <h1 className="page-title">Menu manager</h1>
          <div className="page-sub">Toggle availability, edit pricing, manage prep times.</div>
        </div>
        <div className="row gap-2">
          <button className="btn btn-ghost btn-sm">Import CSV</button>
          <button className="btn btn-primary btn-sm">+ New dish</button>
        </div>
      </div>
      <MenuTable items={displayItems} categories={displayCats} />
    </>
  );
}
