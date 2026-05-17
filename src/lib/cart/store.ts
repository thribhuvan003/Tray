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
  ensureTenant: (s: string) => void;
};

// Single localStorage key holds a per-tenant map under it. Switching tenants
// reveals a different bucket instead of leaking lines across colleges.
export const useCart = create<State>()(
  persist(
    (set, get) => ({
      tenantSlug: "",
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
      ensureTenant: (slug) => {
        if (get().tenantSlug === slug) return;
        if (typeof window === "undefined") return;
        const stash = readBucket();
        // Save outgoing tenant's lines, load incoming tenant's.
        if (get().tenantSlug) {
          stash[get().tenantSlug] = { lines: get().lines, note: get().note };
        }
        writeBucket(stash);
        const incoming = stash[slug] ?? { lines: [], note: "" };
        set({ tenantSlug: slug, lines: incoming.lines, note: incoming.note });
      },
    }),
    {
      name: "tray:cart:active",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ tenantSlug: s.tenantSlug, lines: s.lines, note: s.note }),
    }
  )
);

const BUCKET_KEY = "tray:cart:bucket";
type Bucket = Record<string, { lines: CartLine[]; note: string }>;
function readBucket(): Bucket {
  try {
    return JSON.parse(localStorage.getItem(BUCKET_KEY) ?? "{}") as Bucket;
  } catch {
    return {};
  }
}
function writeBucket(b: Bucket) {
  try {
    localStorage.setItem(BUCKET_KEY, JSON.stringify(b));
  } catch {
    // quota exceeded — silently ignore
  }
}

export function cartTotalPaise(lines: CartLine[]) {
  return lines.reduce((acc, l) => acc + l.pricePaise * l.qty, 0);
}
export function cartItemCount(lines: CartLine[]) {
  return lines.reduce((acc, l) => acc + l.qty, 0);
}
