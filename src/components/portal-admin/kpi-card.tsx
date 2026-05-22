import { type LucideIcon, TrendingDown, TrendingUp } from "lucide-react";

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
  /* stroke color for the sparkline */
  const sparkStroke =
    tone === "amber"
      ? "var(--admin-amber)"
      : tone === "rose"
      ? "var(--admin-rose)"
      : tone === "mint"
      ? "var(--admin-mint)"
      : "var(--admin-lime)";

  /* delta pill colors */
  const deltaColor = deltaUp
    ? { color: "var(--admin-mint)", background: "var(--admin-mint-soft)" }
    : { color: "var(--admin-rose)", background: "var(--admin-rose-soft)" };

  return (
    <div
      className="relative overflow-hidden flex flex-col gap-3.5 transition-colors"
      style={{
        padding: "18px 20px",
        background: "var(--admin-bg-card)",
        border: "1px solid var(--admin-line)",
        borderRadius: 12,
        boxShadow: "3px 3px 0 var(--admin-line)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--admin-line-2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--admin-line)";
      }}
    >
      {/* Top row: icon + delta */}
      <div className="flex items-start justify-between">
        <div
          className="inline-flex items-center justify-center rounded-md"
          style={{
            height: 28,
            width: 28,
            background: "var(--admin-bg-3)",
          }}
        >
          <Icon size={13} strokeWidth={1.6} style={{ color: "var(--admin-ink-3)" }} />
        </div>
        {delta && (
          <span
            className="font-mono font-semibold inline-flex items-center gap-1"
            style={{
              fontSize: 11,
              letterSpacing: "0.02em",
              padding: "3px 8px",
              borderRadius: 5,
              ...deltaColor,
            }}
          >
            {deltaUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {delta}
          </span>
        )}
      </div>

      {/* Label */}
      <div
        className="font-mono uppercase font-medium"
        style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--admin-ink-3)" }}
      >
        {label}
      </div>

      {/* Value — large display number, tabular nums */}
      <div
        className="font-semibold leading-none tabular-nums font-display"
        style={{
          fontSize: 38,
          fontWeight: 500,
          letterSpacing: "-0.03em",
          color: "var(--admin-ink)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>

      {/* Sparkline */}
      <svg viewBox="0 0 100 22" className="w-full" style={{ height: 36 }} preserveAspectRatio="none">
        <path
          d="M0 16 L10 14 L20 17 L30 12 L40 13 L50 9 L60 11 L70 6 L80 8 L90 4 L100 5"
          fill="none"
          stroke={sparkStroke}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
