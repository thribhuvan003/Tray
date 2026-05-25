"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/browser";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

type Cell = {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
};

type Day = { label: string; key: string; revenue: number; orders: number };

export function AnalyticsView({
  cells,
  dailyBuckets,
  tenantId,
}: {
  cells: Cell[];
  dailyBuckets: Day[];
  tenantId: string;
}) {
  const router = useRouter();

  // Live refresh when new orders arrive
  useEffect(() => {
    const sb = getBrowserClient();
    let debounce: ReturnType<typeof setTimeout> | null = null;
    const ch = sb
      .channel("analytics-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "order_events", filter: `tenant_id=eq.${tenantId}` },
        () => {
          if (debounce) clearTimeout(debounce);
          debounce = setTimeout(() => router.refresh(), 800);
        }
      )
      .subscribe();
    return () => { sb.removeChannel(ch); };
  }, [tenantId, router]);

  // Revenue line chart dimensions
  const W = 600; const H = 180;
  const pad = { l: 44, r: 16, t: 16, b: 32 };
  const inner = { w: W - pad.l - pad.r, h: H - pad.t - pad.b };
  const maxRev = Math.max(1, ...dailyBuckets.map((d) => d.revenue));
  const step = dailyBuckets.length > 1 ? inner.w / (dailyBuckets.length - 1) : 0;
  const pts = dailyBuckets.map((d, i) => ({
    x: pad.l + i * step,
    y: pad.t + inner.h - (d.revenue / maxRev) * inner.h,
  }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1]?.x ?? pad.l} ${pad.t + inner.h} L ${pts[0]?.x ?? pad.l} ${pad.t + inner.h} Z`;

  // Bar chart for orders
  const maxOrders = Math.max(1, ...dailyBuckets.map((d) => d.orders));
  const BAR_W = 600; const BAR_H = 120;
  const bpad = { l: 44, r: 16, t: 8, b: 28 };
  const binner = { w: BAR_W - bpad.l - bpad.r, h: BAR_H - bpad.t - bpad.b };
  const barW = Math.max(2, binner.w / dailyBuckets.length - 2);

  // Y-axis ticks for revenue chart
  const yTicks = [0.25, 0.5, 0.75, 1].map((f) => ({
    y: pad.t + inner.h - f * inner.h,
    label: `₹${Math.round((maxRev * f) / 100).toLocaleString("en-IN")}`,
  }));

  // Label every 5th day for readability
  const labelEvery = dailyBuckets.length > 14 ? 5 : 3;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* Header */}
      <div className="mb-6 pb-5" style={{ borderBottom: "1px solid var(--admin-line)" }}>
        <h1 className="font-semibold" style={{ fontSize: 24, letterSpacing: "-0.025em", color: "var(--admin-ink)" }}>
          Analytics
        </h1>
        <div className="font-mono uppercase mt-1" style={{ fontSize: 11, letterSpacing: "0.06em", color: "var(--admin-ink-3)" }}>
          Last 30 days · live data
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {cells.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative overflow-hidden flex flex-col gap-1.5 transition-colors"
            style={{
              padding: "18px 20px",
              background: "var(--admin-bg-card)",
              border: `1px solid ${c.highlight ? "var(--admin-lime)" : "var(--admin-line)"}`,
              borderRadius: 12,
              boxShadow: c.highlight ? "3px 3px 0 var(--admin-lime)" : "3px 3px 0 var(--admin-line)",
            }}
          >
            <div className="font-mono uppercase" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--admin-ink-3)" }}>
              {c.label}
            </div>
            <div className="font-display tabular leading-none" style={{ fontSize: 30, fontWeight: 600, color: c.highlight ? "var(--admin-lime)" : "var(--admin-ink)" }}>
              {c.value}
            </div>
            {c.sub && (
              <div className="font-mono" style={{ fontSize: 11, color: "var(--admin-ink-3)" }}>
                {c.highlight !== undefined ? (
                  <span className="inline-flex items-center gap-1">
                    {c.highlight ? <TrendingUp size={10} style={{ color: "var(--admin-lime)" }} /> : <TrendingDown size={10} className="text-rose-400" />}
                    {c.sub}
                  </span>
                ) : c.sub}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Revenue line chart */}
      <div className="mb-4 rounded-xl p-5" style={{ background: "var(--admin-bg-2)", border: "1px solid var(--admin-line)" }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[13px] font-semibold" style={{ color: "var(--admin-ink)" }}>Revenue — last 30 days</div>
            <div className="font-mono uppercase mt-0.5" style={{ fontSize: 10, letterSpacing: "0.08em", color: "var(--admin-ink-3)" }}>
              Daily total · INR · excludes cancelled/expired
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 font-mono" style={{ fontSize: 10, color: "var(--admin-ink-3)" }}>
            <span className="inline-block h-0.5 w-3 rounded" style={{ background: "var(--admin-lime)" }} /> Revenue
          </span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="analyticsGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#d2fb50" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#d2fb50" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Y-axis ticks */}
          {yTicks.map((t, i) => (
            <g key={i}>
              <line x1={pad.l} x2={W - pad.r} y1={t.y} y2={t.y} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 4" />
              <text x={pad.l - 4} y={t.y + 3} fill="var(--admin-ink-3)" fontSize="9" fontFamily="monospace" textAnchor="end">{t.label}</text>
            </g>
          ))}
          {/* Area fill */}
          <path d={areaPath} fill="url(#analyticsGrad)" />
          {/* Line */}
          <motion.path
            d={linePath}
            stroke="var(--admin-lime)"
            strokeWidth="1.75"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8, ease: [0.2, 0.7, 0.3, 1] }}
          />
          {/* Data points */}
          {pts.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x} cy={p.y} r={2.5}
              fill="var(--admin-lime)"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.8 + i * 0.02 }}
            />
          ))}
          {/* X-axis labels */}
          {dailyBuckets.map((d, i) => i % labelEvery === 0 ? (
            <text key={i} x={pad.l + i * step} y={H - bpad.b + 14} fill="var(--admin-ink-3)" fontSize="9" fontFamily="monospace" textAnchor="middle">
              {d.label}
            </text>
          ) : null)}
        </svg>
      </div>

      {/* Orders per day bar chart */}
      <div className="rounded-xl p-5" style={{ background: "var(--admin-bg-2)", border: "1px solid var(--admin-line)" }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[13px] font-semibold" style={{ color: "var(--admin-ink)" }}>Orders — last 30 days</div>
            <div className="font-mono uppercase mt-0.5" style={{ fontSize: 10, letterSpacing: "0.08em", color: "var(--admin-ink-3)" }}>
              Daily order count · paid orders only
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 font-mono" style={{ fontSize: 10, color: "var(--admin-ink-3)" }}>
            <span className="inline-block h-3 w-2 rounded-sm" style={{ background: "rgba(210,251,80,0.5)" }} /> Orders
          </span>
        </div>
        <svg viewBox={`0 0 ${BAR_W} ${BAR_H}`} className="w-full" style={{ height: BAR_H }} preserveAspectRatio="none">
          {dailyBuckets.map((d, i) => {
            const bh = Math.max(2, (d.orders / maxOrders) * binner.h);
            const bx = bpad.l + (i / dailyBuckets.length) * binner.w + 1;
            const by = bpad.t + binner.h - bh;
            return (
              <g key={i}>
                <motion.rect
                  x={bx} y={BAR_H - bpad.b}
                  width={barW} height={0}
                  rx={2}
                  fill={d.orders > 0 ? "rgba(210,251,80,0.55)" : "rgba(210,251,80,0.1)"}
                  initial={{ y: BAR_H - bpad.b, height: 0 }}
                  animate={{ y: by, height: bh }}
                  transition={{ duration: 0.6, delay: i * 0.02, ease: "easeOut" }}
                />
                {i % labelEvery === 0 && (
                  <text x={bx + barW / 2} y={BAR_H - 4} fill="var(--admin-ink-3)" fontSize="9" fontFamily="monospace" textAnchor="middle">
                    {d.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </motion.div>
  );
}
