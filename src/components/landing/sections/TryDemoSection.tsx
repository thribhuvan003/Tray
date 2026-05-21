"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  clipReveal,
  prefersReducedMotion,
  registerTrayGsap,
} from "@/lib/motion/tray-motion";

// Try-demo role cards with live iframe previews so every visitor — student,
// admin, CEO — can SEE each portal before clicking in.

const roles = [
  {
    label: "Student",
    description: "Order from any canteen in the campus. Pay by UPI. Track live. Show OTP.",
    href: "/c/aditya/menu",
    tag: "student",
    previewSrc: "/demo/student.html",
    previewLabel: "Student app · mobile",
    accentColor: "var(--color-ocean-500, #6E86AB)",
  },
  {
    label: "Kitchen staff",
    description: "Manage one canteen's live queue. Accept, prep, hand over with OTP.",
    href: "/c/aditya/kitchen",
    tag: "kitchen",
    previewSrc: "/demo/kitchen.html",
    previewLabel: "Kitchen view · tablet",
    accentColor: "#B8531A",
  },
  {
    label: "Canteen admin",
    description: "Menu, orders, staff, and daily revenue. Full audit log included.",
    href: "/c/aditya/admin/dashboard",
    tag: "admin",
    previewSrc: "/demo/admin.html",
    previewLabel: "Admin console · desktop",
    accentColor: "var(--tray-green)",
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

      clipReveal("[data-demo-card]", {
        y: 48,
        stagger: 0.12,
        scrollTrigger: { trigger: rootRef.current, start: "top 78%" },
      });
    },
    { scope: rootRef }
  );

  function openDemo(href: string, label: string) {
    setRoleLabel(label);
    if (prefersReducedMotion()) { router.push(href); return; }

    const overlay = overlayRef.current;
    if (!overlay) { router.push(href); return; }

    gsap
      .timeline({ onComplete: () => router.push(href) })
      .set(overlay, { display: "grid" })
      .fromTo(overlay, { yPercent: 100 }, { yPercent: 0, duration: 0.65, ease: "power4.inOut" })
      .fromTo(
        "[data-entry-word]",
        { yPercent: 100, rotate: 2, opacity: 0 },
        { yPercent: 0, rotate: 0, opacity: 1, duration: 0.55, ease: "power4.out" },
        "-=0.2"
      )
      .fromTo(
        "[data-entry-label]",
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35 },
        "-=0.25"
      );
  }

  return (
    <section ref={rootRef} id="try-demo" className="relative overflow-hidden px-5 py-24 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Section label */}
        <p
          className="mb-4 text-xs uppercase tracking-[0.3em]"
          style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}
        >
          Live demo · no sign-up · 90-second tour
        </p>

        {/* Barlow Condensed 900 headline */}
        <h2
          className="max-w-4xl leading-[0.84] tracking-[-0.02em]"
          style={{
            fontFamily: "var(--font-barlow)",
            fontWeight: 900,
            fontSize: "clamp(3.4rem, 8.5vw, 9rem)",
            textTransform: "uppercase",
          }}
        >
          Pick your{" "}
          <em
            className="not-italic"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontStyle: "italic",
              textTransform: "none",
              color: "var(--tray-clay)",
            }}
          >
            portal.
          </em>
        </h2>

        <p
          className="mt-5 max-w-xl text-[1.05rem] leading-8 opacity-68"
          style={{ fontFamily: "var(--font-geist)" }}
        >
          Same product, three views. Click any card to open the live demo — no account required.
        </p>

        {/* Role preview cards — 3 columns desktop */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <article
              key={role.label}
              data-demo-card
              className="group flex flex-col overflow-hidden rounded-[2.25rem] border transition-all"
              style={{
                border: "1px solid var(--tray-border)",
                background: "rgba(255,255,255,0.58)",
                boxShadow: "0 16px 48px rgba(26,22,20,0.08)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 28px 80px rgba(26,22,20,0.14)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 48px rgba(26,22,20,0.08)";
              }}
            >
              {/* Card header */}
              <div className="flex items-start justify-between px-5 pt-5 pb-4">
                <div>
                  <span
                    className="mb-1 block text-[0.62rem] uppercase tracking-[0.2em]"
                    style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}
                  >
                    {role.tag}
                  </span>
                  <h3
                    className="text-[1.5rem] tracking-[-0.04em]"
                    style={{ fontFamily: "var(--font-jakarta)", fontWeight: 700 }}
                  >
                    {role.label}
                  </h3>
                </div>
                {/* Colored status dot */}
                <span
                  className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ background: role.accentColor, boxShadow: `0 0 10px ${role.accentColor}` }}
                />
              </div>

              {/* iframe preview — scaled to fit inside card */}
              <div
                className="relative mx-4 mb-4 overflow-hidden rounded-[1.5rem]"
                style={{ height: 240, background: "var(--tray-surface, #CAB99C)", border: "1px solid var(--tray-border)" }}
              >
                <iframe
                  src={role.previewSrc}
                  title={`${role.label} preview`}
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin"
                  scrolling="no"
                  tabIndex={-1}
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "200%",
                    height: "200%",
                    transform: "scale(0.5)",
                    transformOrigin: "0 0",
                    border: 0,
                    pointerEvents: "none",
                  }}
                />
                {/* Bottom fade + device tag */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ background: "linear-gradient(180deg, transparent 55%, rgba(255,255,255,0.58) 100%)" }}
                />
                <span
                  className="absolute left-3 top-3 rounded-md px-2 py-1 text-[0.6rem] uppercase tracking-[0.12em] backdrop-blur-sm"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    color: "var(--tray-ink)",
                    background: "rgba(255,255,255,0.70)",
                    border: "1px solid var(--tray-border)",
                  }}
                >
                  {role.previewLabel}
                </span>
              </div>

              {/* Card body */}
              <div className="flex flex-1 flex-col gap-4 px-5 pb-5">
                <p
                  className="flex-1 text-[0.9rem] leading-[1.65]"
                  style={{ fontFamily: "var(--font-geist)", color: "var(--tray-muted)" }}
                >
                  {role.description}
                </p>

                <button
                  type="button"
                  onClick={() => openDemo(role.href, role.label)}
                  className="flex w-full items-center justify-between rounded-[1rem] px-4 py-3 transition hover:opacity-85"
                  style={{
                    background: "var(--tray-ink)",
                    color: "var(--tray-cream, #EDE5D2)",
                    fontFamily: "var(--font-geist)",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                  }}
                >
                  <span>Open {role.label.toLowerCase()} demo</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Campus admin note */}
        <div
          className="mt-4 flex items-center justify-center gap-3 rounded-[1.25rem] border px-6 py-4 text-center text-sm opacity-60"
          style={{ border: "1px solid var(--tray-border)", fontFamily: "var(--font-geist)" }}
        >
          <span
            className="text-[0.62rem] uppercase tracking-[0.18em]"
            style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}
          >
            Campus admin view
          </span>
          <span style={{ color: "var(--tray-muted)" }}>·</span>
          <span style={{ color: "var(--tray-muted)" }}>Full campus overview coming in the next release.</span>
        </div>
      </div>

      {/* La Revoltosa entry overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9999] hidden place-items-center"
        style={{ background: "var(--tray-bg)", color: "var(--tray-ink)" }}
      >
        <div className="text-center">
          <div className="overflow-hidden">
            <div
              data-entry-word
              className="leading-none tracking-[-0.07em]"
              style={{
                fontFamily: "var(--font-barlow)",
                fontWeight: 900,
                fontSize: "clamp(6rem, 18vw, 17rem)",
                textTransform: "uppercase",
              }}
            >
              Tray
            </div>
          </div>
          <p
            data-entry-label
            className="mt-4 text-xs uppercase tracking-[0.32em]"
            style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}
          >
            Opening {roleLabel}
          </p>
        </div>
      </div>
    </section>
  );
}
