"use client";

import Link from "next/link";
import { useState } from "react";
import { LoginForm } from "@/components/portal-student/login-form";

type Role = "student" | "kitchen" | "owner";

const ROLES: { id: Role; label: string; emoji: string; headline: string; sub: string }[] = [
  {
    id: "student",
    label: "Student",
    emoji: "🎓",
    headline: "Sign in.\nEat sooner.",
    sub: "Use your campus email — we'll send a magic link, no password required.",
  },
  {
    id: "kitchen",
    label: "Kitchen",
    emoji: "👨‍🍳",
    headline: "Staff sign in.\nManage orders.",
    sub: "Kitchen staff access. Use the PIN or email provided by your canteen admin.",
  },
  {
    id: "owner",
    label: "Admin",
    emoji: "🏪",
    headline: "Admin sign in.\nControl your canteen.",
    sub: "Canteen admin access. Manage menus, staff, and revenue for your outlet.",
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
      {/* Role picker chips */}
      <div className="flex gap-1.5 p-1 rounded-2xl bg-[color:var(--color-paper-dim,rgba(0,0,0,0.04))] mb-8">
        {ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setActiveRole(r.id)}
            className="relative flex-1 h-9 rounded-xl text-[12.5px] font-semibold tracking-wide transition-all duration-200 select-none focus:outline-none"
            style={{
              fontFamily: "var(--font-bricolage, var(--font-geist))",
              color: activeRole === r.id ? "#fff" : "var(--color-ink)",
              background: activeRole === r.id ? "var(--color-ocean-500, #e60000)" : "transparent",
              opacity: activeRole === r.id ? 1 : 0.55,
            }}
          >
            <span className="mr-1">{r.emoji}</span>
            {r.label}
          </button>
        ))}
      </div>

      {/* Headline */}
      <h1
        className="text-[40px] leading-[1.05] tracking-tight font-medium mb-3"
        style={{ fontFamily: "var(--font-bricolage, var(--font-geist))", fontWeight: 700 }}
      >
        {role.headline.split("\n").map((line, i) =>
          i === 1 ? (
            <span key={i}>
              <br />
              <span style={{ fontStyle: "italic", color: "var(--color-ocean-500, #e60000)" }}>
                {line}
              </span>
            </span>
          ) : (
            <span key={i}>{line}</span>
          )
        )}
      </h1>
      <p className="text-[14px] text-[color:var(--color-ink)]/65 mb-7">{role.sub}</p>

      {/* Error banner */}
      {error && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/5 px-4 py-3 text-[13px] text-rose-600">
          {error}
          {(error.toLowerCase().includes("no account") ||
            error.toLowerCase().includes("sign up")) && (
            <span className="ml-1">
              <Link
                href={`/signup?next=${encodeURIComponent(next)}`}
                className="underline font-medium hover:text-rose-700"
              >
                Create account →
              </Link>
            </span>
          )}
        </div>
      )}

      {/* Unified login form — auth callback routes to correct portal by DB role */}
      <LoginForm next={next} slug={slug} />

      {/* Footer links */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-2 text-[12.5px] text-[color:var(--color-ink)]/55">
        <span>
          New to Tray?{" "}
          <Link
            href={`/signup?next=${encodeURIComponent(next)}`}
            className="text-ocean-500 hover:underline"
          >
            Create an account
          </Link>
        </span>
        <Link href="/get-started" className="text-ocean-500 hover:underline">
          I have a canteen →
        </Link>
      </div>
    </>
  );
}
