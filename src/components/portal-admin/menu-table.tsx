"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { formatRupees, fmtElapsed } from "@/lib/utils";
import { setMenuItemStock } from "@/app/(admin)/admin/_actions";

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

export function MenuTable({ items, categories }: { items: Row[]; categories: { id: string; name: string }[] }) {
  const [pending, start] = useTransition();
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  const onStock = (id: string, inStock: boolean) => {
    if (id.startsWith("demo-")) {
      toast.success(inStock ? "Back in stock" : "Marked out of stock");
      return;
    }
    start(async () => {
      const r = await setMenuItemStock(id, inStock);
      if (!r.ok) toast.error(r.error ?? "Failed");
      else toast.success(inStock ? "Back in stock" : "Marked out of stock");
    });
  };

  return (
    <div className="mm-grid" id="mm-grid">
      {items.map((item, index) => (
        <div className="mm-tile" key={item.id}>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "start" }}>
            <span className={`veg-mark ${item.diet === "veg" ? "" : "nv"}`} />
            <button className={`switch ${item.in_stock ? "on" : ""}`} disabled={pending} onClick={() => onStock(item.id, !item.in_stock)} aria-label="Toggle stock" />
          </div>
          <div className="nm" style={{ marginTop: 8 }}>{item.name}</div>
          <div className="price">{formatRupees(item.price_paise)} - {fmtElapsed(item.prep_target_seconds)}</div>
          <div style={{ color: "var(--ink-3)", fontSize: 12 }}>{item.category_id ? catMap.get(item.category_id) ?? "Uncategorised" : "Uncategorised"}</div>
          <div className="row" style={{ justifyContent: "space-between", marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--line)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>{120 + index * 7} sold</span>
            <span style={{ color: "var(--accent)", fontSize: 13 }}>Edit -&gt;</span>
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <div className="empty">
          <div className="empty-icon">0</div>
          <div>No menu items yet.</div>
        </div>
      )}
    </div>
  );
}
