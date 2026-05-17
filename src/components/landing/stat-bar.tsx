"use client";

import { useEffect, useRef, useState } from "react";

type Stat = { value: number; suffix?: string; prefix?: string; label: string; decimals?: number };

const STATS: Stat[] = [
  { value: 12, suffix: " min", label: "saved per order" },
  { value: 2140, label: "active students" },
  { value: 248, label: "orders today" },
  { value: 7, suffix: " sec", label: "cart → paid (median)" },
];

export function StatBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e && e.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="border-y border-[color:var(--color-line)] bg-[color:var(--color-paper-dim)]"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 grid grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <StatCell key={s.label} stat={s} active={active} delay={i * 120} />
        ))}
      </div>
    </section>
  );
}

function StatCell({ stat, active, delay }: { stat: Stat; active: boolean; delay: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t0 = performance.now() + delay;
    const dur = 1400;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.max(0, Math.min(1, (t - t0) / dur));
      const eased = 1 - Math.pow(1 - p, 3);
      setN(stat.value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, delay, stat.value]);

  const shown = stat.decimals ? n.toFixed(stat.decimals) : Math.round(n).toLocaleString();
  return (
    <div className="py-8 sm:py-10 px-2 sm:px-6 border-r last:border-r-0 lg:border-r border-[color:var(--color-line)] [&:nth-child(2)]:border-r-0 lg:[&:nth-child(2)]:border-r [&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r">
      <div className="font-display text-[clamp(32px,5vw,52px)] font-medium tracking-[-0.035em] tabular leading-none">
        {stat.prefix}
        {shown}
        {stat.suffix && <span className="text-[color:var(--color-ink)]/45 text-[0.5em] font-sans ml-1">{stat.suffix}</span>}
      </div>
      <div className="mt-3 text-[12px] sm:text-[13px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/55">
        {stat.label}
      </div>
    </div>
  );
}
