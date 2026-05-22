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
    href: "/demo/student.html",
    tag: "student",
    previewSrc: "/demo/student.html",
    previewLabel: "Student app · mobile",
    accentColor: "var(--color-ocean-500, #E60000)",
    authRequired: false,
    buttonLabel: "Open student demo",
  },
  {
    label: "Kitchen staff",
    description: "Manage one canteen's live queue. Accept, prep, hand over with OTP.",
    href: "/demo/kitchen.html",
    tag: "kitchen",
    previewSrc: "/demo/kitchen.html",
    previewLabel: "Kitchen view · tablet",
    accentColor: "#B8531A",
    authRequired: false,
    buttonLabel: "Sign in as kitchen staff",
  },
  {
    label: "Canteen admin",
    description: "Menu, orders, staff, and daily revenue. Full audit log included.",
    href: "/demo/admin.html",
    tag: "admin",
    previewSrc: "/demo/admin.html",
    previewLabel: "Admin console · desktop",
    accentColor: "var(--tray-green, #0c8a43)",
    authRequired: false,
    buttonLabel: "Sign in as admin",
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
    if (prefersReducedMotion()) { window.location.href = href; return; }

    const overlay = overlayRef.current;
    if (!overlay) { window.location.href = href; return; }

    gsap
      .timeline({ onComplete: () => { window.location.href = href; } })
      .set(overlay, { display: "flex" })
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
    <section ref={rootRef} id="try-demo" className="relative overflow-hidden px-5 py-28 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Eyebrow badge */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <p
            className="text-xs uppercase tracking-[0.3em] font-medium"
            style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}
          >
            01 / The system
          </p>
        </div>

        {/* Headline: Three portals, one source of truth. */}
        <h2
          className="max-w-5xl leading-[0.80] tracking-[-0.02em]"
          style={{
            fontFamily: "var(--font-barlow)",
            fontWeight: 900,
            fontSize: "clamp(3.8rem, 9.5vw, 10.5rem)",
            textTransform: "uppercase",
          }}
        >
          Three portals,{" "}
          <em
            className="not-italic block sm:inline"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontStyle: "italic",
              textTransform: "none",
              color: "var(--tray-clay)",
            }}
          >
            one source of truth.
          </em>
        </h2>

        <p
          className="mt-6 max-w-4xl text-[1.12rem] leading-8 opacity-68"
          style={{ fontFamily: "var(--font-geist)" }}
        >
          One database, three purpose-built views. What a student orders is what the
          kitchen prepares, which is what the admin monitors. No lag, no re-sync,
          no mystery. Open any portal below — fully live, no sign-up.
        </p>

        {/* pick your portal block */}
        <div className="mt-14 border-t border-[var(--tray-border)] pt-8">
          <div className="flex flex-col gap-3">
            <span
              className="text-[0.72rem] font-code font-bold uppercase tracking-[0.24em]"
              style={{ color: "var(--tray-clay)" }}
            >
              Pick your portal · no sign-up · 90-second tour
            </span>
            <p className="max-w-2xl text-[0.98rem] leading-relaxed opacity-60" style={{ fontFamily: "var(--font-geist)" }}>
              Same product, three views. Student demo opens instantly — no login needed.
              Kitchen and admin use a shared demo account.
            </p>
          </div>
        </div>

        {/* Role preview cards — 3 columns desktop */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <article
              key={role.label}
              data-demo-card
              role="button"
              tabIndex={0}
              onClick={() => openDemo(role.href, role.label)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openDemo(role.href, role.label);
                }
              }}
              className="group flex flex-col overflow-hidden rounded-[3rem] transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 p-8 sm:p-10"
              style={{
                border: "1px solid rgba(255, 255, 255, 0.4)",
                background: "rgba(255,255,255,0.58)",
                boxShadow: "0 16px 48px rgba(26,22,20,0.06)",
                outlineColor: "var(--tray-clay)",
              }}
            >
              {/* Card header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span
                    className="mb-1 block text-[0.72rem] font-code font-bold uppercase tracking-[0.2em]"
                    style={{ color: "var(--tray-muted)" }}
                  >
                    {role.tag}
                  </span>
                  <h3
                    className="text-[1.85rem] tracking-[-0.04em] leading-tight"
                    style={{ fontFamily: "var(--font-jakarta)", fontWeight: 700 }}
                  >
                    {role.label}
                  </h3>
                </div>
                {/* Colored status dot */}
                <span
                  className="mt-2 h-3 w-3 flex-shrink-0 rounded-full animate-pulse"
                  style={{ background: role.accentColor, boxShadow: `0 0 10px ${role.accentColor}` }}
                />
              </div>

              {/* iframe preview — scaled to fit inside card, perfectly curved rounded-[2.5rem] with zero borders */}
              <div
                className="relative overflow-hidden rounded-[2.5rem] mb-6"
                style={{ height: 420, background: "var(--tray-surface, #CAB99C)", border: "none" }}
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
                
                {/* Clean label overlay inside the preview window */}
                <span
                  className="absolute left-4 top-4 rounded-xl px-3 py-1.5 text-[0.7rem] font-code font-bold uppercase tracking-[0.12em] backdrop-blur-md"
                  style={{
                    color: "var(--tray-ink)",
                    background: "rgba(255,255,255,0.85)",
                    border: "none",
                  }}
                >
                  {role.previewLabel}
                </span>
              </div>

              {/* Card body */}
              <div className="flex flex-1 flex-col gap-5">
                <p
                  className="text-[0.95rem] leading-[1.65]"
                  style={{ fontFamily: "var(--font-geist)", color: "var(--tray-muted)" }}
                >
                  {role.description}
                </p>

                {role.authRequired && (
                  <p
                    className="text-[0.72rem] uppercase tracking-[0.16em] font-medium"
                    style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)", opacity: 0.65 }}
                  >
                    Demo login · shared credentials
                  </p>
                )}

                <div
                  className="mt-auto flex w-full items-center justify-between rounded-2xl px-5 py-3.5 transition group-hover:opacity-85"
                  style={{
                    background: "var(--tray-ink)",
                    color: "var(--tray-cream, #EDE5D2)",
                    fontFamily: "var(--font-geist)",
                    fontWeight: 600,
                    fontSize: "0.92rem",
                  }}
                >
                  <span>{role.buttonLabel}</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>

      {/* Fullscreen wipe */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9999] hidden"
        style={{
          background: "var(--tray-bg, #FAF8F5)",
          color: "var(--tray-ink, #1A1A19)",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {/* Tray — fills viewport for maximum drama */}
        <div style={{ overflow: "hidden" }}>
          <div
            data-entry-word
            style={{
              fontFamily: "var(--font-barlow, system-ui)",
              fontWeight: 900,
              fontSize: "clamp(9rem, 26vw, 24rem)",
              lineHeight: 0.80,
              letterSpacing: "-0.05em",
              textTransform: "uppercase",
              color: "var(--tray-ink, #1A1A19)",
              padding: "0 clamp(1rem, 4vw, 4rem)",
            }}
          >
            Tray
          </div>
        </div>
        {/* Role hint */}
        <p
          data-entry-label
          style={{
            fontFamily: "var(--font-dm-mono, monospace)",
            fontSize: "0.7rem",
            letterSpacing: "0.36em",
            textTransform: "uppercase",
            color: "var(--tray-muted, #575757)",
            opacity: 0.65,
          }}
        >
          Opening {roleLabel}
        </p>
      </div>
    </section>
  );
}

