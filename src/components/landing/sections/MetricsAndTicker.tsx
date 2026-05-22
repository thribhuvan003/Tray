"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import {
  numberCounter,
  prefersReducedMotion,
  registerTrayGsap,
  tickerLoop,
} from "@/lib/motion/tray-motion";
import { FSSAIBadge } from "../FSSAIBadge";

// Metrics: Fraunces Black for impact numbers + DM Mono uppercase labels.
// Ticker: DM Mono — two rows, opposite directions.

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
          scrollTrigger: { trigger: rootRef.current, start: "top 78%" },
        });
      });
    },
    { scope: rootRef }
  );

  return (
    <section ref={rootRef} className="px-5 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric value={12} suffix="m" label="Saved per lunch" />
        <Metric value={3}  label="Role portals" />
        <Metric value={4}  label="Digit OTP pickup" />
        <Metric value={1}  label="Source of truth" />
      </div>
    </section>
  );
}

function Metric({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  return (
    <div
      className="flex flex-col gap-3 rounded-[1.75rem] p-5 sm:p-6"
      style={{ border: "1px solid var(--tray-border)", background: "rgba(255,255,255,0.52)" }}
    >
      {/* Fraunces Black for numbers */}
      <div
        className="leading-none tracking-[-0.06em]"
        style={{
          fontFamily: "var(--font-fraunces)",
          fontWeight: 900,
          fontSize: "clamp(2.8rem, 5vw, 4rem)",
        }}
      >
        <span data-count={value} data-suffix={suffix ?? ""}>0</span>
        {suffix && (
          <em className="not-italic" style={{ color: "var(--tray-clay)", fontStyle: "italic" }}>
            {suffix}
          </em>
        )}
      </div>
      {/* DM Mono for label */}
      <p
        className="text-[0.65rem] uppercase tracking-[0.2em]"
        style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}
      >
        {label}
      </p>
    </div>
  );
}

// ── Campus Ticker ─────────────────────────────────────────────────────────────

export function CampusTicker() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerTrayGsap();
      if (prefersReducedMotion()) return;

      rootRef.current?.querySelectorAll<HTMLElement>("[data-ticker-track]").forEach((track, i) => {
        tickerLoop(track, i === 0 ? 34 : 44);
      });
    },
    { scope: rootRef }
  );

  const row1 = ["Main Canteen", "Hostel Mess", "North Block", "Sports Café", "Library Counter", "Night Canteen"];
  const row2 = ["Queue live", "UPI confirmed", "OTP verified", "Specials updated", "Realtime sync", "Campus scoped"];

  return (
    <section
      ref={rootRef}
      className="overflow-hidden py-5"
      style={{ borderTop: "1px solid var(--tray-border)", borderBottom: "1px solid var(--tray-border)" }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span
            className="text-[0.65rem] uppercase tracking-[0.2em] opacity-45"
            style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}
          >
            Active network counters
          </span>
          <FSSAIBadge type="veg" />
        </div>
        <span
          className="rounded border border-[var(--tray-border)] bg-[var(--tray-surface)] px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.2em]"
          style={{
            fontFamily: "var(--font-dm-mono)",
            color: "var(--tray-clay)",
          }}
        >
          Specimen: DRUK CONDENSED + NEUE HAAS MONO
        </span>
      </div>
      <TickerRow items={row1} fontStyle="druk" />
      <TickerRow items={row2} reverse fontStyle="mono" />
    </section>
  );
}

function TickerRow({ items, reverse, fontStyle = "mono" }: { items: string[]; reverse?: boolean; fontStyle?: "druk" | "mono" }) {
  const content = [...items, ...items, ...items];
  return (
    <div className="tray-no-scrollbar overflow-hidden py-2">
      <div
        data-ticker-track
        className="flex w-max gap-8 whitespace-nowrap items-center"
        style={{
          fontFamily: fontStyle === "druk" ? "var(--font-bebas)" : "var(--font-dm-mono)",
          fontSize: fontStyle === "druk" ? "clamp(1.4rem, 3.5vw, 2rem)" : "0.7rem",
          letterSpacing: fontStyle === "druk" ? "0.06em" : "0.22em",
          textTransform: "uppercase",
          color: "var(--tray-muted)",
          direction: reverse ? "rtl" : "ltr",
          lineHeight: 1,
        }}
      >
        {content.map((item, index) => (
          <span key={`${item}-${index}`} className="inline-flex items-center gap-8">
            {item}
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--tray-clay)" }}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
