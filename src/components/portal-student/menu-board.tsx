"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Minus, Plus } from "lucide-react";
import type { MenuItem, MenuCategory } from "@/lib/db/types";
import { getBrowserClient } from "@/lib/supabase/browser";
import { MenuItemCard } from "./menu-item-card";
import { cn, formatRupees } from "@/lib/utils";
import { useCart } from "@/lib/cart/store";
import { toast } from "sonner";
import { motion } from "framer-motion";

type Props = {
  categories: MenuCategory[];
  items: MenuItem[];
  tenantId: string;
  tenantSlug: string;
  siblings?: any[];
};

export function MenuBoard({ categories, items, tenantId, tenantSlug, siblings = [] }: Props) {
  const [activeCat, setActiveCat] = useState<string>("all");
  const [vegOnly, setVegOnly] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();

  const specialsCategory = useMemo(() => {
    return categories.find(c => c.name.toLowerCase() === "specials");
  }, [categories]);

  const specialsItems = useMemo(() => {
    if (!specialsCategory) return [];
    return items.filter(it => it.category_id === specialsCategory.id);
  }, [items, specialsCategory]);

  const showSpecials = activeCat === "all" || (specialsCategory && activeCat === specialsCategory.id);
  const visibleSpecials = useMemo(() => {
    if (!showSpecials || specialsItems.length === 0 || q.trim() !== "") return [];
    return specialsItems.filter(it => !vegOnly || it.diet === "veg");
  }, [showSpecials, specialsItems, q, vegOnly]);

  const { orderType, setOrderType, tableLabel, setTableLabel } = useCart();

  useEffect(() => {
    const sb = getBrowserClient();
    
    // Subscribe to menu_items changes with robust client-side filter
    // to bypass PostgreSQL REPLICA IDENTITY DEFAULT constraints
    const menuCh = sb
      .channel(`realtime-menu-${tenantId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_items" },
        (payload) => {
          const newId = (payload.new as any)?.id;
          const oldId = (payload.old as any)?.id;
          const newTenantId = (payload.new as any)?.tenant_id;
          
          const isOurItem = 
            (newId && items.some(it => it.id === newId)) ||
            (oldId && items.some(it => it.id === oldId)) ||
            (newTenantId === tenantId);
            
          if (isOurItem) {
            router.refresh();
          }
        }
      )
      .subscribe();

    // Subscribe to tenants changes for this tenant
    const tenantCh = sb
      .channel(`realtime-tenant-${tenantId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tenants", filter: `id=eq.${tenantId}` },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      sb.removeChannel(menuCh);
      sb.removeChannel(tenantCh);
    };
  }, [tenantId, router, items]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [router]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((it) => {
      if (vegOnly && it.diet !== "veg") return false;
      if (!needle) return true;
      return it.name.toLowerCase().includes(needle) || (it.description ?? "").toLowerCase().includes(needle);
    });
  }, [items, vegOnly, q]);

  const byCat = useMemo(() => {
    const m = new Map<string | null, MenuItem[]>();
    for (const it of filtered) {
      const k = it.category_id;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(it);
    }
    return m;
  }, [filtered]);

  const activeCategoryList = useMemo(() => {
    if (activeCat === "all") return categories;
    return categories.filter((c) => c.id === activeCat);
  }, [categories, activeCat]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:max-w-none pt-4 pb-10 lg:grid lg:grid-cols-[14rem,1fr] lg:gap-8 lg:items-start">
      
      {/* ── Desktop Category Sidebar (.cat-nav) ── */}
      <nav className="hidden lg:block w-56 shrink-0 sticky top-20 self-start" aria-label="Categories">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-ink)]/45 mb-3 px-3">
          Browse
        </p>
        <ul className="flex flex-col gap-1">
          <li>
            <button
              onClick={() => setActiveCat("all")}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-xl text-[14px] font-semibold transition-all border",
                activeCat === "all"
                  ? "bg-ocean-500/10 text-ocean-600 dark:text-ocean-400 font-bold border-ocean-500/20"
                  : "border-transparent text-[color:var(--color-ink)]/65 hover:bg-[color:var(--color-paper-dim)]"
              )}
            >
              All items
            </button>
          </li>
          {categories.map((cat) => {
            const catItemsCount = byCat.get(cat.id)?.length ?? 0;
            if (catItemsCount === 0) return null;
            return (
              <li key={cat.id}>
                <button
                  onClick={() => setActiveCat(cat.id)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-xl text-[14px] font-semibold transition-all border",
                    activeCat === cat.id
                      ? "bg-ocean-500/10 text-ocean-600 dark:text-ocean-400 font-bold border-ocean-500/20"
                      : "border-transparent text-[color:var(--color-ink)]/65 hover:bg-[color:var(--color-paper-dim)]"
                  )}
                >
                  {cat.name}
                  <span className="block text-[11px] text-[color:var(--color-ink)]/45 font-medium mt-0.5">
                    {catItemsCount} items
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Main content area ── */}
      <div className="min-w-0">
        
        {/* signature welcome greeting */}
        <div className="mb-6">
          <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[color:var(--color-ink)]/45 mb-1.5 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Kitchen open · ~7 min wait
          </div>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight leading-none text-[color:var(--color-ink)]" style={{ fontFamily: "var(--font-bricolage)" }}>
            What's <span className="it">cooking, Ananya?</span>
          </h1>
        </div>

        {/* ── .menu-controls block ── */}
        <div className="mb-6 p-5 rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-paper-dim)] shadow-sm flex flex-col gap-5">
          {/* Canteen Selector / Switcher */}
          {siblings.length > 1 && (
            <div className="canteen-bar">
              <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[color:var(--color-ink)]/55 mb-2.5">
                Canteen
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {siblings.map((sib) => {
                  const isActive = sib.slug === tenantSlug;
                  return (
                    <button
                      key={sib.slug}
                      type="button"
                      onClick={() => {
                        if (!isActive) {
                          router.push(`/c/${sib.slug}/menu`);
                        }
                      }}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all hover:bg-[color:var(--color-paper)]",
                        isActive
                          ? "border-ocean-500 bg-[color:var(--color-paper)] shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
                          : "border-[color:var(--color-line)] bg-[color:var(--color-paper)]/50"
                      )}
                    >
                      <div className="font-bold text-[14px] truncate">{sib.name}</div>
                      <div className="text-[11px] text-[color:var(--color-ink)]/55 mt-0.5">
                        {sib.building || "Campus block"} · {sib.dishCount ?? 0} dishes
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {siblings.length > 1 && (
            <div className="h-px bg-[color:var(--color-line)]" />
          )}

          {/* Eating modes & Veg only */}
          <div className="service-bar">
            <div className="flex items-center justify-between gap-4 mb-3.5">
              <p className="text-[12px] font-bold uppercase tracking-[0.11em] text-[color:var(--color-ink)]/55">
                How are you eating today?
              </p>
              <button
                type="button"
                onClick={() => setVegOnly(!vegOnly)}
                className={cn(
                  "text-[12px] font-bold uppercase tracking-[0.06em] py-1.5 px-3.5 rounded-full border transition-all flex items-center gap-1",
                  vegOnly
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                    : "border-[color:var(--color-line)] text-[color:var(--color-ink)]/55 bg-[color:var(--color-paper)] hover:bg-[color:var(--color-paper-dim)]"
                )}
              >
                🌿 Veg only
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType("takeaway")}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all hover:bg-[color:var(--color-paper)]",
                  orderType === "takeaway"
                    ? "border-ocean-500 bg-[color:var(--color-paper)] shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
                    : "border-[color:var(--color-line)] bg-[color:var(--color-paper)]/50"
                )}
              >
                <span className="text-xl block mb-1">🥡</span>
                <span className="font-bold text-[15px] block">Takeaway</span>
                <span className="text-[12px] text-[color:var(--color-ink)]/55 block mt-0.5 leading-relaxed">
                  Counter pickup · OTP handover
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType("dine_in")}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all hover:bg-[color:var(--color-paper)]",
                  orderType === "dine_in"
                    ? "border-ocean-500 bg-[color:var(--color-paper)] shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
                    : "border-[color:var(--color-line)] bg-[color:var(--color-paper)]/50"
                )}
              >
                <span className="text-xl block mb-1">🍽</span>
                <span className="font-bold text-[15px] block">Dine in</span>
                <span className="text-[12px] text-[color:var(--color-ink)]/55 block mt-0.5 leading-relaxed">
                  Mess seating · optional table
                </span>
              </button>
            </div>

            {orderType === "dine_in" && (
              <div className="mt-4 flex flex-col gap-1.5 animate-in fade-in duration-200">
                <label htmlFor="tableInput" className="text-[12px] font-bold uppercase tracking-[0.1em] text-[color:var(--color-ink)]/55">
                  Table or block (optional)
                </label>
                <input
                  id="tableInput"
                  type="text"
                  placeholder="e.g. T4, Block B"
                  value={tableLabel}
                  onChange={(e) => setTableLabel(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-paper)] text-[14px] focus:outline-none focus:border-ocean-500 focus:bg-[color:var(--color-paper)]"
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile Category Pills (.cat-pills) ── */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-none -mx-4 px-4 sticky top-16 bg-[color:var(--color-paper)]/95 backdrop-blur-md z-20 border-b border-[color:var(--color-line)] py-2.5">
          <button
            onClick={() => setActiveCat("all")}
            className={cn(
              "shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold border transition-all",
              activeCat === "all"
                ? "border-ocean-500 bg-ocean-500/10 text-ocean-600 dark:text-ocean-400 font-bold"
                : "border-[color:var(--color-line)] bg-[color:var(--color-paper-dim)] text-[color:var(--color-ink)]/65"
            )}
          >
            All items
          </button>
          {categories.map((cat) => {
            const catItemsCount = byCat.get(cat.id)?.length ?? 0;
            if (catItemsCount === 0) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={cn(
                  "shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold border transition-all",
                  activeCat === cat.id
                    ? "border-ocean-500 bg-ocean-500/10 text-ocean-600 dark:text-ocean-400 font-bold"
                    : "border-[color:var(--color-line)] bg-[color:var(--color-paper-dim)] text-[color:var(--color-ink)]/65"
                )}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* ── Search Bar ── */}
        <div className="mb-6">
          <label className="relative block">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--color-ink)]/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search menu items…"
              className="w-full h-11 pl-11 pr-4 rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-paper-dim)] text-[14px] focus:outline-none focus:border-ocean-500 focus:bg-[color:var(--color-paper)]"
            />
          </label>
        </div>

        {/* Today's Specials Section */}
        {visibleSpecials.length > 0 && (
          <div className="mb-8 animate-in fade-in duration-300">
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <h2 className="font-display text-[22px] sm:text-[26px] font-medium tracking-tight animate-fade-in" style={{ fontFamily: "var(--font-bricolage)" }}>
                  Today's <span className="it">specials.</span>
                </h2>
                <p className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/45">
                  Live from kitchen
                </p>
              </div>
              <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-[color:var(--color-accent)] mb-1 flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                Just Added
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4">
              {visibleSpecials.map((item) => (
                <SpecialCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* ── Menu Grid ── */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[color:var(--color-ink)]/55">
            <div className="font-display italic text-[24px] text-ocean-500">Nothing found.</div>
            <p className="text-[14px] mt-2">
              {q || vegOnly
                ? "Clear the filters or search term to see more dishes."
                : "Check back at lunchtime."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {activeCategoryList.map((cat) => {
              const list = byCat.get(cat.id) ?? [];
              if (list.length === 0) return null;
              return (
                <section key={cat.id} className="animate-in fade-in duration-300">
                  <div className="flex items-end justify-between mb-4 border-b border-[color:var(--color-line)] pb-2">
                    <h2 className="font-display text-[22px] sm:text-[26px] font-medium tracking-tight">
                      {cat.name}
                    </h2>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/45">
                      {list.length} item{list.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 2xl:grid-cols-3 gap-3">
                    {list.map((it) => (
                      <MenuItemCard key={it.id} item={it} />
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Uncategorized items */}
            {(activeCat === "all" || activeCat === "uncategorised") && (() => {
              const uncategorised = byCat.get(null) ?? [];
              if (uncategorised.length === 0) return null;
              return (
                <section key="__uncategorised" className="animate-in fade-in duration-300">
                  {categories.length > 0 && (
                    <div className="flex items-end justify-between mb-4 border-b border-[color:var(--color-line)] pb-2">
                      <h2 className="font-display text-[22px] sm:text-[26px] font-medium tracking-tight">Other</h2>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/45">
                        {uncategorised.length} item{uncategorised.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 2xl:grid-cols-3 gap-3">
                    {uncategorised.map((it) => (
                      <MenuItemCard key={it.id} item={it} />
                    ))}
                  </div>
                </section>
              );
            })()}
          </div>
        )}

      </div>
    </div>
  );
}

function SpecialCard({ item }: { item: MenuItem }) {
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

  const nameParts = item.name.split(" ");
  const lastName = nameParts[nameParts.length - 1];
  const firstNames = nameParts.slice(0, -1).join(" ");

  return (
    <article
      className={cn(
        "group relative w-56 shrink-0 rounded-2xl border bg-gradient-to-br from-white/65 to-[color:var(--color-ink)]/5 dark:from-white/10 dark:to-white/0 p-4.5 flex flex-col gap-3 transition-all",
        oos ? "opacity-60 border-[color:var(--color-line)]" : "border-[color:var(--color-line)] hover:border-ocean-500/40 hover:-translate-y-1 hover:shadow-md"
      )}
    >
      <span className="absolute top-4.5 right-4.5 bg-rose-600 text-white text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded uppercase z-10 shadow-sm">
        NEW
      </span>

      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center font-serif italic text-2xl text-ocean-500 border border-[color:var(--color-line)] bg-white dark:bg-neutral-800"
            style={{
              background:
                item.diet === "veg"
                  ? "linear-gradient(135deg,#e8f5e9,#a5d6a7)"
                  : item.diet === "egg"
                  ? "linear-gradient(135deg,#fff8e1,#ffe082)"
                  : "linear-gradient(135deg,#fce4ec,#ef9a9a)",
            }}
          >
            {item.name.charAt(0)}
          </div>
        )}

        {/* FSSAI Badge absolute on bottom-right of thumbnail */}
        <motion.span
          aria-label={item.diet}
          className={cn(
            "absolute bottom-0 right-0 inline-flex h-4.5 w-4.5 items-center justify-center border bg-white z-10 rounded-tl-md shadow-sm",
            dietRing
          )}
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {item.diet === "nonveg" ? (
            <span className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[7px] border-b-rose-600 block" />
          ) : (
            <span className={cn("h-2.5 w-2.5 rounded-full block", dietFill)} />
          )}
        </motion.span>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-[16px] font-semibold leading-tight text-[color:var(--color-ink)]" style={{ fontFamily: "var(--font-bricolage)" }}>
          {firstNames} <span className="it">{lastName}.</span>
        </h3>
        {item.description && (
          <p className="text-[12px] leading-[1.4] text-[color:var(--color-ink)]/55 line-clamp-2">
            {item.description}
          </p>
        )}
      </div>

      <div className="mt-auto pt-3 flex items-center justify-between gap-2">
        <div className="text-[17px] font-bold tabular tracking-[0.01em] text-ocean-500">
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
              disabled={oos}
              onClick={() => dec(item.id)}
              className="h-8 w-8 inline-flex items-center justify-center transition-opacity hover:opacity-75"
            >
              <Minus size={14} />
            </button>
            <span className="text-[13px] font-bold tabular w-5 text-center">{line.qty}</span>
            <button
              aria-label="Increase"
              disabled={oos}
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
    </article>
  );
}
