"use client";

import { useEffect } from "react";

/**
 * Scroll-driven motion for the marketing landing only.
 * Respects prefers-reduced-motion; uses GSAP ScrollTrigger.
 * Each section gets its own entrance animation.
 */
export function LandingMotion() {
  useEffect(() => {
    const html = document.documentElement;
    const prevScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "smooth";

    const cleanupScroll = () => {
      html.style.scrollBehavior = prevScrollBehavior;
    };

    const killScrollTriggers = () => {
      void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ScrollTrigger.getAll().forEach((t: any) => t.kill());
      });
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      document.querySelectorAll(".tray-landing [data-reveal]").forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
        (el as HTMLElement).style.transform = "none";
      });
      return cleanupScroll;
    }

    let killed = false;

    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (killed) return;
      gsap.registerPlugin(ScrollTrigger);

      const root = document.querySelector(".tray-landing");
      if (!root) return;

      // ── HERO: headline words stagger up with 3D flip ──────────────────────
      gsap.from(".tray-landing .tl-h1 .tl-word", {
        y: 56,
        opacity: 0,
        rotateX: 14,
        stagger: 0.055,
        duration: 1.1,
        ease: "power4.out",
        delay: 0.2,
      });

      // ── HERO: stats count-up feel (slide + fade) ──────────────────────────
      gsap.from(".tray-landing .tl-hero-stat", {
        y: 28,
        opacity: 0,
        stagger: 0.1,
        duration: 0.9,
        ease: "power3.out",
        delay: 0.6,
      });

      // ── HERO: CTA buttons pop in ──────────────────────────────────────────
      gsap.from(".tray-landing .tl-hero-cta .tl-btn", {
        scale: 0.92,
        opacity: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: "back.out(1.4)",
        delay: 0.85,
      });

      // ── SECTION HEADS: eyebrow + h2 words + side text ────────────────────
      root.querySelectorAll<HTMLElement>(".tl-section-num").forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: "top 90%" },
          x: -20,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
        });
      });

      root.querySelectorAll<HTMLElement>(".tl-section-head h2").forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: "top 85%" },
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: "power4.out",
        });
      });

      root.querySelectorAll<HTMLElement>(".tl-section-head .tl-side").forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: "top 88%" },
          y: 20,
          opacity: 0,
          duration: 0.75,
          ease: "power3.out",
          delay: 0.15,
        });
      });

      // ── PORTAL CARDS: staggered slide-up with slight tilt ────────────────
      const portals = root.querySelectorAll<HTMLElement>(".tl-portal");
      portals.forEach((el, i) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 92%",
          },
          y: 60,
          opacity: 0,
          rotateY: i % 2 === 0 ? -3 : 3,
          duration: 0.9,
          delay: i * 0.1,
          ease: "power3.out",
        });
      });

      // ── SYNC DIAGRAM: nodes cascade in ───────────────────────────────────
      root.querySelectorAll<HTMLElement>(".tl-node").forEach((el, i) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: "top 90%" },
          x: i % 2 === 0 ? -24 : 24,
          opacity: 0,
          duration: 0.65,
          delay: i * 0.08,
          ease: "power3.out",
        });
      });

      // ── SYNC SECTION: heading + lede ─────────────────────────────────────
      gsap.from(".tray-landing .tl-sync-grid h2", {
        scrollTrigger: {
          trigger: ".tray-landing .tl-sync-grid",
          start: "top 85%",
        },
        y: 36,
        opacity: 0,
        duration: 0.9,
        ease: "power4.out",
      });

      // ── LINE LEAVE SECTION ────────────────────────────────────────────────
      gsap.from(".tray-landing .tl-line-leave-title", {
        scrollTrigger: {
          trigger: ".tray-landing .tl-line-leave",
          start: "top 88%",
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".tray-landing .tl-line-leave-panel", {
        scrollTrigger: {
          trigger: ".tray-landing .tl-line-leave",
          start: "top 85%",
        },
        y: 24,
        opacity: 0,
        duration: 0.75,
        delay: 0.15,
        ease: "power3.out",
      });

      // ── PULL QUOTE: scale + fade ──────────────────────────────────────────
      gsap.from(".tray-landing .tl-pull p", {
        scrollTrigger: {
          trigger: ".tray-landing .tl-pull",
          start: "top 85%",
        },
        scale: 0.96,
        opacity: 0,
        duration: 1.0,
        ease: "power3.out",
      });

      // ── FLOW STEPS: wave stagger ──────────────────────────────────────────
      gsap.from(".tray-landing .tl-flow-step", {
        scrollTrigger: {
          trigger: ".tray-landing .tl-flow",
          start: "top 85%",
        },
        y: 36,
        opacity: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: "power3.out",
      });

      // ── STACK CARDS: grid wave ────────────────────────────────────────────
      root.querySelectorAll<HTMLElement>(".tl-stack-card").forEach((el, i) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: "top 92%" },
          y: 24,
          opacity: 0,
          scale: 0.96,
          duration: 0.6,
          delay: (i % 4) * 0.07,
          ease: "power3.out",
        });
      });

      // ── CLOSING CTA: scale up ─────────────────────────────────────────────
      gsap.from(".tray-landing .tl-closing h2", {
        scrollTrigger: {
          trigger: ".tray-landing .tl-closing",
          start: "top 85%",
        },
        scale: 0.94,
        opacity: 0,
        duration: 1.0,
        ease: "power4.out",
      });

      gsap.from(".tray-landing .tl-closing .tl-btn", {
        scrollTrigger: {
          trigger: ".tray-landing .tl-closing .tl-cta-row",
          start: "top 90%",
        },
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.65,
        ease: "back.out(1.2)",
      });

      // ── GENERIC [data-reveal] fallback ────────────────────────────────────
      root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        // skip elements already targeted above
        if (
          el.classList.contains("tl-section") ||
          el.classList.contains("tl-sync") ||
          el.classList.contains("tl-pull") ||
          el.classList.contains("tl-closing")
        ) return;
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none none",
          },
          y: 32,
          opacity: 0,
          duration: 0.85,
          ease: "power3.out",
        });
      });

    })();

    return () => {
      killed = true;
      killScrollTriggers();
      cleanupScroll();
    };
  }, []);

  return null;
}
