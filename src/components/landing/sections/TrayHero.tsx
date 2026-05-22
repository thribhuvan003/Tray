"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  fadeUp,
  magneticButton,
  prefersReducedMotion,
  registerTrayGsap,
  splitWordReveal,
} from "@/lib/motion/tray-motion";

// Hero uses Barlow Condensed Black for maximum Druk-like title impact.
// Fraunces italic wraps the clay accent word.
// Parallax blobs respond to scroll via GSAP scrub.

export function TrayHero() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerTrayGsap();
      if (prefersReducedMotion()) return;

      const root = rootRef.current;
      if (!root) return;

      const title = root.querySelector("[data-hero-title]") as HTMLElement;
      const buttons = root.querySelectorAll("[data-magnetic]");
      const blobA = root.querySelector("[data-blob-a]") as HTMLElement;
      const blobB = root.querySelector("[data-blob-b]") as HTMLElement;
      const cards = root.querySelectorAll("[data-hero-visual]");
      const eyebrow = root.querySelector("[data-hero-eyebrow]") as HTMLElement;

      // Title split-word reveal
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl
        .fromTo(eyebrow, { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
        .add(() => splitWordReveal(title, { stagger: 0.04, duration: 1.1 }), "-=0.3")
        .add(fadeUp("[data-hero-copy]", { y: 24, duration: 0.75 }), "-=0.55")
        .add(fadeUp(cards, { y: 38, stagger: 0.1, duration: 0.9 }), "-=0.45");

      // Parallax blobs (different scroll speeds)
      if (blobA) {
        gsap.to(blobA, {
          y: -140,
          scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: 1.4 },
        });
      }
      if (blobB) {
        gsap.to(blobB, {
          y: -90,
          scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: 0.9 },
        });
      }

      // Mouse parallax on cards (desktop only)
      if (window.matchMedia("(hover: hover)").matches) {
        root.addEventListener("mousemove", (e: MouseEvent) => {
          const rx = (e.clientX / window.innerWidth - 0.5) * 2;
          const ry = (e.clientY / window.innerHeight - 0.5) * 2;
          gsap.to(cards, {
            rotateY: rx * 4,
            rotateX: -ry * 3,
            transformPerspective: 1200,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.04,
          });
        });
      }

      // Magnetic CTAs
      const cleanups = Array.from(buttons).map((btn) => magneticButton(btn as HTMLElement));

      return () => {
        cleanups.forEach((c) => c());
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="relative isolate px-5 pb-12 pt-20 sm:px-8 sm:pt-28 lg:px-10 lg:pb-24 lg:pt-36"
    >
      {/* Blob container — isolated overflow so text is never clipped */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div data-blob-a className="absolute -left-32 top-16 h-[28rem] w-[28rem] rounded-full bg-[var(--tray-clay)]/20 blur-[5rem] will-change-transform" />
        <div data-blob-b className="absolute -right-24 top-20 h-[32rem] w-[32rem] rounded-full bg-[var(--tray-green)]/14 blur-[6rem] will-change-transform" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        {/* Left: copy */}
        <div>
          <p
            data-hero-eyebrow
            className="mb-5 text-xs uppercase tracking-[0.3em] text-[var(--tray-muted)]"
            style={{ fontFamily: "var(--font-dm-mono)" }}
          >
            Mobile-first · UPI checkout · Live queue sync
          </p>

          {/* Barlow Condensed 900 — Druk-level impact */}
          <h1
            data-hero-title
            className="max-w-[16ch] leading-[0.82] tracking-[-0.03em]"
            style={{
              fontFamily: "var(--font-barlow)",
              fontWeight: 900,
              fontSize: "clamp(4.2rem, 10.5vw, 11.5rem)",
            }}
          >
            Order from class.{" "}
            <em
              className="not-italic block"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontStyle: "italic",
                color: "var(--tray-clay)",
              }}
            >
              Pick up ready.
            </em>
          </h1>

          {/* Geist body — direct, CEO-level clarity */}
          <p
            data-hero-copy
            className="mt-7 max-w-xl text-[1.1rem] leading-[1.75] opacity-70"
            style={{ fontFamily: "var(--font-geist)" }}
          >
            Students order by phone, pay by UPI, collect with a 4-digit OTP.
            The kitchen sees every ticket live. The admin watches every rupee.
            No printed tokens. No shouted names. No guesswork.
          </p>

          {/* CTAs — Geist Semibold */}
          <div data-hero-copy className="mt-9 flex flex-wrap items-center gap-3">
            <a
              data-magnetic
              href="#portals"
              className="rounded-full bg-[var(--tray-ink)] px-7 py-4 text-[0.9rem] text-[var(--tray-cream)] transition hover:scale-[1.02]"
              style={{ fontFamily: "var(--font-geist)", fontWeight: 600 }}
            >
              See how it works →
            </a>
            <Link
              data-magnetic
              href="/get-started"
              className="rounded-full border border-[var(--tray-border)] px-7 py-4 text-[0.9rem] transition hover:bg-white/40"
              style={{ fontFamily: "var(--font-geist)", fontWeight: 600 }}
            >
              I have a canteen →
            </Link>
          </div>
        </div>

        {/* Right: layered product mock cards */}
        <div className="grid gap-3.5">
          <HeroMockCard
            label="Student"
            status="ORDERED"
            title="Butter Chicken + Roti"
            meta="OTP 7342 · Ready now · ₹95"
            accentVar="var(--color-ocean-500, #6E86AB)"
          />
          <HeroMockCard
            label="Kitchen"
            status="LIVE"
            title="Batch 4 preparing"
            meta="14 active · 2 ready · 3.1 min avg"
            accentVar="#B8531A"
          />
          <HeroMockCard
            label="Admin"
            status="TODAY"
            title="₹34,200 · 0 refunds"
            meta="4 canteens open · 412 orders · +18%"
            accentVar="var(--tray-green)"
          />
        </div>
      </div>
    </section>
  );
}

function HeroMockCard({
  label, status, title, meta, accentVar,
}: {
  label: string; status: string; title: string; meta: string; accentVar: string;
}) {
  return (
    <div
      data-hero-visual
      className="motion-card rounded-[2rem] border border-[var(--tray-border)] bg-white/65 p-5 shadow-[0_20px_60px_rgba(26,22,20,0.10)] backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-[0_32px_80px_rgba(26,22,20,0.14)]"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="mb-5 flex items-center justify-between">
        <span
          className="text-[0.65rem] uppercase tracking-[0.24em] text-[var(--tray-muted)]"
          style={{ fontFamily: "var(--font-dm-mono)" }}
        >
          {label}
        </span>
        <span
          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.58rem] uppercase tracking-[0.18em]"
          style={{ fontFamily: "var(--font-dm-mono)", background: `color-mix(in srgb, ${accentVar} 14%, transparent)`, color: accentVar }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ background: accentVar }}
          />
          {status}
        </span>
      </div>
      <h3
        className="text-[1.3rem] leading-tight tracking-[-0.03em]"
        style={{ fontFamily: "var(--font-jakarta)", fontWeight: 700 }}
      >
        {title}
      </h3>
      <p
        className="mt-2.5 text-[0.62rem] uppercase tracking-[0.16em] text-[var(--tray-muted)]"
        style={{ fontFamily: "var(--font-dm-mono)" }}
      >
        {meta}
      </p>
    </div>
  );
}
