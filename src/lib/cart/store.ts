"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartLine = {
  menuItemId: string;
  name: string;
  pricePaise: number;
  diet: "veg" | "nonveg" | "egg";
  qty: number;
};

type State = {
  tenantSlug: string;
  lines: CartLine[];
  note: string;
  add: (item: Omit<CartLine, "qty">, qty?: number) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  setNote: (n: string) => void;
  setTenantSlug: (s: string) => void;
};

const tenantSlug = () =>
  (typeof document !== "undefined" && document.documentElement.dataset.tenantSlug) ||
  "aditya";

export const useCart = create<State>()(
  persist(
    (set, get) => ({
      tenantSlug: tenantSlug(),
      lines: [],
      note: "",
      add: (item, qty = 1) =>
        set(({ lines }) => {
          const existing = lines.find((l) => l.menuItemId === item.menuItemId);
          if (existing) {
            return {
              lines: lines.map((l) =>
                l.menuItemId === item.menuItemId ? { ...l, qty: l.qty + qty } : l
              ),
            };
          }
          return { lines: [...lines, { ...item, qty }] };
        }),
      increment: (id) =>
        set(({ lines }) => ({
          lines: lines.map((l) => (l.menuItemId === id ? { ...l, qty: l.qty + 1 } : l)),
        })),
      decrement: (id) =>
        set(({ lines }) => ({
          lines: lines
            .map((l) => (l.menuItemId === id ? { ...l, qty: l.qty - 1 } : l))
            .filter((l) => l.qty > 0),
        })),
      remove: (id) =>
        set(({ lines }) => ({ lines: lines.filter((l) => l.menuItemId !== id) })),
      clear: () => set({ lines: [], note: "" }),
      setNote: (note) => set({ note }),
      setTenantSlug: (tenantSlug) => {
        if (get().tenantSlug !== tenantSlug) set({ tenantSlug, lines: [], note: "" });
      },
    }),
    {
      name: `tray:cart:${tenantSlug()}`,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines, note: s.note, tenantSlug: s.tenantSlug }),
    }
  )
);

export function cartTotalPaise(lines: CartLine[]) {
  return lines.reduce((acc, l) => acc + l.pricePaise * l.qty, 0);
}
export function cartItemCount(lines: CartLine[]) {
  return lines.reduce((acc, l) => acc + l.qty, 0);
}
