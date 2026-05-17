"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart, cartTotalPaise, cartItemCount } from "@/lib/cart/store";
import { formatRupees } from "@/lib/utils";
import { placeOrder } from "@/app/(student)/_actions";
import type { OrderType } from "@/lib/db/types";

export function CartDrawer({ tenantUpi }: { tenantUpi: string }) {
  const lines = useCart((s) => s.lines);
  const note = useCart((s) => s.note);
  const setNote = useCart((s) => s.setNote);
  const inc = useCart((s) => s.increment);
  const dec = useCart((s) => s.decrement);
  const clear = useCart((s) => s.clear);
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [orderType, setOrderType] = useState<OrderType>("takeaway");
  const [tableLabel, setTableLabel] = useState("");
  const router = useRouter();

  useEffect(() => {
    const openCart = () => setOpen(true);
    window.addEventListener("tray:cart-open", openCart);
    return () => window.removeEventListener("tray:cart-open", openCart);
  }, []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("cart") === "open") setOpen(true);
  }, []);

  const count = cartItemCount(lines);
  const total = cartTotalPaise(lines);

  const onCheckout = () => {
    if (count === 0) return;
    if (orderType === "dine_in" && !tableLabel.trim()) {
      toast.error("Pick a table for dine-in");
      return;
    }
    start(async () => {
      const res = await placeOrder(
        lines.map((l) => ({ menuItemId: l.menuItemId, qty: l.qty })),
        note,
        orderType,
        orderType === "dine_in" ? tableLabel.trim().toUpperCase() : null
      );
      if (!res.ok) {
        toast.error(res.error ?? "Could not place order");
        if (res.code === "AUTH_REQUIRED") router.push("/login?next=/menu");
        return;
      }
      clear();
      setOpen(false);
      router.push(`/pay/${res.orderId}`);
    });
  };

  return (
    <>
      {count > 0 && (
        <button
          className="btn btn-primary btn-lg"
          style={{ position: "fixed", left: "50%", bottom: 20, transform: "translateX(-50%)", zIndex: 80, boxShadow: "var(--shadow-3)" }}
          onClick={() => setOpen(true)}
        >
          {count} item{count === 1 ? "" : "s"} - {formatRupees(total)} - View cart
        </button>
      )}
      <div className={`drawer-scrim ${open ? "open" : ""}`} onClick={() => setOpen(false)} />
      <aside className={`drawer ${open ? "open" : ""}`} aria-label="Cart">
        <div className="drawer-head">
          <h2>Your order</h2>
          <button className="btn-icon" aria-label="Close" onClick={() => setOpen(false)}>x</button>
        </div>
        <div className="drawer-body">
          {lines.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">0</div>
              <div>Your tray is empty.</div>
            </div>
          ) : (
            lines.map((line) => (
              <div className="cart-item" key={line.menuItemId}>
                <div className="ci-thumb">{line.name.charAt(0)}</div>
                <div>
                  <div className="ci-name">{line.name}</div>
                  <div className="ci-meta">{formatRupees(line.pricePaise)} ea</div>
                  <div className="qty" style={{ marginTop: 8 }}>
                    <button onClick={() => dec(line.menuItemId)}>-</button>
                    <span className="n">{line.qty}</span>
                    <button onClick={() => inc(line.menuItemId)}>+</button>
                  </div>
                </div>
                <div className="ci-price">{formatRupees(line.pricePaise * line.qty)}</div>
              </div>
            ))
          )}
        </div>
        <div className="drawer-foot">
          <div className="auth-tabs" style={{ marginBottom: 4 }}>
            <button className={`auth-tab ${orderType === "takeaway" ? "active" : ""}`} onClick={() => setOrderType("takeaway")}>Takeaway</button>
            <button className={`auth-tab ${orderType === "dine_in" ? "active" : ""}`} onClick={() => setOrderType("dine_in")}>Dine-in</button>
          </div>
          {orderType === "dine_in" && (
            <input className="input" placeholder="Table number" maxLength={8} value={tableLabel} onChange={(e) => setTableLabel(e.target.value)} />
          )}
          <input className="input" placeholder="Note for kitchen (less spicy, extra chutney...)" maxLength={120} value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="totals">
            <div className="row"><span>Subtotal</span><span>{formatRupees(total)}</span></div>
            <div className="row"><span>Platform fee</span><span>{formatRupees(0)}</span></div>
            <div className="row grand"><span>Total</span><span>{formatRupees(total)}</span></div>
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={onCheckout} disabled={pending || count === 0}>
            {pending ? "Placing order..." : `Pay ${formatRupees(total)} via UPI ->`}
          </button>
          <p style={{ color: "var(--ink-4)", fontSize: 12, textAlign: "center" }}>Payment goes straight to {tenantUpi}.</p>
        </div>
      </aside>
    </>
  );
}
