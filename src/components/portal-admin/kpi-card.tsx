import { type LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  delta,
  deltaUp,
  icon: Icon,
  tone = "lime",
}: {
  label: string;
  value: string;
  delta?: string;
  deltaUp?: boolean;
  icon: LucideIcon;
  tone?: "lime" | "amber" | "rose" | "mint";
}) {
  const sparkColor =
    tone === "amber"
      ? "stroke-amber-400"
      : tone === "rose"
      ? "stroke-rose-400"
      : tone === "mint"
      ? "stroke-emerald-400"
      : "stroke-lime";
  return (
    <div className="bg-graphite-700 border border-graphite-200/[0.08] rounded-xl p-4 hover:border-graphite-200/[0.15] transition-colors relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="inline-flex h-7 w-7 rounded-md items-center justify-center bg-graphite-200/[0.06]">
          <Icon size={13} className="text-graphite-300" strokeWidth={1.6} />
        </div>
        {delta && (
          <span
            className={cn(
              "text-[10px] font-mono font-semibold inline-flex items-center gap-0.5",
              deltaUp ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {deltaUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {delta}
          </span>
        )}
      </div>
      <div className="mt-3 text-[10px] font-mono uppercase tracking-[0.12em] text-graphite-400">
        {label}
      </div>
      <div className="mt-1 font-display text-[26px] sm:text-[28px] font-medium tabular leading-none text-graphite-200">
        {value}
      </div>
      <svg viewBox="0 0 100 22" className="w-full h-5 mt-3" preserveAspectRatio="none">
        <path
          d="M0 16 L10 14 L20 17 L30 12 L40 13 L50 9 L60 11 L70 6 L80 8 L90 4 L100 5"
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={sparkColor}
        />
      </svg>
    </div>
  );
}
