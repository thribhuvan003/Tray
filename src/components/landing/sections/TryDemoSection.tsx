"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  fadeUp,
  prefersReducedMotion,
  registerTrayGsap,
} from "@/lib/motion/tray-motion";

// Demo cards route to the REAL app pages (with aditya as demo fallback).
// Visitors pick their role here — nav "Demo" scrolls to this section.

const roles = [
  {
    label: "Student",
    text: "Order from any canteen in a campus.",
    href: "/c/aditya/menu",
    tag: "multi-canteen",
  },
  {
    label: "Kitchen staff",
    text: "Manage one canteen's live queue.",
    href: "/c/aditya/kitchen",
    tag: "live board",
  },
  {
    label: "Canteen admin",
    text: "Manage menu, orders, staff, and revenue.",
    href: "/c/aditya/admin/dashboard",
    tag: "console",
  },
  {
    label: "College admin",
    text: "Understand canteens across the campus.",
    href: "/college/aditya",
    tag: "overview",
  },
] as const;

export function TryDemoSection() {
  const rootRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [roleLabel, setRoleLabel] = useState("Tray");

  useGSAP(
    () => {
      registerTrayGsap();
      if (prefersReducedMotion()) return;

      fadeUp("[data-demo-card]", {
        y: 44,
        stagger: 0.1,
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 75%",
        },
      });
    },
    { scope: rootRef }
  );

  function openDemo(href: string, label: string) {
    setRoleLabel(label);

    if (prefersReducedMotion()) {
      router.push(href);
      return;
    }

    const overlay = overlayRef.current;
    if (!overlay) {
      router.push(href);
      return;
    }

    gsap
      .timeline({ onComplete: () => router.push(href) })
      .set(overlay, { display: "grid" })
      .fromTo(
        overlay,
        { yPercent: 100 },
        { yPercent: 0, duration: 0.65, ease: "power4.inOut" }
      )
      .fromTo(
        "[data-entry-word]",
        { yPercent: 100, rotate: 3, opacity: 0 },
        { yPercent: 0, rotate: 0, opacity: 1, duration: 0.55, ease: "power4.out" },
        "-=0.2"
      )
      .fromTo(
        "[data-entry-label]",
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35 },
        "-=0.25"
      );
  }

  return (
    <section
      ref={rootRef}
      id="try-demo"
      className="relative overflow-hidden px-5 py-24 sm:px-8 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <p className="font-code mb-4 text-xs uppercase tracking-[0.3em] text-[var(--tray-muted)]">
          Live demo
        </p>

        <h2 className="font-editorial max-w-4xl text-[clamp(3.4rem,8vw,8.5rem)] font-black leading-[0.86] tracking-[-0.07em]">
          Try Tray as the person using it.
        </h2>

        <p className="mt-6 max-w-2xl text-lg leading-8 opacity-70">
          Choose a role. Same product, different view.
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {roles.map((role) => (
            <button
              key={role.label}
              data-demo-card
              onClick={() => openDemo(role.href, role.label)}
              className="group rounded-[2rem] border border-[var(--tray-border)] bg-white/55 p-6 text-left shadow-[0_20px_60px_rgba(17,17,17,0.06)] transition hover:-translate-y-1 hover:bg-white/80 active:scale-[0.98]"
            >
              <span className="font-code rounded-full bg-[var(--tray-ink)] px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-[var(--tray-cream,#F0E6D2)]">
                {role.tag}
              </span>

              <h3 className="mt-8 text-3xl font-semibold tracking-[-0.05em]">
                {role.label}
              </h3>

              <p className="mt-3 min-h-14 text-sm leading-6 text-[var(--tray-muted)]">
                {role.text}
              </p>

              <span className="mt-8 inline-flex text-sm font-semibold transition group-hover:translate-x-1">
                Open view →
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* La Revoltosa entry overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9999] hidden place-items-center bg-[var(--tray-cream,#F0E6D2)] text-[var(--tray-ink)]"
      >
        <div className="text-center">
          <div className="overflow-hidden">
            <div
              data-entry-word
              className="font-editorial text-[clamp(6rem,18vw,16rem)] font-black leading-none tracking-[-0.09em]"
            >
              Tray
            </div>
          </div>
          <p
            data-entry-label
            className="font-code mt-4 text-xs uppercase tracking-[0.32em] text-[var(--tray-muted)]"
          >
            Opening {roleLabel}
          </p>
        </div>
      </div>
    </section>
  );
}
