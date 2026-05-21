"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import {
  numberCounter,
  prefersReducedMotion,
  registerTrayGsap,
  tickerLoop,
} from "@/lib/motion/tray-motion";

// ── Metrics ──────────────────────────────────────────────────────────────────

export function MetricsStrip() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerTrayGsap();
      if (prefersReducedMotion()) return;

      rootRef.current?.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        numberCounter(el, Number(el.dataset.count), {
          suffix: el.dataset.suffix ?? "",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 75%",
          },
        });
      });
    },
    { scope: rootRef }
  );

  return (
    <section ref={rootRef} className="px-5 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric value={12} suffix="m" label="saved per lunch" />
        <Metric value={3} label="role portals" />
        <Metric value={4} label="digit OTP pickup" />
        <Metric value={1} label="campus source of truth" />
      </div>
    </section>
  );
}

function Metric({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--tray-border)] bg-white/50 p-5">
      <div className="font-editorial text-5xl font-black tracking-[-0.06em]">
        <span data-count={value} data-suffix={suffix ?? ""}>0</span>
      </div>
      <p className="font-code mt-3 text-[0.68rem] uppercase tracking-[0.18em] text-[var(--tray-muted)]">
        {label}
      </p>
    </div>
  );
}

// ── Ticker ────────────────────────────────────────────────────────────────────

export function CampusTicker() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerTrayGsap();
      if (prefersReducedMotion()) return;

      rootRef.current?.querySelectorAll<HTMLElement>("[data-ticker-track]").forEach((track, index) => {
        tickerLoop(track, index === 0 ? 36 : 42);
      });
    },
    { scope: rootRef }
  );

  const row1 = [
    "Main Canteen",
    "Hostel Mess",
    "North Block Canteen",
    "Sports Café",
    "Library Counter",
    "Night Canteen",
  ];

  const row2 = [
    "Queue live",
    "UPI confirmed",
    "OTP verified",
    "Specials updated",
    "Realtime sync",
    "Campus scoped",
  ];

  return (
    <section ref={rootRef} className="overflow-hidden border-y border-[var(--tray-border)] py-4">
      <TickerRow items={row1} />
      <TickerRow items={row2} reverse />
    </section>
  );
}

function TickerRow({ items, reverse }: { items: string[]; reverse?: boolean }) {
  const content = [...items, ...items, ...items];
  return (
    <div className="tray-no-scrollbar overflow-hidden py-2">
      <div
        data-ticker-track
        className="font-code flex w-max gap-7 whitespace-nowrap text-xs uppercase tracking-[0.22em] text-[var(--tray-muted)]"
        style={{ direction: reverse ? "rtl" : "ltr" }}
      >
        {content.map((item, index) => (
          <span key={`${item}-${index}`} className="inline-flex items-center gap-7">
            {item}
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--tray-clay)]" />
          </span>
        ))}
      </div>
    </div>
  );
}
