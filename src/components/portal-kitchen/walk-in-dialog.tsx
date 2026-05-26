"use client";

import { useEffect, useState, useTransition } from "react";
import { Minus, Plus, Search, ShoppingCart, X } from "lucide-react";
import { toast } from "sonner";
import { getBrowserClient } from "@/lib/supabase/browser";
import { formatRupees, cn } from "@/lib/utils";
import { createWalkInOrder } from "@/app/(kitchen)/_actions";

type MenuItem = {
  id: string;
  name: string;
  price_paise: number;
  diet: "veg" | "nonveg" | "egg";
  category?: string | null;
};

const DIET_COLOR = {
  veg: "#22c55e",
  nonveg: "#ef4444",
  egg: "#f59e0b",
};

export function WalkInDialog({
  tenantId,
  tenantSlug,
  open,
  onClose,
  onCreated,
}: {
  tenantId: string;
  tenantSlug: string;
  open: boolean;
  onClose: () => void;
  onCreated: (shortCode: string) => void;
}) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [customerName, setCustomerName] = useState("");
  const [orderType, setOrderType] = useState<"takeaway" | "dine_in">("takeaway");
  const [tableLabel, setTableLabel] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!open) return;
    const sb = getBrowserClient();
    sb.from("menu_items")
      .select("id, name, price_paise, diet")
      .eq("tenant_id", tenantId)
      .eq("status", "live")
      .eq("in_stock", true)
      .order("sort_order")
      .limit(80)
      .returns<MenuItem[]>()
      .then(({ data }) => setItems(data ?? []));
  }, [open, tenantId]);

  useEffect(() => {
    if (!open) {
      setCart(new Map());
      setSearch("");
      setCustomerName("");
      setOrderType("takeaway");
      setTableLabel("");
    }
  }, [open]);

  if (!open) return null;

  const filtered = search
    ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : items;

  const setQty = (id: string, qty: number) => {
    setCart((prev) => {
      const next = new Map(prev);
      if (qty <= 0) next.delete(id);
      else next.set(id, Math.min(20, qty));
      return next;
    });
  };

  const total = Array.from(cart.entries()).reduce((acc, [id, qty]) => {
    const item = items.find((i) => i.id === id);
    return acc + (item?.price_paise ?? 0) * qty;
  }, 0);

  const cartCount = Array.from(cart.values()).reduce((a, b) => a + b, 0);

  const submit = () => {
    if (cart.size === 0) { toast.error("Add at least one item"); return; }
    if (orderType === "dine_in" && !tableLabel.trim()) { toast.error("Enter a table number"); return; }

    start(async () => {
      const r = await createWalkInOrder({
        items: Array.from(cart.entries()).map(([itemId, qty]) => ({ itemId, qty })),
        customerName: customerName.trim() || undefined,
        orderType,
        tableLabel: tableLabel.trim() || undefined,
        paymentMethod: "cash",
      });
      if (r.ok && r.shortCode) {
        toast.success(`Order #${r.shortCode} added to queue!`);
        onCreated(r.shortCode);
        onClose();
      } else {
        toast.error(r.error ?? "Failed to create order");
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full sm:max-w-lg flex flex-col"
        style={{
          background: "var(--kt-paper)",
          borderRadius: "14px 14px 0 0",
          maxHeight: "90vh",
          border: "1px solid var(--kt-line)",
          boxShadow: "0 -4px 0 var(--kt-ink)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--kt-line)",
          }}
        >
          <div>
            <div style={{ fontFamily: "var(--font-newsreader), ui-serif, Georgia", fontSize: "20px", fontWeight: 500, color: "var(--kt-ink)" }}>
              Walk-in <span style={{ fontStyle: "italic", color: "var(--kt-tomato)" }}>order</span>
            </div>
            <div style={{ fontFamily: "var(--font-jetbrains), ui-monospace, monospace", fontSize: "10px", color: "var(--kt-ink-3)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "2px" }}>
              Cash payment at counter
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ height: "36px", width: "36px", borderRadius: "8px", border: "1px solid var(--kt-line)", background: "var(--kt-cream-4)", color: "var(--kt-ink-2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--kt-line)", flexShrink: 0 }}>
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--kt-ink-3)" }} />
            <input
              type="text"
              placeholder="Search items…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                height: "40px",
                paddingLeft: "32px",
                paddingRight: "12px",
                borderRadius: "8px",
                border: "1px solid var(--kt-line-2)",
                background: "var(--kt-cream-4)",
                color: "var(--kt-ink)",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Menu list */}
        <div className="overflow-y-auto flex-1" style={{ padding: "8px 16px", gap: "6px", display: "flex", flexDirection: "column" }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--kt-ink-3)", padding: "32px 0", fontSize: "13px" }}>No items found</div>
          )}
          {filtered.map((item) => {
            const qty = cart.get(item.id) ?? 0;
            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${qty > 0 ? "var(--kt-tomato)" : "var(--kt-line)"}`,
                  background: qty > 0 ? "rgba(200,50,20,0.06)" : "var(--kt-cream-4)",
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                {/* Veg dot */}
                <span style={{
                  width: 10, height: 10, borderRadius: qty > 0 ? "50%" : "2px",
                  background: DIET_COLOR[item.diet],
                  flexShrink: 0,
                }} />
                <span style={{ flex: 1, fontSize: "13.5px", color: "var(--kt-ink)", fontWeight: 500 }}>{item.name}</span>
                <span style={{ fontFamily: "var(--font-jetbrains), ui-monospace, monospace", fontSize: "12px", color: "var(--kt-ink-3)", flexShrink: 0 }}>{formatRupees(item.price_paise)}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                  {qty > 0 ? (
                    <>
                      <button type="button" onClick={() => setQty(item.id, qty - 1)} style={{ width: 30, height: 30, borderRadius: "6px", border: "1px solid var(--kt-tomato)", background: "var(--kt-tomato)", color: "var(--kt-cream)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <Minus size={12} />
                      </button>
                      <span style={{ fontFamily: "var(--font-jetbrains), ui-monospace, monospace", fontSize: "14px", fontWeight: 700, color: "var(--kt-ink)", minWidth: "18px", textAlign: "center" }}>{qty}</span>
                      <button type="button" onClick={() => setQty(item.id, qty + 1)} style={{ width: 30, height: 30, borderRadius: "6px", border: "1px solid var(--kt-tomato)", background: "var(--kt-tomato)", color: "var(--kt-cream)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <Plus size={12} />
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setQty(item.id, 1)} style={{ width: 30, height: 30, borderRadius: "6px", border: "1px solid var(--kt-line-2)", background: "transparent", color: "var(--kt-ink-3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <Plus size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order details + submit */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--kt-line)", display: "flex", flexDirection: "column", gap: "8px", background: "var(--kt-cream-4)" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="Customer name (optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={{ flex: 1, height: "38px", padding: "0 10px", borderRadius: "7px", border: "1px solid var(--kt-line)", background: "var(--kt-paper)", color: "var(--kt-ink)", fontSize: "13px", outline: "none" }}
            />
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as "takeaway" | "dine_in")}
              style={{ height: "38px", padding: "0 8px", borderRadius: "7px", border: "1px solid var(--kt-line)", background: "var(--kt-paper)", color: "var(--kt-ink)", fontSize: "13px", outline: "none" }}
            >
              <option value="takeaway">Takeaway</option>
              <option value="dine_in">Dine-in</option>
            </select>
          </div>
          {orderType === "dine_in" && (
            <input
              type="text"
              placeholder="Table number *"
              value={tableLabel}
              onChange={(e) => setTableLabel(e.target.value)}
              style={{ height: "38px", padding: "0 10px", borderRadius: "7px", border: "1px solid var(--kt-tomato)", background: "var(--kt-paper)", color: "var(--kt-ink)", fontSize: "13px", outline: "none" }}
            />
          )}
          <button
            type="button"
            onClick={submit}
            disabled={pending || cart.size === 0}
            style={{
              height: "52px",
              borderRadius: "8px",
              background: cart.size > 0 ? "var(--kt-tomato)" : "var(--kt-cream-3)",
              color: cart.size > 0 ? "var(--kt-cream)" : "var(--kt-ink-3)",
              border: "none",
              boxShadow: cart.size > 0 ? "0 3px 0 var(--kt-ink)" : "none",
              fontFamily: "var(--font-manrope), ui-sans-serif, system-ui",
              fontSize: "15px",
              fontWeight: 800,
              letterSpacing: "0.02em",
              cursor: cart.size > 0 && !pending ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              opacity: pending ? 0.7 : 1,
            }}
          >
            <ShoppingCart size={16} />
            {pending ? "Placing…" : cartCount > 0 ? `Place order — ${formatRupees(total)}` : "Add items to order"}
          </button>
        </div>
      </div>
    </div>
  );
}
