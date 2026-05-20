# Animation stack comparison — Tray landing (2026-05-20)

Research-only doc for the marketing landing (`src/components/landing/*`). No code changes implied.

**Context:** User reports GSAP can feel slow to load. Tray already **dynamic-imports** GSAP in `landing-motion.tsx`, but the landing still waits on JS for hero reveals, runs many ScrollTriggers, and shares the repo with **framer-motion** (admin portal only).

---

## Executive summary

| Stack | Typical landing-only cost (gzip, parsed) | Scroll / timeline depth | Tray fit today |
|-------|----------------------------------------|-------------------------|----------------|
| **CSS + `@keyframes`** | **0 KB** JS | Low–medium (loops, hovers) | Already used for ticker, live dot, diagram pulse |
| **CSS scroll-driven** (`animation-timeline: view()`) | **0 KB** JS | Medium reveal-on-scroll | Viable for simple fades; **not Baseline** (~78% users); needs static fallback |
| **Motion / framer-motion** | **~4.6–34 KB** (see below) | Medium in React; weak scroll scrub/pin vs GSAP | Installed for **admin**; poor fit for long DOM-scoped landing |
| **GSAP core + ScrollTrigger** | **~34 KB** gzip (combined) | High (scrub, spy, timelines, counters) | **Current** landing choice; matches polish level |
| **Lenis + light GSAP** | **~4 KB + ~34 KB** | Smooth scroll + GSAP triggers | Optional upgrade; not in repo today |

**Recommendation:** Keep GSAP+ScrollTrigger for **Maximum polish** / current design, but treat perceived slowness as **when** and **how much** loads—not necessarily swapping libraries. **Performance-first** tier = CSS + reduced ScrollTrigger count; **Balanced** = today’s dynamic import + defer non-critical triggers.

---

## Bundle size and load cost (cited numbers)

Figures are **minified** unless noted. Gzip is approximate (typical ~35–40% of minified for these libs). **Parsed + compile** on mobile often adds another 20–40% vs gzip.

### GSAP 3.15 + ScrollTrigger (Tray landing)

| Asset | Measured (this repo, `node_modules/gsap/dist/`) | Published benchmarks |
|-------|--------------------------------------------------|----------------------|
| `gsap.min.js` | **71.2 KB** min | Core ~60 KB min, **~25 KB gzip** ([GSAP Vault comparison](https://gsapvault.com/blog/gsap-vs-animejs-vs-motion)) |
| `ScrollTrigger.min.js` | **43.5 KB** min | — |
| **Core + ScrollTrigger** | **~115 KB** min | **~85 KB** min, **~34 KB gzip** combined ([GSAP Vault](https://gsapvault.com/blog/gsap-vs-animejs-vs-motion)) |

**Runtime cost beyond bytes:** ScrollTrigger installs scroll/resize listeners and maintains trigger metadata. Tray registers **~15+ `ScrollTrigger.create` calls** plus embedded `scrollTrigger` on scrub tweens—fine on desktop, worth profiling on low-end Android after LCP.

**Parse/execute delay:** Even with `import()`, the chunk downloads after hydration; hero stays at `opacity: 0` under `.tl-anim-init` until GSAP runs or **700ms** safety timer fires.

### framer-motion / Motion (React)

| Entry | Gzip (Motion docs) | Notes |
|-------|-------------------|--------|
| Full `motion` component | **~34 KB** | Default declarative API ([Motion: Reduce bundle size](https://motion.dev/docs/react-reduce-bundle-size)) |
| `m` + `LazyMotion` + `domAnimation` | **~4.6 KB** initial + **~15 KB** features | Tree-shaken path |
| `useAnimate` mini | **~2.3 KB** | WAAPI-only, limited vs GSAP timelines |

Tray **`package.json`**: `framer-motion@^11.11.17` (lockfile **11.18.2**). Used in `src/components/portal-admin/*` only—not imported by landing. It does **not** inflate the landing route unless the bundler merges shared chunks; landing route should stay isolated if `LandingMotion` is the only GSAP consumer.

### CSS scroll-driven animations

| Cost | Support |
|------|---------|
| **0 KB** JavaScript | `view()` / `scroll()` timelines — compositor-friendly ([MDN: scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations/Timelines)) |
| — | **Limited Baseline** (~78% global per 2026 guides); Safari gaps → need `@supports` or static layout ([CSS-Tricks: view()](https://css-tricks.com/almanac/functions/v/view/)) |

Good for: opacity/transform reveals, progress bars tied to scroll. **Poor for:** nav section spy, hero word stagger with count-up, portal 3D tilt, `back.out` springs without duplicating easing in CSS.

### Lenis + light GSAP

| Piece | Size |
|-------|------|
| [Lenis](https://www.lenis.dev/) | **&lt;4 KB** gzipped (vendor claim; competes with 12–24 KB ScrollSmoother-class libs) |
| GSAP + ScrollTrigger | Same **~34 KB** gzip if scroll choreography unchanged |

Lenis replaces **native smooth scroll** (`html { scroll-behavior: smooth }` is set in `landing-motion.tsx` today). Adds RAF work; pair only if native scroll feels inadequate.

---

## What Tray landing already uses

### Dependencies (`package.json`)

- `gsap@^3.15.0` — landing only (via dynamic import).
- `framer-motion@^11.11.17` — **admin dashboard** (`activity-feed`, `dashboard-view`, `peak-heatmap`, `revenue-chart`), not landing.

### `landing-motion.tsx` (GSAP + ScrollTrigger)

**Loading pattern (good):**

```ts
const [{ gsap }, { ScrollTrigger }] = await Promise.all([
  import("gsap"),
  import("gsap/ScrollTrigger"),
]);
gsap.registerPlugin(ScrollTrigger);
```

Wrapped in `gsap.context(..., root)` with `ctx.revert()` on cleanup.

**`prefers-reduced-motion`:** Early exit—skips GSAP entirely, calls `markReady()` so FOUC guard clears ([lines 50–54](src/components/landing/landing-motion.tsx)).

**Features in use:**

| Category | Implementation |
|----------|----------------|
| Nav | Scroll progress bar (`scaleX` scrub), `is-scrolled` class, section spy for `#system` / `#flow` |
| Hero | Timeline: stagger words, lede/CTA, **count-up** stats, `onComplete` → `tl-motion-ready` |
| Parallax | Hero glow + 3 ambient orbs — **scrub** ScrollTriggers |
| Sections | `sectionEnter()` helper — many **one-shot** `ScrollTrigger.create` + `gsap.to` (system, sync, where, pull, flow, stack, closing, footer) |
| Sync diagram | Per-node and per-arrow triggers + `back.out` easing |
| Micro | Portal chrome **rotateX/Y** on mousemove; button **scale** on hover/mousedown |
| Safety | `tl-anim-init` + **700ms** `markReady` timeout; try/catch on import; `ScrollTrigger.refresh()` after fonts |

**Performance notes (GSAP official guidance):**

- Prefer **transform + opacity** — mostly followed; exceptions: **`filter: blur`** on pull quote, **`rotateX`/`rotateY`** on portals (paint cost).
- **`will-change: transform`** on `.tl-orb` in CSS — aligned with [gsap-performance](https://github.com/greensock/GSAP/blob/master/README.md) guidance.
- Many simultaneous ScrollTriggers — acceptable for marketing page; test on mid-tier phones.
- `gsap.matchMedia()` alternative to early `prefers-reduced-motion` return — optional if you later want partial motion instead of all-or-nothing.

### `landing-page.tsx` (CSS, no GSAP import)

- Large **scoped `SCOPED_CSS`** string (design tokens, layout, hovers).
- **FOUC guard:** `.tl-anim-init` hides hero pieces until GSAP or timeout; `@media (prefers-reduced-motion: reduce)` forces visible.
- **Pure CSS animations:** `tlTicker` marquee, `tlLive` pulse, `tlTravel` on diagram dots (`animation: none` under reduced-motion).
- `<LandingMotion />` rendered once at root of `.tray-landing` (client component child).

### Not used on landing

- Lenis / ScrollSmoother
- `@gsap/react` `useGSAP` (vanilla `useEffect` + dynamic import instead)
- framer-motion
- CSS `animation-timeline: view()`

---

## Recommendation tiers

### Tier A — Performance-first (~0–8 KB landing animation JS)

**Target:** LCP and TTI over motion richness.

| Item | Estimate |
|------|----------|
| CSS keyframes only (current ticker/live/travel) | 0 KB |
| Optional: `IntersectionObserver` for section fades | &lt;1 KB hand-rolled |
| Drop landing GSAP chunk | **Saves ~34 KB gzip** + parse time |

**When:** Mobile-heavy traffic, slow networks, or marketing accepts static hero.

**Trade-off:** Lose scrub parallax, count-up, section spy, portal tilt, staggered hero words.

---

### Tier B — Balanced (~34 KB gzip, better scheduling) — **closest to today**

**Target:** Keep look, reduce *felt* slowness.

| Item | Estimate |
|------|----------|
| Dynamic `import("gsap")` + `ScrollTrigger` (already) | ~34 KB gzip |
| Defer GSAP until `requestIdleCallback` / first scroll / `pointerdown` | Same bytes, **later** main-thread work |
| `next/dynamic(() => import('./landing-motion'), { ssr: false })` | Splits client boundary explicitly |
| Move button scale + simple fades to CSS | −2–3 ScrollTriggers / fewer tweens |
| Keep scrub + hero timeline | — |

**When:** Default for Tray until metrics show LCP regression.

---

### Tier C — Maximum polish (~34–38 KB gzip+)

**Target:** Current creative direction + optional smooth scroll.

| Item | Estimate |
|------|----------|
| GSAP + ScrollTrigger (full choreography) | ~34 KB gzip |
| Optional Lenis | +~4 KB gzip |
| Optional plugins (SplitText, DrawSVG, Flip) | +10–25 KB each — **not** justified for current landing |

**When:** Launch moments, conference demos, desktop-first audience.

---

## Per landing section — best tool

Mapped from `docs/design-system-figma.md` and `landing-motion.tsx`.

| Section / element | Current | Best tool (tier B) | Notes |
|-------------------|---------|-------------------|--------|
| **Hero** word stagger + count-up | GSAP timeline | **ScrollTrigger + timeline** (GSAP) | CSS can’t count-up cleanly; WAAPI awkward for staggered words |
| **Hero** glow parallax | GSAP scrub | **ScrollTrigger scrub** or CSS `scroll-timeline` on hero only + fallback | CSS viable with `@supports` |
| **Ambient orbs** | GSAP scrub | **CSS** `transform` + scroll-timeline **or** keep scrub | Orbs already `will-change`; CSS reduces JS |
| **Nav** progress bar | GSAP `scaleX` | **CSS** `animation-timeline: scroll()` **or** GSAP | One-liner in modern Chrome; fallback `scaleX` via GSAP |
| **Nav** `is-scrolled` / spy | ScrollTrigger | **ScrollTrigger** or **IntersectionObserver** | IO ~0 KB; ST already loaded |
| **#system** portals (rotateX, stagger) | GSAP `sectionEnter` | **ScrollTrigger** | 3D tilt needs JS unless dropped |
| **Portal hover tilt** | GSAP mousemove | **CSS** `transform: perspective` on hover **or** GSAP | CSS lighter; GSAP smoother interpolation |
| **#sync** diagram | GSAP per-node | **CSS** staggered `animation-delay` **or** one ST batch | `ScrollTrigger.batch()` could reduce instances ([gsap-scrolltrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)) |
| **#where** chips `back.out` | GSAP | **GSAP** (easing) or CSS `cubic-bezier` approx | Springy ease is GSAP strength |
| **`.tl-pull`** blur reveal | GSAP + `filter` | **GSAP** or CSS `view()` without blur | Blur is expensive; prefer opacity-only for perf |
| **#flow** steps + numeral spin | GSAP | **GSAP** | Rotation + stagger timing |
| **#stack** center pop | GSAP stagger | **CSS** `view()` or GSAP | Either works |
| **Closing** cascade | GSAP timeline in ST | **GSAP timeline** | Nested sequencing |
| **Footer** fade-up | `sectionEnter` | **CSS** `view()` or IO | Low risk to simplify |
| **Buttons** scale | GSAP listeners | **CSS** `:hover` / `:active` `transform` | Already have color transitions in CSS |
| **Ticker / live dot / diagram dot** | CSS `@keyframes` | **CSS only** | Keep as-is |

---

## Next.js App Router — code splitting patterns

Tray already uses **route-level client component** + **dynamic import inside `useEffect`**. Additional patterns (documentation only):

### 1. Dynamic import GSAP (current — keep)

```ts
const [{ gsap }, { ScrollTrigger }] = await Promise.all([
  import("gsap"),
  import("gsap/ScrollTrigger"),
]);
```

Ensures GSAP is not in the server bundle; lands in an async chunk loaded after mount.

### 2. `next/dynamic` for `LandingMotion`

```tsx
import dynamic from "next/dynamic";

const LandingMotion = dynamic(
  () => import("@/components/landing/landing-motion").then((m) => m.LandingMotion),
  { ssr: false },
);
```

Separates the **entire motion module** from the main landing JS graph; pairs well with heavy `landing-page.tsx` CSS string.

### 3. Defer load until idle or interaction

```ts
const load = () => { /* existing async IIFE */ };

if ("requestIdleCallback" in window) {
  requestIdleCallback(load, { timeout: 2000 });
} else {
  setTimeout(load, 1);
}
// Or: window.addEventListener("scroll", load, { once: true, passive: true });
```

Improves **Time to Interactive**; hero may show unanimated briefly unless CSS final state is acceptable under `.tl-anim-init`.

### 4. `@gsap/react` + `useGSAP` (optional refactor)

Official React integration auto-reverts on unmount ([gsap-react skill](https://gsap.com/docs/v3/React)). Does **not** reduce bundle size; improves Strict Mode safety vs manual `useEffect`.

### 5. Avoid static imports

```ts
// Anti-pattern for landing perf
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
```

Would pull GSAP into the landing page’s initial client bundle.

### 6. Admin vs landing split

Keep **framer-motion** confined to `/admin` routes so marketing routes do not pay for Motion’s ~34 KB unless shared layout imports it (verify with `next build` analyzer).

---

## `prefers-reduced-motion` strategy

### What Tray does today (good baseline)

1. **`landing-motion.tsx`:** `matchMedia("(prefers-reduced-motion: reduce)")` → skip GSAP, `markReady()` immediately.
2. **`landing-page.tsx` CSS:** Under `prefers-reduced-motion`, hero elements forced `opacity: 1`; ticker animation disabled.

### Gaps / improvements (future)

| Gap | Suggestion |
|-----|------------|
| `html { scroll-behavior: smooth }` still applied when reduced | Set `scroll-behavior: auto` when reduced |
| All-or-nothing | Optional `gsap.matchMedia()` to keep instant opacity fades, disable scrub only |
| System setting changes live | Listen to `matchMedia` `change` event and call `ctx.revert()` / reload |
| Focus not keyboard | No change needed for PRM |
| `tl-anim-init` timeout (700ms) | Irrelevant when reduced (early exit) |

**GSAP official pattern:**

```js
const mm = gsap.matchMedia();
mm.add("(prefers-reduced-motion: reduce)", () => {
  gsap.globalTimeline.timeScale(0);
});
```

Tray’s **early return** is simpler and avoids loading **~34 KB** for users who opted out—**prefer keep early return** over loading GSAP then freezing.

**CSS layer (defense in depth):**

```css
@media (prefers-reduced-motion: reduce) {
  .tray-landing *, .tray-landing *::before, .tray-landing *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Use sparingly (can break intentional transitions); Tray’s targeted rules are finer-grained.

---

## Why GSAP can *feel* slow (diagnosis checklist)

1. **Hero hidden** until GSAP runs (`tl-anim-init`) — perceived as blank/slow even if LCP element paints.
2. **Chunk download + parse** after React hydration — ~115 KB minified to parse, not on critical path for HTML but blocks motion.
3. **Font wait** — `document.fonts.ready` then `ScrollTrigger.refresh()` adds layout pass.
4. **Many ScrollTriggers** — refresh cost on load/resize.
5. **Not GSAP on network** — images, fonts, or demo iframes may dominate; measure with Performance panel.

**Quick wins without changing library:** idle-defer GSAP, reduce `filter`/`rotateX` animations, collapse per-node diagram triggers into one batch, move button hovers to CSS.

---

## Sources

| Source | Use |
|--------|-----|
| [GSAP Vault: GSAP vs Anime.js vs Motion](https://gsapvault.com/blog/gsap-vs-animejs-vs-motion) | Gzip table: core ~25 KB, +ScrollTrigger ~34 KB |
| [Motion: Reduce bundle size](https://motion.dev/docs/react-reduce-bundle-size) | motion ~34 KB gzip; m + LazyMotion ~4.6 KB |
| [MDN: Scroll-driven animation timelines](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations/Timelines) | Zero-JS scroll animations, support caveats |
| [Lenis](https://www.lenis.dev/) | &lt;4 KB gzip claim |
| Tray `node_modules/gsap/dist/*.min.js` | Measured 71.2 + 43.5 KB min (v3.15.0) |
| Tray `src/components/landing/landing-motion.tsx` | Current implementation audit |
| Tray `src/components/landing/landing-page.tsx` | CSS animations + FOUC guard |
| GSAP skills: gsap-performance, gsap-scrolltrigger, gsap-react | Transform preference, ST batching, React cleanup |

---

## Decision log (for parallel work)

- **2026-05-20:** Research doc created; no landing code changes.
- **Default stance:** Stay **Tier B (Balanced)** — retain GSAP+ScrollTrigger with existing dynamic import; optimize scheduling and CSS handoff before swapping stack.
- **Revisit Tier A** if Lighthouse documents GSAP chunk on critical path or LCP &gt; budget on 4G.
