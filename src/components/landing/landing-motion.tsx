"use client";

import { useEffect } from "react";
import { triggerDemoEntry } from "@/components/landing/demo-entry-transition";

export function LandingMotion() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      document.querySelectorAll(".tray-landing [data-reveal]").forEach((el) => {
        el.classList.add("tl-visible");
      });
      return;
    }

    let killed = false;
    type LenisLike = { on(e: string, cb: () => void): void; raf(t: number): void; destroy(): void };
    let lenisInstance: LenisLike | null = null;
    let rafCursorId = 0;

    // ── Cursor ──────────────────────────────────────────────────────────────
    const cursorRing = document.querySelector<HTMLElement>(".tl-cursor-ring");
    const cursorDot  = document.querySelector<HTMLElement>(".tl-cursor-dot");
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (cursorDot) {
        cursorDot.style.transform = `translate(${mouseX}px,${mouseY}px) translate(-50%,-50%)`;
      }
    };

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.1;
      ringY += (mouseY - ringY) * 0.1;
      if (cursorRing) {
        cursorRing.style.transform = `translate(${ringX}px,${ringY}px) translate(-50%,-50%)`;
      }
      rafCursorId = requestAnimationFrame(animateRing);
    };

    document.addEventListener("mousemove", onMouseMove);
    animateRing();

    const onEnterHover = () => cursorRing?.classList.add("is-hovered");
    const onLeaveHover = () => cursorRing?.classList.remove("is-hovered");
    const hoverTargets = document.querySelectorAll(
      ".tray-landing a, .tray-landing button, .tray-landing .tl-portal, .tray-landing .tl-line-chip"
    );
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", onEnterHover);
      el.addEventListener("mouseleave", onLeaveHover);
    });

    // ── Async animation bootstrap ────────────────────────────────────────────
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (killed) return;
      gsap.registerPlugin(ScrollTrigger);

      // Lenis smooth scroll
      try {
        const LenisModule = await import("lenis");
        if (!killed) {
          const Lenis = ((LenisModule as Record<string, unknown>).default ?? LenisModule) as new (opts: Record<string, unknown>) => LenisLike;
          lenisInstance = new Lenis({
            duration: 1.4,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 0.85,
          });
          lenisInstance.on("scroll", ScrollTrigger.update);
          const li = lenisInstance;
          gsap.ticker.add((time: number) => { li.raf(time * 1000); });
          gsap.ticker.lagSmoothing(0);
        }
      } catch {
        /* Lenis unavailable — continue with native scroll */
      }

      // Scroll progress bar
      const bar = document.querySelector<HTMLElement>(".tl-progress-bar");
      if (bar) {
        gsap.to(bar, {
          width: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.2,
          },
        });
      }

      const root = document.querySelector<HTMLElement>(".tray-landing");
      if (!root) return;

      // ── Hero: split words → masked characters ─────────────────────────────
      root.querySelectorAll<HTMLElement>(".tl-h1 .tl-word").forEach((word) => {
        const text = word.textContent ?? "";
        word.textContent = "";
        [...text].forEach((ch) => {
          const mask  = document.createElement("span");
          mask.className = "tl-char";
          const inner = document.createElement("span");
          inner.className = "tl-char-inner";
          inner.textContent = ch === " " ? " " : ch;
          mask.appendChild(inner);
          word.appendChild(mask);
        });
      });

      gsap.from(".tray-landing .tl-h1 .tl-char-inner", {
        y: "115%",
        rotateZ: 5,
        opacity: 0,
        stagger: { amount: 0.55, from: "start" },
        duration: 1.1,
        ease: "power4.out",
        delay: 0.25,
      });

      // Hero support elements
      gsap.from(".tray-landing .tl-hero-top", {
        y: -22,
        opacity: 0,
        duration: 0.65,
        ease: "power3.out",
        delay: 0.1,
      });
      gsap.from(".tray-landing .tl-hero-lede", {
        y: 28,
        opacity: 0,
        duration: 1.0,
        ease: "power3.out",
        delay: 0.75,
      });
      gsap.from(".tray-landing .tl-hero-cta .tl-btn", {
        y: 22,
        opacity: 0,
        stagger: 0.1,
        duration: 0.75,
        ease: "power3.out",
        delay: 0.9,
      });
      gsap.from(".tray-landing .tl-hero-cta .tl-note", {
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        delay: 1.1,
      });
      gsap.from(".tray-landing .tl-hero-stat", {
        y: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 0.8,
        ease: "power3.out",
        delay: 1.05,
      });

      // Nav entrance
      gsap.from(".tray-landing .tl-nav-inner > *", {
        y: -24,
        opacity: 0,
        stagger: 0.07,
        duration: 0.6,
        ease: "power3.out",
        delay: 0.0,
      });

      // ── Scroll section reveals ────────────────────────────────────────────
      root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
          y: 44,
          opacity: 0,
          duration: 1.0,
          ease: "power3.out",
        });
      });

      // Section headings
      root.querySelectorAll<HTMLElement>(
        ".tl-section-head h2, .tl-pull p, .tl-closing h2, .tl-sync-grid h2"
      ).forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: "top 87%" },
          y: 36,
          opacity: 0,
          duration: 0.95,
          ease: "power3.out",
        });
      });

      // ── Portal cards: entrance + 3D mouse tilt ───────────────────────────
      root.querySelectorAll<HTMLElement>(".tl-portal").forEach((el, i) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: "top 92%" },
          y: 70,
          opacity: 0,
          rotateX: 10,
          duration: 1.1,
          delay: i * 0.12,
          ease: "power3.out",
        });

        const onMove = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const nx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
          const ny = ((e.clientY - r.top)  / r.height - 0.5) * 2;
          gsap.to(el, {
            rotateY: nx * 7,
            rotateX: -ny * 5,
            transformPerspective: 1200,
            duration: 0.5,
            ease: "power2.out",
          });
        };
        const onLeave = () => {
          gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.7, ease: "power3.out" });
        };
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
      });

      // ── Diagram nodes slide-in ────────────────────────────────────────────
      gsap.from(".tray-landing .tl-node", {
        scrollTrigger: { trigger: ".tray-landing .tl-diagram", start: "top 85%" },
        x: -40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.75,
        ease: "power3.out",
      });

      // ── Flow steps ────────────────────────────────────────────────────────
      gsap.from(".tray-landing .tl-flow-step", {
        scrollTrigger: { trigger: ".tray-landing .tl-flow", start: "top 85%" },
        y: 44,
        opacity: 0,
        stagger: 0.12,
        duration: 0.85,
        ease: "power3.out",
      });

      // ── Stack cards ───────────────────────────────────────────────────────
      gsap.from(".tray-landing .tl-stack-card", {
        scrollTrigger: { trigger: ".tray-landing .tl-stack", start: "top 88%" },
        y: 24,
        opacity: 0,
        scale: 0.94,
        stagger: 0.05,
        duration: 0.65,
        ease: "power3.out",
      });

      // ── Closing CTA buttons ───────────────────────────────────────────────
      gsap.from(".tray-landing .tl-closing .tl-cta-row .tl-btn", {
        scrollTrigger: { trigger: ".tray-landing .tl-closing", start: "top 80%" },
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.75,
        ease: "power3.out",
      });

      // ── Footer watermark parallax ─────────────────────────────────────────
      gsap.to(".tray-landing .tl-footer-mark", {
        scrollTrigger: {
          trigger: ".tray-landing .tl-footer",
          scrub: 1.8,
          start: "top bottom",
          end: "bottom top",
        },
        y: -100,
        ease: "none",
      });

      // ── Ticker speed ramp ─────────────────────────────────────────────────
      gsap.from(".tray-landing .tl-ticker", {
        scrollTrigger: { trigger: ".tray-landing .tl-ticker", start: "top 100%" },
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });

      // ── Magnetic large buttons ────────────────────────────────────────────
      root.querySelectorAll<HTMLElement>(".tl-btn-pri.tl-btn-lg, .tl-btn-ghost.tl-btn-lg").forEach((btn) => {
        const onMove = (e: MouseEvent) => {
          const r = btn.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width  / 2)) * 0.28;
          const dy = (e.clientY - (r.top  + r.height / 2)) * 0.28;
          gsap.to(btn, { x: dx, y: dy, duration: 0.45, ease: "power2.out" });
        };
        const onLeave = () => {
          gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
        };
        btn.addEventListener("mousemove", onMove);
        btn.addEventListener("mouseleave", onLeave);
      });

      // ── Sync section lede ─────────────────────────────────────────────────
      gsap.from(".tray-landing .tl-sync-meta .tl-row", {
        scrollTrigger: { trigger: ".tray-landing .tl-sync-meta", start: "top 90%" },
        x: -20,
        opacity: 0,
        stagger: 0.08,
        duration: 0.65,
        ease: "power3.out",
      });

    })();

    // ── Demo role card entry transitions ─────────────────────────────
    const ROLE_LABELS: Record<string, string> = {
      student: "Student portal",
      kitchen: "Kitchen view",
      admin: "Admin console",
    };
    const roleCardHandlers: Array<[HTMLElement, (e: MouseEvent) => void]> = [];
    document.querySelectorAll<HTMLAnchorElement>(".tl-role-card[data-r]").forEach((card) => {
      const r = card.dataset.r ?? "";
      const label = ROLE_LABELS[r];
      if (!label || !card.href || card.tagName !== "A") return;
      const href = card.href;
      const handler = (e: MouseEvent) => {
        e.preventDefault();
        triggerDemoEntry(href, label);
      };
      card.addEventListener("click", handler as EventListener);
      roleCardHandlers.push([card as HTMLElement, handler as (e: MouseEvent) => void]);
    });

    return () => {
      killed = true;
      document.removeEventListener("mousemove", onMouseMove);
      roleCardHandlers.forEach(([el, fn]) => {
        el.removeEventListener("click", fn as EventListener);
      });
      cancelAnimationFrame(rafCursorId);
      hoverTargets.forEach((el) => {
        el.removeEventListener("mouseenter", onEnterHover);
        el.removeEventListener("mouseleave", onLeaveHover);
      });
      if (lenisInstance) lenisInstance.destroy();
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      });
    };
  }, []);

  return null;
}
