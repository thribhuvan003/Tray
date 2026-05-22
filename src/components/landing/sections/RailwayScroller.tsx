"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "@/lib/motion/tray-motion";

const portals = [
  {
    index: "01",
    label: "Student Portal",
    badgeColor: "var(--tray-clay)",
    text: "Order from any canteen with native UPI and live queue updates.",
    href: "/demo/student.html",
  },
  {
    index: "02",
    label: "Kitchen Board",
    badgeColor: "var(--tray-green)",
    text: "Fulfill orders instantly and broadcast menu specials in real time.",
    href: "/demo/kitchen.html",
  },
  {
    index: "03",
    label: "Admin Console",
    badgeColor: "var(--tray-ink)",
    text: "Manage multiple canteens, monitor live insights, and configure menus.",
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

    const railwayScroller = scrollerRef.current;
    const railwayGlowPath = pathRef.current;
    
    // We wait for layout to settle
    const timeout = setTimeout(() => {
      const svgPathLength = railwayGlowPath.getTotalLength();
      railwayGlowPath.style.strokeDasharray = `${svgPathLength}`;
      railwayGlowPath.style.strokeDashoffset = `${svgPathLength}`;

      const cardData = [
        { offset: 0.18, el: cardsRef.current[0], baseX: 0, baseY: 0, baseAngle: 0 },
        { offset: 0.50, el: cardsRef.current[1], baseX: 0, baseY: 0, baseAngle: 0 },
        { offset: 0.82, el: cardsRef.current[2], baseX: 0, baseY: 0, baseAngle: 0 },
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
        const pt = railwayGlowPath.getPointAtLength(dist);
        const ptNext = railwayGlowPath.getPointAtLength(Math.min(dist + 6, svgPathLength));
        card.baseX = pt.x;
        card.baseY = pt.y;
        const angleRad = Math.atan2(ptNext.y - pt.y, ptNext.x - pt.x);
        card.baseAngle = angleRad * (180 / Math.PI) - 90;
      });

      stationData.forEach((st) => {
        if (!st.el) return;
        const dist = st.offset * svgPathLength;
        const pt = railwayGlowPath.getPointAtLength(dist);
        st.y = pt.y;
        st.el.setAttribute("transform", `translate(${pt.x}, ${pt.y})`);
      });

      function renderRailwayScroll(scrollTop: number, velocity: number = 0) {
        const maxScroll = railwayScroller.scrollHeight - railwayScroller.clientHeight;
        const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;

        railwayGlowPath.style.strokeDashoffset = `${svgPathLength - (progress * svgPathLength)}`;
        const viewportCenter = scrollTop + (railwayScroller.clientHeight / 2);

        cardData.forEach((card) => {
          if (!card.el) return;
          const distanceToCenter = card.baseY - viewportCenter;
          const absDist = Math.abs(distanceToCenter);
          const focusFactor = Math.max(0, 1 - absDist / 220);
          const easeFocus = Math.sin(focusFactor * Math.PI / 2);
          
          const scale = 0.92 + easeFocus * 0.12;
          const opacity = 0.25 + easeFocus * 0.75;
          const driftX = (distanceToCenter / 220) * 20; 
          const sway = (distanceToCenter / 220) * 12;
          const kineticTilt = Math.max(-15, Math.min(15, velocity * 0.15));
          const finalRotate = card.baseAngle + sway * (1 - easeFocus) + kineticTilt * easeFocus;

          card.el.style.left = `${card.baseX}px`;
          card.el.style.top = `${card.baseY}px`;
          card.el.style.opacity = `${opacity}`;
          card.el.style.transform = `translate(-50%, -50%) translate3d(${driftX}px, 0, 0) scale(${scale}) rotate(${finalRotate}deg)`;

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

      let currentScroll = 0;
      let targetScroll = 0;
      let isTickerRunning = false;

      const handleScroll = () => {
        targetScroll = railwayScroller.scrollTop;
        if (!isTickerRunning) {
          isTickerRunning = true;
          updateRailwayMomentum();
        }
      };

      function updateRailwayMomentum() {
        const diff = targetScroll - currentScroll;
        if (Math.abs(diff) > 0.05) {
          currentScroll += diff * 0.095;
          renderRailwayScroll(currentScroll, diff);
          requestAnimationFrame(updateRailwayMomentum);
        } else {
          currentScroll = targetScroll;
          renderRailwayScroll(currentScroll, 0);
          isTickerRunning = false;
        }
      }

      railwayScroller.addEventListener("scroll", handleScroll);
      renderRailwayScroll(0);

      return () => {
        railwayScroller.removeEventListener("scroll", handleScroll);
      };
    }, 150);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .railway-scroller-box {
          width: 100%;
          height: 70vh;
          overflow-y: scroll;
          position: relative;
          scroll-behavior: smooth;
        }
        .railway-scroller-box::-webkit-scrollbar {
          display: none;
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
          width: 280px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          backdrop-filter: blur(16px);
          z-index: 5;
          left: 0;
          top: 0;
          transform: translate(-50%, -50%) scale(0.92);
          opacity: 0.25;
          transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s, box-shadow 0.3s, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          color: var(--tray-cream);
          overflow: hidden;
        }
        .railway-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.08) 55%, transparent 70%);
          transform: translateX(-100%);
          transition: transform 0.95s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
          z-index: 1;
        }
        .railway-card.is-focused::before {
          transform: translateX(100%);
        }
        .railway-card:hover {
          border-color: rgba(255, 255, 255, 0.25);
          background: rgba(255, 255, 255, 0.08);
        }
        .railway-card.is-focused {
          opacity: 1;
          border-color: var(--tray-clay);
          background: rgba(255,255,255,0.08);
          box-shadow: 0 16px 40px rgba(184, 83, 26, 0.16);
        }
        .railway-card.is-focused:hover {
          border-color: var(--tray-clay);
          background: rgba(255,255,255,0.12);
          box-shadow: 0 20px 48px rgba(184, 83, 26, 0.24);
        }
        .railway-card:active {
          filter: brightness(0.9);
        }
        .railway-card-badge {
          font-size: 0.58rem;
          font-family: var(--font-dm-mono);
          text-transform: uppercase;
          padding: 4px 8px;
          border-radius: 4px;
          background: rgba(0,0,0,0.2);
          font-weight: 700;
          display: inline-block;
          margin-bottom: 12px;
        }
      `}} />

      <div className="railway-scroller-box" ref={scrollerRef}>
        <div className="railway-canvas-container">
          <svg className="railway-svg-track" viewBox="0 0 460 3200" preserveAspectRatio="none">
            <path className="railway-track-bed" d="M 230 0 C 420 300, 40 500, 230 800 C 420 1100, 40 1300, 230 1600 C 420 1900, 40 2100, 230 2400 C 420 2700, 40 2900, 230 3200" />
            <path className="railway-sleepers" d="M 230 0 C 420 300, 40 500, 230 800 C 420 1100, 40 1300, 230 1600 C 420 1900, 40 2100, 230 2400 C 420 2700, 40 2900, 230 3200" />
            <path className="railway-track-bg" d="M 230 0 C 420 300, 40 500, 230 800 C 420 1100, 40 1300, 230 1600 C 420 1900, 40 2100, 230 2400 C 420 2700, 40 2900, 230 3200" />
            <path className="railway-track-glow" ref={pathRef} d="M 230 0 C 420 300, 40 500, 230 800 C 420 1100, 40 1300, 230 1600 C 420 1900, 40 2100, 230 2400 C 420 2700, 40 2900, 230 3200" />
            
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
              style={{ outlineColor: p.badgeColor }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="railway-card-badge" style={{ color: p.badgeColor, marginBottom: 0 }}>
                  {p.index} · {p.label}
                </span>
                <span className="text-[0.65rem] font-code font-bold uppercase tracking-wider opacity-0 translate-x-[-4px] group-hover/card:opacity-75 group-hover/card:translate-x-0 transition-all text-white/80">
                  Launch →
                </span>
              </div>
              <h3 className="text-2xl font-bold font-editorial mb-2" style={{ color: "var(--tray-cream)" }}>
                {p.label}
              </h3>
              <p className="opacity-70 text-sm font-geist">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
