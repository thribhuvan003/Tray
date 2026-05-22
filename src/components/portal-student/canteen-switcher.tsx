"use client";

import { useMemo, useState } from "react";
import { Drawer } from "vaul";
import { Check, ChevronDown, Search, X } from "lucide-react";

export type CanteenOption = {
  id: string;
  name: string;
  location?: string | null;
  isOpen?: boolean;
  dishCount?: number;
  queueMinutes?: number;
};

export function CanteenSwitcher({
  canteens,
  selectedCanteenId,
  onSelect,
}: {
  canteens: CanteenOption[];
  selectedCanteenId: string;
  onSelect: (canteen: CanteenOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = canteens.find((c) => c.id === selectedCanteenId) ?? canteens[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return canteens;
    return canteens.filter((c) =>
      `${c.name} ${c.location ?? ""}`.toLowerCase().includes(q)
    );
  }, [canteens, query]);

  function handleSelect(canteen: CanteenOption) {
    onSelect(canteen);
    setOpen(false);
    setQuery("");
  }

  if (!selected) return null;

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button className="w-full rounded-[1.5rem] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] p-4 text-left shadow-sm transition hover:shadow-md active:scale-[0.99]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-code text-[0.65rem] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/50">
                Ordering from
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                {selected.name}
              </h2>
              <p className="mt-2 text-sm text-[color:var(--color-ink)]/55">
                {selected.location || "Campus counter"} ·{" "}
                {selected.dishCount ?? 0} dishes ·{" "}
                {selected.isOpen ? "Open now" : "Closed"}
              </p>
            </div>
            <span className="mt-2 rounded-full bg-ocean-500 p-2 text-black">
              <ChevronDown size={18} />
            </span>
          </div>
        </button>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm" />
        <Drawer.Content
          className="fixed inset-x-0 bottom-0 z-[90] rounded-t-[2rem] bg-[color:var(--color-paper)] p-4 outline-none sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:max-w-xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[2rem]"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          {/* Drag handle */}
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[color:var(--color-ink)]/15 sm:hidden" />

          <div className="flex items-start justify-between gap-4">
            <div>
              <Drawer.Title className="text-2xl font-semibold tracking-[-0.04em]">
                Choose canteen
              </Drawer.Title>
              <Drawer.Description className="mt-1 text-sm text-[color:var(--color-ink)]/55">
                Student view shows every active canteen on this campus.
              </Drawer.Description>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full border border-[color:var(--color-line)] p-2 transition hover:bg-[color:var(--color-paper-dim)]"
              aria-label="Close canteen selector"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="mt-4 flex items-center gap-3 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-paper-dim)] px-4 py-3">
            <Search size={16} className="text-[color:var(--color-ink)]/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search canteen or block"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[color:var(--color-ink)]/40"
            />
          </div>

          {/* Canteen list — no native select */}
          <div className="mt-4 max-h-[55svh] space-y-2 overflow-y-auto pr-1 tray-no-scrollbar">
            {filtered.map((canteen) => {
              const active = canteen.id === selected.id;
              return (
                <button
                  key={canteen.id}
                  onClick={() => handleSelect(canteen)}
                  className="w-full rounded-[1.25rem] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] p-4 text-left transition hover:bg-[color:var(--color-paper-dim)] active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold tracking-[-0.03em]">
                        {canteen.name}
                      </p>
                      <p className="mt-1 text-sm text-[color:var(--color-ink)]/55">
                        {canteen.location || "Campus counter"} ·{" "}
                        {canteen.dishCount ?? 0} dishes · ~{canteen.queueMinutes ?? 3} min
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={[
                          "font-code rounded-full px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.14em]",
                          canteen.isOpen
                            ? "bg-ocean-500/10 text-ocean-900"
                            : "bg-[color:var(--color-ink)]/08 text-[color:var(--color-ink)]/45",
                        ].join(" ")}
                      >
                        {canteen.isOpen ? "Open" : "Closed"}
                      </span>
                      {active && <Check size={16} className="text-ocean-500" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
