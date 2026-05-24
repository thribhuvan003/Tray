"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, CircleDot, EyeOff, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { formatRupees, cn, fmtElapsed } from "@/lib/utils";
import { setMenuItemStatus, setMenuItemStock } from "@/app/(admin)/admin/_actions";

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

export function MenuTable({ items, categories, tenantSlug }: { items: Row[]; categories: { id: string; name: string }[]; tenantSlug: string }) {

  const [filter, setFilter] = useState<"all" | "live" | "draft" | "archived">("all");
  const [pending, start] = useTransition();
  const filtered = items.filter((i) => filter === "all" || i.status === filter);
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  const onStatus = (id: string, status: Row["status"]) => {
    start(async () => {
      const r = await setMenuItemStatus(id, status, tenantSlug);
      if (!r.ok) toast.error(r.error ?? "Failed");
      else toast.success(`Moved to ${status}`);
    });
  };
  const onStock = (id: string, inStock: boolean) => {
    start(async () => {
      const r = await setMenuItemStock(id, inStock, tenantSlug);
      if (!r.ok) toast.error(r.error ?? "Failed");
      else toast.success(inStock ? "Back in stock" : "Marked out of stock");
    });
  };

  return (
    <>
      <div className="flex items-center gap-1 mb-3 p-1 rounded-md border border-[var(--admin-line-2)] bg-[var(--admin-bg-2)] w-fit text-[11px] font-mono">
        {(["all", "live", "draft", "archived"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={cn(
              "px-3 h-7 rounded uppercase tracking-wider cursor-pointer transition-colors",
              filter === v ? "bg-[var(--admin-lime)] text-[var(--admin-bg)] font-semibold" : "text-[var(--admin-ink-3)] hover:text-[var(--admin-ink)]"
            )}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="relative">
        {/* Mobile scroll hint — right-edge gradient */}
        <div className="sm:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--admin-bg-2)] pointer-events-none z-10 rounded-r-xl" />
        <div className="overflow-x-auto -mx-0 scrollbar-none">
        <div className="bg-[var(--admin-bg-2)] border border-[var(--admin-line)] rounded-xl overflow-hidden min-w-[640px]">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-[10px] font-mono uppercase tracking-wider text-[var(--admin-ink-3)] border-b border-[var(--admin-line)]">
              <th className="text-left px-4 py-3 font-medium">Item</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-left px-4 py-3 font-medium">Diet</th>
              <th className="text-right px-4 py-3 font-medium">Price</th>
              <th className="text-right px-4 py-3 font-medium">Prep</th>
              <th className="text-left px-4 py-3 font-medium">Stock</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => (
              <tr key={it.id} className="border-b border-[var(--admin-line)] last:border-0">
                <td className="px-4 py-2.5 text-[var(--admin-ink)] font-medium">{it.name}</td>
                <td className="px-4 py-2.5 text-[var(--admin-ink-2)]">
                  {it.category_id ? catMap.get(it.category_id) ?? "—" : "—"}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={
                      "inline-flex h-3.5 w-3.5 items-center justify-center border-[1.5px] rounded-sm bg-white " +
                      (it.diet === "veg"
                        ? "border-emerald-500"
                        : it.diet === "egg"
                        ? "border-amber-500"
                        : "border-rose-500")
                    }
                  >
                    <span
                      className={
                        "h-1.5 w-1.5 rounded-full " +
                        (it.diet === "veg" ? "bg-emerald-500" : it.diet === "egg" ? "bg-amber-500" : "bg-rose-500")
                      }
                    />
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular text-[var(--admin-ink)]">
                  {formatRupees(it.price_paise)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular text-[var(--admin-ink-2)]">
                  {fmtElapsed(it.prep_target_seconds)}
                </td>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => onStock(it.id, !it.in_stock)}
                    disabled={pending}
                    className={cn(
                      "inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider px-2 py-1 rounded border transition-colors cursor-pointer",
                      it.in_stock
                        ? "border-[var(--admin-mint)]/30 text-[var(--admin-mint)] hover:bg-[var(--admin-mint-soft)]"
                        : "border-[var(--admin-rose)]/30 text-[var(--admin-rose)] hover:bg-[var(--admin-rose-soft)]"
                    )}
                  >
                    {it.in_stock ? <Power size={11} /> : <PowerOff size={11} />}
                    {it.in_stock ? "In stock" : "Out"}
                  </button>
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={
                      "inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border " +
                      (it.status === "live"
                        ? "bg-[var(--admin-lime)]/15 text-[var(--admin-lime)] border-[var(--admin-lime)]/30"
                        : it.status === "draft"
                        ? "bg-[var(--admin-amber-soft)] text-[var(--admin-amber)] border-[var(--admin-amber)]/30"
                        : "bg-[var(--admin-bg-3)] text-[var(--admin-ink-3)] border-[var(--admin-line-2)]")
                    }
                  >
                    {it.status === "live" ? <CheckCircle2 size={10} /> : it.status === "draft" ? <CircleDot size={10} /> : <EyeOff size={10} />}
                    {it.status}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="inline-flex gap-1">
                    {it.status !== "live" && (
                      <button onClick={() => onStatus(it.id, "live")} disabled={pending} className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded border border-[var(--admin-lime)]/30 text-[var(--admin-lime)] hover:bg-[var(--admin-lime)]/10 cursor-pointer">
                        Publish
                      </button>
                    )}
                    {it.status === "live" && (
                      <button onClick={() => onStatus(it.id, "draft")} disabled={pending} className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded border border-[var(--admin-amber)]/30 text-[var(--admin-amber)] hover:bg-[var(--admin-amber-soft)] cursor-pointer">
                        Draft
                      </button>
                    )}
                    {it.status !== "archived" && (
                      <button onClick={() => onStatus(it.id, "archived")} disabled={pending} className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded border border-[var(--admin-line-2)] text-[var(--admin-ink-3)] hover:bg-[var(--admin-bg-3)]/60 cursor-pointer">
                        Archive
                      </button>
                    )}
                    <Link
                      href={`/c/${tenantSlug}/admin/menu/${it.id}/edit`}
                      className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded border border-[var(--admin-line-2)] text-[var(--admin-ink-3)] hover:bg-[var(--admin-bg-3)]/60 hover:text-[var(--admin-ink)] transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-[var(--admin-ink-3)] text-[13px]">
                  No items in this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
      </div>
    </>
  );
}
