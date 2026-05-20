# Tray — Typography & color research

**Purpose:** Give the team four distinct type pairing directions and five complete dark palettes to choose from—editorial and harmonious, not neon chaos.  
**Context in repo today:**

| Surface | Background | Accent | Type |
|---------|------------|--------|------|
| Marketing landing (`landing-page.tsx`) | `#0a0f1a` (cool slate) | Warm `#d4b896`, portal admin `#b8e86a` | Instrument Serif + Manrope + Geist Mono |
| Admin demo (`public/demo/admin.html`) | `#0b0e14` (graphite) | Chartreuse `#cdfa50` | Space Grotesk + Geist Mono |
| Kitchen demo (`public/demo/kitchen.html`) | Cream `#f4e6c1` (light) | Tomato `#d52821` | Newsreader + Manrope |
| Demo hub (`public/demo/index.html`) | `#0e0a06` (warm black) | Persimmon + portal lime `#cdfa50` | Instrument Serif family |

**Research value: high** — Strong convergence on dark-mode token practice (chromatic neutrals, desaturated accents, 4–5 surface steps) and on serif display + humanist sans body for editorial product marketing; lime-on-graphite is a documented “tech-forward” accent pattern when used sparingly.

---

## Typography — four pairing options

Principles applied (from editorial and dark-UI practice):

- **Display carries voice; body carries workload.** Serif or expressive sans for H1/H2 only; neutral sans for paragraphs, nav, forms, and dense UI.
- **Italic emphasis** works best on a display serif with a real italic (Instrument Serif, Fraunces, Newsreader, Cormorant)—not faux-bold sans italics.
- **Mono third voice** for eyebrows, order IDs, kitchen timers: Geist Mono or JetBrains Mono at 11px, +0.12–0.16em tracking, uppercase.
- **Dark-mode sizing:** Slightly looser line-height on body (1.55–1.62); display sizes use negative tracking (−0.02em to −0.035em) but not tighter than −0.04em on mobile.

### Recommended landing type scale (all pairings)

Use these as Figma / CSS targets; adjust with `clamp()` as in the current landing.

| Role | Desktop | Mobile | Weight | Line height | Tracking | Font role |
|------|---------|--------|--------|-------------|----------|-----------|
| Display / H1 | 96–132px | 48–56px | 400 (serif) or 600 (sans display) | 0.92–1.04 | −0.025em to −0.035em | Display |
| Section H2 | 64–96px | 40–48px | 400 | 0.94–1.0 | −0.02em to −0.03em | Display |
| H3 / card title | 28–32px | 24–28px | 500–600 | 1.1–1.2 | −0.01em | Body sans |
| Hero lede | 22px | 18–20px | 400 | 1.55–1.58 | 0 | Body sans |
| Body | 18px | 16–18px | 400 | 1.58–1.62 | 0 | Body sans |
| UI / nav | 14–16px | 14px | 500–600 | 1.2–1.4 | 0 | Body sans |
| Eyebrow / label | 11–12px | 11px | 500–600 | 1.35 | +0.12–0.16em | Mono, uppercase |

---

### Pairing 1 — **Condensed editorial** (closest to current landing)

| Role | Google Font | System fallback stack |
|------|-------------|------------------------|
| Display | [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) (400, italic for emphasis) | `ui-serif, Georgia, "Times New Roman", serif` |
| Body | [Manrope](https://fonts.google.com/specimen/Manrope) (400, 500, 600) | `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif` |
| Mono | [Geist Mono](https://vercel.com/font) or [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) | `ui-monospace, Menlo, Consolas, monospace` |

**Why it fits editorial dark + lime:** Instrument Serif is literally built for editorial headlines on dark, high-contrast layouts—condensed, confident italic, dramatic without clutter. Manrope’s rounded humanist shapes **warm** cool graphite backgrounds so lime reads as “fresh signal,” not arcade neon. This is the path of least resistance with `landing-page.tsx` and `docs/design-system-figma.md`.

**Sample snippet**

- H1: Instrument Serif 400, 104px / 0.94 / −0.03em — *“Order lunch like a magazine spread.”*
- Body: Manrope 400, 18px / 1.6 — *“Tray connects student menus, kitchen queues, and canteen admin in one tenant-aware system.”*
- Eyebrow: Geist Mono 600, 11px uppercase — `LIVE · ADITYA ENGINEERING`

**Demo compatibility:** Landing already uses this. Admin demo uses Space Grotesk instead—if you unify on Pairing 1 for marketing only, demos can stay on Space Grotesk for product chrome.

---

### Pairing 2 — **Soft vintage editorial** (painterly, warm neutrals)

| Role | Google Font | System fallback stack |
|------|-------------|------------------------|
| Display | [Fraunces](https://fonts.google.com/specimen/Fraunces) (300–500, opsz 9–144, italic for pull quotes) | `ui-serif, Georgia, serif` |
| Body | [DM Sans](https://fonts.google.com/specimen/DM+Sans) (400, 500, 700) | `ui-sans-serif, system-ui, sans-serif` |
| Mono | JetBrains Mono (400, 500) | `ui-monospace, Menlo, monospace` |

**Why it fits editorial dark + lime:** Fraunces has **soft, old-style serif texture**—it feels hand-set and “food story” without going rustic script. On near-black, it picks up ambient warm light from bone-tinted text. DM Sans is geometric but friendly; it keeps dashboards legible. Lime accent on warm-tinted dark (`#12100e`) feels like **chartreuse oil paint on umber ground**—harmonious if lime saturation is pulled down ~10% (`#c4e86a` not `#c6ff00`).

**Sample snippet**

- H1: Fraunces 400, 96px / 1.0 / −0.02em
- Body: DM Sans 400, 18px / 1.62
- Italic emphasis in display: Fraunces italic 400, accent warm (`#d4b896`) or muted lime

**Demo compatibility:** Pairs naturally with **Pre-Monsoon Dusk** landing tokens and warm demo hub (`#0e0a06`). Less aligned with cool graphite admin (`#0b0e14`) unless neutrals are warmed.

---

### Pairing 3 — **Newsroom clarity** (reading-first; bridges kitchen demo)

| Role | Google Font | System fallback stack |
|------|-------------|------------------------|
| Display | [Newsreader](https://fonts.google.com/specimen/Newsreader) (400–600, optical size 6–72) | `ui-serif, Georgia, serif` |
| Body | [Source Sans 3](https://fonts.google.com/specimen/Source+Sans+3) (400, 600) | `"Segoe UI", Roboto, ui-sans-serif, system-ui, sans-serif` |
| Mono | JetBrains Mono | `ui-monospace, Menlo, monospace` |

**Why it fits editorial dark + lime:** Newsreader was designed for **long-form on-screen reading** with optical sizing—excellent for “campus newspaper” tone. Source Sans 3 is neutral and institutional (Adobe lineage), so lime becomes the **only loud hue** in the system. Works when Tray should feel trustworthy and operational, not fashion-forward.

**Sample snippet**

- H1: Newsreader 500, 88px / 0.95 / −0.02em
- Body: Source Sans 3 400, 18px / 1.58
- Kitchen light mode can share Newsreader display for **one type family across portals** (kitchen demo already uses Newsreader + Manrope—swap Manrope → Source Sans 3 for stricter hierarchy).

**Demo compatibility:** **Best alignment with kitchen demo** (already Newsreader). Admin dark demo would need Space Grotesk → Source Sans 3 migration for full unity.

---

### Pairing 4 — **Campus modernist** (geometric display, demo-adjacent)

| Role | Google Font | System fallback stack |
|------|-------------|------------------------|
| Display | [Syne](https://fonts.google.com/specimen/Syne) (600–800 for H1; avoid at text sizes) | `ui-sans-serif, system-ui, sans-serif` |
| Body | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (400, 500, 600) | `ui-sans-serif, system-ui, sans-serif` |
| Mono | Geist Mono | `ui-monospace, Menlo, monospace` |

**Why it fits editorial dark + lime:** Syne at bold weights is **wide and poster-like**—editorial in the Swiss-poster sense, not magazine serif. Plus Jakarta Sans is clean and contemporary for student-facing UI. This pairing sits between marketing drama and **admin demo’s Space Grotesk energy** (geometric, confident). Lime reads as **wayfinding color** on structured grids—use lime only on primary CTA, live pills, and chart highlights.

**Sample snippet**

- H1: Syne 700, 80px / 0.92 / −0.02em (all-caps optional for hero only)
- Body: Plus Jakarta Sans 400, 18px / 1.6
- Limit Syne to ≤6 words per line in hero to avoid “techno shout”

**Demo compatibility:** **Closest to admin demo** temperament (geometric sans). Pair with **Option A Graphite Chartreuse** for a coherent product story; less suited to warm persimmon landing without retokenizing.

---

### Typography decision matrix

| Criterion | Pairing 1 | Pairing 2 | Pairing 3 | Pairing 4 |
|-----------|-----------|-----------|-----------|-----------|
| “Editorial magazine” | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★☆☆☆ |
| “Painterly / warm dark” | ★★★☆☆ | ★★★★★ | ★★★☆☆ | ★★☆☆☆ |
| Admin demo continuity | ★★☆☆☆ | ★★★☆☆ | ★★★☆☆ | ★★★★★ |
| Kitchen demo continuity | ★★★☆☆ | ★★★☆☆ | ★★★★★ | ★★☆☆☆ |
| Current landing continuity | ★★★★★ | ★★★☆☆ | ★★☆☆☆ | ★★☆☆☆ |

---

## Color — five palette options

Dark-mode guidance used: near-black **chromatic** bases (not `#000`), 4 surface steps (+4–6 L in HSL per step), accents **lighter and slightly less saturated** than light-mode equivalents, three text tiers. Lime family anchored to demo `#cdfa50` / `#cdfa50` (admin) with alternatives where noted.

---

### Option A — **Graphite Chartreuse**

**Personality:** Ops dashboard — crisp, cool, lime as instrument panel light.

| Token | Hex | Notes |
|-------|-----|-------|
| `bg` | `#0b0e14` | Page base (matches admin demo) |
| `surface` | `#11151d` | Cards, sidebar |
| `surface-2` | `#171c26` | Raised panels |
| `surface-3` | `#1f2531` | Hover / active |
| `text-primary` | `#eef1f7` | Headlines, primary buttons on dark |
| `text-secondary` | `#aab3c5` | Body |
| `text-tertiary` | `#6d7689` | Meta, placeholders |
| `accent` | `#cdfa50` | Primary CTA, selection, live (demo `--lime`) |
| `accent-muted` | `rgba(205, 250, 80, 0.12)` | Soft fills |
| `border` | `rgba(255, 255, 255, 0.07)` | Default hairlines |
| `border-strong` | `rgba(255, 255, 255, 0.13)` | Nav scrolled, focus rings |
| `success` | `#3fe6a3` | Paid, ready (demo `--mint`) |
| `warning` | `#ffb22a` | Queue pressure (demo `--amber`) |
| `danger` | `#ff6b6b` | Cancel / error (demo `--rose`) |

**Demo compatibility:** **Native fit** for `admin.html` and portal admin `#cdfa50` on `index.html`. Marketing landing would need to **drop blue-slate Pre-Monsoon** in favor of this graphite stack for one system.

---

### Option B — **Pre-Monsoon Dusk**

**Personality:** Evening campus sky — cool depth, bone ink, warm italic accent (not lime-first).

| Token | Hex | Notes |
|-------|-----|-------|
| `bg` | `#0a0f1a` | Page base (current landing) |
| `surface` | `#121a2e` | Cards |
| `surface-2` | `#182240` | Frames |
| `surface-3` | `#223058` | Hover |
| `text-primary` | `#ece8e0` | Bone white ink |
| `text-secondary` | `rgba(236, 232, 224, 0.76)` | Body |
| `text-tertiary` | `rgba(236, 232, 224, 0.50)` | Labels |
| `accent` | `#d4b896` | Warm editorial emphasis (current `--tl-accent`) |
| `accent-lime` | `#b8e86a` | Admin portal stripe only—**secondary** accent |
| `border` | `rgba(236, 232, 224, 0.09)` | |
| `border-strong` | `rgba(236, 232, 224, 0.17)` | |
| `success` | `#6dd4a0` | Live / paid |
| `warning` | `#e8b86a` | Derived warm warning |
| `portal-student` | `#7eb8ff` | |
| `portal-kitchen` | `#ff7b6e` | |
| `portal-admin` | `#b8e86a` | Softer than demo lime |

**Demo compatibility:** **Matches production landing** today. Admin demo lime (`#cdfa50`) is **brighter and cooler**—treat as related but not identical; document in Figma as “marketing admin” vs “app admin” or converge accent in a future pass.

---

### Option C — **Warm Mess Hall**

**Personality:** Late-evening canteen — brown-black walls, honey and tomato echoes, lime only for “go” actions.

| Token | Hex | Notes |
|-------|-----|-------|
| `bg` | `#0e0a06` | Warm black (demo hub) |
| `surface` | `#16110c` | |
| `surface-2` | `#1f1812` | |
| `surface-3` | `#2a2219` | |
| `text-primary` | `#f2ebe3` | Warm white |
| `text-secondary` | `#b9a998` | |
| `text-tertiary` | `#7a6f62` | |
| `accent` | `#e3a02a` | Honey mustard — primary brand heat |
| `accent-lime` | `#b8d94a` | **Desaturated chartreuse** for “confirm / live” only |
| `border` | `rgba(242, 235, 227, 0.10)` | |
| `border-strong` | `rgba(242, 235, 227, 0.18)` | |
| `success` | `#7cc788` | |
| `warning` | `#e8a84c` | |
| `danger` | `#d52821` | Kitchen tomato tie-in |

**Demo compatibility:** Aligns with **demo index** warm base and kitchen **tomato/mustard** vocabulary. Admin cool graphite will feel like a different building unless admin adopts warmed surfaces.

---

### Option D — **Swiss Editorial**

**Personality:** Neutral gallery wall — achromatic discipline, lime as single fluorescent brushstroke.

| Token | Hex | Notes |
|-------|-----|-------|
| `bg` | `#111111` | Neutral near-black |
| `surface` | `#181818` | |
| `surface-2` | `#222222` | |
| `surface-3` | `#2c2c2c` | |
| `text-primary` | `#f4f4f0` | Slight warm white |
| `text-secondary` | `#a8a8a4` | |
| `text-tertiary` | `#6b6b68` | WCAG-safe tertiary on `#111` |
| `accent` | `#cdf050` | User-requested lime (slightly softer than `#cdfa50`) |
| `accent-on-accent` | `#0a0a0a` | Text on lime buttons |
| `border` | `rgba(255, 255, 255, 0.08)` | |
| `border-strong` | `rgba(255, 255, 255, 0.16)` | |
| `success` | `#4ade80` | |
| `warning` | `#fbbf24` | |

**Demo compatibility:** Lime hex **closest to user brief** (`#cdf050`). Admin demo’s cool blue-gray bg (`#0b0e14`) is a temperature shift—either migrate admin to `#111` family or accept two neutral temperatures.

---

### Option E — **Night Garden** (sage accent alternative)

**Personality:** Cool forest at night — calm, food-safe greens; lime replaced by sage for less “neon.”

| Token | Hex | Notes |
|-------|-----|-------|
| `bg` | `#0a1210` | Blue-green black |
| `surface` | `#0f1815` | |
| `surface-2` | `#152019` | |
| `surface-3` | `#1c2a22` | |
| `text-primary` | `#e8f0ec` | Cool white |
| `text-secondary` | `#9eb0a8` | |
| `text-tertiary` | `#5f726a` | |
| `accent` | `#8fd4a0` | Sage — primary interactive |
| `accent-highlight` | `#cdfa50` | **Sparse** highlight (badges, live dot only) |
| `border` | `rgba(232, 240, 236, 0.08)` | |
| `border-strong` | `rgba(232, 240, 236, 0.14)` | |
| `success` | `#6dd4a0` | |
| `warning` | `#d4a574` | Warm counterbalance |

**Demo compatibility:** **Intentional departure** from demo lime dominance—use if stakeholders want “organic canteen” not “crypto terminal.” Keep `#cdfa50` only for admin live indicators to preserve demo recognition.

---

### Palette decision matrix

| Criterion | A | B | C | D | E |
|-----------|---|---|---|---|---|
| Matches admin demo literally | ★★★★★ | ★★☆☆☆ | ★★☆☆☆ | ★★★★☆ | ★★☆☆☆ |
| Matches landing today | ★★☆☆☆ | ★★★★★ | ★★★☆☆ | ★★☆☆☆ | ★★☆☆☆ |
| Lime as hero accent | ★★★★★ | ★★☆☆☆ | ★★☆☆☆ | ★★★★★ | ★☆☆☆☆ |
| Warm / painterly | ★★☆☆☆ | ★★★★☆ | ★★★★★ | ★★☆☆☆ | ★★★☆☆ |
| Avoids neon chaos | ★★★☆☆ | ★★★★★ | ★★★★★ | ★★★★☆ | ★★★★★ |

---

## Recommended combinations (shortlist)

If the goal is **one marketing + product story** with minimal demo drift:

| Type | Color | Rationale |
|------|-------|-----------|
| Pairing 1 or 3 | **A + Pairing 4** | Product-forward: geometric type + graphite lime matches admin. |
| Pairing 1 or 2 | **B + Pairing 1** | Keep current landing investment; soften lime to portal-only. |
| Pairing 2 | **C + Pairing 2** | Warm editorial rebrand; kitchen tomato/mustard harmonize. |
| Pairing 1 | **D + Pairing 1** | Magazine headline + strict neutral + disciplined lime. |

---

## Implementation notes (when a palette is selected)

1. **Token layers:** Map primitives (`gray-950`, `lime-500`) → semantics (`bg`, `surface`, `text-primary`, `accent`) so kitchen light mode and admin dark mode can share semantics with different primitives (per ColorArchive / Material dark-mode guidance).
2. **Lime discipline:** Use accent on ≤15% of visible UI (CTA, live status, selection, chart stroke). Body text stays bone/cool gray—never lime.
3. **Contrast check:** `#cdfa50` on `#0b0e14` passes large text; for 14px UI labels use `#0b0e14` on lime fills (demo already does this on brand mark).
4. **Cross-surface:** Kitchen cream app (light) can keep its own primitive ramp while sharing **display font** with marketing if Pairing 3 is chosen.

---

## Sources

| Source | URL | Used for |
|--------|-----|----------|
| ColorArchive — Dark mode system guide | https://colorarchive.org/guides/how-to-choose-colors-for-dark-mode/ | Surface steps, accent desaturation, text tiers |
| FontAlternatives — Editorial pairings | https://fontalternatives.com/blog/font-pairings-editorial-magazine-design/ | Serif + sans editorial patterns |
| markhall-patch — Instrument Serif pairing | https://markhall-patch.ca/blog/instrument-serif-font-pairing-for-elegant-but-usable-design/ | Instrument Serif + Manrope rationale |
| Fraunces + DM Sans (go-jobs theme commit) | https://github.com/justEstif/go-jobs/commit/cc7c8053bc4ccebf62daf759127bb803088bff3a | Warm editorial SaaS reference |
| Media.io — Lime on dark palettes | https://www.media.io/color-palette/lime-green-color-palette.html | Lime sparingly on charcoal |
| Tray repo — `landing-page.tsx`, `public/demo/admin.html`, `docs/design-system-figma.md` | (local) | Current hex and role mapping |

---

*Research date: May 2026. No code changes—selection drives a follow-up token pass in Figma and CSS.*
