import Link from "next/link";
import { headers } from "next/headers";

import { resolveTenant, getTenantSlugFromHeaders } from "@/lib/tenant";
import { getServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { MenuTable } from "@/components/portal-admin/menu-table";

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
  const slug = getTenantSlugFromHeaders(h);
  const tenant = await resolveTenant(slug);
  if (!tenant) return null;
  const supabase = await getServerClient(tenant.id);
  const [{ data: items }, { data: rawCats }] = await Promise.all([
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

  let cats = rawCats || [];
  if (cats.length === 0) {
    const defaultCats = [
      { tenant_id: tenant.id, name: "Specials", sort_order: 1 },
      { tenant_id: tenant.id, name: "Mains", sort_order: 2 },
      { tenant_id: tenant.id, name: "Snacks", sort_order: 3 },
      { tenant_id: tenant.id, name: "Drinks", sort_order: 4 },
    ];
    const admin = getAdminClient(tenant.id);
    const { data: inserted } = await admin
      .from("menu_categories")
      .insert(defaultCats)
      .select("id, name")
      .returns<{ id: string; name: string }[]>();
    if (inserted) {
      cats = inserted;
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4 border-b border-[var(--admin-line)] pb-5">
        <div>
          <h1 className="font-display text-[30px] sm:text-[36px] font-medium tracking-tight text-[var(--admin-ink)]">
            Menu <span className="it text-[var(--admin-lime)]">Manager</span>
          </h1>
          <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--admin-ink-3)] mt-1">
            {items?.length ?? 0} items · draft / live / archived workflow
          </div>
        </div>
        <Link
          href={`/c/${tenant.slug}/admin/menu/new`}
          className="shrink-0 rounded-lg bg-[var(--admin-lime)] px-4 py-2 text-[13px] font-bold text-[var(--admin-bg)] hover:bg-[var(--admin-lime-2)] hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          + New item
        </Link>
      </div>
      <MenuTable items={items ?? []} categories={cats ?? []} tenantSlug={tenant.slug} />
    </div>
  );
}
