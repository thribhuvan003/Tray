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
    title: "Student",
    description: "Order from any canteen in the campus. Pay by UPI. Track live. Show OTP.",
    deviceBadge: "STUDENT APP · MOBILE",
    previewSrc: "/demo/student.html",
    loginRole: "student",
    buttonLabel: "Open student demo",
    showCredentials: false,
  },
  {
    index: "02",
    role: "KITCHEN",
    dotColor: "#B8531A",
    title: "Kitchen staff",
    description: "Manage one canteen's live queue. Accept, prep, hand over with OTP.",
    deviceBadge: "KITCHEN VIEW · TABLET",
    previewSrc: "/demo/kitchen.html",
    loginRole: "kitchen",
    buttonLabel: "Sign in as kitchen staff",
    showCredentials: true,
  },
  {
    index: "03",
    role: "ADMIN",
    dotColor: "#16A34A",
    title: "Canteen admin",
    description: "Menu, orders, staff, and daily revenue. Full audit log included.",
    deviceBadge: "ADMIN CONSOLE · DESKTOP",
    previewSrc: "/demo/admin.html",
    loginRole: "owner",
    buttonLabel: "Sign in as admin",
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
              className="motion-card group flex flex-col justify-between p-8 sm:p-9 select-none transition-all duration-300 rounded-[2rem] border border-neutral-200 bg-white relative overflow-hidden gap-6 shadow-sm hover:shadow-md"
            >
              {/* Monospace dot-grid background inside the card */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.02] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:14px_14px] text-neutral-800" />

              {/* Text block sit ABOVE the mockup */}
              <div className="relative z-10 flex flex-col gap-1.5">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <span className="text-[0.62rem] font-code font-bold uppercase tracking-[0.2em] text-neutral-400">
                    {portal.role}
                  </span>
                  <span className="flex items-center">
                    <span
                      className="h-2.5 w-2.5 rounded-full animate-pulse shadow-[0_0_8px_currentColor]"
                      style={{ background: portal.dotColor, color: portal.dotColor }}
                    />
                  </span>
                </div>

                {/* Heading (Bold Sans-Serif) */}
                <h3 className="text-[1.85rem] sm:text-[2rem] font-sans font-black tracking-tight text-neutral-900 leading-[1.1] mt-2">
                  {portal.title}
                </h3>
              </div>

              {/* Mockup Frame with overlapping badge */}
              <div className="relative w-full my-2">
                {/* Absolute overlapping badge */}
                <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-sm border border-neutral-200/80 rounded-full px-3.5 py-1.5 shadow-sm">
                  <span className="text-[0.58rem] font-code font-bold uppercase tracking-wider text-neutral-700">
                    {portal.deviceBadge}
                  </span>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-neutral-200/80 w-full aspect-[4/3] bg-black/5 flex flex-col shadow-lg transition-transform duration-300 group-hover:scale-[1.01] group-hover:-translate-y-0.5">
                  <div className="relative flex-1 w-full overflow-hidden bg-white">
                    <iframe
                      src={portal.previewSrc}
                      title={`${portal.role} Live Preview`}
                      loading="lazy"
                      sandbox="allow-scripts allow-same-origin"
                      scrolling="yes"
                      tabIndex={-1}
                      aria-hidden="true"
                      className="absolute top-0 left-0 border-0 pointer-events-none select-none"
                      style={{
                        width: "160%",
                        height: "160%",
                        transform: "scale(0.625)",
                        transformOrigin: "top left",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Description & Demo Credentials & Button Below Mockup */}
              <div className="relative z-10 flex flex-col gap-4 mt-auto">
                <p className="opacity-70 text-[0.88rem] leading-[1.65] font-sans text-neutral-600">
                  {portal.description}
                </p>

                {portal.showCredentials && (
                  <span className="text-[0.62rem] font-code font-extrabold tracking-[0.16em] text-neutral-400 uppercase block -mt-1">
                    DEMO LOGIN · SHARED CREDENTIALS
                  </span>
                )}

                <a
                  href={portal.previewSrc}
                  className="inline-flex items-center justify-between w-full py-3.5 px-6 rounded-xl text-[0.72rem] font-code font-bold uppercase tracking-wider transition-all duration-300 bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.98] shadow-sm mt-2"
                >
                  <span>{portal.buttonLabel}</span>
                  <span className="text-sm font-sans font-black">&rarr;</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
