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
    role: "STUDENT",
    dotColor: "#2E80EF",
    title: "Student",
    description: "Choose canteen, browse menu, pay by UPI, track your order live, collect with a 4-digit OTP.",
    deviceBadge: "STUDENT APP · MOBILE",
    demoText: "Open student demo",
    signInText: "Sign in as student",
    previewSrc: "/demo/student.html",
    loginRole: "student",
    frameType: "phone",
  },
  {
    index: "02",
    role: "KITCHEN STAFF",
    dotColor: "#B8531A",
    title: "Kitchen staff",
    description: "New tickets land instantly, prep timers count down, OTP handover clears the order — no paper, no shouting.",
    deviceBadge: "KITCHEN VIEW · TABLET",
    demoText: "Sign in as kitchen staff",
    signInText: "Sign in as kitchen",
    previewSrc: "/demo/kitchen.html",
    loginRole: "kitchen",
    frameType: "tablet",
  },
  {
    index: "03",
    role: "CANTEEN ADMIN",
    dotColor: "#16A34A",
    title: "Canteen admin",
    description: "Live orders, daily revenue, menu edits, staff access, full audit log — one screen, every metric.",
    deviceBadge: "ADMIN CONSOLE · DESKTOP",
    demoText: "Sign in as admin",
    signInText: "Sign in as admin",
    previewSrc: "/demo/admin.html",
    loginRole: "owner",
    frameType: "desktop",
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
      style={{ background: "var(--tray-cream, #FAF8F5)", color: "var(--tray-ink, #1A1619)" }}
    >
      {/* Dot-grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:20px_20px]" />

      <div className="relative z-10 mx-auto max-w-7xl w-full flex flex-col gap-16">
        {/* Heading panel */}
        <div className="max-w-4xl">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <p className="text-[0.72rem] font-code font-medium uppercase tracking-[0.24em] opacity-50">
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
            className="mt-7 max-w-3xl text-[1.1rem] leading-8 opacity-75 text-neutral-700 dark:text-neutral-300"
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
              className="motion-card group flex min-h-[46rem] flex-col rounded-[2rem] bg-white border border-[#e5e5e0] shadow-[0_4px_24px_rgba(26,22,25,0.03)] overflow-hidden select-none transition-all hover:shadow-[0_12px_32px_rgba(26,22,25,0.06)] hover:-translate-y-1.5 p-8 sm:p-10 justify-between"
              style={{ outlineColor: portal.dotColor }}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-[0.68rem] font-code font-bold uppercase tracking-[0.2em] text-neutral-400">
                  {portal.role}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-code tracking-[0.1em] text-neutral-400">
                  <span className="h-2.5 w-2.5 rounded-full animate-pulse shadow-[0_0_8px_currentColor]" style={{ background: portal.dotColor, color: portal.dotColor }} />
                  <span className="ml-1 opacity-70">• {portal.index}</span>
                </span>
              </div>

              {/* Content Container */}
              <div className="flex-1 flex flex-col justify-start">
                {/* Title in bold Barlow font */}
                <h3
                  className="text-2xl sm:text-3xl font-black tracking-tight mb-4 text-[var(--tray-ink)] leading-none"
                  style={{
                    fontFamily: "var(--font-barlow)",
                    fontWeight: 900,
                  }}
                >
                  {portal.title}
                </h3>

                {/* Live Preview Container (mockup) */}
                <div className="relative overflow-hidden mb-6 bg-[#f9f6f0] rounded-2xl flex items-center justify-center p-6 border border-neutral-200/40 w-full min-h-[300px]">
                  {portal.frameType === "phone" && (
                    <div className="relative mx-auto w-[180px] h-[320px] rounded-[1.8rem] border-[6px] border-[#1a1619] bg-[#0a0a09] shadow-lg overflow-hidden shrink-0">
                      <iframe
                        src={portal.previewSrc}
                        title={`${portal.title} preview`}
                        loading="lazy"
                        sandbox="allow-scripts allow-same-origin"
                        scrolling="no"
                        tabIndex={-1}
                        aria-hidden="true"
                        className="absolute inset-0 border-0 pointer-events-none"
                        style={{
                          width: "300px",
                          height: "540px",
                          transform: "scale(0.56)",
                          transformOrigin: "0 0",
                        }}
                      />
                    </div>
                  )}

                  {portal.frameType === "tablet" && (
                    <div className="relative mx-auto w-full max-w-[270px] aspect-[4/3] rounded-[1.2rem] border-[6px] border-[#1a1619] bg-[#0a0a09] shadow-lg overflow-hidden shrink-0">
                      <iframe
                        src={portal.previewSrc}
                        title={`${portal.title} preview`}
                        loading="lazy"
                        sandbox="allow-scripts allow-same-origin"
                        scrolling="no"
                        tabIndex={-1}
                        aria-hidden="true"
                        className="absolute inset-0 border-0 pointer-events-none"
                        style={{
                          width: "143%",
                          height: "143%",
                          transform: "scale(0.7)",
                          transformOrigin: "0 0",
                        }}
                      />
                    </div>
                  )}

                  {portal.frameType === "desktop" && (
                    <div className="relative mx-auto w-full max-w-[280px] aspect-[16/10] rounded-[0.8rem] border-[5px] border-[#1a1619] bg-[#0a0a09] shadow-lg overflow-hidden shrink-0">
                      <iframe
                        src={portal.previewSrc}
                        title={`${portal.title} preview`}
                        loading="lazy"
                        sandbox="allow-scripts allow-same-origin"
                        scrolling="no"
                        tabIndex={-1}
                        aria-hidden="true"
                        className="absolute inset-0 border-0 pointer-events-none"
                        style={{
                          width: "166%",
                          height: "166%",
                          transform: "scale(0.6)",
                          transformOrigin: "0 0",
                        }}
                      />
                    </div>
                  )}

                  {/* Device Badge Overlay */}
                  <span
                    className="absolute left-3 top-3 rounded-lg px-2.5 py-1.5 text-[0.55rem] font-code font-bold uppercase tracking-[0.15em] backdrop-blur-md"
                    style={{
                      color: "var(--tray-cream)",
                      background: "rgba(26,22,25,0.72)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {portal.deviceBadge}
                  </span>
                </div>

                {/* Description */}
                <p className="text-neutral-600 text-[0.92rem] leading-[1.6] font-sans mb-6">
                  {portal.description}
                </p>
              </div>

              {/* Single CTA Button */}
              <div className="mt-auto flex flex-col">
                {portal.loginRole !== "student" && (
                  <div className="text-[0.62rem] font-code uppercase tracking-wider text-neutral-400 mb-2.5 mt-auto text-center">
                    demo login · shared credentials
                  </div>
                )}
                <a
                  href={portal.previewSrc}
                  className="w-full rounded-2xl py-3.5 px-6 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.12em] bg-[#1a1619] text-white hover:bg-[#1a1619]/90 shadow-sm transition-all duration-200"
                >
                  <span>{portal.demoText}</span>
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

