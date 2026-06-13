# TRAY — Hackathon Video Production Package

Everything needed to cut a 2:00 cartoon-explainer + real-product-demo submission video
for **TRAY — "Shopify for campus canteens."** Solo creator credit: **Thribhuvan**.
Live product: **https://trayy.vercel.app** · 191 commits · 27 migrations · shipped.

> One-liner judges should remember:
> **"Tray — Shopify for campus canteens: 0% commission, no code, and the lunch line disappears."**

---

## The concept: "12:47"

A ticking-clock lunchtime countdown anchors a two-sided story — an anxious student and an
overwhelmed canteen owner — converging on TRAY as the invisible *coordination layer*.
Emotional spine: *"A samosa is not worth a debarred semester."* Tone: emotional + a little
witty + technically credible. The film is **color-coded by portal** (cream/black/red home →
red student → tomato kitchen → chartreuse admin → home).

---

## What's in this folder

| File | Owner | What it is |
|------|-------|-----------|
| `01-SCRIPT.md` | Screenwriter | Locked 2:00 narration (timecoded, ~282 words), 0:90 alt cut, VO recording sheet w/ pronunciation + TTS fallback |
| `captions.srt` | Screenwriter | Burned-in caption file, 27 cues, synced to the beat map |
| `02-STORYBOARD.md` | Art director | 10 scene-by-scene blocks: composition, camera, cartoon/recording call, color, screenshot refs |
| `03-GENERATION-PROMPTS.md` | Art director | Paste-ready AI prompts: style preamble, 4 character sheets, per-scene image+motion prompts, negatives, tool matrix |
| `04-MUSIC-AND-SOUND.md` | Composer | Score cue sheet, "TRAY theme" motif, SFX spotting list, -14 LUFS mix spec, royalty-free sources + Suno/Udio prompts |
| `05-EDIT-PLAN.md` | Editor | 17-clip cut sheet (verified 2:00 @ 24fps), transitions, grade, title/end cards, export + 9:16 reframe, QC checklist |
| `06-CINEMATOGRAPHY.md` | DP | The "look": color-by-portal, lens/move language, lighting, the energy-thread transition, how footage was shot |
| `footage/*.mp4` | DP | **Real screen recordings** of the working demo (see manifest below) |

Supporting stills live in `../.screenshots/` (landing hero, student mobile/desktop,
kitchen, admin, + bonus states: student OTP, kitchen Ready, admin orders table).

---

## Footage manifest (real, captured from the live demo pages)

| Clip | Length | Shows | Money moment |
|------|--------|-------|--------------|
| `footage/student-flow.mp4` | ~25s | canteen switch → add items → Place order → UPI pay → Placed→Preparing→Ready → OTP **1234** | OTP flip-in |
| `footage/kitchen-advance.mp4` | ~14s | live queue; tickets ride Incoming→Preparing→Ready; VERIFY OTP; push-to-live specials | a ticket crossing into Ready |
| `footage/admin-feed.mp4` | ~16s | KPI count-up; live activity feed + recent-orders table updating live | feed row "UPI payment captured" |

Re-generate anytime: `node scripts/shoot-demo.mjs` (stills) and `node scripts/record-demo.mjs` (video).

---

## Suggested assembly order (solo, ~14–16h in DaVinci Resolve free or CapCut)

1. **Lay the spine:** drop `captions.srt` / the VO onto the timeline first — picture cuts to voice.
2. **Generate cartoon plates** from `03-GENERATION-PROMPTS.md` (start with the 4 character sheets; reuse seeds for consistency). Scenes flagged "screen-recording" need no art.
3. **Place the footage** per `05-EDIT-PLAN.md` cut sheet; speed-ramp dead time, never fake a state.
4. **Score + SFX** from `04-MUSIC-AND-SOUND.md`; land the DROP on the 0:38 reveal, protect the two silences (0:36, 1:24).
5. **Grade + finish** per `06-CINEMATOGRAPHY.md` (per-portal color, crisp UI, grain on cartoons only).
6. **Titles/end card**: bold black + one red serif-italic word. End card string: `Tray · trayy.vercel.app · Thribhuvan · 191 commits · 27 migrations · live`.
7. **Export** 1920×1080 H.264, 24fps, -14 LUFS; run the QC checklist; do a muted-watch pass.

---

## Honesty guardrails (baked into every doc — keep them)

- **Real product only.** The demo footage is the actual app; never composite a fake state.
- **Unbuilt = roadmap.** AI demand forecasting, weather-tuned prep, inventory/auto-86,
  wallet, loyalty, subscriptions, Master Control Centre → at most a ≤2s "What's next" tag,
  never shown working.
- **Metrics are approximate.** "~12 minutes saved" and "~300ms" are targets/observed-in-
  testing — keep the "~" and the framing.
- **URL is `trayy.vercel.app`** (double-r) — confirmed against the creator's own writeup.

---

## Master production checklist

**Assets**
- [ ] Cartoon plates generated (characters + scene art) from `03-GENERATION-PROMPTS.md`
- [ ] Footage trimmed (3 MP4s in `footage/`)
- [ ] Stills prepped (`.screenshots/`)
- [ ] Logo / wordmark in cream + dark variants

**Audio**
- [ ] VO recorded (or TTS per `01-SCRIPT.md` fallback) — clean room, pop filter
- [ ] Score selected/generated; DROP at 0:38; resolve at 1:40
- [ ] SFX placed per spotting list; -14 LUFS, -1 dBTP

**Picture**
- [ ] Cut matches `05-EDIT-PLAN.md` timecodes; runtime ≤ limit (2:00)
- [ ] Energy-thread wipe at all portal boundaries
- [ ] Burned-in captions, synced, high-contrast
- [ ] Per-portal grade; UI crisp; titles + end card

**Final review**
- [ ] Muted watch: problem clear by 0:10, demo legible at small size
- [ ] Sound watch: no clipping, VO ducked under music
- [ ] Every claim true & defensible; no typos; URL correct
- [ ] Exported 16:9; optional 9:16 vertical cut for sharing
