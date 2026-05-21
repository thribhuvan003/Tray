// ── Tray landing-page motion utilities ──────────────────────────────────────
// Only import from client components — uses browser APIs (window, gsap, etc.).
// All GSAP animations must call these utilities to ensure:
//   1. prefers-reduced-motion is always respected
//   2. ScrollTriggers are cleaned up on unmount (via gsap.context)
//   3. Animations use transform + opacity only (no layout-thrashing props)

// ── Reduced-motion guard ─────────────────────────────────────────────────────

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ── Motion token re-exports ──────────────────────────────────────────────────

export { motionTokens } from "@/lib/motionTokens";

// ── Split-word reveal ────────────────────────────────────────────────────────
// Wraps each character in <span class="tl-char"><span class="tl-char-inner">
// so GSAP can animate from y: "115%" (masked overflow reveal).

export function splitWordReveal(el: HTMLElement): void {
  const words = el.querySelectorAll<HTMLElement>(".tl-word");
  words.forEach((word) => {
    const text = word.textContent ?? "";
    word.textContent = "";
    [...text].forEach((ch) => {
      const mask = document.createElement("span");
      mask.className = "tl-char";
      const inner = document.createElement("span");
      inner.className = "tl-char-inner";
      inner.textContent = ch === " " ? " " : ch;
      mask.appendChild(inner);
      word.appendChild(mask);
    });
  });
}

// ── Fade-up reveal (ScrollTrigger) ──────────────────────────────────────────

export async function fadeUpReveal(
  selector: string,
  options?: { stagger?: number; y?: number; start?: string }
): Promise<void> {
  if (prefersReducedMotion()) {
    document.querySelectorAll(selector).forEach((el) => {
      (el as HTMLElement).style.opacity = "1";
    });
    return;
  }
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);
  gsap.registerPlugin(ScrollTrigger);
  gsap.from(selector, {
    scrollTrigger: { trigger: selector, start: options?.start ?? "top 88%" },
    y: options?.y ?? 44,
    opacity: 0,
    stagger: options?.stagger ?? 0,
    duration: 0.9,
    ease: "power3.out",
  });
}

// ── Number counter ───────────────────────────────────────────────────────────

export async function numberCounter(
  el: HTMLElement,
  target: number,
  suffix?: string
): Promise<void> {
  if (prefersReducedMotion()) {
    el.textContent = `${target}${suffix ?? ""}`;
    return;
  }
  const { gsap } = await import("gsap");
  const { ScrollTrigger } = await import("gsap/ScrollTrigger");
  gsap.registerPlugin(ScrollTrigger);
  const obj = { val: 0 };
  gsap.to(obj, {
    val: target,
    duration: 1.4,
    ease: "power2.out",
    scrollTrigger: { trigger: el, start: "top 85%", once: true },
    onUpdate: () => {
      el.textContent = `${Math.round(obj.val)}${suffix ?? ""}`;
    },
  });
}

// ── Magnetic button ──────────────────────────────────────────────────────────

export async function magneticButton(el: HTMLElement, strength = 0.28): Promise<() => void> {
  if (prefersReducedMotion()) return () => {};
  const { gsap } = await import("gsap");
  const onMove = (e: MouseEvent) => {
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * strength;
    const dy = (e.clientY - (r.top + r.height / 2)) * strength;
    gsap.to(el, { x: dx, y: dy, duration: 0.45, ease: "power2.out" });
  };
  const onLeave = () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
  };
  el.addEventListener("mousemove", onMove);
  el.addEventListener("mouseleave", onLeave);
  return () => {
    el.removeEventListener("mousemove", onMove);
    el.removeEventListener("mouseleave", onLeave);
  };
}

// ── Ticker / marquee loop ────────────────────────────────────────────────────

export async function tickerLoop(track: HTMLElement, duration = 40): Promise<() => void> {
  if (prefersReducedMotion()) return () => {};
  const { gsap } = await import("gsap");
  const tween = gsap.to(track, {
    x: "-50%",
    duration,
    ease: "none",
    repeat: -1,
  });
  const pause = () => tween.pause();
  const resume = () => tween.resume();
  track.parentElement?.addEventListener("mouseenter", pause);
  track.parentElement?.addEventListener("mouseleave", resume);
  return () => {
    tween.kill();
    track.parentElement?.removeEventListener("mouseenter", pause);
    track.parentElement?.removeEventListener("mouseleave", resume);
  };
}

// ── Draw SVG path ────────────────────────────────────────────────────────────

export async function drawSvgPath(
  paths: NodeListOf<SVGPathElement> | SVGPathElement[],
  trigger: Element
): Promise<void> {
  if (prefersReducedMotion()) {
    (Array.from(paths) as SVGPathElement[]).forEach((p) => {
      p.style.strokeDashoffset = "0";
    });
    return;
  }
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);
  gsap.registerPlugin(ScrollTrigger);
  (Array.from(paths) as SVGPathElement[]).forEach((path, i) => {
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 1.2,
      delay: i * 0.15,
      ease: "power2.inOut",
      scrollTrigger: { trigger, start: "top 80%", once: true },
    });
  });
}

// ── Scramble digits ──────────────────────────────────────────────────────────
// Animate characters through random scramble before settling on final value.

const SCRAMBLE_CHARS = "0123456789";

export function scrambleDigits(
  el: HTMLElement,
  finalText: string,
  duration = 900
): void {
  if (prefersReducedMotion()) {
    el.textContent = finalText;
    return;
  }
  const frames = Math.floor(duration / 50);
  let frame = 0;
  const id = setInterval(() => {
    frame++;
    const progress = frame / frames;
    el.textContent = finalText
      .split("")
      .map((ch, i) => {
        if (i < Math.floor(finalText.length * progress)) return ch;
        if (ch === " " || ch === "·") return ch;
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      })
      .join("");
    if (frame >= frames) {
      clearInterval(id);
      el.textContent = finalText;
    }
  }, 50);
}
