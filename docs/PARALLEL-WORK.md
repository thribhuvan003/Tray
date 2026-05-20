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
| Landing (Next) | **Slate Ember** (palette C) + Newsreader/Manrope/JetBrains (font 2) + motion medium+ |
| Student demo | Midnight Sky, desktop sidebar |
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

### 2026-05-20 — Demo data not showing (fix)

- **Root cause:** `demo-canteens.js` had `avgPickupSec: 05` (invalid strict-mode octal) → entire script failed → no menu/orders anywhere. Student also looped on `storage` because `loadCanteenData` always called `setSelectedCanteenId`.
- **Fix:** `avgPickupSec: 5`; `setSelectedCanteenId` no-ops when unchanged; expanded menus (10 dishes/canteen) + preset kitchen tickets; `package.json` `dev` pinned to **port 3000**.
- **Open demos:** `npm run dev` → http://localhost:3000/demo/student.html (switch Aditya vs North Block). E2E: `DEMO_BASE=http://localhost:3000/demo node scripts/demo-verify.mjs --e2e`.

### 2026-05-20 — Landing polish (Awwwards-tier motion + tokens)

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

### 2026-05-20 — Landing scroll motion research (external)

- **Added:** `docs/research/motion-patterns.md` — 10 premium B2B/SaaS scroll/micro patterns (Awwwards/Godly/GSAP sources), per-section recommendations (hero→footer + Tray section map), performance (`transform`/`opacity`, `will-change`, `ScrollTrigger.batch()`). No code changes.

### 2026-05-20 — Landing team brief (coordination)

- **Added:** `docs/landing-team-brief.md` — merges research + ship state: animation verdict, top-6 motion shortlist, user-pick gate, workflow, anti-patterns. Links `docs/research/*`, `landing-design-options.md`, `design-preview/palettes.html`.

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

### 2026-05-19 — Team harness activated (earlier)

- GSAP on `landing-page.tsx`; student.html rebuild; parallel PM/research agents launched.
