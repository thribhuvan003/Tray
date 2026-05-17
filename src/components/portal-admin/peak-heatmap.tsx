"use client";

import { motion } from "framer-motion";

export function PeakHeatmap({ grid }: { grid: number[][] }) {
  const max = Math.max(1, ...grid.flat());
  const rows = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <section className="bg-graphite-700 border border-graphite-200/[0.08] rounded-xl p-4 min-h-[260px] flex flex-col">
      <header className="mb-3">
        <h3 className="text-[13px] font-semibold text-graphite-200">Peak-hour heatmap</h3>
        <p className="text-[10px] font-mono uppercase tracking-[0.08em] text-graphite-400 mt-0.5">
          Orders · last 7 days · 8am–8pm
        </p>
      </header>
      <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: "auto repeat(12, 1fr)" }}>
        {grid.map((row, ri) => (
          <div key={ri} className="contents">
            <div className="text-[10px] font-mono text-graphite-400 self-center justify-self-end pr-1">
              {rows[ri]}
            </div>
            {row.map((v, ci) => {
              const intensity = max > 0 ? v / max : 0;
              const cls =
                intensity === 0
                  ? "bg-graphite-600"
                  : intensity < 0.25
                  ? "bg-lime/15"
                  : intensity < 0.5
                  ? "bg-lime/35"
                  : intensity < 0.75
                  ? "bg-lime/60"
                  : "bg-lime";
              return (
                <motion.div
                  key={ci}
                  className={`${cls} rounded-[3px] aspect-square`}
                  title={`${v} order${v === 1 ? "" : "s"} · ${ci + 8}:00`}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.3 + (ri * 12 + ci) * 0.012,
                    duration: 0.45,
                    ease: [0.34, 1.26, 0.64, 1],
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-[auto_repeat(12,1fr)] gap-1 text-[9px] font-mono text-graphite-400 pt-1">
        <div />
        {Array.from({ length: 12 }, (_, i) => {
          const h = i + 8;
          const label = h > 12 ? h - 12 : h;
          return (
            <span key={i} className="text-center">
              {label}
            </span>
          );
        })}
      </div>
    </section>
  );
}
