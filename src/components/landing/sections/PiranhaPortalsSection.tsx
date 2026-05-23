"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  fadeUp,
  prefersReducedMotion,
  registerTrayGsap,
} from "@/lib/motion/tray-motion";
import { splitWords } from "@/lib/motion/tray-motion";
import { RailwayScroller } from "./RailwayScroller";

const portals = [
  {
    index: "01",
    role: "STUDENT",
    label: "Student",
    deviceBadge: "STUDENT APP · LAPTOP",
    previewSrc: "/demo/student.html",
    previewDevice: "Student app · laptop",
    accent: "var(--color-ocean-500, #2E80EF)",
    text: "Order from any canteen in the campus. Pay by UPI. Track live. Show OTP.",
    btnText: "Open student demo",
  },
  {
    index: "02",
    role: "KITCHEN",
    label: "Kitchen staff",
    deviceBadge: "KITCHEN VIEW · TABLET",
    previewSrc: "/demo/kitchen.html",
    previewDevice: "Kitchen view · tablet",
    accent: "#B8531A",
    text: "Manage one canteen's live queue. Accept, prep, hand over with OTP.",
    btnText: "Sign in as kitchen staff",
  },
  {
    index: "03",
    role: "ADMIN",
    label: "Canteen admin",
    deviceBadge: "ADMIN CONSOLE · DESKTOP",
    previewSrc: "/demo/admin.html",
    previewDevice: "Admin console · desktop",
    accent: "var(--tray-green, #16A34A)",
    text: "Menu, orders, staff, and daily revenue. Full audit log included.",
    btnText: "Sign in as admin",
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

      // Character-split reveal for the huge title
      if (heading) {
        splitWords(heading);
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

      gsap.matchMedia().add(
        { desktop: "(min-width: 900px)", mobile: "(max-width: 899px)" },
        (context) => {
          const { desktop } = context.conditions as { desktop: boolean };

          if (desktop) {
            const cards    = root.querySelectorAll("[data-portal-card]");
            const progress = root.querySelector("[data-portal-progress]") as HTMLElement;

            gsap.set(cards, { y: 80, opacity: 0 });
            gsap.to(cards, {
              y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: "power3.out",
              scrollTrigger: { trigger: root, start: "top 70%" },
            });

            // Progress bar scrub
            if (progress) {
              gsap.to(progress, {
                scaleX: 1, transformOrigin: "left center", ease: "none",
                scrollTrigger: { trigger: root, start: "top top", end: "+=1900", scrub: 1 },
              });
            }
          } else {
            fadeUp("[data-portal-card]", {
              y: 40, stagger: 0.12,
              scrollTrigger: { trigger: root, start: "top 75%" },
            });
          }
        }
      );
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      id="portals"
      className="relative overflow-hidden px-5 py-24 sm:px-8 lg:h-screen lg:px-10 lg:py-0"
      style={{ background: "var(--tray-ink)", color: "var(--tray-cream, #EDE5D2)" }}
    >
      {/* Dot-grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:18px_18px]" />

      <div
        className="relative z-10 flex flex-col gap-8 lg:h-full lg:flex-row lg:items-center mx-auto max-w-7xl w-full"
      >
        {/* Heading panel */}
        <div className="lg:w-[45vw] lg:shrink-0 lg:pr-10">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <p
              className="text-[0.72rem] font-code font-medium uppercase tracking-[0.24em] opacity-40"
            >
              01 / The system
            </p>
          </div>

          {/* Barlow Condensed 900 — maximum impact */}
          <h2
            data-portals-heading
            className="max-w-5xl leading-[0.80] tracking-[-0.02em]"
            style={{
              fontFamily: "var(--font-barlow)",
              fontWeight: 900,
              fontSize: "clamp(4rem, 10vw, 11rem)",
              textTransform: "uppercase",
            }}
          >
            Three portals,{" "}
            <em
              className="not-italic"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontStyle: "italic",
                textTransform: "none",
                color: "var(--tray-clay)",
              }}
            >
              one source of truth.
            </em>
          </h2>

          <p
            className="mt-7 max-w-2xl text-[1.1rem] leading-8 opacity-58"
            style={{ fontFamily: "var(--font-geist)" }}
          >
            One database, three purpose-built views. What a student orders is what the
            kitchen prepares, which is what the admin monitors. No lag, no re-sync,
            no mystery. Open any portal below — fully live, no sign-up.
          </p>

          {/* Scrub progress bar */}
          <div className="mt-8 h-[3px] w-56 overflow-hidden rounded-full bg-white/10">
            <div
              data-portal-progress
              className="h-full w-full origin-left scale-x-0 rounded-full"
              style={{ background: "var(--tray-clay)" }}
            />
          </div>
        </div>

        {/* Railway Scroller explicitly rendering the curvy logic */}
        <div className="hidden lg:block lg:flex-1 lg:h-full lg:min-w-[50vw]">
          <RailwayScroller />
        </div>

        {/* Mobile stacking fallback */}
        <div className="lg:hidden flex flex-col gap-6 mt-10">
          {portals.map((portal) => (
            <article
              key={portal.label}
              data-portal-card
              role="button"
              tabIndex={0}
              onClick={() => { window.location.href = portal.previewSrc; }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  window.location.href = portal.previewSrc;
                }
              }}
              className="motion-card group flex min-h-[30rem] flex-col rounded-[2.25rem] bg-white/5 border border-white/10 overflow-hidden cursor-pointer select-none transition-all hover:bg-white/10 hover:border-white/20 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ outlineColor: portal.accent }}
            >
              <div className="flex flex-col flex-1 p-6">
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[0.72rem] font-code font-bold uppercase tracking-[0.2em] text-white/50">
                    {portal.role}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full animate-pulse shadow-[0_0_8px_currentColor]" style={{ background: portal.accent, color: portal.accent }} />
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-3xl font-black font-ui uppercase tracking-tight mb-5 text-white">
                  {portal.label}
                </h3>

                {/* Live Preview Container (mockup) */}
                <div
                  className="relative overflow-hidden rounded-[1.5rem] mb-5 bg-[#0a0a09] border border-white/10"
                  style={{ height: 220 }}
                >
                  <iframe
                    src={portal.previewSrc}
                    title={`${portal.label} preview`}
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin"
                    scrolling="no"
                    tabIndex={-1}
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "154%",
                      height: "154%",
                      transform: "scale(0.65)",
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

                {/* Description */}
                <p className="opacity-70 text-[0.9rem] leading-[1.6] font-geist mb-6">
                  {portal.text}
                </p>

                {/* Button at the bottom */}
                <div
                  className="w-full rounded-full py-3.5 px-6 flex items-center justify-between text-sm font-semibold uppercase tracking-[0.08em] transition-all duration-300 mt-auto"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "var(--tray-cream)",
                  }}
                >
                  <span className="group-hover/card:text-white transition-colors">{portal.btnText}</span>
                  <span className="transition-transform group-hover/card:translate-x-1 duration-300">→</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
