"use client";

import { useEffect, useRef } from "react";

const WIPE_BOUNDARIES = [
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

      gsap.set(panel, { xPercent: -105, display: "flex" });

      ctx = gsap.context(() => {
        WIPE_BOUNDARIES.forEach(([sectionId, color, text]) => {
          const section = document.getElementById(sectionId);
          if (!section) return;

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top 96%",
              end:   "top 4%",
              scrub: 0.6,
              onEnter: () => {
                panel.style.setProperty("--wipe-color", color);
                panel.style.background = `var(--wipe-color)`;
                label.textContent = text;
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
            .fromTo(panel,
              { xPercent: -105 },
              { xPercent: 0, ease: "power2.inOut", duration: 1 }
            )
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
        display: "none",
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
