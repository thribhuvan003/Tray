# Motion code sources — copy-paste scroll & micro-interactions

Research for Tray’s marketing landing (Next.js 15, React 19, **Pre-Monsoon Dusk** dark editorial SaaS). Tray already ships `framer-motion` ^11 and `gsap` ^3 with **ScrollTrigger-only** choreography in `src/components/landing/landing-motion.tsx` (no ScrollSmoother / Club plugins).

**Research value: high** — Several mature ecosystems ship full React/TS source with scroll and hover patterns; Tray can mix Motion-style declarative effects with existing GSAP section logic.

---

## Top 8 sources (ranked for Tray)

| Rank | Source | URL | License / concern | React / Next? | Scroll | Hover / micro | Copy-paste quality |
|------|--------|-----|-------------------|---------------|--------|---------------|-------------------|
| 1 | **Motion (docs + examples)** | https://motion.dev/docs/react · https://examples.motion.dev/react | MIT (`motion` / legacy `framer-motion`). **Motion+** paywalls ~370 premium examples + MCP; free tier still large. | **Yes** — App Router needs `"use client"`. Tray’s `framer-motion` import path still works; new work can use `motion/react`. | **Strong** — `useScroll`, `whileInView`, scroll-linked progress, parallax examples. | **Strong** — `whileHover` / `whileTap`, layout, gestures. | **Excellent** on free examples (live preview + source). Premium examples need Motion+ login. |
| 2 | **GSAP — React guides + CodePen** | https://gsap.com/resources/react-basics · https://gsap.com/docs/v3/React · https://codepen.io/GreenSock | **GSAP standard license** (free for most sites; check [gsap.com/licensing](https://gsap.com/licensing) if Tray is a paid SaaS at scale). **ScrollSmoother / SplitText** were Club plugins; ScrollSmoother is now marketed as free on Codrops (2025+) — still a separate plugin, not in Tray today. | **Yes** via `@gsap/react` `useGSAP()` + dynamic import (matches `landing-motion.tsx`). | **Best-in-class** for scrub, pin, timelines — already used in-repo. | Moderate (mostly scroll; hover via quickTo / small tweens). | **Excellent** on official CodePens (full HTML/CSS/JS). **Showcase** ([gsap.com/showcase](https://gsap.com/showcase/)) is inspiration only, not code. |
| 3 | **React Bits** | https://reactbits.dev · https://github.com/DavidHDev/react-bits | **MIT + Commons Clause** — OK in apps; **do not resell** the component library itself. | **Yes** — TS/JS, Tailwind or CSS, shadcn/jsrepo CLI. | **Good** — text scroll/reveal, parallax-style backgrounds; many are enter-viewport, not scroll-scrub. | **Good** — buttons, cards, cursors; site warns **≤2–3 animated components per page**. | **Excellent** — full source in UI + `npx jsrepo add …`. |
| 4 | **Magic UI** | https://magicui.design · https://github.com/magicuidesign/magicui | **MIT** | **Yes** — shadcn CLI (`npx shadcn@latest add @magicui/...`), Next 15 + Tailwind v4 friendly. | Light — mostly CSS/`motion-safe` keyframes; not scroll-scrub heavy. | **Strong** — shine, borders, beams, text effects for dark UI. | **Excellent** — docs paste full TSX + CSS tokens. |
| 5 | **Aceternity UI** | https://ui.aceternity.com/components | Free components + CLI; **premium blocks/templates** are commercial. Free npm path described as MIT; **Pro** has separate licence — don’t mix Pro assets into OSS repo without purchase. | **Yes** — Framer Motion + Tailwind; Next 15 called out on Pro marketing. | **Good** — parallax, scroll-based hero blocks in **Blocks** (some Pro). | **Strong** — spotlight, text reveal, magnetic interactions. | **Very good** for free components (Preview + Code + shadcn add). Blocks often **heavier** than Tray needs. |
| 6 | **Codrops** | https://tympanus.net/codrops/tag/scroll/ | Tutorial + demo code; **attribution appreciated**. Many demos use **GSAP plugins** (ScrollSmoother, SplitText) — verify plugin tier before porting. | **Partial** — vanilla/TS classes; port to `useGSAP` + React refs. | **Excellent** — editorial scroll labs (elastic grids, 3D text, carousels). | Varies | **Excellent** article excerpts; full repos linked from posts. Higher integration cost than copy-paste React libs. |
| 7 | **Hover.dev** | https://www.hover.dev/components | Paid product for full library; **free tier** on some components. Check terms before shipping in production. | **Yes** — React + Tailwind + Motion/Framer toggle in code panel. | Sections (heroes, features) more than low-level scroll APIs. | **Strong** — buttons, nav, toggles. | **Very good** — explicit “VIEW CODE” per component; good for **marketing sections**, not GSAP-level scroll systems. |
| 8 | **Lenis** | https://lenis.darkroom.engineering · https://github.com/darkroomengineering/lenis | **MIT** | **Yes** — `lenis/react` (`ReactLenis`, `useLenis`). Pairs with GSAP via `ScrollTrigger.update` + `gsap.ticker`. | **Foundation** — smooth scroll / inertia, not section choreography by itself. | N/A | **Excellent** README patterns; demos are integration-focused. **Not in Tray deps** — add only if replacing native `scroll-behavior: smooth` in `landing-motion.tsx`. |

### Honorable mentions (not top 8)

| Source | Why lower for Tray |
|--------|-------------------|
| **21st.dev** | https://21st.dev/s/animated — Registry aggregator (shadcn-style); quality varies, harder to audit licence per component. |
| **Framer (templates)** | https://www.framer.com/marketplace/ — Visual templates; **React export** is inconsistent vs hand-maintained Motion/GSAP code. |
| **ui.dev** | https://ui.dev — Tyler McGinnis **courses** (Router, hooks); not a copy-paste motion component library. |
| **GSAP Showcase gallery** | Inspiration reels only — no copy-paste source. |

---

## GSAP plugin caution (Tray-specific)

Tray should **stay on ScrollTrigger + core tweens** unless there is a clear win:

| Plugin | Typical Codrops / showcase use | Tray note |
|--------|----------------------------------|-----------|
| ScrollSmoother | Whole-page smooth scroll + lag | Replaces Lenis + complicates React hydration; heavy for a single landing. |
| SplitText | Character/word scroll reveals | Club/historically paid; extra DOM splits — prefer Motion text or CSS. |
| Flip | Layout morphing | Powerful but imperative; rare on editorial landings. |
| Observer | Scroll hijacking | Conflicts with accessibility expectations. |

**Worth it:** ScrollTrigger scrub on `.tl-*` sections (already in `landing-motion.tsx`), optional **Lenis** if scroll feels janky on Safari.

---

## Five patterns to steal (editorial dark SaaS)

| Pattern | Source link | Why it fits Tray |
|---------|-------------|------------------|
| **Scroll-linked progress + section fade** | https://motion.dev/examples/react-scroll-triggered · https://motion.dev/docs/react-use-scroll | Matches existing `.tl-scroll-progress` and section rhythm; can **complement** GSAP with declarative `scrollYProgress` on the bar while GSAP handles section staggers. |
| **Blur / stagger hero text (viewport enter)** | https://reactbits.dev/text-animations/blur-text | Editorial headline motion without SplitText; tune blur + stagger to **ink/primary** `#ece8e0` on `#0a0f1a`. Keep one text effect on hero only (React Bits perf guidance). |
| **Shine border on portal / pricing cards** | https://magicui.design/docs/components/shine-border | Subtle **warm/cool** rim (`#d4b896`, `#8eb8ff`) on dark elevated surfaces — reads premium, CSS-heavy (no extra GSAP plugins). |
| **Spotlight following pointer (hero)** | https://ui.aceternity.com/components/spotlight | Low-cost **ambient** interaction on hero band; restrict to desktop, disable under `prefers-reduced-motion` (align with `landing-motion.tsx`). |
| **ScrollTrigger-scrubbed section reveal (pinned stats / flow)** | https://gsap.com/resources/react-basics · https://codepen.io/GreenSock/pen/zYeZmVw | Same stack as current landing; extend existing `ScrollTrigger.create` patterns without ScrollSmoother — good for **system / sync / flow** bands. |

---

## Practical workflow for Tray

1. **Scroll choreography** — Start from in-repo `landing-motion.tsx` + GSAP React guide; use Motion examples only for isolated pieces (progress, `whileInView` fallbacks).
2. **Micro-interactions** — Magic UI / Aceternity / React Bits for one-off components; paste into `src/components/landing/` and scope styles under `.tray-landing`.
3. **Always** — `prefers-reduced-motion`, cap concurrent effects (React Bits: 2–3/page), run `landing-verify.mjs` / Playwright after motion changes.
4. **Licence** — Keep MIT/Commons-clause notices in file headers when pasting third-party components; do not import Aceternity Pro or Hover paid-only snippets into the OSS repo.

---

## Sources consulted

| URL | Use |
|-----|-----|
| https://motion.dev/docs/react | Motion vs CSS, scroll/hover APIs, install |
| https://examples.motion.dev/react | Example catalogue (scroll-linked, triggered) |
| https://gsap.com/resources/react-basics | `useGSAP`, ScrollTrigger in React |
| https://magicui.design/docs/components/shine-border | Full paste-ready component |
| https://ui.aceternity.com/components | Free component code + CLI |
| https://reactbits.dev/get-started/introduction | Licence, perf, modular install |
| https://tympanus.net/codrops/2025/06/03/elastic-grid-scroll-creating-lag-based-layout-animations-with-gsap-scrollsmoother/ | ScrollSmoother lag pattern (port cautiously) |
| https://www.hover.dev/ | Copy-paste React motion components |

*Generated 2026-05-20 for parallel landing/motion work. Read-only research — no dependency changes.*
