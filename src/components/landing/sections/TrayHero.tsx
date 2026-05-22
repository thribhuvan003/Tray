"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion } from "framer-motion";
import { prefersReducedMotion, registerTrayGsap, magneticButton } from "@/lib/motion/tray-motion";
import {
  MotionCTA,
  OrderJourneyVisual,
  tm,
  CountUp,
  staggerContainer,
  fadeUpVar,
  softFadeUp,
} from "@/lib/motion/tray-framer";

const HERO_CHIPS = [
  {
    title: "Any canteen, one tray",
    text: "Students move between active campus counters without changing accounts.",
  },
  {
    title: "UPI to kitchen in seconds",
    text: "Payment confirmation and order state stay visible across every portal.",
  },
  {
    title: "Live queue, no refresh",
    text: "Kitchen tickets, pickup codes, and admin views update from one source.",
  },
  {
    title: "Code pickup",
    text: "A short pickup code replaces paper tokens and counter shouting.",
  },
];

const METRICS = [
  { end: 12, suffix: " min", label: "saved per lunch" },
  { end: 240, suffix: "ms", label: "realtime sync" },
  { end: 0, suffix: "%", label: "Tray commission" },
];

export function TrayHero() {
  const blobRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerTrayGsap();
      if (prefersReducedMotion()) return;

      const blobA = blobRef.current?.querySelector("[data-blob-a]") as HTMLElement;
      const blobB = blobRef.current?.querySelector("[data-blob-b]") as HTMLElement;
      const buttons = document.querySelectorAll("[data-magnetic]");

      if (blobA) {
        gsap.to(blobA, { y: -120, scrollTrigger: { trigger: blobRef.current, start: "top top", end: "bottom top", scrub: 1.4 } });
      }
      if (blobB) {
        gsap.to(blobB, { y: -80, scrollTrigger: { trigger: blobRef.current, start: "top top", end: "bottom top", scrub: 0.9 } });
      }

      const cleanups = Array.from(buttons).map((btn) => magneticButton(btn as HTMLElement));
      return () => {
        cleanups.forEach((c) => c());
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    },
    { scope: blobRef }
  );

  return (
    <motion.section
      className="relative isolate px-5 pb-12 pt-14 sm:px-8 sm:pt-20 lg:px-10 lg:pb-20 lg:pt-28"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {/* Parallax blobs */}
      <div ref={blobRef} className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div data-blob-a className="absolute -left-32 top-10 h-[28rem] w-[28rem] rounded-full will-change-transform" style={{ background: "rgba(184,83,26,0.18)", filter: "blur(5rem)" }} />
        <div data-blob-b className="absolute -right-24 top-16 h-[32rem] w-[32rem] rounded-full will-change-transform" style={{ background: "rgba(42,110,58,0.12)", filter: "blur(6rem)" }} />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        {/* Left: copy */}
        <div>
          {/* Eyebrow — first to animate in */}
          <motion.div variants={softFadeUp} className="mb-5">
            <p
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.2em]"
              style={{
                fontFamily: "var(--font-dm-mono)",
                color: "var(--tray-muted)",
                border: "1px solid var(--tray-border)",
                background: "rgba(255,255,255,0.45)",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--tray-clay)" }} />
              Campus Edition · Live
            </p>
          </motion.div>

          {/* H1 — stronger fade + blur */}
          <motion.h1
            variants={fadeUpVar}
            className="max-w-[18ch] leading-[0.88] tracking-[-0.02em]"
            style={{
              fontFamily: "var(--font-barlow)",
              fontWeight: 900,
              fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
            }}
          >
            Multi-tenant canteen{" "}
            <em className="not-italic" style={{ fontFamily: "var(--font-fraunces)", fontStyle: "italic", color: "var(--tray-clay)" }}>
              management for colleges.
            </em>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={softFadeUp}
            className="mt-6 max-w-lg text-base leading-[1.65] opacity-65"
            style={{ fontFamily: "var(--font-geist)" }}
          >
            Give students fast, cashless ordering while admins get real-time orders,
            analytics, and per-college billing. One system for every campus counter.
          </motion.p>

          {/* Feature chips */}
          <motion.div variants={softFadeUp}>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {HERO_CHIPS.map((chip, index) => (
                <motion.div
                  key={chip.title}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.97 },
                    show: { opacity: 1, y: 0, scale: 1, transition: { delay: 0.1 + index * 0.08, duration: 0.5, ease: tm.ease } },
                  }}
                  whileHover={{ y: -6, scale: 1.02, boxShadow: "0 20px 40px rgba(26,22,20,0.12)" }}
                  className="group rounded-[1.5rem] border p-5 transition-all"
                  style={{ border: "1px solid var(--tray-border)", background: "rgba(255,255,255,0.48)" }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full transition-transform group-hover:scale-125"
                      style={{ background: index % 2 === 0 ? "var(--tray-clay)" : "var(--tray-green)" }}
                    />
                    <span>
                      <span className="block text-sm font-semibold tracking-tight" style={{ fontFamily: "var(--font-jakarta)" }}>
                        {chip.title}
                      </span>
                      <span className="mt-1 block text-sm leading-[1.6] opacity-65" style={{ fontFamily: "var(--font-geist)" }}>
                        {chip.text}
                      </span>
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div variants={softFadeUp}>
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <MotionCTA
                data-magnetic
                href="#portals"
                variant="primary"
                className="rounded-full bg-[var(--tray-ink)] px-7 py-3.5 text-[0.88rem] text-[var(--tray-cream)] font-semibold"
                style={{ fontFamily: "var(--font-geist)" } as React.CSSProperties}
              >
                See how it works
              </MotionCTA>
              <MotionCTA
                data-magnetic
                href="/get-started"
                variant="secondary"
                className="rounded-full border border-[var(--tray-border)] px-7 py-3.5 text-[0.88rem] font-semibold transition hover:bg-white/40"
                style={{ fontFamily: "var(--font-geist)" } as React.CSSProperties}
              >
                I have a canteen
              </MotionCTA>
            </div>
          </motion.div>

          {/* Metrics strip */}
          <motion.div variants={softFadeUp}>
            <div className="mt-10 flex flex-wrap gap-6">
              {METRICS.map((m) => (
                <div key={m.label}>
                  <p
                    className="text-2xl leading-none font-black tracking-tight"
                    style={{ fontFamily: "var(--font-barlow)", color: "var(--tray-clay)" }}
                  >
                    <CountUp end={m.end} suffix={m.suffix} />
                  </p>
                  <p
                    className="mt-1 text-xs uppercase tracking-[0.18em] opacity-55"
                    style={{ fontFamily: "var(--font-dm-mono)" }}
                  >
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right: live order journey visual */}
        <motion.div variants={fadeUpVar}>
          <OrderJourneyVisual />
        </motion.div>
      </div>
    </motion.section>
  );
}
