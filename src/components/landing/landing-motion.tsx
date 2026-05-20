"use client";

import { useEffect } from "react";

/**
 * GSAP ScrollTrigger for the marketing landing only.
 * Motion tier: medium+ (tasteful bold) — council pick 2026-05-20.
 * Skips scrub/tilt on coarse pointer + narrow viewport; honors prefers-reduced-motion.
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
    const portalCleanups: Array<() => void> = [];
    const btnCleanups: Array<() => void> = [];

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
      portalCleanups.forEach((fn) => fn());
      btnCleanups.forEach((fn) => fn());
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

        const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
        const narrowViewport = window.matchMedia("(max-width: 768px)").matches;
        const lightMotion = coarsePointer || narrowViewport;
        const finePointer = !coarsePointer;

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

          const navLinks = root.querySelectorAll<HTMLAnchorElement>('.tl-nav-links a[href^="#"]');
          const sections = ["#system", "#flow"].map((id) => root.querySelector(id)).filter(Boolean);
          if (navLinks.length && sections.length) {
            sections.forEach((section) => {
              if (!section) return;
              ScrollTrigger.create({
                trigger: section,
                start: "top 55%",
                end: "bottom 45%",
                onToggle: (self) => {
                  const id = `#${(self.trigger as HTMLElement).id}`;
                  navLinks.forEach((link) => {
                    link.classList.toggle("is-active", link.getAttribute("href") === id && self.isActive);
                  });
                },
              });
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
              { y: 52, opacity: 0, stagger: 0.05, duration: 0.9 },
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

          if (!lightMotion) {
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

            root.querySelectorAll<HTMLElement>(".tl-orb").forEach((orb, i) => {
              gsap.to(orb, {
                y: i % 2 === 0 ? 120 : -90,
                x: i % 2 === 0 ? 40 : -30,
                ease: "none",
                scrollTrigger: {
                  trigger: root,
                  start: "top top",
                  end: "bottom bottom",
                  scrub: 1.4 + i * 0.2,
                },
              });
            });
          }

          const sectionEnter = (
            trigger: string,
            targets: string,
            vars: gsap.TweenVars,
            start = "top 82%",
          ) => {
            const els = gsap.utils.toArray<HTMLElement>(targets);
            if (!els.length) return;
            gsap.set(els, { ...vars, immediateRender: false });
            ScrollTrigger.create({
              trigger,
              start,
              once: true,
              onEnter: () => {
                gsap.to(els, {
                  ...vars,
                  opacity: 1,
                  x: 0,
                  y: 0,
                  scale: 1,
                  rotateX: 0,
                  rotateY: 0,
                  rotate: 0,
                  filter: "blur(0px)",
                  clipPath: "inset(0% 0% 0% 0%)",
                  duration: vars.duration ?? 0.85,
                  stagger: vars.stagger ?? 0.08,
                  ease: vars.ease ?? "power3.out",
                  overwrite: "auto",
                });
              },
            });
          };

          // 01 — System: editorial slide + portal deck fan-in
          sectionEnter(
            "#system",
            "#system .tl-section-num",
            { opacity: 0, y: 12, duration: 0.5 },
          );
          sectionEnter(
            "#system",
            "#system .tl-section-head h2",
            { opacity: 0, x: -48, rotateY: 8, duration: 0.9, ease: "power4.out" },
          );
          sectionEnter(
            "#system",
            "#system .tl-section-head .tl-side",
            { opacity: 0, x: 32, duration: 0.75 },
            "top 78%",
          );
          sectionEnter(
            "#system",
            "#system .tl-portal",
            {
              opacity: 0,
              y: 82,
              rotateX: 14,
              transformOrigin: "50% 100%",
              stagger: 0.16,
              duration: 1.05,
              ease: "power3.out",
            },
            "top 80%",
          );
          sectionEnter(
            "#system",
            "#system .tl-feat-tag",
            { opacity: 0, scale: 0.92, stagger: 0.04, duration: 0.45 },
            "top 75%",
          );

          // 02 — Sync: scale panel + alternating node lanes
          sectionEnter(
            ".tl-sync",
            ".tl-sync .tl-section-num, .tl-sync h2, .tl-sync .tl-lede",
            { opacity: 0, y: 28, stagger: 0.1, duration: 0.8 },
          );
          sectionEnter(
            ".tl-sync",
            ".tl-sync .tl-sync-meta .tl-row",
            { opacity: 0, x: -24, stagger: 0.09, duration: 0.65 },
            "top 78%",
          );
          const diagram = root.querySelector(".tl-diagram");
          if (diagram) {
            gsap.set(diagram, { scale: 0.94, opacity: 0 });
            ScrollTrigger.create({
              trigger: diagram,
              start: "top 85%",
              once: true,
              onEnter: () => {
                gsap.to(diagram, {
                  scale: 1,
                  opacity: 1,
                  duration: 0.9,
                  ease: "power2.out",
                });
              },
            });
          }
          root.querySelectorAll<HTMLElement>(".tl-diagram .tl-node").forEach((node, i) => {
            gsap.set(node, { opacity: 0, x: i % 2 === 0 ? -44 : 44 });
            ScrollTrigger.create({
              trigger: node,
              start: "top 90%",
              once: true,
              onEnter: () => {
                gsap.to(node, {
                  opacity: 1,
                  x: 0,
                  duration: 0.7,
                  ease: "back.out(1.55)",
                });
              },
            });
          });
          root.querySelectorAll<HTMLElement>(".tl-diagram .tl-arr").forEach((arr) => {
            gsap.set(arr, { opacity: 0, scaleX: 0.6, transformOrigin: "50% 50%" });
            ScrollTrigger.create({
              trigger: arr,
              start: "top 92%",
              once: true,
              onEnter: () => {
                gsap.to(arr, { opacity: 1, scaleX: 1, duration: 0.5, ease: "power2.out" });
              },
            });
          });

          // 02b — Line leave: spring chips
          sectionEnter(
            "#where",
            "#where .tl-line-leave-title, #where .tl-line-leave-lede",
            { opacity: 0, y: 32, stagger: 0.12, duration: 0.75 },
          );
          sectionEnter(
            "#where",
            "#where .tl-line-chip",
            {
              opacity: 0,
              scale: 0.85,
              y: 20,
              stagger: 0.09,
              duration: 0.6,
              ease: "back.out(1.75)",
            },
            "top 80%",
          );

          // Pull quote: soft zoom + blur dissolve
          const pullP = root.querySelector(".tl-pull p");
          if (pullP) {
            gsap.set(pullP, { opacity: 0, scale: 1.08, filter: "blur(10px)" });
            ScrollTrigger.create({
              trigger: pullP,
              start: "top 80%",
              once: true,
              onEnter: () => {
                gsap.to(pullP, {
                  opacity: 1,
                  scale: 1,
                  filter: "blur(0px)",
                  duration: 1.1,
                  ease: "power2.out",
                });
              },
            });
          }
          sectionEnter(".tl-pull", ".tl-pull .tl-cite", { opacity: 0, y: 14, duration: 0.5 }, "top 72%");

          // 03 — Flow: stepped rise + number spin
          sectionEnter(
            "#flow",
            "#flow .tl-section-num, #flow .tl-section-head h2, #flow .tl-section-head .tl-side",
            { opacity: 0, y: 24, stagger: 0.1, duration: 0.75 },
          );
          root.querySelectorAll<HTMLElement>(".tl-flow-step").forEach((step, i) => {
            gsap.set(step, { opacity: 0, y: 40 + i * 4 });
            const num = step.querySelector(".tl-num");
            if (num) gsap.set(num, { rotate: -12, transformOrigin: "50% 100%" });
            ScrollTrigger.create({
              trigger: step,
              start: "top 88%",
              once: true,
              onEnter: () => {
                gsap.to(step, { opacity: 1, y: 0, duration: 0.75, ease: "power3.out", delay: i * 0.05 });
                if (num) {
                  gsap.to(num, { rotate: 0, duration: 0.95, ease: "back.out(2)" });
                }
              },
            });
          });

          // 04 — Stack: radial pop
          sectionEnter(
            "#stack",
            "#stack .tl-section-num, #stack .tl-section-head h2, #stack .tl-section-head .tl-side",
            { opacity: 0, y: 20, stagger: 0.08, duration: 0.7 },
          );
          sectionEnter(
            "#stack",
            "#stack .tl-stack-card",
            {
              opacity: 0,
              scale: 0.82,
              y: 24,
              stagger: { amount: 0.38, from: "center" },
              duration: 0.7,
              ease: "back.out(1.45)",
            },
            "top 82%",
          );

          // Closing: lift + CTA cascade
          const closing = root.querySelector(".tl-closing");
          if (closing) {
            gsap.set(closing.querySelector("h2"), { opacity: 0, y: 48, scale: 0.96 });
            gsap.set(closing.querySelector("p"), { opacity: 0, y: 24 });
            ScrollTrigger.create({
              trigger: closing,
              start: "top 78%",
              once: true,
              onEnter: () => {
                const tl = gsap.timeline();
                tl.to(closing.querySelector("h2"), {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: 1,
                  ease: "power3.out",
                }).to(
                  closing.querySelector("p"),
                  { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
                  "-=0.55",
                );
                tl.from(
                  closing.querySelectorAll(".tl-btn"),
                  { opacity: 0, y: 18, stagger: 0.07, duration: 0.55, ease: "power2.out" },
                  "-=0.35",
                );
              },
            });
          }

          sectionEnter(
            ".tl-footer",
            ".tl-footer-row1 > *",
            { opacity: 0, y: 18, stagger: 0.06, duration: 0.6 },
            "top 90%",
          );

          // Portal preview tilt (fine pointer only; CSS hover lift unchanged)
          if (finePointer) {
          root.querySelectorAll<HTMLElement>(".tl-portal").forEach((portal) => {
            const chrome = portal.querySelector<HTMLElement>(".tl-browser-chrome");
            if (!chrome) return;

            const onMove = (e: MouseEvent) => {
              const rect = portal.getBoundingClientRect();
              const px = (e.clientX - rect.left) / rect.width - 0.5;
              const py = (e.clientY - rect.top) / rect.height - 0.5;
              gsap.to(chrome, {
                rotateY: px * 9,
                rotateX: -py * 6,
                duration: 0.35,
                ease: "power2.out",
                overwrite: "auto",
              });
            };
            const onLeave = () => {
              gsap.to(chrome, {
                rotateY: 0,
                rotateX: 0,
                duration: 0.55,
                ease: "power3.out",
              });
            };
            portal.addEventListener("mousemove", onMove);
            portal.addEventListener("mouseleave", onLeave);
            portalCleanups.push(() => {
              portal.removeEventListener("mousemove", onMove);
              portal.removeEventListener("mouseleave", onLeave);
            });
          });
          }

          // Button micro-interaction (fine pointer; CSS still handles colors)
          if (finePointer) {
          root.querySelectorAll<HTMLElement>(".tl-btn").forEach((btn) => {
            const onEnter = () => gsap.to(btn, { scale: 1.03, duration: 0.2, ease: "power2.out" });
            const onLeave = () => gsap.to(btn, { scale: 1, duration: 0.25, ease: "power2.out" });
            const onDown = () => gsap.to(btn, { scale: 0.97, duration: 0.08 });
            const onUp = () => gsap.to(btn, { scale: 1.03, duration: 0.15 });
            btn.addEventListener("mouseenter", onEnter);
            btn.addEventListener("mouseleave", onLeave);
            btn.addEventListener("mousedown", onDown);
            btn.addEventListener("mouseup", onUp);
            btnCleanups.push(() => {
              btn.removeEventListener("mouseenter", onEnter);
              btn.removeEventListener("mouseleave", onLeave);
              btn.removeEventListener("mousedown", onDown);
              btn.removeEventListener("mouseup", onUp);
            });
          });
          }
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
