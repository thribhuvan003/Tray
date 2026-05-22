"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion } from "framer-motion";
import { prefersReducedMotion, registerTrayGsap, magneticButton } from "@/lib/motion/tray-motion";
import {
  SectionReveal,
  RevealItem,
  HeadlineReveal,
  MotionCTA,
  OrderJourneyVisual,
  tm,
  CountUp,
} from "@/lib/motion/tray-framer";

const FEATURES = [
  { icon: "📱", text: "Order from any canteen on campus" },
  { icon: "⚡", text: "UPI checkout — payment in seconds" },
  { icon: "📺", text: "Kitchen queue updates live in 240 ms" },
  { icon: "🔐", text: "4-digit OTP pickup — no token needed" },
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
    <SectionReveal
      as="div"
      amount={0.15}
      className="relative isolate px-5 pb-12 pt-14 sm:px-8 sm:pt-20 lg:px-10 lg:pb-20 lg:pt-28"
    >
      {/* Parallax blobs — overflow isolated so headline never clips */}
      <div ref={blobRef} className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div data-blob-a className="absolute -left-32 top-10 h-[28rem] w-[28rem] rounded-full will-change-transform" style={{ background: "rgba(184,83,26,0.18)", filter: "blur(5rem)" }} />
        <div data-blob-b className="absolute -right-24 top-16 h-[32rem] w-[32rem] rounded-full will-change-transform" style={{ background: "rgba(42,110,58,0.12)", filter: "blur(6rem)" }} />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        {/* Left: copy */}
        <div>
          {/* Eyebrow */}
          <RevealItem className="mb-5">
            <p
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[0.62rem] uppercase tracking-[0.26em]"
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
          </RevealItem>

          {/* Masked headline reveal */}
          <HeadlineReveal
            as="h1"
            className="max-w-[16ch] leading-[0.82] tracking-[-0.03em]"
            style={{
              fontFamily: "var(--font-barlow)",
              fontWeight: 900,
              fontSize: "clamp(4rem, 10vw, 11rem)",
            } as React.CSSProperties}
            lines={[
              "Order from class.",
              <em key="line2" className="not-italic" style={{ fontFamily: "var(--font-fraunces)", fontStyle: "italic", color: "var(--tray-clay)" }}>
                Pick up ready.
              </em>,
            ]}
          />

          {/* Subtitle */}
          <RevealItem>
            <p
              className="mt-6 max-w-md text-[1.05rem] leading-[1.7] opacity-65"
              style={{ fontFamily: "var(--font-geist)" }}
            >
              Order ahead, pay instantly by UPI, and pick up without waiting.
              One system for students, kitchen staff, and canteen admins.
            </p>
          </RevealItem>

          {/* Feature bullets */}
          <RevealItem>
            <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <li key={f.text} className="flex items-center gap-2.5">
                  <span className="text-base">{f.icon}</span>
                  <span
                    className="text-[0.82rem] leading-snug opacity-70"
                    style={{ fontFamily: "var(--font-geist)" }}
                  >
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>
          </RevealItem>

          {/* CTAs */}
          <RevealItem>
            <div className="mt-9 flex flex-wrap items-center gap-3">
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
          </RevealItem>

          {/* Metrics strip */}
          <RevealItem>
            <div className="mt-10 flex flex-wrap gap-6">
              {METRICS.map((m) => (
                <div key={m.label}>
                  <p
                    className="text-[1.6rem] leading-none font-black tracking-tight"
                    style={{ fontFamily: "var(--font-barlow)", color: "var(--tray-clay)" }}
                  >
                    <CountUp end={m.end} suffix={m.suffix} />
                  </p>
                  <p
                    className="mt-0.5 text-[0.62rem] uppercase tracking-[0.2em] opacity-55"
                    style={{ fontFamily: "var(--font-dm-mono)" }}
                  >
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </RevealItem>
        </div>

        {/* Right: live order journey visual */}
        <RevealItem variant="card">
          <OrderJourneyVisual />
        </RevealItem>
      </div>
    </SectionReveal>
  );
}
