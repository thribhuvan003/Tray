"use client";

/**
 * Tray landing page animation primitives — built on framer-motion.
 * Palette adapted to sand/clay/ink instead of the dark theme.
 * Keep PiranhaPortalsSection on GSAP (horizontal pin scroll).
 */

import React, { ReactNode, useEffect, useState, useRef, useMemo } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  AnimatePresence,
  type Variants,
  type HTMLMotionProps,
} from "framer-motion";

// ── Motion tokens ─────────────────────────────────────────────────────────────
export const tm = {
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  easeSharp: [0.16, 1, 0.3, 1] as [number, number, number, number],
  fast: 0.22,
  base: 0.6,
  slow: 0.9,
  stagger: 0.08,
};

// ── Variant presets ───────────────────────────────────────────────────────────
export const fadeUpVar: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: tm.base, ease: tm.ease } },
};

export const softFadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: tm.ease } },
};

export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: tm.base, ease: tm.ease } },
};

export const maskLine: Variants = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: { duration: 0.72, ease: tm.easeSharp } },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { delayChildren: 0.06, staggerChildren: tm.stagger } },
};

// ── SectionReveal — scroll-triggered stagger container ────────────────────────
type MotionDivProps = HTMLMotionProps<"div"> & { children: ReactNode };

export function SectionReveal({
  children,
  className,
  amount = 0.18,
  delay = 0,
  as = "section",
  ...props
}: MotionDivProps & { amount?: number; delay?: number; as?: "section" | "div" | "footer" }) {
  const Component =
    as === "footer" ? motion.footer : as === "div" ? motion.div : motion.section;

  return (
    <Component
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        show: { transition: { delay, staggerChildren: tm.stagger } },
      }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
}

// ── RevealItem — individual animated child ────────────────────────────────────
export function RevealItem({
  children,
  className,
  variant = "fade",
  ...props
}: MotionDivProps & { variant?: "fade" | "card" | "soft" }) {
  const v = variant === "card" ? cardReveal : variant === "soft" ? softFadeUp : fadeUpVar;
  return <motion.div variants={v} className={className} {...props}>{children}</motion.div>;
}

// ── HeadlineReveal — masked line-by-line reveal ───────────────────────────────
export function HeadlineReveal({
  lines,
  as = "h1",
  className,
  lineClassName,
  style,
}: {
  lines: (string | ReactNode)[];
  as?: "h1" | "h2" | "h3";
  className?: string;
  lineClassName?: string;
  style?: React.CSSProperties;
}) {
  const Comp = as === "h1" ? motion.h1 : as === "h2" ? motion.h2 : motion.h3;
  return (
    <Comp variants={staggerContainer} className={className} style={style}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.02em]">
          <motion.span variants={maskLine} className={`block ${lineClassName ?? ""}`}>
            {line}
          </motion.span>
        </span>
      ))}
    </Comp>
  );
}

// ── AnimatedNav — scroll-aware sticky glass header ────────────────────────────
export function AnimatedNav({
  children,
  className,
  style,
}: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 60], ["rgba(216,201,174,0.7)", "rgba(216,201,174,0.92)"]);
  const borderO = useTransform(scrollY, [0, 60], [0, 1]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: tm.ease }}
      style={{ backgroundColor: bg, ...style }}
      className={`relative ${className ?? ""}`}
    >
      <motion.div
        style={{ opacity: borderO }}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[rgba(26,22,20,0.12)]"
      />
      {children}
    </motion.div>
  );
}

// ── MotionCTA — button with shine sweep + arrow nudge ─────────────────────────
export function MotionCTA({
  children,
  className,
  style,
  href,
  onClick,
  variant = "primary",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  [key: string]: unknown;
}) {
  const reduce = useReducedMotion();

  const content = (
    <>
      {variant === "primary" && !reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full"
          animate={{ x: ["-120%", "140%"] }}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.4, ease: "linear" }}
          style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)" }}
        />
      )}
      <span className="relative flex items-center gap-2">
        {children}
        <motion.span
          aria-hidden
          className="inline-block"
          variants={{ rest: { x: 0 }, hover: { x: 4 } }}
          transition={{ duration: tm.fast, ease: tm.ease }}
        >
          →
        </motion.span>
      </span>
    </>
  );

  const motionProps = {
    initial: "rest",
    animate: "rest",
    whileHover: "hover",
    whileTap: { scale: 0.975 },
    transition: { duration: tm.fast, ease: tm.ease },
    className: `relative overflow-hidden ${className ?? ""}`,
    style,
    ...rest,
  };

  if (href) return <motion.a href={href} {...motionProps}>{content}</motion.a>;
  return <motion.button type="button" onClick={onClick} {...motionProps}>{content}</motion.button>;
}

// ── CountUp metric ────────────────────────────────────────────────────────────
export function CountUp({
  end,
  suffix = "",
  prefix = "",
  duration = 1200,
  className,
}: {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.7 });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) { setValue(end); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setValue(Math.round(end * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, end, duration]);

  return <span ref={ref} className={className}>{prefix}{value}{suffix}</span>;
}

// ── Realtime pipeline visual ──────────────────────────────────────────────────
const SYNC_STEPS = [
  { label: "Kitchen update", body: "New item or menu change saved" },
  { label: "DB write", body: "Single source of truth updates" },
  { label: "Realtime fanout", body: "WebSocket channel broadcasts" },
  { label: "Every portal", body: "Student + kitchen + admin live" },
];

export function SyncPipelineVisual({ className }: { className?: string }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setActive(c => (c + 1) % SYNC_STEPS.length), 1100);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <motion.div
      variants={cardReveal}
      className={`rounded-[2rem] border overflow-hidden ${className ?? ""}`}
      style={{ border: "1px solid var(--tray-border)", background: "rgba(255,255,255,0.55)" }}
    >
      <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
        {SYNC_STEPS.map((step, i) => {
          const on = active >= i;
          return (
            <motion.div
              key={step.label}
              animate={{
                opacity: on ? 1 : 0.4,
                y: on ? 0 : 6,
                borderColor: on ? "rgba(184,83,26,0.38)" : "rgba(87,87,87,0.12)",
              }}
              transition={{ duration: 0.35, ease: tm.ease }}
              className="rounded-[1.5rem] border p-4"
              style={{ background: on ? "rgba(184,83,26,0.06)" : "rgba(255,255,255,0.40)" }}
            >
              <motion.div
                animate={on ? { scale: [1, 1.1, 1] } : undefined}
                transition={{ duration: 0.4 }}
                className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold"
                style={{
                  background: on ? "rgba(184,83,26,0.14)" : "rgba(87,87,87,0.08)",
                  color: on ? "var(--tray-clay)" : "var(--tray-muted)",
                }}
              >
                {i + 1}
              </motion.div>
              <p className="text-[0.85rem] font-semibold tracking-tight" style={{ fontFamily: "var(--font-jakarta)", color: "var(--tray-ink)" }}>
                {step.label}
              </p>
              <p className="mt-1 text-[0.65rem] leading-[1.5]" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}>
                {step.body}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mx-5 mb-5 h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(87,87,87,0.10)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: "var(--tray-clay)" }}
          animate={{ width: `${((active + 1) / SYNC_STEPS.length) * 100}%` }}
          transition={{ duration: 0.4, ease: tm.ease }}
        />
      </div>
    </motion.div>
  );
}

// ── Order journey visual for hero ─────────────────────────────────────────────
const ORDER_STEPS = [
  { label: "Added to tray", title: "Paneer Roti · ₹80", state: "CART", color: "var(--color-ocean-500, #6E86AB)" },
  { label: "UPI confirmed",  title: "Payment received", state: "PAID", color: "var(--tray-green, #2A6E3A)" },
  { label: "Kitchen live",   title: "Batch 4 preparing", state: "PREP", color: "var(--tray-clay)" },
  { label: "OTP ready",      title: "Code 7342 · collect", state: "READY", color: "var(--tray-green, #2A6E3A)" },
];

export function OrderJourneyVisual({ className }: { className?: string }) {
  const [step, setStep] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setStep(s => (s + 1) % ORDER_STEPS.length), 1600);
    return () => clearInterval(id);
  }, [reduce]);

  const current = ORDER_STEPS[step];

  return (
    <motion.div
      variants={cardReveal}
      className={`overflow-hidden rounded-[2rem] border ${className ?? ""}`}
      style={{ border: "1px solid var(--tray-border)", background: "rgba(255,255,255,0.60)", backdropFilter: "blur(12px)" }}
    >
      <div className="border-b p-5" style={{ borderColor: "var(--tray-border)" }}>
        <p className="text-[0.62rem] uppercase tracking-[0.28em]" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}>
          Live order
        </p>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-[0.95rem] font-semibold tracking-tight" style={{ fontFamily: "var(--font-jakarta)", color: "var(--tray-ink)" }}>
            Lunch order
          </p>
          <span className="flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.18em]" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-green, #2A6E3A)" }}>
            <motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--tray-green, #2A6E3A)" }} animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
            Kitchen open
          </span>
        </div>
      </div>

      <div className="space-y-2 p-4">
        {["Paneer Roti", "Masala Chai", "Samosa"].map((item, i) => (
          <motion.div
            key={item}
            animate={{ opacity: i <= Math.min(step, 2) ? 1 : 0.45 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between rounded-xl px-3 py-2"
            style={{ background: i <= Math.min(step, 2) ? "rgba(255,255,255,0.7)" : "rgba(87,87,87,0.06)", border: "1px solid var(--tray-border)" }}
          >
            <span className="text-[0.82rem] font-medium" style={{ color: "var(--tray-ink)" }}>{item}</span>
            <AnimatePresence mode="wait">
              {i <= Math.min(step, 2) ? (
                <motion.span key="added" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={{ duration: 0.2 }}
                  className="rounded-full px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.14em]"
                  style={{ background: "rgba(42,110,58,0.12)", color: "var(--tray-green, #2A6E3A)", fontFamily: "var(--font-dm-mono)" }}>
                  Added ✓
                </motion.span>
              ) : (
                <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="rounded-full px-2 py-0.5 text-[0.58rem] uppercase tracking-[0.14em]"
                  style={{ background: "rgba(87,87,87,0.08)", color: "var(--tray-muted)", fontFamily: "var(--font-dm-mono)" }}>
                  Add
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <div className="m-4 rounded-[1.25rem] border p-4" style={{ background: "rgba(255,255,255,0.50)", borderColor: "var(--tray-border)" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.state}
            initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
            transition={{ duration: 0.32, ease: tm.ease }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.62rem] uppercase tracking-[0.24em]" style={{ fontFamily: "var(--font-dm-mono)", color: current.color }}>
                  {current.label}
                </p>
                <p className="mt-1 text-[0.95rem] font-semibold" style={{ fontFamily: "var(--font-jakarta)", color: "var(--tray-ink)" }}>
                  {current.title}
                </p>
              </div>
              <span className="rounded-xl border px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.14em]"
                style={{ fontFamily: "var(--font-dm-mono)", background: "rgba(255,255,255,0.60)", color: current.color, borderColor: "var(--tray-border)" }}>
                {current.state}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Marquee ticker ────────────────────────────────────────────────────────────
export function MotionTicker({
  items,
  className,
  speed = 28,
  reverse = false,
}: {
  items: string[];
  className?: string;
  speed?: number;
  reverse?: boolean;
}) {
  const reduce = useReducedMotion();
  const doubled = useMemo(() => [...items, ...items], [items]);

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12" style={{ background: "linear-gradient(to right,var(--tray-bg),transparent)" }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12" style={{ background: "linear-gradient(to left,var(--tray-bg),transparent)" }} />
      <motion.div
        className="flex w-max gap-3"
        animate={reduce ? undefined : { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
      >
        {doubled.map((item, i) => (
          <motion.span
            key={`${item}-${i}`}
            whileHover={{ y: -2 }}
            transition={{ duration: tm.fast }}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[0.68rem] uppercase tracking-[0.2em]"
            style={{ border: "1px solid var(--tray-border)", background: "rgba(255,255,255,0.45)", color: "var(--tray-muted)", fontFamily: "var(--font-dm-mono)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--tray-clay)" }} />
            {item}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Hover card wrapper ────────────────────────────────────────────────────────
export function HoverCard({
  children,
  className,
  style,
}: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      variants={cardReveal}
      whileHover={{ y: -6, boxShadow: "0 28px 80px rgba(26,22,20,0.14)" }}
      transition={{ duration: tm.fast, ease: tm.ease }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
