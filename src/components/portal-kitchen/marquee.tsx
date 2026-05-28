import { formatRupees } from "@/lib/utils";

type Item = { id: string; name: string; price_paise: number; diet: "veg" | "nonveg" | "egg" };

export function KitchenMarquee({ items = [] }: { items: Item[] }) {
  if (!items.length) return null;
  const looped = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-tomato-900/20 dark:border-cream-200/15 bg-tomato-500/5 dark:bg-tomato-500/10 py-2">
      <div className="flex gap-8 animate-marquee whitespace-nowrap">
        {looped.map((it, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-[12px] font-mono">
            <span
              className={
                "inline-flex h-2.5 w-2.5 items-center justify-center border-2 rounded-sm " +
                (it.diet === "veg"
                  ? "border-emerald-500"
                  : it.diet === "egg"
                  ? "border-amber-500"
                  : "border-tomato-500")
              }
            >
              <span
                className={
                  "h-1 w-1 rounded-full " +
                  (it.diet === "veg" ? "bg-emerald-500" : it.diet === "egg" ? "bg-amber-500" : "bg-tomato-500")
                }
              />
            </span>
            <span className="font-medium text-tomato-900 dark:text-cream-200">{it.name}</span>
            <span className="text-tomato-900/60 dark:text-cream-200/60 tabular">{formatRupees(it.price_paise)}</span>
            <span className="text-tomato-900/30 dark:text-cream-200/20">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
