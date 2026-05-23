"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  prefersReducedMotion,
  registerTrayGsap,
} from "@/lib/motion/tray-motion";

const portals = [
  {
    index: "01",
    role: "STUDENT APP",
    dotColor: "#2E80EF",
    title: "Order from any canteen.",
    description: "Choose canteen, browse menu, pay by UPI, track your order live, collect with a 4-digit OTP.",
    deviceBadge: "STUDENT APP · MOBILE",
    demoText: "Student demo",
    signInText: "Sign in as student",
    previewSrc: "/demo/student.html",
    loginRole: "student",
  },
  {
    index: "02",
    role: "KITCHEN VIEW",
    dotColor: "#B8531A",
    title: "Run the live queue.",
    description: "New tickets land instantly, prep timers count down, OTP handover clears the order — no paper, no shouting.",
    deviceBadge: "KITCHEN VIEW · TABLET",
    demoText: "Kitchen demo",
    signInText: "Sign in as kitchen",
    previewSrc: "/demo/kitchen.html",
    loginRole: "kitchen",
  },
  {
    index: "03",
    role: "ADMIN CONSOLE",
    dotColor: "#16A34A",
    title: "See the whole operation.",
    description: "Live orders, daily revenue, menu edits, staff access, full audit log — one screen, every metric.",
    deviceBadge: "ADMIN CONSOLE · DESKTOP",
    demoText: "Admin demo",
    signInText: "Sign in as admin",
    previewSrc: "/demo/admin.html",
    loginRole: "owner",
  },
] as const;

export function PiranhaPortalsSection() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerTrayGsap();
      if (prefersReducedMotion()) return;

      const root = rootRef.current;
      if (!root) return;

      const heading = root.querySelector("[data-portals-heading]") as HTMLElement;

      // Animate the statically defined word spans in the heading without modifying the DOM
      if (heading) {
        gsap.fromTo(
          heading.querySelectorAll(".split-word > span"),
          { yPercent: 105, rotate: 1.5, opacity: 0 },
          {
            yPercent: 0,
            rotate: 0,
            opacity: 1,
            duration: 1.05,
            stagger: 0.04,
            ease: "power4.out",
            scrollTrigger: { trigger: heading, start: "top 80%" },
          }
        );
      }

      // Animate card entrances using scroll trigger
      const cards = root.querySelectorAll("[data-portal-card]");
      if (cards.length) {
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: { trigger: root, start: "top 75%" },
          }
        );
      }
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      id="portals"
      className="relative overflow-hidden px-5 py-24 sm:px-8 lg:px-10 lg:py-32"
      style={{ background: "var(--tray-ink)", color: "var(--tray-cream, #EDE5D2)" }}
    >
      {/* Dot-grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:18px_18px]" />

      <div className="relative z-10 mx-auto max-w-7xl w-full flex flex-col gap-16">
        {/* Heading panel */}
        <div className="max-w-4xl">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <p className="text-[0.72rem] font-code font-medium uppercase tracking-[0.24em] opacity-40">
              01 / The system
            </p>
          </div>

          <h2
            data-portals-heading
            className="leading-[0.85] tracking-[-0.02em] uppercase"
            style={{
              fontFamily: "var(--font-barlow)",
              fontWeight: 900,
              fontSize: "clamp(3rem, 7.5vw, 7.5rem)",
            }}
          >
            <span className="split-word inline-block overflow-hidden"><span className="inline-block mr-[0.22em]">Three</span></span>{" "}
            <span className="split-word inline-block overflow-hidden"><span className="inline-block mr-[0.22em]">portals,</span></span>{" "}
            <span className="split-word inline-block overflow-hidden">
              <span
                className="inline-block not-italic mr-[0.22em]"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontStyle: "italic",
                  textTransform: "none",
                  color: "var(--tray-clay)",
                }}
              >
                one
              </span>
            </span>{" "}
            <span className="split-word inline-block overflow-hidden">
              <span
                className="inline-block not-italic mr-[0.22em]"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontStyle: "italic",
                  textTransform: "none",
                  color: "var(--tray-clay)",
                }}
              >
                source
              </span>
            </span>{" "}
            <span className="split-word inline-block overflow-hidden">
              <span
                className="inline-block not-italic mr-[0.22em]"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontStyle: "italic",
                  textTransform: "none",
                  color: "var(--tray-clay)",
                }}
              >
                of
              </span>
            </span>{" "}
            <span className="split-word inline-block overflow-hidden">
              <span
                className="inline-block not-italic"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontStyle: "italic",
                  textTransform: "none",
                  color: "var(--tray-clay)",
                }}
              >
                truth.
              </span>
            </span>
          </h2>

          <p
            className="mt-7 max-w-3xl text-[1.1rem] leading-8 opacity-58"
            style={{ fontFamily: "var(--font-geist)" }}
          >
            One database, three purpose-built views. What a student orders is what the
            kitchen prepares, which is what the admin monitors. No lag, no re-sync,
            no mystery. Open any portal below — fully live, no sign-up.
          </p>
        </div>

        {/* 3-Column Grid on Desktop, Stack on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-4">
          {portals.map((portal) => (
            <article
              key={portal.role}
              data-portal-card
              className="motion-card group flex min-h-[50rem] flex-col rounded-[2.25rem] bg-white/[0.03] border border-white/10 overflow-hidden select-none transition-all hover:bg-white/[0.06] hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 p-10 sm:p-12 justify-between"
              style={{ outlineColor: portal.dotColor }}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-8">
                <span className="text-[0.72rem] font-code font-bold uppercase tracking-[0.2em] text-white/50">
                  {portal.role}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-code tracking-[0.1em] text-white/50">
                  <span className="h-2.5 w-2.5 rounded-full animate-pulse shadow-[0_0_8px_currentColor]" style={{ background: portal.dotColor, color: portal.dotColor }} />
                  <span className="ml-1 opacity-70">• {portal.index}</span>
                </span>
              </div>

              {/* Content Container */}
              <div className="flex-1 flex flex-col justify-start">
                {/* Title in serif italic font */}
                <h3
                  className="text-3xl sm:text-4xl tracking-tight mb-8 text-[#FAF8F5] leading-[1.25]"
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    fontStyle: "italic",
                    fontWeight: 400,
                  }}
                >
                  {portal.title}
                </h3>

                {/* Description */}
                <p className="opacity-70 text-[0.98rem] leading-[1.65] font-sans mb-8">
                  {portal.description}
                </p>

                {/* Live Preview Container (mockup) — bigger */}
                <div
                  className="relative overflow-hidden rounded-[1.5rem] mb-8 bg-[#0a0a09] border border-white/10 w-full flex-1"
                  style={{ minHeight: 380 }}
                >
                  <iframe
                    src={portal.previewSrc}
                    title={`${portal.title} preview`}
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin"
                    scrolling="no"
                    tabIndex={-1}
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "148%",
                      height: "148%",
                      transform: "scale(0.676)",
                      transformOrigin: "0 0",
                      border: 0,
                      pointerEvents: "none",
                    }}
                  />
                  {/* Device Badge Overlay */}
                  <span
                    className="absolute left-4 top-4 rounded-xl px-3 py-1.5 text-[0.62rem] font-code font-bold uppercase tracking-[0.12em] backdrop-blur-md"
                    style={{
                      color: "var(--tray-cream)",
                      background: "rgba(0,0,0,0.68)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {portal.deviceBadge}
                  </span>
                </div>
              </div>

              {/* Dual CTA Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-auto">
                <a
                  href={portal.previewSrc}
                  className="rounded-full py-3.5 px-5 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.06em] transition-all duration-300 hover:opacity-90"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "var(--tray-cream)",
                  }}
                >
                  <span>{portal.demoText}</span>
                  <span className="text-xs">→</span>
                </a>
                <a
                  href={`/login?role=${portal.loginRole}`}
                  className="rounded-full py-3.5 px-5 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.06em] transition-all duration-300 hover:opacity-90"
                  style={{
                    background: portal.dotColor,
                    color: "#FAF8F5",
                  }}
                >
                  <span>{portal.signInText}</span>
                  <span className="text-xs">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
