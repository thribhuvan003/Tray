"use client";

import { Minus, Plus } from "lucide-react";
import type { MenuItem } from "@/lib/db/types";
import { formatRupees, cn } from "@/lib/utils";
import { useCart } from "@/lib/cart/store";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Helper to match emoji by name pattern
function getItemEmoji(name: string, diet: string): string {
  const n = name.toLowerCase();
  if (n.includes("biryani") || n.includes("rice")) return "🍛";
  if (n.includes("coffee") || n.includes("cappuccino") || n.includes("latte")) return "☕";
  if (n.includes("tea") || n.includes("chai")) return "☕";
  if (n.includes("burger")) return "🍔";
  if (n.includes("sandwich")) return "🥪";
  if (n.includes("dosa") || n.includes("idli") || n.includes("uthappam")) return "🥞";
  if (n.includes("momo") || n.includes("dumpling")) return "🥟";
  if (n.includes("maggi") || n.includes("noodle") || n.includes("pasta")) return "🍜";
  if (n.includes("shake") || n.includes("smoothie") || n.includes("juice") || n.includes("drink")) return "🥤";
  if (n.includes("pizza")) return "🍕";
  if (n.includes("roll")) return "🌯";
  if (diet === "veg") return "🌿";
  if (diet === "egg") return "🍳";
  return "🍗";
}

export function MenuItemCard({ item }: { item: MenuItem }) {
  const line = useCart((s) => s.lines.find((l) => l.menuItemId === item.id));
  const add = useCart((s) => s.add);
  const inc = useCart((s) => s.increment);
  const dec = useCart((s) => s.decrement);
  const oos = !item.in_stock || item.status !== "live";

  const hasQty = !!line;
  const q = line?.qty ?? 0;

  return (
    <article
      className={cn(
        "menu-card",
        hasQty && "has-qty",
        oos && "opacity-60 pointer-events-none"
      )}
      data-id={item.id}
    >
      {/* Visual icon/emoji container + Price */}
      <div className="menu-card__visual flex flex-col items-center gap-1 justify-center bg-graphite-100 rounded-xl border border-graphite-200">
        <span className="text-3xl select-none leading-none">
          {getItemEmoji(item.name, item.diet)}
        </span>
      </div>

      {/* Body details */}
      <div className="menu-card__body">
        <div className="menu-card__top flex items-start justify-between gap-2">
          <h3 className="menu-card__title font-semibold text-[16px] leading-tight text-slate-800">
            {item.name}
          </h3>
          {/* FSSAI indicator badge */}
          <span
            className={cn("diet-dot", item.diet === "nonveg" ? "diet-dot--nv" : "diet-dot--veg")}
            title={item.diet === "nonveg" ? "Non-vegetarian" : "Vegetarian"}
            aria-label={item.diet === "nonveg" ? "Non-vegetarian" : "Vegetarian"}
          />
        </div>
        
        {item.description && (
          <p className="menu-card__desc text-[13px] text-slate-500 mt-1 leading-normal line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Footer controls: Price + Quantity triggers */}
        <div className="menu-card__foot flex items-center justify-between gap-4 mt-auto pt-2.5">
          <span className="price font-mono font-bold text-[16px] text-slate-900 tabular-nums">
            {formatRupees(item.price_paise)}
          </span>

          <div className="flex items-center gap-2">
            {/* Default + Add button */}
            <button
              type="button"
              disabled={oos}
              onClick={() => {
                add({
                  menuItemId: item.id,
                  name: item.name,
                  pricePaise: item.price_paise,
                  diet: item.diet,
                });
                const nameLower = item.name.toLowerCase();
                let message = `Added ${item.name} to tray!`;
                if (nameLower.includes("biryani")) {
                  message = `Aromatic Biryani added to your tray! 🍛`;
                } else if (nameLower.includes("coffee") || nameLower.includes("cappuccino")) {
                  message = `Freshly brewed coffee added! ☕`;
                } else if (nameLower.includes("tea") || nameLower.includes("chai")) {
                  message = `Hot steaming chai added! ☕`;
                } else if (nameLower.includes("burger")) {
                  message = `Juicy burger added! 🍔`;
                } else if (nameLower.includes("sandwich")) {
                  message = `Crispy sandwich added! 🥪`;
                } else if (nameLower.includes("dosa")) {
                  message = `Crispy golden Dosa added! 🥞`;
                } else if (nameLower.includes("momo")) {
                  message = `Steaming hot momos added! 🥟`;
                } else if (nameLower.includes("maggi") || nameLower.includes("noodle")) {
                  message = `Slurpy noodles added! 🍜`;
                } else if (nameLower.includes("shake") || nameLower.includes("smoothie") || nameLower.includes("juice")) {
                  message = `Chilled shake added! 🥤`;
                } else if (item.diet === "veg") {
                  message = `Fresh & green ${item.name} added! 🟢`;
                } else if (item.diet === "egg") {
                  message = `Egg-cellent choice of ${item.name}! 🍳`;
                } else if (item.diet === "nonveg") {
                  message = `Savory ${item.name} added to tray! 🍖`;
                }
                toast.success(message);
              }}
              className="btn-add-initial cursor-pointer hover:bg-opacity-90 active:scale-[0.98] transition-all"
            >
              + Add
            </button>

            {/* Quantity selector control */}
            <div className="qty-control">
              <button
                type="button"
                disabled={oos}
                onClick={() => dec(item.id)}
                className="qty-btn qty-minus cursor-pointer"
                aria-label="Remove one"
              >
                −
              </button>
              <span className="qty-val">{q}</span>
              <button
                type="button"
                disabled={oos}
                onClick={() => inc(item.id)}
                className="qty-btn qty-btn--add cursor-pointer"
                aria-label="Add one"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
