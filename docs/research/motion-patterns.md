# Premium B2B/SaaS landing motion patterns (2025–2026)

Research digest for **dark, high-trust product marketing sites** — patterns seen on Awwwards honorees (e.g. Inkwell, Uneevo, StratusGrid), Godly’s scrolling-animation gallery, and GSAP-first studio work (Lusion, Chronicle, Stripe Sessions). Focus: **scroll choreography and micro-interactions that feel editorial, not template-y**.

**Research value: high** — Strong convergence across award write-ups, curated galleries, and GSAP’s official performance/a11y guidance; several patterns map directly to Tray’s existing `landing-motion.tsx` sections.

---

## Principles (what “best-in-class” means here)

| Do | Avoid |
|----|--------|
| **One hero idea** per viewport (pin *or* sequence *or* split text — not all three stacked) | Scrolljacking, fake smooth-scroll that fights native wheel |
| **Transform + opacity** for scroll-linked motion | Animating `width`, `top`, `margin`, `filter` on large sections |
| **Narrative pacing** — each section = one beat (Awwwards Inkwell: “each scroll section = a scene”) | Identical fade-up on every block (reads as AI slop) |
| **Restrained palette motion** — ambient gradients, 2px progress, soft parallax | Full-screen WebGL unless the product *is* the 3D demo |
| **`prefers-reduced-motion`** branch with instant final states | Motion-only information (progress, active section) with no static fallback |

---

## Catalog: 10 motion patterns

### 1. Scroll-scrubbed image / canvas sequence

| | |
|--|--|
| **When to use** | Product UI walkthrough, “how it works” without video weight; one memorable hero or mid-page beat. |
| **Technique** | Preload WebP frame stack → draw current frame to `<canvas>`; GSAP `imageSequence` / `imageSequenceScrub` helper tied to `ScrollTrigger` with `scrub: true` (+ optional `pin`). Apple-style pages popularized this; award sites compress with **KTX2** for WebGL paths. |
| **Reduced motion** | Show **first + last frame** (or a static poster image); skip pin/scrub. No autoplay video substitute unless user opts in. |

### 2. Pinned horizontal “feature filmstrip”

| | |
|--|--|
| **When to use** | 4–7 feature cards, case-study slides, or portal previews where vertical scroll would be endless. |
| **Technique** | `ScrollTrigger.pin()` parent; tween inner track `xPercent` / `x` with `scrub: true`. Nested captions: `containerAnimation` so child triggers use the horizontal scroller as timeline. Common on Godly-featured agency/SaaS sites. |
| **Reduced motion** | Unpin; stack cards vertically with normal document flow; optional simple opacity fade between cards (no horizontal scrub). |

### 3. Asymmetric sticky split narrative

| | |
|--|--|
| **When to use** | Problem → agitation → proof blocks; “why us” with 3–5 supporting cards. |
| **Technique** | CSS `position: sticky` on left column (headline + thesis); right column scrolls cards. Enhance with light GSAP on each card enter (`y`, `opacity`). Seen in premium Pagesmith/Hub-style templates and Vanguard-style capability sections. |
| **Reduced motion** | Sticky still OK; disable card entrance motion. Keep copy order identical. |

### 4. Batched viewport reveal (staggered enter)

| | |
|--|--|
| **When to use** | Feature grids, logo walls, stat rows, diagram nodes — many siblings entering once. |
| **Technique** | Prefer **`ScrollTrigger.batch()`** over N separate triggers: one callback per batch, stagger children `y: 24–40`, `opacity: 0→1`, `duration: 0.5–0.8`, `ease: "power2.out"`. Tray already uses per-section triggers; batching reduces scroll listener overhead on long pages. |
| **Reduced motion** | `opacity: 1`, `y: 0` immediately; no stagger delay. |

### 5. Split / line typography reveal

| | |
|--|--|
| **When to use** | Hero headline, section titles, closing CTA line — **one or two lines max** per section. |
| **Technique** | GSAP **SplitText** (words/lines) + short timeline on load or `ScrollTrigger` once; or CSS `clip-path` / `mask-image` + `view()` timeline for simple fades (check browser support). Keep blur subtle (≤8px); heavy blur-on-scroll ages quickly. |
| **Reduced motion** | Full string visible; if SplitText used, rely on SplitText `aria-label` + `aria-hidden` children (GSAP 3.13+) or screenreader-only duplicate for linked text. |

### 6. Blur-to-sharp “focus pull” (quote / stat callout)

| | |
|--|--|
| **When to use** | Pull quotes, single KPI, testimonial — **one focal element** per band (Tray `.tl-pull` pattern). |
| **Technique** | `filter: blur()` is paint-heavy — prefer **two layers**: blurred duplicate + sharp layer with `opacity` crossfade, or animate `scale(0.98→1)` + opacity only. If blur required, limit to one element and short distance in view. |
| **Reduced motion** | Sharp text only; no blur tween. |

### 7. Ambient parallax (orbs / gradient mesh scrub)

| | |
|--|--|
| **When to use** | Dark backgrounds; section identity via soft color (Tray section glows). |
| **Technique** | Absolutely positioned radials; `ScrollTrigger` scrubs `y` or `opacity` **on pseudo-elements** with `transform` only. Inkwell-style sites use atmospheric gradients + restrained WebGL; CSS-only is enough for most B2B. |
| **Reduced motion** | Static gradients; no scrub. |

### 8. Scroll progress + section spy (functional motion)

| | |
|--|--|
| **When to use** | Long single-page landings; orient user without hamburger chapter nav. |
| **Technique** | Top bar: `scaleX` on transform from scroll progress (`ScrollTrigger` on `body` or dedicated trigger). Nav: toggle `.active` on sections via `ScrollTrigger` `onEnter` / `onEnterBack` with `toggleActions` or batch. **Functional** — simplify but don’t remove under reduced motion. |
| **Reduced motion** | Keep progress bar and active nav state; remove scrub animation on bar if it feels decorative. |

### 9. Hover micro-interactions (magnetic CTA, 3D tilt, glow)

| | |
|--|--|
| **When to use** | Primary/ghost buttons, portal cards, stack tiles — **few targets**, not entire page. |
| **Technique** | Magnetic: track pointer vs element center, `gsap.to` `x/y` with `ease: "power3.out"`, max displacement **20–30px**, disable on `(hover: none)` / touch. Card tilt: `rotateX/Y` from pointer position with `transformPerspective`. Chronicle/Lusion-style sites pair with custom cursor sparingly. |
| **Reduced motion** | Standard `:hover` color/border only; no magnetic follow or tilt. |

### 10. Infinite marquee / ticker (CSS-first)

| | |
|--|--|
| **When to use** | Social proof, integration logos, “trusted by” — low narrative weight. |
| **Technique** | **`@keyframes` + `transform: translateX`** on duplicated track; `animation-play-state: paused` on `:hover` for accessibility. Avoid GSAP for infinite loops unless you need scroll-sync. Tray `.tl-ticker` pattern is appropriate. |
| **Reduced motion** | `animation: none`; show static wrapped grid or single row without motion. |

---

## Recommendations by landing section type

### Hero

- **Primary:** Load timeline — split headline stagger (pattern 5) + stat **count-up** (short, `snap` or rounded integers; not slot-machine odometers).
- **Secondary:** Soft orb parallax (pattern 7); optional **one** canvas sequence only if you have a real product frame export (pattern 1).
- **Micro:** Magnetic primary CTA only (pattern 9).
- **Avoid:** Pinning the entire hero for >1 viewport; rotating 3D logos; simultaneous video + scrub + particles.

### Feature grid (e.g. portals, stack, capabilities)

- **Primary:** `ScrollTrigger.batch()` on cards — alternate `x` ±24px + `opacity` (pattern 4); optional subtle `rotateX` (4–8deg) for “rising shelf” effect (Tray `#system` / `#stack` direction).
- **Secondary:** Per-card hover tilt on desktop (pattern 9).
- **Avoid:** Different easing per card; random delays >0.15s between siblings.

### Stats / metrics band

- **Primary:** Count-up when band crosses ~70% viewport; use `once: true`.
- **Secondary:** Stagger stat labels after numbers settle.
- **Avoid:** Animating the container’s height; use tabular nums (`font-variant-numeric: tabular-nums`).

### Timeline / flow (steps, process, “how it works”)

- **Primary:** Vertical step stagger (pattern 4) with **large static numerals** rotating in (`rotate` 8–15deg → 0) — Tray `#flow` pattern.
- **Optional:** Pinned horizontal strip (pattern 2) if >5 steps and each step is visual-heavy.
- **Avoid:** Horizontal scroll on mobile; collapse to vertical with no pin.

### Narrative / sync diagram (nodes, architecture)

- **Primary:** Nodes enter from alternating sides (pattern 4); diagram container `scale: 0.96→1` once.
- **Secondary:** Line-draw SVG between nodes — use **stroke-dashoffset** on a single path (transform-friendly) rather than animating `stroke-width` on many edges.
- **Avoid:** Physics simulators for static architecture diagrams.

### CTA / closing

- **Primary:** Short cascade — headline `y` + opacity, then buttons 80ms apart (pattern 4 without batch).
- **Secondary:** Warm accent pulse on primary button border (CSS `@keyframes`, not layout).
- **Avoid:** Re-playing full hero animation; user has already scrolled — respect fatigue.

### Footer

- **Motion budget: near zero.** Link opacity on hover; optional fade-in of legal line if the closing CTA is pinned above.
- Marquee belongs **above** footer, not in it.

### Tray landing map (existing sections)

| Section | Suggested pattern emphasis |
|---------|---------------------------|
| Hero | 5 + count-up + 7 (light) |
| `#system` | 4 + 9 on portal cards |
| `#sync` | 4 on nodes + diagram scale |
| `#where` | 4 with `back.out(1.4)` spring (keep — reads playful, not generic) |
| `.tl-pull` | 6 (prefer opacity/scale over blur) |
| `#flow` | 4 + numeral rotate |
| `#stack` | 4 from center stagger |
| `.tl-closing` | 4 cascade + 9 on CTA |
| Global | 8 + 7 orbs |

---

## Performance notes

### Compositor rules

- Animate only **`transform`** and **`opacity`** for scroll-linked work. Use `translateX/Y`, `scale`, `rotate` — not `top`/`left`/`width`.
- **`filter: blur()`** and **`box-shadow`** animations trigger paint; cap blur motion or fake with layered opacity.
- Consistent frame timing beats peak FPS — a steady 30fps compositor animation beats layout-thrashing “60fps”.

### `will-change`

- Apply **`will-change: transform`** only to elements about to animate; remove after complete.
- Never blanket `will-change` in base CSS or on dozens of cards (GPU memory).
- Do not use `translateZ(0)` everywhere — prefer targeted `will-change` or let the browser promote layers.

### ScrollTrigger hygiene

```js
// Production defaults worth setting once
ScrollTrigger.config({
  limitCallbacks: true,
  ignoreMobileResize: true,
});

// Prefer batch for grids
ScrollTrigger.batch(".tl-reveal", {
  start: "top 85%",
  onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.08, overwrite: true }),
});

// Refresh after fonts/images/layout shifts
ScrollTrigger.refresh();
```

- **Batch** similar enters instead of 20+ independent `ScrollTrigger.create` calls on one page.
- **`limitCallbacks: true`** — reduces work when many triggers overlap.
- **`ignoreMobileResize: true`** — avoids refresh storms from mobile URL bar resize.
- **Lazy-create** triggers for below-fold sections with `IntersectionObserver` if initial load janks (optional; measure first).
- **Disable `markers`** in production.
- After images/fonts load: `requestAnimationFrame(() => ScrollTrigger.refresh())` + short delayed second refresh (Tray already does this).

### Pinning & scrubbing

- Each **pin** reserves scroll distance — budget total pinned height; mobile often should **disable pin** and use simple reveals.
- `scrub: true` ties to scroll — keep tweens **`ease: "none"`** on scrubbed properties.
- Image sequences: **WebP** frames, preload, `devicePixelRatio` on canvas; consider static fallback on slow connections.

### CSS scroll-driven animations (progressive enhancement)

- `animation-timeline: view()` / `scroll()` can handle **simple fades and progress bars** with zero JS — good for marquee-adjacent progress (pattern 8). Verify target browsers; keep GSAP path for complex sequences.
- Pair with `@media (prefers-reduced-motion: reduce)` to set `animation: none` and final keyframe states.

### Accessibility

- Use **`gsap.matchMedia()`** with `(prefers-reduced-motion: reduce)` and `(prefers-reduced-motion: no-preference)` — revert animations when query changes (GSAP official a11y guide).
- Optional **in-app “Reduce motion”** toggle combined with system preference via matchMedia conditions.
- Split text: use SplitText **aria** defaults or screenreader-only duplicate when links live inside headlines.
- Marquee: pause on hover/focus; provide static layout under reduced motion.

### Mobile

- Drop magnetic cursor, 3D tilt, and heavy pin/scrub.
- Prefer shorter staggers and `once: true` triggers.
- Test on mid-tier Android — batching + transform-only usually matters more than easing polish.

---

## Anti-patterns (reads as generic / AI slop)

- Same **fade-up + 20px** on every `section` with identical duration.
- **Smooth-scroll hijacking** (Lenis etc.) on marketing pages without a clear UX reason — hurts native scroll and accessibility.
- **Floating blobs** + **glassmorphism** + **gradient text** + **parallax** on every block.
- **Scroll-triggered blur** on entire paragraphs.
- **Fake 3D** device mocks with no real product pixels.
- More than **two pinned regions** on one page.

---

## Sources

| Source | URL | Notes |
|--------|-----|--------|
| GSAP — Accessible animation | https://www.gsap.com/resources/a11y | `gsap.matchMedia()`, reduce vs remove, SplitText aria |
| GSAP — `imageSequence` helper | https://gsap.com/docs/v3/HelperFunctions/helpers/imageSequenceScrub | Canvas scrub + ScrollTrigger |
| GSAP — ScrollTrigger docs | https://gsap.com/docs/v3/Plugins/ScrollTrigger/ | Pin, scrub, batch, config |
| Awwwards — Inkwell case study | https://www.awwwards.com/inkwell-a-scroll-driven-narrative-for-ais-most-stealth-player.html | Cinematic scroll narrative, B2B stealth SaaS, KTX2/WebGL |
| Awwwards — On-scroll inspiration | https://www.awwwards.com/inspiration/on-scroll-animations-state-of-ai-2025-1 | 2025 scroll animation gallery |
| Godly — Scrolling animation filter | https://godly.website/?animation=%5B%22scrolling-animation%22%5D | Curated sites; GSAP-heavy stack signal |
| SiteGrade — Animation performance | https://sitegrade.io/en/quick-answers/how-to-optimize-web-animations-performance/ | Transform/opacity, will-change, FLIP |
| Web Perf Clinic — Scroll-driven CSS (2026) | https://webperfclinic.com/article/css-scroll-driven-animations-performance-guide | `view()` / compositor thread, INP |
| CSS-Tricks — Apple image sequence | https://css-tricks.com/lets-make-one-of-those-fancy-scrolling-animations-used-on-apple-product-pages/ | Frame stack + canvas pattern |
| Envato Tuts+ — Horizontal ScrollTrigger | https://webdesign.tutsplus.com/create-horizontal-scroll-animations-with-gsap-scrolltrigger--cms-108881t | Pinned horizontal sections |

---

*Generated for Tray landing motion work (`landing-motion.tsx`, `docs/design-system-figma.md`). Re-validate browser support for CSS scroll-driven features before replacing GSAP on simple reveals.*

---

## Framer-inspired pass (2026-05-20)

Implemented in `landing-motion.tsx` + scoped CSS hooks in `landing-page.tsx` (no `framer-motion` on `/`).

| Interaction | Technique |
|-------------|-----------|
| Hero word/CTA reveal | `expo.out` timeline; CTA `scale: 0.92→1`; count-up `expo.out` |
| Nav scroll | `is-scrolled` + `is-scrolled-deep` (stronger blur/backdrop) |
| Nav section spy | Sliding `.tl-nav-pill` via GSAP `x`/`width` (fine pointer) |
| Portal cards | `quickTo` lift + `.is-shine` sweep + `.is-lift` glow; kitchen rim `#ef5749` |
| Sync diagram | Sequential node + line `scaleX` + dot pulse timeline on enter |
| Pull quote | `opacity` + `y` (+ light `scale` desktop only; no blur) |
| Closing CTA | Magnetic `.tl-btn-pri` max **8px** offset (fine pointer) |
| Ambient | Mouse parallax on `.tl-ambient-shift`; orb scroll scrub unchanged |
| Guards | `prefers-reduced-motion` early exit; coarse: no tilt/magnet/scrub; CSS `:active` scale |
