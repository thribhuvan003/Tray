"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import {
  drawSvgPath,
  fadeUp,
  prefersReducedMotion,
  registerTrayGsap,
} from "@/lib/motion/tray-motion";

// Canteen names are intentionally generic — this section is for the product,
// not for any specific college. Dynamic campus name comes in as a prop.
const DEMO_CANTEENS = [
  "Main Canteen",
  "Hostel Mess",
  "North Block",
  "Night Canteen",
] as const;

const ROLE_SCOPES = [
  ["Student", "all active canteens"],
  ["Kitchen staff", "one assigned canteen"],
  ["Canteen admin", "one canteen operations"],
  ["Campus admin", "whole campus overview"],
] as const;

export function CampusModelSection({ campusName }: { campusName?: string | null }) {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerTrayGsap();
      if (prefersReducedMotion()) return;

      fadeUp("[data-campus-item]", {
        y: 34,
        stagger: 0.08,
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 70%",
        },
      });

      rootRef.current?.querySelectorAll<SVGPathElement>("[data-campus-line]").forEach((path) => {
        drawSvgPath(path, {
          trigger: rootRef.current,
          start: "top 68%",
        });
      });
    },
    { scope: rootRef }
  );

  return (
    <section ref={rootRef} className="px-5 py-24 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        {/* Copy */}
        <div>
          <p className="font-code mb-4 text-xs uppercase tracking-[0.3em] text-[var(--tray-muted)]">
            Campus Edition
          </p>
          <h2 className="font-editorial text-[clamp(3.5rem,8vw,8rem)] font-black leading-[0.86] tracking-[-0.075em]">
            One campus. Many counters.
          </h2>
          <p className="mt-6 max-w-xl text-[1.05rem] leading-8 opacity-70">
            Students see every active canteen on campus. Kitchen staff see only
            their assigned queue. Admins manage one canteen. No cross-contamination,
            no wrong orders, no confusion about which screen to look at.
          </p>
        </div>

        {/* Diagram */}
        <div className="relative rounded-[2rem] border border-[var(--tray-border)] bg-white/55 p-5 shadow-[0_24px_80px_rgba(17,17,17,0.07)]">
          {/* SVG lines drawn by GSAP */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 700 520"
            aria-hidden
          >
            <path data-campus-line d="M350 90 C260 160 210 180 150 250" fill="none" stroke="var(--tray-clay)" strokeWidth="2" />
            <path data-campus-line d="M350 90 C310 170 300 190 300 250" fill="none" stroke="var(--tray-clay)" strokeWidth="2" />
            <path data-campus-line d="M350 90 C420 170 430 190 450 250" fill="none" stroke="var(--tray-clay)" strokeWidth="2" />
            <path data-campus-line d="M350 90 C510 155 540 190 560 250" fill="none" stroke="var(--tray-clay)" strokeWidth="2" />
          </svg>

          <div className="relative z-10 grid gap-5">
            {/* Campus node */}
            <div
              data-campus-item
              className="mx-auto w-fit rounded-full bg-[var(--tray-ink)] px-6 py-4 text-center text-[var(--tray-cream,#F0E6D2)]"
            >
              <p className="font-code text-[0.68rem] uppercase tracking-[0.18em] opacity-55">
                Campus
              </p>
              <p className="mt-1 font-semibold">
                {campusName || "Your College Campus"}
              </p>
            </div>

            {/* Canteen nodes */}
            <div className="grid gap-3 pt-16 sm:grid-cols-2">
              {DEMO_CANTEENS.map((canteen) => (
                <div
                  key={canteen}
                  data-campus-item
                  className="rounded-[1.3rem] border border-[var(--tray-border)] bg-[var(--tray-cream,#F0E6D2)] p-4"
                >
                  <p className="font-semibold">{canteen}</p>
                  <p className="font-code mt-2 text-[0.65rem] uppercase tracking-[0.16em] text-[var(--tray-muted)]">
                    canteen scope
                  </p>
                </div>
              ))}
            </div>

            {/* Role scope chips */}
            <div data-campus-item className="grid gap-2 pt-4 sm:grid-cols-2">
              {ROLE_SCOPES.map(([role, scope]) => (
                <div
                  key={role}
                  className="rounded-full border border-[var(--tray-border)] bg-white/70 px-4 py-3"
                >
                  <span className="font-code text-[0.65rem] uppercase tracking-[0.16em] text-[var(--tray-muted)]">
                    {role}
                  </span>
                  <span className="ml-2 text-sm font-medium">{scope}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
