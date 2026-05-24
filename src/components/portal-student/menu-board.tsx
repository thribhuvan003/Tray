"use client";

// Shared constant (matches demo --radius-sm: 10px)
const S_RADIUS_SM = 10;

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import type { MenuItem, MenuCategory } from "@/lib/db/types";
import { getBrowserClient } from "@/lib/supabase/browser";
import { cn, formatRupees } from "@/lib/utils";
import { useCart } from "@/lib/cart/store";
import { toast } from "sonner";
import type { CurrentUser } from "@/lib/auth/get-user";
import { Drawer } from "vaul";

function getCanteenEmoji(slug: string, name: string): string {
  const s = slug.toLowerCase();
  const n = name.toLowerCase();
  if (s.includes("great-hall") || n.includes("great hall")) return "🏰";
  if (s.includes("gryffindor") || n.includes("gryffindor")) return "🦁";
  if (s.includes("slytherin") || n.includes("slytherin")) return "🐍";
  if (s.includes("hufflepuff") || n.includes("hufflepuff")) return "🦡";
  if (s.includes("ravenclaw") || n.includes("ravenclaw")) return "🦅";
  if (s.includes("aditya") || n.includes("aditya")) return "🎓";
  return "🍴";
}

function formatPausedTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function dietEmoji(diet: string): string {
  if (diet === "veg") return "🥬";
  if (diet === "egg") return "🍳";
  return "🍗";
}

type Props = {
  categories: MenuCategory[];
  items: MenuItem[];
  tenantId: string;
  tenantSlug: string;
  tenantName?: string;
  siblings?: any[];
  user?: CurrentUser | null;
  adminName?: string | null;
  isOpen: boolean;
  pausedUntil: string | null;
  pendingCount: number;
  collegeSlug: string | null;
};

export function MenuBoard({
  categories,
  items,
  tenantId,
  tenantSlug,
  tenantName: tenantNameProp,
  siblings = [],
  user,
  adminName = null,
  isOpen: initialIsOpen,
  pausedUntil: initialPausedUntil,
  pendingCount: initialPendingCount,
  collegeSlug,
}: Props) {
  const [activeCat, setActiveCat] = useState<string>("all");
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);
  const [vegOnly, setVegOnly] = useState(false);
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const router = useRouter();

  const [liveStatus, setLiveStatus] = useState({
    isOpen: initialIsOpen,
    pausedUntil: initialPausedUntil,
    pendingCount: initialPendingCount,
  });

  // Derive tenant name from siblings if not passed directly
  const tenantName = useMemo(() => {
    if (tenantNameProp) return tenantNameProp;
    const sib = siblings.find((s: any) => s.slug === tenantSlug);
    return sib?.name ?? tenantSlug;
  }, [tenantNameProp, siblings, tenantSlug]);

  // Sync state with prop updates
  useEffect(() => {
    setLiveStatus({
      isOpen: initialIsOpen,
      pausedUntil: initialPausedUntil,
      pendingCount: initialPendingCount,
    });
  }, [initialIsOpen, initialPausedUntil, initialPendingCount]);

  // Poll live status every 1.5s
  useEffect(() => {
    const sb = getBrowserClient();
    let isMounted = true;
    async function updateStatus() {
      if (!collegeSlug) return;
      try {
        const { data, error } = await (sb as any).rpc("college_canteens", { p_college_slug: collegeSlug });
        if (!error && data && isMounted) {
          const current = (data as any[]).find((c) => c.slug === tenantSlug);
          if (current) {
            setLiveStatus({
              isOpen: current.is_open,
              pausedUntil: current.paused_until,
              pendingCount: Number(current.pending_orders_count || 0),
            });
          }
        }
      } catch (err) {
        console.error("Error polling live status:", err);
      }
    }
    updateStatus();
    const intervalId = setInterval(updateStatus, 1500);
    return () => { isMounted = false; clearInterval(intervalId); };
  }, [collegeSlug, tenantSlug]);

  const statusInfo = useMemo(() => {
    const isClosed = !liveStatus.isOpen;
    const isPaused =
      !isClosed && !!liveStatus.pausedUntil && new Date(liveStatus.pausedUntil) > new Date();
    if (isClosed) return { text: "Kitchen Closed", dotColor: "#ef4444", textColor: "#dc2626" };
    if (isPaused)
      return {
        text: `Kitchen Paused until ${formatPausedTime(liveStatus.pausedUntil!)}`,
        dotColor: "#f59e0b",
        textColor: "#d97706",
      };
    const waitMinutes = Math.min(20, Math.max(3, 3 + liveStatus.pendingCount));
    if (liveStatus.pendingCount >= 10)
      return { text: `Kitchen Busy · ~${waitMinutes} min wait`, dotColor: "#ef4444", textColor: "#dc2626" };
    if (liveStatus.pendingCount >= 5)
      return { text: `Kitchen Moderate · ~${waitMinutes} min wait`, dotColor: "#f59e0b", textColor: "#d97706" };
    return { text: `Kitchen Open · ~${waitMinutes} min wait`, dotColor: "#0c8a43", textColor: "#0c8a43" };
  }, [liveStatus]);

  // Specials category
  const specialsCategory = useMemo(() => categories.find((c) => c.name.toLowerCase() === "specials"), [categories]);
  const specialsItems = useMemo(
    () => (!specialsCategory ? [] : items.filter((it) => it.category_id === specialsCategory.id)),
    [items, specialsCategory]
  );
  const showSpecials = activeCat === "all" || (specialsCategory && activeCat === specialsCategory.id);
  const filteredSpecials = useMemo(() => {
    if (!showSpecials) return [];
    const needle = q.trim().toLowerCase();
    return specialsItems.filter((it) => {
      if (vegOnly && it.diet !== "veg") return false;
      if (!needle) return true;
      return it.name.toLowerCase().includes(needle) || (it.description ?? "").toLowerCase().includes(needle);
    });
  }, [showSpecials, specialsItems, vegOnly, q]);

  // Other items (non-specials)
  const otherItems = useMemo(
    () => (!specialsCategory ? items : items.filter((it) => it.category_id !== specialsCategory.id)),
    [items, specialsCategory]
  );
  const filteredOther = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return otherItems.filter((it) => {
      if (vegOnly && it.diet !== "veg") return false;
      if (!needle) return true;
      return it.name.toLowerCase().includes(needle) || (it.description ?? "").toLowerCase().includes(needle);
    });
  }, [otherItems, vegOnly, q]);

  const byCat = useMemo(() => {
    const m = new Map<string | null, MenuItem[]>();
    for (const it of filteredOther) {
      const k = it.category_id;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(it);
    }
    return m;
  }, [filteredOther]);

  const showOther =
    activeCat === "all" ||
    (!!specialsCategory && activeCat !== specialsCategory.id) ||
    !specialsCategory;

  const activeCategoryList = useMemo(
    () => (activeCat === "all" ? categories : categories.filter((c) => c.id === activeCat)),
    [categories, activeCat]
  );

  // Cart state
  const { orderType, setOrderType, tableLabel, setTableLabel, lines, clear } = useCart();
  const cartDec = useCart((s) => s.decrement);
  const cartInc = useCart((s) => s.increment);
  const cartAdd = useCart((s) => s.add);
  const setCartOpen = useCart((s) => s.setIsOpen);
  const cartCount = lines.reduce((acc, l) => acc + l.qty, 0);
  const cartTotal = lines.reduce((acc, l) => acc + l.pricePaise * l.qty, 0);

  // Realtime subscriptions
  useEffect(() => {
    const sb = getBrowserClient();
    const menuCh = sb
      .channel(`realtime-menu-${tenantId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, (payload) => {
        const newId = (payload.new as any)?.id;
        const oldId = (payload.old as any)?.id;
        const newTenantId = (payload.new as any)?.tenant_id;
        if (
          (newId && items.some((it) => it.id === newId)) ||
          (oldId && items.some((it) => it.id === oldId)) ||
          newTenantId === tenantId
        ) {
          router.refresh();
        }
      })
      .subscribe();
    const tenantCh = sb
      .channel(`realtime-tenant-${tenantId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tenants", filter: `id=eq.${tenantId}` },
        () => router.refresh()
      )
      .subscribe();
    return () => { sb.removeChannel(menuCh); sb.removeChannel(tenantCh); };
  }, [tenantId, router, items]);

  useEffect(() => {
    const handleVisibility = () => { if (document.visibilityState === "visible") router.refresh(); };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [router]);

  const totalFilteredCount = filteredSpecials.length + filteredOther.length;

  // Canteen segment grid columns: 1→1col 2→2col 3+→3col
  const canteenGridCols = siblings.length <= 1 ? 1 : siblings.length === 2 ? 2 : 3;

  function sibWait(sib: any): string {
    if (!sib.is_open) return "Closed";
    const wait = Math.min(20, Math.max(3, 3 + (sib.pending_orders_count ?? 0)));
    return `~${wait} min wait`;
  }

  // ——— Shared inline style constants (matching demo CSS vars) ———
  const S = {
    text: "#1A1A19",
    muted: "rgba(26,26,25,.58)",
    muted2: "rgba(26,26,25,.38)",
    accent: "#334155",
    accentDim: "rgba(51,65,85,.08)",
    border: "rgba(26,26,25,.12)",
    surface: "rgba(26,26,25,.04)",
    surface2: "rgba(26,26,25,.07)",
    fontDisplay: "var(--font-bricolage, 'Bricolage Grotesque', system-ui, sans-serif)",
    fontMono: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
    radius: 14,
    radiusSm: 10,
  } as const;

  return (
    /* shell: 3-column flex row matching demo layout */
    <div style={{ display: "flex", flex: 1, minHeight: 0, position: "relative" }}>

      {/* ——— LEFT: Desktop Category Nav (200px, demo .cat-nav) ——— */}
      <nav
        aria-label="Categories"
        className="hidden lg:block"
        style={{
          width: 200,
          flexShrink: 0,
          padding: "20px 12px 20px 16px",
          borderRight: `1px solid ${S.border}`,
        }}
      >
        <p style={{
          fontFamily: S.fontDisplay,
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: S.muted,
          margin: "0 12px 14px",
        }}>
          Browse
        </p>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          <li>
            <button
              onClick={() => setActiveCat("all")}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 14px",
                borderRadius: S.radiusSm,
                fontSize: 15,
                fontWeight: 500,
                background: activeCat === "all" ? S.accentDim : "transparent",
                boxShadow: activeCat === "all" ? "inset 0 0 0 1px rgba(51,65,85,.15)" : "none",
                color: activeCat === "all" ? S.accent : S.muted,
                cursor: "pointer",
                border: "none",
                transition: "color .2s, background .2s",
                fontFamily: S.fontDisplay,
              }}
            >
              All items
              <span style={{ display: "block", fontSize: 11, color: S.muted2, marginTop: 2, fontWeight: 500 }}>
                {items.length} dishes
              </span>
            </button>
          </li>
          {categories.map((cat) => {
            const cnt = byCat.get(cat.id)?.length ?? 0;
            const isActive = activeCat === cat.id;
            if (cnt === 0 && !isActive) return null;
            return (
              <li key={cat.id}>
                <button
                  onClick={() => setActiveCat(cat.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 14px",
                    borderRadius: S.radiusSm,
                    fontSize: 15,
                    fontWeight: 500,
                    background: isActive ? S.accentDim : "transparent",
                    boxShadow: isActive ? "inset 0 0 0 1px rgba(51,65,85,.15)" : "none",
                    color: isActive ? S.accent : S.muted,
                    cursor: "pointer",
                    border: "none",
                    transition: "color .2s, background .2s",
                    fontFamily: S.fontDisplay,
                  }}
                >
                  {cat.name}
                  <span style={{ display: "block", fontSize: 11, color: S.muted2, marginTop: 2, fontWeight: 500 }}>
                    {cnt} dish{cnt === 1 ? "" : "es"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ——— MIDDLE: Main content (flex-1) ——— */}
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div
          style={{ flex: 1, padding: "24px 28px 40px", maxWidth: 900, width: "100%", margin: "0 auto" }}
          className="px-4 sm:px-5 lg:px-7"
        >

          {/* Menu hero */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontFamily: S.fontMono,
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: statusInfo.textColor,
              marginBottom: 6,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <span style={{
                width: 8, height: 8,
                borderRadius: "50%",
                background: statusInfo.dotColor,
                display: "inline-block",
              }} />
              {statusInfo.text}
            </div>
            <h1 style={{
              fontFamily: S.fontDisplay,
              fontSize: "clamp(1.75rem, 8vw, 42px)",
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: "-0.035em",
              margin: "4px 0 0",
            }}>
              What&apos;s{" "}
              <span style={{ fontStyle: "italic", fontWeight: 400 }}>
                cooking{user
                  ? `, ${user.displayName || user.email?.split("@")[0]}`
                  : " today"}?
              </span>
            </h1>
          </div>

          {/* ——— Menu controls white card (demo .menu-controls) ——— */}
          <div style={{
            marginBottom: 18,
            padding: 16,
            borderRadius: S.radius,
            border: `1px solid ${S.border}`,
            background: "#ffffff",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.65), 0 1px 2px rgba(0,0,0,.05)",
          }}>

            {/* Canteen segments — only shown when college has multiple canteens */}
            {siblings.length > 0 && (
              <>
                <div>
                  <p style={{
                    fontFamily: S.fontDisplay,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(0,0,0,.62)",
                    margin: "0 0 6px",
                  }}>
                    Canteen
                  </p>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${canteenGridCols}, minmax(0, 1fr))`,
                    gap: 8,
                    marginTop: 8,
                  }}>
                    {siblings.map((sib: any) => {
                      const isCurrent = sib.slug === tenantSlug;
                      return (
                        <button
                          key={sib.slug}
                          onClick={() => { if (!isCurrent) router.push(`/c/${sib.slug}/menu`); }}
                          style={{
                            minWidth: 0,
                            padding: "10px 12px",
                            borderRadius: S.radiusSm,
                            border: isCurrent ? "1px solid rgba(51,65,85,.65)" : `1px solid ${S.border}`,
                            background: "#ffffff",
                            boxShadow: isCurrent ? "0 0 0 1px rgba(51,65,85,.15), 0 10px 26px rgba(26,26,25,.10)" : "none",
                            transform: isCurrent ? "translateY(-1px)" : "none",
                            color: S.text,
                            fontFamily: S.fontDisplay,
                            fontSize: 14,
                            fontWeight: 600,
                            textAlign: "left",
                            cursor: isCurrent ? "default" : "pointer",
                            transition: "border-color .15s, box-shadow .15s, transform .15s",
                          }}
                        >
                          {sib.name}
                          <small style={{
                            display: "block",
                            marginTop: 2,
                            fontFamily: S.fontDisplay,
                            fontSize: 12,
                            fontWeight: 500,
                            color: S.muted,
                          }}>
                            {sibWait(sib)}
                          </small>
                        </button>
                      );
                    })}
                  </div>
                  <p style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: "1px solid rgba(0,0,0,.08)",
                    fontFamily: S.fontDisplay,
                    fontSize: 13,
                    fontWeight: 500,
                    color: S.muted,
                    lineHeight: 1.45,
                    marginBottom: 0,
                  }}>
                    Each canteen has its own menu and kitchen queue.
                  </p>
                </div>
                {/* Divider */}
                <div style={{ height: 1, background: "rgba(0,0,0,.08)", margin: "14px 0 12px" }} />
              </>
            )}

            {/* Service bar */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                <p style={{
                  margin: 0,
                  fontFamily: S.fontDisplay,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.11em",
                  textTransform: "uppercase",
                  color: S.muted,
                }}>
                  How are you eating today?
                </p>
                <button
                  type="button"
                  onClick={() => setVegOnly(!vegOnly)}
                  style={{
                    fontFamily: S.fontDisplay,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: vegOnly ? "1px solid rgba(94,224,138,.55)" : `1px solid ${S.border}`,
                    background: vegOnly ? "rgba(94,224,138,.12)" : "transparent",
                    color: vegOnly ? "#0c8a43" : S.muted,
                    cursor: "pointer",
                    transition: "border-color .2s, background .2s, color .2s",
                  }}
                >
                  🌿 Veg only
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {(["takeaway", "dine_in"] as const).map((type) => {
                  const isActive = orderType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setOrderType(type)}
                      style={{
                        textAlign: "left",
                        padding: "14px 14px 12px",
                        borderRadius: S.radiusSm,
                        border: isActive ? "1px solid rgba(51,65,85,.65)" : `1px solid ${S.border}`,
                        background: "#ffffff",
                        boxShadow: isActive ? "0 0 0 1px rgba(51,65,85,.15), 0 10px 26px rgba(26,26,25,.10)" : "none",
                        transform: isActive ? "translateY(-1px)" : "none",
                        cursor: "pointer",
                        color: S.text,
                        transition: "border-color .2s, box-shadow .2s, transform .2s",
                        fontFamily: S.fontDisplay,
                      }}
                    >
                      <span style={{ fontSize: "1.45rem", display: "block", marginBottom: 6 }}>
                        {type === "takeaway" ? "🛍️" : "🍽️"}
                      </span>
                      <span style={{ display: "block", fontWeight: 600, fontSize: 15 }}>
                        {type === "takeaway" ? "Takeaway" : "Dine in"}
                      </span>
                      <span style={{ display: "block", marginTop: 4, fontSize: 13, fontWeight: 500, color: S.muted, lineHeight: 1.4 }}>
                        {type === "takeaway" ? "Counter pickup · OTP handover" : "Mess seating · optional table"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {orderType === "dine_in" && (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{
                    fontFamily: S.fontDisplay,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: S.muted,
                  }}>
                    Table or block (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. T4, Block B"
                    value={tableLabel}
                    onChange={(e) => setTableLabel(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: S.radiusSm,
                      border: `1px solid ${S.border}`,
                      background: "rgba(228,228,228,.72)",
                      fontFamily: S.fontDisplay,
                      fontSize: 14,
                      fontWeight: 500,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ——— Mobile category pills ——— */}
          <div
            className="lg:hidden"
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 16,
              margin: "0 -4px",
              scrollbarWidth: "none",
            }}
          >
            {[{ id: "all", name: "All items" }, ...categories].map((cat) => {
              const isActive = activeCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  style={{
                    flexShrink: 0,
                    padding: "8px 14px",
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: 500,
                    border: isActive ? "1px solid transparent" : `1px solid ${S.border}`,
                    color: isActive ? "#F4EFE6" : S.muted,
                    background: isActive ? S.accent : S.surface,
                    cursor: "pointer",
                    transition: "all .2s",
                    fontFamily: S.fontDisplay,
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Empty state */}
          {totalFilteredCount === 0 && (
            <div style={{ padding: "64px 0", textAlign: "center", color: S.muted }}>
              <div style={{ fontFamily: S.fontDisplay, fontStyle: "italic", fontSize: 24, color: S.accent }}>
                Nothing found.
              </div>
              <p style={{ fontSize: 14, marginTop: 8 }}>
                {q || vegOnly
                  ? "Clear the filters or search term to see more dishes."
                  : "Check back at lunchtime."}
              </p>
            </div>
          )}

          {/* ——— Specials horizontal carousel (demo .specials-carousel) ——— */}
          {showSpecials && filteredSpecials.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 16,
              }}>
                <h2 style={{
                  margin: 0,
                  fontFamily: S.fontDisplay,
                  fontSize: "clamp(1.5rem, 5vw, 1.95rem)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                }}>
                  Today&apos;s <span style={{ fontStyle: "italic" }}>specials.</span>
                </h2>
                <span style={{
                  fontFamily: S.fontMono,
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  color: "#0c8a43",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  whiteSpace: "nowrap",
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0c8a43", display: "inline-block" }} />
                  LIVE FROM KITCHEN
                </span>
              </div>
              {/* Horizontal scroll carousel */}
              <div style={{
                display: "flex",
                gap: 14,
                overflowX: "auto",
                padding: "4px 4px 16px",
                margin: "0 -4px",
                scrollbarWidth: "none",
              }}>
                {filteredSpecials.map((item) => (
                  <SpecialCard key={item.id} item={item} onAdd={cartAdd} onInc={cartInc} onDec={cartDec} />
                ))}
              </div>
            </div>
          )}

          {/* ——— Other menu grid (demo .menu-grid) ——— */}
          {showOther && filteredOther.length > 0 && (
            <div>
              <div style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 16,
              }}>
                <h2 style={{
                  margin: 0,
                  fontFamily: S.fontDisplay,
                  fontSize: "clamp(1.5rem, 5vw, 1.95rem)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                }}>
                  {activeCat === "all"
                    ? "Menu"
                    : (categories.find((c) => c.id === activeCat)?.name ?? "Menu")}
                </h2>
                <p style={{ margin: 0, fontFamily: S.fontMono, fontSize: 12, color: S.muted }}>
                  {filteredOther.length} item{filteredOther.length === 1 ? "" : "s"}
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {activeCategoryList
                  .filter((cat) => !specialsCategory || cat.id !== specialsCategory.id)
                  .map((cat) => {
                    const list = byCat.get(cat.id) ?? [];
                    if (list.length === 0) return null;
                    return (
                      <div key={cat.id}>
                        <h3 style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: S.muted,
                          margin: "0 0 12px",
                          paddingLeft: 8,
                          borderLeft: `2px solid ${S.accent}`,
                          fontFamily: S.fontDisplay,
                        }}>
                          {cat.name}
                        </h3>
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                          gap: 14,
                        }}>
                          {list.map((it) => (
                            <RegularCard key={it.id} item={it} onAdd={cartAdd} onInc={cartInc} onDec={cartDec} />
                          ))}
                        </div>
                      </div>
                    );
                  })}

                {/* Uncategorized items */}
                {activeCat === "all" && (() => {
                  const uncategorised = byCat.get(null) ?? [];
                  if (uncategorised.length === 0) return null;
                  return (
                    <div key="__uncategorised">
                      <h3 style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: S.muted,
                        margin: "0 0 12px",
                        paddingLeft: 8,
                        borderLeft: `2px solid ${S.accent}`,
                        fontFamily: S.fontDisplay,
                      }}>
                        Other
                      </h3>
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                        gap: 14,
                      }}>
                        {uncategorised.map((it) => (
                          <RegularCard key={it.id} item={it} onAdd={cartAdd} onInc={cartInc} onDec={cartDec} />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ——— RIGHT: Persistent Desktop Cart Sidebar (demo .cart-sidebar) ——— */}
      <aside
        className="hidden lg:flex"
        style={{
          width: 320,
          flexShrink: 0,
          flexDirection: "column",
          border: `1px solid ${S.border}`,
          borderRadius: S.radius,
          background: "#ffffff",
          position: "sticky",
          top: "calc(56px + 16px)",
          height: "calc(100dvh - 56px - 32px)",
          alignSelf: "flex-start",
          margin: "16px 16px 16px 8px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)",
          overflow: "hidden",
        }}
      >
        {/* Cart header */}
        <div style={{ padding: "20px 20px 12px", borderBottom: `1px solid ${S.border}` }}>
          <h3 style={{
            margin: 0,
            fontFamily: S.fontDisplay,
            fontSize: "1.5rem",
            fontWeight: 400,
            lineHeight: 1.12,
          }}>
            Your <span style={{ fontStyle: "italic" }}>order.</span>
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: S.muted }}>
            Paying to: {tenantName}
          </p>
        </div>

        {/* Cart lines */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {cartCount === 0 ? (
            <div style={{ padding: "32px 12px", textAlign: "center", color: S.muted, fontSize: 15, lineHeight: 1.5 }}>
              <div style={{ fontSize: 34, opacity: 0.5, marginBottom: 8 }}>🛒</div>
              <p style={{ margin: 0 }}>Your tray is empty.</p>
              <p style={{ margin: "4px 0 0", fontSize: 13 }}>Add items from the menu.</p>
            </div>
          ) : (
            lines.map((l) => (
              <div
                key={l.menuItemId}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  padding: "12px 0",
                  borderBottom: `1px solid ${S.border}`,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 600, lineHeight: 1.3, fontFamily: S.fontDisplay }}>
                    {l.name}
                  </p>
                  <p style={{ margin: 0, fontFamily: S.fontMono, fontSize: 12, color: S.muted }}>
                    {formatRupees(l.pricePaise)} each
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <button
                    aria-label="Decrease"
                    onClick={() => cartDec(l.menuItemId)}
                    style={{
                      width: 28, height: 28,
                      borderRadius: 8,
                      border: `1px solid ${S.border}`,
                      fontSize: 15,
                      cursor: "pointer",
                      background: "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Minus size={12} />
                  </button>
                  <span style={{ fontFamily: S.fontMono, fontSize: 13, minWidth: 18, textAlign: "center" }}>
                    {l.qty}
                  </span>
                  <button
                    aria-label="Increase"
                    onClick={() => cartInc(l.menuItemId)}
                    style={{
                      width: 28, height: 28,
                      borderRadius: 8,
                      border: `1px solid ${S.border}`,
                      fontSize: 15,
                      cursor: "pointer",
                      background: "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart footer */}
        {cartCount > 0 && (
          <div style={{ padding: "16px 20px 20px", borderTop: `1px solid ${S.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <span style={{ color: S.muted, fontSize: 15 }}>Total</span>
              <span style={{
                fontFamily: S.fontDisplay,
                fontSize: "1.35rem",
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                color: S.accent,
              }}>
                {formatRupees(cartTotal)}
              </span>
            </div>
            <button
              onClick={() => setCartOpen(true)}
              style={{
                width: "100%",
                padding: "14px 20px",
                borderRadius: S.radiusSm,
                fontSize: 16,
                fontWeight: 600,
                background: S.accent,
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
                fontFamily: S.fontDisplay,
                transition: "filter .2s, transform .15s",
              }}
            >
              Place order →
            </button>
            <button
              onClick={() => clear()}
              style={{
                width: "100%",
                padding: 12,
                marginTop: 8,
                borderRadius: S.radiusSm,
                fontSize: 15,
                color: S.muted,
                border: `1px solid ${S.border}`,
                background: "transparent",
                cursor: "pointer",
                fontFamily: S.fontDisplay,
              }}
            >
              Clear cart
            </button>
          </div>
        )}
      </aside>

      {/* ——— Mobile Floating Browse Button ——— */}
      <Drawer.Root open={isBrowseOpen} onOpenChange={setIsBrowseOpen}>
        <Drawer.Trigger asChild>
          <button
            type="button"
            className={cn(
              "fixed left-1/2 -translate-x-1/2 z-30 lg:hidden flex items-center gap-2 px-5 py-3 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer text-[13.5px]",
              cartCount > 0 ? "bottom-20" : "bottom-6"
            )}
          >
            <span>🍴</span>
            <span>Browse Menu</span>
          </button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex max-h-[70vh] flex-col rounded-t-3xl bg-[color:var(--color-paper)] border-t border-[color:var(--color-line)] focus:outline-none pb-[env(safe-area-inset-bottom)]">
            <Drawer.Title className="sr-only">Categories</Drawer.Title>
            <div className="mx-auto w-12 h-1.5 rounded-full bg-[color:var(--color-line-strong)] mt-3 mb-2" />
            <div className="px-5 py-3 border-b border-[color:var(--color-line)]">
              <h3 className="font-display text-[18px] font-bold">Browse Menu</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              <button
                onClick={() => { setActiveCat("all"); setIsBrowseOpen(false); }}
                className={cn(
                  "w-full text-left px-4 py-3.5 rounded-2xl text-[14.5px] font-semibold transition-all border flex items-center justify-between",
                  activeCat === "all"
                    ? "bg-ocean-500/10 text-ocean-600 dark:text-ocean-400 font-bold border-ocean-500/20"
                    : "border-[color:var(--color-line)] text-[color:var(--color-ink)] bg-[color:var(--color-paper)]"
                )}
              >
                <span>All items</span>
                <span className="text-[12px] opacity-60 font-normal">
                  {items.filter((it) => !vegOnly || it.diet === "veg").length} items
                </span>
              </button>
              {categories.map((cat) => {
                const catCount = byCat.get(cat.id)?.length ?? 0;
                if (catCount === 0) return null;
                const isActive = activeCat === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCat(cat.id); setIsBrowseOpen(false); }}
                    className={cn(
                      "w-full text-left px-4 py-3.5 rounded-2xl text-[14.5px] font-semibold transition-all border flex items-center justify-between",
                      isActive
                        ? "bg-ocean-500/10 text-ocean-600 dark:text-ocean-400 font-bold border-ocean-500/20"
                        : "border-[color:var(--color-line)] text-[color:var(--color-ink)] bg-[color:var(--color-paper)]"
                    )}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[12px] opacity-60 font-normal">{catCount} items</span>
                  </button>
                );
              })}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}

type CartAddFn = (item: { menuItemId: string; name: string; pricePaise: number; diet: "veg" | "nonveg" | "egg" }) => void;
type CartQtyFn = (menuItemId: string) => void;

/* â”€â”€ SpecialCard: horizontal carousel card (demo .special-card) 220px wide â”€â”€ */
function SpecialCard({
  item,
  onAdd,
  onInc,
  onDec,
}: {
  item: MenuItem;
  onAdd: CartAddFn;
  onInc: CartQtyFn;
  onDec: CartQtyFn;
}) {
  const line = useCart((s) => s.lines.find((l) => l.menuItemId === item.id));
  const oos = !item.in_stock || item.status !== "live";
  const accent = "#334155";
  const border = "rgba(26,26,25,.12)";

  return (
    <article
      style={{
        flexShrink: 0,
        width: 220,
        background: "linear-gradient(145deg, rgba(255,255,255,.65) 0%, rgba(51,65,85,.06) 100%)",
        border: `1px solid ${border}`,
        borderRadius: 14,
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "relative",
        opacity: oos ? 0.6 : 1,
        transition: "border-color .2s, transform .2s, box-shadow .2s",
        cursor: oos ? "not-allowed" : "default",
      }}
      className={oos ? "" : "hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(26,26,25,.08)] hover:border-[rgba(51,65,85,.15)]"}
    >
      {/* SPECIAL badge */}
      <span style={{
        position: "absolute", top: 12, right: 12,
        background: "#b32b2b", color: "#fff",
        fontFamily: "monospace",
        fontSize: 9, letterSpacing: "0.08em",
        padding: "2px 6px", borderRadius: 4,
        fontWeight: 700, textTransform: "uppercase",
      }}>
        SPECIAL
      </span>

      {/* Top row: icon + diet dot */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 12,
          background: item.image_url ? "transparent" : "#fff",
          border: `1px solid ${border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26,
          boxShadow: "0 4px 12px rgba(51,65,85,.06)",
          overflow: "hidden", flexShrink: 0,
        }}>
          {item.image_url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : dietEmoji(item.diet)
          }
        </div>
        <DietDot diet={item.diet} />
      </div>

      {/* Body */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <h3 style={{
          margin: 0,
          fontFamily: "var(--font-bricolage, system-ui)",
          fontSize: 18, fontWeight: 500,
          letterSpacing: "-0.02em", lineHeight: 1.25,
          color: "#1A1A19",
        }}>
          {item.name}
        </h3>
        {item.description && (
          <p style={{ margin: 0, fontSize: 13, color: "rgba(26,26,25,.58)", lineHeight: 1.45 }}>
            {item.description}
          </p>
        )}
      </div>

      {/* Footer: price + qty */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 8 }}>
        <span style={{
          fontFamily: "var(--font-bricolage, system-ui)",
          fontSize: 15, fontWeight: 700,
          fontVariantNumeric: "tabular-nums", color: accent,
        }}>
          {formatRupees(item.price_paise)}
        </span>
        {line ? (
          <QtyControl
            qty={line.qty}
            onDec={() => onDec(item.id)}
            onInc={() => onInc(item.id)}
            disabled={oos}
            btnSize={32}
          />
        ) : (
          <button
            disabled={oos}
            onClick={() => { onAdd({ menuItemId: item.id, name: item.name, pricePaise: item.price_paise, diet: item.diet as "veg" | "nonveg" | "egg" }); toast.success(`Added ${item.name}!`); }}
            style={{
              padding: "6px 12px", borderRadius: S_RADIUS_SM,
              fontSize: 13, fontWeight: 600,
              background: "rgba(51,65,85,.08)", color: accent,
              border: `1px solid ${border}`,
              cursor: oos ? "not-allowed" : "pointer",
              opacity: oos ? 0.5 : 1,
              transition: "background .2s",
              fontFamily: "var(--font-bricolage, system-ui)",
            }}
          >
            + Add

          </button>
        )}
      </div>
    </article>
  );
}

/* ——— RegularCard: horizontal card with 72×72 icon (demo .menu-card) ——— */
function RegularCard({
  item,
  onAdd,
  onInc,
  onDec,
}: {
  item: MenuItem;
  onAdd: CartAddFn;
  onInc: CartQtyFn;
  onDec: CartQtyFn;
}) {
  const line = useCart((s) => s.lines.find((l) => l.menuItemId === item.id));
  const oos = !item.in_stock || item.status !== "live";
  const accent = "#334155";
  const border = "rgba(26,26,25,.12)";

  return (
    <article
      style={{
        display: "flex", gap: 14,
        padding: 16, borderRadius: 14,
        border: `1px solid ${border}`,
        background: "linear-gradient(145deg, rgba(255,255,255,.35) 0%, rgba(255,255,255,.1) 100%)",
        transition: "border-color .2s, transform .2s, box-shadow .2s",
        opacity: oos ? 0.6 : 1,
      }}
      className={oos ? "" : "hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(26,26,25,.08)] hover:border-[rgba(51,65,85,.15)]"}
    >
      {/* 72Ã—72 icon */}
      <div style={{
        width: 72, height: 72, borderRadius: 12, flexShrink: 0,
        background: "rgba(26,26,25,.07)",
        display: "grid", placeItems: "center",
        fontSize: 30, border: `1px solid rgba(26,26,25,.08)`,
        overflow: "hidden",
      }}>
        {item.image_url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : dietEmoji(item.diet)
        }
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <h3 style={{
            margin: 0,
            fontFamily: "var(--font-bricolage, system-ui)",
            fontSize: 17, fontWeight: 500,
            letterSpacing: "-0.015em", lineHeight: 1.25,
            color: "#1A1A19",
          }}>
            {item.name}
          </h3>
          <DietDot diet={item.diet} />
        </div>
        {item.description && (
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "rgba(26,26,25,.58)", lineHeight: 1.45 }}>
            {item.description}
          </p>
        )}
        <div style={{
          marginTop: "auto", paddingTop: 12,
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 10,
        }}>
          <span style={{
            fontFamily: "var(--font-bricolage, system-ui)",
            fontSize: 15, fontWeight: 700,
            fontVariantNumeric: "tabular-nums", color: accent,
          }}>
            {formatRupees(item.price_paise)}
          </span>
          {line ? (
            <QtyControl
              qty={line.qty}
              onDec={() => onDec(item.id)}
              onInc={() => onInc(item.id)}
              disabled={oos}
              btnSize={38}
            />
          ) : (
            <button
              disabled={oos}
              onClick={() => { onAdd({ menuItemId: item.id, name: item.name, pricePaise: item.price_paise, diet: item.diet as "veg" | "nonveg" | "egg" }); toast.success(`Added ${item.name}!`); }}
              style={{
                padding: "8px 14px", borderRadius: S_RADIUS_SM,
                fontSize: 14, fontWeight: 600,
                background: "rgba(51,65,85,.08)", color: accent,
                border: `1px solid ${border}`,
                cursor: oos ? "not-allowed" : "pointer",
                opacity: oos ? 0.5 : 1,
                transition: "background .2s, transform .15s",
                fontFamily: "var(--font-bricolage, system-ui)",
              }}
            >
              + Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/* â”€â”€ Shared qty stepper control (demo .qty-control) â”€â”€ */
function QtyControl({
  qty, onDec, onInc, disabled, btnSize,
}: {
  qty: number; onDec: () => void; onInc: () => void; disabled: boolean; btnSize: number;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      borderRadius: S_RADIUS_SM, border: "1px solid rgba(26,26,25,.12)",
      overflow: "hidden", background: "rgba(228,228,228,.72)",
    }}>
      <button
        aria-label="Decrease"
        disabled={disabled}
        onClick={onDec}
        style={{
          width: btnSize, height: btnSize,
          display: "grid", placeItems: "center",
          fontSize: 19, fontWeight: 500,
          cursor: disabled ? "not-allowed" : "pointer",
          background: "transparent", border: "none",
          color: "#1A1A19",
          transition: "background .15s",
        }}
      >
        <Minus size={Math.round(btnSize * 0.37)} />
      </button>
      <span style={{
        minWidth: btnSize - 8, textAlign: "center",
        fontFamily: "var(--font-jetbrains, monospace)",
        fontSize: 14, fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
      }}>
        {qty}
      </span>
      <button
        aria-label="Increase"
        disabled={disabled}
        onClick={onInc}
        style={{
          width: btnSize, height: btnSize,
          display: "grid", placeItems: "center",
          fontSize: 19, fontWeight: 500,
          cursor: disabled ? "not-allowed" : "pointer",
          background: "transparent", border: "none",
          color: "#334155",
          transition: "background .15s",
        }}
      >
        <Plus size={Math.round(btnSize * 0.37)} />
      </button>
    </div>
  );
}

/* â”€â”€ FSSAI diet indicator dot (demo .diet-dot) â”€â”€ */
function DietDot({ diet }: { diet: string }) {
  const color =
    diet === "veg" ? "#0c8a43" : diet === "egg" ? "#f59e0b" : "#b32b2b";
  return (
    <span style={{
      width: 18, height: 18,
      border: `2px solid ${color}`,
      borderRadius: 3,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      marginTop: 4,
      background: "#ffffff",
    }}>
      {diet === "nonveg" ? (
        <span style={{
          width: 0, height: 0,
          borderLeft: "4.5px solid transparent",
          borderRight: "4.5px solid transparent",
          borderBottom: `8px solid ${color}`,
          display: "block",
        }} />
      ) : (
        <span style={{
          height: 8, width: 8,
          borderRadius: "50%",
          background: color,
          display: "block",
        }} />
      )}
    </span>
  );
}

// (S_RADIUS_SM is defined at the top of the file)

