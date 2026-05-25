"use client";

import { Drawer } from "vaul";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, ShoppingCart, Trash2, UtensilsCrossed, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useCart, cartTotalPaise, cartItemCount } from "@/lib/cart/store";
import { formatRupees, cn } from "@/lib/utils";
import { placeOrder } from "@/app/(student)/_actions";
import type { OrderType } from "@/lib/db/types";

// Tiny inline matchMedia hook — kept local to avoid spawning a /lib/hooks
// dir just for one consumer. Returns false on the server / first paint so
// hydration matches the server-rendered (mobile-first) tree, then flips on
// the first effect tick if the viewport is actually large.
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    // `addEventListener('change', ...)` is the modern API; Safari < 14
    // would need addListener, but we're already on a Next 15 / modern
    // browser baseline so this is fine.
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);
  return matches;
}

export function CartDrawer({ tenantSlug, tenantName }: { tenantSlug: string; tenantName: string }) {
  const lines = useCart((s) => s.lines);
  const note = useCart((s) => s.note);
  const setNote = useCart((s) => s.setNote);
  const inc = useCart((s) => s.increment);
  const dec = useCart((s) => s.decrement);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);

  const open = useCart((s) => s.isOpen);
  const setOpen = useCart((s) => s.setIsOpen);
  const [mounted, setMounted] = useState(false);
  const [pending, start] = useTransition();
  const [orderType, setOrderType] = useState<OrderType>("takeaway");
  const [tableLabel, setTableLabel] = useState("");
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  const count = cartItemCount(lines);
  const total = cartTotalPaise(lines);

  // Desktop: render the sidebar shell even with an empty cart so the right
  // column doesn't collapse and reflow the menu. Mobile: hide entirely until
  // there's something in the tray (original behavior).
  const empty = count === 0;

  const onCheckout = () => {
    if (orderType === "dine_in" && !tableLabel.trim()) {
      toast.error("Pick a table for dine-in");
      return;
    }
    start(async () => {
      try {
        const res = await placeOrder(
          lines.map((l) => ({ menuItemId: l.menuItemId, qty: l.qty })),
          note,
          orderType,
          orderType === "dine_in" ? tableLabel.trim().toUpperCase() : null
        );
        if (!res.ok) {
          if (res.code === "AUTH_REQUIRED") {
            toast.info("Sign in to place your order — your cart is saved");
            router.push(`/c/${tenantSlug}/login?next=/c/${tenantSlug}/menu`);
          } else {
            toast.error(res.error ?? "Could not place order");
          }
          return;
        }
        clear();
        setOpen(false);
        router.push(`/c/${tenantSlug}/pay/${res.orderId}`);
      } catch (err) {
        console.error("PLACE ORDER CAUGHT ERROR:", err);
      }
    });
  };

  // Shared cart-body markup used by both the mobile drawer and the desktop
  // sticky sidebar. Keeping one source of truth here avoids drift between
  // form fields / totals between the two surfaces.
  const cartBody = (
    <>
      <div className="px-4 sm:px-5 pt-3 pb-3 flex items-center justify-between border-b border-[color:var(--color-line)]">
        <div>
          <div className="font-display text-[22px] font-medium tracking-tight">Your <span className="it">tray.</span></div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/55">
            Paying to: {tenantName} · ready in ~7 min
          </div>
        </div>
        <button
          aria-label="Close cart"
          onClick={() => setOpen(false)}
          className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-[color:var(--color-line)] hover:bg-[color:var(--color-paper-dim)] transition"
        >
          <X size={15} />
        </button>
      </div>

      <ul className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 flex flex-col gap-3">
        {empty ? (
          <li className="text-[13px] text-[color:var(--color-ink)]/55 italic text-center py-8">
            Your tray is empty.{" "}
            <Link href={`/c/${tenantSlug}/menu`} className="text-ocean-500 hover:underline">
              Pick something from the menu →
            </Link>
          </li>
        ) : (
          lines.map((l) => (
            <li
              key={l.menuItemId}
              className="flex items-start gap-2.5 rounded-2xl border border-[color:var(--color-line)] p-3"
            >
              {/* Diet indicator */}
              <span
                aria-label={l.diet}
                className={cn(
                  "mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center border-2 rounded-sm bg-white",
                  l.diet === "veg"
                    ? "border-emerald-500"
                    : l.diet === "egg"
                    ? "border-amber-500"
                    : "border-rose-500"
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", l.diet === "veg" ? "bg-emerald-500" : l.diet === "egg" ? "bg-amber-500" : "bg-rose-500")} />
              </span>

              {/* Name + controls — two rows */}
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-medium leading-snug truncate">{l.name || "Item"}</div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="inline-flex items-center rounded-full border border-[color:var(--color-line)]">
                    <button aria-label="Decrease" onClick={() => dec(l.menuItemId)} className="h-7 w-7 inline-flex items-center justify-center">
                      <Minus size={12} />
                    </button>
                    <span className="text-[12px] font-medium tabular w-4 text-center">{l.qty}</span>
                    <button aria-label="Increase" onClick={() => inc(l.menuItemId)} className="h-7 w-7 inline-flex items-center justify-center">
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="text-[11px] text-[color:var(--color-ink)]/50 tabular">
                    {formatRupees(l.pricePaise)} ea
                  </span>
                </div>
              </div>

              {/* Total + remove stacked on right */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className="text-[13.5px] font-semibold tabular">
                  {formatRupees(l.pricePaise * l.qty)}
                </div>
                <button
                  aria-label="Remove"
                  onClick={() => remove(l.menuItemId)}
                  className="h-6 w-6 inline-flex items-center justify-center text-[color:var(--color-ink)]/35 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      {!empty && (
        <div className="px-4 sm:px-5 py-4 border-t border-[color:var(--color-line)] flex flex-col gap-3 bg-[color:var(--color-paper-dim)]">
          <div
            role="radiogroup"
            aria-label="Order type"
            className="grid grid-cols-2 gap-2 p-1 rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-paper)]"
          >
            <button
              role="radio"
              aria-checked={orderType === "takeaway"}
              onClick={() => setOrderType("takeaway")}
              className={cn(
                "h-10 inline-flex items-center justify-center gap-2 rounded-lg text-[13px] font-medium transition-colors",
                orderType === "takeaway" ? "bg-ocean-500 text-black" : "text-[color:var(--color-ink)]/70"
              )}
            >
              <ShoppingBag size={14} /> Takeaway
            </button>
            <button
              role="radio"
              aria-checked={orderType === "dine_in"}
              onClick={() => setOrderType("dine_in")}
              className={cn(
                "h-10 inline-flex items-center justify-center gap-2 rounded-lg text-[13px] font-medium transition-colors",
                orderType === "dine_in" ? "bg-ocean-500 text-black" : "text-[color:var(--color-ink)]/70"
              )}
            >
              <UtensilsCrossed size={14} /> Dine-in
            </button>
          </div>
          {orderType === "dine_in" && (
            <label className="block">
              <span className="sr-only">Table number</span>
              <input
                value={tableLabel}
                onChange={(e) => setTableLabel(e.target.value)}
                placeholder="Table number (e.g. 7 or A3)"
                maxLength={8}
                className="w-full h-10 px-3 rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-paper)] text-[13px] focus:outline-none focus:border-ocean-500 uppercase tabular"
              />
            </label>
          )}
          <label className="block">
            <span className="sr-only">Note for the kitchen</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note for the kitchen (e.g. less spicy)"
              maxLength={120}
              className="w-full h-10 px-3 rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-paper)] text-[13px] focus:outline-none focus:border-ocean-500"
            />
          </label>
          <div className="mt-2 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[color:var(--color-line)]/50 pb-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/55">
                  Total
                </span>
                <p className="text-[10px] text-[color:var(--color-ink)]/45 -mt-0.5">
                  Pays directly to {tenantName}
                </p>
              </div>
              <div className="font-display text-[28px] font-semibold tabular tracking-tight text-[color:var(--color-ink)]">
                {formatRupees(total)}
              </div>
            </div>

            <button
              onClick={onCheckout}
              disabled={pending}
              className={cn(
                "w-full inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-ocean-500 text-black text-[15px] font-bold hover:bg-ocean-600 active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(0,102,255,0.2)]",
                pending && "opacity-70 cursor-not-allowed active:scale-100"
              )}
            >
              {pending ? "Placing order…" : "Place order →"}
            </button>
          </div>
          <p className="text-[11px] text-[color:var(--color-ink)]/45 text-center">
            Tray takes 0%. Payment goes straight to {tenantName}.
          </p>
        </div>
      )}
    </>
  );

  return (
    <>


      <Drawer.Root open={open} onOpenChange={setOpen} direction={isDesktop ? "right" : "bottom"}>
        {/* Mobile Sticky Bottom Cart Bar */}
        {count > 0 && (
          <Drawer.Trigger asChild>
            <button
              aria-label={`View cart — ${count} items, ${formatRupees(total)}`}
              className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-[color:var(--color-paper)] border-t border-[color:var(--color-line)] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom,0px)]"
            >
              <div className="flex items-center justify-between h-14 px-4">
                <span className="inline-flex items-center gap-2">
                  <motion.span
                    key={count}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [1, 1.25, 0.9, 1], rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-ocean-500 text-black"
                  >
                    <ShoppingCart size={15} />
                  </motion.span>
                  <span className="text-[14px] font-semibold text-[color:var(--color-ink)]">{count} item{count === 1 ? "" : "s"}</span>
                </span>
                <span className="text-[16px] font-bold tabular text-[color:var(--color-ink)]">{formatRupees(total)}</span>
                <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ocean-600 dark:text-ocean-400">
                  View cart <span aria-hidden="true">→</span>
                </span>
              </div>
            </button>
          </Drawer.Trigger>
        )}
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]" />
          <Drawer.Content className="fixed bottom-0 right-0 z-50 mt-24 flex h-[88vh] lg:h-full w-full lg:max-w-md flex-col rounded-t-3xl lg:rounded-t-none lg:rounded-l-3xl bg-[color:var(--color-paper)] border-l border-[color:var(--color-line)] focus:outline-none pb-[env(safe-area-inset-bottom)]">
            <Drawer.Title className="sr-only">Your cart</Drawer.Title>
            <div className="mx-auto w-12 h-1.5 rounded-full bg-[color:var(--color-line-strong)] mt-3 mb-2 lg:hidden" />
            {cartBody}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
