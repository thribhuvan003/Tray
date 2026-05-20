# Tray landing — Figma integration map

Pre-Monsoon Dusk marketing surface only (`.tray-landing`). Student, kitchen, and admin product UIs use separate palettes.

## Source files

| Role | Path |
|------|------|
| Page shell + copy + scoped CSS | `src/components/landing/landing-page.tsx` |
| GSAP ScrollTrigger + micro-interactions | `src/components/landing/landing-motion.tsx` |
| Line-leave interactive block | `src/components/landing/landing-line-leave.tsx` |
| Route entry | `src/app/page.tsx` |

## Color tokens (CSS → Figma variables)

Create a Figma collection **Tray / Landing / Pre-Monsoon Dusk** with modes **Dark** (default).

| Token | Hex / value | Usage |
|-------|-------------|--------|
| `bg/base` | `#0a0f1a` | Page background top |
| `bg/elevated-1` | `#121a2e` | Cards, sync band |
| `bg/elevated-2` | `#182240` | Frames, chips |
| `bg/elevated-3` | `#223058` | Hover surfaces |
| `ink/primary` | `#ece8e0` | Headlines, primary buttons |
| `ink/secondary` | `rgba(236,232,224,0.76)` | Body |
| `ink/tertiary` | `rgba(236,232,224,0.5)` | Labels |
| `ink/muted` | `rgba(236,232,224,0.3)` | Meta, footer |
| `line/default` | `rgba(236,232,224,0.09)` | Borders |
| `line/strong` | `rgba(236,232,224,0.17)` | Nav scrolled |
| `accent/warm` | `#d4b896` | Italic emphasis, selection, progress mid |
| `accent/cool` | `#8eb8ff` | Ghost hover, hero cool rim |
| `portal/student` | `#5cb1ff` | Student portal accent (demo `--portal-student`) |
| `portal/kitchen` | `#d52821` | Kitchen portal accent (demo `--tomato`) |
| `portal/admin` | `#cdfa50` | Admin portal accent (demo `--lime`) |
| `status/live` | `#6dd4a0` | Live pill |

**Section ambient glows** (radial overlays, bind as optional variables):

| Section | `section-glow` |
|---------|----------------|
| `#system` | `rgba(126,184,255,0.14)` |
| `#sync` | `rgba(212,184,150,0.14)` |
| `#where` | `rgba(184,232,106,0.10)` |
| `.tl-pull` | `rgba(212,184,150,0.16)` |
| `#flow` | `rgba(255,123,110,0.10)` |
| `#stack` | `rgba(142,184,255,0.11)` |

**Page gradient:** `165deg` — `#0a0f1a` → `#10182b` (42%) → `#141f38`.

## Typography

| Role | CSS | Figma text style |
|------|-----|------------------|
| Display / H1 | `var(--font-instrument-serif)` | Instrument Serif Regular, tracking −2.5%, line ~104% |
| Display / H2 | same | clamp 2.5–6rem equivalent |
| Body | `var(--font-manrope)` | Manrope 400–600, 18–22px |
| Mono / labels | `var(--font-geist-mono)` | Geist Mono 600, uppercase, +10–14% tracking |

Italic emphasis uses Instrument Serif Italic + `accent/warm`.

## Spacing & layout

- **Max content width:** 1280px (`.tl-wrap`)
- **Section padding:** 80px mobile / 120px desktop vertical
- **Portal grid:** 1 col → 3 col at 720px, gap 18px
- **Radius:** buttons 999px; cards 18px; inner chips 12px

## Components to mirror in Figma

| Component | Class / selector | Notes |
|-----------|------------------|--------|
| Nav sticky | `.tl-nav` | 82% blur, border `line/default`; scrolled state darkens |
| Scroll progress | `.tl-scroll-progress` | 2px gradient student → warm → kitchen |
| Primary button | `.tl-btn-pri` | Bone fill on ink-dark text |
| Ghost button | `.tl-btn-ghost` | Subtle fill, cool border on hover |
| Portal card | `.tl-portal[data-c]` | Role dot + top border on hover; browser chrome mock |
| Sync diagram node | `.tl-node[data-c]` | Icon square + role pill |
| Flow step | `.tl-flow-step` | Large italic numeral |
| Stack tile | `.tl-stack-card` | 2×4 grid |
| Line-leave chip | `.tl-line-chip.is-on` | Warm border when selected |
| Ticker | `.tl-ticker` | Marquee, pauses on hover |

**Do not redesign portal iframe previews** in Figma — treat as embedded screenshots from `/demo/*.html`.

## Motion (for Figma prototyping / dev handoff)

| Section | Scroll behavior (GSAP) |
|---------|-------------------------|
| Hero | Timeline: words stagger, stat count-up, glow parallax |
| `#system` | Head slides from left; portals rise + rotateX; tags scale in |
| `#sync` | Copy fade-up; diagram scale; nodes alternate from L/R |
| `#where` | Chips `back.out` spring |
| `.tl-pull` | Quote blur → sharp scale |
| `#flow` | Steps stagger; numerals rotate into place |
| `#stack` | Cards pop from center stagger |
| `.tl-closing` | Headline lift + CTA cascade |
| Global | Ambient orbs scrub; nav section spy; portal 3D tilt on hover |

`prefers-reduced-motion: reduce` → skip GSAP; CSS keeps static layout.

## Tailwind / global app

Landing styles are **scoped inline** in `landing-page.tsx` (`SCOPED_CSS`), not Tailwind utilities. Product app uses Tailwind v4 in `src/app/globals.css` — do not merge landing tokens into app theme without an explicit ADR.

## Assets & icons

- **Grain:** inline SVG turbulence (no file)
- **Ambient orbs:** CSS radial gradients only
- **Portal device tags:** emoji prefixes in copy (💻 🖥) — optional SF Symbol / Lucide swap in Figma
- **Live dot:** CSS animation `tlLive`
- **Demo URLs:** `tray.app/demo/*` chrome bar (decorative)

## Figma workflow

1. Run **figma-generate-library** / **search_design_system** against org files if connected.
2. Create variables from table above (Semantic → Primitive).
3. Build **Landing / Portal card** as component set with `student | kitchen | admin` variant (dot color + top accent).
4. Use **Code Connect** (optional): map `.tl-btn-pri` → Button primary, `.tl-portal` → Card/Large.
5. For pixel parity, screenshot `http://localhost:3000` at 1440× and 390× after `npm run dev`.

## Local verify

```bash
npm run dev
# http://localhost:3000
```

Check reduced motion: OS setting **Reduce motion** → hero visible immediately, no scroll choreography.
