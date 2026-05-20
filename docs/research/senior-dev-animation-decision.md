# Senior dev decision — Landing animation stack (Tray)

**Date:** 2026-05-20  
**Scope:** Marketing landing only (`.tray-landing` via `landing-page.tsx` + `landing-motion.tsx`).  
**Out of scope:** Student/kitchen/admin demos, product portals (`framer-motion` in admin charts stays as-is).

**Inputs reviewed:** `src/components/landing/landing-motion.tsx`, `landing-page.tsx`, `package.json`, `docs/design-system-figma.md`, `docs/PARALLEL-WORK.md` session notes.  
**Missing inputs:** `docs/research/motion-patterns.md`, `animation-stack-comparison.md`, `motion-code-sources.md`, and `landing-design-options.md` are **not in repo yet** — this doc stands as the canonical animation decision until those land.

---

## 1. Verdict

### Recommendation: **Hybrid — GSAP (ScrollTrigger) owns landing scroll choreography; CSS owns ambient loops; Motion (framer-motion) stays off the landing route**

**Rationale (current codebase):**

- ~500 lines of working, section-specific GSAP in `landing-motion.tsx` (hero timeline, scroll progress, nav spy, per-section reveals, scrub parallax, portal tilt, button scale). Replacing this with Motion before palette lock is **high regression risk** for modest bundle savings.
- GSAP is already **dynamically imported** (`import("gsap")`, `import("gsap/ScrollTrigger")`) — it does not need to sit in the main App Router chunk if agents keep imports confined to `landing-motion.tsx`.
- `framer-motion` (^11.11.17) is used in **admin dashboard** components only, not landing. Pulling Motion into landing would add a second animation runtime on the homepage without removing GSAP unless we rewrite scroll logic.
- `landing-line-leave.tsx` uses **React state + CSS** (`.is-fading`) — appropriate; GSAP already animates chips on scroll enter. No need for Motion there yet.

**What “hybrid” means in practice:**

| Layer | Tool | Where |
|-------|------|--------|
| Scroll-linked section choreography | GSAP + ScrollTrigger | `landing-motion.tsx` only |
| Infinite / ambient (ticker, live dot, grain) | CSS `@keyframes` | `landing-page.tsx` `SCOPED_CSS` |
| Interactive hint crossfade | CSS transition | `landing-line-leave.tsx` |
| Product UI charts / dashboard motion | framer-motion | `src/components/portal-admin/*` (unchanged) |

**Do not:** Import `framer-motion` into `landing-page.tsx` or split scroll animation across GSAP and Motion on the same selectors (double transforms, fight over opacity).

### Dissenting opinion (migrate toward Motion over time)

A **Motion-first** landing would unify dependencies (one animation mental model for React), improve tree-shaking for *small* enter/exit UIs, and align with Vercel/React 19 view-transition direction. Scroll-scrub parallax, nav section-spy, and many `once: true` ScrollTrigger instances are **awkward** in Motion without `motion` + Intersection Observer wrappers or a scroll library — you would likely reintroduce complexity equivalent to GSAP. **If** the team later drops scrub/pin/parallax on mobile and simplifies to fade-up-only reveals, a phased Motion migration (section by section) becomes viable; until then, rewriting is churn, not leverage.

---

## 2. Load budget (landing LCP / JS)

Targets are for **animation-specific JS** on `/` (marketing), not total Next.js bundle.

| Metric | Budget | Notes |
|--------|--------|--------|
| **GSAP chunk (gzip, deferred)** | **≤ 55 KB** | Measured vendor raw: `gsap.min.js` ~71 KB + `ScrollTrigger.min.js` ~44 KB (~115 KB minified total → ~40–50 KB gzip typical). Treat 55 KB as hard cap for the lazy chunk. |
| **On critical path (initial HTML → LCP)** | **0 KB animation runtime** | Hero must be readable without waiting for GSAP. Current pattern: `.tl-anim-init` hides hero only until `markReady()` (timeline complete, 700 ms cap, or `prefers-reduced-motion`). Keep that contract. |
| **Time to interactive impact** | Load GSAP **after** first paint | Keep dynamic `import()` in `useEffect`; no top-level `gsap` in `landing-page.tsx`. |
| **Total landing JS (guidance)** | Stay within Next production budgets | Use Vercel/Web Vitals on `trayy.vercel.app`; animation chunk should not block LCP element (headline / lede). |
| **Mobile (optional tighten)** | **≤ 35 KB** effective | If INP regresses: disable scrub ScrollTriggers (orbs, hero glow) on `(max-width: 768px)` or `pointer: coarse` — see rules below. |

**LCP element:** Instrument Serif headline + hero lede. They must reach visible state within **700 ms** even if GSAP fails (`markReady()` + `catch` already in `landing-motion.tsx`).

---

## 3. Implementation rules (agents — landing motion)

1. **Single owner file:** All GSAP/ScrollTrigger logic lives in `src/components/landing/landing-motion.tsx`. `landing-page.tsx` is markup + scoped CSS only (plus `<LandingMotion />`).

2. **Dynamic import only:**
   ```ts
   const [{ gsap }, { ScrollTrigger }] = await Promise.all([
     import("gsap"),
     import("gsap/ScrollTrigger"),
   ]);
   ```
   Never add `import gsap from "gsap"` at module top level in landing files.

3. **One `gsap.context()` per mount**, scoped to `.tray-landing` root; store `ctx.revert()` and call it in `useEffect` cleanup (already done). On route leave, unmounting `LandingMotion` must kill all ScrollTriggers and tweens.

4. **`prefers-reduced-motion: reduce`:** Exit before loading GSAP; call `markReady()` immediately; rely on CSS overrides in `landing-page.tsx` (already present).

5. **FOUC safety:** Use `.tl-anim-init` (not blanket `.tray-landing:not(.tl-motion-ready) { opacity: 0 }` on the whole page). Always set `tl-motion-ready` via `markReady()` on error, timeout (700 ms), and reduced motion.

6. **No ScrollTrigger on mobile (when perf flags):** If profiling shows jank, gate **scrub** triggers only (orbs, hero glow, long-page scrub) with:
   ```ts
   const coarse = window.matchMedia("(pointer: coarse)").matches;
   const narrow = window.matchMedia("(max-width: 768px)").matches;
   const lightMotion = coarse || narrow;
   ```
   Keep `once: true` section reveals on mobile unless INP still suffers — then reduce to CSS `@keyframes` or single batch.

7. **Pointer-only micro-interactions:** Portal 3D tilt and `.tl-btn` scale tweens require fine pointer; skip attaching listeners when `pointer: coarse` (or no hover).

8. **Do not block on fonts forever:** `document.fonts.ready` then `ScrollTrigger.refresh()` is fine; keep timeout fallback via `markReady()`.

9. **Strict Mode:** Use `cancelled` flag + cleanup on effect re-run (already present). Do not register duplicate triggers without `revert()`.

10. **Palette / visual tokens:** Do **not** change colors, typography, or section layout for “motion polish” until the user selects a palette from **`docs/landing-design-options.md`** (file pending). Animation refactors that only touch `landing-motion.tsx` and non-token CSS (e.g. mobile scrub gating) may proceed in parallel.

11. **Verification:** After motion changes — `npm run build`, manual `/` at 390× and 1440×, check hero visible &lt; 1 s, reduced-motion in OS settings, navigate away from `/` and back (no duplicate scroll listeners).

---

## 4. Per-section assignment table

| Section / UI | DOM / id | Animation stack | Owner |
|--------------|----------|-----------------|--------|
| Skip link, grain, ambient orbs (visual only) | `.tl-grain`, `.tl-orb-*` | **CSS** static + **GSAP scrub** on orbs (disable on mobile if flagged) | CSS in `landing-page.tsx`; scrub in `landing-motion.tsx` |
| Sticky nav + scroll progress | `.tl-nav`, `.tl-scroll-progress` | **ScrollTrigger** (scrolled class, progress `scaleX`) | `landing-motion.tsx` |
| Nav link active state | `.tl-nav-links a[href^="#"]` | **ScrollTrigger** toggle vs `#system`, `#flow` | `landing-motion.tsx` |
| Hero intro | `.tl-hero` | **GSAP timeline** (words, lede, CTA, stats, count-up) | `landing-motion.tsx` |
| Hero glow parallax | `.tl-hero-glow` | **ScrollTrigger scrub** | `landing-motion.tsx` |
| Ticker marquee | `.tl-ticker` | **CSS** `tlTicker` keyframes; pause on hover | `landing-page.tsx` |
| Live pill dot | `.tl-live .tl-d` | **CSS** `tlLive` pulse | `landing-page.tsx` |
| **01 System** | `#system` | **ScrollTrigger** `sectionEnter` (head, portals 3D fan-in, tags) | `landing-motion.tsx` |
| Portal browser chrome hover tilt | `.tl-portal` | **GSAP** mousemove (desktop); **CSS** hover lift | Both |
| **02 Sync** | `.tl-sync`, `.tl-diagram` | **ScrollTrigger** copy + diagram scale; per-node/arrows | `landing-motion.tsx` |
| **02b Line leave** | `#where` | **ScrollTrigger** chip spring-in; hint swap **CSS** `.is-fading` | `landing-motion.tsx` + `landing-line-leave.tsx` |
| Pull quote | `.tl-pull` | **ScrollTrigger** blur/scale on `p`; fade cite | `landing-motion.tsx` |
| **03 Flow** | `#flow` | **ScrollTrigger** per `.tl-flow-step` + numeral rotate | `landing-motion.tsx` |
| **04 Stack** | `#stack` | **ScrollTrigger** center stagger on cards | `landing-motion.tsx` |
| Closing CTA | `.tl-closing` | **ScrollTrigger** + nested **timeline** | `landing-motion.tsx` |
| Footer | `.tl-footer` | **ScrollTrigger** stagger | `landing-motion.tsx` |
| Buttons (global on landing) | `.tl-btn` | **GSAP** scale on hover/press (desktop); **CSS** color/shadow | `landing-motion.tsx` + CSS |
| Reduced motion | `@media (prefers-reduced-motion)` | **CSS** force visible; **no GSAP** | `landing-page.tsx` + early exit in motion |

**Not used on landing:** `framer-motion` / `motion/react`.

---

## 5. Parallel work vs design palette gate

| Track | Can proceed now? |
|-------|------------------|
| Animation architecture (this doc), mobile scrub gating, cleanup hardening, bundle checks | **Yes** |
| GSAP section tuning (easing, stagger, triggers) that does not change tokens | **Yes** |
| Color palette, typography, Figma variable renames | **No** — blocked on user pick from `landing-design-options.md` |
| Rewriting `SCOPED_CSS` theme in `landing-page.tsx` | **No** — palette gate |

---

## 6. Follow-ups (optional research docs)

When agents produce the missing research files, align them to this verdict:

- `docs/research/animation-stack-comparison.md` — quantify gzip + INP for GSAP vs Motion vs CSS-only on `/`.
- `docs/research/motion-patterns.md` — copy-paste patterns for `sectionEnter`, hero timeline, reduced motion.
- `docs/landing-design-options.md` — palette options; unblock visual implementation.

---

## 7. Decision log

| Decision | Status |
|----------|--------|
| Landing scroll choreography | **GSAP + ScrollTrigger** (keep) |
| Landing enter/exit for new React islands | **CSS first**; Motion only if a component needs shared layout animation with admin |
| Admin dashboards | **framer-motion** (unchanged) |
| Full Motion migration | **Rejected** for current sprint |
