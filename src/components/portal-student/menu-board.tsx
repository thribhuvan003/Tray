"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MenuItem, MenuCategory } from "@/lib/db/types";
import { MenuItemCard } from "./menu-item-card";

type Props = { categories: MenuCategory[]; items: MenuItem[] };
type DietFilter = "all" | "veg" | "nonveg";

export function MenuBoard({ categories, items }: Props) {
  const [activeCat, setActiveCat] = useState("all");
  const [diet, setDiet] = useState<DietFilter>("all");
  const [q, setQ] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onFocus = () => searchRef.current?.focus();
    window.addEventListener("tray:focus-search", onFocus);
    return () => window.removeEventListener("tray:focus-search", onFocus);
  }, []);

  const liveItems = items.filter((item) => item.status === "live");
  const categoryList = [{ id: "all", name: "All" }, ...categories.map((c) => ({ id: c.id, name: c.name }))];

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return liveItems.filter((it) => {
      if (activeCat !== "all" && it.category_id !== activeCat) return false;
      if (diet !== "all" && (diet === "veg" ? it.diet !== "veg" : it.diet === "veg")) return false;
      if (!needle) return true;
      return it.name.toLowerCase().includes(needle) || (it.description ?? "").toLowerCase().includes(needle);
    });
  }, [activeCat, diet, liveItems, q]);

  const byCat = useMemo(() => {
    const m = new Map<string | null, MenuItem[]>();
    for (const it of filtered) {
      const k = it.category_id;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(it);
    }
    return m;
  }, [filtered]);

  return (
    <>
      <div className="menu-hero container">
        <div>
          <span className="eyebrow">Today&apos;s menu</span>
          <h1>
            What&apos;s <span className="it">cooking.</span>
          </h1>
        </div>
        <div className="meta">
          <span>
            <span className="pulse-dot" style={{ color: "var(--ok)", display: "inline-block", verticalAlign: "middle", marginRight: 6 }} />
            Kitchen open - ~7 min wait
          </span>
          <span className="hide-mobile">-</span>
          <span className="hide-mobile">{liveItems.length} dishes available</span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 16, paddingBottom: 12 }}>
        <label className="search" style={{ display: "block", maxWidth: 620, position: "relative" }}>
          <input
            ref={searchRef}
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search dishes, e.g. biryani, chai..."
          />
        </label>
      </div>

      <div className="diet-bar container" id="diet-bar">
        <button className={`diet-tab ${diet === "all" ? "is-active" : ""}`} onClick={() => setDiet("all")}>
          <span className="veg-dot" />
          <span className="veg-dot nv" />
          All
        </button>
        <button className={`diet-tab ${diet === "veg" ? "is-active" : ""}`} onClick={() => setDiet("veg")}>
          <span className="veg-dot" />
          Vegetarian
        </button>
        <button className={`diet-tab ${diet === "nonveg" ? "is-active" : ""}`} onClick={() => setDiet("nonveg")}>
          <span className="veg-dot nv" />
          Non-vegetarian
        </button>
      </div>

      <div className="catrail" id="catrail">
        {categoryList.map((cat) => {
          const count = cat.id === "all" ? liveItems.length : liveItems.filter((it) => it.category_id === cat.id).length;
          return (
            <button key={cat.id} className={`cat ${activeCat === cat.id ? "active" : ""}`} onClick={() => setActiveCat(cat.id)}>
              <span>{cat.name}</span>
              <span className="ct">{count}</span>
            </button>
          );
        })}
      </div>

      <div id="menu-host">
        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">0</div>
            <div>No dishes match.</div>
          </div>
        ) : activeCat === "all" ? (
          categories.map((cat) => {
            const list = byCat.get(cat.id) ?? [];
            if (!list.length) return null;
            return (
              <section className="menu-section" key={cat.id}>
                <h2>
                  {cat.name}
                  <span className="ct">{String(list.length).padStart(2, "0")} items</span>
                </h2>
                <div className="menu-grid">
                  {list.map((item) => <MenuItemCard key={item.id} item={item} />)}
                </div>
              </section>
            );
          })
        ) : (
          <section className="menu-section">
            <div className="menu-grid">
              {filtered.map((item) => <MenuItemCard key={item.id} item={item} />)}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
