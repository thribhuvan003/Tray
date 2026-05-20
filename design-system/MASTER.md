# Tray — Design system (MASTER)

**Product:** B2B2C campus canteen ordering (student / kitchen / admin portals)  
**Scope:** Marketing landing (`.tray-landing`) + **student static demo** (`public/demo/student.html`) — Monsoon Paper palette E (2026-05-20, shipped)  
**Stack:** Next.js 15 · React 19 · Tailwind v4 (app) · scoped CSS in `landing-page.tsx`  
**Motion:** GSAP + ScrollTrigger in `landing-motion.tsx` only — no Framer Motion on landing

> **Note:** `ui-ux-pro-max` CLI (`search.py`) was unavailable in this environment (script not installed). Recommendations below merge skill Quick Reference priorities, shipped `--tl-*` tokens, and `docs/design-system-figma.md`.

---

## Pattern & style

| Attribute | Recommendation |
|-----------|----------------|
| **Pattern** | Hero + proof sections + portal previews + sync diagram + flow steps (B2B SaaS landing) |
| **Style** | Editorial light — warm paper sheet, coral + sky accents, restrained glass (nav blur), no emoji-as-icons |
| **Mood** | Daylight canteen editorial; trustworthy ops + lively kitchen signal |
| **Anti-patterns** | Purple-on-white SaaS cliché; neon arcade lime; mixing flat + skeuomorphic randomly; decorative-only motion |

---

## Color (Monsoon Paper)

| Token | Value | Role |
|-------|-------|------|
| `--tl-bg` | `#f7f3ea` | Page base |
| `--tl-bg-2` … `--tl-bg-4` | `#fffaf0` → `#e8decc` | Elevated surfaces |
| `--tl-ink` | `#1a140e` | Primary text / primary CTA fill |
| `--tl-ink-2` | `rgba(26,20,14,0.72)` | Body |
| `--tl-ink-3` | `rgba(26,20,14,0.58)` | Labels (AA-oriented) |
| `--tl-ink-4` | `rgba(26,20,14,0.38)` | Meta |
| `--tl-accent` / warm | `#c43d2f` | Italic emphasis, focus ring, selection |
| `--tl-accent-cool` | `#2a5db8` | Ghost hover rim |
| **Portal rims** | student `#5cb1ff` · kitchen `#d52821` / bright `#ef5749` · admin `#cdfa50` | Demo alignment |
| **Status** | `--tl-good` `#6dd4a0` | Live pill |

**Page gradient:** `165deg` — `#f7f3ea` → `#fffaf0` (38%) → `#f0e8d8`.

**Contrast targets:** Normal text ≥4.5:1 on `--tl-bg`; large display ≥3:1. Avoid gray-on-gray for body pairs.

---

## Typography

| Role | Family | Usage |
|------|--------|--------|
| Display | **Newsreader** (`--font-newsreader`) | H1–H2, stat numerals, portal titles |
| Body | **Manrope** (`--font-manrope`) | Lede, cards, buttons |
| Mono / labels | **JetBrains Mono** | Section nums, ticker, meta, chips |

**Scale (landing):** base 18px (`--tl-size-base`); labels `--tl-size-2xs` (13px) — use sparingly, never for long body copy.

**Measure tokens (landing, shipped):** `--tl-measure-lede` 52ch · `--tl-measure-pull` 42ch · `--tl-lh-body` 1.62 · `--tl-lh-display` 1.02 · `--tl-lh-h2` 1.

**Motifs (landing):** queue ribbon (hero + sync), kitchen steam halo, ticket perforation (dashed edges), sync→flow accent scrub (GSAP).

**Student demo:** Manrope 16px / lh 1.55+; student rim `#5cb1ff`; paper base `#f7f3ea` — mirrors portal preview, not dark chrome.

**Pairing rationale:** Editorial serif headlines + humanist sans body = distinctive food/campus editorial without generic Inter-only SaaS.

---

## Layout & spacing

- Max width **1280px** (`.tl-wrap`); section padding **80px** mobile / **120px** desktop
- Mobile-first breakpoints: **768px**, **900px** (nav links), **960px** (hero meta)
- `scroll-margin-top: 88px` on in-page anchors
- Touch spacing ≥8px between adjacent CTAs

---

## Motion (medium+)

| Rule | Implementation |
|------|----------------|
| Library | GSAP dynamic import; ScrollTrigger for scroll-linked only |
| Duration | Micro 150–300ms; hero timeline ≤800ms segments |
| Reduced motion | CSS + JS early exit; ticker/orbs/live dot static |
| Coarse / narrow | No scrub parallax, no portal 3D tilt |
| Performance | `transform` / `opacity` only; hero `min-height` reserves CLS |

**Do not add** Framer Motion or View Transitions on marketing landing for this sprint (in-app routes experimental only).

---

## UX audit checklist (landing — 2026-05-20)

| Priority | Check | Status |
|----------|-------|--------|
| 1 | Contrast on ink tiers | **Pass** (ink-3 bumped to 0.58) |
| 1 | Focus-visible on links, buttons, brand, portal CTAs, skip | **Pass** (this pass) |
| 1 | Skip link to `#main` | **Pass** (existing) |
| 2 | Touch targets ≥44px (nav CTAs, buttons, portal-open) | **Pass** (this pass) |
| 2 | `touch-action: manipulation` on tap targets | **Pass** (this pass) |
| 3 | Hero CLS reserve (`min-height` on `.tl-h1`) | **Pass** (this pass) |
| 3 | Below-fold iframes / lazy patterns | **Pass** (existing scale(0.5) mock) |
| 4 | Style consistency (Monsoon Paper + portal rims) | **Pass** |
| 5 | No horizontal scroll; responsive grids | **Pass** |
| 6 | Tokenized `--tl-*`; no raw hex in JSX | **Pass** (scoped CSS) |
| 7 | `prefers-reduced-motion` CSS + GSAP skip | **Pass** (+ live dot pulse off) |
| 7 | Ticker pauses / static when reduced | **Pass** |

**Deferred (low impact / user-loved copy):** Mobile nav hash links hidden &lt;900px (hero + footer anchors suffice); View Transitions for `/` → `/college`.

---

## Source of truth files

| File | Purpose |
|------|---------|
| `src/components/landing/landing-page.tsx` | Tokens + scoped CSS + markup |
| `src/components/landing/landing-motion.tsx` | GSAP choreography |
| `docs/design-system-figma.md` | Figma variable map |
| `docs/landing-design-options.md` | Palette/font/motion options |
| `docs/DEMO-SPEC.md` | Demo QA bar |

---

## Regenerating from ui-ux-pro-max (when script available)

```bash
python "%USERPROFILE%\.claude\skills\ui-ux-pro-max\scripts\search.py" \
  "college canteen campus food ordering SaaS dark landing" \
  --design-system -p "Tray" -f markdown --persist --page "landing"
```

Supplement domains: `ux`, `color`, `typography` with `-n 5`.
