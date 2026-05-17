import Link from "next/link";
import { headers } from "next/headers";
import { Download, Filter } from "lucide-react";
import { resolveTenant } from "@/lib/tenant";
import { getServerClient } from "@/lib/supabase/server";
import { formatRupees, formatDateIST, formatTimeIST } from "@/lib/utils";

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

const TONE: Record<string, string> = {
  pending_payment: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  placed: "bg-ocean-500/15 text-ocean-500 border-ocean-500/30",
  preparing: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ready: "bg-lime/15 text-lime border-lime/30",
  collected: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  rejected: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  expired: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const h = await headers();
  const slug = h.get("x-tenant-slug") ?? "aditya";
  const tenant = await resolveTenant(slug);
  if (!tenant) return null;
  const supabase = await getServerClient(tenant.id);
  const { data: orders } = await supabase
    .from("orders")
    .select("id, short_code, status, total_paise, placed_at, customer_name, order_type, table_label")
    .eq("tenant_id", tenant.id)
    .order("placed_at", { ascending: false })
    .limit(100)
    .returns<Row[]>();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="font-display text-[26px] sm:text-[30px] font-semibold tracking-tight">Orders</h1>
          <div className="text-[11px] font-mono uppercase tracking-[0.12em] text-graphite-400 mt-0.5">
            Last 100 · all statuses
          </div>
        </div>
        <a
          href="/api/admin/export/orders"
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-graphite-200/15 text-[11px] font-mono uppercase tracking-wider text-graphite-300 hover:border-lime hover:text-lime transition-colors"
        >
          <Download size={11} /> Export CSV
        </a>
      </div>

      <div className="bg-graphite-700 border border-graphite-200/[0.08] rounded-xl overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-[10px] font-mono uppercase tracking-wider text-graphite-400 border-b border-graphite-200/[0.08]">
              <th className="text-left px-4 py-3 font-medium">Code</th>
              <th className="text-left px-4 py-3 font-medium">Placed</th>
              <th className="text-left px-4 py-3 font-medium">Customer</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-right px-4 py-3 font-medium">Total</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="border-b border-graphite-200/[0.05] last:border-0 hover:bg-graphite-200/[0.03]">
                <td className="px-4 py-2.5 font-mono tabular text-graphite-200">{o.short_code}</td>
                <td className="px-4 py-2.5 text-graphite-300 font-mono tabular">
                  {formatDateIST(o.placed_at).split(",")[0]} · {formatTimeIST(o.placed_at)}
                </td>
                <td className="px-4 py-2.5 text-graphite-300">{o.customer_name ?? "—"}</td>
                <td className="px-4 py-2.5 text-graphite-300">
                  {o.order_type === "dine_in" ? `Dine-in · ${o.table_label ?? "—"}` : "Takeaway"}
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular text-graphite-200">
                  {formatRupees(o.total_paise)}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={
                      "inline-block text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border " +
                      (TONE[o.status] ?? "bg-graphite-600 text-graphite-300 border-graphite-500/30")
                    }
                  >
                    {o.status.replace("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-graphite-400 text-[13px]">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
