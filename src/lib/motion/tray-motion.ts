"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

export function registerTrayGsap() {
  if (typeof window === "undefined" || registered) return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function splitWords(element: HTMLElement) {
  if (!element || element.dataset.splitReady === "true") return;

  const text = element.textContent?.trim() ?? "";
  element.textContent = "";

  text.split(/\s+/).forEach((word, index, words) => {
    const outer = document.createElement("span");
    outer.className = "split-word";

    const inner = document.createElement("span");
    inner.textContent = index === words.length - 1 ? word : `${word} `;

    outer.appendChild(inner);
    element.appendChild(outer);
  });

  element.dataset.splitReady = "true";
}

export function splitWordReveal(
  target: HTMLElement | string,
  options?: {
    delay?: number;
    stagger?: number;
    duration?: number;
    yPercent?: number;
  }
) {
  const element =
    typeof target === "string"
      ? (document.querySelector(target) as HTMLElement | null)
      : target;

  if (!element) return null;

  splitWords(element);

  const words = element.querySelectorAll(".split-word > span");

  return gsap.fromTo(
    words,
    {
      yPercent: options?.yPercent ?? 110,
      rotate: 2,
      opacity: 0,
    },
    {
      yPercent: 0,
      rotate: 0,
      opacity: 1,
      duration: options?.duration ?? 1.05,
      delay: options?.delay ?? 0,
      stagger: options?.stagger ?? 0.035,
      ease: "power4.out",
    }
  );
}

export function fadeUp(
  targets: gsap.TweenTarget,
  options?: {
    y?: number;
    delay?: number;
    stagger?: number;
    duration?: number;
    scrollTrigger?: ScrollTrigger.Vars;
  }
) {
  return gsap.fromTo(
    targets,
    { y: options?.y ?? 28, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      delay: options?.delay ?? 0,
      duration: options?.duration ?? 0.8,
      stagger: options?.stagger ?? 0.08,
      ease: "power3.out",
      scrollTrigger: options?.scrollTrigger,
    }
  );
}

export function clipReveal(
  targets: gsap.TweenTarget,
  options?: {
    y?: number;
    stagger?: number;
    duration?: number;
    scrollTrigger?: ScrollTrigger.Vars;
  }
) {
  return gsap.fromTo(
    targets,
    {
      y: options?.y ?? 64,
      opacity: 0,
      clipPath: "inset(0 0 100% 0)",
    },
    {
      y: 0,
      opacity: 1,
      clipPath: "inset(0 0 0% 0)",
      duration: options?.duration ?? 0.95,
      stagger: options?.stagger ?? 0.08,
      ease: "power3.out",
      scrollTrigger: options?.scrollTrigger,
    }
  );
}

export function numberCounter(
  target: HTMLElement,
  endValue: number,
  options?: {
    suffix?: string;
    duration?: number;
    scrollTrigger?: ScrollTrigger.Vars;
  }
) {
  const obj = { value: 0 };

  return gsap.to(obj, {
    value: endValue,
    duration: options?.duration ?? 1.2,
    ease: "power3.out",
    scrollTrigger: options?.scrollTrigger,
    onUpdate: () => {
      target.textContent = `${Math.round(obj.value)}${options?.suffix ?? ""}`;
    },
  });
}

export function tickerLoop(track: HTMLElement, speed = 45) {
  const distance = track.scrollWidth / 2;

  return gsap.to(track, {
    x: -distance,
    duration: speed,
    ease: "none",
    repeat: -1,
    modifiers: {
      x: gsap.utils.unitize((x) => parseFloat(x) % distance),
    },
  });
}

export function scrambleText(
  element: HTMLElement,
  finalText: string,
  options?: {
    duration?: number;
    characters?: string;
  }
) {
  const chars = options?.characters ?? "0123456789";
  const duration = options?.duration ?? 0.8;
  const obj = { progress: 0 };

  return gsap.to(obj, {
    progress: 1,
    duration,
    ease: "power3.out",
    onUpdate: () => {
      const revealed = Math.floor(obj.progress * finalText.length);
      element.textContent = finalText
        .split("")
        .map((char, index) => {
          if (char === " ") return " ";
          if (index < revealed) return char;
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");
    },
    onComplete: () => {
      element.textContent = finalText;
    },
  });
}

export function drawSvgPath(path: SVGPathElement, options?: ScrollTrigger.Vars) {
  const length = path.getTotalLength();

  gsap.set(path, {
    strokeDasharray: length,
    strokeDashoffset: length,
  });

  return gsap.to(path, {
    strokeDashoffset: 0,
    duration: 1.2,
    ease: "power3.out",
    scrollTrigger: options,
  });
}

export function magneticButton(button: HTMLElement) {
  if (prefersReducedMotion()) return () => {};

  const onMove = (event: MouseEvent) => {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    gsap.to(button, {
      x: x * 0.18,
      y: y * 0.18,
      duration: 0.35,
      ease: "power3.out",
    });
  };

  const onLeave = () => {
    gsap.to(button, {
      x: 0,
      y: 0,
      duration: 0.45,
      ease: "elastic.out(1, 0.35)",
    });
  };

  button.addEventListener("mousemove", onMove);
  button.addEventListener("mouseleave", onLeave);

  return () => {
    button.removeEventListener("mousemove", onMove);
    button.removeEventListener("mouseleave", onLeave);
  };
}
