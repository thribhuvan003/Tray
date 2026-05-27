"use client";

import Link from "next/link";
import { useState } from "react";
import { LoginForm } from "@/components/portal-student/login-form";

type Role = "student" | "kitchen" | "owner";

const ROLES: {
  id: Role;
  label: string;
  tag: string;
  headline: string;
  italic: string;
  sub: string;
}[] = [
  {
    id: "student",
    label: "Student",
    tag: "LEARNER",
    headline: "Sign in.",
    italic: "Eat sooner.",
    sub: "Your campus email gets you a magic link. No password, no friction.",
  },
  {
    id: "kitchen",
    label: "Kitchen",
    tag: "STAFF",
    headline: "Staff access.",
    italic: "Serve faster.",
    sub: "Your admin will share login credentials. PIN login is also supported.",
  },
  {
    id: "owner",
    label: "Admin",
    tag: "OWNER",
    headline: "Admin sign in.",
    italic: "Your canteen, your system.",
    sub: "Full control — menus, staff, revenue, analytics. One login, everything.",
  },
];

export function LoginRoleTabs({
  initialRole,
  next,
  slug,
  error,
}: {
  initialRole: Role;
  next: string;
  slug: string;
  error?: string;
}) {
  const [activeRole, setActiveRole] = useState<Role>(initialRole);
  const role = ROLES.find((r) => r.id === activeRole) ?? ROLES[0];

  return (
    <>
      {/* ── Role tabs ─────────────────────────────────────────────── */}
      <div className="flex gap-0 mb-9 border-b border-[color:var(--color-line)]">
        {ROLES.map((r) => {
          const isActive = activeRole === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setActiveRole(r.id)}
              className="relative flex-1 py-3 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors duration-150 focus:outline-none select-none"
              style={{
                fontFamily: "var(--font-dm-mono, monospace)",
                color: isActive ? "var(--color-ocean-500, #e60000)" : "var(--color-ink, #1A1A19)",
                opacity: isActive ? 1 : 0.38,
              }}
            >
              {r.label}
              {/* Active underline */}
              {isActive && (
                <span
                  className="absolute bottom-[-1px] left-0 right-0 h-[2px]"
                  style={{ background: "var(--color-ocean-500, #e60000)" }}
                />
              )}
            </button>
          );
        })}

        {/* Super Admin — coming soon, always disabled */}
        <button
          type="button"
          disabled
          className="relative flex-1 py-3 text-[11px] font-bold uppercase tracking-[0.18em] cursor-not-allowed select-none"
          style={{
            fontFamily: "var(--font-dm-mono, monospace)",
            color: "var(--color-ink, #1A1A19)",
            opacity: 0.22,
          }}
          title="Multi-canteen director console — coming soon"
        >
          Director
          <span
            className="absolute -top-1.5 right-1.5 rounded-full px-1.5 text-[8px] font-bold uppercase tracking-wider"
            style={{
              background: "var(--color-ocean-500, #e60000)",
              color: "#fff",
              fontFamily: "var(--font-dm-mono, monospace)",
              lineHeight: "1.6",
            }}
          >
            Soon
          </span>
        </button>
      </div>

      {/* ── Headline ──────────────────────────────────────────────── */}
      <div className="mb-7">
        <h1
          className="leading-[0.92] tracking-[-0.04em] uppercase"
          style={{
            fontFamily: "var(--font-barlow, var(--font-bricolage))",
            fontWeight: 900,
            fontSize: "clamp(2.4rem, 6vw, 3.8rem)",
            color: "var(--color-ink, #1A1A19)",
          }}
        >
          {role.headline}{" "}
          <span
            style={{
              fontFamily: "var(--font-fraunces, serif)",
              fontStyle: "italic",
              textTransform: "none",
              fontWeight: 400,
              color: "var(--color-ocean-500, #e60000)",
            }}
          >
            {role.italic}
          </span>
        </h1>
        <p
          className="mt-3 text-[13.5px] leading-[1.65]"
          style={{ color: "var(--color-ink, #1A1A19)", opacity: 0.55 }}
        >
          {role.sub}
        </p>
      </div>

      {/* ── Error banner ──────────────────────────────────────────── */}
      {error && (
        <div
          className="mb-6 rounded-xl border px-4 py-3 text-[13px]"
          style={{
            borderColor: "rgba(230,0,0,0.2)",
            background: "rgba(230,0,0,0.04)",
            color: "#c00",
          }}
        >
          {error}
          {(error.toLowerCase().includes("no account") ||
            error.toLowerCase().includes("sign up")) && (
            <span className="ml-1">
              <Link
                href={`/signup?next=${encodeURIComponent(next)}`}
                className="underline font-semibold"
              >
                Create account →
              </Link>
            </span>
          )}
        </div>
      )}

      {/* ── Login form ────────────────────────────────────────────── */}
      <LoginForm next={next} slug={slug} />

      {/* ── Footer ────────────────────────────────────────────────── */}
      <div
        className="mt-8 flex flex-wrap items-center justify-between gap-2 text-[12px]"
        style={{ color: "var(--color-ink, #1A1A19)", opacity: 0.45 }}
      >
        <span>
          New here?{" "}
          <Link
            href={`/signup?next=${encodeURIComponent(next)}`}
            className="hover:underline"
            style={{ color: "var(--color-ocean-500, #e60000)", opacity: 1 }}
          >
            Create account
          </Link>
        </span>
        <Link
          href="/get-started"
          className="hover:underline"
          style={{ color: "var(--color-ocean-500, #e60000)", opacity: 1 }}
        >
          I have a canteen →
        </Link>
      </div>
    </>
  );
}
