import React from "react";
import Link from "next/link";
import type { ResolvedTenant } from "@/lib/tenant";
import { TrayHero }             from "@/components/landing/sections/TrayHero";
import { CampusTicker }         from "@/components/landing/sections/MetricsAndTicker";
import { PiranhaPortalsSection } from "@/components/landing/sections/PiranhaPortalsSection";
import { CampusModelSection }    from "@/components/landing/sections/CampusModelSection";
import { TryDemoSection }        from "@/components/landing/sections/TryDemoSection";
import { StudioSandbox }        from "@/components/landing/sections/StudioSandbox";
import { LandingIntro }          from "@/components/landing/LandingIntro";
import { LandingMotion }         from "@/components/landing/landing-motion";
import { DesignerCustomizer }    from "@/components/landing/DesignerCustomizer";
import {
  AnimatedNav,
  SectionReveal,
  RevealItem,
  HoverCard,
  SyncPipelineVisual,
  MotionCTA,
  CountUp,
  ScrollProgress,
} from "@/lib/motion/tray-framer";

// ── Brand wordmark ────────────────────────────────────────────────────────────
function BrandMark() {
  return (
    <Link href="/" className="flex items-center gap-2 group" aria-label="Tray home">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--tray-ink)] font-editorial text-[13px] font-black text-[var(--tray-cream)] transition group-hover:scale-105">
        T
      </span>
      <span className="font-editorial text-xl font-black tracking-[-0.06em]">
        Tray
      </span>
    </Link>
  );
}

// ── Landing page ─────────────────────────────────────────────────────────────
export function LandingPage({ tenant }: { tenant: ResolvedTenant | null }) {
  const campusName = tenant?.college_name ?? null;

  return (
    <div className="tray-landing tray-page min-h-svh overflow-x-hidden" style={{ fontFamily: "var(--font-ui)" }}>
      <ScrollProgress />
      <LandingIntro />
      <LandingMotion />

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <input type="checkbox" id="tl-ham" className="sr-only peer" aria-hidden />

      <AnimatedNav
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" } as React.CSSProperties}
      >
      <header>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:px-10">
          <BrandMark />

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
            {[
              ["Product",  "#portals"],
              ["Campus",   "#campus"],
              ["Stack",    "#stack"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="font-code text-xs uppercase tracking-[0.2em] text-[var(--tray-muted)] transition hover:text-[var(--tray-ink)]"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Right: sign in + single demo CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="font-code text-xs uppercase tracking-[0.2em] text-[var(--tray-muted)] transition hover:text-[var(--tray-ink)]"
            >
              Sign in
            </Link>
            <a
              href="#try-demo"
              className="rounded-full bg-[var(--tray-ink)] px-5 py-2.5 text-sm font-semibold text-[var(--tray-cream)] transition hover:opacity-85"
            >
              Demo →
            </a>
          </div>

          {/* Mobile hamburger */}
          <label
            htmlFor="tl-ham"
            className="flex h-9 w-9 cursor-pointer flex-col items-center justify-center gap-[5px] lg:hidden"
            aria-label="Open menu"
          >
            <span className="h-0.5 w-5 rounded-full bg-[var(--tray-ink)] transition-transform peer-checked:rotate-45 peer-checked:translate-y-1.5" />
            <span className="h-0.5 w-5 rounded-full bg-[var(--tray-ink)] transition-opacity peer-checked:opacity-0" />
            <span className="h-0.5 w-5 rounded-full bg-[var(--tray-ink)] transition-transform peer-checked:-rotate-45 peer-checked:-translate-y-1.5" />
          </label>
        </div>

        {/* Mobile sheet */}
        <div className="hidden max-h-0 overflow-hidden transition-all peer-checked:block peer-checked:max-h-screen border-t border-[var(--tray-border)] bg-[var(--tray-bg)] lg:hidden">
          <nav className="flex flex-col gap-1 px-5 py-4" aria-label="Mobile navigation">
            {[
              ["Product",  "#portals"],
              ["Campus",   "#campus"],
              ["Stack",    "#stack"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="rounded-xl px-3 py-3 font-code text-xs uppercase tracking-[0.2em] text-[var(--tray-muted)] transition hover:bg-[var(--tray-surface)] hover:text-[var(--tray-ink)]"
              >
                {label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-[var(--tray-border)] pt-4">
              <Link
                href="/login"
                className="rounded-xl px-3 py-3 text-sm font-medium transition hover:bg-[var(--tray-surface)]"
              >
                Sign in
              </Link>
              <a
                href="#try-demo"
                className="rounded-xl bg-[var(--tray-ink)] px-3 py-3 text-center text-sm font-semibold text-[var(--tray-cream)]"
              >
                Demo →
              </a>
            </div>
          </nav>
        </div>
      </header>
      </AnimatedNav>

      {/* ── PAGE SECTIONS ────────────────────────────────────────────── */}
      <main id="main">
        {/* Problem statement strip — hooks any visitor in 3 seconds */}
        <div
          className="border-b border-[var(--tray-border)] px-5 py-3 sm:px-8 sm:py-3.5 lg:px-10"
          style={{ background: "var(--tray-ink)", color: "var(--tray-cream, #EDE5D2)" }}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 overflow-hidden">
            <p
              className="text-[0.65rem] uppercase tracking-[0.22em] opacity-55 hidden sm:block shrink-0"
              style={{ fontFamily: "var(--font-dm-mono)" }}
            >
              Campus Edition
            </p>
            <p
              className="text-[0.65rem] uppercase tracking-[0.22em] opacity-55 min-w-0"
              style={{ fontFamily: "var(--font-dm-mono)" }}
            >
              12 min saved per lunch · UPI native · OTP verified · live queue
            </p>
            <span
              className="hidden items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.22em] lg:flex shrink-0"
              style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-clay, #B8531A)" }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
              Kitchen open
            </span>
          </div>
        </div>

        <TrayHero />
        <CampusTicker />
        <StudioSandbox />
        <PiranhaPortalsSection />
        <CampusModelSection campusName={campusName} />

        {/* ── REALTIME SYNC — animated pipeline visual ─────────────── */}
        <SectionReveal id="sync" className="px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <RevealItem>
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <p className="text-xs uppercase tracking-[0.34em]"
                  style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}>
                  02 / Realtime
                </p>
                <span
                  className="rounded border border-[var(--tray-border)] bg-[var(--tray-surface)] px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.2em]"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    color: "var(--tray-clay)",
                  }}
                >
                  Specimen: CORMORANT GARAMOND + GEIST SANS
                </span>
              </div>
            </RevealItem>

            <RevealItem>
              <h2
                className="max-w-5xl leading-[0.85] tracking-[-0.04em]"
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontStyle: "italic",
                  fontSize: "clamp(3.8rem, 10vw, 9.5rem)",
                  color: "var(--tray-ink)",
                }}
              >
                Add a special.{" "}
                <span className="not-italic block sm:inline mt-2 sm:mt-0" style={{ fontFamily: "var(--font-barlow)", fontWeight: 900, textTransform: "uppercase", color: "var(--tray-clay)", letterSpacing: "-0.05em" }}>
                  Watch it land everywhere.
                </span>
              </h2>
            </RevealItem>

            <RevealItem>
              <p className="mt-6 max-w-lg text-[1.05rem] leading-[1.75] opacity-65"
                style={{ fontFamily: "var(--font-geist)" }}>
                The kitchen adds a dish — it appears on every student phone in under 300 ms.
                One source of truth, three portals, no refresh.
              </p>
            </RevealItem>

            {/* Animated sync pipeline */}
            <RevealItem variant="card">
              <SyncPipelineVisual className="mt-12" />
            </RevealItem>
          </div>
        </SectionReveal>

        {/* ── KITCHEN QUOTE — Cormorant Garamond for romantic serif feel ── */}
        <section
          className="px-5 py-24 sm:px-8 lg:px-10"
          style={{ background: "var(--tray-ink)", color: "var(--tray-cream, #EDE5D2)" }}
        >
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 flex flex-wrap items-center gap-3">
              <p
                className="text-[0.62rem] uppercase tracking-[0.3em] opacity-40"
                style={{ fontFamily: "var(--font-dm-mono)" }}
              >
                From the kitchen
              </p>
              <span
                className="rounded border border-white/10 bg-white/5 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.2em]"
                style={{
                  fontFamily: "var(--font-manrope)",
                  color: "var(--tray-clay)",
                }}
              >
                Specimen: DM SERIF + MANROPE
              </span>
            </div>
            {/* DM Serif Display — bold and striking serif */}
            <blockquote
              className="leading-[1.08] tracking-[-0.03em]"
              style={{
                fontFamily: "var(--font-dm-serif)",
                fontWeight: 600,
                fontStyle: "italic",
                fontSize: "clamp(2.8rem, 7vw, 6.5rem)",
              }}
            >
              &ldquo;We stopped shouting over the crowd.
              The board calls the order;
              they show a code.{" "}
              <span style={{ color: "var(--tray-clay)" }}>Lunch</span>
              {" "}ends on time.&rdquo;
            </blockquote>
            <footer
              className="mt-8 text-[0.65rem] uppercase tracking-[0.26em] opacity-40"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              — Kitchen supervisor · Campus canteen
            </footer>
          </div>
        </section>

        {/* ── PHONE TO PLATE (5 steps) — Fraunces numbers, Jakarta titles ── */}
        <SectionReveal id="flow" as="div" className="px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <p
                className="text-xs uppercase tracking-[0.3em]"
                style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}
              >03 / How it works</p>
              <span
                className="rounded border border-[var(--tray-border)] bg-[var(--tray-surface)] px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.2em]"
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  color: "var(--tray-clay)",
                }}
              >
                Specimen: NEWSREADER + GEIST SANS
              </span>
            </div>
            {/* Newsreader for editorial section heads */}
            <h2
              className="leading-[0.88] tracking-[-0.04em]"
              style={{ fontFamily: "var(--font-newsreader)", fontWeight: 600, fontSize: "clamp(3rem,7vw,7rem)" }}
            >
              Phone to plate,<br />
              <em style={{ fontStyle: "italic", color: "var(--tray-clay)" }}>in eleven minutes.</em>
            </h2>
            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {([
                ["01", "Choose canteen",  "Browse active canteens on your campus.",            "SELECTING"],
                ["02", "Browse menu",     "Live availability, prep times, veg/non-veg.",       "CART"],
                ["03", "Pay by UPI",      "Single-use QR. Webhook confirms in seconds.",       "PAID"],
                ["04", "Track live",      "Queued → preparing → ready in ~250 ms.",            "PREPARING"],
                ["05", "Collect w/ OTP",  "Four-digit code at counter. Staff marks complete.", "CLOSED"],
              ] as const).map(([num, title, desc, tag]) => (
                <div key={num} className="flex flex-col gap-3 rounded-[1.5rem] border p-5"
                  style={{ border: "1px solid var(--tray-border)", background: "rgba(255,255,255,0.52)" }}>
                  {/* Newsreader for step numbers */}
                  <span
                    className="leading-none tracking-[-0.04em]"
                    style={{ fontFamily: "var(--font-newsreader)", fontWeight: 600, fontSize: "3rem", color: "var(--tray-clay)" }}
                  >{num}</span>
                  {/* Newsreader for step titles */}
                  <h3
                    className="text-[1.05rem] tracking-tight"
                    style={{ fontFamily: "var(--font-newsreader)", fontWeight: 600 }}
                  >{title}</h3>
                  <p
                    className="flex-1 text-[0.88rem] leading-6 opacity-65"
                    style={{ fontFamily: "var(--font-geist)" }}
                  >{desc}</p>
                  <span
                    className="mt-auto self-start rounded-full border px-3 py-1 text-[0.6rem] uppercase tracking-[0.16em]"
                    style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)", border: "1px solid var(--tray-border)" }}
                  >{tag}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionReveal>

        {/* ── STACK — Plus Jakarta Sans for clean tech feel ─────────── */}
        <SectionReveal id="stack" as="div" className="px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <p
                className="text-xs uppercase tracking-[0.3em]"
                style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}
              >04 / Built with</p>
              <span
                className="rounded border border-[var(--tray-border)] bg-[var(--tray-surface)] px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.2em]"
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  color: "var(--tray-clay)",
                }}
              >
                Specimen: SPACE GROTESK + JETBRAINS MONO
              </span>
            </div>
            <h2
              className="leading-[0.88] tracking-[-0.04em]"
              style={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 700, fontSize: "clamp(2.8rem,6.5vw,6.5rem)" }}
            >
              A boring stack,<br />
              <span style={{ color: "var(--tray-clay)" }}>on purpose.</span>
            </h2>
            <p
              className="mt-6 max-w-xl text-[1.05rem] leading-8 opacity-70"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Everything runs on a free tier until you have real users. No exotic infra. No lock-in surprises.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {([
                ["Next.js 15",        "Framework · App Router"],
                ["TypeScript",        "Language · strict mode"],
                ["Tailwind v4",       "Styling · design tokens"],
                ["Supabase",          "DB · Auth · Realtime"],
                ["Postgres + RLS",    "Data · multi-tenant"],
                ["Razorpay",          "Payments · UPI"],
                ["Vercel Edge",       "Hosting · CDN"],
                ["Supabase Realtime", "Live · WebSocket"],
              ] as const).map(([name, role]) => (
                <HoverCard
                  key={name}
                  className="rounded-[1.25rem] border p-4"
                  style={{ border: "1px solid var(--tray-border)", background: "rgba(255,255,255,0.52)" }}
                >
                  <p className="tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 600 }}>{name}</p>
                  <p className="mt-1.5 text-[0.6rem] uppercase tracking-[0.14em]" style={{ fontFamily: "var(--font-jetbrains)", color: "var(--tray-muted)" }}>{role}</p>
                </HoverCard>
              ))}
            </div>
          </div>
        </SectionReveal>

        <TryDemoSection />

        {/* ── REALTIME HOOK — compact strip above closing CTA ──────── */}
        <div className="px-5 py-12 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div
              className="flex flex-wrap items-center justify-center gap-6 rounded-[1.75rem] border px-8 py-6 sm:gap-10"
              style={{
                border: "1px solid var(--tray-border)",
                background: "rgba(255,255,255,0.38)",
                backdropFilter: "blur(12px)",
              }}
            >
              <span
                className="flex items-center gap-2.5 text-[0.7rem] uppercase tracking-[0.22em]"
                style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}
              >
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--tray-clay)" }} />
                Kitchen pushes update
              </span>

              <span
                className="text-[0.6rem] uppercase tracking-[0.2em] opacity-30"
                style={{ fontFamily: "var(--font-dm-mono)" }}
              >
                ——
              </span>

              <span
                className="leading-none tracking-[-0.04em]"
                style={{
                  fontFamily: "var(--font-barlow)",
                  fontWeight: 900,
                  fontSize: "clamp(2rem, 4vw, 3.2rem)",
                  color: "var(--tray-clay)",
                }}
              >
                ~240ms
              </span>

              <span
                className="text-[0.6rem] uppercase tracking-[0.2em] opacity-30"
                style={{ fontFamily: "var(--font-dm-mono)" }}
              >
                ——
              </span>

              <span
                className="flex items-center gap-2.5 text-[0.7rem] uppercase tracking-[0.22em]"
                style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}
              >
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--tray-green, #2A6E3A)" }} />
                Every portal · no refresh
              </span>
            </div>
          </div>
        </div>

        {/* ── CLOSING CTA ───────────────────────────────────────────── */}
        <SectionReveal as="div" id="closing" className="relative overflow-hidden px-5 py-32 text-center sm:px-8 lg:px-10 tl-closing">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-[var(--tray-clay)]/15 blur-3xl" />
          </div>
          <RevealItem>
            <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
              <p className="text-xs uppercase tracking-[0.3em]" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}>
                Ship it
              </p>
              <span
                className="rounded border border-[var(--tray-border)] bg-[var(--tray-surface)] px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.2em]"
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  color: "var(--tray-clay)",
                }}
              >
                Specimen: THUNDER + FRAUNCES ITALIC
              </span>
            </div>
          </RevealItem>
          <RevealItem>
            <h2
              className="mx-auto max-w-5xl leading-[0.82] tracking-[-0.02em]"
              style={{ fontFamily: "var(--font-barlow)", fontWeight: 900, fontSize: "clamp(3.5rem, 9.5vw, 10.5rem)", textTransform: "uppercase" }}
            >
              Run lunch{" "}
              <em className="not-italic" style={{ fontFamily: "var(--font-fraunces)", fontStyle: "italic", textTransform: "none", color: "var(--tray-clay)" }}>
                without the rush.
              </em>
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="mx-auto mt-7 max-w-2xl text-[1.05rem] leading-8 opacity-70" style={{ fontFamily: "var(--font-geist)" }}>
              Three screens. Zero printed tokens. Every order tracked, every payment confirmed,
              every handover verified. Deploy on a free tier and go live today.
            </p>
          </RevealItem>
          <RevealItem>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <MotionCTA
                href="#try-demo"
                variant="primary"
                className="rounded-full bg-[var(--tray-ink)] px-8 py-4 text-sm font-semibold text-[var(--tray-cream)]"
                style={{ fontFamily: "var(--font-geist)" } as React.CSSProperties}
              >
                Try full demo
              </MotionCTA>
              <MotionCTA
                href="/get-started"
                variant="secondary"
                className="rounded-full border border-[var(--tray-border)] px-8 py-4 text-sm font-semibold"
                style={{ fontFamily: "var(--font-geist)" } as React.CSSProperties}
              >
                I have a canteen
              </MotionCTA>
            </div>
          </RevealItem>
        </SectionReveal>
      </main>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer
        className="relative overflow-hidden border-t border-[var(--tray-border)] px-5 pb-8 pt-12 sm:px-8 lg:px-10"
        style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
      >
        {/* Ghost TRAY watermark — bottom-right, sized so it clears the footer links */}
        <div
          className="pointer-events-none absolute bottom-0 right-0 select-none"
          style={{ overflow: "hidden" }}
        >
          <span
            style={{
              fontFamily: "var(--font-barlow)",
              fontWeight: 900,
              fontSize: "clamp(4.5rem, 10vw, 9rem)",
              lineHeight: 0.82,
              letterSpacing: "-0.06em",
              textTransform: "uppercase",
              color: "var(--tray-ink)",
              opacity: 0.045,
              display: "block",
              paddingRight: "clamp(1.5rem, 4vw, 4rem)",
              paddingBottom: "clamp(1.5rem, 3vw, 3rem)",
            }}
          >
            TRAY
          </span>
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="relative z-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
            {/* Brand */}
            <div>
              <BrandMark />
              <p
                className="mt-4 max-w-xs text-[0.9rem] leading-7 opacity-60"
                style={{ fontFamily: "var(--font-geist)" }}
              >
                A campus canteen ordering system. Multi-tenant, source-available, built for India.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="font-code mb-4 text-[0.65rem] uppercase tracking-[0.22em] text-[var(--tray-muted)]">Product</p>
              <ul className="flex flex-col gap-2.5 text-sm">
                {[
                  ["Student app",   "/menu"],
                  ["Kitchen view",  "/kitchen"],
                  ["Admin console", "/admin/dashboard"],
                  ["Get started",   "/get-started"],
                ].map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="opacity-65 transition hover:opacity-100">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <p className="font-code mb-4 text-[0.65rem] uppercase tracking-[0.22em] text-[var(--tray-muted)]">Resources</p>
              <ul className="flex flex-col gap-2.5 text-sm">
                {[
                  ["README",       "https://github.com/thribhuvan003/Tray/blob/main/README.md"],
                  ["Architecture", "https://github.com/thribhuvan003/Tray/tree/main/docs/adr"],
                  ["Security",     "https://github.com/thribhuvan003/Tray/blob/main/SECURITY.md"],
                ].map(([label, href]) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noreferrer" className="opacity-65 transition hover:opacity-100">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="font-code mb-4 text-[0.65rem] uppercase tracking-[0.22em] text-[var(--tray-muted)]">Contact</p>
              <a
                href="https://github.com/thribhuvan003"
                target="_blank"
                rel="noreferrer"
                className="text-sm opacity-65 transition hover:opacity-100"
              >
                github.com/thribhuvan003
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="relative z-10 mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--tray-border)] pt-6">
            <p
              className="text-[0.62rem] uppercase tracking-[0.2em] opacity-45"
              style={{ fontFamily: "var(--font-dm-mono)" }}
            >
              Built for campus canteens · Made in India
            </p>
            <p
              className="text-[0.62rem] uppercase tracking-[0.2em] opacity-45"
              style={{ fontFamily: "var(--font-dm-mono)" }}
            >
              v3.0 · 2026
            </p>
          </div>
        </div>
      </footer>
      <DesignerCustomizer />
    </div>
  );
}
