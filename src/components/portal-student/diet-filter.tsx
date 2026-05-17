"use client";

import { cn } from "@/lib/utils";

export type DietFilter = "all" | "veg" | "egg" | "nonveg";

export function DietFilterTabs({
  value,
  onChange,
  counts,
}: {
  value: DietFilter;
  onChange: (v: DietFilter) => void;
  counts: Record<DietFilter, number>;
}) {
  const tabs: { v: DietFilter; label: string; dot?: string }[] = [
    { v: "all", label: "All" },
    { v: "veg", label: "Veg", dot: "bg-emerald-500" },
    { v: "egg", label: "Egg", dot: "bg-amber-500" },
    { v: "nonveg", label: "Non-veg", dot: "bg-rose-500" },
  ];
  return (
    <div
      role="tablist"
      aria-label="Diet filter"
      className="flex gap-1.5 sm:gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none"
    >
      {tabs.map((t) => {
        const active = value === t.v;
        return (
          <button
            key={t.v}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.v)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[13px] font-medium border transition-colors tabular",
              active
                ? "bg-ocean-500 text-white border-ocean-500"
                : "border-[color:var(--color-line)] text-[color:var(--color-ink)]/75 hover:border-ocean-500/50"
            )}
          >
            {t.dot && <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />}
            {t.label}
            <span className={cn("text-[11px] font-mono", active ? "opacity-75" : "opacity-50")}>
              {counts[t.v]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
