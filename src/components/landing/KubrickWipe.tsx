"use client";

import { useEffect, useRef } from "react";

/**
 * KubrickWipe — Cinematic between-section transition system.
 *
 * Adapted from kubrick.life's editorial "page wipe" motion:
 * A full-width panel (Tray ink / clay / cream) sweeps horizontally across
 * the viewport as the user crosses each major section boundary.
 *
 * The wipe acts as a visual "chapter break" — exactly like Kubrick's
 * dramatic cuts between film chapters. Implemented using GSAP ScrollTrigger
 * scrub so the wipe is driven by scroll position (not time), giving the user
 * a tactile, cinematic sense of turning a page.
 *
 * How it works:
 *  1. A fixed panel (position:fixed, full-screen) lives outside the layout.
 *  2. ScrollTrigger pins at each section boundary.
 *  3. The panel sweeps from translateX(-100%) → translateX(0%) → translateX(100%)
 *     via a 2-step GSAP timeline scrubbed to the scroll position.
 *  4. Each section boundary gets its own color (ink, clay, cream alternating).
 *  5. On complete, the panel is transparent so it never obstructs content.
 */

const WIPE_BOUNDARIES = [
  // [sectionId, panel color, label shown during wipe]
  ["portals",  "var(--tray-ink)",   "01 / The System"],
  ["trust",    "var(--tray-clay)",  "02 / Trust"],
  ["campus",   "var(--tray-ink)",   "03 / Campus"],
  ["sync",     "var(--tray-cream)", "04 / Realtime"],
  ["flow",     "var(--tray-ink)",   "05 / How It Works"],
  ["stack",    "var(--tray-clay)",  "06 / Built With"],
  ["closing",  "var(--tray-ink)",   "07 / Ship It"],
] as const;

export function KubrickWipe() {
  const panelRef   = useRef<HTMLDivElement>(null);
  const labelRef   = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let ctx: any = null;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      gsap.registerPlugin(ScrollTrigger);

      const panel = panelRef.current;
      const label = labelRef.current;
      if (!panel || !label) return;

      // Start hidden, off-screen to the left
      gsap.set(panel, { xPercent: -105, display: "flex" });

      ctx = gsap.context(() => {
        WIPE_BOUNDARIES.forEach(([sectionId, color, text]) => {
          const section = document.getElementById(sectionId);
          if (!section) return;

          // The "wipe zone" is ~120px tall at the boundary between sections
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top 96%",     // begins just before section enters
              end:   "top 4%",      // completes just as section reaches top
              scrub: 0.6,           // slightly lagged for cinematic feel
              onEnter: () => {
                panel.style.setProperty("--wipe-color", color);
                panel.style.background = `var(--wipe-color)`;
                label.textContent = text;
                // Set label color based on bg
                label.style.color = color === "var(--tray-cream)"
                  ? "var(--tray-ink)"
                  : "var(--tray-cream)";
              },
              onEnterBack: () => {
                panel.style.background = color;
                label.textContent = text;
                label.style.color = color === "var(--tray-cream)"
                  ? "var(--tray-ink)"
                  : "var(--tray-cream)";
              },
            },
          });

          tl
            // Phase 1: sweep IN from left (0% → 50% of scroll range)
            .fromTo(panel,
              { xPercent: -105 },
              { xPercent: 0, ease: "power2.inOut", duration: 1 }
            )
            // Phase 2: continue sweeping OUT to right (50% → 100% of range)
            .to(panel,
              { xPercent: 105, ease: "power2.inOut", duration: 1 }
            );
        });
      });
    })();

    return () => {
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <div
      ref={panelRef}
      aria-hidden
      className="tl-kubrick-wipe"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "none",             // shown by GSAP on mount
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        willChange: "transform",
        background: "var(--tray-ink)",
      }}
    >
      <span
        ref={labelRef}
        style={{
          fontFamily: "var(--font-dm-mono)",
          fontSize: "clamp(0.65rem, 1.2vw, 0.8rem)",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          opacity: 0.55,
          color: "var(--tray-cream)",
          userSelect: "none",
        }}
      />
    </div>
  );
}
