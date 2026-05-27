"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionReveal, RevealItem } from "@/lib/motion/tray-framer";

const CANTEENS = [
  {
    id: 0,
    name: "Main Canteen",
    icon: "🍽️",
    tag: "Ground floor · North block",
    color: "#2E80EF",
    badge: "ACTIVE",
    bgLight: "rgba(46,128,239,0.06)",
  },
  {
    id: 1,
    name: "Hostel Mess",
    icon: "🏠",
    tag: "Residential block",
    color: "#B8531A",
    badge: "ACTIVE",
    bgLight: "rgba(184,83,26,0.06)",
  },
  {
    id: 2,
    name: "North Block",
    icon: "🏛️",
    tag: "Academic wing",
    color: "#16A34A",
    badge: "ACTIVE",
    bgLight: "rgba(22,163,74,0.06)",
  },
  {
    id: 3,
    name: "Night Canteen",
    icon: "🌙",
    tag: "Open till 11 pm",
    color: "#D97706",
    badge: "LATE NIGHT",
    bgLight: "rgba(217,119,6,0.06)",
  },
] as const;

const ROLES = [
  {
    id: 0,
    role: "Student",
    scope: "All active canteens",
    color: "#2E80EF",
    bg: "rgba(46,128,239,0.03)",
    border: "rgba(46,128,239,0.12)",
    desc: "Browse every canteen on campus, order with UPI, track live prep status, and collect with a 4-digit OTP.",
  },
  {
    id: 1,
    role: "Kitchen staff",
    scope: "Assigned canteen only",
    color: "#B8531A",
    bg: "rgba(184,83,26,0.03)",
    border: "rgba(184,83,26,0.12)",
    desc: "Manage the live preparation queue. See and process tickets for their counter only, eliminating confusion.",
  },
  {
    id: 2,
    role: "Canteen admin",
    scope: "One canteen — full control",
    color: "#16A34A",
    bg: "rgba(22,163,74,0.03)",
    border: "rgba(22,163,74,0.12)",
    desc: "Configure menus, adjust pricing, manage counter staff, and audit live daily sales for their specific outlet.",
  },
  {
    id: 3,
    role: "Campus admin",
    scope: "Whole campus — analytics",
    color: "#D97706",
    bg: "rgba(217,119,6,0.03)",
    border: "rgba(217,119,6,0.12)",
    desc: "Cross-canteen reporting, total revenue rollup, campus-wide staff permissions, and central performance metrics.",
  },
] as const;

const ROLE_ACCESS_MAP: Record<number, readonly number[]> = {
  0: [0, 1, 2, 3],
  1: [0],
  2: [1],
  3: [0, 1, 2, 3],
} as const;

const CANTEEN_ACCESS_MAP: Record<number, readonly number[]> = {
  0: [0, 1, 2, 3],
  1: [0, 2, 3],
  2: [0, 3],
  3: [0, 3],
} as const;

export function CampusModelSection({ campusName }: { campusName?: string | null }) {
  const [hoveredRole, setHoveredRole] = useState<number | null>(null);
  const [hoveredCanteen, setHoveredCanteen] = useState<number | null>(null);

  const isAnyHovered = hoveredRole !== null || hoveredCanteen !== null;

  const isCanteenActive = (cIdx: number) => {
    if (hoveredCanteen === cIdx) return true;
    if (hoveredRole !== null) {
      return ROLE_ACCESS_MAP[hoveredRole].includes(cIdx);
    }
    return !isAnyHovered;
  };

  const isCanteenDimmed = (cIdx: number) => {
    if (hoveredCanteen !== null && hoveredCanteen !== cIdx) return true;
    if (hoveredRole !== null && !ROLE_ACCESS_MAP[hoveredRole].includes(cIdx)) return true;
    return false;
  };

  const isRoleActive = (rIdx: number) => {
    if (hoveredRole === rIdx) return true;
    if (hoveredCanteen !== null) {
      return CANTEEN_ACCESS_MAP[hoveredCanteen].includes(rIdx);
    }
    return !isAnyHovered;
  };

  const isRoleDimmed = (rIdx: number) => {
    if (hoveredRole !== null && hoveredRole !== rIdx) return true;
    if (hoveredCanteen !== null && !CANTEEN_ACCESS_MAP[hoveredCanteen].includes(rIdx)) return true;
    return false;
  };

  return (
    <SectionReveal as="div" id="campus" className="px-4 pt-16 pb-14 sm:px-8 sm:pt-24 sm:pb-20 lg:px-10 bg-[#FAF8F5] lg:min-h-screen lg:flex lg:flex-col lg:justify-center lg:py-24">
      <motion.div className="mx-auto max-w-7xl">
        {/* Heading panel */}
        <div className="max-w-4xl mb-8 sm:mb-16">
          <RevealItem>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="font-code text-[0.72rem] font-bold uppercase tracking-[0.24em] text-neutral-400">
                02 / Campus Edition
              </span>
            </div>
          </RevealItem>

          <RevealItem>
            <h2
              className="leading-[0.85] tracking-[-0.03em] uppercase mb-8"
              style={{
                fontFamily: "var(--font-barlow)",
                fontWeight: 900,
                fontSize: "clamp(3rem, 7.5vw, 6.5rem)",
                color: "var(--tray-ink, #1A1619)",
              }}
            >
              One campus. <br className="sm:hidden" />
              <span
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontStyle: "italic",
                  textTransform: "none",
                  fontWeight: 400,
                  color: "var(--tray-clay, #B8531A)",
                }}
              >
                Many counters.
              </span>
            </h2>
          </RevealItem>

          <RevealItem>
            <p
              className="max-w-2xl text-[1.1rem] leading-8 text-neutral-600"
              style={{ fontFamily: "var(--font-geist)" }}
            >
              Every canteen on campus in one system. Students see everything.
              Staff see only their counter. Admins manage their canteen.
              No overlap, no confusion, no wrong orders.
            </p>
          </RevealItem>
        </div>

        {/* 2-Column Split Directory layout */}
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          {/* Left Column: Campus Hub (Canteen Cards) */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5d8]">
              <span
                className="text-[0.68rem] font-code font-bold uppercase tracking-[0.24em] text-neutral-400"
                style={{ fontFamily: "var(--font-dm-mono)" }}
              >
                {campusName || "Aditya Engineering College"} · active canteens
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CANTEENS.map((c) => {
                const active = isCanteenActive(c.id);
                const dimmed = isCanteenDimmed(c.id);

                return (
                  <motion.div
                    key={c.name}
                    onMouseEnter={() => setHoveredCanteen(c.id)}
                    onMouseLeave={() => setHoveredCanteen(null)}
                    animate={{
                      y: active && isAnyHovered ? -6 : 0,
                      scale: active && isAnyHovered ? 1.02 : 1,
                      opacity: dimmed ? 0.35 : 1,
                      borderColor: active && isAnyHovered ? c.color : "var(--tray-border, #e5e5d8)",
                      boxShadow: active && isAnyHovered
                        ? `0 16px 36px -12px ${c.color}28, 0 4px 12px rgba(0,0,0,0.02)`
                        : "0 4px 12px rgba(26,22,25,0.01)",
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="relative rounded-[2rem] border bg-white p-6 cursor-pointer select-none overflow-hidden group flex flex-col justify-between min-h-[170px]"
                    style={{ borderStyle: "solid", borderWidth: "1px" }}
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        background: `radial-gradient(120px circle at 50% 120px, ${c.color}08, transparent 80%)`,
                      }}
                    />

                    <div className="flex items-start justify-between z-10">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: c.bgLight }}
                      >
                        {c.icon}
                      </div>
                      <span
                        className="rounded-full px-2.5 py-1 text-[0.55rem] font-code font-bold uppercase tracking-widest border"
                        style={{
                          borderColor: active && isAnyHovered ? `${c.color}30` : "var(--tray-border, #e5e5d8)",
                          color: active && isAnyHovered ? c.color : "var(--tray-muted, #737373)",
                          backgroundColor: active && isAnyHovered ? `${c.color}08` : "transparent",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {c.badge}
                      </span>
                    </div>

                    <div className="mt-6 z-10">
                      <h3
                        className="text-lg font-bold tracking-tight text-[var(--tray-ink, #1A1619)]"
                        style={{ fontFamily: "var(--font-jakarta)" }}
                      >
                        {c.name}
                      </h3>
                      <p
                        className="mt-1.5 text-[0.72rem] uppercase tracking-[0.12em] text-neutral-400 font-medium"
                        style={{ fontFamily: "var(--font-dm-mono)" }}
                      >
                        {c.tag}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Roles & Visibility */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center pb-3 border-b border-[#e5e5d8]">
              <span
                className="text-[0.68rem] font-code font-bold uppercase tracking-[0.24em] text-neutral-400"
                style={{ fontFamily: "var(--font-dm-mono)" }}
              >
                system role access mapping
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {ROLES.map((r) => {
                const active = isRoleActive(r.id);
                const dimmed = isRoleDimmed(r.id);

                return (
                  <RevealItem key={r.role} variant="card">
                    <motion.div
                      onMouseEnter={() => setHoveredRole(r.id)}
                      onMouseLeave={() => setHoveredRole(null)}
                      animate={{
                        x: active && isAnyHovered ? 8 : 0,
                        opacity: dimmed ? 0.35 : 1,
                        borderColor: active && isAnyHovered ? r.color : "rgba(229,229,216,0.5)",
                        boxShadow: active && isAnyHovered
                          ? `0 12px 28px -8px ${r.color}15`
                          : "none",
                        backgroundColor: active && isAnyHovered ? r.bg : "rgba(255, 255, 255, 0.4)",
                      }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className="rounded-[1.75rem] border p-6 cursor-pointer select-none relative overflow-hidden"
                      style={{ borderStyle: "solid", borderWidth: "1px" }}
                    >
                      <div
                        className="absolute left-0 top-0 bottom-0 w-[4px]"
                        style={{
                          backgroundColor: r.color,
                          opacity: active ? 1 : 0.2,
                          transition: "opacity 0.3s ease",
                        }}
                      />

                      <div className="flex flex-col gap-2.5 z-10 pl-2">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <span
                            className="font-bold tracking-tight text-base"
                            style={{ fontFamily: "var(--font-jakarta)", color: "var(--tray-ink, #1A1619)" }}
                          >
                            {r.role}
                          </span>
                          <span
                            className="rounded-full px-3 py-1 text-[0.62rem] font-code font-bold uppercase tracking-[0.14em] border"
                            style={{
                              borderColor: r.border,
                              color: r.color,
                              backgroundColor: r.bg,
                            }}
                          >
                            {r.scope}
                          </span>
                        </div>
                        <p
                          className="text-[0.88rem] leading-[1.6] text-neutral-600"
                          style={{ fontFamily: "var(--font-geist)" }}
                        >
                          {r.desc}
                        </p>
                      </div>
                    </motion.div>
                  </RevealItem>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </SectionReveal>
  );
}
