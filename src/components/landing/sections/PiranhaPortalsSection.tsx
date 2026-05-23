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
    eyebrow: "STUDENT",
    dotColor: "#2E80EF",
    title: "Student",
    description: "Order from any canteen in the campus. Pay by UPI. Track live. Show OTP.",
    previewSrc: "/demo/student.html",
    buttonLabel: "Open student demo",
    showCredentials: false,
    scale: 0.9,
  },
  {
    index: "02",
    eyebrow: "KITCHEN",
    dotColor: "#B8531A",
    title: "Kitchen staff",
    description: "Manage one canteen's live queue. Accept, prep, hand over with OTP.",
    previewSrc: "/demo/kitchen.html",
    buttonLabel: "Sign in as kitchen staff",
    showCredentials: true,
    scale: 0.45,
  },
  {
    index: "03",
    eyebrow: "ADMIN",
    dotColor: "#16A34A",
    title: "Canteen admin",
    description: "Menu, orders, staff, and daily revenue. Full audit log included.",
    previewSrc: "/demo/admin.html",
    buttonLabel: "Sign in as admin",
    showCredentials: true,
    scale: 0.38,
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
      className="relative overflow-hidden px-5 py-24 sm:px-8 lg:px-10 lg:min-h-screen lg:flex lg:flex-col lg:justify-center lg:py-24"
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-10 w-full">
          {portals.map((portal) => (
            <article
              key={portal.index}
              data-portal-card
              className="motion-card group flex flex-col justify-between p-5 sm:p-6 select-none transition-all duration-300 rounded-[2rem] border border-neutral-300/40 bg-[var(--tray-cream,#EDE5D2)] relative overflow-hidden gap-5 shadow-sm hover:shadow-xl hover:shadow-neutral-300/20 hover:-translate-y-1.5"
            >
              {/* Monospace dot-grid background inside the card */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.02] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:14px_14px] text-neutral-800" />

              {/* Top content group */}
              <div className="flex flex-col">
                {/* Eyebrow */}
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-code text-[0.68rem] font-bold uppercase tracking-wider opacity-60">
                    {portal.eyebrow}
                  </span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: portal.dotColor }}
                  />
                </div>

                {/* Title */}
                <h3
                  className="text-[1.85rem] font-normal tracking-tight text-neutral-900 mb-4"
                  style={{ fontFamily: "var(--font-fraunces)", fontStyle: "italic" }}
                >
                  {portal.title}
                </h3>

                {/* Website Preview Container */}
                <div
                  className="relative w-full aspect-[16/10] rounded-2xl border border-neutral-300/40 bg-white overflow-hidden shadow-sm mb-4"
                  style={{ "--scale": portal.scale } as React.CSSProperties}
                >
                  <iframe
                    src={portal.previewSrc}
                    title={`${portal.title} Live Preview`}
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin"
                    scrolling="no"
                    tabIndex={-1}
                    aria-hidden="true"
                    className="border-0 origin-top-left"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "calc(100% / var(--scale))",
                      height: "calc(100% / var(--scale))",
                      transform: "scale(var(--scale))",
                    }}
                  />
                </div>

                {/* Description */}
                <p
                  className="opacity-70 text-[0.88rem] leading-[1.6] text-neutral-600 mb-6"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {portal.description}
                </p>
              </div>

              {/* Bottom content group */}
              <div className="flex flex-col mt-auto w-full gap-2">
                {portal.showCredentials && (
                  <div className="text-[0.58rem] font-code font-extrabold tracking-[0.18em] text-neutral-400 uppercase text-center w-full mb-1">
                    DEMO LOGIN · SHARED CREDENTIALS
                  </div>
                )}

                <a
                  href={portal.previewSrc}
                  className="w-full flex items-center justify-between bg-neutral-900 hover:bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider py-3.5 px-6 rounded-full transition-colors group/btn shadow-sm"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  <span>{portal.buttonLabel}</span>
                  <span className="text-sm transition-transform duration-200 group-hover/btn:translate-x-1">&rarr;</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
