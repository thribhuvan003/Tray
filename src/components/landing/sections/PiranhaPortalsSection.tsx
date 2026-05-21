"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  fadeUp,
  prefersReducedMotion,
  registerTrayGsap,
  splitWordReveal,
} from "@/lib/motion/tray-motion";

const portals = [
  {
    index: "01",
    label: "Student app",
    title: "Order from any canteen.",
    text: "Choose canteen, browse menu, pay by UPI, track live, show OTP.",
    flow: ["Canteen", "Menu", "Cart", "UPI", "OTP"],
  },
  {
    index: "02",
    label: "Kitchen view",
    title: "Run the live queue.",
    text: "New tickets, prep timers, ready status, OTP handover.",
    flow: ["New", "Preparing", "Ready", "Verified"],
  },
  {
    index: "03",
    label: "Admin console",
    title: "See the operation.",
    text: "Orders, revenue, menu, staff, audit log, canteen performance.",
    flow: ["Canteens", "Orders", "Revenue", "Staff"],
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
      splitWordReveal(heading, { stagger: 0.04, duration: 1 });

      gsap.matchMedia().add(
        {
          desktop: "(min-width: 900px)",
          mobile: "(max-width: 899px)",
        },
        (context) => {
          const { desktop } = context.conditions as { desktop: boolean; mobile: boolean };

          if (desktop) {
            const track = root.querySelector("[data-portals-track]") as HTMLElement;
            const cards = root.querySelectorAll("[data-portal-card]");
            const progress = root.querySelector("[data-portal-progress]") as HTMLElement;

            gsap.set(cards, { y: 80, opacity: 0, rotate: 1.5 });

            gsap.to(cards, {
              y: 0,
              opacity: 1,
              rotate: 0,
              duration: 0.9,
              stagger: 0.12,
              ease: "power3.out",
              scrollTrigger: {
                trigger: root,
                start: "top 70%",
              },
            });

            gsap.to(track, {
              xPercent: -56,
              ease: "none",
              scrollTrigger: {
                trigger: root,
                start: "top top",
                end: "+=1800",
                scrub: 1,
                pin: true,
                anticipatePin: 1,
              },
            });

            gsap.to(progress, {
              scaleX: 1,
              transformOrigin: "left center",
              ease: "none",
              scrollTrigger: {
                trigger: root,
                start: "top top",
                end: "+=1800",
                scrub: 1,
              },
            });
          } else {
            fadeUp("[data-portal-card]", {
              y: 40,
              stagger: 0.12,
              scrollTrigger: {
                trigger: root,
                start: "top 75%",
              },
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
      className="relative overflow-hidden bg-[var(--tray-ink)] px-5 py-24 text-[var(--tray-bg,#F0EBE2)] sm:px-8 lg:h-screen lg:px-10 lg:py-0"
    >
      {/* Dot-grid texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:18px_18px]" />

      <div
        data-portals-track
        className="relative z-10 flex flex-col gap-8 lg:h-full lg:w-[220vw] lg:flex-row lg:items-center"
      >
        {/* Heading panel */}
        <div className="lg:w-[82vw] lg:shrink-0">
          <p className="font-code mb-5 text-xs uppercase tracking-[0.34em] opacity-45">
            01 / The system
          </p>

          <h2
            data-portals-heading
            className="font-editorial max-w-5xl text-[clamp(4rem,10vw,11rem)] font-black leading-[0.82] tracking-[-0.08em]"
          >
            Three portals, one source of truth.
          </h2>

          <p className="mt-7 max-w-2xl text-lg leading-8 opacity-60">
            Student, kitchen, and admin screens all run from the same live order state.
          </p>

          {/* Scrub progress bar */}
          <div className="mt-8 h-1 w-64 overflow-hidden rounded-full bg-white/10">
            <div
              data-portal-progress
              className="h-full w-full origin-left scale-x-0 rounded-full bg-[var(--tray-clay)]"
            />
          </div>
        </div>

        {/* Portal cards */}
        {portals.map((portal) => (
          <article
            key={portal.label}
            data-portal-card
            className="motion-card flex min-h-[31rem] flex-col justify-between rounded-[2.25rem] border border-white/10 bg-[var(--tray-cream,#F0E6D2)] p-6 text-[var(--tray-ink)] shadow-[0_30px_100px_rgba(0,0,0,0.35)] lg:h-[72vh] lg:w-[34vw] lg:shrink-0 lg:p-8"
          >
            <div>
              <div className="font-code mb-10 flex items-center justify-between text-xs uppercase tracking-[0.22em] text-[var(--tray-muted)]">
                <span>{portal.label}</span>
                <span>{portal.index}</span>
              </div>

              <h3 className="font-editorial text-5xl font-black leading-[0.88] tracking-[-0.06em] lg:text-6xl">
                {portal.title}
              </h3>

              <p className="mt-5 text-base leading-7 opacity-70">
                {portal.text}
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-2">
              {portal.flow.map((step) => (
                <span
                  key={step}
                  className="font-code rounded-full border border-[var(--tray-border)] bg-white/60 px-3 py-2 text-[0.68rem] uppercase tracking-[0.16em]"
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
