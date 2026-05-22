"use client";
import { Minus, Plus } from "lucide-react";
import type { MenuItem } from "@/lib/db/types";
import { formatRupees, cn } from "@/lib/utils";
import { useCart } from "@/lib/cart/store";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function MenuItemCard({ item }: { item: MenuItem }) {
  const line = useCart((s) => s.lines.find((l) => l.menuItemId === item.id));
  const add = useCart((s) => s.add);
  const inc = useCart((s) => s.increment);
  const dec = useCart((s) => s.decrement);
  const oos = !item.in_stock || item.status !== "live";

  const dietRing =
    item.diet === "veg"
      ? "border-emerald-600 text-emerald-600"
      : item.diet === "egg"
      ? "border-amber-600 text-amber-600"
      : "border-rose-600 text-rose-600";
  const dietFill =
    item.diet === "veg" ? "bg-emerald-600" : item.diet === "egg" ? "bg-amber-600" : "bg-rose-600";

  return (
    <article
      className={cn(
        "group relative rounded-2xl border bg-[color:var(--color-paper)] overflow-hidden flex flex-col transition-all",
        oos ? "opacity-60" : "border-[color:var(--color-line)] hover:border-ocean-500/40 hover:shadow-[0_8px_24px_-12px_rgba(10,22,40,0.12)]"
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={item.image_url} 
            alt={item.name} 
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div
            className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
            style={{
              background:
                item.diet === "veg"
                  ? "linear-gradient(135deg,#e8f5e9,#a5d6a7)"
                  : item.diet === "egg"
                  ? "linear-gradient(135deg,#fff8e1,#ffe082)"
                  : "linear-gradient(135deg,#fce4ec,#ef9a9a)",
            }}
          />
        )}
        
        {/* Premium FSSAI badge with hover rotation and shape accuracy */}
        <motion.span
          aria-label={item.diet}
          className={cn(
            "absolute top-3 left-3 inline-flex h-5 w-5 items-center justify-center border-2 rounded-sm bg-white z-10 shadow-sm",
            dietRing
          )}
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {item.diet === "nonveg" ? (
            <span className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8.5px] border-b-rose-600 block" />
          ) : (
            <span className={cn("h-2.5 w-2.5 rounded-full block", dietFill)} />
          )}
        </motion.span>

        {oos && (
          <span className="absolute top-2 right-2 text-[10px] font-mono uppercase tracking-wider bg-[color:var(--color-paper)]/90 text-[color:var(--color-ink)]/70 px-2 py-1 rounded-full">
            Out of stock
          </span>
        )}
      </div>
      <div className="p-3.5 flex flex-col flex-1 gap-1.5">
        <h3 className="text-[15px] font-semibold leading-tight" style={{ fontFamily: "var(--font-jakarta, var(--font-manrope))" }}>{item.name}</h3>
        {item.description && (
          <p className="text-[12px] leading-[1.4] text-[color:var(--color-ink)]/55 line-clamp-2">
            {item.description}
          </p>
        )}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div
            className="text-[20px] font-bold leading-none tracking-[0.01em] text-ocean-500 tabular"
          >
            {formatRupees(item.price_paise)}
          </div>
          {line ? (
            <motion.div 
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="inline-flex items-center rounded-full bg-ocean-500 text-black"
            >
              <button
                aria-label="Decrease"
                onClick={() => dec(item.id)}
                className="h-8 w-8 inline-flex items-center justify-center transition-opacity hover:opacity-75"
              >
                <Minus size={14} />
              </button>
              <span className="text-[13px] font-bold tabular w-5 text-center">{line.qty}</span>
              <button
                aria-label="Increase"
                onClick={() => inc(item.id)}
                className="h-8 w-8 inline-flex items-center justify-center transition-opacity hover:opacity-75"
              >
                <Plus size={14} />
              </button>
            </motion.div>
          ) : (
            <motion.button
              disabled={oos}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                add({
                  menuItemId: item.id,
                  name: item.name,
                  pricePaise: item.price_paise,
                  diet: item.diet,
                });
                const nameLower = item.name.toLowerCase();
                let message = `Added ${item.name} to your tray!`;
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
              className={cn(
                "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12.5px] font-semibold transition-colors",
                oos
                  ? "bg-[color:var(--color-line)] text-[color:var(--color-ink)]/40 cursor-not-allowed"
                  : "bg-ocean-500 text-black hover:bg-ocean-600"
              )}
            >
              <Plus size={14} /> Add
            </motion.button>
          )}
        </div>
      </div>
    </article>
  );
}
