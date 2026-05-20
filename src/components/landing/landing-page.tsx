import Link from "next/link";
import type { ResolvedTenant } from "@/lib/tenant";
import { LandingLineLeave } from "@/components/landing/landing-line-leave";
import { LandingMotion } from "@/components/landing/landing-motion";

// Pre-Monsoon Dusk — sky slate + bone + amber accent. Instrument Serif headlines.
// Scoped to .tray-landing only; student/kitchen/admin portals stay separate.

const SCOPED_CSS = `
.tray-landing {
  --tl-bg: #0a0f1a;
  --tl-bg-2: #121a2e;
  --tl-bg-3: #182240;
  --tl-bg-4: #223058;
  --tl-line: rgba(232, 228, 220, 0.09);
  --tl-line-2: rgba(232, 228, 220, 0.17);
  --tl-ink: #ece8e0;
  --tl-ink-2: rgba(236, 232, 224, 0.76);
  --tl-ink-3: rgba(236, 232, 224, 0.5);
  --tl-ink-4: rgba(236, 232, 224, 0.3);
  --tl-accent: #d4b896;
  --tl-accent-cool: #8eb8ff;
  --tl-persimmon: #d4b896;
  /* Portal rims — aligned with public/demo (student sky, kitchen tomato, admin lime) */
  --tl-student: #5cb1ff;
  --tl-kitchen: #d52821;
  --tl-admin: #cdfa50;
  --tl-good: #6dd4a0;
  --tl-section-glow: rgba(212, 184, 150, 0.12);

  /* Type scale — display / Manrope body / Geist Mono labels */
  --tl-display: var(--font-instrument-serif), ui-serif, Georgia;
  --tl-sans: var(--font-manrope), var(--font-geist), var(--font-inter), ui-sans-serif, system-ui;
  --tl-mono: var(--font-geist-mono), var(--font-jetbrains), ui-monospace, Menlo, monospace;
  --tl-size-2xs: 0.8125rem;
  --tl-size-xs: 0.875rem;
  --tl-size-sm: 1rem;
  --tl-size-base: 1.125rem;
  --tl-size-md: 1.25rem;
  --tl-size-lg: 1.375rem;

  background: linear-gradient(165deg, #0a0f1a 0%, #10182b 42%, #141f38 100%);
  color: var(--tl-ink);
  font-family: var(--tl-sans);
  font-feature-settings: "ss01", "kern";
  font-size: var(--tl-size-base);
  line-height: 1.62;
  letter-spacing: -0.01em;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  min-height: 100vh;
}
.tray-landing ::selection { background: var(--tl-persimmon); color: var(--tl-bg); }
.tray-landing .tl-serif { font-family: var(--font-instrument-serif), ui-serif, Georgia; font-weight: 400; }
.tray-landing .tl-italic { font-family: var(--font-instrument-serif), ui-serif, Georgia; font-style: italic; font-weight: 400; }
.tray-landing .tl-mono { font-family: var(--font-geist-mono), var(--font-jetbrains), ui-monospace, Menlo, monospace; font-feature-settings: "ss01"; }

.tray-landing .tl-grain {
  position: fixed; inset: -30%; pointer-events: none; z-index: 1; opacity: .045; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.tray-landing .tl-ambient { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.tray-landing .tl-orb {
  position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.55;
  will-change: transform;
}
.tray-landing .tl-orb-a {
  width: min(52vw, 520px); height: min(52vw, 520px);
  left: -12%; top: 8%;
  background: radial-gradient(circle, rgba(126, 184, 255, 0.22) 0%, transparent 68%);
}
.tray-landing .tl-orb-b {
  width: min(44vw, 440px); height: min(44vw, 440px);
  right: -8%; top: 42%;
  background: radial-gradient(circle, rgba(212, 184, 150, 0.18) 0%, transparent 70%);
}
.tray-landing .tl-orb-c {
  width: min(36vw, 360px); height: min(36vw, 360px);
  left: 38%; bottom: -8%;
  background: radial-gradient(circle, rgba(109, 212, 160, 0.12) 0%, transparent 72%);
  opacity: 0.4;
}

.tray-landing .tl-wrap { max-width: 1280px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 2; }
@media (min-width: 768px) { .tray-landing .tl-wrap { padding: 0 56px; } }

/* Nav */
.tray-landing .tl-nav {
  position: sticky; top: 0; z-index: 50;
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  background: rgba(13, 18, 32, 0.82);
  border-bottom: 1px solid var(--tl-line);
  transition: background .25s ease, box-shadow .25s ease, border-color .25s ease;
}
.tray-landing .tl-nav-inner {
  max-width: 1280px; margin: 0 auto; padding: 12px 20px;
  display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 12px 16px;
  min-height: 56px;
}
@media (min-width: 768px) { .tray-landing .tl-nav-inner { padding: 12px 56px; } }
@media (min-width: 900px) {
  .tray-landing .tl-nav-inner {
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    gap: 20px 32px;
  }
}
.tray-landing .tl-scroll-progress { position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 60; background: linear-gradient(90deg, var(--tl-student) 0%, var(--tl-accent) 55%, var(--tl-kitchen) 100%); transform: scaleX(0); transform-origin: 0% 50%; pointer-events: none; }
.tray-landing .tl-nav.is-scrolled { background: rgba(13, 18, 32, 0.94); border-bottom-color: var(--tl-line-2); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.28); }
.tray-landing .tl-nav.is-scrolled .tl-nav-inner { padding-top: 8px; padding-bottom: 8px; min-height: 52px; }
.tray-landing .tl-brand { font-family: var(--tl-display); font-size: clamp(1.5rem, 4vw, 1.75rem); letter-spacing: -0.03em; font-weight: 400; color: var(--tl-ink); text-decoration: none; white-space: nowrap; justify-self: start; line-height: 1; }
.tray-landing .tl-brand:hover { color: #fff; }
.tray-landing .tl-nav-links { display: none; gap: 28px; font-size: var(--tl-size-sm); font-weight: 500; color: var(--tl-ink-2); align-items: center; justify-self: center; }
@media (min-width: 900px) { .tray-landing .tl-nav-links { display: flex; } }
.tray-landing .tl-nav-links a { white-space: nowrap; }
.tray-landing .tl-nav-links a:hover { color: var(--tl-ink); }
.tray-landing .tl-nav-cta { display: flex; gap: 8px; align-items: center; justify-self: end; flex-shrink: 0; }
@media (min-width: 480px) { .tray-landing .tl-nav-cta { gap: 10px; } }
.tray-landing .tl-nav-cta .tl-btn { padding: 9px 16px; font-size: var(--tl-size-xs); }
@media (min-width: 480px) { .tray-landing .tl-nav-cta .tl-btn { padding: 11px 20px; font-size: var(--tl-size-sm); } }

.tray-landing .tl-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 11px 20px; border-radius: 999px; font-size: var(--tl-size-sm); font-weight: 600; border: 1px solid transparent; transition: background .15s, color .15s, border-color .15s, box-shadow .2s; line-height: 1.2; font-family: inherit; cursor: pointer; will-change: transform; }
.tray-landing .tl-btn-pri { background: var(--tl-ink); color: var(--tl-bg); border-color: var(--tl-ink); box-shadow: 0 0 0 0 rgba(236, 232, 224, 0); }
.tray-landing .tl-btn-pri:hover { background: #fff; box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35); }
.tray-landing .tl-btn-ghost { color: var(--tl-ink); background: rgba(255, 255, 255, 0.02); border-color: var(--tl-line-2); }
.tray-landing .tl-btn-ghost:hover { background: rgba(255, 255, 255, .06); border-color: var(--tl-accent-cool); color: #fff; }
.tray-landing .tl-btn-lg { padding: 15px 26px; font-size: var(--tl-size-base); }

.tray-landing a:focus { outline: none; }
.tray-landing a:focus-visible,
.tray-landing .tl-btn:focus-visible {
  outline: 2px solid var(--tl-accent);
  outline-offset: 3px;
}

.tray-landing .tl-skip {
  position: absolute;
  left: -9999px;
  top: 12px;
  z-index: 100;
  padding: 10px 16px;
  background: var(--tl-ink);
  color: var(--tl-bg);
  border-radius: 8px;
  font-size: var(--tl-size-sm);
  font-weight: 600;
}
.tray-landing .tl-skip:focus {
  left: 12px;
}

/* Hero */
.tray-landing .tl-hero { padding: 80px 0 64px; position: relative; }
@media (min-width: 768px) { .tray-landing .tl-hero { padding: 96px 0 80px; } }
.tray-landing .tl-hero-glow { position: absolute; left: 50%; top: -220px; width: min(1100px, 120vw); height: 900px; border-radius: 50%; background: radial-gradient(ellipse at center, rgba(126, 184, 255, 0.2) 0%, rgba(212, 184, 150, 0.12) 38%, transparent 70%); transform: translateX(-50%); pointer-events: none; z-index: 0; will-change: transform; }
.tray-landing .tl-hero > :not(.tl-hero-glow) { position: relative; z-index: 1; }
.tray-landing .tl-h1 {
  display: flex; flex-direction: column; gap: 0.08em; max-width: none; line-height: 1.04;
  font-family: var(--tl-display); font-weight: 400;
  font-size: clamp(3rem, 9.5vw, 8.25rem); letter-spacing: -0.025em; margin: 0 0 40px;
  text-wrap: balance;
}
.tray-landing .tl-h1-line { display: flex; flex-wrap: wrap; align-items: baseline; column-gap: 0.26em; row-gap: 0.04em; }
.tray-landing .tl-h1 .tl-word { display: inline-block; transform-origin: 50% 100%; white-space: nowrap; }
.tray-landing .tl-h1 .tl-it { font-style: italic; color: var(--tl-persimmon); }
.tray-landing [data-reveal] { will-change: transform, opacity; }
.tray-landing #system, .tray-landing #sync, .tray-landing #where, .tray-landing #flow, .tray-landing #stack { scroll-margin-top: 88px; }
@media (prefers-reduced-motion: reduce) {
  .tray-landing [data-reveal], .tray-landing .tl-h1 .tl-word { opacity: 1 !important; transform: none !important; }
  .tray-landing .tl-orb { display: none; }
  .tray-landing .tl-browser-chrome { transform: none !important; }
}
.tray-landing.tl-anim-init .tl-hero-top,
.tray-landing.tl-anim-init .tl-h1 .tl-word,
.tray-landing.tl-anim-init .tl-hero-lede,
.tray-landing.tl-anim-init .tl-hero-cta .tl-row,
.tray-landing.tl-anim-init .tl-note,
.tray-landing.tl-anim-init .tl-hero-stat { opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .tray-landing.tl-anim-init .tl-hero-top,
  .tray-landing.tl-anim-init .tl-h1 .tl-word,
  .tray-landing.tl-anim-init .tl-hero-lede,
  .tray-landing.tl-anim-init .tl-hero-cta .tl-row,
  .tray-landing.tl-anim-init .tl-note,
  .tray-landing.tl-anim-init .tl-hero-stat { opacity: 1; }
}
.tray-landing .tl-ticker { overflow: hidden; border-block: 1px solid var(--tl-line); background: rgba(20, 29, 56, 0.55); position: relative; z-index: 2; mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }
.tray-landing .tl-ticker-track { display: flex; width: max-content; animation: tlTicker 42s linear infinite; }
.tray-landing .tl-ticker:hover .tl-ticker-track { animation-play-state: paused; }
.tray-landing .tl-ticker-item { flex-shrink: 0; padding: 16px 32px; font-family: var(--tl-mono); font-size: var(--tl-size-2xs); letter-spacing: 0.1em; text-transform: uppercase; color: var(--tl-ink-3); white-space: nowrap; }
.tray-landing .tl-ticker-item em { font-style: normal; color: var(--tl-accent); font-weight: 600; }
@keyframes tlTicker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) {
  .tray-landing .tl-ticker-track { animation: none; flex-wrap: wrap; width: 100%; justify-content: center; }
}
.tray-landing .tl-hero-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; font-family: var(--tl-mono); font-size: var(--tl-size-2xs); letter-spacing: 0.14em; text-transform: uppercase; color: var(--tl-ink-3); padding-bottom: 28px; border-bottom: 1px solid var(--tl-line); margin-bottom: 44px; font-weight: 600; flex-wrap: wrap; }
.tray-landing .tl-hero-top .tl-l, .tray-landing .tl-hero-top .tl-r { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.tray-landing .tl-live { display: inline-flex; align-items: center; gap: 8px; color: var(--tl-good); text-transform: none; letter-spacing: 0.02em; font-family: var(--tl-sans); font-weight: 600; font-size: var(--tl-size-xs); }
.tray-landing .tl-live .tl-d { width: 7px; height: 7px; border-radius: 50%; background: var(--tl-good); animation: tlLive 2s infinite; }
@keyframes tlLive { 0% { box-shadow: 0 0 0 0 rgba(124, 199, 136, 0.5); } 70% { box-shadow: 0 0 0 8px rgba(124, 199, 136, 0); } 100% { box-shadow: 0 0 0 0 rgba(124, 199, 136, 0); } }

.tray-landing .tl-hero-meta { display: grid; grid-template-columns: 1fr; gap: 32px; align-items: flex-end; margin-bottom: 48px; }
@media (min-width: 960px) { .tray-landing .tl-hero-meta { grid-template-columns: 1.2fr 1fr; gap: 64px; } }
.tray-landing .tl-hero-lede { font-size: var(--tl-size-md); line-height: 1.58; color: var(--tl-ink-2); max-width: 46ch; font-weight: 400; }
@media (min-width: 768px) { .tray-landing .tl-hero-lede { font-size: var(--tl-size-lg); line-height: 1.55; } }
.tray-landing .tl-hero-lede .tl-em { color: var(--tl-ink); font-weight: 600; }
.tray-landing .tl-hero-cta { display: flex; flex-direction: column; gap: 14px; align-items: flex-start; }
@media (min-width: 960px) { .tray-landing .tl-hero-cta { align-items: flex-end; } }
.tray-landing .tl-hero-cta .tl-row { display: flex; gap: 12px; flex-wrap: wrap; }
.tray-landing .tl-hero-cta .tl-note { font-family: var(--tl-mono); font-size: var(--tl-size-2xs); color: var(--tl-ink-3); letter-spacing: 0.1em; text-align: left; font-weight: 600; }
@media (min-width: 960px) { .tray-landing .tl-hero-cta .tl-note { text-align: right; } }

.tray-landing .tl-hero-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0; padding: 24px 0 0; border-top: 1px solid var(--tl-line); }
@media (min-width: 768px) { .tray-landing .tl-hero-stats { grid-template-columns: repeat(4, 1fr); padding-top: 32px; } }
.tray-landing .tl-hero-stat { padding: 16px 16px 16px 0; border-right: 1px solid var(--tl-line); display: flex; flex-direction: column; gap: 4px; }
@media (min-width: 768px) { .tray-landing .tl-hero-stat { padding: 0 24px 0 0; } .tray-landing .tl-hero-stat:not(:first-child) { padding-left: 24px; } }
.tray-landing .tl-hero-stat:nth-child(2n) { border-right: 0; }
@media (min-width: 768px) { .tray-landing .tl-hero-stat:nth-child(2n) { border-right: 1px solid var(--tl-line); } .tray-landing .tl-hero-stat:last-child { border-right: 0; } }
.tray-landing .tl-hero-stat .tl-v { font-family: var(--tl-display); font-size: clamp(2rem, 5vw, 3rem); letter-spacing: -0.025em; line-height: 1; font-weight: 400; }
.tray-landing .tl-hero-stat .tl-v .tl-it { font-style: italic; color: var(--tl-persimmon); }
.tray-landing .tl-hero-stat .tl-l { font-family: var(--tl-mono); font-size: var(--tl-size-2xs); letter-spacing: 0.12em; text-transform: uppercase; color: var(--tl-ink-3); font-weight: 600; line-height: 1.35; }

/* Section heads */
.tray-landing .tl-section { padding: 80px 0; position: relative; }
@media (min-width: 768px) { .tray-landing .tl-section { padding: 120px 0; } }
.tray-landing .tl-section::before,
.tray-landing .tl-sync::before {
  content: ""; position: absolute; left: 50%; top: 0; width: min(900px, 100%); height: 320px;
  transform: translateX(-50%); pointer-events: none; z-index: 0;
  background: radial-gradient(ellipse 70% 80% at 50% 0%, var(--tl-section-glow), transparent 72%);
}
.tray-landing #system { --tl-section-glow: rgba(126, 184, 255, 0.14); }
.tray-landing .tl-sync { --tl-section-glow: rgba(212, 184, 150, 0.14); }
.tray-landing #where { --tl-section-glow: rgba(184, 232, 106, 0.1); }
.tray-landing .tl-pull { --tl-section-glow: rgba(212, 184, 150, 0.16); }
.tray-landing #flow { --tl-section-glow: rgba(213, 40, 33, 0.1); }
.tray-landing #stack { --tl-section-glow: rgba(142, 184, 255, 0.11); }
.tray-landing .tl-pull { position: relative; }
.tray-landing .tl-pull::before {
  content: ""; position: absolute; inset: 0; pointer-events: none; z-index: 0;
  background: radial-gradient(ellipse 80% 60% at 50% 50%, var(--tl-section-glow), transparent 70%);
}
.tray-landing .tl-pull > * { position: relative; z-index: 1; }
.tray-landing .tl-section > .tl-wrap,
.tray-landing .tl-sync > .tl-wrap { position: relative; z-index: 1; }
.tray-landing .tl-section-num { font-family: var(--tl-mono); font-size: var(--tl-size-2xs); letter-spacing: 0.14em; text-transform: uppercase; color: var(--tl-ink-3); display: flex; align-items: center; gap: 10px; margin-bottom: 20px; font-weight: 600; }
.tray-landing .tl-section-num .tl-bar { width: 24px; height: 1px; background: var(--tl-ink-4); }
.tray-landing .tl-section-num .tl-num { color: var(--tl-persimmon); font-weight: 600; }
.tray-landing .tl-section-head { display: grid; grid-template-columns: 1fr; gap: 32px; align-items: flex-end; margin-bottom: 40px; }
@media (min-width: 900px) { .tray-landing .tl-section-head { grid-template-columns: 1.3fr 1fr; gap: 80px; margin-bottom: 56px; } }
.tray-landing .tl-section-head h2 { margin: 0; font-family: var(--tl-display); font-weight: 400; font-size: clamp(2.5rem, 7vw, 6rem); letter-spacing: -0.03em; line-height: 0.94; text-wrap: balance; }
.tray-landing .tl-section-head h2 .tl-it { font-style: italic; color: var(--tl-persimmon); }
.tray-landing .tl-section-head .tl-side { color: var(--tl-ink-2); max-width: 42ch; font-size: var(--tl-size-base); line-height: 1.62; }
@media (min-width: 768px) { .tray-landing .tl-section-head .tl-side { font-size: var(--tl-size-md); } }

/* Portal preview cards */
.tray-landing .tl-portals { display: grid; grid-template-columns: 1fr; gap: 18px; }
@media (min-width: 720px) { .tray-landing .tl-portals { grid-template-columns: repeat(3, 1fr); } }
.tray-landing .tl-portal { background: var(--tl-bg-2); border: 1px solid var(--tl-line); border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; position: relative; transition: transform .25s, border-color .2s, box-shadow .25s; transform-style: preserve-3d; }
@media (hover: hover) {
  .tray-landing .tl-portal:hover { transform: translateY(-6px); border-color: var(--tl-ink-4); box-shadow: 0 24px 56px rgba(0, 0, 0, .45); }
  .tray-landing .tl-portal[data-c="student"]:hover { border-top: 2px solid var(--tl-student); }
  .tray-landing .tl-portal[data-c="kitchen"]:hover { border-top: 2px solid var(--tl-kitchen); }
  .tray-landing .tl-portal[data-c="admin"]:hover { border-top: 2px solid var(--tl-admin); }
}
.tray-landing .tl-portal-head { padding: 22px 24px 14px; display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; border-bottom: 1px solid var(--tl-line); }
.tray-landing .tl-portal-head .tl-ix { font-family: var(--tl-mono); font-size: var(--tl-size-2xs); letter-spacing: 0.12em; text-transform: uppercase; color: var(--tl-ink-3); font-weight: 600; }
.tray-landing .tl-portal-head h3 { font-family: var(--tl-display); font-size: 1.875rem; letter-spacing: -0.025em; margin: 6px 0 0; font-weight: 400; line-height: 1.05; }
@media (min-width: 768px) { .tray-landing .tl-portal-head h3 { font-size: 2rem; } }
.tray-landing .tl-portal-head h3 .tl-it { font-style: italic; }
.tray-landing .tl-portal-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 6px; }
.tray-landing .tl-portal[data-c="student"] .tl-portal-dot { background: var(--tl-student); box-shadow: 0 0 14px var(--tl-student); }
.tray-landing .tl-portal[data-c="kitchen"] .tl-portal-dot { background: var(--tl-kitchen); box-shadow: 0 0 14px var(--tl-kitchen); }
.tray-landing .tl-portal[data-c="admin"] .tl-portal-dot { background: var(--tl-admin); box-shadow: 0 0 14px var(--tl-admin); }
.tray-landing .tl-portal[data-c="student"] .tl-portal-head h3 .tl-it { color: var(--tl-student); }
.tray-landing .tl-portal[data-c="kitchen"] .tl-portal-head h3 .tl-it { color: var(--tl-kitchen); }
.tray-landing .tl-portal[data-c="admin"] .tl-portal-head h3 .tl-it { color: var(--tl-admin); }

.tray-landing .tl-portal-frame { position: relative; height: 280px; overflow: hidden; background: var(--tl-bg-3); border-bottom: 1px solid var(--tl-line); transform-style: preserve-3d; will-change: transform; }
@media (min-width: 720px) { .tray-landing .tl-portal-frame { height: 420px; } }
.tray-landing .tl-browser-chrome { display: flex; flex-direction: column; height: 100%; background: #0a0e18; }
.tray-landing .tl-browser-bar { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-bottom: 1px solid var(--tl-line); background: rgba(10, 14, 24, 0.95); flex-shrink: 0; z-index: 4; }
.tray-landing .tl-browser-dots { display: flex; gap: 6px; }
.tray-landing .tl-browser-dots span { width: 9px; height: 9px; border-radius: 50%; background: var(--tl-ink-4); }
.tray-landing .tl-browser-dots span:nth-child(1) { background: #ff5f57; }
.tray-landing .tl-browser-dots span:nth-child(2) { background: #febc2e; }
.tray-landing .tl-browser-dots span:nth-child(3) { background: #28c840; }
.tray-landing .tl-browser-url { flex: 1; font-family: var(--tl-mono); font-size: var(--tl-size-2xs); color: var(--tl-ink-3); background: var(--tl-bg-3); border: 1px solid var(--tl-line); border-radius: 6px; padding: 6px 12px; letter-spacing: 0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tray-landing .tl-browser-viewport { position: relative; flex: 1; min-height: 0; overflow: hidden; }
.tray-landing .tl-portal-frame iframe { position: absolute; top: 0; left: 0; width: 200%; height: 200%; transform: scale(0.5); transform-origin: 0 0; border: 0; pointer-events: none; background: var(--tl-bg-3); }
.tray-landing .tl-portal-frame .tl-portal-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 55%, var(--tl-bg-2) 100%); pointer-events: none; z-index: 2; }
.tray-landing .tl-portal-frame .tl-device-tag { position: absolute; top: 52px; left: 14px; font-family: var(--tl-mono); font-size: var(--tl-size-2xs); letter-spacing: 0.1em; text-transform: uppercase; color: var(--tl-ink-3); background: rgba(14, 10, 6, 0.75); padding: 5px 11px; border-radius: 5px; font-weight: 600; z-index: 3; backdrop-filter: blur(6px); }

.tray-landing .tl-portal-body { padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 14px; }
.tray-landing .tl-portal-body p { color: var(--tl-ink-2); font-size: var(--tl-size-sm); line-height: 1.58; margin: 0; }
@media (min-width: 768px) { .tray-landing .tl-portal-body p { font-size: var(--tl-size-base); } }
.tray-landing .tl-feat-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.tray-landing .tl-feat-tag { padding: 5px 10px; background: var(--tl-bg-3); border: 1px solid var(--tl-line); border-radius: 5px; font-family: var(--tl-mono); font-size: var(--tl-size-xs); color: var(--tl-ink-2); font-weight: 600; letter-spacing: 0.04em; }
.tray-landing .tl-portal-open { display: flex; align-items: center; justify-content: space-between; padding: 13px 18px; background: var(--tl-bg-3); border: 1px solid var(--tl-line); border-radius: 10px; margin-top: auto; font-size: var(--tl-size-sm); font-weight: 600; transition: all .2s; color: var(--tl-ink); }
.tray-landing .tl-portal-open:hover { background: var(--tl-bg-4); border-color: var(--tl-ink-4); }
.tray-landing .tl-portal[data-c="student"] .tl-portal-open:hover { border-color: var(--tl-student); color: var(--tl-student); }
.tray-landing .tl-portal[data-c="kitchen"] .tl-portal-open:hover { border-color: var(--tl-kitchen); color: var(--tl-kitchen); }
.tray-landing .tl-portal[data-c="admin"] .tl-portal-open:hover { border-color: var(--tl-admin); color: var(--tl-admin); }
.tray-landing .tl-portal-open .tl-arrow { transition: transform .2s; }
.tray-landing .tl-portal-open:hover .tl-arrow { transform: translateX(4px); }

/* Sync section */
.tray-landing .tl-sync { padding: 96px 0; background: var(--tl-bg-2); border-top: 1px solid var(--tl-line); border-bottom: 1px solid var(--tl-line); position: relative; overflow: hidden; }
@media (min-width: 768px) { .tray-landing .tl-sync { padding: 140px 0; } }
.tray-landing .tl-sync-grid { display: grid; grid-template-columns: 1fr; gap: 48px; align-items: center; }
@media (min-width: 960px) { .tray-landing .tl-sync-grid { grid-template-columns: 1fr 1.4fr; gap: 64px; } }
.tray-landing .tl-sync-grid h2 { font-family: var(--tl-display); font-weight: 400; font-size: clamp(2.5rem, 7vw, 5.5rem); line-height: 0.95; letter-spacing: -0.03em; margin: 0 0 24px; }
.tray-landing .tl-sync-grid h2 .tl-it { font-style: italic; color: var(--tl-persimmon); }
.tray-landing .tl-sync-grid .tl-lede { font-size: var(--tl-size-md); line-height: 1.6; color: var(--tl-ink-2); margin: 0 0 24px; max-width: 42ch; }
@media (min-width: 768px) { .tray-landing .tl-sync-grid .tl-lede { font-size: var(--tl-size-lg); } }
.tray-landing .tl-sync-meta { display: flex; flex-direction: column; gap: 10px; font-family: var(--tl-mono); font-size: var(--tl-size-xs); color: var(--tl-ink-2); font-weight: 600; }
.tray-landing .tl-sync-meta .tl-row { display: flex; align-items: center; gap: 14px; }
.tray-landing .tl-sync-meta .tl-k { color: var(--tl-persimmon); width: 70px; flex-shrink: 0; }

.tray-landing .tl-diagram { background: var(--tl-bg-3); border: 1px solid var(--tl-line); border-radius: 18px; padding: 24px; position: relative; display: flex; flex-direction: column; gap: 14px; overflow: hidden; }
@media (min-width: 768px) { .tray-landing .tl-diagram { padding: 32px; gap: 18px; } }
.tray-landing .tl-node { padding: 14px 18px; background: var(--tl-bg-2); border: 1px solid var(--tl-line); border-radius: 12px; display: flex; align-items: center; gap: 14px; position: relative; transition: transform .2s; }
.tray-landing .tl-node .tl-ic { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: var(--tl-mono); font-weight: 700; font-size: var(--tl-size-sm); flex-shrink: 0; }
.tray-landing .tl-node .tl-info { flex: 1; min-width: 0; }
.tray-landing .tl-node .tl-info .tl-n { font-size: var(--tl-size-sm); font-weight: 600; }
.tray-landing .tl-node .tl-info .tl-d { font-family: var(--tl-mono); font-size: var(--tl-size-2xs); color: var(--tl-ink-3); letter-spacing: 0.04em; margin-top: 2px; }
.tray-landing .tl-node .tl-role { font-family: var(--tl-mono); font-size: var(--tl-size-xs); letter-spacing: 0.08em; font-weight: 600; text-transform: uppercase; padding: 4px 9px; border-radius: 5px; white-space: nowrap; }
.tray-landing .tl-node[data-c="kitchen"] .tl-ic, .tray-landing .tl-node[data-c="kitchen"] .tl-role { color: var(--tl-kitchen); background: rgba(213, 40, 33, 0.16); }
.tray-landing .tl-node[data-c="student"] .tl-ic, .tray-landing .tl-node[data-c="student"] .tl-role { color: var(--tl-student); background: rgba(92, 177, 255, 0.16); }
.tray-landing .tl-node[data-c="admin"] .tl-ic, .tray-landing .tl-node[data-c="admin"] .tl-role { color: var(--tl-admin); background: rgba(205, 250, 80, 0.16); }
.tray-landing .tl-node[data-c="db"] .tl-ic, .tray-landing .tl-node[data-c="db"] .tl-role { color: var(--tl-persimmon); background: rgba(239, 106, 58, 0.16); }
.tray-landing .tl-arr { display: flex; align-items: center; justify-content: center; gap: 12px; font-family: var(--tl-mono); font-size: var(--tl-size-xs); color: var(--tl-ink-3); letter-spacing: 0.04em; padding: 4px 0; font-weight: 600; }
.tray-landing .tl-arr .tl-line { height: 1px; background: var(--tl-line-2); flex: 1; }
.tray-landing .tl-arr .tl-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--tl-persimmon); box-shadow: 0 0 10px var(--tl-persimmon); animation: tlTravel 3s infinite; }
@keyframes tlTravel { 0%, 100% { opacity: .4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }

/* Pull quote */
.tray-landing .tl-pull { padding: 96px 0; text-align: center; }
@media (min-width: 768px) { .tray-landing .tl-pull { padding: 140px 0; } }
.tray-landing .tl-pull p { font-family: var(--tl-display); font-size: clamp(2.25rem, 6vw, 5.25rem); line-height: 1.05; letter-spacing: -0.025em; margin: 0 auto; max-width: 24ch; font-weight: 400; color: var(--tl-ink); }
.tray-landing .tl-pull p .tl-it { font-style: italic; color: var(--tl-persimmon); }
.tray-landing .tl-pull .tl-cite { margin-top: 32px; font-family: var(--tl-mono); font-size: var(--tl-size-xs); color: var(--tl-ink-3); letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; }

/* Flow */
.tray-landing .tl-flow { display: grid; grid-template-columns: 1fr; border: 1px solid var(--tl-line); border-radius: 18px; overflow: hidden; background: var(--tl-bg-2); }
@media (min-width: 720px) { .tray-landing .tl-flow { grid-template-columns: repeat(4, 1fr); } }
.tray-landing .tl-flow-step { padding: 28px 24px; border-bottom: 1px solid var(--tl-line); min-height: 220px; display: flex; flex-direction: column; gap: 12px; }
@media (min-width: 720px) { .tray-landing .tl-flow-step { padding: 32px 28px; border-bottom: 0; border-right: 1px solid var(--tl-line); min-height: 280px; gap: 14px; } .tray-landing .tl-flow-step:last-child { border-right: 0; } }
.tray-landing .tl-flow-step:last-child { border-bottom: 0; }
.tray-landing .tl-flow-step .tl-ix { font-family: var(--tl-mono); font-size: var(--tl-size-2xs); color: var(--tl-ink-3); letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; }
.tray-landing .tl-flow-step .tl-num { font-family: var(--tl-display); font-size: 4rem; letter-spacing: -0.03em; color: var(--tl-persimmon); line-height: .9; font-weight: 400; font-style: italic; margin: auto 0; }
@media (min-width: 768px) { .tray-landing .tl-flow-step .tl-num { font-size: 5rem; } }
.tray-landing .tl-flow-step h3 { font-family: var(--tl-display); font-size: 1.5rem; letter-spacing: -0.02em; margin: 0; font-weight: 400; line-height: 1.1; }
@media (min-width: 768px) { .tray-landing .tl-flow-step h3 { font-size: 1.625rem; } }
.tray-landing .tl-flow-step h3 .tl-it { font-style: italic; color: var(--tl-persimmon); }
.tray-landing .tl-flow-step p { color: var(--tl-ink-2); font-size: var(--tl-size-sm); line-height: 1.58; margin: 0; max-width: 32ch; }
@media (min-width: 768px) { .tray-landing .tl-flow-step p { font-size: var(--tl-size-base); } }
.tray-landing .tl-flow-step .tl-tag { margin-top: auto; font-family: var(--tl-mono); font-size: var(--tl-size-xs); color: var(--tl-ink-3); letter-spacing: 0.06em; text-transform: uppercase; font-weight: 600; }

/* Stack */
.tray-landing .tl-stack { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
@media (min-width: 720px) { .tray-landing .tl-stack { grid-template-columns: repeat(4, 1fr); } }
.tray-landing .tl-stack-card { padding: 20px; background: var(--tl-bg-2); border: 1px solid var(--tl-line); border-radius: 12px; display: flex; flex-direction: column; gap: 8px; transition: border-color .2s, background .2s, transform .25s ease, box-shadow .25s ease; }
.tray-landing .tl-stack-card:hover { border-color: var(--tl-line-2); background: var(--tl-bg-3); transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35); }
.tray-landing .tl-portal-frame { perspective: 1200px; }
.tray-landing .tl-browser-chrome { transform-style: preserve-3d; will-change: transform; }
.tray-landing .tl-stack-card .tl-n { font-weight: 600; font-size: var(--tl-size-sm); color: var(--tl-ink); }
@media (min-width: 768px) { .tray-landing .tl-stack-card .tl-n { font-size: var(--tl-size-base); } }
.tray-landing .tl-stack-card .tl-r { font-family: var(--tl-mono); font-size: var(--tl-size-2xs); color: var(--tl-ink-3); letter-spacing: 0.06em; font-weight: 600; }

/* Closing */
.tray-landing .tl-closing { padding: 120px 0; text-align: center; position: relative; overflow: hidden; border-top: 1px solid var(--tl-line); }
@media (min-width: 768px) { .tray-landing .tl-closing { padding: 180px 0; } }
.tray-landing .tl-closing::before { content: ""; position: absolute; left: 50%; top: 0; width: 800px; height: 400px; background: radial-gradient(ellipse at center top, rgba(196, 168, 130, 0.14), transparent 70%); transform: translateX(-50%); }
.tray-landing .tl-closing h2 { font-family: var(--tl-display); font-weight: 400; font-size: clamp(4rem, 12vw, 10rem); line-height: 0.92; letter-spacing: -0.04em; margin: 0 0 24px; color: var(--tl-ink); position: relative; z-index: 2; }
.tray-landing .tl-closing h2 .tl-it { font-style: italic; color: var(--tl-persimmon); }
.tray-landing .tl-closing p { color: var(--tl-ink-2); font-size: var(--tl-size-md); max-width: 48ch; margin: 0 auto 36px; position: relative; z-index: 2; padding: 0 16px; line-height: 1.58; }
@media (min-width: 768px) { .tray-landing .tl-closing p { font-size: var(--tl-size-lg); } }
.tray-landing .tl-closing .tl-cta-row { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; position: relative; z-index: 2; padding: 0 16px; }

/* Footer */
.tray-landing .tl-footer { padding: 56px 0 24px; border-top: 1px solid var(--tl-line); background: var(--tl-bg-2); }
@media (min-width: 768px) { .tray-landing .tl-footer { padding: 72px 0 32px; } }
.tray-landing .tl-footer-row1 { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 40px; }
@media (min-width: 768px) { .tray-landing .tl-footer-row1 { grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 56px; } }
.tray-landing .tl-footer h4 { font-family: var(--tl-mono); font-size: var(--tl-size-2xs); letter-spacing: 0.14em; text-transform: uppercase; color: var(--tl-ink-3); margin: 0 0 14px; font-weight: 600; }
.tray-landing .tl-footer .tl-links { display: flex; flex-direction: column; gap: 10px; font-size: var(--tl-size-sm); color: var(--tl-ink-2); }
.tray-landing .tl-footer .tl-links a:hover { color: var(--tl-ink); }
.tray-landing .tl-footer-tag { font-size: var(--tl-size-sm); color: var(--tl-ink-2); max-width: 32ch; line-height: 1.62; margin-top: 14px; }
@media (min-width: 768px) { .tray-landing .tl-footer-tag { font-size: var(--tl-size-base); } }
.tray-landing .tl-footer-mark { font-family: var(--tl-display); font-size: clamp(7.5rem, 22vw, 15rem); line-height: 0.86; letter-spacing: -0.04em; color: rgba(245, 239, 228, 0.04); text-align: center; font-weight: 400; user-select: none; margin: 32px 0 0; overflow: hidden; border-top: 1px solid var(--tl-line); padding-top: 24px; }
.tray-landing .tl-footer-mark .tl-it { font-style: italic; color: rgba(196, 168, 130, 0.14); }

.tray-landing .tl-line-leave { padding: 64px 0; position: relative; z-index: 2; }
.tray-landing .tl-line-leave-grid { display: grid; grid-template-columns: 1fr; gap: 28px; align-items: start; }
@media (min-width: 900px) { .tray-landing .tl-line-leave-grid { grid-template-columns: 1.1fr 1fr; gap: 48px; } }
.tray-landing .tl-line-leave-title { font-family: var(--tl-display); font-size: clamp(2rem, 5vw, 3rem); letter-spacing: -0.03em; margin: 0 0 12px; font-weight: 400; line-height: 1.05; }
.tray-landing .tl-line-leave-title .tl-it { font-style: italic; color: var(--tl-persimmon); }
.tray-landing .tl-line-leave-lede { color: var(--tl-ink-2); font-size: var(--tl-size-base); line-height: 1.58; margin: 0; max-width: 42ch; }
@media (min-width: 768px) { .tray-landing .tl-line-leave-lede { font-size: var(--tl-size-md); } }
.tray-landing .tl-line-leave-panel { display: flex; flex-direction: column; gap: 10px; padding: 20px; border-radius: 16px; border: 1px solid var(--tl-line); background: var(--tl-bg-2); }
.tray-landing .tl-line-chip { text-align: left; padding: 14px 18px; border-radius: 12px; border: 1px solid var(--tl-line); background: var(--tl-bg-3); font-size: var(--tl-size-sm); font-weight: 600; transition: border-color .2s, background .2s, transform .15s; }
@media (min-width: 768px) { .tray-landing .tl-line-chip { font-size: var(--tl-size-base); } }
.tray-landing .tl-line-chip:hover { border-color: var(--tl-ink-4); }
.tray-landing .tl-line-chip.is-on { border-color: rgba(196, 168, 130, 0.55); background: rgba(196, 168, 130, 0.12); color: var(--tl-ink); }
.tray-landing .tl-line-chip:focus-visible { outline: 2px solid var(--tl-accent); outline-offset: 2px; }
.tray-landing .tl-nav-links a { transition: color .15s; position: relative; }
.tray-landing .tl-nav-links a::after { content: ""; position: absolute; left: 0; right: 0; bottom: -4px; height: 1px; background: var(--tl-accent); transform: scaleX(0); transition: transform .2s ease; }
.tray-landing .tl-nav-links a:hover::after,
.tray-landing .tl-nav-links a.is-active::after { transform: scaleX(1); }
.tray-landing .tl-nav-links a.is-active { color: var(--tl-ink); }
.tray-landing .tl-line-hint { margin: 8px 2px 0; font-size: var(--tl-size-sm); line-height: 1.55; color: var(--tl-ink-2); min-height: 3em; transition: opacity .28s ease, transform .28s ease; }
.tray-landing .tl-line-hint.is-fading { opacity: 0; transform: translateY(6px); }
.tray-landing .tl-hero-stat .tl-stat-num { font-variant-numeric: tabular-nums; }
@media (min-width: 768px) { .tray-landing .tl-line-hint { font-size: var(--tl-size-base); } }
.tray-landing .tl-footer-bot { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; align-items: center; padding-top: 24px; font-family: var(--tl-mono); font-size: var(--tl-size-2xs); color: var(--tl-ink-4); letter-spacing: 0.08em; font-weight: 600; }
`;

function BrandMark() {
  return (
    <Link href="/" className="tl-brand">
      Tray
    </Link>
  );
}

function PortalPreview({ src, title, url }: { src: string; title: string; url: string }) {
  return (
    <div className="tl-browser-chrome">
      <div className="tl-browser-bar" aria-hidden>
        <div className="tl-browser-dots">
          <span />
          <span />
          <span />
        </div>
        <span className="tl-browser-url">{url}</span>
      </div>
      <div className="tl-browser-viewport">
        <iframe
          src={src}
          title={title}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
          scrolling="no"
        />
        <span className="tl-portal-overlay" />
      </div>
    </div>
  );
}

const TICKER_ITEMS = [
  "Hostel mess · 47 orders live",
  "Night canteen · queue 3 min",
  "Sports cafe · specials updated",
  "UPI confirmed · avg 8s",
  "OTP verified · handover 12:04",
  "Kitchen SLA · 94% on time",
  "Multi-canteen · one campus",
  "Realtime sync · 240ms p95",
] as const;

function HeroLine({ words, italicFrom }: { words: string[]; italicFrom?: number }) {
  return (
    <span className="tl-h1-line">
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className={italicFrom !== undefined && i >= italicFrom ? "tl-word tl-it" : "tl-word"}>
          {w}
        </span>
      ))}
    </span>
  );
}

export function LandingPage({ tenant }: { tenant: ResolvedTenant | null }) {
  void tenant;
  const tickerDoubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="tray-landing">
      <style dangerouslySetInnerHTML={{ __html: SCOPED_CSS }} />
      <div className="tl-grain" />
      <div className="tl-ambient" aria-hidden>
        <span className="tl-orb tl-orb-a" />
        <span className="tl-orb tl-orb-b" />
        <span className="tl-orb tl-orb-c" />
      </div>
      <div className="tl-scroll-progress" aria-hidden />
      <LandingMotion />
      <a href="#main" className="tl-skip">
        Skip to content
      </a>

      <nav className="tl-nav">
        <div className="tl-nav-inner">
          <BrandMark />
          <div className="tl-nav-links">
            <a href="#system">System</a>
            <a href="#flow">How it works</a>
          </div>
          <div className="tl-nav-cta">
            <Link href="/login" className="tl-btn tl-btn-ghost">Sign in</Link>
            <a href="/demo/index.html" className="tl-btn tl-btn-pri">Demo</a>
          </div>
        </div>
      </nav>

      <main id="main">
      <section className="tl-hero tl-wrap">
        <div className="tl-hero-glow" aria-hidden />
        <div className="tl-hero-top">
          <div className="tl-l">
            <span>TRAY · v3.0</span>
            <span style={{ color: "var(--tl-ink-4)" }}>/</span>
            <span>CAMPUS EDITION</span>
          </div>
          <div className="tl-r">
            <span className="tl-live"><span className="tl-d" />Kitchen open</span>
          </div>
        </div>
        <h1 className="tl-h1">
          <HeroLine words={["A", "canteen", "system"]} />
          <HeroLine words={["for", "the", "whole", "campus."]} italicFrom={2} />
        </h1>
        <div className="tl-hero-meta">
          <p className="tl-hero-lede">
            Tray replaces the printed-token queue with a phone-first ordering system.{" "}
            <span className="tl-em">Students choose dine-in or takeaway, pay on phone, then walk to handover.</span>{" "}
            The kitchen sees a live queue. Pickup is verified with a four-digit code. One system, three portals, every metric in real time.
          </p>
          <div className="tl-hero-cta">
            <div className="tl-row">
              <a href="/demo/index.html" className="tl-btn tl-btn-pri tl-btn-lg">Try the live demo →</a>
              <a href="#system" className="tl-btn tl-btn-ghost tl-btn-lg">See the system</a>
            </div>
            <div className="tl-note">DEMO IS LIVE · NO SIGN-UP · 90-SECOND TOUR</div>
          </div>
        </div>
        <div className="tl-hero-stats">
          <div className="tl-hero-stat" data-count="12"><div className="tl-v"><span className="tl-stat-num">12</span><span className="tl-it">min</span></div><div className="tl-l">Saved per lunch</div></div>
          <div className="tl-hero-stat" data-count="3"><div className="tl-v"><span className="tl-stat-num">3</span></div><div className="tl-l">Role-based portals</div></div>
          <div className="tl-hero-stat"><div className="tl-v">UPI</div><div className="tl-l">Native payments</div></div>
          <div className="tl-hero-stat"><div className="tl-v">OTP</div><div className="tl-l">Verified handover</div></div>
        </div>
      </section>

      <div className="tl-ticker" aria-hidden>
        <div className="tl-ticker-track">
          {tickerDoubled.map((item, i) => (
            <span key={`${item}-${i}`} className="tl-ticker-item">
              <em>●</em> {item}
            </span>
          ))}
        </div>
      </div>

      <section className="tl-section tl-wrap" id="system">
        <div className="tl-section-num"><span className="tl-bar" /><span className="tl-num">01</span> / The system</div>
        <div className="tl-section-head">
          <h2>Three portals,<br /><span className="tl-it">one source of truth.</span></h2>
          <div className="tl-side">
            Tray runs as a single application with three role-based views. The same data drives every screen.{" "}
            <strong style={{ color: "var(--tl-ink)" }}>Open any portal below</strong> — they're fully functional, no install required.
          </div>
        </div>

        <div className="tl-portals">
          <article className="tl-portal" data-c="student">
            <div className="tl-portal-head">
              <div>
                <span className="tl-portal-ix tl-ix">01 — Student</span>
                <h3>Order &<br /><span className="tl-it">collect.</span></h3>
              </div>
              <span className="tl-portal-dot" />
            </div>
            <div className="tl-portal-frame">
              <span className="tl-device-tag">💻 Laptop · sidebar cart</span>
              <PortalPreview src="/demo/student.html" title="Student app preview" url="tray.app/demo/student" />
            </div>
            <div className="tl-portal-body">
              <p>
                Dine-in or takeaway up front (QSR-style), veg lane, UPI checkout, pickup-window ETA, and OTP handover —
                full laptop layout with sidebar cart on wide screens.
              </p>
              <div className="tl-feat-tags">
                <span className="tl-feat-tag">Dine · Takeaway</span>
                <span className="tl-feat-tag">UPI · QR</span>
                <span className="tl-feat-tag">Pickup window</span>
                <span className="tl-feat-tag">Veg lane</span>
              </div>
              <a href="/demo/student.html" className="tl-portal-open">
                <span>Open the student app</span>
                <span className="tl-arrow">→</span>
              </a>
            </div>
          </article>

          <article className="tl-portal" data-c="kitchen">
            <div className="tl-portal-head">
              <div>
                <span className="tl-portal-ix tl-ix">02 — Kitchen</span>
                <h3>Prepare &<br /><span className="tl-it">hand over.</span></h3>
              </div>
              <span className="tl-portal-dot" />
            </div>
            <div className="tl-portal-frame">
              <span className="tl-device-tag">🖥 Desktop / tablet · 1440×</span>
              <PortalPreview src="/demo/kitchen.html" title="Kitchen view preview" url="tray.app/demo/kitchen" />
            </div>
            <div className="tl-portal-body">
              <p>Live queue with preparation timers, status updates, and OTP verification on every handover. Add today's specials → push to every student instantly.</p>
              <div className="tl-feat-tags">
                <span className="tl-feat-tag">Live queue</span>
                <span className="tl-feat-tag">SLA timers</span>
                <span className="tl-feat-tag">Add specials</span>
                <span className="tl-feat-tag">OTP verify</span>
              </div>
              <a href="/demo/kitchen.html" className="tl-portal-open">
                <span>Open the kitchen view</span>
                <span className="tl-arrow">→</span>
              </a>
            </div>
          </article>

          <article className="tl-portal" data-c="admin">
            <div className="tl-portal-head">
              <div>
                <span className="tl-portal-ix tl-ix">03 — Admin</span>
                <h3>Run the<br /><span className="tl-it">operation.</span></h3>
              </div>
              <span className="tl-portal-dot" />
            </div>
            <div className="tl-portal-frame">
              <span className="tl-device-tag">🖥 Desktop · 1440×</span>
              <PortalPreview src="/demo/admin.html" title="Admin console preview" url="tray.app/demo/admin" />
            </div>
            <div className="tl-portal-body">
              <p>Daily revenue, peak hours, top items, full order history, and menu management — in one polished web console. Every event from every portal, live.</p>
              <div className="tl-feat-tags">
                <span className="tl-feat-tag">Revenue · live</span>
                <span className="tl-feat-tag">Peak heatmap</span>
                <span className="tl-feat-tag">Audit log</span>
                <span className="tl-feat-tag">⌘K search</span>
              </div>
              <a href="/demo/admin.html" className="tl-portal-open">
                <span>Open the admin console</span>
                <span className="tl-arrow">→</span>
              </a>
            </div>
          </article>
        </div>
      </section>

      <section className="tl-sync" id="sync">
        <div className="tl-wrap">
          <div className="tl-section-num"><span className="tl-bar" /><span className="tl-num">02</span> / The connected canteen</div>
          <div className="tl-sync-grid">
            <div>
              <h2>Add a special.<br /><span className="tl-it">Watch it land everywhere.</span></h2>
              <p className="tl-lede">
                The kitchen adds a dish today — it appears on every student phone in under 300 ms, and an audit-log entry lands in the admin console.
                One source of truth, three windows, no refresh.
              </p>
              <div className="tl-sync-meta">
                <div className="tl-row"><span className="tl-k">CHANNEL</span><span>Postgres logical replication → Supabase Realtime</span></div>
                <div className="tl-row"><span className="tl-k">LATENCY</span><span>~240 ms p95 · 12 hops</span></div>
                <div className="tl-row"><span className="tl-k">FALLBACK</span><span>HTTP long-poll on degraded networks</span></div>
              </div>
            </div>
            <div className="tl-diagram">
              <div className="tl-node" data-c="kitchen">
                <div className="tl-ic">K</div>
                <div className="tl-info">
                  <div className="tl-n">Kitchen pushes a special</div>
                  <div className="tl-d">POST /api/menu/special</div>
                </div>
                <span className="tl-role">SOURCE</span>
              </div>
              <div className="tl-arr"><div className="tl-line" /><span className="tl-dot" /><span>WRITE · RLS-enforced</span><div className="tl-line" /></div>
              <div className="tl-node" data-c="db">
                <div className="tl-ic">DB</div>
                <div className="tl-info">
                  <div className="tl-n">Postgres · menu_items table</div>
                  <div className="tl-d">tenant_id scoped · row inserted</div>
                </div>
                <span className="tl-role">SOURCE OF TRUTH</span>
              </div>
              <div className="tl-arr"><div className="tl-line" /><span className="tl-dot" style={{ animationDelay: ".4s" }} /><span>FAN OUT · WebSocket</span><div className="tl-line" /></div>
              <div className="tl-node" data-c="student">
                <div className="tl-ic">S</div>
                <div className="tl-info">
                  <div className="tl-n">Student phones receive update</div>
                  <div className="tl-d">~240 ms · subscribed devices</div>
                </div>
                <span className="tl-role">CLIENT</span>
              </div>
              <div className="tl-node" data-c="admin">
                <div className="tl-ic">A</div>
                <div className="tl-info">
                  <div className="tl-n">Admin audit-log row</div>
                  <div className="tl-d">menu.add · audit logged</div>
                </div>
                <span className="tl-role">CLIENT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingLineLeave />

      <section className="tl-pull tl-wrap">
        <p>Lunch is thirty minutes. Students currently spend <span className="tl-it">twelve of them</span> standing in line.</p>
        <div className="tl-cite">CAMPUS CANTEEN AUDIT · 2025</div>
      </section>

      <section className="tl-section tl-wrap" id="flow">
        <div className="tl-section-num"><span className="tl-bar" /><span className="tl-num">03</span> / How it works</div>
        <div className="tl-section-head">
          <h2>Phone to plate,<br /><span className="tl-it">in eleven minutes.</span></h2>
          <div className="tl-side">Four touchpoints. The student walks straight to the counter. The kitchen never repeats a name. Everyone gets their hour back.</div>
        </div>
        <div className="tl-flow">
          <div className="tl-flow-step">
            <div className="tl-ix">01 — 11:42</div>
            <div className="tl-num">01</div>
            <h3>Browse the <span className="tl-it">menu.</span></h3>
            <p>Live availability, prep times, veg/non-veg filters. Add to cart with one tap.</p>
            <div className="tl-tag">→ STATUS: CART</div>
          </div>
          <div className="tl-flow-step">
            <div className="tl-ix">02 — 11:43</div>
            <div className="tl-num">02</div>
            <h3>Pay by <span className="tl-it">UPI.</span></h3>
            <p>Single-use QR with exact amount. Webhook confirms automatically.</p>
            <div className="tl-tag">→ STATUS: PAID</div>
          </div>
          <div className="tl-flow-step">
            <div className="tl-ix">03 — 11:46</div>
            <div className="tl-num">03</div>
            <h3>Track <span className="tl-it">live.</span></h3>
            <p>Queued → preparing → ready, updated by the kitchen in under 250 ms.</p>
            <div className="tl-tag">→ STATUS: PREPARING</div>
          </div>
          <div className="tl-flow-step">
            <div className="tl-ix">04 — 11:53</div>
            <div className="tl-num">04</div>
            <h3>Collect with <span className="tl-it">OTP.</span></h3>
            <p>Read the four-digit code at the counter. Staff verifies, marks complete.</p>
            <div className="tl-tag">✓ ORDER CLOSED</div>
          </div>
        </div>
      </section>

      <section className="tl-section tl-wrap" id="stack">
        <div className="tl-section-num"><span className="tl-bar" /><span className="tl-num">04</span> / Built with</div>
        <div className="tl-section-head">
          <h2>A boring stack,<br /><span className="tl-it">on purpose.</span></h2>
          <div className="tl-side">Everything is on a free tier until you have real users. No exotic infrastructure. No vendor lock-in surprises.</div>
        </div>
        <div className="tl-stack">
          {[
            ["Next.js 15", "FRAMEWORK · APP ROUTER + RSC"],
            ["TypeScript", "LANGUAGE · STRICT MODE"],
            ["Tailwind CSS", "STYLING · DESIGN TOKENS"],
            ["Supabase", "DB · AUTH · STORAGE"],
            ["Postgres + RLS", "DATA · MULTI-TENANT"],
            ["Supabase Realtime", "LIVE · WEBSOCKETS"],
            ["Razorpay", "PAYMENTS · UPI"],
            ["Vercel · Edge", "HOSTING · CDN"],
          ].map(([n, r]) => (
            <div key={n} className="tl-stack-card">
              <span className="tl-n">{n}</span>
              <span className="tl-r">{r}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="tl-closing">
        <div className="tl-wrap">
          <div className="tl-section-num" style={{ justifyContent: "center", marginBottom: 24 }}>
            <span className="tl-bar" /><span className="tl-num">DEMO</span> / Live · clickable · no sign-up
          </div>
          <h2>Skip the<br /><span className="tl-it">line.</span></h2>
          <p>Three portals. One platform. Built for college canteens that are tired of printed tokens.</p>
          <div className="tl-cta-row">
            <a href="/demo/student.html" className="tl-btn tl-btn-pri tl-btn-lg">Open the student app →</a>
            <a href="/demo/kitchen.html" className="tl-btn tl-btn-ghost tl-btn-lg">Kitchen view</a>
            <a href="/demo/admin.html" className="tl-btn tl-btn-ghost tl-btn-lg">Admin dashboard</a>
          </div>
        </div>
      </section>
      </main>

      <footer className="tl-footer tl-wrap">
        <div className="tl-footer-row1">
          <div>
            <BrandMark />
            <p className="tl-footer-tag">A canteen ordering system for college and university campuses. Self-hostable, multi-tenant, source-available.</p>
          </div>
          <div>
            <h4>Product</h4>
            <div className="tl-links">
              <Link href="/menu">Student app</Link>
              <Link href="/kitchen">Kitchen view</Link>
              <Link href="/admin/dashboard">Admin console</Link>
              <Link href="/signup">Get started</Link>
            </div>
          </div>
          <div>
            <h4>Resources</h4>
            <div className="tl-links">
              <a href="https://github.com/thribhuvan003/Tray/blob/main/README.md" target="_blank" rel="noreferrer">README</a>
              <a href="https://github.com/thribhuvan003/Tray/tree/main/docs/adr" target="_blank" rel="noreferrer">Architecture</a>
              <a href="https://github.com/thribhuvan003/Tray/blob/main/SECURITY.md" target="_blank" rel="noreferrer">Security</a>
              <a href="https://github.com/thribhuvan003/Tray/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer">Contributing</a>
            </div>
          </div>
          <div>
            <h4>Contact</h4>
            <div className="tl-links">
              <a href="https://github.com/thribhuvan003/Tray" target="_blank" rel="noreferrer">github.com/thribhuvan003</a>
            </div>
          </div>
        </div>
        <div className="tl-footer-mark">tra<span className="tl-it">y</span></div>
        <div className="tl-footer-bot">
          <span>BUILT FOR CAMPUS CANTEENS · MADE IN INDIA</span>
          <span>v3.0 · 2026</span>
        </div>
      </footer>
    </div>
  );
}
