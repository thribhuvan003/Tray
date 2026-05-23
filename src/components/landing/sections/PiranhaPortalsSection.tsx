"use client";

import React, { useRef } from "react";
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
    topLabel: "STUDENT APP",
    title: "Order from any canteen.",
    description: "Choose canteen, browse menu, pay by UPI, track your order live, collect with a 4-digit OTP.",
    deviceBadge: "MOBILE • STUDENT",
    previewSrc: "/demo/student.html",
    loginRole: "student",
    buttonLabel: "LAUNCH DEMO",
    showCredentials: false,
  },
  {
    index: "02",
    role: "KITCHEN",
    dotColor: "#B8531A",
    topLabel: "KITCHEN VIEW",
    title: "Run the live queue.",
    description: "New tickets land instantly, prep timers count down, OTP handover clears the order — no paper, no shouting.",
    deviceBadge: "TABLET • KITCHEN",
    previewSrc: "/demo/kitchen.html",
    loginRole: "kitchen",
    buttonLabel: "LAUNCH DEMO",
    showCredentials: true,
  },
  {
    index: "03",
    role: "ADMIN",
    dotColor: "#16A34A",
    topLabel: "ADMIN CONSOLE",
    title: "See the whole operation.",
    description: "Live orders, daily revenue, menu edits, staff access, full audit log — one screen, every metric.",
    deviceBadge: "DESKTOP • ADMIN",
    previewSrc: "/demo/admin.html",
    loginRole: "owner",
    buttonLabel: "LAUNCH DEMO",
    showCredentials: true,
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
      style={{ background: "var(--tray-cream, #EDE5D2)", color: "var(--tray-ink, #1A1619)" }}
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

        {/* 3-Column Linear Horizontal Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 w-full">
          {portals.map((portal) => (
            <article
              key={portal.index}
              data-portal-card
              className="motion-card group flex flex-col justify-between p-8 sm:p-9 select-none transition-all duration-300 rounded-[2rem] border border-neutral-300/40 bg-[var(--tray-cream,#EDE5D2)] relative overflow-hidden gap-6 shadow-sm hover:shadow-xl hover:shadow-neutral-300/20 hover:-translate-y-1.5"
            >
              {/* Monospace dot-grid background inside the card */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.02] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:14px_14px] text-neutral-800" />

              {/* Text block sit ABOVE the mockup */}
              <div className="relative z-10 flex flex-col gap-3">
                {/* Heading (Display Serif Italic) */}
                <h3
                  className="text-[1.85rem] sm:text-[2.1rem] leading-[1.15] text-neutral-900 font-medium tracking-tight mt-2"
                  style={{ fontFamily: "var(--font-fraunces)", fontStyle: "italic" }}
                >
                  {portal.title}
                </h3>

                {/* Description */}
                <p className="opacity-70 text-[0.88rem] leading-[1.65] font-sans text-neutral-600">
                  {portal.description}
                </p>

                {portal.showCredentials && (
                  <span className="text-[0.62rem] font-code font-extrabold tracking-[0.16em] text-neutral-400 uppercase block">
                    DEMO LOGIN · SHARED CREDENTIALS
                  </span>
                )}
              </div>

              {/* Website Preview Container (Curved Edge Website Viewport, no chassis) */}
              <div className="relative w-full aspect-[4/3] rounded-2xl border border-neutral-300/40 bg-white overflow-hidden shadow-sm my-2 transition-all duration-300">
                {portal.role === "STUDENT" ? (
                  /* Student App: Mobile layout rendered with high-density scale */
                  <iframe
                    src={portal.previewSrc}
                    title={`${portal.title} Live Preview`}
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin"
                    scrolling="no"
                    tabIndex={-1}
                    aria-hidden="true"
                    className="absolute inset-0 w-[130%] h-[130%] origin-top-left scale-[0.76923] border-0"
                  />
                ) : portal.role === "KITCHEN" ? (
                  /* Kitchen App: Tablet view shown big */
                  <iframe
                    src={portal.previewSrc}
                    title={`${portal.title} Live Preview`}
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin"
                    scrolling="no"
                    tabIndex={-1}
                    aria-hidden="true"
                    className="absolute inset-0 w-[200%] h-[200%] origin-top-left scale-[0.5] border-0"
                  />
                ) : (
                  /* Admin App: Desktop view shown big */
                  <iframe
                    src={portal.previewSrc}
                    title={`${portal.title} Live Preview`}
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin"
                    scrolling="no"
                    tabIndex={-1}
                    aria-hidden="true"
                    className="absolute inset-0 w-[333.33%] h-[333.33%] origin-top-left scale-[0.3] border-0"
                  />
                )}
              </div>

              {/* Footer row */}
              <div className="relative z-10 flex items-center justify-end border-t border-neutral-200/60 pt-4 mt-auto">
                <a
                  href={portal.previewSrc}
                  className="inline-flex items-center gap-1 font-code text-[0.68rem] font-bold uppercase tracking-wider text-neutral-800 hover:text-neutral-950 transition-colors"
                >
                  <span>LAUNCH DEMO</span>
                  <span className="text-xs font-sans font-black">&rarr;</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
