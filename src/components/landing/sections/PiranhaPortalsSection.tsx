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
    text: "Choose canteen, browse menu, pay by UPI, track live, show OTP.",
    flow: ["Canteen", "Menu", "Cart", "UPI", "OTP"],
    accent: "var(--color-ocean-500, #6E86AB)",
  },
  {
    index: "02",
    label: "Kitchen view",
    title: "Run the live queue.",
    text: "New tickets, prep timers, ready status, OTP handover at counter.",
    flow: ["New", "Preparing", "Ready", "Verified"],
    accent: "#B8531A",
  },
  {
    index: "03",
    label: "Admin console",
    title: "See the whole operation.",
    text: "Orders, revenue, menu, staff, audit log, canteen performance.",
    flow: ["Canteens", "Orders", "Revenue", "Staff"],
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

            // Horizontal scroll pin
            gsap.to(track, {
              xPercent: -56, ease: "none",
              scrollTrigger: {
                trigger: root, start: "top top", end: "+=1900",
                scrub: 1, pin: true, anticipatePin: 1,
              },
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
        data-portals-track
        className="relative z-10 flex flex-col gap-8 lg:h-full lg:w-[220vw] lg:flex-row lg:items-center"
      >
        {/* Heading panel */}
        <div className="lg:w-[82vw] lg:shrink-0">
          <p
            className="mb-5 text-xs uppercase tracking-[0.34em] opacity-40"
            style={{ fontFamily: "var(--font-dm-mono)" }}
          >
            01 / The system
          </p>

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

        {/* Portal cards */}
        {portals.map((portal) => (
          <article
            key={portal.label}
            data-portal-card
            className="motion-card flex min-h-[30rem] flex-col justify-between rounded-[2.25rem] p-6 lg:h-[72vh] lg:w-[34vw] lg:shrink-0 lg:p-8"
            style={{
              background: "var(--tray-bg, #D8C9AE)",
              color: "var(--tray-ink)",
              border: "1px solid rgba(26,22,20,0.12)",
              boxShadow: "0 30px 100px rgba(0,0,0,0.35)",
            }}
          >
            <div>
              <div
                className="mb-10 flex items-center justify-between text-[0.65rem] uppercase tracking-[0.24em]"
                style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}
              >
                <span>{portal.label}</span>
                <span>{portal.index}</span>
              </div>

              {/* Fraunces for card titles — editorial serif contrast */}
              <h3
                className="leading-[0.88] tracking-[-0.05em]"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontWeight: 900,
                  fontSize: "clamp(2.8rem, 4.5vw, 4.5rem)",
                }}
              >
                {portal.title}
              </h3>

              <p
                className="mt-5 text-[1rem] leading-7 opacity-68"
                style={{ fontFamily: "var(--font-geist)" }}
              >
                {portal.text}
              </p>
            </div>

            {/* Flow chips */}
            <div className="mt-8 flex flex-wrap gap-2">
              {portal.flow.map((step) => (
                <span
                  key={step}
                  className="rounded-full border px-3 py-2 text-[0.65rem] uppercase tracking-[0.16em]"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    borderColor: "rgba(26,22,20,0.14)",
                    background: "rgba(255,255,255,0.55)",
                  }}
                >
                  {step}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
