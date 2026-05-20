"use client";

import { useEffect } from "react";

/**
 * GSAP ScrollTrigger for the marketing landing only.
 * Hero intro + scroll reveals; respects prefers-reduced-motion.
 */
export function LandingMotion() {
  useEffect(() => {
    const html = document.documentElement;
    const prevScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "smooth";

    const root = document.querySelector<HTMLElement>(".tray-landing");
    if (!root) {
      return () => {
        html.style.scrollBehavior = prevScrollBehavior;
      };
    }

    const nav = root.querySelector<HTMLElement>(".tl-nav");
    const progressBar = root.querySelector<HTMLElement>(".tl-scroll-progress");

    let ctxRevert: (() => void) | undefined;
    let readyTimer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const markReady = () => {
      root.classList.remove("tl-anim-init");
      root.classList.add("tl-motion-ready");
      if (readyTimer) {
        clearTimeout(readyTimer);
        readyTimer = undefined;
      }
    };

    const cleanup = () => {
      html.style.scrollBehavior = prevScrollBehavior;
      if (readyTimer) clearTimeout(readyTimer);
      ctxRevert?.();
      nav?.classList.remove("is-scrolled");
      markReady();
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      markReady();
      return cleanup;
    }

    root.classList.add("tl-anim-init");
    readyTimer = setTimeout(markReady, 700);

    (async () => {
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (cancelled) return;

        gsap.registerPlugin(ScrollTrigger);

        const reveal = (selector: string, opts?: { y?: number; stagger?: number }) => {
          ScrollTrigger.batch(selector, {
            start: "top 86%",
            once: true,
            onEnter: (batch) => {
              gsap.from(batch, {
                y: opts?.y ?? 36,
                opacity: 0,
                duration: 0.75,
                stagger: opts?.stagger ?? 0.08,
                ease: "power3.out",
                overwrite: "auto",
              });
            },
          });
        };

        const ctx = gsap.context(() => {
          if (progressBar) {
            gsap.set(progressBar, { scaleX: 0, transformOrigin: "0% 50%" });
            ScrollTrigger.create({
              start: 0,
              end: "max",
              onUpdate: (self) => {
                gsap.to(progressBar, {
                  scaleX: self.progress,
                  duration: 0.15,
                  ease: "none",
                  overwrite: true,
                });
              },
            });
          }

          if (nav) {
            ScrollTrigger.create({
              start: "top -48",
              onEnter: () => nav.classList.add("is-scrolled"),
              onLeaveBack: () => nav.classList.remove("is-scrolled"),
            });
          }

          const heroTl = gsap.timeline({
            defaults: { ease: "power3.out" },
            onComplete: markReady,
          });

          heroTl
            .from(".tray-landing .tl-hero-top", { y: 18, opacity: 0, duration: 0.65 })
            .from(
              ".tray-landing .tl-h1 .tl-word",
              { y: 44, opacity: 0, stagger: 0.045, duration: 0.85 },
              "-=0.35",
            )
            .from(".tray-landing .tl-hero-lede", { y: 22, opacity: 0, duration: 0.75 }, "-=0.5")
            .from(".tray-landing .tl-hero-cta .tl-row", { y: 16, opacity: 0, duration: 0.6 }, "-=0.45")
            .from(".tray-landing .tl-note", { opacity: 0, duration: 0.45 }, "-=0.4")
            .from(
              ".tray-landing .tl-hero-stat",
              { y: 24, opacity: 0, stagger: 0.07, duration: 0.65 },
              "-=0.35",
            );

          root.querySelectorAll<HTMLElement>(".tl-hero-stat[data-count]").forEach((stat, i) => {
            const target = Number(stat.dataset.count);
            const numEl = stat.querySelector<HTMLElement>(".tl-stat-num");
            if (!numEl || !Number.isFinite(target)) return;
            const counter = { val: 0 };
            heroTl.to(
              counter,
              {
                val: target,
                duration: 1,
                ease: "power2.out",
                onUpdate: () => {
                  numEl.textContent = String(Math.round(counter.val));
                },
              },
              i === 0 ? "-=0.45" : "<0.1",
            );
          });

          const glow = root.querySelector(".tl-hero-glow");
          if (glow) {
            gsap.to(glow, {
              y: 100,
              ease: "none",
              scrollTrigger: {
                trigger: ".tray-landing .tl-hero",
                start: "top top",
                end: "bottom top",
                scrub: 1.2,
              },
            });
          }

          reveal(".tray-landing .tl-section-num", { y: 14, stagger: 0.06 });
          reveal(".tray-landing .tl-section-head h2", { y: 40 });
          reveal(".tray-landing .tl-section-head .tl-side, .tray-landing .tl-section-head .tl-lede", {
            y: 28,
            stagger: 0.1,
          });
          reveal(".tray-landing #sync h2, .tray-landing #sync .tl-lede", { y: 32, stagger: 0.12 });
          reveal(".tray-landing .tl-sync-meta .tl-row", { y: 20, stagger: 0.08 });
          reveal(".tray-landing .tl-portal", { y: 48, stagger: 0.12 });
          reveal(".tray-landing .tl-feat-tag", { y: 10, stagger: 0.04 });
          reveal(".tray-landing .tl-diagram .tl-node", { y: 20, stagger: 0.1 });
          reveal(".tray-landing .tl-diagram .tl-arr", { y: 0, stagger: 0.08 });
          reveal(".tray-landing .tl-pull p", { y: 36 });
          reveal(".tray-landing .tl-pull .tl-cite", { y: 16 });
          reveal(".tray-landing .tl-flow-step", { y: 32, stagger: 0.1 });
          reveal(".tray-landing .tl-stack-card", { y: 24, stagger: 0.05 });
          reveal(".tray-landing .tl-closing h2, .tray-landing .tl-closing p", { y: 32, stagger: 0.1 });
          reveal(".tray-landing .tl-closing .tl-btn", { y: 18, stagger: 0.06 });
          reveal(
            ".tray-landing .tl-line-leave-title, .tray-landing .tl-line-leave-lede, .tray-landing .tl-line-chip",
            { y: 24, stagger: 0.08 },
          );
          reveal(".tray-landing .tl-footer-row1 > *", { y: 18, stagger: 0.06 });
        }, root);

        ctxRevert = () => ctx.revert();

        if (document.fonts?.ready) {
          await document.fonts.ready;
        }
        if (!cancelled) {
          requestAnimationFrame(() => ScrollTrigger.refresh());
          setTimeout(() => ScrollTrigger.refresh(), 150);
        }
      } catch (err) {
        console.error("[LandingMotion] GSAP failed:", err);
        markReady();
      }
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return null;
}
