import Link from "next/link";
import type { ResolvedTenant } from "@/lib/tenant";

// Editorial dark landing — warm dark + persimmon, Instrument Serif headlines.
// All styles scoped to .tray-landing so they never bleed into the student /
// kitchen / admin portals. Forces dark regardless of the user's theme.

const SCOPED_CSS = `
html { scroll-behavior: smooth; }
.tray-landing {
  --tl-bg: #0D1220;
  --tl-bg-2: #111828;
  --tl-bg-3: #161F32;
  --tl-bg-4: #1C2740;
  --tl-line: rgba(196, 168, 130, 0.10);
  --tl-line-2: rgba(196, 168, 130, 0.20);
  --tl-ink: #E8E4DC;
  --tl-ink-2: #B5ADA0;
  --tl-ink-3: #7A7268;
  --tl-ink-4: #4A4540;
  --tl-persimmon: #C4A882;
  --tl-student: #6AABDC;
  --tl-kitchen: #D4854A;
  --tl-admin: #8BBFA0;
  --tl-good: #7BAA90;

  background: linear-gradient(170deg, #0D1220 0%, #141D38 55%, #0D1220 100%);
  color: var(--tl-ink);
  font-family: var(--font-geist), var(--font-inter), ui-sans-serif, system-ui;
  font-feature-settings: "ss01";
  font-size: 15px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  min-height: 100vh;
  scroll-behavior: smooth;
}

/* Sky atmosphere — cloud glows that shift subtly like dusk light */
.tray-landing::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(ellipse 90% 40% at 20% 5%, rgba(196,168,130,0.07) 0%, transparent 60%),
    radial-gradient(ellipse 60% 30% at 80% 10%, rgba(100,140,200,0.06) 0%, transparent 55%),
    radial-gradient(ellipse 70% 25% at 50% 0%, rgba(180,200,240,0.04) 0%, transparent 50%);
}
.tray-landing ::selection { background: var(--tl-persimmon); color: var(--tl-bg); }
.tray-landing .tl-serif { font-family: var(--font-instrument-serif), ui-serif, Georgia; font-weight: 400; }
.tray-landing .tl-italic { font-family: var(--font-instrument-serif), ui-serif, Georgia; font-style: italic; font-weight: 400; }
.tray-landing .tl-mono { font-family: var(--font-geist-mono), var(--font-jetbrains), ui-monospace, Menlo, monospace; font-feature-settings: "ss01"; }

.tray-landing .tl-grain {
  position: fixed; inset: -30%; pointer-events: none; z-index: 1; opacity: .03; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.tray-landing .tl-wrap { max-width: 1280px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 2; }
@media (min-width: 768px) { .tray-landing .tl-wrap { padding: 0 56px; } }

/* Nav */
.tray-landing .tl-nav { position: sticky; top: 0; z-index: 50; backdrop-filter: blur(24px) saturate(1.6); background: rgba(13, 18, 32, 0.80); border-bottom: 1px solid var(--tl-line); }
.tray-landing .tl-nav-inner { max-width: 1280px; margin: 0 auto; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
@media (min-width: 768px) { .tray-landing .tl-nav-inner { padding: 14px 56px; } }
.tray-landing .tl-brand { display: flex; align-items: center; gap: 10px; font-family: var(--font-instrument-serif), serif; font-size: 26px; letter-spacing: -0.02em; font-weight: 400; }
.tray-landing .tl-brand .tl-brand-dot { font-style: italic; color: var(--tl-persimmon); }
.tray-landing .tl-brand-mark { width: 32px; height: 32px; border-radius: 7px; background: linear-gradient(135deg, var(--tl-persimmon), #c5421d); display: inline-flex; align-items: center; justify-content: center; font-family: var(--font-instrument-serif), serif; font-weight: 400; font-size: 18px; color: var(--tl-ink); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .15); }
.tray-landing .tl-nav-links { display: none; gap: 32px; font-size: 14px; color: var(--tl-ink-2); }
@media (min-width: 900px) { .tray-landing .tl-nav-links { display: flex; } }
.tray-landing .tl-nav-links a:hover { color: var(--tl-ink); }
.tray-landing .tl-nav-cta { display: flex; gap: 10px; align-items: center; }

.tray-landing .tl-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 18px; border-radius: 999px; font-size: 14px; font-weight: 500; border: 1px solid transparent; transition: transform .12s cubic-bezier(0.16,1,0.3,1), background .15s, color .15s, border-color .15s; line-height: 1; font-family: inherit; cursor: pointer; }
.tray-landing .tl-btn:hover { transform: translateY(-2px); }
.tray-landing .tl-btn:active { transform: translateY(0); }
.tray-landing .tl-btn-pri { background: var(--tl-ink); color: var(--tl-bg); border-color: var(--tl-ink); }
.tray-landing .tl-btn-pri:hover { background: #fff; }
.tray-landing .tl-btn-ghost { color: var(--tl-ink); background: transparent; border-color: var(--tl-line-2); }
.tray-landing .tl-btn-ghost:hover { background: rgba(255, 255, 255, .05); border-color: var(--tl-ink-3); }
.tray-landing .tl-btn-lg { padding: 14px 24px; font-size: 15px; }

/* Hero */
.tray-landing .tl-hero { padding: 80px 0 64px; position: relative; }
@media (min-width: 768px) { .tray-landing .tl-hero { padding: 96px 0 80px; } }
.tray-landing .tl-hero::before { content: ""; position: absolute; left: 50%; top: -200px; width: 1200px; height: 1200px; border-radius: 50%; background: radial-gradient(circle, rgba(196, 168, 130, 0.10) 0%, rgba(100, 140, 200, 0.04) 45%, transparent 65%); transform: translateX(-50%); pointer-events: none; z-index: 0; }
.tray-landing .tl-hero-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; font-family: var(--font-geist-mono), monospace; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--tl-ink-3); padding-bottom: 24px; border-bottom: 1px solid var(--tl-line); margin-bottom: 40px; font-weight: 500; flex-wrap: wrap; }
.tray-landing .tl-hero-top .tl-l, .tray-landing .tl-hero-top .tl-r { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.tray-landing .tl-live { display: inline-flex; align-items: center; gap: 8px; color: var(--tl-good); text-transform: none; letter-spacing: 0.02em; font-family: var(--font-geist), sans-serif; font-weight: 500; font-size: 12px; }
.tray-landing .tl-live .tl-d { width: 7px; height: 7px; border-radius: 50%; background: var(--tl-good); animation: tlLive 2s infinite; }
@keyframes tlLive { 0% { box-shadow: 0 0 0 0 rgba(123, 170, 144, 0.5); } 70% { box-shadow: 0 0 0 8px rgba(123, 170, 144, 0); } 100% { box-shadow: 0 0 0 0 rgba(123, 170, 144, 0); } }

.tray-landing .tl-h1 { font-family: var(--font-instrument-serif), serif; font-weight: 400; font-size: clamp(56px, 11vw, 160px); line-height: 0.9; letter-spacing: -0.035em; margin: 0 0 32px; max-width: 14ch; }
.tray-landing .tl-h1 .tl-it { font-style: italic; color: var(--tl-persimmon); }

/* Word reveal animation */
.tray-landing .tl-word { display: inline-block; clip-path: inset(0 100% 0 0); animation: tlWord 0.75s cubic-bezier(0.16,1,0.3,1) forwards; }
.tray-landing .tl-word:nth-child(1) { animation-delay: 0.2s; }
.tray-landing .tl-word:nth-child(2) { animation-delay: 0.35s; }
.tray-landing .tl-word:nth-child(3) { animation-delay: 0.5s; }
.tray-landing .tl-word:nth-child(4) { animation-delay: 0.65s; }
@keyframes tlWord { to { clip-path: inset(0 0% 0 0); } }

.tray-landing .tl-hero-meta { display: grid; grid-template-columns: 1fr; gap: 32px; align-items: flex-end; margin-bottom: 48px; }
@media (min-width: 960px) { .tray-landing .tl-hero-meta { grid-template-columns: 1.2fr 1fr; gap: 64px; } }
.tray-landing .tl-hero-lede { font-size: 17px; line-height: 1.55; color: var(--tl-ink-2); max-width: 48ch; font-weight: 400; }
@media (min-width: 768px) { .tray-landing .tl-hero-lede { font-size: 19px; } }
.tray-landing .tl-hero-lede .tl-em { color: var(--tl-ink); font-weight: 500; }
.tray-landing .tl-hero-cta { display: flex; flex-direction: column; gap: 14px; align-items: flex-start; }
@media (min-width: 960px) { .tray-landing .tl-hero-cta { align-items: flex-end; } }
.tray-landing .tl-hero-cta .tl-row { display: flex; gap: 12px; flex-wrap: wrap; }
.tray-landing .tl-hero-cta .tl-note { font-family: var(--font-geist-mono), monospace; font-size: 11px; color: var(--tl-ink-3); letter-spacing: 0.08em; text-align: left; }
@media (min-width: 960px) { .tray-landing .tl-hero-cta .tl-note { text-align: right; } }

.tray-landing .tl-hero-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0; padding: 24px 0 0; border-top: 1px solid var(--tl-line); }
@media (min-width: 768px) { .tray-landing .tl-hero-stats { grid-template-columns: repeat(4, 1fr); padding-top: 32px; } }
.tray-landing .tl-hero-stat { padding: 16px 16px 16px 0; border-right: 1px solid var(--tl-line); display: flex; flex-direction: column; gap: 4px; }
@media (min-width: 768px) { .tray-landing .tl-hero-stat { padding: 0 24px 0 0; } .tray-landing .tl-hero-stat:not(:first-child) { padding-left: 24px; } }
.tray-landing .tl-hero-stat:nth-child(2n) { border-right: 0; }
@media (min-width: 768px) { .tray-landing .tl-hero-stat:nth-child(2n) { border-right: 1px solid var(--tl-line); } .tray-landing .tl-hero-stat:last-child { border-right: 0; } }
.tray-landing .tl-hero-stat .tl-v { font-family: var(--font-instrument-serif), serif; font-size: clamp(32px, 5vw, 48px); letter-spacing: -0.025em; line-height: 1; font-weight: 400; }
.tray-landing .tl-hero-stat .tl-v .tl-it { font-style: italic; color: var(--tl-persimmon); }
.tray-landing .tl-hero-stat .tl-l { font-family: var(--font-geist-mono), monospace; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--tl-ink-3); font-weight: 500; }

/* Ticker strip */
.tray-landing .tl-ticker { overflow: hidden; border-top: 1px solid var(--tl-line); border-bottom: 1px solid var(--tl-line); padding: 8px 0; background: rgba(196,168,130,0.03); }
.tray-landing .tl-ticker-track { display: flex; gap: 48px; width: max-content; animation: tlTicker 30s linear infinite; font-family: monospace; font-size: 11px; color: var(--tl-ink-3); letter-spacing: 0.1em; text-transform: uppercase; white-space: nowrap; }
.tray-landing .tl-ticker-track span.on { color: var(--tl-good); }
@keyframes tlTicker { from { transform: translateX(0); } to { transform: translateX(-50%); } }

/* Section heads */
.tray-landing .tl-section { padding: 80px 0; position: relative; }
@media (min-width: 768px) { .tray-landing .tl-section { padding: 120px 0; } }
.tray-landing .tl-section-num { font-family: var(--font-geist-mono), monospace; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--tl-ink-3); display: flex; align-items: center; gap: 10px; margin-bottom: 18px; font-weight: 500; }
.tray-landing .tl-section-num .tl-bar { width: 24px; height: 1px; background: var(--tl-ink-4); }
.tray-landing .tl-section-num .tl-num { color: var(--tl-persimmon); font-weight: 600; }
.tray-landing .tl-section-head { display: grid; grid-template-columns: 1fr; gap: 32px; align-items: flex-end; margin-bottom: 40px; }
@media (min-width: 900px) { .tray-landing .tl-section-head { grid-template-columns: 1.3fr 1fr; gap: 80px; margin-bottom: 56px; } }
.tray-landing .tl-section-head h2 { margin: 0; font-family: var(--font-instrument-serif), serif; font-weight: 400; font-size: clamp(40px, 7vw, 96px); letter-spacing: -0.03em; line-height: 0.94; }
.tray-landing .tl-section-head h2 .tl-it { font-style: italic; color: var(--tl-persimmon); }
.tray-landing .tl-section-head .tl-side { color: var(--tl-ink-2); max-width: 42ch; font-size: 16px; line-height: 1.6; }

/* Portal preview cards */
.tray-landing .tl-portals { display: grid; grid-template-columns: 1fr; gap: 18px; }
@media (min-width: 720px) { .tray-landing .tl-portals { grid-template-columns: repeat(3, 1fr); } }
.tray-landing .tl-portal { background: var(--tl-bg-2); border: 1px solid var(--tl-line); border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; position: relative; transition: transform .25s, border-color .2s, box-shadow .25s; }
.tray-landing .tl-portal:hover { transform: translateY(-4px); border-color: rgba(196,168,130,0.25); box-shadow: 0 20px 60px rgba(0, 0, 0, .5), 0 0 40px rgba(100,140,200,0.04); }
.tray-landing .tl-portal-head { padding: 22px 24px 14px; display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; border-bottom: 1px solid var(--tl-line); }
.tray-landing .tl-portal-head .tl-ix { font-family: var(--font-geist-mono), monospace; font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--tl-ink-3); font-weight: 500; }
.tray-landing .tl-portal-head h3 { font-family: var(--font-instrument-serif), serif; font-size: 30px; letter-spacing: -0.025em; margin: 6px 0 0; font-weight: 400; line-height: 1.05; }
.tray-landing .tl-portal-head h3 .tl-it { font-style: italic; }
.tray-landing .tl-portal-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 6px; }
.tray-landing .tl-portal[data-c="student"] .tl-portal-dot { background: var(--tl-student); box-shadow: 0 0 14px var(--tl-student); }
.tray-landing .tl-portal[data-c="kitchen"] .tl-portal-dot { background: var(--tl-kitchen); box-shadow: 0 0 14px var(--tl-kitchen); }
.tray-landing .tl-portal[data-c="admin"] .tl-portal-dot { background: var(--tl-admin); box-shadow: 0 0 14px var(--tl-admin); }
.tray-landing .tl-portal[data-c="student"] .tl-portal-head h3 .tl-it { color: var(--tl-student); }
.tray-landing .tl-portal[data-c="kitchen"] .tl-portal-head h3 .tl-it { color: var(--tl-kitchen); }
.tray-landing .tl-portal[data-c="admin"] .tl-portal-head h3 .tl-it { color: var(--tl-admin); }

.tray-landing .tl-portal-frame { position: relative; height: 280px; overflow: hidden; background: var(--tl-bg-3); border-bottom: 1px solid var(--tl-line); }
@media (min-width: 720px) { .tray-landing .tl-portal-frame { height: 420px; } }
.tray-landing .tl-portal-frame iframe { position: absolute; top: 0; left: 0; width: 200%; height: 200%; transform: scale(0.5); transform-origin: 0 0; border: 0; pointer-events: none; background: var(--tl-bg-3); }
.tray-landing .tl-portal-frame .tl-portal-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 60%, var(--tl-bg-2) 100%); pointer-events: none; z-index: 2; }
.tray-landing .tl-portal-frame .tl-device-tag { position: absolute; top: 14px; left: 14px; font-family: var(--font-geist-mono), monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--tl-ink-3); background: rgba(14, 10, 6, 0.7); padding: 4px 10px; border-radius: 5px; font-weight: 500; z-index: 3; backdrop-filter: blur(4px); }

.tray-landing .tl-portal-body { padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 14px; }
.tray-landing .tl-portal-body p { color: var(--tl-ink-2); font-size: 14px; line-height: 1.55; margin: 0; }
.tray-landing .tl-feat-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.tray-landing .tl-feat-tag { padding: 4px 9px; background: var(--tl-bg-3); border: 1px solid var(--tl-line); border-radius: 5px; font-family: var(--font-geist-mono), monospace; font-size: 10.5px; color: var(--tl-ink-2); font-weight: 500; letter-spacing: 0.04em; }
.tray-landing .tl-portal-open { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--tl-bg-3); border: 1px solid var(--tl-line); border-radius: 10px; margin-top: auto; font-size: 13px; font-weight: 500; transition: all .2s; color: var(--tl-ink); }
.tray-landing .tl-portal-open:hover { background: var(--tl-bg-4); border-color: var(--tl-ink-4); }
.tray-landing .tl-portal[data-c="student"] .tl-portal-open:hover { border-color: var(--tl-student); color: var(--tl-student); }
.tray-landing .tl-portal[data-c="kitchen"] .tl-portal-open:hover { border-color: var(--tl-kitchen); color: var(--tl-kitchen); }
.tray-landing .tl-portal[data-c="admin"] .tl-portal-open:hover { border-color: var(--tl-admin); color: var(--tl-admin); }
.tray-landing .tl-portal-open .tl-arrow { transition: transform .2s; }
.tray-landing .tl-portal-open:hover .tl-arrow { transform: translateX(4px); }

/* Sync section */
.tray-landing .tl-sync { padding: 96px 0; background: linear-gradient(135deg, #111828 0%, #131C32 100%); border-top: 1px solid var(--tl-line); border-bottom: 1px solid var(--tl-line); position: relative; overflow: hidden; }
@media (min-width: 768px) { .tray-landing .tl-sync { padding: 140px 0; } }
.tray-landing .tl-sync-grid { display: grid; grid-template-columns: 1fr; gap: 48px; align-items: center; }
@media (min-width: 960px) { .tray-landing .tl-sync-grid { grid-template-columns: 1fr 1.4fr; gap: 64px; } }
.tray-landing .tl-sync-grid h2 { font-family: var(--font-instrument-serif), serif; font-weight: 400; font-size: clamp(40px, 7vw, 88px); line-height: 0.95; letter-spacing: -0.03em; margin: 0 0 24px; font-style: italic; }
.tray-landing .tl-sync-grid h2 .tl-it { font-style: italic; color: var(--tl-persimmon); }
.tray-landing .tl-sync-grid .tl-lede { font-size: 17px; line-height: 1.6; color: var(--tl-ink-2); margin: 0 0 24px; max-width: 42ch; }
.tray-landing .tl-sync-meta { display: flex; flex-direction: column; gap: 10px; font-family: var(--font-geist-mono), monospace; font-size: 12px; color: var(--tl-ink-2); font-weight: 500; }
.tray-landing .tl-sync-meta .tl-row { display: flex; align-items: center; gap: 14px; }
.tray-landing .tl-sync-meta .tl-k { color: var(--tl-persimmon); width: 70px; flex-shrink: 0; }

.tray-landing .tl-diagram { background: var(--tl-bg-3); border: 1px solid var(--tl-line); border-radius: 18px; padding: 24px; position: relative; display: flex; flex-direction: column; gap: 14px; overflow: hidden; }
@media (min-width: 768px) { .tray-landing .tl-diagram { padding: 32px; gap: 18px; } }
.tray-landing .tl-node { padding: 14px 18px; background: var(--tl-bg-2); border: 1px solid var(--tl-line); border-radius: 12px; display: flex; align-items: center; gap: 14px; position: relative; transition: transform .2s, border-color .2s; cursor: default; }
.tray-landing .tl-node:hover { border-color: var(--tl-line-2); }
.tray-landing .tl-node .tl-ic { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: var(--font-geist-mono), monospace; font-weight: 700; font-size: 14px; flex-shrink: 0; }
.tray-landing .tl-node .tl-info { flex: 1; min-width: 0; }
.tray-landing .tl-node .tl-info .tl-n { font-size: 14px; font-weight: 600; }
.tray-landing .tl-node .tl-info .tl-d { font-family: var(--font-geist-mono), monospace; font-size: 11px; color: var(--tl-ink-3); letter-spacing: 0.04em; margin-top: 2px; }
.tray-landing .tl-node .tl-role { font-family: var(--font-geist-mono), monospace; font-size: 10.5px; letter-spacing: 0.08em; font-weight: 600; text-transform: uppercase; padding: 3px 8px; border-radius: 5px; white-space: nowrap; }
.tray-landing .tl-node[data-c="kitchen"] .tl-ic, .tray-landing .tl-node[data-c="kitchen"] .tl-role { color: var(--tl-kitchen); background: rgba(239, 87, 73, 0.16); }
.tray-landing .tl-node[data-c="student"] .tl-ic, .tray-landing .tl-node[data-c="student"] .tl-role { color: var(--tl-student); background: rgba(92, 177, 255, 0.16); }
.tray-landing .tl-node[data-c="admin"] .tl-ic, .tray-landing .tl-node[data-c="admin"] .tl-role { color: var(--tl-admin); background: rgba(205, 250, 80, 0.16); }
.tray-landing .tl-node[data-c="db"] .tl-ic, .tray-landing .tl-node[data-c="db"] .tl-role { color: var(--tl-persimmon); background: rgba(239, 106, 58, 0.16); }
.tray-landing .tl-arr { display: flex; align-items: center; justify-content: center; gap: 12px; font-family: var(--font-geist-mono), monospace; font-size: 10.5px; color: var(--tl-ink-3); letter-spacing: 0.04em; padding: 4px 0; }
.tray-landing .tl-arr .tl-line { height: 1px; background: var(--tl-line-2); flex: 1; }
.tray-landing .tl-arr .tl-dot { width: 6px; height: 6px; border-radius: 50%; background: #C4A882; box-shadow: 0 0 10px rgba(196,168,130,0.6); animation: tlTravel 3s infinite; }
@keyframes tlTravel { 0%, 100% { opacity: .4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }

/* Pull quote */
.tray-landing .tl-pull { padding: 96px 0; text-align: center; }
@media (min-width: 768px) { .tray-landing .tl-pull { padding: 140px 0; } }
.tray-landing .tl-pull p { font-family: var(--font-instrument-serif), serif; font-size: clamp(40px, 7vw, 88px); line-height: 1.05; letter-spacing: -0.025em; margin: 0 auto; max-width: 24ch; font-weight: 400; color: var(--tl-ink); font-style: italic; }
.tray-landing .tl-pull p .tl-it { font-style: italic; color: var(--tl-persimmon); }
.tray-landing .tl-pull .tl-cite { margin-top: 32px; font-family: var(--font-geist-mono), monospace; font-size: 12px; color: var(--tl-ink-3); letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500; }

/* Flow */
.tray-landing .tl-flow { display: grid; grid-template-columns: 1fr; border: 1px solid var(--tl-line); border-radius: 18px; overflow: hidden; background: var(--tl-bg-2); }
@media (min-width: 720px) { .tray-landing .tl-flow { grid-template-columns: repeat(4, 1fr); } }
.tray-landing .tl-flow-step { padding: 28px 24px; border-bottom: 1px solid var(--tl-line); min-height: 220px; display: flex; flex-direction: column; gap: 12px; transition: background 0.2s; }
.tray-landing .tl-flow-step:hover { background: rgba(196,168,130,0.04); }
@media (min-width: 720px) { .tray-landing .tl-flow-step { padding: 32px 28px; border-bottom: 0; border-right: 1px solid var(--tl-line); min-height: 280px; gap: 14px; } .tray-landing .tl-flow-step:last-child { border-right: 0; } }
.tray-landing .tl-flow-step:last-child { border-bottom: 0; }
.tray-landing .tl-flow-step .tl-ix { font-family: var(--font-geist-mono), monospace; font-size: 11px; color: var(--tl-ink-3); letter-spacing: 0.14em; text-transform: uppercase; font-weight: 500; }
.tray-landing .tl-flow-step .tl-num { font-family: var(--font-instrument-serif), serif; font-size: 64px; letter-spacing: -0.03em; color: var(--tl-persimmon); line-height: .9; font-weight: 400; font-style: italic; margin: auto 0; }
@media (min-width: 768px) { .tray-landing .tl-flow-step .tl-num { font-size: 80px; } }
.tray-landing .tl-flow-step h3 { font-family: var(--font-instrument-serif), serif; font-size: 24px; letter-spacing: -0.02em; margin: 0; font-weight: 400; line-height: 1.1; }
@media (min-width: 768px) { .tray-landing .tl-flow-step h3 { font-size: 26px; } }
.tray-landing .tl-flow-step h3 .tl-it { font-style: italic; color: var(--tl-persimmon); }
.tray-landing .tl-flow-step p { color: var(--tl-ink-2); font-size: 13.5px; line-height: 1.55; margin: 0; max-width: 30ch; }
.tray-landing .tl-flow-step .tl-tag { margin-top: auto; font-family: var(--font-geist-mono), monospace; font-size: 10.5px; color: var(--tl-ink-3); letter-spacing: 0.06em; text-transform: uppercase; font-weight: 600; }

/* Stack */
.tray-landing .tl-stack { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
@media (min-width: 720px) { .tray-landing .tl-stack { grid-template-columns: repeat(4, 1fr); } }
.tray-landing .tl-stack-card { padding: 20px; background: var(--tl-bg-2); border: 1px solid var(--tl-line); border-radius: 12px; display: flex; flex-direction: column; gap: 8px; transition: all 0.2s cubic-bezier(0.16,1,0.3,1); }
.tray-landing .tl-stack-card:hover { border-color: var(--tl-line-2); background: var(--tl-bg-3); }
.tray-landing .tl-stack-card .tl-n { font-weight: 600; font-size: 14px; color: var(--tl-ink); }
.tray-landing .tl-stack-card .tl-r { font-family: var(--font-geist-mono), monospace; font-size: 11px; color: var(--tl-ink-3); letter-spacing: 0.06em; }

/* Closing */
.tray-landing .tl-closing { padding: 120px 0; text-align: center; position: relative; overflow: hidden; border-top: 1px solid var(--tl-line); }
@media (min-width: 768px) { .tray-landing .tl-closing { padding: 180px 0; } }
.tray-landing .tl-closing::before { content: ""; position: absolute; left: 50%; top: 0; width: 900px; height: 500px; background: radial-gradient(ellipse at center top, rgba(196,168,130,0.12) 0%, rgba(100,140,200,0.06) 40%, transparent 70%); transform: translateX(-50%); }
.tray-landing .tl-closing h2 { font-family: var(--font-instrument-serif), serif; font-weight: 400; font-size: clamp(64px, 12vw, 160px); line-height: 0.92; letter-spacing: -0.04em; margin: 0 0 24px; color: var(--tl-ink); position: relative; z-index: 2; }
.tray-landing .tl-closing h2 .tl-it { font-style: italic; color: var(--tl-persimmon); }
.tray-landing .tl-closing p { color: var(--tl-ink-2); font-size: 17px; max-width: 48ch; margin: 0 auto 36px; position: relative; z-index: 2; padding: 0 16px; }
.tray-landing .tl-closing .tl-cta-row { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; position: relative; z-index: 2; padding: 0 16px; }

/* Footer */
.tray-landing .tl-footer { padding: 56px 0 24px; border-top: 1px solid var(--tl-line); background: #0D1220; }
@media (min-width: 768px) { .tray-landing .tl-footer { padding: 72px 0 32px; } }
.tray-landing .tl-footer-row1 { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 40px; }
@media (min-width: 768px) { .tray-landing .tl-footer-row1 { grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 56px; } }
.tray-landing .tl-footer h4 { font-family: var(--font-geist-mono), monospace; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--tl-ink-3); margin: 0 0 14px; font-weight: 600; }
.tray-landing .tl-footer .tl-links { display: flex; flex-direction: column; gap: 10px; font-size: 14px; color: var(--tl-ink-2); }
.tray-landing .tl-footer .tl-links a:hover { color: var(--tl-ink); }
.tray-landing .tl-footer-tag { font-size: 14px; color: var(--tl-ink-2); max-width: 32ch; line-height: 1.6; margin-top: 14px; }
.tray-landing .tl-footer-mark { font-family: var(--font-instrument-serif), serif; font-size: clamp(120px, 22vw, 240px); line-height: 0.86; letter-spacing: -0.04em; color: rgba(196, 168, 130, 0.05); text-align: center; font-weight: 400; user-select: none; margin: 32px 0 0; overflow: hidden; border-top: 1px solid var(--tl-line); padding-top: 24px; }
.tray-landing .tl-footer-mark .tl-it { font-style: italic; color: rgba(196, 168, 130, 0.10); }
.tray-landing .tl-footer-bot { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; align-items: center; padding-top: 24px; font-family: var(--font-geist-mono), monospace; font-size: 11px; color: var(--tl-ink-4); letter-spacing: 0.08em; font-weight: 500; }

/* Scroll reveal */
[data-reveal] {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
}
[data-reveal].tl-in { opacity: 1; transform: translateY(0); }
[data-reveal]:nth-child(1) { transition-delay: 0s; }
[data-reveal]:nth-child(2) { transition-delay: 0.1s; }
[data-reveal]:nth-child(3) { transition-delay: 0.2s; }
[data-reveal]:nth-child(4) { transition-delay: 0.3s; }
@media (prefers-reduced-motion: reduce) {
  [data-reveal] { opacity: 1 !important; transform: none !important; transition: none !important; }
}
`;

const TICKER_ITEMS = [
  "Hostel 9 Mess · OPEN · 8 min",
  "Main Canteen · OPEN · 12 min",
  "Night Canteen · OPEN · 2 min",
  "SAC Food Court · PAUSED",
  "H12 Mess · OPEN · 5 min",
];

function BrandMark() {
  return (
    <Link href="/" className="tl-brand">
      <span className="tl-brand-mark">T</span>Tray<span className="tl-brand-dot">.</span>
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

export function LandingPage({ tenant }: { tenant: ResolvedTenant | null }) {
  // campus name for generic use — no college-specific branding
  const campusName = tenant?.college_name ?? "your campus";
  void campusName; // reserved for future tenant-aware copy
  return (
    <div className="tray-landing">
      <style dangerouslySetInnerHTML={{ __html: SCOPED_CSS }} />
      <div className="tl-grain" />

      <nav className="tl-nav">
        <div className="tl-nav-inner">
          <BrandMark />
          <div className="tl-nav-links">
            <a href="#system">System</a>
            <a href="#sync">How it syncs</a>
            <a href="#flow">How it works</a>
            <a href="#stack">Stack</a>
            <a href="/demo/index.html">Live demo</a>
          </div>
          <div className="tl-nav-cta">
            <Link href="/login" className="tl-btn tl-btn-ghost">Sign in</Link>
            <a href="/demo/index.html" className="tl-btn tl-btn-pri">Try the demo →</a>
          </div>
        </div>
      </nav>

      <section className="tl-hero tl-wrap">
        <div className="tl-hero-top">
          <div className="tl-l">
            <span>TRAY · v3.0 · CAMPUS EDITION</span>
          </div>
          <div className="tl-r">
            <span className="tl-live"><span className="tl-d" />Kitchen open</span>
          </div>
        </div>
        <h1 className="tl-h1" data-reveal>
          <span className="tl-word">A</span>{" "}
          <span className="tl-word">canteen</span>{" "}
          <span className="tl-word">system</span>
          <br />
          for the{" "}
          <span className="tl-it">
            <span className="tl-word">whole</span>{" "}
            campus.
          </span>
        </h1>
        <div className="tl-hero-meta" data-reveal>
          <p className="tl-hero-lede">
            Tray replaces the printed-token queue with a phone-first ordering system.{" "}
            <span className="tl-em">Students order and pay before they walk to the counter.</span>{" "}
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
        <div className="tl-hero-stats" data-reveal>
          <div className="tl-hero-stat"><div className="tl-v">12<span className="tl-it">min</span></div><div className="tl-l">Saved per lunch</div></div>
          <div className="tl-hero-stat"><div className="tl-v">3</div><div className="tl-l">Role-based portals</div></div>
          <div className="tl-hero-stat"><div className="tl-v">UPI</div><div className="tl-l">Native payments</div></div>
          <div className="tl-hero-stat"><div className="tl-v">OTP</div><div className="tl-l">Verified handover</div></div>
        </div>
      </section>

      {/* Live status ticker */}
      <div className="tl-ticker">
        <div className="tl-ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => {
            const isOpen = item.includes("OPEN");
            const isPaused = item.includes("PAUSED");
            return (
              <span key={i} className={isOpen ? "on" : isPaused ? "" : ""}>
                {item}
              </span>
            );
          })}
        </div>
      </div>

      <section className="tl-section tl-wrap" id="system">
        <div className="tl-section-num"><span className="tl-bar" /><span className="tl-num">01</span> / The system</div>
        <div className="tl-section-head">
          <h2>Three portals,<br /><span className="tl-it">one source of truth.</span></h2>
          <div className="tl-side">
            Tray runs as a single application with three role-based views. The same data drives every screen.{" "}
            <strong style={{ color: "var(--tl-ink)" }}>Open any portal below</strong> — they&apos;re fully functional, no install required.
          </div>
        </div>

        <div className="tl-portals">
          <article className="tl-portal" data-c="student" data-reveal>
            <div className="tl-portal-head">
              <div>
                <span className="tl-portal-ix tl-ix">01 — Student</span>
                <h3>Order &amp;<br /><span className="tl-it">collect.</span></h3>
              </div>
              <span className="tl-portal-dot" />
            </div>
            <div className="tl-portal-frame">
              <span className="tl-device-tag">📱 Mobile · 480×</span>
              <PortalPreview src="/demo/student.html" title="Student app preview" />
            </div>
            <div className="tl-portal-body">
              <p>Browse the daily menu, pay through UPI, and receive a four-digit pickup code. Mobile-first, made for the phone in their hand.</p>
              <div className="tl-feat-tags">
                <span className="tl-feat-tag">UPI · QR</span>
                <span className="tl-feat-tag">OTP pickup</span>
                <span className="tl-feat-tag">Live tracking</span>
                <span className="tl-feat-tag">Veg / non-veg</span>
              </div>
              <a href="/demo/student.html" className="tl-portal-open">
                <span>Open the student app</span>
                <span className="tl-arrow">→</span>
              </a>
            </div>
          </article>

          <article className="tl-portal" data-c="kitchen" data-reveal>
            <div className="tl-portal-head">
              <div>
                <span className="tl-portal-ix tl-ix">02 — Kitchen</span>
                <h3>Prepare &amp;<br /><span className="tl-it">hand over.</span></h3>
              </div>
              <span className="tl-portal-dot" />
            </div>
            <div className="tl-portal-frame">
              <span className="tl-device-tag">🖥 Desktop / tablet · 1440×</span>
              <PortalPreview src="/demo/kitchen.html" title="Kitchen view preview" />
            </div>
            <div className="tl-portal-body">
              <p>Live queue with preparation timers, status updates, and OTP verification on every handover. Add today&apos;s specials → push to every student instantly.</p>
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

          <article className="tl-portal" data-c="admin" data-reveal>
            <div className="tl-portal-head">
              <div>
                <span className="tl-portal-ix tl-ix">03 — Admin</span>
                <h3>Run the<br /><span className="tl-it">operation.</span></h3>
              </div>
              <span className="tl-portal-dot" />
            </div>
            <div className="tl-portal-frame">
              <span className="tl-device-tag">🖥 Desktop · 1440×</span>
              <PortalPreview src="/demo/admin.html" title="Admin console preview" />
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
            <div data-reveal>
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
            <div className="tl-diagram" data-reveal>
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
                  <div className="tl-d">menu.add by kitchen staff · logged</div>
                </div>
                <span className="tl-role">CLIENT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="tl-pull tl-wrap">
        <p data-reveal>Lunch is thirty minutes. Students currently spend <span className="tl-it">twelve of them</span> standing in line.</p>
        <div className="tl-cite">CAMPUS CANTEEN AUDIT · 2025</div>
      </section>

      <section className="tl-section tl-wrap" id="flow">
        <div className="tl-section-num"><span className="tl-bar" /><span className="tl-num">03</span> / How it works</div>
        <div className="tl-section-head">
          <h2><span style={{ fontStyle: "italic" }}>Phone to plate,</span><br /><span className="tl-it">in eleven minutes.</span></h2>
          <div className="tl-side">Four touchpoints. The student walks straight to the counter. The kitchen never repeats a name. Everyone gets their hour back.</div>
        </div>
        <div className="tl-flow">
          <div className="tl-flow-step" data-reveal>
            <div className="tl-ix">01 — 11:42</div>
            <div className="tl-num">01</div>
            <h3>Browse the <span className="tl-it">menu.</span></h3>
            <p>Live availability, prep times, veg/non-veg filters. Add to cart with one tap.</p>
            <div className="tl-tag">→ STATUS: CART</div>
          </div>
          <div className="tl-flow-step" data-reveal>
            <div className="tl-ix">02 — 11:43</div>
            <div className="tl-num">02</div>
            <h3>Pay by <span className="tl-it">UPI.</span></h3>
            <p>Single-use QR with exact amount. Webhook confirms automatically.</p>
            <div className="tl-tag">→ STATUS: PAID</div>
          </div>
          <div className="tl-flow-step" data-reveal>
            <div className="tl-ix">03 — 11:46</div>
            <div className="tl-num">03</div>
            <h3>Track <span className="tl-it">live.</span></h3>
            <p>Queued → preparing → ready, updated by the kitchen in under 250 ms.</p>
            <div className="tl-tag">→ STATUS: PREPARING</div>
          </div>
          <div className="tl-flow-step" data-reveal>
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
            <div key={n} className="tl-stack-card" data-reveal>
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
          <h2 data-reveal>Skip the<br /><span className="tl-it">line.</span></h2>
          <p>Three portals. One platform. Built for campus canteens that are tired of printed tokens.</p>
          <div className="tl-cta-row">
            <a href="/demo/student.html" className="tl-btn tl-btn-pri tl-btn-lg">Open the student app →</a>
            <a href="/demo/kitchen.html" className="tl-btn tl-btn-ghost tl-btn-lg">Kitchen view</a>
            <a href="/demo/admin.html" className="tl-btn tl-btn-ghost tl-btn-lg">Admin dashboard</a>
          </div>
        </div>
      </section>

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

      {/* IntersectionObserver for scroll-triggered reveals */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          var obs = new IntersectionObserver(function(entries) {
            entries.forEach(function(e) {
              if (e.isIntersecting) { e.target.classList.add('tl-in'); obs.unobserve(e.target); }
            });
          }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
          document.querySelectorAll('[data-reveal]').forEach(function(el) { obs.observe(el); });
        })();
      ` }} />
    </div>
  );
}
