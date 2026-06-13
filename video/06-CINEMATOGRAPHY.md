# TRAY — Cinematography & Screen-Recording Direction (DP notes)

Companion to `02-STORYBOARD.md` (composition per scene) and `05-EDIT-PLAN.md` (cut/grade).
This file is the "look" bible: how the camera moves, how light behaves, and how the
real product is shot so it cuts seamlessly against the cartoon.

---

## 1. The one big idea: color = which portal you're in

The product already ships a per-portal color system. We don't invent a look — we
*photograph the one that exists*. The film is a chord progression of brand colors:

| Act | Portal | Base | Accent | Mood / light |
|-----|--------|------|--------|--------------|
| Cold open / problem | — | warm dark `#0e0a06` | persimmon `#ef6a3a` | candle-lit, anxious, one warm key from screen-right |
| Reveal / home | brand | cream `#E9E2D0` | black + red | sunrise; flat, clean, confident |
| Demo 1 | Student | cream `#F4EFE6` | red `#e60000` | warm, human, hand-held energy |
| Demo 2 | Kitchen | cream `#f4e6c1` | tomato `#d52821` | hotter, faster, more saturated |
| Demo 3 | Admin | graphite dark | chartreuse `#cdfa50` / lime `#8fb305` | cool, precise, "command center" |
| Impact / close | brand | cream `#E9E2D0` | black + red | warm resolve; bookends the reveal |

Every cut across a portal boundary rides the **energy thread** (persimmon in human
scenes, chartreuse in data scenes) — see §4.

---

## 2. Lens & camera language

**Animation beats** — treat as a 2D stage with shallow parallax:
- Default: locked or 2–4% slow push-in. Stillness makes the motion graphics read.
- Shallow depth: 2–3 parallax layers max; foreground subject sharp, background soft.
- The thread is the *only* element allowed to cross between portals.

**Screen-recording beats** — treat the UI like a set, never a static screenshot:
- Always moving: 3–5% slow push-in toward the element that just changed (cart total,
  ticket state, feed row). Think "Ken Burns, but disciplined."
- Rack-focus feel: a quick 0.2s blur→sharp on the element that updates, so the eye is
  led to it without a hard cut.
- Mobile (student) sits in a **device frame**, floating on the act's base color.
- Kitchen/admin sit in a **floating-glass** frame (subtle shadow, 8–12px radius) so the
  dark admin UI doesn't fight the cream surrounds.

**Forbidden:** static full-screen screenshots, fast whip-zooms on UI, more than one
camera move per shot.

---

## 3. Lighting & texture

- Cold open: single warm key from screen-right at ~30°, deep falloff. Echoes the home
  page's radial glow so the **reveal feels like a sunrise** breaking the tension.
- Brand/cream acts: flat, even, high-key. No vignette. Cleanliness reads as "premium."
- Admin act: cool ambient + one chartreuse rim on the KPI numbers as they count up.
- Grain: a *whisper* of grain (2–4%) on cartoon plates only. **Keep UI recordings crisp
  — zero grain, zero added blur** except the intentional rack-focus.

---

## 4. The signature transition — the "energy thread"

One continuous line carries a single order across the three portals, selling the
~300ms realtime claim *visually* instead of narrating it:

1. Student taps **Place order** → a thread of light leaves the phone.
2. The thread becomes the **kitchen ticket** sliding into the Incoming column.
3. The thread becomes the **admin live-feed row** ("UPI payment captured").

Same object, three portals, one breath. Place it at exactly the four portal
boundaries the editor marked. Color: persimmon entering human scenes, chartreuse
entering data scenes; cross-fade the thread's hue *on* the cut.

---

## 5. How the real footage was shot (so you can re-shoot/extend)

Captured headless with Chromium + Playwright against the real static demo pages in
`public/demo/`. Script: `scripts/record-demo.mjs` (run with the static server it spins
up on :5066). Recorded WebM → transcoded to H.264 MP4 (`scripts/` notes the ffmpeg).

| File | Viewport | What it shows | Best use |
|------|----------|---------------|----------|
| `footage/student-flow.mp4` (~25s) | 1240×840 | switch canteen → add items (fly-to-cart) → Place order → UPI pay → Placed→Preparing→Ready → **OTP 1234** flip-in | Demo 1; trim to the add→pay→OTP arc (~12s) |
| `footage/kitchen-advance.mp4` (~14s) | 1600×900 | tickets advancing Incoming→Preparing→Ready, counts updating, VERIFY OTP buttons | Demo 2; grab one ticket's journey (~6s) |
| `footage/admin-feed.mp4` (~16s) | 1600×900 | KPI count-up, scroll to live activity feed + recent-orders table updating live | Demo 3; hold on the feed ticking (~8s) |

**Shooting notes for the cut:** all three are slightly longer than needed on purpose —
pick the cleanest sub-window and **speed-ramp** dead time (e.g. the payment wait), never
fake a state. The student clip's money moment is the OTP flip-in; the kitchen clip's is
a ticket crossing into Ready; the admin clip's is the feed row appearing.

---

## 6. Title & end-card photography

Mirror the real home headline's move: a **heavy black condensed line** with **one red
serif-italic accent word** (the product does this with *"colleges."*). Titles animate in
on a 200ms ease, accent word lands 80ms late. End card holds 6–8s on cream; last frame is
the headline so the line is the final thing on screen.
