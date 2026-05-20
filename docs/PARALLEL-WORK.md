# Parallel work log (Tray)

**Contract:** Bar **C** — premium landing **and** student demo = real laptop web app. Kitchen static demo: **click paths + student sync** (2026-05-20).

**F1 mode (user):** Research → team discuss → one council pick → implement → Amazon/Microsoft QA bar. Spec: **`docs/DEMO-SPEC.md`**.

## Council decision (2026-05-19)

| Priority | Feature | Landing | Student demo |
|----------|---------|---------|--------------|
| **Primary** | KFC-style **Takeaway / Dine in** + optional table | Line-leave + copy | Service mode cards + flow copy |
| **Secondary** | **Pickup window** ETA ribbon | Mention in flow | Tracking view |
| **Secondary** | **Veg lane** toggle | Feature tag | Menu filter |
| **Secondary** | **Line leave** (“where are you?”) | `landing-line-leave.tsx` | — |

Rejected for this sprint: Rush Room (admin), Payment Trust Seal animation (defer).

## Team lanes

| Role | Lane | Status |
|------|------|--------|
| PM | `pm-critique` | Done (prior) |
| Creative | `creative-frontier` | Done (prior) |
| Implement | `demo-student` | Service mode + ribbon + veg lane |
| Implement | `landing-next` | Device tag, LineLeave, copy |
| QA (Amazon/MS bar) | `qa-f1-audit` | Running |
| Senior TS | `senior-dev-review` | Running |
| Build | `build-verify` | Pending after QA |

**Resume:**
```
Read AGENTS.md, docs/DEMO-SPEC.md, docs/PARALLEL-WORK.md. One file owner per lane. Do not touch kitchen.html.
```

---

## Locked design

| Surface | Direction |
|---------|-----------|
| Landing (Next) | **Monsoon Paper** (palette E) + Newsreader/Manrope/JetBrains (font 2) + motion medium+ |
| Student demo | **Monsoon Paper light** (palette E) + same font stack; student rim `#5cb1ff`; desktop sidebar |
| Kitchen | DO NOT TOUCH |

---

## Session log

### 2026-05-19 — F1 harness + council implementation

- **Fixed:** 15× invalid `</motion.div>` closers in `student.html` (P0 DOM break).
- **Shipped:** Service mode UI (takeaway/dine), veg lane, pickup ribbon, OTP mode tag, `setView` context wiring.
- **Shipped:** `landing-line-leave.tsx` + landing portal label **Laptop · sidebar cart**; student portal copy/tags.
- **Added:** `docs/DEMO-SPEC.md` — single checklist for demos/micro-interactions.
- **Now:** F1 QA agents auditing all surfaces; fix P0 only from their lists.
- **Next:** `npm run build`, manual click-through student/admin/index, update this log with QA P0 fixes.

### 2026-05-19 — F1 QA audit (`qa-amazon-ms` / testing lens)

- **P0:** `public/demo/student.html` — UTF-8 mojibake in title, currency (`â‚¹`), arrows, ellipsis, track dots, empty-cart icon (violates DEMO-SPEC “no broken HTML”; breaks pitch bar C).
- **P0:** `public/demo/index.html` — student portal still tagged **📱 Mobile · 480×** + “Mobile-first” copy; conflicts with `docs/DEMO-SPEC.md` and Next landing (`💻 Laptop · sidebar cart`).
- **P1:** Student mobile bar CTA **“View cart”** calls `startPayment()` (no line-item review &lt;900px; sidebar hidden).
- **P1:** `public/demo/admin.html` — `viewport` fixed at `width=1440` (real phones/tablets get scaled desktop layout).
- **P1:** Keyboard focus — no `:focus-visible` on student demo controls or landing `.tl-line-chip` (search/table input only).
- **Pass:** Student flow logic (service mode, veg lane, cart bump, checkout disable, ribbon on track, back to menu, reset confirm); admin export CSV, menu modal (Escape/backdrop), panel tabs; Next landing line-leave + reduced motion.
- **Verdict:** **Hold** until P0 encoding + index device tag fixed.


### 2026-05-20 — Demo kitchen + student click-path pass (resume teams)

- **Kitchen demo** (`kitchen.html`): Tray brand → `index.html`; Refresh wired; specials `storage` event for same-tab student sync; responsive viewport; student portal label **laptop**.
- **Student demo**: UTF-8/₹/emojis fixed; Tray brand → home; `tray_specials` live menu category; focus-visible; storage listener.
- **Admin demo**: Tray brand link; responsive viewport.
- **Verify:** `npm run demo:verify` — static file audit, **no browser / no Playwright MCP** (~instant). Optional: `npm run demo:verify:e2e` (Playwright + built-in static server on :4173).
- **Real kitchen:** `src/app/(kitchen)/kitchen/page.tsx` + `KitchenBoard` — requires auth + Supabase (not static demo).

### 2026-05-20 — Student demo typography (Newsreader sitewide)

- **Student** (`public/demo/student.html`): `--font-display` (Newsreader) on `.shell`, `.views-flow`, `.cart-bar`; `--font-ui` (Manrope) on `.topbar` and control surfaces; base `17px` / tuned line-heights; one-step size bump across menu, cart, and flow views; tabular prices on Manrope; inline script passes `node --check`.

### 2026-05-20 — Admin demo full click-path (resume teams)

- **Admin demo** (`public/demo/admin.html`): Sidebar `data-view` router (Overview, Orders, Menu, Students, Insights, Tenant, API, Audit); tenant switcher dropdown; dynamic orders table with filter/search/pagination; Students/Tenant/API/Audit view panes; G+O/R/M/S/I shortcuts; search + export + menu modal wired; no `data-toast` dead links.
- **Scripts:** `scripts/admin-demo-router.js` (inlined into admin.html), `scripts/_apply_admin_patch.py`, `scripts/demo-verify.mjs` admin interaction checks.
- **Not touched:** `public/demo/kitchen.html` per lane lock.
- **Verify:** `npm run demo:verify` (static); optional `npm run demo:verify:e2e`.

### 2026-05-20 — Kitchen demo: history nav, student sync, OTP, scroll

- **Kitchen** (`public/demo/kitchen.html`): History/Insights nav now hides queue chrome reliably (`display:none` + `queue-page-chrome`); student orders via `tray_kitchen_inbox` → Incoming; pushing a special also creates an Incoming ticket; OTP modal only closes on scrim click + paste/4-digit fill; column scroll preserved across 1s re-renders + flex `min-height:0`.
- **Student** (`public/demo/student.html`): `pushOrderToKitchen()` on “I've paid” (includes live specials / chicken dum biryani).
- **Verify:** `npm run demo:verify`

### 2026-05-20 — Multi-canteen fake data (student / kitchen / admin demos)

- **Shared:** `public/demo/demo-canteens.js` — demo picker shows **two** canteens (`aditya`, `north-block`) with clearly different menus/orders/KPIs; `hostel-b` data kept in file but hidden from pickers. Per-canteen specials (`tray_specials_<id>`); selection in `localStorage` `tray_canteen` (syncs across tabs).
- **Student** (`student.html`): Segmented **“Which canteen?”** control + menu flash on switch; cart clears on change; kitchen push includes `canteenId`.
- **Kitchen** (`kitchen.html`): Canteen dropdown in page header; queue/specials re-seed per canteen; inbox ingests only matching `canteenId`.
- **Admin** (`admin.html`): `applyTenantData()` swaps KPIs, orders, top items, students, menu modal, audit, specials; repaired corrupted Students/Tenant/API/Audit view-pane HTML.
- **Index** (`index.html`): Sync copy mentions shared `tray_canteen` across portals.
- **Verify:** `npm run demo:verify`

### 2026-05-20 — Student demo responsive (phones)

- **Student** (`public/demo/student.html`): mobile `@media` (640px/480px) — full-width content, stacked service modes, canteen segments 2-col→1-col, 44px taps, safe-area cart bar, no horizontal scroll.

### 2026-05-20 — Demo data not showing (fix)

- **Root cause:** `demo-canteens.js` had `avgPickupSec: 05` (invalid strict-mode octal) → entire script failed → no menu/orders anywhere. Student also looped on `storage` because `loadCanteenData` always called `setSelectedCanteenId`.
- **Fix:** `avgPickupSec: 5`; `setSelectedCanteenId` no-ops when unchanged; expanded menus (10 dishes/canteen) + preset kitchen tickets; `package.json` `dev` pinned to **port 3000**.
- **Open demos:** `npm run dev` → http://localhost:3000/demo/student.html (switch Aditya vs North Block). E2E: `DEMO_BASE=http://localhost:3000/demo node scripts/demo-verify.mjs --e2e`.

### 2026-05-20 — Landing polish (Awwwards-tier motion + tokens)

- **Also:** Hero lede — shorter scan-first copy + tighter `--tl-measure-lede` / lede line-height + `color-mix` hierarchy (`landing-page.tsx`).
- **Shipped:** Per-section GSAP choreography in `landing-motion.tsx` (system fan-in, sync diagram lanes, pull blur reveal, flow numeral spin, stack center pop, closing cascade); ambient orbs + refined Pre-Monsoon Dusk tokens in `landing-page.tsx`; portal 3D tilt + button scale micro-interactions (CSS hover lift preserved).
- **Docs:** `docs/design-system-figma.md` — Figma variable/component map for landing.
- **Verify:** `npm run typecheck`, `npm run build` → http://localhost:3000

### 2026-05-20 — Landing GSAP motion fix (resume)

- **Root cause:** Hero FOUC guard used .tray-landing:not(.tl-motion-ready) { opacity: 0 }. 	l-motion-ready only appeared after GSAP hero onComplete or a timer inside gsap.context() — if GSAP failed or Strict Mode interrupted setup, hero stayed invisible.
- **Fix:** landing-motion.tsx rewritten — ScrollTrigger.batch section reveals, hero timeline, 700ms markReady() safety, 	ry/catch on dynamic import, FOUC CSS scoped to .tl-anim-init in landing-page.tsx. Nav sticky + is-scrolled + grid alignment (Tray | System | How it works | Sign in | Demo).
- **Verify:** 
pm run typecheck passes. Restart dev if port 3000 hangs: NODE_OPTIONS=--max-old-space-size=8192 npm run dev → http://localhost:3000

### 2026-05-20 — Vercel production deploy fix (`trayy.vercel.app`)

- **Root cause:** `playwright` in `package.json` but missing from committed `pnpm-lock.yaml` → Vercel `pnpm install --frozen-lockfile` failed in ~4s. Interim `vercel.json` `npm ci` also failed (React 19 RC peer deps vs npm strict resolve).
- **Fix (commit `b755f14`):** Sync `pnpm-lock.yaml`; `vercel.json` → `pnpm install --frozen-lockfile` + `pnpm run build`; remove stale `package-lock.json`.
- **Production:** https://trayy.vercel.app — deployment **Ready** (`dpl_4njrZ4e6S4AkVrd1ebDEQWrUGY1r`); `/demo/student.html` + `demo-canteens.js` serve dish data.

### 2026-05-20 — Framer-inspired landing interactions (GSAP)

- **Shipped:** Hero `expo.out` + CTA scale-in; nav deep blur + sliding spy pill; portal shine/lift + kitchen `#ef5749` rim; sync diagram sequential pulse/line draw; pull quote opacity/`translateY` (no blur); closing magnetic primary CTA (8px cap); desktop orb parallax via `.tl-ambient-shift`.
- **Files:** `landing-motion.tsx`, `landing-page.tsx` (CSS/classes only — copy/nav unchanged).
- **Docs:** `docs/research/motion-patterns.md` — Framer-inspired pass table.
- **Verify:** `pnpm run build`, `npm run demo:verify` pass.

### 2026-05-20 — Landing animation stack decision (senior-dev / architect)

- **Doc:** `docs/research/senior-dev-animation-decision.md` — **hybrid:** keep GSAP+ScrollTrigger in `landing-motion.tsx` (dynamic import, single context, kill on unmount); CSS for ticker/ambient; **no** `framer-motion` on landing; ≤55 KB gzip deferred animation chunk; per-section tool table; palette/visual changes still blocked on `landing-design-options.md` (not in repo yet).
- **Parallel OK:** motion perf hardening (mobile scrub gating, pointer-only tilt) without token edits.

### 2026-05-20 — Typography & color research (user selection)

- **Added:** `docs/research/typography-color-research.md` — 4 type pairings (Google Fonts + fallbacks, landing scale, demo fit) + 5 palette options A–E (hex tokens, personalities, admin `#0b0e14` / `#cdfa50` vs Pre-Monsoon landing).
- **Blocked on user:** Pick one palette + one pairing before retokenizing landing and/or demos.

### 2026-05-20 — Landing design options (user selection doc)

- **Added:** `docs/landing-design-options.md` — palettes A–E, fonts 1–4, motion subtle/medium/bold matrix, cross-portal roadmap. Superseded for type/color depth by `docs/research/typography-color-research.md`; options derived from landing + demo HTML.
- **Added:** `public/design-preview/palettes.html` — static side-by-side palette cards; click selects + `localStorage` key `tray-landing-palette`.
- **Blocked on user:** Reply `I pick palette [A–E] + font [1–4] + motion [subtle|medium|bold]` before retokenizing `landing-page.tsx`.
- **Default recommendation:** Palette **A** + font **1** + motion **medium** (current ship).

### 2026-05-20 — Reference sites browser exploration (8 URLs)

- **Added:** `docs/research/reference-sites-exploration-2026.md` — live browser pass on Zajno, Dribbble (both tags + 2 shots), Tubik, UX Planet, Figma anatomy; cross-links Capital One + Designlab via `external-design-corpus-2026.md`. Top-10 motion + typography synthesis for **Palette E Monsoon Paper**; P0 GSAP/CSS ideas mapped to `landing-motion.tsx`. No landing code changes.
- **Updated:** `external-design-corpus-2026.md`, `zajno-motion-notes.md` — cross-links; Dribbble note marked browser-verified.

### 2026-05-20 — Landing scroll motion research (external)

- **Added:** `docs/research/motion-patterns.md` — 10 premium B2B/SaaS scroll/micro patterns (Awwwards/Godly/GSAP sources), per-section recommendations (hero→footer + Tray section map), performance (`transform`/`opacity`, `will-change`, `ScrollTrigger.batch()`). No code changes.

### 2026-05-20 — Landing team brief (coordination)

- **Added:** `docs/landing-team-brief.md` — merges research + ship state: animation verdict, top-6 motion shortlist, user-pick gate, workflow, anti-patterns. Links `docs/research/*`, `landing-design-options.md`, `design-preview/palettes.html`.

### 2026-05-20 — Landing design-taste + motion-ui polish (GSAP only)

- **Skills:** `/frontend-design`, `/design-taste-frontend`, `/motion-ui` — **skipped** `/compose-multiplatform-patterns` (Kotlin Compose; wrong stack for Next.js landing).
- **CSS** (`landing-page.tsx`, commit `b0938c4` + prior): Slate Ember retained; `100dvh`; nav liquid-glass inset highlight; hero asymmetry offset; ember+green live dot pulse; portal spotlight `--spot-x/y` + rim glow; primary CTA inset highlight; `--tl-ink-4` contrast bump; Inter removed from `--tl-sans`; `data-magnetic` on hero/closing primary CTAs.
- **Motion** (`landing-motion.tsx`, `src/lib/motionTokens.ts`): shared ease tokens; `power4.out` section reveals; diagram border glow on enter; portal spotlight tracks cursor; magnetic CTA via `gsap.quickTo` on `[data-magnetic]` (fine pointer only). No framer-motion on landing route.
- **Verify:** `pnpm run build`, `npm run demo:verify` pass.

### 2026-05-20 — Council landing ship (palette C + font 2 + motion medium+)

- **User pick:** Palette **C — Slate Ember** + font **2** (Newsreader + Manrope + JetBrains Mono) + motion **medium+ (tasteful bold)** — authorized change from default A/1/medium.
- **Shipped:** `landing-page.tsx` — warm stone `--tl-*`, ember/cool accents, demo portal rims (`#5cb1ff` / `#d52821` / `#ef5749` glow / `#cdfa50`); section glows retuned.
- **Shipped:** `layout.tsx` — `Newsreader` next/font; `landing-motion.tsx` — bolder hero/portal/sync/pull/stack; coarse/narrow + reduced-motion guards unchanged.
- **Docs:** `docs/landing-design-options.md` §7 Council selection; `docs/design-system-figma.md` Slate Ember tokens.
- **Verify:** `pnpm run build`, `npm run demo:verify`; push `main` → https://trayy.vercel.app

### 2026-05-20 — F1 landing ship (palette A + font 1 + motion medium) — superseded by council pick above

- **User pick (default):** Palette **A** + font **1** + motion **medium** per `docs/landing-design-options.md`.
- **Shipped:** `landing-page.tsx` — Pre-Monsoon Dusk tokens; portal rims aligned to demos (`#5cb1ff` / `#d52821` / `#cdfa50`); ambient orbs, section glows, nav spy active state; card hover preserved.
- **Shipped:** `landing-motion.tsx` — section choreography (system/sync/flow/stack); GSAP dynamic import; scrub parallax gated off `pointer: coarse` / `max-width: 768px`; portal tilt + btn scale gated to fine pointer; reduced-motion early exit unchanged.
- **Docs:** `docs/design-system-figma.md`, `docs/landing-team-brief.md`, `docs/landing-design-options.md`, `docs/research/*`, `public/design-preview/palettes.html`, `scripts/landing-verify.mjs`.
- **Student portal follow-up (not this pass):** Retokenize `public/demo/student.html` Midnight Sky vars from landing pick; add 5-line token comment block pointing at `--tl-*` source; optional `--portal-*` alias on demo hub only.
- **Verify:** `pnpm install --frozen-lockfile`, `pnpm run typecheck`, `pnpm run build`, `npm run demo:verify`; push `main` → Vercel production.

### 2026-05-20 — ui-ux-pro-max landing audit (a11y + MASTER)

- **Docs:** `design-system/MASTER.md` — Slate Ember summary, UX checklist, Figma cross-links (`ui-ux-pro-max` CLI script missing locally; manual merge from skill + `design-system-figma.md`).
- **Shipped:** `landing-page.tsx` — 44px touch targets (nav links, buttons, portal-open), `touch-action: manipulation`, extended `:focus-visible`, skip link focus-visible, hero `min-height` CLS reserve, `--tl-ink-3` contrast bump (0.52→0.58), live-dot pulse off under reduced-motion.
- **Skipped:** View Transitions on `/` → `/college` (risky); mobile nav hash row unchanged (user-loved layout).
- **Verify:** `pnpm run build`, `npm run demo:verify` — pass.

### 2026-05-20 — Landing brand research doc

- **Added:** `docs/brand-research-landing.md` — personality/voice, Slate Ember + portal hex, typography/clear space, Caregiver+Everyman archetype, motifs, layout map, favicon direction, deck structure, 28 Exa URLs.
- **Exa:** 8 `web_search_exa` queries (campus dining, editorial dark SaaS, foodservice identity, archetypes, favicon, Newsreader).
- **Parallel CLI:** `parallel-cli` not on PATH — no `tray-brand-research` poll output; doc notes setup needed.
- **Not changed:** landing code; reel still BLOCKED (`brand-reel-source.md`).

### 2026-05-20 — Reel brand copy (BLOCKED)

- **Ask:** Align landing copy to user’s social reel (tone, ideology, on-screen text).
- **Blocked:** No reel URL, video file, caption, or transcript in repo or agent transcript.
- **Added:** `docs/brand-reel-source.md` (BLOCKED + unblock checklist + landing mapping); `docs/assets/` placeholder for `reel-source.mp4`.
- **Not changed:** `landing-page.tsx` (no invented reel copy); no commit.

### 2026-05-20 — External design corpus (motion + type)

- **Added:** `docs/research/external-design-corpus-2026.md` — deep extract from Zajno Motion, Tubik (6 web animation types), Capital One micro-interaction handoff, UX Planet + Designlab + Figma typography anatomy; Dribbble pattern recon (10 adapt/avoid); Palette E Monsoon Paper section map; quoted metrics table (1.618 lh example, Tray 150–300ms / ≤800ms).
- **Not changed:** landing code.

### 2026-05-20 — Council 05 Palette E implementation brief

- **Added:** `docs/council/05-implementation-brief-palette-e.md` — single frontend handoff: motifs (ribbon/halo/perforation) + CSS vs GSAP, typography measure/lh, motion retune for paper, critic gates (dark portal chrome, contrast), P0/P1/P2 checklist.
- **Sources:** council 01–04, `brand-research-landing.md`, `landing-design-options.md` E, `MASTER.md`, `docs/research/external-design-corpus-2026.md`.
- **Not changed:** landing code.

### 2026-05-20 — Landing Palette E (Monsoon Paper) council ship

- **Palette:** **E — Monsoon Paper** (light editorial paper, coral `#c43d2f` + sky `#2a5db8`); portal rims unchanged (`#5cb1ff` / `#d52821` / `#ef5749` / `#cdfa50`).
- **Shipped:** `landing-page.tsx` `--tl-*`, light nav glass, coral/sky orbs + section glows, softer portal shadows; dark browser chrome mocks retained.
- **Docs:** `docs/landing-design-options.md` §7 + decision log; `design-system/MASTER.md`; `docs/design-system-figma.md`.
- **Unchanged:** copy, navbar structure, card layout, `landing-motion.tsx`.
- **Verify:** `pnpm run build`, `npm run demo:verify` — pass.

### 2026-05-20 — Palette E frontend polish (council + research)

- **Shipped:** `landing-page.tsx` — Newsreader display scale tokens, 58ch measure, tabular nums, ink-3/4 contrast bump; ticket perforation on hero stats + steam halo in hero glow; queue ribbon on `#sync`; darker portal browser chrome; Monsoon voice hero lede.
- **Shipped:** `landing-motion.tsx` — light-theme diagram shadow; scroll-scrub section headings (fine pointer); richer button hover/press; orb opacity tuned for paper.
- **Sources:** council 01–04, `05-implementation-brief-palette-e.md`, `external-design-corpus-2026.md`, `zajno-motion-notes.md`.
- **Verify:** `pnpm run build`, `npm run demo:verify` — pass.

### 2026-05-20 — Palette E full pass (landing motion + student demo)

- **Shipped:** `landing-page.tsx` — hero ribbon, council pull-quote (3 masked lines), flow accent bar, typography measure tokens, Monsoon hero/closing copy.
- **Shipped:** `landing-motion.tsx` — H1 word clip-path reveal, portal chrome stagger, pull-line mask, ribbon + flow-accent scrub, reduced orb/glow parallax for paper.
- **Shipped:** `public/demo/student.html` — light Monsoon tokens, Manrope 16px / lh 1.55, student blue `#5cb1ff`, paper gradient (no starfield); `TRAY_DEMO` / cart / service mode JS untouched.
- **Docs:** `design-system/MASTER.md` (student scope + measure/motifs); locked design table above.
- **Sources:** council 01–05, `brand-research-landing.md`, `reference-sites-exploration-2026.md`, `zajno-motion-notes.md`, `external-design-corpus-2026.md`.
- **Verify:** `pnpm run build`, `npm run demo:verify` — (run at commit time).

### 2026-05-20 — Zajno Motion browser research

- **Added:** `docs/research/zajno-motion-notes.md` — live review of https://motion.zajno.com/ (GSAP + ScrollTrigger, stagger/mask/easing patterns); five Palette E–adaptable patterns + technical ranges + avoid list (WebGL, scroll hijack, dark showcase).
- **Not changed:** landing code (superseded by full pass above).

### 2026-05-19 — Team harness activated (earlier)

- GSAP on `landing-page.tsx`; student.html rebuild; parallel PM/research agents launched.

### 2026-05-20 — Landing portal cards (copy + hierarchy + motion)

- **System section:** Phase strip **College → Prepare → Handover → Run the operations** (text only, no URLs); browser chrome shows **phase label** instead of fake URL; `PortalPreview` uses **College** / **Prepare · Handover** / **Run the operations** per card.
- **Styling:** Less white/muddy treatment (toned kitchen frame glow, subtler hover spot); **fixed** duplicate `tl-portal-frame` media query and **restored** `student.is-lift` border/shadow; portal head styling superseded by **§02 shell alignment** entry (editorial `tl-bg-2` band + shared diagram tokens).
- **Motion:** `landing-motion.tsx` — snappier portal enter/hover lift, comment updated (lift/tilt not shine).
- **Verify:** `pnpm exec tsc --noEmit` — pass.

### 2026-05-20 — Portal shells aligned with §02 diagram card

- **Shipped:** `landing-page.tsx` — `--tl-editorial-card-*` tokens shared by `.tl-diagram` and `.tl-portal` (Slate Ember `tl-bg-3` surface, `tl-line` border, 18px radius, dashed top hairline like the “connected canteen” diagram). Portal **head** + **preview frame** use `tl-bg-2` inset bands; **feat tags** / **portal-open** use `tl-bg-2` on the lighter shell; preview **overlay** fades to `tl-editorial-card-bg`. Restored **`.tl-portal-frame::before`** shine + `.is-shine` for `landing-motion.tsx`.
- **Not changed:** `landing-motion.tsx` logic; iframe / phase chrome.
- **Verify:** `pnpm exec tsc --noEmit` — pass.

### 2026-05-20 — Landing scroll section motion pass

- **Shipped:** `landing-motion.tsx` — ticker center-out stagger (`REVEAL_EASE`); hero stats scrub parallax when not `lightMotion`; portal head/body stagger after chrome; sync diagram scrub `y` parallax; `#where` line-leave panel scale+fade; `#flow` rail clip/scale enter + flow-step inner stagger; closing `.tl-section-num` timeline; `.tl-footer-mark` scale-in.
- **Shipped:** `landing-page.tsx` — `data-tl-scroll="1"` on ticker + CSS initial state (reduced-motion bypass).
- **Verify:** `pnpm exec tsc --noEmit` — pass.

### 2026-05-20 — Landing portal clutter removal (`landing-page.tsx`: device tags, kitchen/admin browser phase, ix + phase-strip tail; `pnpm exec tsc --noEmit` pass).

### 2026-05-20 — Landing hero + footer polish (Slate Ember continuity, “Tray” mark, GSAP)

- **Hero:** Page shell + nav use `--tl-bg*` tokens; hero band uses `--tl-editorial-card-*` (card-aligned gradient + border); tighter vertical rhythm (padding, h1 min-height, meta/stats gaps); hero rail `Tray · v3.0` with `tl-hero-brandline` (no forced lowercase brand).
- **Footer:** Watermark letters **Tray** with per-char stagger in `landing-motion.tsx` (ScrollTrigger + timeline); footer mark layout/padding; reduced-motion CSS for `[data-tl-footer-char]`.
- **Verify:** `pnpm exec tsc --noEmit`.

### 2026-05-20 — Landing hash nav arrival (GSAP)

- **Shipped:** `landing-motion.tsx` — capture-phase intercept for in-landing `a[href^="#"]` to same targets as `LANDING_HASH_IDS`; `preventDefault` + `history.pushState` + `scrollIntoView({ behavior: "smooth" })`; after settle (`scrollend` + 640ms fallback, deduped) runs `playLandingArrival` (ring pulse, section scale, inner stagger for `#system` / `#flow` / `#stack`) or `reducedMotionArrivalFlash` (~150ms opacity). Initial URL hash: `scheduleInitialHashArrival` with toned-down `"soft"` mode + visibility gate; cleanups wired into existing `cleanup()`.
- **CSS / hooks:** `.tl-arrival-host` + `.tl-arrival-ring` on sections `#system`, `#sync`, `#pull`, `#flow`, `#stack` (`landing-page.tsx`) and `#where` (`landing-line-leave.tsx`).
- **Verify:** `pnpm exec tsc --noEmit` — pass.

### 2026-05-20 — Landing hero h1 wrap seam

- **Fixed:** `landing-page.tsx` — `.tl-h1-line` `row-gap: 0.04em` caused a thin horizontal strip between wrapped flex rows (“reach the counter.”); set `row-gap: 0`.
- **Verify:** `pnpm exec tsc --noEmit` — pass.

### 2026-05-20 — `public/demo/student.html`: student demo shell + menu controls

- **Shell:** Cart / payment chrome still use `--dark-*` / `--on-dark`; **menu** uses `.menu-controls` paper card (`--demo-bar-*`) wrapping `#canteenBar` + `#serviceBar`.
- **Tiles:** `.canteen-segment` and `.service-mode` share `--demo-choice-*` (cream/off-white, `rgba(26,20,14,0.7)` meta, blue-ring selected + light elevation); hint/footer line uses `--demo-choice-meta` + hairline divider.

### 2026-05-20 — Student demo: visible canteen switch + unified menu controls

- **Shipped:** `public/demo/student.html` — `#canteenSelect` visible dropdown; `.menu-controls` + divider; quick canteen pills + `loadCanteenData` / `is-active` unchanged.

### 2026-05-20 — Footer giant mark: tighten T→r tracking (`landing-page.css-in-tsx` split-span margins; `pnpm exec tsc --noEmit`).

### 2026-05-20 — Landing footer row1 typography + grid (`landing-page.tsx` SCOPED_CSS)

- **Layout:** `.tl-footer-row1` — single column below 640px; 640–899px brand full-width + `repeat(3, 1fr)` link columns; ≥900px `minmax(220px, 1.2fr) repeat(3, minmax(0, 1fr))` + responsive gap (replaces `2fr` dead space). First column class `tl-footer-brand`.
- **Type:** Newsreader wordmark/blurb; Manrope (`--tl-sans`) column `h4` + links with bumped rem sizes; `.tl-footer-mark` unchanged.
- **Verify:** `pnpm exec tsc --noEmit` — pass.

### 2026-05-20 — `public/demo/student.html`: `#menuControls` — Newsreader + Manrope only (one stylesheet); `--font-display` / `--font-ui`; global `--mono` → system stack.

### 2026-05-20 — Landing `#sync` layout / headline clipping (`landing-page.tsx` SCOPED_CSS)

- **Fixed:** `.tl-sync` — removed section `overflow: hidden` (was clipping ascenders with tight `h2` metrics); extra top/bottom padding; `#sync` `scroll-margin-top: 100px` (other anchors stay 88px). `.tl-sync-grid` — `align-items: start` (was `center`, copy vs diagram vertical balance). `.tl-sync-grid h2` — `line-height: var(--tl-lh-h2)` + small `padding-top` for glyph headroom.
- **Motion:** No change — `#sync` uses one-shot `y` reveal only (no pin / no diagram parallax).
- **Verify:** `pnpm exec tsc --noEmit` — pass.

### 2026-05-20 — Landing `#pull` + `#sync` impeccable pass (layout, distill, critique)

- **`#pull` layout:** Dropped centered testimonial slab; nested in `.tl-wrap` with `tl-section-num` (`· / From the counter`); left-led `blockquote.tl-pull-quote` (max 44ch); section padding/border-top aligned with `tl-section` rhythm; glow biased top-left (not centered).
- **`#sync` layout:** `.tl-sync-copy` wrapper; lede/meta `max-width` 70ch + `line-height: var(--tl-lh-body)`; meta rows `align-items: flex-start`, keys 56px (left edge with copy).
- **Distill:** Shorter pull quote lines + cite unchanged; sync lede and meta (`PIPE` / `p95` / `BACKUP`) tightened, same proof.
- **Verify:** `pnpm exec tsc --noEmit` — pass; lints clean on `landing-page.tsx`.

### 2026-05-20 — Landing alignment system (`landing-page.tsx` SCOPED_CSS + JSX)

- **Gutter:** `--tl-gutter` (24px / 56px ≥768) + `--tl-max` 1280px; `.tl-wrap` and `.tl-nav-inner` share the same horizontal padding (nav was 20px on small screens vs body 24px).
- **Sync:** `.tl-sync-grid .tl-lede` and `.tl-sync-meta` `max-width` aligned to `min(var(--tl-measure), 48ch)` (same band as `.tl-section-head .tl-side`), replacing 70ch.
- **`#where`:** `.tl-line-leave` vertical padding `80px` / `120px` (≥768) to match `.tl-section` rhythm.
- **`#pull`:** `.tl-pull-quote` — `margin-inline: 0`, `max-width: min(var(--tl-measure-pull), 100%)` (UA blockquote indent + measure).
- **Closing:** Removed inline `justifyContent: center` on demo eyebrow; `.tl-closing` CSS already left-led with `.tl-wrap`.
- **Verify:** `npm run typecheck`; `npm run lint` — pass. No browser screenshots in this pass.

### 2026-05-20 — Landing footer row1 gutter fix (`landing-page.tsx`)

- **Cause:** `footer.tl-footer.tl-wrap` — `.tl-footer { padding: 56px 0 24px }` shorthand overwrote `.tl-wrap { padding: 0 var(--tl-gutter) }` horizontal inset (same specificity, footer rule later).
- **Fix:** `.tl-footer` uses `padding-block` only so `--tl-gutter` (24px / 56px ≥768) applies to row1, mark, and bot.
- **Verify:** lints clean on `landing-page.tsx`.

### 2026-05-20 — Landing footer giant mark right inset (`landing-page.tsx`)

- **Issue:** `.tl-footer-mark` right-aligned watermark — italic “y” visually hugged the edge (glyph overshoot + `padding: 28px 0 12px` had no inline end).
- **Fix:** `padding-block: 28px 12px` + `padding-inline-end: var(--tl-gutter)` (matches site gutter token; scales 24px / 56px). `transform-origin: 100% 50%` unchanged; GSAP footer mark uses its own origins on enter.
- **Mobile:** `overflow: hidden` on mark unchanged — no horizontal bleed.
- **Verify:** lints clean on `landing-page.tsx`.

### 2026-05-20 — Landing section scroll clip + hash anchor (motion layer)

- **Root cause:** `playLandingArrival` scaled entire sections (`transformOrigin: 50% 8%`) so content shifted up under the sticky nav; hash nav used `scrollIntoView({ block: "start" })` with mismatched `scroll-margin-top`; ScrollTrigger pre-reveal tweens (`y`, `#system` clip-path) could stick mid-state on hash jumps or interrupted scroll.
- **Motion (`landing-motion.tsx`):** Removed section scale on arrival (ring pulse only); `getScrollAnchorOffset()` + `scrollLandingSectionTo()` manual scroll with nav offset; `snapSectionRevealState()` on hash click/load; `withRevealCleanup()` clears `transform/clipPath/filter` after reveals; `#sync` reveal retargeted to num/copy/diagram (not grid cols), reduced `y`; sets `scrollPaddingTop` on mount.
- **CSS (`landing-page.tsx`):** `--tl-scroll-anchor: 96px` unified on all anchors; `.tl-arrival-host { overflow: visible }`; ascender padding on display headings; reduced-motion + `.tl-motion-ready` force `#system` clip-path open.
- **Verify:** `npm run typecheck` + `npm run lint` — pass. Manual: hash to `#sync` / each section — headline fully visible below nav; scroll reveals no stuck translateY.

### 2026-05-20 — Landing impeccable pass (critique, layout, animate, overdrive)

- **Layout (`landing-page.tsx`):** Hero cadence: second line uses `.tl-h1-line--secondary` (smaller display size, same Newsreader stack); subtle `text-shadow` on `.tl-h1` for depth (not gradient text); `#system.tl-section` extra top padding after ticker for section rhythm; ≥960px `.tl-sync .tl-diagram` `margin-left: clamp(8px, 2.2vw, 40px)` for asymmetric sync column (no side-stripe border). Copy: em dashes removed from visible marketing strings where touched.
- **Motion (`landing-motion.tsx`):** Nav pill: `gsap.set` width, tween **x + opacity** only (no animated width). Hero CTA row: removed `scale` entrance; hero word stagger slightly tighter. Pull quote: **opacity + y** only (dropped blur + scale). Ticker item stagger slightly wider.
- **Line leave (`landing-line-leave.tsx`):** Hint punctuation: colon instead of em dash in “Skip the crowd” line.
- **a11y / PRM:** `@media (prefers-reduced-motion: reduce)` clears hero `text-shadow` on `.tl-h1`.
- **Verify:** `npm run typecheck`, `npm run lint` — pass. No git commit (per operator). Eyeball: dev default `npm run dev` is **:3000**; use **:3050** only if overridden locally.

### 2026-05-20 — Demo brand → production landing + debug strip (resume)

- **Fixed:** Tray brand / “Marketing site” on `student.html`, `admin.html`, `kitchen.html`, `index.html` now `href="/"` (Next landing at trayy.vercel.app), not stale static `index.html`.
- **Removed:** Session debug ingest (`debug-ingest` API, `landing-motion` probes); cleared stale `.next/types/app/api/debug-ingest`.
- **Verify:** `npm run typecheck`, `npm run lint`, `npm run demo:verify` — pass.
- **Pushed:** `main` for Vercel deploy.
