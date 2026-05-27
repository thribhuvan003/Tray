"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const OPTIONS = [
  {
    id: "class",
    label: "Between classes",
    hint: "Order now, pick up on the way to the next lecture.",
  },
  {
    id: "queue",
    label: "Stuck in line",
    hint: "Skip the crowd: pay on your phone, walk to the handover window.",
  },
  {
    id: "counter",
    label: "At the counter",
    hint: "Show your OTP when staff calls your order.",
  },
] as const;

const PREVIEWS = {
  class: {
    badge: "TAKEAWAY",
    textColor: "text-[var(--tray-clay)]",
    bgColor: "bg-[var(--tray-clay)]/10",
    title: "Class Break Handoff",
    time: "3 min ETA",
    detail: "Order placed from lecture hall. Your food is prepared and ready at the counter exactly as the bell rings.",
    icon: "🏃‍♂️",
  },
  queue: {
    badge: "SKIP THE LINE",
    textColor: "text-[var(--color-ocean-500,#2E80EF)]",
    bgColor: "bg-[#2E80EF]/10",
    title: "Queue Bypass",
    time: "12 orders ahead",
    detail: "You are in the virtual queue. No need to stand in the physical crowd. Pay on UPI, and watch the status live.",
    icon: "📱",
  },
  counter: {
    badge: "DINE IN",
    textColor: "text-[var(--tray-green,#16A34A)]",
    bgColor: "bg-[#16A34A]/10",
    title: "Table Service",
    time: "Table T4",
    detail: "Enter table number or canteen section. The staff serves directly to your seat when the order is prepared.",
    icon: "🍽️",
  },
} as const;

const IDS = OPTIONS.map((o) => o.id) as Array<(typeof OPTIONS)[number]["id"]>;

export function LandingLineLeave() {
  const [active, setActive] = useState<(typeof OPTIONS)[number]["id"]>("class");
  const paused = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preview = PREVIEWS[active];

  // Auto-cycle every 1.8 s; pauses on user interaction, resumes after 4 s
  useEffect(() => {
    const interval = setInterval(() => {
      if (paused.current) return;
      setActive((cur) => {
        const idx = IDS.indexOf(cur);
        return IDS[(idx + 1) % IDS.length];
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const handleManualSelect = (id: (typeof OPTIONS)[number]["id"]) => {
    setActive(id);
    paused.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => { paused.current = false; }, 4000);
  };

  return (
    <section
      className="px-5 py-24 sm:px-8 lg:px-10 bg-[#FAF8F5] border-b border-[var(--tray-border)] tl-arrival-host lg:min-h-screen lg:flex lg:flex-col lg:justify-center lg:py-24"
      id="where"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <p className="font-code text-xs uppercase tracking-[0.3em] text-[var(--tray-muted)]">
            02b / Adaptivity
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* Left Column: Heading and info */}
          <div>
            <h2
              className="leading-[0.88] tracking-[-0.04em] uppercase"
              style={{
                fontFamily: "var(--font-barlow)",
                fontWeight: 900,
                fontSize: "clamp(2.8rem, 6.5vw, 6.5rem)",
                color: "var(--tray-ink, #1A1619)",
              }}
            >
              Dine in or takeaway<br />
              <span
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontStyle: "italic",
                  textTransform: "none",
                  fontWeight: 400,
                  color: "var(--tray-clay, #B8531A)",
                }}
              >
                before you order.
              </span>
            </h2>
            <p
              className="mt-6 max-w-xl text-[1.1rem] leading-8 text-neutral-600"
              style={{ fontFamily: "var(--font-geist)" }}
            >
              Like a QSR handoff screen: choose how you eat, get an honest ETA, then pay. Tray adapts copy and pickup for counter vs table.
            </p>
          </div>

          {/* Right Column: Interactive Card */}
          <div
            className="relative rounded-[2.5rem] border border-[var(--tray-border)] bg-[var(--tray-bg)] p-8 sm:p-10 flex flex-col gap-6 shadow-sm"
            onMouseEnter={() => { paused.current = true; }}
            onMouseLeave={() => { paused.current = false; }}
          >
            {/* Sliding Tab Chips */}
            <div className="flex flex-col sm:flex-row gap-2.5 p-1.5 rounded-2xl bg-neutral-200/40 relative">
              {OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="relative z-10 flex-1 px-4 py-3 rounded-xl font-semibold text-xs tracking-wider uppercase transition-colors duration-300 select-none cursor-pointer focus:outline-none"
                  style={{
                    color: active === opt.id ? "var(--tray-cream)" : "var(--tray-muted)",
                    fontFamily: "var(--font-ui)",
                  }}
                  onClick={() => handleManualSelect(opt.id)}
                >
                  {active === opt.id && (
                    <motion.span
                      layoutId="activeChipBg"
                      className="absolute inset-0 bg-[var(--tray-ink)] rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 360, damping: 28 }}
                    />
                  )}
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Dynamic Live Adaptive Preview Block */}
            <div className="min-h-[14rem] flex flex-col justify-between border border-[var(--tray-border)] bg-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
              <div className="pointer-events-none absolute inset-0 opacity-[0.02] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:14px_14px]" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col gap-4 flex-1 justify-between z-10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className={`inline-block rounded-full px-3 py-1 text-[0.62rem] font-code font-bold tracking-[0.16em] uppercase ${preview.textColor} ${preview.bgColor}`}>
                        {preview.badge}
                      </span>
                      <h3
                        className="mt-3 text-[1.4rem] font-medium tracking-tight"
                        style={{ fontFamily: "var(--font-fraunces)" }}
                      >
                        {preview.title}
                      </h3>
                    </div>
                    <span className="text-3xl filter drop-shadow-sm select-none">{preview.icon}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest">{preview.time}</span>
                    </div>
                    <p className="text-[0.88rem] leading-[1.6] text-neutral-600">
                      {preview.detail}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dots indicator */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1.5">
                {IDS.map((id) => (
                  <span
                    key={id}
                    className="block h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: active === id ? "1.5rem" : "0.375rem",
                      background: active === id ? "var(--tray-ink)" : "var(--tray-border)",
                    }}
                  />
                ))}
              </div>
              <p className="text-center text-xs text-neutral-400 font-code tracking-wider uppercase">
                Adaptability simulator
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
