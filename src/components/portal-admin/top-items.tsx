import { formatRupees } from "@/lib/utils";

export function TopItems({
  items,
}: {
  items: { name: string; qty: number; revenue: number; diet: "veg" | "nonveg" | "egg" }[];
}) {
  const max = Math.max(1, ...items.map((i) => i.qty));
  return (
    <section className="bg-[var(--admin-bg-2)] border border-[var(--admin-line)] rounded-xl p-4 min-h-[260px]">
      <header className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-[13px] font-semibold text-[var(--admin-ink)]">Top items today</h3>
          <p className="text-[10px] font-mono uppercase tracking-[0.08em] text-[var(--admin-ink-3)] mt-0.5">
            By units sold
          </p>
        </div>
        <span className="text-[10px] font-mono text-[var(--admin-ink-3)]">QTY · REV</span>
      </header>
      {items.length === 0 ? (
        <div className="text-[12px] text-[var(--admin-ink-3)] text-center py-8">No items sold yet today.</div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {items.map((it, i) => (
            <li key={it.name} className="flex items-center gap-3 text-[13px]">
              <span className="font-mono text-[11px] text-[var(--admin-ink-3)] w-5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={
                  "inline-flex h-3 w-3 items-center justify-center border-[1.5px] rounded-sm shrink-0 " +
                  (it.diet === "veg"
                    ? "border-emerald-400"
                    : it.diet === "egg"
                    ? "border-amber-400"
                    : "border-rose-400")
                }
              >
                <span
                  className={
                    "h-1.5 w-1.5 rounded-full " +
                    (it.diet === "veg"
                      ? "bg-emerald-400"
                      : it.diet === "egg"
                      ? "bg-amber-400"
                      : "bg-rose-400")
                  }
                />
              </span>
              <span className="flex-1 min-w-0 truncate text-[var(--admin-ink)] font-medium">{it.name}</span>
              <div className="w-32 h-1.5 bg-[var(--admin-bg-3)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--admin-lime)]/70 to-[var(--admin-lime)]"
                  style={{ width: `${Math.max(8, (it.qty / max) * 100)}%` }}
                />
              </div>
              <span className="font-mono tabular text-[12px] text-[var(--admin-ink-2)] w-10 text-right">{it.qty}</span>
              <span className="font-mono tabular text-[11px] text-[var(--admin-ink-3)] w-16 text-right">
                {formatRupees(it.revenue)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
