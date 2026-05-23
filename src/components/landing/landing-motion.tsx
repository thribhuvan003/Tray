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
            duration: 2.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 0.55,
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

      // ── 1. TrayHero: focus-pull word/character mask reveals ──
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

      // Monumental stagger with filter blur focus-pull
      gsap.from(".tray-landing .tl-h1 .tl-char-inner", {
        y: "120%",
        rotateX: 35,
        rotateY: 10,
        scale: 0.85,
        filter: "blur(14px)",
        opacity: 0,
        stagger: { amount: 0.85, from: "start" },
        duration: 1.6,
        ease: "power4.out",
        delay: 0.2,
      });

      gsap.from(".tray-landing .tl-h1 .tl-word", {
        letterSpacing: "-0.08em",
        wordSpacing: "-0.1em",
        duration: 1.6,
        ease: "power3.out",
        delay: 0.2,
      });


      gsap.from(".tray-landing .tl-nav-inner > *", {
        y: -30,
        opacity: 0,
        filter: "blur(5px)",
        stagger: 0.08,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.0,
      });

      // Parallax organic orbital movement for background blobs
      const blobA = document.querySelector("[data-blob-a]") as HTMLElement;
      const blobB = document.querySelector("[data-blob-b]") as HTMLElement;
      if (blobA) {
        gsap.to(blobA, {
          yPercent: -25,
          xPercent: 15,
          scrollTrigger: {
            trigger: ".tray-landing",
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
          }
        });
      }
      if (blobB) {
        gsap.to(blobB, {
          yPercent: 20,
          xPercent: -15,
          scrollTrigger: {
            trigger: ".tray-landing",
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
          }
        });
      }

      // ── 2. CampusTicker: Scroll-Velocity Skew Marquee ──
      ScrollTrigger.create({
        trigger: ".tray-landing .tl-ticker, [data-ticker-track]",
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          if (killed) return;
          const velocity = self.getVelocity();
          const skewAngle = gsap.utils.clamp(-12, 12, velocity * 0.0045);
          gsap.to(".tray-landing [data-ticker-track]", {
            skewX: skewAngle,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
          });
        },
      });

      // Serene ticker entrance
      gsap.from(".tray-landing [data-ticker-track]", {
        scrollTrigger: { trigger: ".tray-landing .tl-ticker, .tray-landing [data-ticker-track]", start: "top 100%" },
        scaleX: 0.9,
        skewX: 8,
        opacity: 0,
        stagger: 0.15,
        duration: 1.35,
        ease: "power4.out",
      });



      // ── 5. TrustSection: Bento Card Sweep Reveals & Snap-Rotate Icons ──
      const trustCards = root.querySelectorAll<HTMLElement>("#trust .grid > div");
      if (trustCards.length) {
        gsap.from(trustCards, {
          scrollTrigger: {
            trigger: "#trust",
            start: "top 80%",
          },
          clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)",
          y: 40,
          opacity: 0,
          stagger: 0.12,
          duration: 1.15,
          ease: "power4.out",
        });

        // Snap icon rotates
        const trustIcons = root.querySelectorAll<HTMLElement>("#trust svg");
        gsap.from(trustIcons, {
          scrollTrigger: {
            trigger: "#trust",
            start: "top 78%",
          },
          rotate: -90,
          scale: 0.3,
          stagger: 0.12,
          duration: 1.15,
          ease: "back.out(2)",
        });
      }

      // ── 6. CampusModelSection: Aperture Expansion & Row Deal ──
      // Left-side canteen gridcircular aperture expand
      const leftGrid = root.querySelector<HTMLElement>("#campus .grid");
      if (leftGrid) {
        gsap.fromTo(
          leftGrid,
          { clipPath: "circle(0% at 50% 50%)" },
          {
            clipPath: "circle(100% at 50% 50%)",
            duration: 1.45,
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: "#campus",
              start: "top 82%",
            },
          }
        );
      }

      // Right-side Role cards deck deal-in
      const roleCards = root.querySelectorAll<HTMLElement>("#campus .role-access-card");
      if (roleCards.length) {
        gsap.from(roleCards, {
          scrollTrigger: {
            trigger: "#campus",
            start: "top 78%",
          },
          x: 100,
          rotate: -8,
          opacity: 0,
          stagger: 0.12,
          duration: 1.1,
          ease: "back.out(1.4)",
        });
      }

      // ── 7. Real-Time Sync: SVG Path-Draw & Node Pulse ──
      const syncCards = root.querySelectorAll<HTMLElement>("#sync .grid > div");
      if (syncCards.length) {
        gsap.from(syncCards, {
          scrollTrigger: {
            trigger: "#sync",
            start: "top 82%",
          },
          scale: 0.85,
          y: 50,
          opacity: 0,
          stagger: 0.12,
          duration: 1.25,
          ease: "elastic.out(1, 0.75)",
        });
      }

      // ── 8. Kitchen Quote: Editorial Focus-Pull Mask Reveal ──
      const quote = root.querySelector<HTMLElement>(".tray-landing blockquote");
      if (quote) {
        gsap.from(quote, {
          scrollTrigger: {
            trigger: quote,
            start: "top 88%",
          },
          y: 50,
          filter: "blur(12px)",
          opacity: 0,
          scale: 0.95,
          duration: 1.45,
          ease: "power4.out",
        });
      }

      // ── 9. Phone to Plate Section: Y-Axis Book-Flip & Spin Numerals ──
      const flowCards = root.querySelectorAll<HTMLElement>("#flow .grid > div");
      if (flowCards.length) {
        gsap.from(flowCards, {
          scrollTrigger: {
            trigger: "#flow",
            start: "top 80%",
          },
          rotateY: -45,
          x: 60,
          opacity: 0,
          stagger: 0.1,
          duration: 1.35,
          ease: "power4.out",
          transformPerspective: 1200,
        });

        // Numeric elastic spins
        const flowNums = root.querySelectorAll<HTMLElement>("#flow .grid > div > span");
        gsap.from(flowNums, {
          scrollTrigger: {
            trigger: "#flow",
            start: "top 82%",
          },
          rotateY: 360,
          scale: 0.4,
          opacity: 0,
          stagger: 0.1,
          duration: 1.25,
          ease: "back.out(2.2)",
        });
      }

      // ── 10. Boring Tech Stack Section: Elastic Pop-ins & Mouse Tilt ──
      const techCards = root.querySelectorAll<HTMLElement>("#stack .grid > div");
      if (techCards.length) {
        gsap.from(techCards, {
          scrollTrigger: {
            trigger: "#stack",
            start: "top 82%",
          },
          scale: 0.65,
          y: 40,
          opacity: 0,
          stagger: 0.08,
          duration: 1.15,
          ease: "back.out(1.8)",
        });

        // Add smooth 3D tilt tracking for stack cards on hover
        techCards.forEach((card) => {
          const onMove = (e: MouseEvent) => {
            const r = card.getBoundingClientRect();
            const nx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
            const ny = ((e.clientY - r.top)  / r.height - 0.5) * 2;
            gsap.to(card, {
              rotateY: nx * 12,
              rotateX: -ny * 10,
              scale: 1.04,
              transformPerspective: 1000,
              duration: 0.35,
              ease: "power2.out",
            });
          };
          const onLeave = () => {
            gsap.to(card, {
              rotateX: 0,
              rotateY: 0,
              scale: 1,
              duration: 0.55,
              ease: "power3.out",
            });
          };
          card.addEventListener("mousemove", onMove);
          card.addEventListener("mouseleave", onLeave);
        });
      }

      // ── 11. Closing CTA Section: Monumental Compression ──
      const closingHeading = root.querySelector<HTMLElement>("#closing h2");
      if (closingHeading) {
        gsap.from(closingHeading, {
          scrollTrigger: {
            trigger: "#closing",
            start: "top 85%",
          },
          letterSpacing: "0.22em",
          scale: 0.9,
          filter: "blur(8px)",
          opacity: 0,
          duration: 1.35,
          ease: "power4.out",
        });
      }

      const closingCTA = root.querySelectorAll<HTMLElement>("#closing a, #closing p");
      if (closingCTA.length) {
        gsap.from(closingCTA, {
          scrollTrigger: {
            trigger: "#closing",
            start: "top 82%",
          },
          y: 35,
          opacity: 0,
          stagger: 0.1,
          duration: 0.95,
          ease: "back.out(1.6)",
        });
      }

      // ── 12. Footer Section: TRAY Parallax Stagger & Link Wave ──
      const footerMark = root.querySelector<HTMLElement>(".tl-footer-mark span");
      if (footerMark) {
        const text = footerMark.textContent ?? "";
        footerMark.textContent = "";
        
        const letters = [...text].map((char) => {
          const span = document.createElement("span");
          span.style.display = "inline-block";
          span.textContent = char;
          footerMark.appendChild(span);
          return span;
        });

        // Scrub parallax different letters at different speeds
        letters.forEach((span, i) => {
          const speeds = [-140, -100, -70, -40];
          gsap.to(span, {
            scrollTrigger: {
              trigger: ".tl-footer",
              scrub: 1.6,
              start: "top bottom",
              end: "bottom top",
            },
            y: speeds[i % speeds.length],
            ease: "none",
          });
        });
      }

      // Link waves
      const footerLinks = root.querySelectorAll<HTMLElement>(".tl-footer li, .tl-footer p, .tl-footer h4, .tl-footer-contact, .tl-footer a.group");
      if (footerLinks.length) {
        gsap.from(footerLinks, {
          scrollTrigger: {
            trigger: ".tl-footer",
            start: "top 95%",
          },
          y: 20,
          opacity: 0,
          stagger: 0.04,
          duration: 0.85,
          ease: "power3.out",
        });
      }

      // ── Magnetic Large Buttons (tactile interactive feel) ──
      root.querySelectorAll<HTMLElement>(".tl-btn-pri.tl-btn-lg, .tl-btn-ghost.tl-btn-lg, [data-magnetic], .tl-btn").forEach((btn) => {
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
      roleCardHandlers.forEach(([el, fn]) => {
        el.removeEventListener("click", fn as EventListener);
      });
      if (lenisInstance) lenisInstance.destroy();
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      });
    };
  }, []);

  return null;
}
