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

// Piranha-style cinematic section.
// Title font: Barlow Condensed 900 (Druk-level uppercase impact).
// Card titles: Fraunces — editorial serif contrast to the condensed title.
// Metadata: DM Mono.
// Desktop: pinned horizontal scroll with scrub progress bar.
// Mobile: clean stacked cards with clip-reveal.

const portals = [
  {
    index: "01",
    label: "Student app",
    title: "Order from any canteen.",
    text: "Choose canteen, browse menu, pay by UPI, track your order live, collect with a 4-digit OTP.",
    previewSrc: "/demo/student.html",
    previewDevice: "Mobile · student",
    accent: "var(--color-ocean-500, #6E86AB)",
  },
  {
    index: "02",
    label: "Kitchen view",
    title: "Run the live queue.",
    text: "New tickets land instantly, prep timers count down, OTP handover clears the order — no paper, no shouting.",
    previewSrc: "/demo/kitchen.html",
    previewDevice: "Tablet · kitchen",
    accent: "#B8531A",
  },
  {
    index: "03",
    label: "Admin console",
    title: "See the whole operation.",
    text: "Live orders, daily revenue, menu edits, staff access, full audit log — one screen, every metric.",
    previewSrc: "/demo/admin.html",
    previewDevice: "Desktop · admin",
    accent: "var(--tray-green)",
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
            const track    = root.querySelector("[data-portals-track]") as HTMLElement;
            const cards    = root.querySelectorAll("[data-portal-card]");
            const progress = root.querySelector("[data-portal-progress]") as HTMLElement;

            gsap.set(cards, { y: 80, opacity: 0, rotate: 1.5 });
            gsap.to(cards, {
              y: 0, opacity: 1, rotate: 0, duration: 0.9, stagger: 0.12, ease: "power3.out",
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
                <div
                  className="mb-8 flex items-center justify-between text-[0.65rem] uppercase tracking-[0.24em]"
                  style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}
                >
                  <span>{portal.label}</span>
                  <span
                    className="flex items-center gap-1.5"
                    style={{ color: portal.accent }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: portal.accent }} />
                    {portal.index}
                  </span>
                </div>
                <h3
                  className="leading-[0.9] tracking-[-0.03em]"
                  style={{
                    fontFamily: "var(--font-cormorant)",
                    fontWeight: 600,
                    fontStyle: "italic",
                    fontSize: "clamp(2.4rem, 3.8vw, 4rem)",
                  }}
                >
                  {portal.title}
                </h3>
                <p className="mt-4 text-[0.95rem] leading-7 opacity-65 font-geist">
                  {portal.text}
                </p>

                <div className="mt-auto pt-8 flex items-center justify-between">
                  <span className="text-[0.7rem] font-code font-semibold uppercase tracking-[0.12em] opacity-40">
                    {portal.previewDevice}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-70 group-hover:opacity-100 group-hover:text-white transition-all">
                    Launch Demo <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
