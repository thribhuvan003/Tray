import Link from "next/link";
import type { ResolvedTenant } from "@/lib/tenant";
import { LandingLineLeave } from "@/components/landing/landing-line-leave";
import { LandingMotion } from "@/components/landing/landing-motion";
import { DemoEntryTransition } from "@/components/landing/demo-entry-transition";

// Cream / clay theme — scoped to .tray-landing only.
// Student / kitchen / admin portals are separate and unaffected.

const SCOPED_CSS = `
/* ═══════════════════════════════════════════
   ROOT — color tokens + base
   ═══════════════════════════════════════════ */
.tray-landing {
  --tl-bg:      #F7F0DF;
  --tl-bg-2:    #EDE4CF;
  --tl-bg-3:    #E5D9C0;
  --tl-bg-4:    #DDD0B0;
  --tl-line:    rgba(17,17,17,0.10);
  --tl-line-2:  rgba(17,17,17,0.18);
  --tl-ink:     #111111;
  --tl-ink-2:   rgba(17,17,17,0.65);
  --tl-ink-3:   rgba(17,17,17,0.40);
  --tl-ink-4:   rgba(17,17,17,0.20);
  --tl-accent:  #C85A12;
  --tl-student: #0066FF;
  --tl-kitchen: #D52821;
  --tl-admin:   #16A34A;
  --tl-good:    #16A34A;

  background: #F7F0DF;
  color: var(--tl-ink);
  font-family: var(--font-geist), ui-sans-serif, system-ui, sans-serif;
  font-feature-settings: "ss01";
  font-size: 15px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  min-height: 100vh;
  width: 100%;
  max-width: 100vw;
}

.tray-landing ::selection { background: var(--tl-accent); color: #fff; }

/* ── Font utility classes ── */
.tray-landing .tl-serif  { font-family: var(--font-fraunces), ui-serif, Georgia, serif; font-weight: 900; }
.tray-landing .tl-italic { font-family: var(--font-fraunces), ui-serif, Georgia, serif; font-style: italic; font-weight: 900; }
.tray-landing .tl-mono   { font-family: var(--font-dm-mono), ui-monospace, Menlo, monospace; font-feature-settings: "ss01"; }
.tray-landing .tl-it     { font-style: italic; }

/* ── Grain overlay ── */
.tray-landing .tl-grain {
  position: fixed; inset: -30%; pointer-events: none; z-index: 1; opacity: .028; mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* ── Layout wrapper ── */
.tray-landing .tl-wrap {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}
@media (min-width: 768px) { .tray-landing .tl-wrap { padding: 0 48px; } }
@media (min-width: 1200px) { .tray-landing .tl-wrap { padding: 0 64px; } }

/* ── Accessibility: skip link ── */
.tray-landing .tl-skip {
  position: absolute; left: -9999px; top: 12px; z-index: 100;
  padding: 10px 16px; background: var(--tl-ink); color: #fff;
  border-radius: 8px; font-size: 14px; font-weight: 600;
}
.tray-landing .tl-skip:focus { left: 12px; }

/* ── Focus styles ── */
.tray-landing a:focus { outline: none; }
.tray-landing a:focus-visible,
.tray-landing button:focus-visible {
  outline: 2px solid var(--tl-accent);
  outline-offset: 3px;
}

/* ═══════════════════════════════════════════
   BUTTONS
   ═══════════════════════════════════════════ */
.tray-landing .tl-btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 8px; padding: 10px 20px; border-radius: 999px;
  font-size: 14px; font-weight: 500; border: 1.5px solid transparent;
  transition: transform .12s, background .15s, color .15s, border-color .15s, box-shadow .15s;
  line-height: 1; font-family: var(--font-geist), sans-serif; cursor: pointer;
  text-decoration: none;
}
.tray-landing .tl-btn-pri {
  background: var(--tl-accent); color: #fff; border-color: var(--tl-accent);
}
.tray-landing .tl-btn-pri:hover {
  background: #B04D0F; border-color: #B04D0F; transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(200,90,18,0.3);
}
.tray-landing .tl-btn-ghost {
  color: var(--tl-ink); background: transparent; border-color: var(--tl-line-2);
}
.tray-landing .tl-btn-ghost:hover {
  background: var(--tl-bg-2); border-color: var(--tl-ink-3); transform: translateY(-1px);
}
.tray-landing .tl-btn-lg { padding: 14px 28px; font-size: 15px; }
.tray-landing .tl-btn-lg { will-change: transform; }

/* ═══════════════════════════════════════════
   NAV
   ═══════════════════════════════════════════ */
.tray-landing .tl-nav {
  position: sticky; top: 0; z-index: 50;
  background: rgba(247,240,223,0.88);
  backdrop-filter: blur(20px) saturate(1.5);
  -webkit-backdrop-filter: blur(20px) saturate(1.5);
  border-bottom: 1px solid var(--tl-line);
  padding-top: env(safe-area-inset-top, 0px);
}
.tray-landing .tl-nav-inner {
  max-width: 1280px; margin: 0 auto; padding: 13px 20px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}
@media (min-width: 768px) { .tray-landing .tl-nav-inner { padding: 13px 48px; } }
@media (min-width: 1200px) { .tray-landing .tl-nav-inner { padding: 13px 64px; } }

/* Brand */
.tray-landing .tl-brand {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--font-fraunces), serif; font-size: 24px;
  letter-spacing: -0.02em; font-weight: 900; color: var(--tl-ink);
  text-decoration: none; flex-shrink: 0;
}
.tray-landing .tl-brand .tl-brand-dot { font-style: italic; color: var(--tl-accent); }
.tray-landing .tl-brand-mark {
  width: 30px; height: 30px; border-radius: 7px;
  background: var(--tl-accent);
  display: inline-flex; align-items: center; justify-content: center;
  font-family: var(--font-fraunces), serif; font-weight: 900; font-size: 17px;
  color: #fff; box-shadow: inset 0 1px 0 rgba(255,255,255,.18);
  transition: box-shadow .3s, transform .2s; flex-shrink: 0;
}
.tray-landing .tl-brand:hover .tl-brand-mark {
  box-shadow: 0 0 18px rgba(200,90,18,0.45); transform: scale(1.06);
}

/* Nav links — desktop only */
.tray-landing .tl-nav-links {
  display: none; gap: 28px; font-size: 13.5px; color: var(--tl-ink-2);
  font-family: var(--font-geist), sans-serif;
}
@media (min-width: 900px) { .tray-landing .tl-nav-links { display: flex; } }
.tray-landing .tl-nav-links a {
  text-decoration: none; color: var(--tl-ink-2); transition: color .2s; position: relative;
}
.tray-landing .tl-nav-links a::after {
  content: ''; position: absolute; bottom: -3px; left: 0; width: 100%; height: 1px;
  background: var(--tl-accent); transform: scaleX(0); transform-origin: right;
  transition: transform .3s cubic-bezier(0.2,0.8,0.2,1);
}
.tray-landing .tl-nav-links a:hover { color: var(--tl-ink); }
.tray-landing .tl-nav-links a:hover::after { transform: scaleX(1); transform-origin: left; }

/* Nav CTA */
.tray-landing .tl-nav-cta { display: flex; gap: 10px; align-items: center; }

/* ── Hamburger (pure CSS checkbox hack, no JS) ── */
.tray-landing .tl-ham-input {
  position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none;
}
.tray-landing .tl-ham-btn {
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  gap: 5px; width: 36px; height: 36px; cursor: pointer;
  border-radius: 8px; transition: background .15s; flex-shrink: 0;
}
@media (min-width: 900px) { .tray-landing .tl-ham-btn { display: none; } }
.tray-landing .tl-ham-btn:hover { background: var(--tl-bg-2); }
.tray-landing .tl-ham-bar {
  display: block; width: 20px; height: 1.5px; background: var(--tl-ink);
  border-radius: 2px; transition: transform .28s, opacity .2s;
  transform-origin: center;
}
/* Animate bars on open — :has() lets us reach inside the sibling nav */
.tray-landing:has(#tl-ham:checked) .tl-ham-btn .tl-ham-bar:nth-child(1) {
  transform: translateY(6.5px) rotate(45deg);
}
.tray-landing:has(#tl-ham:checked) .tl-ham-btn .tl-ham-bar:nth-child(2) {
  opacity: 0; transform: scaleX(0);
}
.tray-landing:has(#tl-ham:checked) .tl-ham-btn .tl-ham-bar:nth-child(3) {
  transform: translateY(-6.5px) rotate(-45deg);
}

/* Mobile sheet */
.tray-landing .tl-mobile-menu {
  display: none; flex-direction: column; gap: 4px;
  padding: 16px 20px calc(16px + env(safe-area-inset-bottom, 0px));
  background: rgba(247,240,223,0.97); backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--tl-line);
  overflow: hidden; max-height: 0; transition: max-height .32s ease;
}
@media (min-width: 900px) { .tray-landing .tl-mobile-menu { display: none !important; } }
.tray-landing .tl-ham-input:checked ~ .tl-mobile-menu {
  display: flex; max-height: 500px;
}
.tray-landing .tl-mobile-menu a {
  padding: 13px 14px; border-radius: 10px; font-size: 16px; font-weight: 500;
  color: var(--tl-ink-2); text-decoration: none; transition: background .15s, color .15s;
  border: 1px solid transparent;
}
.tray-landing .tl-mobile-menu a:hover, .tray-landing .tl-mobile-menu a:active {
  background: var(--tl-bg-2); color: var(--tl-ink); border-color: var(--tl-line);
}
.tray-landing .tl-mobile-menu .tl-mob-sep {
  height: 1px; background: var(--tl-line); margin: 8px 0;
}
.tray-landing .tl-mobile-menu .tl-mob-cta {
  margin-top: 4px; display: flex; gap: 10px; flex-wrap: wrap;
}

/* ═══════════════════════════════════════════
   SCROLL PROGRESS BAR + CURSOR
   ═══════════════════════════════════════════ */
.tl-progress { position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 998; pointer-events: none; }
.tl-progress-bar { height: 2px; width: 0; background: linear-gradient(90deg, var(--tl-accent) 0%, #E07A3A 60%, var(--tl-student) 100%); will-change: width; }

.tl-cursor-ring {
  position: fixed; top: 0; left: 0; width: 34px; height: 34px;
  border: 1.5px solid rgba(200,90,18,0.55); border-radius: 50%;
  pointer-events: none; z-index: 9999; will-change: transform;
  transition: width .32s cubic-bezier(.2,.8,.2,1), height .32s cubic-bezier(.2,.8,.2,1), opacity .25s;
  opacity: 0;
}
.tl-cursor-dot {
  position: fixed; top: 0; left: 0; width: 5px; height: 5px;
  background: var(--tl-accent); border-radius: 50%; pointer-events: none;
  z-index: 9999; will-change: transform; opacity: 0;
}
.tray-landing:hover .tl-cursor-ring,
.tray-landing:hover .tl-cursor-dot { opacity: 1; }
.tl-cursor-ring.is-hovered { width: 54px; height: 54px; }
@media (hover: none), (pointer: coarse) { .tl-cursor-ring, .tl-cursor-dot { display: none !important; } }

/* ═══════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════ */
.tray-landing .tl-hero { padding: 44px 0 36px; position: relative; }
@media (min-width: 768px) { .tray-landing .tl-hero { padding: 88px 0 72px; } }

/* Top meta bar */
.tray-landing .tl-hero-top {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; font-family: var(--font-dm-mono), monospace; font-size: 10.5px;
  letter-spacing: 0.16em; text-transform: uppercase; color: var(--tl-ink-3);
  padding-bottom: 20px; border-bottom: 1px solid var(--tl-line); margin-bottom: 36px;
  font-weight: 500; flex-wrap: wrap;
}
.tray-landing .tl-hero-top .tl-l,
.tray-landing .tl-hero-top .tl-r { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.tray-landing .tl-live {
  display: inline-flex; align-items: center; gap: 7px; color: var(--tl-good);
  text-transform: none; letter-spacing: 0.02em;
  font-family: var(--font-geist), sans-serif; font-weight: 500; font-size: 12px;
}
.tray-landing .tl-live .tl-d {
  width: 7px; height: 7px; border-radius: 50%; background: var(--tl-good);
  animation: tlLive 2s ease-in-out infinite;
}
@keyframes tlLive {
  0%   { box-shadow: 0 0 0 0 rgba(22,163,74,.45); }
  70%  { box-shadow: 0 0 0 7px rgba(22,163,74,0); }
  100% { box-shadow: 0 0 0 0 rgba(22,163,74,0); }
}

/* Headline */
.tray-landing .tl-h1 {
  font-family: var(--font-fraunces), ui-serif, Georgia, serif;
  font-weight: 900;
  font-size: clamp(52px, 10vw, 140px);
  line-height: 0.92;
  letter-spacing: -0.04em;
  margin: 0 0 28px;
  max-width: 14ch;
}
.tray-landing .tl-h1 .tl-it { font-style: italic; color: var(--tl-accent); }
.tray-landing .tl-h1 .tl-word { display: inline-block; transform-origin: 50% 100%; }

/* Split-text characters (populated by LandingMotion) */
.tray-landing .tl-h1 .tl-char { display: inline-block; overflow: hidden; vertical-align: baseline; }
.tray-landing .tl-h1 .tl-char-inner { display: inline-block; will-change: transform, opacity; }

/* Hero body grid */
.tray-landing .tl-hero-meta {
  display: grid; grid-template-columns: 1fr; gap: 28px; align-items: flex-end; margin-bottom: 40px;
}
@media (min-width: 960px) { .tray-landing .tl-hero-meta { grid-template-columns: 1.2fr 1fr; gap: 56px; } }

.tray-landing .tl-hero-lede {
  font-size: 16px; line-height: 1.6; color: var(--tl-ink-2); max-width: 52ch; font-weight: 400;
}
@media (min-width: 768px) { .tray-landing .tl-hero-lede { font-size: 18px; } }

.tray-landing .tl-hero-cta { display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
@media (min-width: 960px) { .tray-landing .tl-hero-cta { align-items: flex-end; } }
.tray-landing .tl-hero-cta .tl-row { display: flex; gap: 10px; flex-wrap: wrap; }
.tray-landing .tl-hero-cta .tl-note {
  font-family: var(--font-dm-mono), monospace; font-size: 10.5px;
  color: var(--tl-ink-3); letter-spacing: 0.08em; text-align: left;
}
@media (min-width: 960px) { .tray-landing .tl-hero-cta .tl-note { text-align: right; } }

/* Stats grid — 2col mobile → 4col desktop, no clipping */
.tray-landing .tl-hero-stats {
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 0; padding: 20px 0 0; border-top: 1px solid var(--tl-line);
}
@media (min-width: 640px) {
  .tray-landing .tl-hero-stats { grid-template-columns: repeat(4, 1fr); padding-top: 28px; }
}
.tray-landing .tl-hero-stat {
  padding: 14px 14px 14px 0; border-right: 1px solid var(--tl-line);
  display: flex; flex-direction: column; gap: 4px; min-width: 0;
}
@media (min-width: 640px) {
  .tray-landing .tl-hero-stat { padding: 0 20px 0 0; }
  .tray-landing .tl-hero-stat:not(:first-child) { padding-left: 20px; }
}
.tray-landing .tl-hero-stat:nth-child(2n) { border-right: 0; }
@media (min-width: 640px) {
  .tray-landing .tl-hero-stat:nth-child(2n) { border-right: 1px solid var(--tl-line); }
  .tray-landing .tl-hero-stat:last-child { border-right: 0; }
}
.tray-landing .tl-hero-stat .tl-v {
  font-family: var(--font-fraunces), serif; font-size: clamp(28px, 4.5vw, 44px);
  letter-spacing: -0.025em; line-height: 1; font-weight: 900;
}
.tray-landing .tl-hero-stat .tl-v .tl-it { font-style: italic; color: var(--tl-accent); }
.tray-landing .tl-hero-stat .tl-l {
  font-family: var(--font-dm-mono), monospace; font-size: 10.5px;
  letter-spacing: 0.12em; text-transform: uppercase; color: var(--tl-ink-3); font-weight: 500;
}

/* Scroll hint */
.tl-scroll-hint {
  display: none; position: absolute; bottom: -20px; left: 0;
  align-items: center; gap: 10px;
  font-family: var(--font-dm-mono), monospace; font-size: 10px;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--tl-ink-4);
  pointer-events: none;
}
@media (min-width: 768px) { .tl-scroll-hint { display: flex; } }
.tl-scroll-hint .tl-sh-bar { width: 24px; height: 1px; background: var(--tl-ink-4); }
.tl-scroll-hint .tl-sh-dot {
  width: 5px; height: 9px; border: 1px solid var(--tl-ink-4); border-radius: 3px; position: relative;
}
.tl-scroll-hint .tl-sh-dot::after {
  content: ''; position: absolute; top: 2px; left: 50%; transform: translateX(-50%);
  width: 1px; height: 2px; background: var(--tl-ink-4);
  animation: tlScrollPip 1.8s ease-in-out infinite;
}
@keyframes tlScrollPip {
  0%,100%{ opacity:0; transform:translateX(-50%) translateY(0); }
  50%    { opacity:1; transform:translateX(-50%) translateY(2px); }
}

/* ═══════════════════════════════════════════
   TICKER — dark band
   ═══════════════════════════════════════════ */
.tray-landing .tl-ticker {
  overflow: hidden; max-width: 100%;
  background: #111111;
  border-top: 1px solid rgba(255,255,255,0.06);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  position: relative; z-index: 2;
}
.tray-landing .tl-ticker-row { overflow: hidden; max-width: 100%; }
.tray-landing .tl-ticker-track {
  display: flex; width: max-content;
  animation: tlTicker 44s linear infinite;
}
.tray-landing .tl-ticker-track-2 {
  display: flex; width: max-content;
  animation: tlTicker 36s linear infinite reverse;
}
.tray-landing .tl-ticker:hover .tl-ticker-track,
.tray-landing .tl-ticker:hover .tl-ticker-track-2 { animation-play-state: paused; }
.tray-landing .tl-ticker-item {
  flex-shrink: 0; padding: 11px 24px;
  font-family: var(--font-dm-mono), monospace; font-size: 10.5px;
  letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.32);
  white-space: nowrap; border-right: 1px solid rgba(255,255,255,0.07);
}
.tray-landing .tl-ticker-item em {
  font-style: normal; color: var(--tl-accent); font-weight: 600;
}
@keyframes tlTicker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) {
  .tray-landing .tl-ticker-track,
  .tray-landing .tl-ticker-track-2 { animation: none; flex-wrap: wrap; width: 100%; justify-content: center; }
}

/* ═══════════════════════════════════════════
   SECTION COMMON
   ═══════════════════════════════════════════ */
.tray-landing .tl-section { padding: 72px 0; position: relative; }
@media (min-width: 768px) { .tray-landing .tl-section { padding: 112px 0; } }

.tray-landing [data-reveal] { will-change: transform, opacity; }

.tray-landing .tl-section-num {
  font-family: var(--font-dm-mono), monospace; font-size: 10.5px;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--tl-ink-3);
  display: flex; align-items: center; gap: 10px; margin-bottom: 16px; font-weight: 500;
}
.tray-landing .tl-section-num .tl-bar { width: 22px; height: 1px; background: var(--tl-ink-4); }
.tray-landing .tl-section-num .tl-num { color: var(--tl-accent); font-weight: 600; }

.tray-landing .tl-section-head {
  display: grid; grid-template-columns: 1fr; gap: 28px; align-items: flex-end; margin-bottom: 36px;
}
@media (min-width: 900px) { .tray-landing .tl-section-head { grid-template-columns: 1.3fr 1fr; gap: 72px; margin-bottom: 52px; } }
.tray-landing .tl-section-head h2 {
  margin: 0; font-family: var(--font-fraunces), serif; font-weight: 900;
  font-size: clamp(38px, 6.5vw, 88px); letter-spacing: -0.035em; line-height: 0.94;
}
.tray-landing .tl-section-head h2 .tl-it { font-style: italic; color: var(--tl-accent); }
.tray-landing .tl-section-head .tl-side {
  color: var(--tl-ink-2); max-width: 44ch; font-size: 15.5px; line-height: 1.65;
}

/* ═══════════════════════════════════════════
   PORTALS — #system
   ═══════════════════════════════════════════ */
.tray-landing .tl-portals { display: grid; grid-template-columns: 1fr; gap: 16px; }
@media (min-width: 720px) { .tray-landing .tl-portals { grid-template-columns: repeat(3, 1fr); } }

.tray-landing .tl-portal {
  background: var(--tl-bg-2); border: 1px solid var(--tl-line);
  border-radius: 18px; overflow: hidden; display: flex; flex-direction: column;
  position: relative; transform-style: preserve-3d;
  transition: transform .25s, border-color .2s, box-shadow .25s;
}
.tray-landing .tl-portal:hover {
  transform: translateY(-4px);
  border-color: var(--tl-line-2);
  box-shadow: 0 20px 50px rgba(17,17,17,0.12);
}
.tray-landing .tl-portal-head {
  padding: 20px 22px 13px; display: flex; justify-content: space-between;
  align-items: flex-start; gap: 12px; border-bottom: 1px solid var(--tl-line);
}
.tray-landing .tl-portal-head .tl-ix {
  font-family: var(--font-dm-mono), monospace; font-size: 10px;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--tl-ink-3); font-weight: 500;
}
.tray-landing .tl-portal-head h3 {
  font-family: var(--font-fraunces), serif; font-size: 27px;
  letter-spacing: -0.025em; margin: 5px 0 0; font-weight: 900; line-height: 1.05;
}
.tray-landing .tl-portal-dot {
  width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 5px;
}
.tray-landing .tl-portal[data-c="student"] .tl-portal-dot  { background: var(--tl-student); box-shadow: 0 0 12px var(--tl-student); }
.tray-landing .tl-portal[data-c="kitchen"] .tl-portal-dot  { background: var(--tl-kitchen); box-shadow: 0 0 12px var(--tl-kitchen); }
.tray-landing .tl-portal[data-c="admin"]   .tl-portal-dot  { background: var(--tl-admin);   box-shadow: 0 0 12px var(--tl-admin); }
.tray-landing .tl-portal[data-c="student"] .tl-portal-head h3 .tl-it { color: var(--tl-student); }
.tray-landing .tl-portal[data-c="kitchen"] .tl-portal-head h3 .tl-it { color: var(--tl-kitchen); }
.tray-landing .tl-portal[data-c="admin"]   .tl-portal-head h3 .tl-it { color: var(--tl-admin); }

.tray-landing .tl-portal-frame {
  position: relative; height: 260px; overflow: hidden; background: var(--tl-bg-3);
  border-bottom: 1px solid var(--tl-line);
}
@media (min-width: 720px) { .tray-landing .tl-portal-frame { height: 400px; } }
.tray-landing .tl-portal-frame iframe {
  position: absolute; top: 0; left: 0; width: 200%; height: 200%;
  transform: scale(0.5); transform-origin: 0 0; border: 0; pointer-events: none;
  background: var(--tl-bg-3);
}
.tray-landing .tl-portal-frame .tl-portal-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, transparent 55%, var(--tl-bg-2) 100%);
  pointer-events: none; z-index: 2;
}
.tray-landing .tl-portal-frame .tl-device-tag {
  position: absolute; top: 12px; left: 12px;
  font-family: var(--font-dm-mono), monospace; font-size: 10px; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--tl-ink-3);
  background: rgba(247,240,223,0.8); padding: 4px 9px; border-radius: 5px;
  font-weight: 500; z-index: 3; backdrop-filter: blur(4px);
}

.tray-landing .tl-portal-body { padding: 18px 22px 22px; display: flex; flex-direction: column; gap: 12px; }
.tray-landing .tl-portal-body p { color: var(--tl-ink-2); font-size: 13.5px; line-height: 1.55; margin: 0; }
.tray-landing .tl-feat-tags { display: flex; gap: 5px; flex-wrap: wrap; }
.tray-landing .tl-feat-tag {
  padding: 3px 8px; background: var(--tl-bg-3); border: 1px solid var(--tl-line);
  border-radius: 5px; font-family: var(--font-dm-mono), monospace;
  font-size: 10px; color: var(--tl-ink-2); font-weight: 500; letter-spacing: 0.04em;
}
.tray-landing .tl-portal-open {
  display: flex; align-items: center; justify-content: space-between;
  padding: 11px 15px; background: var(--tl-bg-3); border: 1px solid var(--tl-line);
  border-radius: 10px; margin-top: auto; font-size: 13px; font-weight: 500;
  transition: all .2s; color: var(--tl-ink); text-decoration: none;
}
.tray-landing .tl-portal-open:hover { background: var(--tl-bg-4); border-color: var(--tl-line-2); }
.tray-landing .tl-portal[data-c="student"] .tl-portal-open:hover { border-color: var(--tl-student); color: var(--tl-student); }
.tray-landing .tl-portal[data-c="kitchen"] .tl-portal-open:hover { border-color: var(--tl-kitchen); color: var(--tl-kitchen); }
.tray-landing .tl-portal[data-c="admin"]   .tl-portal-open:hover { border-color: var(--tl-admin);   color: var(--tl-admin); }
.tray-landing .tl-portal-open .tl-arrow { transition: transform .2s; }
.tray-landing .tl-portal-open:hover .tl-arrow { transform: translateX(4px); }

/* ═══════════════════════════════════════════
   CAMPUS — #campus
   ═══════════════════════════════════════════ */
.tray-landing .tl-campus-box {
  border: 1px solid var(--tl-line-2); border-radius: 20px;
  padding: 22px; background: var(--tl-bg-2);
}
.tray-landing .tl-campus-header { display: flex; align-items: center; gap: 13px; margin-bottom: 18px; flex-wrap: wrap; }
.tray-landing .tl-campus-icon {
  width: 38px; height: 38px; border-radius: 10px;
  background: rgba(200,90,18,0.14); display: flex; align-items: center;
  justify-content: center; font-family: var(--font-fraunces), serif; font-weight: 900;
  font-size: 19px; color: var(--tl-accent); flex-shrink: 0;
}
.tray-landing .tl-campus-label { display: flex; flex-direction: column; gap: 2px; }
.tray-landing .tl-campus-name { font-family: var(--font-fraunces), serif; font-size: 19px; font-weight: 900; letter-spacing: -0.02em; line-height: 1.1; }
.tray-landing .tl-campus-slug { font-family: var(--font-dm-mono), monospace; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--tl-ink-3); font-weight: 500; }
.tray-landing .tl-canteens { display: grid; grid-template-columns: repeat(2, 1fr); gap: 9px; }
@media (min-width: 640px) { .tray-landing .tl-canteens { grid-template-columns: repeat(4, 1fr); } }
.tray-landing .tl-canteen-chip {
  padding: 13px 14px; background: var(--tl-bg-3); border: 1px solid var(--tl-line);
  border-radius: 12px; display: flex; flex-direction: column; gap: 4px; transition: border-color .15s;
}
.tray-landing .tl-canteen-chip:hover { border-color: rgba(200,90,18,0.3); }
.tray-landing .tl-canteen-chip .tl-cn { font-size: 13px; font-weight: 600; color: var(--tl-ink); }
.tray-landing .tl-canteen-chip .tl-cl { font-family: var(--font-dm-mono), monospace; font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.1em; }
.tray-landing .tl-canteen-chip.is-open  .tl-cl { color: var(--tl-good); }
.tray-landing .tl-canteen-chip.is-closed .tl-cl { color: var(--tl-ink-3); }
.tray-landing .tl-role-scope { margin-top: 14px; display: grid; grid-template-columns: 1fr; gap: 9px; }
@media (min-width: 640px) { .tray-landing .tl-role-scope { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 960px) { .tray-landing .tl-role-scope { grid-template-columns: repeat(4, 1fr); } }
.tray-landing .tl-scope-card {
  padding: 14px 16px; background: var(--tl-bg-3); border: 1px solid var(--tl-line);
  border-radius: 13px; display: flex; flex-direction: column; gap: 7px;
}
.tray-landing .tl-scope-card .tl-role-tag {
  font-family: var(--font-dm-mono), monospace; font-size: 9.5px; text-transform: uppercase;
  letter-spacing: 0.12em; font-weight: 600; padding: 3px 7px; border-radius: 5px;
  display: inline-block; width: fit-content;
}
.tray-landing .tl-scope-card[data-r="student"] .tl-role-tag { color: var(--tl-student); background: rgba(0,102,255,0.1); }
.tray-landing .tl-scope-card[data-r="kitchen"] .tl-role-tag { color: var(--tl-kitchen); background: rgba(213,40,33,0.1); }
.tray-landing .tl-scope-card[data-r="admin"]   .tl-role-tag { color: var(--tl-admin);   background: rgba(22,163,74,0.1); }
.tray-landing .tl-scope-card[data-r="campus"]  .tl-role-tag { color: var(--tl-accent);  background: rgba(200,90,18,0.1); }
.tray-landing .tl-scope-card .tl-scope-desc { font-size: 13px; color: var(--tl-ink-2); line-height: 1.5; }

/* ═══════════════════════════════════════════
   SYNC — #sync  (slightly darker bg band)
   ═══════════════════════════════════════════ */
.tray-landing .tl-sync {
  padding: 88px 0; background: var(--tl-bg-2);
  border-top: 1px solid var(--tl-line); border-bottom: 1px solid var(--tl-line);
  position: relative; overflow: hidden;
}
@media (min-width: 768px) { .tray-landing .tl-sync { padding: 128px 0; } }
.tray-landing .tl-sync-grid { display: grid; grid-template-columns: 1fr; gap: 44px; align-items: center; }
@media (min-width: 960px) { .tray-landing .tl-sync-grid { grid-template-columns: 1fr 1.4fr; gap: 60px; } }
.tray-landing .tl-sync-grid h2 {
  font-family: var(--font-fraunces), serif; font-weight: 900;
  font-size: clamp(38px, 6.5vw, 84px); line-height: 0.95; letter-spacing: -0.035em; margin: 0 0 22px;
}
.tray-landing .tl-sync-grid h2 .tl-it { font-style: italic; color: var(--tl-accent); }
.tray-landing .tl-sync-grid .tl-lede { font-size: 16px; line-height: 1.6; color: var(--tl-ink-2); margin: 0 0 22px; max-width: 44ch; }
.tray-landing .tl-sync-meta { display: flex; flex-direction: column; gap: 9px; font-family: var(--font-dm-mono), monospace; font-size: 11.5px; color: var(--tl-ink-2); font-weight: 500; }
.tray-landing .tl-sync-meta .tl-row { display: flex; align-items: center; gap: 12px; }
.tray-landing .tl-sync-meta .tl-k { color: var(--tl-accent); width: 68px; flex-shrink: 0; }

/* Diagram */
.tray-landing .tl-diagram {
  background: var(--tl-bg-3); border: 1px solid var(--tl-line);
  border-radius: 18px; padding: 22px; position: relative;
  display: flex; flex-direction: column; gap: 12px; overflow: hidden;
}
@media (min-width: 768px) { .tray-landing .tl-diagram { padding: 28px; gap: 16px; } }
.tray-landing .tl-node {
  padding: 13px 16px; background: var(--tl-bg-2); border: 1px solid var(--tl-line);
  border-radius: 11px; display: flex; align-items: center; gap: 12px;
  position: relative; transition: transform .2s;
}
.tray-landing .tl-node .tl-ic {
  width: 32px; height: 32px; border-radius: 7px; display: flex; align-items: center;
  justify-content: center; font-family: var(--font-dm-mono), monospace; font-weight: 700;
  font-size: 13px; flex-shrink: 0;
}
.tray-landing .tl-node .tl-info { flex: 1; min-width: 0; }
.tray-landing .tl-node .tl-info .tl-n { font-size: 13.5px; font-weight: 600; }
.tray-landing .tl-node .tl-info .tl-d { font-family: var(--font-dm-mono), monospace; font-size: 10.5px; color: var(--tl-ink-3); letter-spacing: 0.04em; margin-top: 2px; }
.tray-landing .tl-node .tl-role {
  font-family: var(--font-dm-mono), monospace; font-size: 10px; letter-spacing: 0.08em;
  font-weight: 600; text-transform: uppercase; padding: 3px 7px; border-radius: 5px; white-space: nowrap;
}
.tray-landing .tl-node[data-c="kitchen"] .tl-ic, .tray-landing .tl-node[data-c="kitchen"] .tl-role { color: var(--tl-kitchen); background: rgba(213,40,33,0.13); }
.tray-landing .tl-node[data-c="student"] .tl-ic, .tray-landing .tl-node[data-c="student"] .tl-role { color: var(--tl-student); background: rgba(0,102,255,0.12); }
.tray-landing .tl-node[data-c="admin"]   .tl-ic, .tray-landing .tl-node[data-c="admin"]   .tl-role { color: var(--tl-admin);   background: rgba(22,163,74,0.12); }
.tray-landing .tl-node[data-c="db"]      .tl-ic, .tray-landing .tl-node[data-c="db"]      .tl-role { color: var(--tl-accent);  background: rgba(200,90,18,0.13); }
.tray-landing .tl-arr {
  display: flex; align-items: center; justify-content: center;
  gap: 10px; font-family: var(--font-dm-mono), monospace;
  font-size: 10px; color: var(--tl-ink-3); letter-spacing: 0.04em; padding: 3px 0;
}
.tray-landing .tl-arr .tl-line { height: 1px; background: var(--tl-line-2); flex: 1; }
.tray-landing .tl-arr .tl-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--tl-accent); box-shadow: 0 0 8px var(--tl-accent);
  animation: tlTravel 3s ease-in-out infinite;
}
.tray-landing .tl-arr:nth-child(4) .tl-dot { animation-delay: 0.4s; }
.tray-landing .tl-arr:nth-child(6) .tl-dot { animation-delay: 0.8s; }
@keyframes tlTravel { 0%,100%{ opacity:.35; transform: scale(1); } 50%{ opacity:1; transform: scale(1.35); } }

/* ═══════════════════════════════════════════
   PULL QUOTE
   ═══════════════════════════════════════════ */
.tray-landing .tl-pull { padding: 88px 0; text-align: center; }
@media (min-width: 768px) { .tray-landing .tl-pull { padding: 128px 0; } }
.tray-landing .tl-pull p {
  font-family: var(--font-fraunces), serif;
  font-size: clamp(34px, 5.5vw, 80px); line-height: 1.06; letter-spacing: -0.025em;
  margin: 0 auto; max-width: 26ch; font-weight: 900;
  background: linear-gradient(135deg, var(--tl-ink) 30%, var(--tl-accent) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tray-landing .tl-pull p .tl-it { font-style: italic; }
.tray-landing .tl-pull .tl-cite {
  margin-top: 28px; font-family: var(--font-dm-mono), monospace;
  font-size: 11.5px; color: var(--tl-ink-3); letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500;
}

/* ═══════════════════════════════════════════
   KITCHEN QUOTE — new section
   ═══════════════════════════════════════════ */
.tray-landing .tl-kitchen-quote {
  padding: 72px 0; background: var(--tl-bg-2);
  border-top: 1px solid var(--tl-line); border-bottom: 1px solid var(--tl-line);
}
@media (min-width: 768px) { .tray-landing .tl-kitchen-quote { padding: 100px 0; } }
.tray-landing .tl-kq-inner {
  max-width: 820px; margin: 0 auto; padding: 0 20px;
}
@media (min-width: 768px) { .tray-landing .tl-kq-inner { padding: 0 48px; } }
.tray-landing .tl-kq-mark {
  font-family: var(--font-fraunces), serif; font-size: 64px; color: var(--tl-accent);
  font-weight: 900; line-height: .7; margin-bottom: 14px; display: block; opacity: .55;
}
.tray-landing .tl-kq-text {
  font-family: var(--font-fraunces), serif; font-weight: 900; font-style: italic;
  font-size: clamp(26px, 4vw, 44px); line-height: 1.2; letter-spacing: -0.025em;
  color: var(--tl-ink); margin: 0 0 24px;
}
.tray-landing .tl-kq-text .tl-lunch { color: var(--tl-accent); font-style: italic; }
.tray-landing .tl-kq-credit {
  font-family: var(--font-dm-mono), monospace; font-size: 11px;
  letter-spacing: 0.12em; text-transform: uppercase; color: var(--tl-ink-3); font-weight: 500;
}
.tray-landing .tl-kq-credit::before { content: "— "; }

/* ═══════════════════════════════════════════
   FLOW — #flow  (5 steps)
   ═══════════════════════════════════════════ */
.tray-landing .tl-flow {
  display: grid; grid-template-columns: 1fr;
  border: 1px solid var(--tl-line); border-radius: 18px;
  overflow: hidden; background: var(--tl-bg-2);
}
@media (min-width: 640px) { .tray-landing .tl-flow { grid-template-columns: repeat(5, 1fr); } }
.tray-landing .tl-flow-step {
  padding: 26px 22px; border-bottom: 1px solid var(--tl-line);
  min-height: 200px; display: flex; flex-direction: column; gap: 11px;
}
@media (min-width: 640px) {
  .tray-landing .tl-flow-step {
    padding: 28px 22px; border-bottom: 0; border-right: 1px solid var(--tl-line);
    min-height: 260px; gap: 12px;
  }
  .tray-landing .tl-flow-step:last-child { border-right: 0; }
}
.tray-landing .tl-flow-step:last-child { border-bottom: 0; }
.tray-landing .tl-flow-step .tl-ix {
  font-family: var(--font-dm-mono), monospace; font-size: 10.5px;
  color: var(--tl-ink-3); letter-spacing: 0.14em; text-transform: uppercase; font-weight: 500;
}
.tray-landing .tl-flow-step .tl-num {
  font-family: var(--font-fraunces), serif; font-size: 58px;
  letter-spacing: -0.03em; color: var(--tl-accent); line-height: .88; font-weight: 900;
  font-style: italic; margin: auto 0; text-shadow: 0 0 45px rgba(200,90,18,0.18);
}
@media (min-width: 768px) { .tray-landing .tl-flow-step .tl-num { font-size: 72px; } }
.tray-landing .tl-flow-step h3 {
  font-family: var(--font-fraunces), serif; font-size: 22px;
  letter-spacing: -0.02em; margin: 0; font-weight: 900; line-height: 1.1;
}
.tray-landing .tl-flow-step h3 .tl-it { font-style: italic; color: var(--tl-accent); }
.tray-landing .tl-flow-step p {
  color: var(--tl-ink-2); font-size: 13px; line-height: 1.55; margin: 0; max-width: 30ch;
}
.tray-landing .tl-flow-step .tl-tag {
  margin-top: auto; font-family: var(--font-dm-mono), monospace;
  font-size: 10px; color: var(--tl-ink-3); letter-spacing: 0.06em;
  text-transform: uppercase; font-weight: 600;
}

/* ═══════════════════════════════════════════
   STACK — #stack
   ═══════════════════════════════════════════ */
.tray-landing .tl-stack { display: grid; grid-template-columns: repeat(2, 1fr); gap: 11px; }
@media (min-width: 720px) { .tray-landing .tl-stack { grid-template-columns: repeat(4, 1fr); } }
.tray-landing .tl-stack-card {
  padding: 18px; background: var(--tl-bg-2); border: 1px solid var(--tl-line);
  border-radius: 12px; display: flex; flex-direction: column; gap: 7px;
  transition: border-color .15s, background .15s, box-shadow .15s;
}
.tray-landing .tl-stack-card:hover {
  border-color: var(--tl-line-2); background: var(--tl-bg-3);
  box-shadow: 0 4px 20px rgba(17,17,17,0.07);
}
.tray-landing .tl-stack-card .tl-n { font-weight: 600; font-size: 13.5px; color: var(--tl-ink); }
.tray-landing .tl-stack-card .tl-r { font-family: var(--font-dm-mono), monospace; font-size: 10.5px; color: var(--tl-ink-3); letter-spacing: 0.06em; }

/* ═══════════════════════════════════════════
   TRY-DEMO — #try-demo
   ═══════════════════════════════════════════ */
.tray-landing .tl-role-cards { display: grid; grid-template-columns: 1fr; gap: 13px; }
@media (min-width: 640px)  { .tray-landing .tl-role-cards { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 960px)  { .tray-landing .tl-role-cards { grid-template-columns: repeat(4, 1fr); } }
.tray-landing .tl-role-card {
  padding: 20px; background: var(--tl-bg-2); border: 1px solid var(--tl-line);
  border-radius: 17px; display: flex; flex-direction: column; gap: 11px;
  transition: border-color .2s, transform .2s, box-shadow .2s;
  text-decoration: none; color: inherit; cursor: pointer;
}
.tray-landing .tl-role-card:hover {
  transform: translateY(-4px); border-color: var(--tl-line-2);
  box-shadow: 0 18px 44px rgba(17,17,17,0.1);
}
.tray-landing .tl-role-card[data-r="student"]:hover { border-color: rgba(0,102,255,0.45); }
.tray-landing .tl-role-card[data-r="kitchen"]:hover { border-color: rgba(213,40,33,0.45); }
.tray-landing .tl-role-card[data-r="admin"]:hover   { border-color: rgba(22,163,74,0.45); }
.tray-landing .tl-role-card[data-r="campus"]:hover  { border-color: rgba(200,90,18,0.45); }
.tray-landing .tl-role-card .tl-rc-icon {
  width: 42px; height: 42px; border-radius: 11px;
  display: flex; align-items: center; justify-content: center; font-size: 21px;
}
.tray-landing .tl-role-card[data-r="student"] .tl-rc-icon { background: rgba(0,102,255,0.1); }
.tray-landing .tl-role-card[data-r="kitchen"] .tl-rc-icon { background: rgba(213,40,33,0.1); }
.tray-landing .tl-role-card[data-r="admin"]   .tl-rc-icon { background: rgba(22,163,74,0.1); }
.tray-landing .tl-role-card[data-r="campus"]  .tl-rc-icon { background: rgba(200,90,18,0.1); }
.tray-landing .tl-role-card h3 {
  font-family: var(--font-fraunces), serif; font-size: 20px; font-weight: 900;
  letter-spacing: -0.02em; line-height: 1.1; margin: 0;
}
.tray-landing .tl-role-card h3 .tl-it { font-style: italic; }
.tray-landing .tl-role-card[data-r="student"] h3 .tl-it { color: var(--tl-student); }
.tray-landing .tl-role-card[data-r="kitchen"] h3 .tl-it { color: var(--tl-kitchen); }
.tray-landing .tl-role-card[data-r="admin"]   h3 .tl-it { color: var(--tl-admin); }
.tray-landing .tl-role-card[data-r="campus"]  h3 .tl-it { color: var(--tl-accent); }
.tray-landing .tl-role-card p { font-size: 13px; color: var(--tl-ink-2); line-height: 1.5; margin: 0; flex: 1; }
.tray-landing .tl-role-card .tl-rc-cta {
  margin-top: auto; display: flex; align-items: center; justify-content: space-between;
  font-family: var(--font-dm-mono), monospace; font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.1em; color: var(--tl-ink-3); padding: 8px 12px;
  background: var(--tl-bg-3); border: 1px solid var(--tl-line); border-radius: 8px;
  transition: color .15s, border-color .15s; font-weight: 500;
}
.tray-landing .tl-role-card:hover .tl-rc-cta { color: var(--tl-ink); border-color: var(--tl-ink-4); }
.tray-landing .tl-role-card[data-r="campus"] .tl-rc-cta { opacity: 0.55; }

/* ═══════════════════════════════════════════
   CLOSING CTA
   ═══════════════════════════════════════════ */
.tray-landing .tl-closing {
  padding: 112px 0; text-align: center; position: relative;
  overflow: hidden; border-top: 1px solid var(--tl-line);
}
@media (min-width: 768px) { .tray-landing .tl-closing { padding: 164px 0; } }
.tray-landing .tl-closing::before {
  content: ""; position: absolute; left: 50%; top: 0; width: 700px; height: 360px;
  background: radial-gradient(ellipse at center top, rgba(200,90,18,0.13), transparent 70%);
  transform: translateX(-50%); pointer-events: none;
}
.tray-landing .tl-closing::after {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(200,90,18,0.06), transparent);
  pointer-events: none; z-index: 0;
}
.tray-landing .tl-closing h2 {
  font-family: var(--font-fraunces), serif; font-weight: 900;
  font-size: clamp(56px, 11vw, 148px); line-height: 0.92; letter-spacing: -0.04em;
  margin: 0 0 22px; color: var(--tl-ink); position: relative; z-index: 2;
}
.tray-landing .tl-closing h2 .tl-it { font-style: italic; color: var(--tl-accent); }
.tray-landing .tl-closing p {
  color: var(--tl-ink-2); font-size: 16.5px; max-width: 50ch;
  margin: 0 auto 32px; position: relative; z-index: 2; padding: 0 16px;
}
.tray-landing .tl-closing .tl-cta-row {
  display: flex; gap: 12px; justify-content: center;
  flex-wrap: wrap; position: relative; z-index: 2; padding: 0 16px;
}

/* ═══════════════════════════════════════════
   LINE LEAVE WIDGET
   ═══════════════════════════════════════════ */
.tray-landing .tl-line-leave { padding: 56px 0; position: relative; z-index: 2; }
.tray-landing .tl-line-leave-grid { display: grid; grid-template-columns: 1fr; gap: 26px; align-items: start; }
@media (min-width: 900px) { .tray-landing .tl-line-leave-grid { grid-template-columns: 1.1fr 1fr; gap: 44px; } }
.tray-landing .tl-line-leave-title { font-family: var(--font-fraunces), serif; font-size: clamp(30px, 4.5vw, 44px); letter-spacing: -0.03em; margin: 0 0 10px; font-weight: 900; line-height: 1.05; }
.tray-landing .tl-line-leave-title .tl-it { font-style: italic; color: var(--tl-accent); }
.tray-landing .tl-line-leave-lede { color: var(--tl-ink-2); font-size: 14.5px; line-height: 1.55; margin: 0; max-width: 44ch; }
.tray-landing .tl-line-leave-panel { display: flex; flex-direction: column; gap: 9px; padding: 18px; border-radius: 15px; border: 1px solid var(--tl-line); background: var(--tl-bg-2); }
.tray-landing .tl-line-chip { text-align: left; padding: 13px 15px; border-radius: 11px; border: 1px solid var(--tl-line); background: var(--tl-bg-3); font-size: 13.5px; font-weight: 500; transition: border-color .2s, background .2s; }
.tray-landing .tl-line-chip:hover { border-color: var(--tl-line-2); }
.tray-landing .tl-line-chip.is-on { border-color: rgba(200,90,18,0.50); background: rgba(200,90,18,0.08); color: var(--tl-ink); }
.tray-landing .tl-line-hint { margin: 7px 2px 0; font-size: 13.5px; line-height: 1.5; color: var(--tl-ink-2); min-height: 3em; }
.tray-landing .tl-line-hint.is-fading { opacity: 0; transition: opacity .2s; }

/* ═══════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════ */
.tray-landing .tl-footer {
  padding: 52px 0 calc(22px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--tl-line); background: var(--tl-bg-2);
}
@media (min-width: 768px) { .tray-landing .tl-footer { padding: 68px 0 32px; } }
.tray-landing .tl-footer-row1 {
  display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-bottom: 36px;
}
@media (min-width: 768px) { .tray-landing .tl-footer-row1 { grid-template-columns: 2fr 1fr 1fr 1fr; gap: 44px; margin-bottom: 52px; } }
.tray-landing .tl-footer h4 {
  font-family: var(--font-dm-mono), monospace; font-size: 10.5px; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--tl-ink-3); margin: 0 0 12px; font-weight: 600;
}
.tray-landing .tl-footer .tl-links { display: flex; flex-direction: column; gap: 9px; font-size: 13.5px; color: var(--tl-ink-2); }
.tray-landing .tl-footer .tl-links a { text-decoration: none; color: var(--tl-ink-2); transition: color .15s; }
.tray-landing .tl-footer .tl-links a:hover { color: var(--tl-ink); }
.tray-landing .tl-footer-tag { font-size: 13.5px; color: var(--tl-ink-2); max-width: 32ch; line-height: 1.6; margin-top: 12px; }
.tray-landing .tl-footer-mark {
  font-family: var(--font-fraunces), serif;
  font-size: clamp(64px, 20vw, 220px); line-height: 0.85;
  letter-spacing: -0.04em; color: rgba(17,17,17,0.04); text-align: center;
  font-weight: 900; user-select: none; margin: 28px 0 0; overflow: hidden;
  max-width: 100%; border-top: 1px solid var(--tl-line); padding-top: 22px;
}
.tray-landing .tl-footer-mark .tl-it { font-style: italic; color: rgba(200,90,18,0.10); }
.tray-landing .tl-footer-bot {
  display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px;
  align-items: center; padding-top: 22px;
  font-family: var(--font-dm-mono), monospace; font-size: 10.5px;
  color: var(--tl-ink-4); letter-spacing: 0.08em; font-weight: 500;
}

/* ═══════════════════════════════════════════
   REDUCED MOTION
   ═══════════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  .tray-landing .tl-ticker-track,
  .tray-landing .tl-ticker-track-2 { animation: none; }
  .tray-landing .tl-live .tl-d { animation: none; }
  .tray-landing .tl-arr .tl-dot { animation: none; }
  .tray-landing .tl-btn { transition: none; }
  .tray-landing .tl-portal { transition: none; }
  .tray-landing .tl-scroll-hint .tl-sh-dot::after { animation: none; }
}
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function BrandMark() {
  return (
    <Link href="/" className="tl-brand">
      <span className="tl-brand-mark">T</span>
      Tray<span className="tl-brand-dot">.</span>
    </Link>
  );
}

function PortalPreview({ src, title }: { src: string; title: string }) {
  return (
    <>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
        scrolling="no"
      />
      <span className="tl-portal-overlay" />
    </>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TICKER_ROW_1 = [
  "Engineering Block",
  "Main Canteen",
  "Hostel Mess",
  "Sports Café",
  "Night Canteen",
  "Library Canteen",
] as const;

const TICKER_ROW_2 = [
  "Queue live",
  "UPI confirmed",
  "OTP verified",
  "Specials updated",
  "Multi-canteen",
  "Realtime sync",
] as const;

const STACK_ITEMS = [
  ["Next.js 15",        "FRAMEWORK · APP ROUTER + RSC"],
  ["TypeScript",        "LANGUAGE · STRICT MODE"],
  ["Tailwind CSS v4",   "STYLING · DESIGN TOKENS"],
  ["Supabase",          "DB · AUTH · STORAGE"],
  ["Postgres + RLS",    "DATA · MULTI-TENANT"],
  ["Supabase Realtime", "LIVE · WEBSOCKETS"],
  ["Razorpay",          "PAYMENTS · UPI"],
  ["Vercel · Edge",     "HOSTING · CDN"],
] as const;

const CANTEENS = [
  { name: "Main Canteen",  loc: "Engineering Block", open: true  },
  { name: "Hostel Mess",   loc: "Residential Zone",  open: true  },
  { name: "Sports Café",   loc: "Athletic Block",    open: false },
  { name: "Night Canteen", loc: "Library Block",     open: true  },
] as const;

const SCOPE_CARDS = [
  { role: "student", label: "Student",       desc: "Sees all active canteens on campus. Switches between them before adding to cart." },
  { role: "kitchen", label: "Kitchen Staff", desc: "Sees only the live queue for their one assigned canteen." },
  { role: "admin",   label: "Canteen Admin", desc: "Manages one canteen's menu, staff, orders, and revenue." },
  { role: "campus",  label: "Campus Admin",  desc: "Full campus view — all canteens, analytics, permissions, and staff." },
] as const;

// ─── HeroWords helper ──────────────────────────────────────────────────────────

function HeroLine({ text, italic }: { text: string; italic?: boolean }) {
  const words = text.split(/\s+/);
  return (
    <>
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          className={italic ? "tl-word tl-it" : "tl-word"}
        >
          {w}{" "}
        </span>
      ))}
    </>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function LandingPage({ tenant }: { tenant: ResolvedTenant | null }) {
  const campusName = tenant?.college_name ?? "Your College Campus";
  const campusSlug = tenant?.college_slug ?? "campus";

  // Duplicate ticker rows for seamless loop
  const ticker1 = [...TICKER_ROW_1, ...TICKER_ROW_1];
  const ticker2 = [...TICKER_ROW_2, ...TICKER_ROW_2];

  return (
    <div className="tray-landing">
      <style dangerouslySetInnerHTML={{ __html: SCOPED_CSS }} />

      {/* Grain, progress bar, cursors */}
      <div className="tl-grain" aria-hidden />
      <div className="tl-progress" aria-hidden><div className="tl-progress-bar" /></div>
      <div className="tl-cursor-ring" aria-hidden />
      <div className="tl-cursor-dot"  aria-hidden />

      <LandingMotion />
      <DemoEntryTransition />

      {/* Accessibility */}
      <a href="#main" className="tl-skip">Skip to content</a>

      {/* ── NAV ──────────────────────────────────────────────────────────────── */}
      {/*
        Pure-CSS hamburger: hidden checkbox controls .tl-mobile-menu display.
        The label wraps the hamburger icon bars.
        No useState / "use client" needed.
      */}
      <input type="checkbox" id="tl-ham" className="tl-ham-input" aria-hidden />
      <nav className="tl-nav" aria-label="Main navigation">
        <div className="tl-nav-inner">
          <BrandMark />

          <div className="tl-nav-links" role="list">
            <a href="#system"   role="listitem">System</a>
            <a href="#campus"   role="listitem">Campus</a>
            <a href="#sync"     role="listitem">Realtime</a>
            <a href="#flow"     role="listitem">How it works</a>
            <a href="#stack"    role="listitem">Stack</a>
            <a href="#try-demo" role="listitem">Demo</a>
          </div>

          <div className="tl-nav-cta">
            <Link href="/login" className="tl-btn tl-btn-ghost">Sign in</Link>
            <a href="#try-demo"  className="tl-btn tl-btn-pri">Try demo →</a>
            {/* Hamburger label — visible on mobile only */}
            <label
              htmlFor="tl-ham"
              className="tl-ham-btn"
              aria-label="Toggle navigation menu"
            >
              <span className="tl-ham-bar" />
              <span className="tl-ham-bar" />
              <span className="tl-ham-bar" />
            </label>
          </div>
        </div>
      </nav>

      {/* Mobile slide-down sheet */}
      <div className="tl-mobile-menu" role="navigation" aria-label="Mobile navigation">
        <a href="#system">System</a>
        <a href="#campus">Campus</a>
        <a href="#sync">Realtime</a>
        <a href="#flow">How it works</a>
        <a href="#stack">Stack</a>
        <a href="#try-demo">Demo</a>
        <div className="tl-mob-sep" />
        <div className="tl-mob-cta">
          <Link href="/login"  className="tl-btn tl-btn-ghost">Sign in</Link>
          <Link href="/get-started" className="tl-btn tl-btn-pri">Get started →</Link>
        </div>
      </div>

      {/* ── MAIN ─────────────────────────────────────────────────────────────── */}
      <main id="main">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="tl-hero tl-wrap">
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
            <HeroLine text="Campus food," />
            <br />
            <HeroLine text="without the queue." italic />
          </h1>

          <div className="tl-hero-meta">
            <p className="tl-hero-lede">
              Students order from any canteen in their campus. Kitchens run live queues.
              Admins see orders, revenue, and handovers in real time.
            </p>
            <div className="tl-hero-cta">
              <div className="tl-row">
                <a href="#try-demo"    className="tl-btn tl-btn-pri tl-btn-lg">Try the full demo →</a>
                <Link href="/get-started" className="tl-btn tl-btn-ghost tl-btn-lg">Set up my campus — free</Link>
              </div>
              <div className="tl-note">DEMO IS LIVE · NO SIGN-UP · 90-SECOND TOUR</div>
            </div>
          </div>

          {/* Stats — 2×2 mobile / 4-col desktop */}
          <div className="tl-hero-stats">
            <div className="tl-hero-stat">
              <div className="tl-v">12<span className="tl-it"> min</span></div>
              <div className="tl-l">Saved per lunch</div>
            </div>
            <div className="tl-hero-stat">
              <div className="tl-v">3</div>
              <div className="tl-l">Role-based portals</div>
            </div>
            <div className="tl-hero-stat">
              <div className="tl-v">UPI</div>
              <div className="tl-l">Native payments</div>
            </div>
            <div className="tl-hero-stat">
              <div className="tl-v">OTP</div>
              <div className="tl-l">Verified handover</div>
            </div>
          </div>

          <div className="tl-scroll-hint" aria-hidden>
            <div className="tl-sh-bar" />
            <div className="tl-sh-dot" />
            <span>Scroll</span>
          </div>
        </section>

        {/* ── TICKER ───────────────────────────────────────────────────────── */}
        <div className="tl-ticker" aria-hidden>
          <div className="tl-ticker-row">
            <div className="tl-ticker-track">
              {ticker1.map((item, i) => (
                <span key={`r1-${i}`} className="tl-ticker-item">
                  <em>●</em> {item}
                </span>
              ))}
            </div>
          </div>
          <div className="tl-ticker-row">
            <div className="tl-ticker-track-2">
              {ticker2.map((item, i) => (
                <span key={`r2-${i}`} className="tl-ticker-item">
                  <em>●</em> {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── PORTALS — #system ────────────────────────────────────────────── */}
        <section className="tl-section tl-wrap" id="system" data-reveal>
          <div className="tl-section-num">
            <span className="tl-bar" /><span className="tl-num">01</span> / THE SYSTEM
          </div>
          <div className="tl-section-head">
            <h2>
              Three portals,<br />
              <span className="tl-it">one source of truth.</span>
            </h2>
            <div className="tl-side">
              Tray runs as a single application with three role-based views. The same data
              drives every screen.{" "}
              <strong style={{ color: "var(--tl-ink)" }}>Open any portal below</strong>{" "}
              — they&apos;re fully functional, no install required.
            </div>
          </div>

          <div className="tl-portals">
            {/* Student */}
            <article className="tl-portal" data-c="student">
              <div className="tl-portal-head">
                <div>
                  <span className="tl-ix">01 — Student</span>
                  <h3>Order &amp;<br /><span className="tl-it">collect.</span></h3>
                </div>
                <span className="tl-portal-dot" />
              </div>
              <div className="tl-portal-frame">
                <span className="tl-device-tag">Laptop · sidebar cart</span>
                <PortalPreview src="/demo/student.html" title="Student app preview" />
              </div>
              <div className="tl-portal-body">
                <p>
                  Dine-in or takeaway up front, veg lane, UPI checkout, live OTP
                  handover — full layout with sidebar cart on wide screens.
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

            {/* Kitchen */}
            <article className="tl-portal" data-c="kitchen">
              <div className="tl-portal-head">
                <div>
                  <span className="tl-ix">02 — Kitchen</span>
                  <h3>Prepare &amp;<br /><span className="tl-it">hand over.</span></h3>
                </div>
                <span className="tl-portal-dot" />
              </div>
              <div className="tl-portal-frame">
                <span className="tl-device-tag">Desktop / tablet · 1440×</span>
                <PortalPreview src="/demo/kitchen.html" title="Kitchen view preview" />
              </div>
              <div className="tl-portal-body">
                <p>
                  Live queue with preparation timers, status updates, and OTP verification
                  on every handover. Add today&apos;s specials → push to every student instantly.
                </p>
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

            {/* Admin */}
            <article className="tl-portal" data-c="admin">
              <div className="tl-portal-head">
                <div>
                  <span className="tl-ix">03 — Admin</span>
                  <h3>Run the<br /><span className="tl-it">operation.</span></h3>
                </div>
                <span className="tl-portal-dot" />
              </div>
              <div className="tl-portal-frame">
                <span className="tl-device-tag">Desktop · 1440×</span>
                <PortalPreview src="/demo/admin.html" title="Admin console preview" />
              </div>
              <div className="tl-portal-body">
                <p>
                  Daily revenue, peak hours, top items, full order history, and menu
                  management — in one polished web console. Every event, live.
                </p>
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

        {/* ── CAMPUS — #campus ─────────────────────────────────────────────── */}
        <section className="tl-section tl-wrap" id="campus" data-reveal>
          <div className="tl-section-num">
            <span className="tl-bar" /><span className="tl-num">CAMPUS</span> / Edition
          </div>
          <div className="tl-section-head">
            <h2>One campus.<br /><span className="tl-it">Many counters.</span></h2>
            <div className="tl-side">
              Tray is campus-scoped for students and canteen-scoped for staff. Everyone
              sees exactly what they need — no more, no less.
            </div>
          </div>
          <div className="tl-campus-box">
            <div className="tl-campus-header">
              <div className="tl-campus-icon">C</div>
              <div className="tl-campus-label">
                <div className="tl-campus-name">{campusName}</div>
                <div className="tl-campus-slug">{campusSlug} · multi-canteen · all roles</div>
              </div>
            </div>
            <div className="tl-canteens">
              {CANTEENS.map(({ name, loc, open }) => (
                <div key={name} className={`tl-canteen-chip ${open ? "is-open" : "is-closed"}`}>
                  <div className="tl-cn">{name}</div>
                  <div className="tl-cl">{open ? "OPEN" : "CLOSED"} · {loc}</div>
                </div>
              ))}
            </div>
            <div className="tl-role-scope">
              {SCOPE_CARDS.map(({ role, label, desc }) => (
                <div key={role} className="tl-scope-card" data-r={role}>
                  <span className="tl-role-tag">{label}</span>
                  <p className="tl-scope-desc">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SYNC — #sync ─────────────────────────────────────────────────── */}
        <section className="tl-sync" id="sync" data-reveal>
          <div className="tl-wrap">
            <div className="tl-section-num">
              <span className="tl-bar" /><span className="tl-num">02</span> / The connected canteen
            </div>
            <div className="tl-sync-grid">
              <div>
                <h2>
                  Add a special.<br />
                  <span className="tl-it">Watch it land everywhere.</span>
                </h2>
                <p className="tl-lede">
                  The kitchen adds a dish today — it appears on every student phone in under
                  300 ms, and an audit-log entry lands in the admin console. One source of
                  truth, three windows, no refresh.
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
                <div className="tl-arr">
                  <div className="tl-line" /><span className="tl-dot" /><span>WRITE · RLS-enforced</span><div className="tl-line" />
                </div>
                <div className="tl-node" data-c="db">
                  <div className="tl-ic">DB</div>
                  <div className="tl-info">
                    <div className="tl-n">Postgres · menu_items table</div>
                    <div className="tl-d">tenant_id scoped · row inserted</div>
                  </div>
                  <span className="tl-role">SOURCE OF TRUTH</span>
                </div>
                <div className="tl-arr">
                  <div className="tl-line" /><span className="tl-dot" style={{ animationDelay: ".4s" }} /><span>FAN OUT · WebSocket</span><div className="tl-line" />
                </div>
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

        {/* ── LINE-LEAVE WIDGET ─────────────────────────────────────────────── */}
        <LandingLineLeave />

        {/* ── PULL QUOTE ───────────────────────────────────────────────────── */}
        <section className="tl-pull tl-wrap" data-reveal>
          <p>
            Lunch is thirty minutes. Students currently spend{" "}
            <span className="tl-it">twelve of them</span> standing in line.
          </p>
          <div className="tl-cite">CAMPUS CANTEEN AUDIT · 2025</div>
        </section>

        {/* ── KITCHEN QUOTE (new section) ───────────────────────────────────── */}
        <section className="tl-kitchen-quote" data-reveal>
          <div className="tl-kq-inner">
            <span className="tl-kq-mark" aria-hidden>&ldquo;</span>
            <p className="tl-kq-text">
              We stopped shouting over the crowd.<br />
              The board calls the order;<br />
              they show a code.<br />
              <span className="tl-lunch">Lunch</span> ends on time.
            </p>
            <div className="tl-kq-credit">Kitchen supervisor · Campus canteen</div>
          </div>
        </section>

        {/* ── FLOW — #flow (5 steps) ────────────────────────────────────────── */}
        <section className="tl-section tl-wrap" id="flow" data-reveal>
          <div className="tl-section-num">
            <span className="tl-bar" /><span className="tl-num">03</span> / How it works
          </div>
          <div className="tl-section-head">
            <h2>Phone to plate,<br /><span className="tl-it">in eleven minutes.</span></h2>
            <div className="tl-side">
              Five touchpoints. The student walks straight to the counter. The kitchen never
              repeats a name. Everyone gets their hour back.
            </div>
          </div>
          <div className="tl-flow">
            <div className="tl-flow-step">
              <div className="tl-ix">01 — 11:40</div>
              <div className="tl-num">01</div>
              <h3>Choose <span className="tl-it">canteen.</span></h3>
              <p>Browse active canteens on your campus. Switch between them freely before adding to cart.</p>
              <div className="tl-tag">→ STATUS: SELECTING</div>
            </div>
            <div className="tl-flow-step">
              <div className="tl-ix">02 — 11:42</div>
              <div className="tl-num">02</div>
              <h3>Browse the <span className="tl-it">menu.</span></h3>
              <p>Live availability, prep times, veg/non-veg filters. Add to cart with one tap.</p>
              <div className="tl-tag">→ STATUS: CART</div>
            </div>
            <div className="tl-flow-step">
              <div className="tl-ix">03 — 11:43</div>
              <div className="tl-num">03</div>
              <h3>Pay by <span className="tl-it">UPI.</span></h3>
              <p>Single-use QR, exact amount. Webhook confirms automatically.</p>
              <div className="tl-tag">→ STATUS: PAID</div>
            </div>
            <div className="tl-flow-step">
              <div className="tl-ix">04 — 11:46</div>
              <div className="tl-num">04</div>
              <h3>Track <span className="tl-it">live.</span></h3>
              <p>Queued → preparing → ready in ~250 ms. No refresh needed.</p>
              <div className="tl-tag">→ STATUS: PREPARING</div>
            </div>
            <div className="tl-flow-step">
              <div className="tl-ix">05 — 11:51</div>
              <div className="tl-num">05</div>
              <h3>Collect with <span className="tl-it">OTP.</span></h3>
              <p>Four-digit code at the counter. Staff marks complete.</p>
              <div className="tl-tag">✓ ORDER CLOSED</div>
            </div>
          </div>
        </section>

        {/* ── STACK — #stack ────────────────────────────────────────────────── */}
        <section className="tl-section tl-wrap" id="stack" data-reveal>
          <div className="tl-section-num">
            <span className="tl-bar" /><span className="tl-num">04</span> / Built with
          </div>
          <div className="tl-section-head">
            <h2>A boring stack,<br /><span className="tl-it">on purpose.</span></h2>
            <div className="tl-side">
              Everything is on a free tier until you have real users. No exotic infrastructure.
              No vendor lock-in surprises.
            </div>
          </div>
          <div className="tl-stack">
            {STACK_ITEMS.map(([n, r]) => (
              <div key={n} className="tl-stack-card">
                <span className="tl-n">{n}</span>
                <span className="tl-r">{r}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── TRY-DEMO — #try-demo ─────────────────────────────────────────── */}
        <section className="tl-section tl-wrap" id="try-demo" data-reveal>
          <div className="tl-section-num">
            <span className="tl-bar" /><span className="tl-num">DEMO</span> / Choose your portal
          </div>
          <div className="tl-section-head">
            <h2>Try Tray as the<br /><span className="tl-it">person using it.</span></h2>
            <div className="tl-side">
              Choose a role. Same product, different view. No sign-up. No install.
              All three portals are live — open any one and explore freely.
            </div>
          </div>
          <div className="tl-role-cards">
            <a href="/demo/student.html" className="tl-role-card" data-r="student">
              <div className="tl-rc-icon">🎓</div>
              <h3>Student<br /><span className="tl-it">portal.</span></h3>
              <p>Browse the menu, pick dine-in or takeaway, pay by UPI, and track your order live. Walk to the counter, show the OTP.</p>
              <div className="tl-rc-cta"><span>Open student app</span><span>→</span></div>
            </a>
            <a href="/demo/kitchen.html" className="tl-role-card" data-r="kitchen">
              <div className="tl-rc-icon">🍳</div>
              <h3>Kitchen<br /><span className="tl-it">staff.</span></h3>
              <p>Live order queue with SLA timers, status updates, and OTP verification at handover. Add today&apos;s specials in seconds.</p>
              <div className="tl-rc-cta"><span>Open kitchen view</span><span>→</span></div>
            </a>
            <a href="/demo/admin.html" className="tl-role-card" data-r="admin">
              <div className="tl-rc-icon">📊</div>
              <h3>Canteen<br /><span className="tl-it">admin.</span></h3>
              <p>Revenue, peak-hour heatmaps, top items, full audit log, menu management, and staff controls — all in one console.</p>
              <div className="tl-rc-cta"><span>Open admin console</span><span>→</span></div>
            </a>
            <div className="tl-role-card" data-r="campus">
              <div className="tl-rc-icon">🏫</div>
              <h3>Campus<br /><span className="tl-it">admin.</span></h3>
              <p>Full campus overview — every canteen, all analytics, permissions, and staff in one place. Coming in the next release.</p>
              <div className="tl-rc-cta"><span>Coming soon</span><span>·</span></div>
            </div>
          </div>
        </section>

        {/* ── CLOSING ──────────────────────────────────────────────────────── */}
        <section className="tl-closing" data-reveal>
          <div className="tl-wrap">
            <div
              className="tl-section-num"
              style={{ justifyContent: "center", marginBottom: 22 }}
            >
              <span className="tl-bar" />
              <span className="tl-num">DEMO</span> / Live · clickable · no sign-up
            </div>
            <h2>Run lunch<br /><span className="tl-it">without the rush.</span></h2>
            <p>
              Three screens. One lunch service. Built for college canteens tired of
              printed tokens.
            </p>
            <div className="tl-cta-row">
              <a href="#try-demo"       className="tl-btn tl-btn-pri   tl-btn-lg">Try full demo →</a>
              <Link href="/get-started" className="tl-btn tl-btn-ghost tl-btn-lg">Set up my campus — free</Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="tl-footer tl-wrap">
        <div className="tl-footer-row1">
          <div>
            <BrandMark />
            <p className="tl-footer-tag">
              A campus canteen ordering system. Multi-tenant, source-available, built for India.
            </p>
          </div>
          <div>
            <h4>Product</h4>
            <div className="tl-links">
              <Link href="/menu">Student app</Link>
              <Link href="/kitchen">Kitchen view</Link>
              <Link href="/admin/dashboard">Admin console</Link>
              <Link href="/get-started">Get started</Link>
            </div>
          </div>
          <div>
            <h4>Resources</h4>
            <div className="tl-links">
              <a href="https://github.com/thribhuvan003/Tray/blob/main/README.md"        target="_blank" rel="noreferrer">README</a>
              <a href="https://github.com/thribhuvan003/Tray/tree/main/docs/adr"         target="_blank" rel="noreferrer">Architecture</a>
              <a href="https://github.com/thribhuvan003/Tray/blob/main/SECURITY.md"      target="_blank" rel="noreferrer">Security</a>
              <a href="https://github.com/thribhuvan003/Tray/blob/main/CONTRIBUTING.md"  target="_blank" rel="noreferrer">Contributing</a>
            </div>
          </div>
          <div>
            <h4>Contact</h4>
            <div className="tl-links">
              <a href="https://github.com/thribhuvan003" target="_blank" rel="noreferrer">
                github.com/thribhuvan003
              </a>
            </div>
          </div>
        </div>

        <div className="tl-footer-mark" aria-hidden>
          tra<span className="tl-it">y</span>
        </div>

        <div className="tl-footer-bot">
          <span>BUILT FOR CAMPUS CANTEENS · MADE IN INDIA</span>
          <span>v3.0 · 2026</span>
        </div>
      </footer>
    </div>
  );
}
