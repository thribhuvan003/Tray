import Link from "next/link";
import type { ResolvedTenant } from "@/lib/tenant";
import { TrayHero }             from "@/components/landing/sections/TrayHero";
import { MetricsStrip, CampusTicker } from "@/components/landing/sections/MetricsAndTicker";
import { PiranhaPortalsSection } from "@/components/landing/sections/PiranhaPortalsSection";
import { CampusModelSection }    from "@/components/landing/sections/CampusModelSection";
import { TryDemoSection }        from "@/components/landing/sections/TryDemoSection";

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
    <div className="tray-page min-h-svh overflow-x-hidden" style={{ fontFamily: "var(--font-ui)" }}>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      {/*
          Pure-CSS hamburger: hidden checkbox controls mobile sheet.
          Desktop: links visible, hamburger hidden.
          One "Demo" CTA — scrolls to #try-demo. Sign in is separate.
      */}
      <input type="checkbox" id="tl-ham" className="sr-only peer" aria-hidden />

      <header className="sticky top-0 z-50 border-b border-[var(--tray-border)] bg-[var(--tray-bg)]/85 backdrop-blur-xl"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
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

      {/* ── PAGE SECTIONS ────────────────────────────────────────────── */}
      <main id="main">
        <TrayHero />
        <MetricsStrip />
        <CampusTicker />
        <PiranhaPortalsSection />
        <CampusModelSection campusName={campusName} />

        {/* ── REALTIME SYNC — Barlow Condensed title ─────────────────── */}
        <section id="sync" className="px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <p
              className="mb-4 text-xs uppercase tracking-[0.3em]"
              style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}
            >
              02 / Realtime
            </p>
            {/* Barlow Condensed for technical section titles */}
            <h2
              className="max-w-3xl leading-[0.82] tracking-[-0.02em]"
              style={{
                fontFamily: "var(--font-barlow)",
                fontWeight: 900,
                fontSize: "clamp(3rem, 7.5vw, 7.5rem)",
                textTransform: "uppercase",
              }}
            >
              Add a special.{" "}
              <em
                className="not-italic"
                style={{ fontFamily: "var(--font-fraunces)", fontStyle: "italic", textTransform: "none", color: "var(--tray-clay)" }}
              >
                Watch it land everywhere.
              </em>
            </h2>
            <p
              className="mt-6 max-w-xl text-[1.05rem] leading-8 opacity-70"
              style={{ fontFamily: "var(--font-geist)" }}
            >
              The kitchen adds a dish — it appears on every student phone in under 300 ms.
              One source of truth, three windows, no refresh.
            </p>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {([
                ["SOURCE",  "Kitchen pushes update",         "POST /api/menu · RLS-enforced"],
                ["FAN OUT", "Supabase Realtime broadcasts",  "~240 ms · WebSocket · p95"],
                ["AUDIT",   "Admin sees the log row",        "menu.add · tenant-scoped"],
              ] as const).map(([label, title, meta]) => (
                <div key={label} className="rounded-[1.5rem] border p-5"
                  style={{ border: "1px solid var(--tray-border)", background: "rgba(255,255,255,0.52)" }}>
                  <p
                    className="mb-3 text-[0.65rem] uppercase tracking-[0.24em]"
                    style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-clay)" }}
                  >{label}</p>
                  <p
                    className="text-[1rem] tracking-tight"
                    style={{ fontFamily: "var(--font-jakarta)", fontWeight: 600 }}
                  >{title}</p>
                  <p
                    className="mt-2 text-[0.62rem] uppercase tracking-[0.14em]"
                    style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}
                  >{meta}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── KITCHEN QUOTE — Cormorant Garamond for romantic serif feel ── */}
        <section
          className="px-5 py-24 sm:px-8 lg:px-10"
          style={{ background: "var(--tray-ink)", color: "var(--tray-cream, #EDE5D2)" }}
        >
          <div className="mx-auto max-w-5xl">
            <p
              className="mb-10 text-[0.62rem] uppercase tracking-[0.3em] opacity-40"
              style={{ fontFamily: "var(--font-dm-mono)" }}
            >
              From the kitchen
            </p>
            {/* Cormorant Garamond — romantic Italian serif, ideal for quotes */}
            <blockquote
              className="leading-[1.08] tracking-[-0.03em]"
              style={{
                fontFamily: "var(--font-cormorant)",
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
              style={{ fontFamily: "var(--font-dm-mono)" }}
            >
              — Kitchen supervisor · Campus canteen
            </footer>
          </div>
        </section>

        {/* ── PHONE TO PLATE (5 steps) — Fraunces numbers, Jakarta titles ── */}
        <section id="flow" className="px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <p
              className="mb-4 text-xs uppercase tracking-[0.3em]"
              style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}
            >03 / How it works</p>
            {/* Fraunces for editorial section heads */}
            <h2
              className="leading-[0.88] tracking-[-0.06em]"
              style={{ fontFamily: "var(--font-fraunces)", fontWeight: 900, fontSize: "clamp(3rem,7vw,7rem)" }}
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
                  {/* Fraunces Black for step numbers */}
                  <span
                    className="leading-none tracking-[-0.06em]"
                    style={{ fontFamily: "var(--font-fraunces)", fontWeight: 900, fontSize: "3rem", color: "var(--tray-clay)" }}
                  >{num}</span>
                  {/* Plus Jakarta Sans Semibold for step titles */}
                  <h3
                    className="text-[1.05rem] tracking-tight"
                    style={{ fontFamily: "var(--font-jakarta)", fontWeight: 700 }}
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
        </section>

        {/* ── STACK — Plus Jakarta Sans for clean tech feel ─────────── */}
        <section id="stack" className="px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <p
              className="mb-4 text-xs uppercase tracking-[0.3em]"
              style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}
            >04 / Built with</p>
            <h2
              className="leading-[0.88] tracking-[-0.04em]"
              style={{ fontFamily: "var(--font-jakarta)", fontWeight: 800, fontSize: "clamp(2.8rem,6.5vw,6.5rem)" }}
            >
              A boring stack,<br />
              <span style={{ color: "var(--tray-clay)" }}>on purpose.</span>
            </h2>
            <p
              className="mt-6 max-w-xl text-[1.05rem] leading-8 opacity-70"
              style={{ fontFamily: "var(--font-geist)" }}
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
                <div key={name} className="rounded-[1.25rem] border p-4"
                  style={{ border: "1px solid var(--tray-border)", background: "rgba(255,255,255,0.52)" }}>
                  <p
                    className="tracking-tight"
                    style={{ fontFamily: "var(--font-jakarta)", fontWeight: 600 }}
                  >{name}</p>
                  <p
                    className="mt-1.5 text-[0.6rem] uppercase tracking-[0.14em]"
                    style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}
                  >{role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <TryDemoSection />

        {/* ── CLOSING CTA ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden px-5 py-32 text-center sm:px-8 lg:px-10">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-[var(--tray-clay)]/15 blur-3xl" />
          </div>
          <p
            className="mb-5 text-xs uppercase tracking-[0.3em]"
            style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-muted)" }}
          >
            Ship it
          </p>
          {/* Barlow Condensed 900 — maximum final impact */}
          <h2
            className="mx-auto max-w-5xl leading-[0.82] tracking-[-0.02em]"
            style={{
              fontFamily: "var(--font-barlow)",
              fontWeight: 900,
              fontSize: "clamp(3.5rem, 9.5vw, 10.5rem)",
              textTransform: "uppercase",
            }}
          >
            Run lunch{" "}
            <em
              className="not-italic"
              style={{ fontFamily: "var(--font-fraunces)", fontStyle: "italic", textTransform: "none", color: "var(--tray-clay)" }}
            >
              without the rush.
            </em>
          </h2>
          <p
            className="mx-auto mt-7 max-w-xl text-[1.05rem] leading-8 opacity-70"
            style={{ fontFamily: "var(--font-geist)" }}
          >
            Three screens. One lunch service. Built for campus canteens tired of printed tokens.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a href="#try-demo" className="rounded-full bg-[var(--tray-ink)] px-8 py-4 text-sm font-semibold text-[var(--tray-cream)] transition hover:opacity-85">
              Try full demo →
            </a>
            <Link href="/get-started" className="rounded-full border border-[var(--tray-border)] px-8 py-4 text-sm font-semibold transition hover:bg-white/30">
              Set up my campus — free
            </Link>
          </div>

          {/* Ghost TRAY watermark */}
          <div
            className="tray-ghost-word pointer-events-none mt-16 select-none text-[clamp(8rem,28vw,28rem)]"
            aria-hidden
          >
            TRAY
          </div>
        </section>
      </main>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer
        className="border-t border-[var(--tray-border)] px-5 pb-8 pt-12 sm:px-8 lg:px-10"
        style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
            {/* Brand */}
            <div>
              <BrandMark />
              <p className="mt-4 max-w-xs text-sm leading-7 opacity-60">
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
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--tray-border)] pt-6">
            <p className="font-code text-[0.62rem] uppercase tracking-[0.2em] opacity-45">
              Built for campus canteens · Made in India
            </p>
            <p className="font-code text-[0.62rem] uppercase tracking-[0.2em] opacity-45">
              v3.0 · 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
