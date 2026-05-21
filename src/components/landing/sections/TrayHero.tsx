"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  fadeUp,
  magneticButton,
  prefersReducedMotion,
  registerTrayGsap,
  splitWordReveal,
} from "@/lib/motion/tray-motion";

export function TrayHero() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerTrayGsap();
      if (prefersReducedMotion()) return;

      const title = rootRef.current?.querySelector("[data-hero-title]") as HTMLElement;
      const buttons = rootRef.current?.querySelectorAll("[data-magnetic]") ?? [];

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.add(() => splitWordReveal(title, { stagger: 0.045, duration: 1.05 }))
        .add(fadeUp("[data-hero-copy]", { y: 24, duration: 0.75 }), "-=0.55")
        .add(fadeUp("[data-hero-visual]", { y: 38, stagger: 0.09, duration: 0.85 }), "-=0.45");

      const cleanups = Array.from(buttons).map((button) =>
        magneticButton(button as HTMLElement)
      );

      return () => cleanups.forEach((cleanup) => cleanup());
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="relative isolate overflow-hidden px-5 pb-12 pt-24 sm:px-8 lg:px-10 lg:pb-20 lg:pt-32"
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-10rem] top-20 h-80 w-80 rounded-full bg-[var(--tray-clay)]/20 blur-3xl" />
        <div className="absolute right-[-8rem] top-24 h-96 w-96 rounded-full bg-[var(--tray-green)]/15 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div>
          <p className="font-code mb-5 text-xs uppercase tracking-[0.28em] text-[var(--tray-muted)]">
            Campus Edition · multi-canteen · live queue
          </p>

          <h1
            data-hero-title
            className="font-editorial max-w-5xl text-[clamp(4.2rem,11vw,11rem)] font-black leading-[0.82] tracking-[-0.075em]"
          >
            Campus food, without the queue.
          </h1>

          <p
            data-hero-copy
            className="mt-7 max-w-2xl text-lg leading-8 opacity-70 sm:text-xl"
          >
            Students order from any canteen in their campus. Kitchens run live
            queues. Admins see orders, revenue, and handovers in real time.
          </p>

          <div data-hero-copy className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              data-magnetic
              href="#try-demo"
              className="inline-flex items-center justify-center rounded-full bg-[var(--tray-ink)] px-7 py-4 text-sm font-semibold text-[var(--tray-cream,#F0E6D2)] transition hover:scale-[1.02] hover:opacity-90"
            >
              Try the full demo →
            </a>

            <Link
              data-magnetic
              href="/get-started"
              className="inline-flex items-center justify-center rounded-full border border-[var(--tray-border)] px-7 py-4 text-sm font-semibold transition hover:bg-white/40"
            >
              Set up my campus — free
            </Link>
          </div>
        </div>

        {/* Layered product cards */}
        <div className="grid gap-4">
          <HeroMockCard
            label="Student"
            title="Paneer roll · paid"
            meta="OTP 4821 · ready in 06:30"
          />
          <HeroMockCard
            label="Kitchen"
            title="New queue"
            meta="12 active · 4 ready · 3 min avg"
          />
          <HeroMockCard
            label="Admin"
            title="Lunch revenue"
            meta="₹18,420 today · +12% vs last week"
          />
        </div>
      </div>
    </section>
  );
}

function HeroMockCard({ label, title, meta }: { label: string; title: string; meta: string }) {
  return (
    <div
      data-hero-visual
      className="motion-card rounded-[2rem] border border-[var(--tray-border)] bg-white/55 p-5 shadow-[0_24px_80px_rgba(17,17,17,0.08)] backdrop-blur"
    >
      <div className="font-code mb-8 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[var(--tray-muted)]">
        <span>{label}</span>
        <span className="rounded-full bg-[var(--tray-green)]/10 px-3 py-1 text-[0.65rem] text-[var(--tray-green)]">
          Live
        </span>
      </div>
      <h3 className="text-2xl font-semibold tracking-[-0.04em]">{title}</h3>
      <p className="font-code mt-3 text-xs uppercase tracking-[0.16em] text-[var(--tray-muted)]">
        {meta}
      </p>
    </div>
  );
}
