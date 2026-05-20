# Tray landing — design options (user selection)

**Purpose:** Pick direction **before** another implementation pass on `landing-page.tsx`. This doc is the contract between design research and code.

**Sources:** Current ship (`src/components/landing/*`), `docs/design-system-figma.md`, `public/demo/*.html` portal palettes. No `docs/research/*` files were present at authoring time — options were inferred from those surfaces.

**Visual picker (optional):** Open [`/design-preview/palettes.html`](/design-preview/palettes.html) in the browser (e.g. `http://localhost:3000/design-preview/palettes.html` after `npm run dev`).

---

## 1. How to choose

Reply in one line (copy/paste template):

```text
I pick palette [A|B|C|D|E] + font [1|2|3|4] + motion [subtle|medium|bold]
```

| Dimension | What you are deciding |
|-----------|------------------------|
| **Palette letter (A–E)** | Page background, ink, accents, section glows, portal rim colors on the **marketing landing only** (`.tray-landing`). Student / kitchen / admin product UIs keep their own themes unless you later approve a token migration (see §5). |
| **Font option (1–4)** | Display + body + mono stack for landing headlines, body, and labels. |
| **Motion intensity** | How much GSAP choreography runs on scroll and hover (see §4). `prefers-reduced-motion` always wins — no animation for users who request it. |

**Default if you want “ship what we have”:** **Palette A + Font 1 + motion medium** (matches production landing as of 2026-05-20).

**Council note:** Landing should feel like one premium film; portals stay **visually distinct** (student cool-night, kitchen cream, admin graphite) so the three cards read as real products, not one gray SaaS blob.

---

## 2. Color palettes A–E

Shared portal rim tokens (held constant across palettes so demo cards stay recognizable):

| Role | Hex | Use on landing |
|------|-----|----------------|
| Student | `#7eb8ff` | Portal card dot / progress bar start |
| Kitchen | `#ff7b6e` | Portal card dot / warm accent moments |
| Admin | `#b8e86a` | Portal card dot |
| Live / OK | `#6dd4a0` | “Live” pill, success hints |

### Palette A — Pre-Monsoon Dusk

**Recommended for Tray** — current production landing.

| Swatch | Token | Hex / value |
|--------|-------|-------------|
| BG base | `--tl-bg` | `#0a0f1a` |
| BG elevated 1 | `--tl-bg-2` | `#121a2e` |
| BG elevated 2 | `--tl-bg-3` | `#182240` |
| BG elevated 3 | `--tl-bg-4` | `#223058` |
| Ink primary | `--tl-ink` | `#ece8e0` |
| Ink secondary | `--tl-ink-2` | `rgba(236,232,224,0.76)` |
| Ink tertiary | `--tl-ink-3` | `rgba(236,232,224,0.5)` |
| Line default | `--tl-line` | `rgba(232,228,220,0.09)` |
| Accent warm | `--tl-accent` | `#d4b896` |
| Accent cool | `--tl-accent-cool` | `#8eb8ff` |
| Page gradient | — | `165deg` `#0a0f1a` → `#10182b` (42%) → `#141f38` |
| Hero glow | — | cool blue + warm amber radials |
| Section glows | per `#system` / `#sync` / `#flow` | blue / amber / green / coral tints (see Figma doc) |

| Pros | Cons |
|------|------|
| Already built, GSAP-tuned, Figma map exists | Slightly “generic premium dark SaaS” without strong campus warmth |
| Bone-on-slate reads well on projectors | Warm accent can feel muted next to kitchen demo’s tomato cream |
| Portal rims match student blue & admin lime story | — |

**Senior UX council (1 paragraph):** This is the safest “Awwwards-dark” baseline: restrained bone typography, dual cool/warm accents, and section-specific glows that guide the eye down the story without shouting. It signals enterprise credibility while the three portal accents carry personality. For Tray’s pitch (college ops + three roles), A is the recommended default unless the team explicitly wants either a student-aligned night (B) or a warmer editorial dusk (C).

---

### Palette B — Midnight Sky

Aligns with `public/demo/student.html` (night + gold accent).

| Swatch | Token | Hex / value |
|--------|-------|-------------|
| BG base | `--tl-bg` | `#060a14` |
| BG elevated 1 | `--tl-bg-2` | `#0c1220` |
| BG elevated 2 | `--tl-bg-3` | `#121a2c` |
| BG elevated 3 | `--tl-bg-4` | `#1a2438` |
| Ink primary | `--tl-ink` | `#e8f0ff` |
| Ink secondary | `--tl-ink-2` | `rgba(232,240,255,0.72)` |
| Line default | `--tl-line` | `rgba(232,240,255,0.10)` |
| Accent warm | `--tl-accent` | `#ffd87a` |
| Accent cool | `--tl-accent-cool` | `#78a8ff` |
| Page gradient | — | `165deg` `#060a14` → `#0a1020` → `#101828` |
| Hero glow | — | starfield-friendly blue + soft gold |

| Pros | Cons |
|------|------|
| Strong continuity student → landing | Kitchen cream card pops hard (intentional contrast) |
| Gold accent feels “campus night out” | Cool ink can feel colder than bone-on-slate for long reads |
| Distinct from typical purple SaaS | Requires retokenizing landing CSS + progress bar feel |

**Senior UX council:** Choose B if the hero message is “students live here first.” The landing becomes an extension of the student demo’s night sky, which helps F1 demos feel like one brand—but the kitchen portal preview will look like a deliberate genre shift (fine if copy acknowledges three tailored experiences).

---

### Palette C — Slate Ember

Warmer dusk, less blue in the base gradient.

| Swatch | Token | Hex / value |
|--------|-------|-------------|
| BG base | `--tl-bg` | `#0d0c0a` |
| BG elevated 1 | `--tl-bg-2` | `#16140f` |
| BG elevated 2 | `--tl-bg-3` | `#1f1c16` |
| BG elevated 3 | `--tl-bg-4` | `#2a261e` |
| Ink primary | `--tl-ink` | `#f2ebe3` |
| Ink secondary | `--tl-ink-2` | `rgba(242,235,227,0.78)` |
| Line default | `--tl-line` | `rgba(242,235,227,0.10)` |
| Accent warm | `--tl-accent` | `#e8a86a` |
| Accent cool | `--tl-accent-cool` | `#9ec4ff` |
| Page gradient | — | `165deg` `#0d0c0a` → `#1a1610` → `#221c14` |
| Hero glow | — | ember orange + muted blue |

| Pros | Cons |
|------|------|
| Food-adjacent warmth without going full kitchen cream | Less “tech” than A/B at first glance |
| Feels human on long scroll | Section glows need re-tuning so sync doesn’t look muddy |
| Pairs well with line-leave / takeaway story | Further from admin graphite chartreuse |

**Senior UX council:** C is the emotional middle: still dark-mode premium, but the base neutrals lean brown-stone so canteen context lands faster. Good if stakeholders found A “too cold.” Risk: slightly lower contrast on tertiary ink—verify WCAG on `.tl-ink-3` labels.

---

### Palette D — Graphite Signal

Admin-demo adjacency: graphite + chartreuse signal on dark.

| Swatch | Token | Hex / value |
|--------|-------|-------------|
| BG base | `--tl-bg` | `#0b0e14` |
| BG elevated 1 | `--tl-bg-2` | `#11151d` |
| BG elevated 2 | `--tl-bg-3` | `#171c26` |
| BG elevated 3 | `--tl-bg-4` | `#1f2531` |
| Ink primary | `--tl-ink` | `#eef1f7` |
| Ink secondary | `--tl-ink-2` | `rgba(238,241,247,0.75)` |
| Line default | `--tl-line` | `rgba(255,255,255,0.07)` |
| Accent warm | `--tl-accent` | `#ffb22a` |
| Accent cool / signal | `--tl-accent-cool` | `#cdfa50` |
| Page gradient | — | `165deg` `#0b0e14` → `#0f131b` → `#141a24` |
| Hero glow | — | lime haze + amber secondary |

| Pros | Cons |
|------|------|
| “Ops dashboard” credibility for admins in the room | Lime on dark is loud—easy to overuse |
| Matches `admin.html` chrome | Can feel less student-friendly in hero |
| Sharp monospace labels look at home | Student portal card may need extra blue rim weight |

**Senior UX council:** Pick D when the buyer persona is canteen manager / college IT first. The landing whispers “control plane,” which helps multi-tenant and audit story beats—but student-facing warmth must come from copy and the student portal preview, not the page chrome.

---

### Palette E — Monsoon Paper (light marketing)

Light editorial sheet — **bold brand break**; not current production.

| Swatch | Token | Hex / value |
|--------|-------|-------------|
| BG base | `--tl-bg` | `#f7f3ea` |
| BG elevated 1 | `--tl-bg-2` | `#fffaf0` |
| BG elevated 2 | `--tl-bg-3` | `#f0e8d8` |
| BG elevated 3 | `--tl-bg-4` | `#e8decc` |
| Ink primary | `--tl-ink` | `#1a140e` |
| Ink secondary | `--tl-ink-2` | `rgba(26,20,14,0.72)` |
| Line default | `--tl-line` | `rgba(26,20,14,0.12)` |
| Accent warm | `--tl-accent` | `#c43d2f` |
| Accent cool | `--tl-accent-cool` | `#2a5db8` |
| Page gradient | — | subtle warm paper wash (no heavy dark gradient) |
| Hero glow | — | soft coral + sky wash |

| Pros | Cons |
|------|------|
| Stands out in a sea of dark SaaS landings | Full re-layout: nav glass, grain, orb visibility |
| Natural bridge toward kitchen cream demo | Portal browser chrome mocks need darker frames |
| Print / PDF pitch decks match screen | GSAP blur/scale tricks tuned for dark may need rework |
| Accessible large-type editorial | “Premium night” positioning shifts |

**Senior UX council:** E is a strategic bet, not a polish pass. Choose it only if Tray wants to own “daylight canteen” as the brand metaphor. Execution cost is highest; reward is memorability in college admin circles tired of black-gradient startups.

---

### Recommendation summary

| Palette | **Recommended for Tray?** |
|---------|---------------------------|
| **A — Pre-Monsoon Dusk** | **Yes (default)** |
| B — Midnight Sky | Optional — student-first narrative |
| C — Slate Ember | Optional — warmer story |
| D — Graphite Signal | Optional — admin/ops-first narrative |
| E — Monsoon Paper | Only if committing to light landing rebuild |

---

## 3. Font pairings 1–4

Landing uses three roles: **Display** (H1/H2, italic emphasis), **Body** (lede, UI), **Mono** (section nums, tags, ticker).

### Option 1 — Instrument + Manrope + Geist Mono (current)

| Role | Family | Specimen |
|------|--------|----------|
| Display | Instrument Serif | **Tray** — *three portals, one queue* |
| Body | Manrope | Order from laptop. Kitchen sees it instantly. Admin sees the money. |
| Mono | Geist Mono | `01 · SYSTEM` `LIVE` `AES-256` |

**Pairing with portals**

| Portal | Demo fonts | Harmony |
|--------|------------|---------|
| Student | Instrument Serif + Inter + Space Mono | Strong — shared display serif |
| Kitchen | Newsreader + Manrope + JetBrains Mono | Good — shared Manrope body |
| Admin | Space Grotesk + Geist Mono | Moderate — landing feels more editorial than admin |

---

### Option 2 — Newsreader + Manrope + JetBrains Mono

| Role | Family | Specimen |
|------|--------|----------|
| Display | Newsreader | **Tray** — *three portals, one queue* |
| Body | Manrope | Order from laptop. Kitchen sees it instantly. |
| Mono | JetBrains Mono | `01 · SYSTEM` `LIVE` |

**Pairing with portals:** Best match for **kitchen** demo; student still ok (serif display); admin remains sans-forward.

---

### Option 3 — Instrument + Inter + Space Mono

| Role | Family | Specimen |
|------|--------|----------|
| Display | Instrument Serif | **Tray** — *three portals, one queue* |
| Body | Inter | Order from laptop. Kitchen sees it instantly. |
| Mono | Space Mono | `01 · SYSTEM` `LIVE` |

**Pairing with portals:** Best match for **student** demo; kitchen less “recipe book”; admin ok on mono.

---

### Option 4 — Space Grotesk + Geist Mono (sans-only display)

| Role | Family | Specimen |
|------|--------|----------|
| Display | Space Grotesk | **TRAY** — three portals, one queue |
| Body | Space Grotesk | Order from laptop. Kitchen sees it instantly. |
| Mono | Geist Mono | `01 · SYSTEM` `LIVE` |

**Pairing with portals:** Aligns with **admin**; loses editorial serif hero unless you add a secondary italic cut. Most “B2B SaaS” — use only if serif feels off-brand.

**Font recommendation:** **Option 1** (current) for balanced three-portal story; **Option 2** if kitchen is the emotional anchor in live demos.

---

## 4. Motion menu

Pattern names match `landing-motion.tsx` + `docs/design-system-figma.md`. Intensity scales durations, distances, and optional effects—not different section order.

| Section | DOM / class | Pattern name (medium baseline) |
|---------|-------------|--------------------------------|
| **Global** | `.tl-scroll-progress` | Scroll-linked scaleX progress |
| **Global** | `.tl-nav` | Sticky blur + `is-scrolled` threshold |
| **Global** | `.tl-orb` ×3 | Ambient orb parallax scrub |
| **Global** | `.tl-btn` | Hover scale micro-interaction |
| **Hero** | `.tl-hero` | Hero intro timeline |
| **Hero** | `.tl-h1 .tl-word` | Word stagger rise |
| **Hero** | `.tl-hero-stat` | Stat count-up + stagger |
| **Hero** | `.tl-hero-glow` | Glow parallax scrub |
| **System** | `#system` | Editorial head slide + portal deck fan-in |
| **System** | `.tl-portal` | 3D chrome tilt on pointer |
| **Sync** | `.tl-sync` | Panel fade-up + diagram scale |
| **Sync** | `.tl-diagram .tl-node` | Alternating lane enter (`back.out`) |
| **Sync** | `.tl-diagram .tl-arr` | Connector scaleX reveal |
| **Line leave** | `#where` | Spring chip pop (`back.out`) |
| **Pull quote** | `.tl-pull` | Blur dissolve + soft scale |
| **Flow** | `#flow` | Stepped rise + numeral spin |
| **Stack** | `#stack` | Radial center pop stagger |
| **Closing** | `.tl-closing` | Headline lift + CTA cascade |
| **Footer** | `.tl-footer` | Row stagger fade-up |

### Intensity matrix (what changes)

| Section | Subtle | Medium (ship) | Bold |
|---------|--------|---------------|------|
| **Hero** | Single fade (no word split); stats static | Word stagger 0.045s; count-up 1s | Larger Y (60px+); longer stagger; orb scrub ×1.5 |
| **System** | Opacity-only portal reveal | Fan-in Y72 + rotateX 12° | rotateX 18°; stagger 0.2s; stronger head X slide |
| **Sync** | Diagram fade | Scale 0.94→1; nodes alternate ±36px | Nodes ±56px; `back.out(2)`; arrows bounce |
| **Line leave** | Chips fade | `back.out(1.6)` scale | Stronger spring; chip Y 28px |
| **Pull quote** | Opacity only | Blur 8px → 0 | Blur 14px; scale 1.12→1 |
| **Flow** | Steps fade | Numeral rotate −12°→0 | Higher step Y; numeral `back.out(2.2)` |
| **Stack** | Cards fade | Center pop 0.86→1 | scale 0.75→1; longer radial stagger |
| **Portals** | No tilt | 7° / 5° chrome tilt | 12° / 8° tilt + slight Z translate |
| **Footer / closing** | Short 0.4s fades | Current cascade | +30% distance; CTA stagger 0.12s |
| **Global orbs** | Static or very slow scrub | scrub 1.2–1.8 | scrub 0.8; larger travel |

**Motion recommendation:** **Medium** for production (already tuned post-FOUC fix). **Subtle** for accessibility-sensitive audiences or low-power devices marketing. **Bold** only if stakeholder explicitly wants “Awwwards max” and accepts longer first paint choreography.

---

## 5. Cross-portal roadmap

Landing tokens stay scoped to `.tray-landing` until an ADR approves app-wide merge (`docs/design-system-figma.md`).

### Phase 1 — Landing (this selection)

1. User picks palette + font + motion (this doc).
2. Implement tokens in `landing-page.tsx` `SCOPED_CSS` only.
3. Tune `landing-motion.tsx` intensity preset (subtle / medium / bold).
4. Update `docs/design-system-figma.md` variable table to match pick.
5. Verify: `npm run typecheck`, `npm run build`, manual reduced-motion check.

### Phase 2 — Student portal token migration (after landing locked)

1. **Extract** shared semantic tokens (`bg`, `ink`, `accent`, `portal-*`) into `src/app/globals.css` or a `tokens/tray.css` file — **do not** import landing gradient/orbs into app shell.
2. **Map** student app to palette choice: if landing **B**, align student `--bg` / gold accent; if **A**, keep student night but harmonize rim blue `#7eb8ff`.
3. **Typography:** adopt landing body/mono in student layout (likely Manrope/Geist Mono from option 1) while preserving density for cart/sidebar.
4. **Motion:** reuse only **micro** patterns (button scale, focus); no full-page GSAP on student app.
5. **Demo parity:** update `public/demo/student.html` CSS variables to match migrated tokens (pitch continuity).
6. **QA:** `npm run demo:verify`, laptop sidebar cart path, veg lane, service mode — per `docs/DEMO-SPEC.md`.

### Phase 3 — Later (out of scope until requested)

- Kitchen / admin demos remain on cream-tomato and graphite-lime until separate selection docs.
- Optional Code Connect / Figma library generation from final landing tokens.

---

## 6. Decision log (fill when user replies)

| Field | Choice |
|-------|--------|
| Palette | **E — Monsoon Paper** |
| Font | **2 — Newsreader + Manrope + JetBrains Mono** |
| Motion | **Medium+** |
| Date | 2026-05-20 |
| Notes | Light landing; portal chrome mocks stay dark |

---

## 7. Council selection — shipped

**Date:** 2026-05-20  
**Authority:** Product owner authorized palette, font, and motion change (no longer locked to Palette A + Font 1).

| Dimension | Choice | Shipped in |
|-----------|--------|------------|
| **Palette** | **E — Monsoon Paper** | `landing-page.tsx` `--tl-*` |
| **Fonts** | **2 — Newsreader + Manrope + JetBrains Mono** | `layout.tsx` + `landing-page.tsx` |
| **Motion** | **Medium+ (tasteful bold)** | `landing-motion.tsx` |

### Why this direction

**Painter / concept lens:** Monsoon Paper is a **daylight editorial sheet**—warm paper neutrals with coral monsoon wash and sky-blue service lanes. It reads like a canteen menu board at opening hour: readable, human, and distinct from dark-gradient SaaS landings. Portal accents stay **demo-true** (`#5cb1ff` / `#d52821` / `#cdfa50`) with **dark browser chrome** inside previews so the three products still read as real night/cream/graphite apps.

**UX lens:** Palette E is a strategic brand break—memorable in admin and college circles tired of black heroes. **Font 2** (Newsreader + Manrope + JetBrains Mono) bridges the kitchen demo while keeping landing density. **Medium+** motion is unchanged; light surfaces use softer portal shadows and coral/sky section glows. `prefers-reduced-motion` and coarse-pointer guards unchanged.

### Portal preview tokens (landing only)

| Role | Hex | Source |
|------|-----|--------|
| Student | `#5cb1ff` | Demo audit |
| Kitchen | `#d52821` (dot), `#ef5749` (glow) | Demo audit |
| Admin | `#cdfa50` | Demo audit |
| Live | `#6dd4a0` | Unchanged |

### Not in this pass

- Marketing copy / navbar / card structure unchanged.
- `public/demo/student.html` token migration deferred (Phase 2 in §5).

---

*Document version: 2026-05-20 (council ship). Owner: landing design track.*
