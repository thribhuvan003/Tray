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
    eyebrow: "STUDENT APP",
    accentColor: "#5cb1ff",
    title: "Order from any canteen.",
    description:
      "Choose canteen, browse menu, pay by UPI, track your order live, collect with a 4-digit OTP.",
    previewSrc: "/demo/student.html",
    deviceTag: "DESKTOP • STUDENT",
    portalKey: "student" as const,
  },
  {
    index: "02",
    eyebrow: "KITCHEN VIEW",
    accentColor: "#ef5749",
    title: "Run the live queue.",
    description:
      "New tickets land instantly, prep timers count down, OTP handover clears the order — no paper, no shouting.",
    previewSrc: "/demo/kitchen.html",
    deviceTag: "TABLET • KITCHEN",
    portalKey: "kitchen" as const,
  },
  {
    index: "03",
    eyebrow: "ADMIN CONSOLE",
    accentColor: "#cdfa50",
    title: "See the whole operation.",
    description:
      "Live orders, daily revenue, menu edits, staff access, full audit log — one screen, every metric.",
    previewSrc: "/demo/admin.html",
    deviceTag: "DESKTOP • ADMIN",
    portalKey: "admin" as const,
  },
] as const;

export function PiranhaPortalsSection() {
  const rootRef = useRef<HTMLElement>(null);
  const portalRefs = useRef<(HTMLDivElement | null)[]>([]);

  React.useEffect(() => {
    function resizeIframes() {
      portalRefs.current.forEach((frame) => {
        if (!frame) return;
        const iframe = frame.querySelector("iframe");
        if (!iframe) return;
        const parentWidth = frame.clientWidth;
        const parentHeight = frame.clientHeight;
        if (parentWidth === 0) return;

        const virtualWidth = 1440;
        const virtualHeight = parentHeight * (virtualWidth / parentWidth);
        iframe.style.width = `${virtualWidth}px`;
        iframe.style.height = `${virtualHeight}px`;
        const scale = parentWidth / virtualWidth;
        iframe.style.transform = `scale(${scale})`;
        iframe.style.transformOrigin = "0 0";
      });
    }

    resizeIframes();
    window.addEventListener("resize", resizeIframes);
    const interval = setInterval(resizeIframes, 1000);

    return () => {
      window.removeEventListener("resize", resizeIframes);
      clearInterval(interval);
    };
  }, []);

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
      style={{ background: "var(--bg, #0e0a06)", color: "var(--ink, #f5efe4)" }}
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
            className="leading-[0.9] tracking-[-0.03em] uppercase flex flex-col gap-1"
            style={{
              fontFamily: "var(--font-barlow)",
              fontWeight: 900,
              fontSize: "clamp(2.5rem, 6.5vw, 6.2rem)",
              color: "var(--ink, #f5efe4)",
            }}
          >
            <span className="split-word inline-block overflow-hidden">
              <span className="inline-block">Three portals,</span>
            </span>
            <span className="split-word inline-block overflow-hidden">
              <span className="inline-block">one source of</span>
            </span>
            <span className="split-word inline-block overflow-hidden">
              <span className="inline-block">truth.</span>
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

        {/* 3-Column Portal Grid — matches user screenshots */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-[18px] mt-14 w-full"
          style={{ perspective: "1200px" }}
        >
          {portals.map((portal, idx) => (
            <article
              key={portal.index}
              data-portal-card
              className="motion-card group flex flex-col select-none rounded-[18px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              style={{
                background: "var(--bg-2, #161108)",
                border: "1px solid rgba(245,239,228,0.08)",
              }}
            >
              {/* Portal Head — eyebrow + title */}
              <div
                className="flex flex-col gap-2.5"
                style={{
                  padding: "24px 24px 20px",
                  borderBottom: "1px solid rgba(245,239,228,0.08)",
                }}
              >
                <div className="flex justify-between items-center text-[10.5px] font-medium tracking-[0.14em]">
                  <span style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--ink-3, #8a7960)" }}>
                    {portal.eyebrow}
                  </span>
                  <span className="flex items-center gap-1.5 font-bold" style={{ fontFamily: "var(--font-geist-mono, monospace)", color: portal.accentColor }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: portal.accentColor, boxShadow: `0 0 8px ${portal.accentColor}` }} />
                    {portal.index}
                  </span>
                </div>
                <h3
                  className="text-[clamp(1.35rem,3vw,2rem)] tracking-[-0.025em] leading-[1.08] m-0 font-normal italic"
                  style={{
                    fontFamily: "var(--font-instrument-serif, 'Instrument Serif', serif)",
                    color: "var(--ink, #f5efe4)",
                  }}
                >
                  {portal.title}
                </h3>
              </div>

              {/* Portal Frame — iframe preview */}
              <div
                ref={(el) => {
                  portalRefs.current[idx] = el;
                }}
                className="relative overflow-hidden h-[260px] sm:h-[320px] md:h-[400px]"
                style={{
                  background: "var(--bg-3, #1f1810)",
                  borderBottom: "1px solid rgba(245,239,228,0.08)",
                }}
              >
                <iframe
                  src={portal.previewSrc}
                  title={`${portal.title} Live Preview`}
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin"
                  scrolling="no"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="border-0 origin-top-left pointer-events-none absolute top-0 left-0"
                />
              </div>

              {/* Portal Body — description + footer */}
              <div
                className="flex flex-col gap-4 flex-1"
                style={{ padding: "20px 24px 24px" }}
              >
                <p
                  className="text-[13.5px] leading-relaxed m-0 opacity-80"
                  style={{
                    color: "var(--ink-2, #c8b89e)",
                    maxWidth: "34ch",
                    fontFamily: "var(--font-inter, var(--font-geist, sans-serif))",
                  }}
                >
                  {portal.description}
                </p>

                {/* Footer row */}
                <div className="flex justify-between items-center mt-auto pt-4" style={{ borderTop: "1px solid rgba(245,239,228,0.08)" }}>
                  <span className="text-[10px] font-medium tracking-[0.12em]" style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--ink-3, #8a7960)" }}>
                    {portal.deviceTag}
                  </span>
                  <a
                    href={portal.previewSrc}
                    className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.08em] uppercase transition-all duration-200 hover:opacity-85"
                    style={{
                      fontFamily: "var(--font-geist-mono, monospace)",
                      color: portal.accentColor,
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LAUNCH DEMO →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
