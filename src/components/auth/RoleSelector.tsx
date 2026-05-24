"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { LoginForm } from "@/components/portal-student/login-form";
import { prefersReducedMotion, registerTrayGsap } from "@/lib/motion/tray-motion";

// Role-selector screen shown before the login form.
// Three roles:
//   Student       → sign in with campus email / Google → land at /menu
//   Kitchen staff → sign in → land at kitchen queue
//   I own a canteen → redirect to /get-started (no auth needed yet)
//
// Clicking a role card smoothly reveals the login form below.
// "I own a canteen" routes directly to /get-started.

type Role = "student" | "kitchen" | "owner";

const ROLES = [
  {
    id: "student" as Role,
    title: "Student",
    subtitle: "I want to order food",
    description: "Browse your campus canteens, pay by UPI, track your order live, and collect with a 4-digit code.",
    accent: "var(--color-ocean-500, #6E86AB)",
    accentBg: "rgba(110,134,171,0.1)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path d="M14 3C8.477 3 4 7.477 4 13s4.477 10 10 10 10-4.477 10-10S19.523 3 14 3z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M9 13h6M12 10l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "kitchen" as Role,
    title: "Kitchen staff",
    subtitle: "I prepare orders",
    description: "See your canteen's live ticket queue, update order status, and verify handovers with OTP.",
    accent: "#B8531A",
    accentBg: "rgba(184,83,26,0.10)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path d="M5 22V12a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10M3 22h22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M10 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "owner" as Role,
    title: "I own a canteen",
    subtitle: "I run the operation",
    description: "Set up your campus, configure canteens, manage your team, and see real-time revenue and analytics.",
    accent: "var(--tray-clay, #B8531A)",
    accentBg: "rgba(184,83,26,0.10)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <rect x="4" y="12" width="20" height="11" rx="2" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M8 12V9a6 6 0 0 1 12 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <circle cx="14" cy="17.5" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
] as const;

export function RoleSelector({
  next,
  slug,
  error,
  initialRole,
}: {
  next: string;
  slug: string;
  error?: string;
  initialRole?: Role;
}) {
  const [selected, setSelected] = useState<Role | null>(initialRole ?? null);
  const formRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Login page is always light — prevent dark mode bleed from student portal
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

  useEffect(() => {
    if (initialRole && (initialRole === "student" || initialRole === "kitchen" || initialRole === "owner")) {
      const t = setTimeout(() => {
        handleRoleClick(initialRole);
      }, 100);
      return () => clearTimeout(t);
    }
  }, [initialRole]);

  useGSAP(() => {
    registerTrayGsap();
    if (prefersReducedMotion()) return;

    // Cards stagger in on mount — only y, no opacity, so no SSR flash
    gsap.fromTo(
      "[data-role-card]",
      { y: 28 },
      { y: 0, stagger: 0.08, duration: 0.55, ease: "power3.out" }
    );
  });

  function handleRoleClick(role: Role) {
    if (role === "owner") {
      // Show admin login form instead of redirecting to /get-started
      // /get-started link is shown separately in the form header
      setSelected(role);
    } else {
      setSelected(role);
    }

    if (prefersReducedMotion()) {
      formRef.current?.scrollIntoView({ behavior: "auto", block: "center" });
      return;
    }

    // Scroll cards up slightly, reveal form below
    gsap.to(cardsRef.current, {
      y: -12,
      opacity: 0.5,
      duration: 0.4,
      ease: "power2.out",
    });
    gsap.fromTo(
      formRef.current,
      { y: 40, opacity: 0, display: "block" },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
    );
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 200);
  }

  const selectedRole = ROLES.find((r) => r.id === selected);
  const loginNext =
    selected === "kitchen"
      ? slug ? `/c/${slug}/kitchen` : "/kitchen"
      : selected === "owner"
      ? (next === "/" || next.endsWith("/menu") || next === "")
        ? slug ? `/c/${slug}/admin/dashboard` : "/admin/dashboard"
        : next
      : next;

  return (
    <div className="w-full">
      {/* Role cards */}
      <div ref={cardsRef} className="grid gap-3">
        {ROLES.map((role) => {
          const isActive = selected === role.id;
          return (
            <button
              key={role.id}
              data-role-card
              type="button"
              onClick={() => handleRoleClick(role.id)}
              className="group w-full rounded-[1.5rem] border p-4 text-left transition-all"
              style={{
                border: `1.5px solid ${isActive ? role.accent : "var(--tray-border, rgba(87,87,87,0.14))"}`,
                background: isActive ? role.accentBg : "rgba(255,255,255,0.55)",
                boxShadow: isActive ? `0 0 0 3px ${role.accentBg}` : "0 2px 8px rgba(26,22,20,0.05)",
              }}
            >
              <div className="flex items-start gap-4">
                <span
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[0.85rem] transition-colors"
                  style={{ background: role.accentBg, color: role.accent }}
                >
                  {role.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[1.05rem] tracking-[-0.03em]"
                      style={{ fontFamily: "var(--font-jakarta)", fontWeight: 700, color: "var(--tray-ink)" }}
                    >
                      {role.title}
                    </span>
                    <span
                      className="text-[0.7rem] uppercase tracking-[0.14em]"
                      style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}
                    >
                      {role.subtitle}
                    </span>
                  </div>
                  <p
                    className="mt-1 text-[0.85rem] leading-[1.6]"
                    style={{ fontFamily: "var(--font-geist)", color: "var(--tray-muted)" }}
                  >
                    {role.description}
                  </p>
                  {role.id === "owner" && (
                    <span
                      className="mt-2 inline-flex items-center gap-1 text-[0.82rem]"
                      style={{ fontFamily: "var(--font-geist)", fontWeight: 600, color: role.accent }}
                    >
                      I have a canteen →
                    </span>
                  )}
                </div>
                {role.id !== "owner" && (
                  <span
                    className="flex-shrink-0 text-[0.88rem] opacity-0 transition-opacity group-hover:opacity-60"
                    style={{ fontFamily: "var(--font-geist)", fontWeight: 600 }}
                  >
                    Sign in →
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Login form — revealed after role selection */}
      <div
        ref={formRef}
        style={{ display: selected ? "block" : "none" }}
      >
        {selected && (
          <div className="mt-6 rounded-[1.75rem] border border-[var(--tray-border)] bg-white/70 p-6 backdrop-blur-sm">
            {/* Context header */}
            <div className="mb-5 flex items-center gap-3 border-b border-[var(--tray-border)] pb-5">
              <span
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ background: selectedRole?.accentBg, color: selectedRole?.accent }}
              >
                {selectedRole?.icon}
              </span>
              <div>
                <p
                  className="text-[0.95rem] tracking-tight"
                  style={{ fontFamily: "var(--font-jakarta)", fontWeight: 700, color: "var(--tray-ink)" }}
                >
                  Signing in as {selectedRole?.title}
                </p>
                <p
                  className="text-[0.78rem]"
                  style={{ fontFamily: "var(--font-geist)", color: "var(--tray-muted)" }}
                >
                  {selected === "kitchen"
                    ? "Use your canteen staff account"
                    : selected === "owner"
                    ? "Sign in to your admin dashboard"
                    : "Use your campus email"}
                </p>
                {selected === "owner" && (
                  <a
                    href="/get-started"
                    className="mt-1 block text-[0.75rem] transition hover:opacity-75"
                    style={{ fontFamily: "var(--font-geist)", fontWeight: 600, color: "var(--tray-clay)" }}
                  >
                    New to Tray? I have a canteen — set it up free →
                  </a>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  if (formRef.current) formRef.current.style.display = "none";
                  if (!prefersReducedMotion()) {
                    gsap.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" });
                  }
                }}
                className="ml-auto text-[0.8rem]"
                style={{ fontFamily: "var(--font-geist)", color: "var(--tray-muted)" }}
              >
                ← Change
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.82rem] text-red-600">
                {error === "no-admin-account" ? (
                  <span>
                    No canteen found for this account. If you haven&apos;t set one up yet,{" "}
                    <a href="/get-started" className="font-semibold underline hover:opacity-75">
                      create your canteen here →
                    </a>
                  </span>
                ) : (
                  error
                )}
              </div>
            )}

            <LoginForm next={loginNext} slug={slug} loginRole={selected === "owner" ? "owner" : ""} />
          </div>
        )}
      </div>
    </div>
  );
}
