"use client";

import { SectionReveal, RevealItem, HoverCard } from "@/lib/motion/tray-framer";

const CANTEENS = [
  { name: "Main Canteen",   icon: "🍽️", tag: "Ground floor · North block" },
  { name: "Hostel Mess",    icon: "🏠", tag: "Residential block" },
  { name: "North Block",    icon: "🏛️", tag: "Academic wing" },
  { name: "Night Canteen",  icon: "🌙", tag: "Open till 11 pm" },
];

const ROLES = [
  {
    role: "Student",
    scope: "All active canteens",
    color: "var(--color-ocean-500, #6E86AB)",
    bg: "rgba(110,134,171,0.10)",
    desc: "Browse every canteen, pay by UPI, track live, collect with OTP.",
  },
  {
    role: "Kitchen staff",
    scope: "Assigned canteen only",
    color: "#B8531A",
    bg: "rgba(184,83,26,0.08)",
    desc: "See only their queue. No cross-canteen access, no confusion.",
  },
  {
    role: "Canteen admin",
    scope: "One canteen — full control",
    color: "var(--tray-green, #2A6E3A)",
    bg: "rgba(42,110,58,0.08)",
    desc: "Menu, orders, staff, revenue. Isolated from other canteens.",
  },
  {
    role: "Campus admin",
    scope: "Whole campus — coming soon",
    color: "var(--tray-muted)",
    bg: "rgba(87,87,87,0.06)",
    desc: "Cross-canteen analytics, revenue overview, staff management.",
  },
];

export function CampusModelSection({ campusName }: { campusName?: string | null }) {
  return (
    <SectionReveal as="div" id="campus" className="px-5 py-24 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <RevealItem>
          <p className="font-code mb-4 text-xs uppercase tracking-[0.3em] text-[var(--tray-muted)]">
            Campus Edition
          </p>
        </RevealItem>

        <RevealItem>
          <h2
            className="max-w-3xl leading-[0.86] tracking-[-0.06em]"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontWeight: 900,
              fontSize: "clamp(3.2rem, 7.5vw, 7.5rem)",
            }}
          >
            One campus.{" "}
            <em style={{ fontStyle: "italic", color: "var(--tray-clay)" }}>Many counters.</em>
          </h2>
        </RevealItem>

        <RevealItem>
          <p className="mt-6 max-w-xl text-[1.05rem] leading-8 opacity-70"
            style={{ fontFamily: "var(--font-geist)" }}>
            Every canteen on campus in one system. Students see everything.
            Staff see only their counter. Admins manage their canteen.
            No overlap, no confusion, no wrong orders.
          </p>
        </RevealItem>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">

          {/* Left: canteen grid */}
          <div>
            <p className="mb-4 text-[0.65rem] uppercase tracking-[0.28em]"
              style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}>
              {campusName || "Your University"} · active canteens
            </p>
            <div className="grid grid-cols-2 gap-3">
              {CANTEENS.map((c) => (
                <HoverCard
                  key={c.name}
                  className="rounded-[1.5rem] border p-4"
                  style={{ border: "1px solid var(--tray-border)", background: "rgba(255,255,255,0.58)" }}
                >
                  <span className="text-2xl">{c.icon}</span>
                  <p className="mt-3 font-semibold tracking-tight"
                    style={{ fontFamily: "var(--font-jakarta)" }}>{c.name}</p>
                  <p className="mt-1 text-[0.62rem] uppercase tracking-[0.14em]"
                    style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}>{c.tag}</p>
                </HoverCard>
              ))}
            </div>
          </div>

          {/* Right: role access table */}
          <div className="flex flex-col gap-3">
            <p className="mb-1 text-[0.65rem] uppercase tracking-[0.28em]"
              style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}>
              Role access
            </p>
            {ROLES.map((r) => (
              <RevealItem key={r.role} variant="card">
                <div
                  className="rounded-[1.5rem] border p-4"
                  style={{ border: `1px solid ${r.color}28`, background: r.bg }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold tracking-tight text-[0.95rem]"
                          style={{ fontFamily: "var(--font-jakarta)", color: "var(--tray-ink)" }}>
                          {r.role}
                        </span>
                        <span className="rounded-full px-2.5 py-0.5 text-[0.58rem] uppercase tracking-[0.16em]"
                          style={{ fontFamily: "var(--font-dm-mono)", background: `${r.color}18`, color: r.color }}>
                          {r.scope}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[0.82rem] leading-[1.5] opacity-65"
                        style={{ fontFamily: "var(--font-geist)" }}>
                        {r.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </RevealItem>
            ))}
          </div>
        </div>
      </div>
    </SectionReveal>
  );
}
