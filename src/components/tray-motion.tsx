"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type PointDetail = {
  x?: number;
  y?: number;
  label?: string;
};

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function TrayMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (reducedMotion()) return;

    const cleanups: Array<() => void> = [];
    const root = document.documentElement;
    root.classList.add("motion-ready");

    const nav = document.getElementById("topnav");
    const syncNav = () => nav?.classList.toggle("scrolled", window.scrollY > 8);
    syncNav();
    window.addEventListener("scroll", syncNav, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", syncNav));

    const hero = document.querySelector<HTMLElement>(".landing .hero");
    if (hero) {
      const onHeroMove = (event: PointerEvent) => {
        const rect = hero.getBoundingClientRect();
        hero.style.setProperty("--tray-mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
        hero.style.setProperty("--tray-my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
      };
      hero.addEventListener("pointermove", onHeroMove);
      cleanups.push(() => hero.removeEventListener("pointermove", onHeroMove));
    }

    const reveals = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );

      reveals.forEach((element, index) => {
        element.style.transitionDelay = `${Math.min(index * 70, 420)}ms`;
        element.classList.remove("in");
        observer.observe(element);
      });
      cleanups.push(() => observer.disconnect());
    } else {
      reveals.forEach((element) => element.classList.add("in"));
    }

    const tiles = Array.from(document.querySelectorAll<HTMLElement>(".portal-tile"));
    const tileHandlers = new Map<HTMLElement, (event: PointerEvent) => void>();
    tiles.forEach((tile) => {
      const handler = (event: PointerEvent) => {
        const rect = tile.getBoundingClientRect();
        tile.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        tile.style.setProperty("--my", `${event.clientY - rect.top}px`);
      };
      tileHandlers.set(tile, handler);
      tile.addEventListener("pointermove", handler);
    });
    cleanups.push(() => {
      tileHandlers.forEach((handler, tile) => tile.removeEventListener("pointermove", handler));
    });

    const makeCartFly = (event: Event) => {
      const detail = (event as CustomEvent<PointDetail>).detail ?? {};
      const target = document.querySelector<HTMLElement>(".cart-btn") ?? document.querySelector<HTMLElement>(".drawer");
      if (!target || detail.x == null || detail.y == null) return;

      const targetRect = target.getBoundingClientRect();
      const fly = document.createElement("div");
      fly.className = "cart-fly";
      fly.textContent = detail.label?.slice(0, 1).toUpperCase() || "+";
      fly.style.left = `${detail.x}px`;
      fly.style.top = `${detail.y}px`;
      document.body.appendChild(fly);

      const dx = targetRect.left + targetRect.width / 2 - detail.x;
      const dy = targetRect.top + targetRect.height / 2 - detail.y;
      requestAnimationFrame(() => {
        fly.style.setProperty("--tx", `${dx}px`);
        fly.style.setProperty("--ty", `${dy}px`);
        fly.classList.add("run");
      });
      window.setTimeout(() => fly.remove(), 760);
    };

    const makeBurst = (event: Event) => {
      const detail = (event as CustomEvent<PointDetail>).detail ?? {};
      const originX = detail.x ?? window.innerWidth / 2;
      const originY = detail.y ?? window.innerHeight * 0.42;
      const colors = ["var(--accent)", "var(--gold)", "var(--ok)", "var(--rose)"];

      for (let index = 0; index < 28; index += 1) {
        const piece = document.createElement("span");
        const angle = Math.random() * Math.PI * 2;
        const dist = 80 + Math.random() * 240;
        piece.className = "tray-confetti";
        piece.style.left = `${originX}px`;
        piece.style.top = `${originY}px`;
        piece.style.setProperty("--tx", `${Math.cos(angle) * dist}px`);
        piece.style.setProperty("--ty", `${Math.sin(angle) * dist}px`);
        piece.style.setProperty("--rot", `${Math.round(Math.random() * 720)}deg`);
        piece.style.setProperty("--c", colors[index % colors.length]);
        document.body.appendChild(piece);
        window.setTimeout(() => piece.remove(), 1200);
      }
    };

    const makeRipple = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>(
        ".btn, .btn-icon, .add-btn, .cat, .diet-tab, .ktab, .sidebar-link, .switch"
      );
      if (!target || target.closest(".theme-toggle")) return;
      const rect = target.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height) * 1.4;
      ripple.className = "motion-ripple";
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
      target.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 700);
    };

    window.addEventListener("tray:cart-fly", makeCartFly as EventListener);
    window.addEventListener("tray:burst", makeBurst as EventListener);
    document.addEventListener("pointerdown", makeRipple);
    cleanups.push(() => {
      window.removeEventListener("tray:cart-fly", makeCartFly as EventListener);
      window.removeEventListener("tray:burst", makeBurst as EventListener);
      document.removeEventListener("pointerdown", makeRipple);
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [pathname]);

  return null;
}
