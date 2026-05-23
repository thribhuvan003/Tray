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
    whileTap: { scale: 0.96 },
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
    const id = window.setInterval(() => setActive(c => (c + 1) % SYNC_STEPS.length), 2000);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <motion.div
      variants={cardReveal}
      className={`rounded-[2rem] border overflow-hidden p-6 sm:p-8 ${className ?? ""}`}
      style={{ border: "2px solid var(--tray-border)", background: "rgba(255,255,255,0.65)", backdropFilter: "blur(16px)" }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:gap-6">
        {SYNC_STEPS.map((step, i) => {
          const on = active === i;
          const passed = active >= i;
          return (
            <motion.div
              key={step.label}
              animate={{
                scale: on ? 1.05 : 1,
                opacity: passed ? 1 : 0.45,
                borderColor: on
                  ? "var(--tray-clay)"
                  : passed
                  ? "rgba(184,83,26,0.22)"
                  : "rgba(87,87,87,0.12)",
                boxShadow: on
                  ? "0 12px 30px rgba(184,83,26,0.15)"
                  : "0 0 0 rgba(0,0,0,0)",
              }}
              transition={{ duration: 0.45, ease: tm.ease }}
              className="relative rounded-[1.75rem] border-2 p-5 sm:p-6 flex flex-col justify-between min-h-[160px] transition-all"
              style={{
                background: on
                  ? "linear-gradient(135deg, rgba(184,83,26,0.08), rgba(184,83,26,0.02))"
                  : passed
                  ? "rgba(255,255,255,0.50)"
                  : "rgba(255,255,255,0.25)",
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <motion.div
                  animate={on ? { scale: [1, 1.15, 1], rotate: [0, 360, 360] } : undefined}
                  transition={{ duration: 0.8, ease: tm.ease }}
                  className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl text-base sm:text-lg font-black"
                  style={{
                    background: on ? "var(--tray-clay)" : passed ? "rgba(184,83,26,0.15)" : "rgba(87,87,87,0.06)",
                    color: on ? "var(--tray-cream)" : passed ? "var(--tray-clay)" : "var(--tray-muted)",
                    boxShadow: on ? "0 4px 12px rgba(184,83,26,0.3)" : "none"
                  }}
                >
                  {i + 1}
                </motion.div>
                {on && (
                  <span className="h-2 w-2 rounded-full bg-[var(--tray-clay)] animate-ping" />
                )}
              </div>
              <div>
                <p className="text-[0.95rem] sm:text-base font-black tracking-tight" style={{ fontFamily: "var(--font-jakarta)", color: "var(--tray-ink)" }}>
                  {step.label}
                </p>
                <p className="mt-2 text-[0.72rem] sm:text-xs leading-[1.6] font-semibold" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}>
                  {step.body}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-8 h-2 overflow-hidden rounded-full" style={{ background: "rgba(87,87,87,0.10)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: "var(--tray-clay)" }}
          animate={{ width: `${((active + 1) / SYNC_STEPS.length) * 100}%` }}
          transition={{ duration: 0.45, ease: tm.ease }}
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
      <div className="border-b p-7" style={{ borderColor: "var(--tray-border)" }}>
        <p className="text-[0.78rem] uppercase tracking-[0.28em]" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}>
          Live order
        </p>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-[1.2rem] font-semibold tracking-tight" style={{ fontFamily: "var(--font-jakarta)", color: "var(--tray-ink)" }}>
            Lunch order
          </p>
          <span className="flex items-center gap-1.5 text-[0.78rem] uppercase tracking-[0.18em]" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-green, #2A6E3A)" }}>
            <motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--tray-green, #2A6E3A)" }} animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
            Kitchen open
          </span>
        </div>
      </div>

      <div className="space-y-3.5 p-6">
        {["Paneer Roti", "Masala Chai", "Samosa"].map((item, i) => (
          <motion.div
            key={item}
            animate={{ opacity: i <= Math.min(step, 2) ? 1 : 0.45 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between rounded-xl px-5 py-3.5"
            style={{ background: i <= Math.min(step, 2) ? "rgba(255,255,255,0.7)" : "rgba(87,87,87,0.06)", border: "1px solid var(--tray-border)" }}
          >
            <span className="text-[1.05rem] font-medium" style={{ color: "var(--tray-ink)" }}>{item}</span>
            <AnimatePresence mode="wait">
              {i <= Math.min(step, 2) ? (
                <motion.span key="added" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={{ duration: 0.2 }}
                  className="rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em]"
                  style={{ background: "rgba(42,110,58,0.12)", color: "var(--tray-green, #2A6E3A)", fontFamily: "var(--font-dm-mono)" }}>
                  Added ✓
                </motion.span>
              ) : (
                <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="rounded-full px-3 py-1 text-[0.7rem] uppercase tracking-[0.14em]"
                  style={{ background: "rgba(87,87,87,0.08)", color: "var(--tray-muted)", fontFamily: "var(--font-dm-mono)" }}>
                  Add
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <div className="m-6 rounded-[1.25rem] border overflow-hidden" style={{ background: current.state === "READY" ? "rgba(42,110,58,0.04)" : "rgba(255,255,255,0.50)", borderColor: current.state === "READY" ? "rgba(42,110,58,0.3)" : "var(--tray-border)", transition: "all 0.4s ease" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.state}
            initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
            transition={{ duration: 0.32, ease: tm.ease }}
            className={current.state === "READY" ? "p-8" : "p-6"}
          >
            {current.state === "READY" ? (
              <div className="flex flex-col items-center justify-center text-center relative overflow-hidden">
                <span className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.88rem] font-bold tracking-[0.2em] uppercase text-[var(--tray-green)] bg-[var(--tray-green)]/[0.12] animate-bounce">
                  <span className="h-2 w-2 rounded-full bg-[var(--tray-green)] animate-ping" />
                  {current.label}
                </span>
                <div className="mt-4 font-mono font-black text-6xl tracking-widest text-[var(--tray-green)] animate-pulse">
                  7 3 4 2
                </div>
                <p className="mt-3 text-[1.25rem] font-bold text-[var(--tray-ink)] uppercase tracking-wider">
                  Ready for collection!
                </p>
                <p className="mt-1 text-[0.9rem] text-[var(--tray-muted)] font-medium">
                  Show this OTP at the counter to claim your meal.
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[0.78rem] uppercase tracking-[0.24em]" style={{ fontFamily: "var(--font-dm-mono)", color: current.color }}>
                    {current.label}
                  </p>
                  <p className="mt-1 text-[1.2rem] font-semibold" style={{ fontFamily: "var(--font-jakarta)", color: "var(--tray-ink)" }}>
                    {current.title}
                  </p>
                </div>
                <span className="rounded-xl border px-4.5 py-2.5 text-[0.78rem] font-bold uppercase tracking-[0.14em]"
                  style={{ fontFamily: "var(--font-dm-mono)", background: "rgba(255,255,255,0.60)", color: current.color, borderColor: "var(--tray-border)" }}>
                  {current.state}
                </span>
              </div>
            )}
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

// ── Scroll progress bar ──────────────────────────────────────────────────────
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[100] h-[2px] origin-left"
      style={{ scaleX, background: "var(--tray-clay)" }}
    />
  );
}

// ── Hover card wrapper ────────────────────────────────────────────────────────
export function HoverCard({
  children,
  className,
  style,
}: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const y = (e.clientY - rect.top);
    setCoords({ x, y });

    const rx = (x / rect.width - 0.5);
    const ry = (y / rect.height - 0.5);
    setTilt({ rotateX: -ry * 7, rotateY: rx * 7 });
  };

  return (
    <motion.div
      variants={cardReveal}
      whileHover={{
        y: -8,
        scale: 1.02,
        boxShadow: "0 32px 80px rgba(26,22,20,0.18)",
        transition: { duration: 0.28, ease: tm.ease },
      }}
      animate={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
      onMouseMove={handleMouse}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setTilt({ rotateX: 0, rotateY: 0 });
        setIsHovered(false);
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: tm.fast, ease: tm.ease }}
      className={className}
      style={{ ...style, transformStyle: "preserve-3d", position: "relative", overflow: "hidden" }}
    >
      {/* Dynamic Cursor Spotlight Reveal */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(160px circle at ${coords.x}px ${coords.y}px, rgba(230, 0, 0, 0.12), transparent 80%)`,
            zIndex: 0,
          }}
        />
      )}
      {/* Content Container to sit above spotlight overlay */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {children}
      </div>
    </motion.div>
  );
}
