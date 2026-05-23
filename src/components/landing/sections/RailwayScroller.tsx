"use client";

import React, { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion/tray-motion";

const portals = [
  {
    index: "01",
    role: "STUDENT",
    label: "Student",
    deviceBadge: "STUDENT APP · LAPTOP",
    badgeColor: "var(--color-ocean-500, #2E80EF)",
    text: "Order from any canteen in the campus. Pay by UPI. Track live. Show OTP.",
    btnText: "Open student demo",
    href: "/demo/student.html",
  },
  {
    index: "02",
    role: "KITCHEN",
    label: "Kitchen staff",
    deviceBadge: "KITCHEN VIEW · TABLET",
    badgeColor: "#B8531A",
    text: "Manage one canteen's live queue. Accept, prep, hand over with OTP.",
    btnText: "Sign in as kitchen staff",
    href: "/demo/kitchen.html",
  },
  {
    index: "03",
    role: "ADMIN",
    label: "Canteen admin",
    deviceBadge: "ADMIN CONSOLE · DESKTOP",
    badgeColor: "var(--tray-green, #16A34A)",
    text: "Menu, orders, staff, and daily revenue. Full audit log included.",
    btnText: "Sign in as admin",
    href: "/demo/admin.html",
  },
];

export function RailwayScroller() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const stationsRef = useRef<(SVGGElement | null)[]>([]);

  useEffect(() => {
    if (prefersReducedMotion() || !scrollerRef.current || !pathRef.current) return;

    let triggerInstance: any = null;

    const timeout = setTimeout(async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      gsap.registerPlugin(ScrollTrigger);

      const scrollerEl = scrollerRef.current;
      const pathEl = pathRef.current;
      if (!scrollerEl || !pathEl) return;

      const svgPathLength = pathEl.getTotalLength();
      pathEl.style.strokeDasharray = `${svgPathLength}`;
      pathEl.style.strokeDashoffset = `${svgPathLength}`;

      const cardData = [
        { offset: 0.18, el: cardsRef.current[0], baseX: 0, baseY: 0 },
        { offset: 0.50, el: cardsRef.current[1], baseX: 0, baseY: 0 },
        { offset: 0.82, el: cardsRef.current[2], baseX: 0, baseY: 0 },
      ];

      const stationData = [
        { offset: 0.18, el: stationsRef.current[0], y: 0 },
        { offset: 0.50, el: stationsRef.current[1], y: 0 },
        { offset: 0.82, el: stationsRef.current[2], y: 0 },
      ];

      // Init positions
      cardData.forEach((card) => {
        if (!card.el) return;
        const dist = card.offset * svgPathLength;
        const pt = pathEl.getPointAtLength(dist);
        card.baseX = pt.x;
        card.baseY = pt.y;
      });

      stationData.forEach((st) => {
        if (!st.el) return;
        const dist = st.offset * svgPathLength;
        const pt = pathEl.getPointAtLength(dist);
        st.y = pt.y;
        st.el.setAttribute("transform", `translate(${pt.x}, ${pt.y})`);
      });

      function renderRailwayScroll(progress: number, velocity: number = 0) {
        if (!pathEl || !scrollerEl) return;
        pathEl.style.strokeDashoffset = `${svgPathLength - (progress * svgPathLength)}`;
        
        // Map progress (0-1) to an virtual scrollTop over a height of 3200px
        const maxScroll = 3200 - scrollerEl.clientHeight;
        const scrollTop = progress * maxScroll;
        const viewportCenter = scrollTop + (scrollerEl.clientHeight / 2);

        cardData.forEach((card) => {
          if (!card.el) return;
          const distanceToCenter = card.baseY - viewportCenter;
          const absDist = Math.abs(distanceToCenter);
          const focusFactor = Math.max(0, 1 - absDist / 220);
          const easeFocus = Math.sin(focusFactor * Math.PI / 2);
          
          const scale = 0.92 + easeFocus * 0.08;
          const opacity = 0.35 + easeFocus * 0.65;

          card.el.style.left = `${card.baseX}px`;
          card.el.style.top = `${card.baseY}px`;
          card.el.style.opacity = `${opacity}`;
          card.el.style.transform = `translate(-50%, -50%) scale(${scale})`;

          if (absDist < 160) {
            card.el.classList.add("is-focused");
          } else {
            card.el.classList.remove("is-focused");
          }
        });

        stationData.forEach((st) => {
          if (!st.el) return;
          const dist = Math.abs(st.y - viewportCenter);
          if (dist < 180) {
            st.el.classList.add("is-active");
          } else {
            st.el.classList.remove("is-active");
          }
        });
      }

      // Create ScrollTrigger to pin #portals and scrub the railway
      triggerInstance = ScrollTrigger.create({
        trigger: "#portals",
        start: "top top",
        end: "+=2200",
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          renderRailwayScroll(self.progress, self.getVelocity());
        }
      });

      renderRailwayScroll(0);
    }, 150);

    return () => {
      clearTimeout(timeout);
      if (triggerInstance) triggerInstance.kill();
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .railway-scroller-box {
          width: 100%;
          height: 80vh;
          overflow: hidden;
          position: relative;
        }
        .railway-canvas-container {
          position: relative;
          height: 3200px;
          width: 100%;
        }
        .railway-svg-track {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 460px;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }
        .railway-track-bed {
          stroke: rgba(255,255,255, 0.05);
          stroke-width: 32;
          stroke-linecap: round;
          fill: none;
        }
        .railway-sleepers {
          stroke: rgba(255,255,255, 0.1);
          stroke-width: 22;
          stroke-dasharray: 3, 10;
          fill: none;
        }
        .railway-track-bg {
          stroke: rgba(255,255,255, 0.15);
          stroke-width: 6;
          stroke-linecap: round;
          fill: none;
        }
        .railway-track-glow {
          stroke: var(--tray-clay);
          stroke-width: 6;
          stroke-linecap: round;
          fill: none;
          filter: drop-shadow(0 0 10px var(--tray-clay));
          transition: stroke-dashoffset 0.08s linear;
        }
        .station-ring-outer {
          fill: none;
          stroke: var(--tray-clay);
          stroke-width: 1;
          opacity: 0.25;
          transform-origin: center;
          animation: stationPulse 2.5s infinite ease-in-out;
        }
        .station-ring-inner {
          fill: none;
          stroke: var(--tray-clay);
          stroke-width: 1.5;
          opacity: 0.4;
          transform-origin: center;
          animation: stationPulse 1.8s infinite ease-in-out 0.4s;
        }
        .station-dot {
          fill: #fff;
          stroke: var(--tray-clay);
          stroke-width: 3;
          r: 6px;
          transition: all 0.3s ease-out;
        }
        .railway-station.is-active .station-dot {
          fill: var(--tray-clay);
          filter: drop-shadow(0 0 8px var(--tray-clay));
          r: 8px;
        }
        .railway-station.is-active .station-ring-outer {
          stroke: var(--tray-clay);
          opacity: 0.85;
          animation: stationPulseActive 1.2s infinite ease-out;
        }
        @keyframes stationPulse {
          0% { transform: scale(0.85); opacity: 0.2; }
          50% { transform: scale(1.15); opacity: 0.5; }
          100% { transform: scale(0.85); opacity: 0.2; }
        }
        @keyframes stationPulseActive {
          0% { transform: scale(0.9); opacity: 0.9; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .railway-card {
          position: absolute;
          width: 440px;
          background: rgba(26, 26, 25, 0.95);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 36px;
          padding: 28px;
          box-shadow: 0 12px 36px rgba(0,0,0,0.4);
          backdrop-filter: blur(16px);
          z-index: 5;
          left: 0;
          top: 0;
          transform: translate(-50%, -50%) scale(0.92);
          opacity: 0.35;
          transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s, box-shadow 0.3s, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          color: var(--tray-cream);
          overflow: hidden;
        }
        .railway-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 55%, transparent 70%);
          transform: translateX(-100%);
          transition: transform 0.95s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
          z-index: 1;
        }
        .railway-card.is-focused::before {
          transform: translateX(100%);
        }
        .railway-card:hover {
          border-color: rgba(255, 255, 255, 0.18);
          background: rgba(26, 26, 25, 0.98);
        }
        .railway-card.is-focused {
          opacity: 1;
          border-color: var(--tray-border);
          background: rgba(26, 26, 25, 0.96);
          box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,255,255,0.03);
        }
        .railway-card.is-focused:hover {
          border-color: rgba(255, 255, 255, 0.25);
          box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 50px rgba(255,255,255,0.05);
        }
        .railway-card:active {
          filter: brightness(0.95);
        }
      `}} />

      <div className="railway-scroller-box" ref={scrollerRef}>
        <div className="railway-canvas-container">
          <svg className="railway-svg-track" viewBox="0 0 460 3200" preserveAspectRatio="none">
            <path className="railway-track-bed" d="M 230 0 L 230 3200" />
            <path className="railway-sleepers" d="M 230 0 L 230 3200" />
            <path className="railway-track-bg" d="M 230 0 L 230 3200" />
            <path className="railway-track-glow" ref={pathRef} d="M 230 0 L 230 3200" />
            
            {[1, 2, 3].map((_, i) => (
              <g key={i} className="railway-station" ref={(el) => { stationsRef.current[i] = el; }}>
                <circle className="station-ring-outer" cx="0" cy="0" r="24" />
                <circle className="station-ring-inner" cx="0" cy="0" r="14" />
                <circle className="station-dot" cx="0" cy="0" />
              </g>
            ))}
          </svg>

          {portals.map((p, i) => (
            <div
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => { window.location.href = p.href; }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  window.location.href = p.href;
                }
              }}
              className="railway-card cursor-pointer group/card select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              ref={(el) => { cardsRef.current[i] = el; }}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[0.72rem] font-code font-bold uppercase tracking-[0.2em] text-white/50">
                  {p.role}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full animate-pulse shadow-[0_0_8px_currentColor]" style={{ background: p.badgeColor, color: p.badgeColor }} />
                </span>
              </div>

              {/* Title */}
              <h3 className="text-3xl font-black font-ui uppercase tracking-tight mb-5 text-white">
                {p.label}
              </h3>

              {/* Live Preview Container (mockup) */}
              <div
                className="relative overflow-hidden rounded-[1.5rem] mb-5 bg-[#0a0a09] border border-white/10"
                style={{ height: 220 }}
              >
                <iframe
                  src={p.href}
                  title={`${p.label} preview`}
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
                  {p.deviceBadge}
                </span>
              </div>

              {/* Description */}
              <p className="opacity-70 text-[0.9rem] leading-[1.6] font-geist mb-6 min-h-[3.2rem]">
                {p.text}
              </p>

              {/* Button at the bottom */}
              <div
                className="w-full rounded-full py-3.5 px-6 flex items-center justify-between text-sm font-semibold uppercase tracking-[0.08em] transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "var(--tray-cream)",
                }}
              >
                <span className="group-hover/card:text-white transition-colors">{p.btnText}</span>
                <span className="transition-transform group-hover/card:translate-x-1 duration-300">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
