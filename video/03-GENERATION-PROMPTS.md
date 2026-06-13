# TRAY — 03 GENERATION PROMPTS

Tool-agnostic, ready-to-paste prompts for the "12:47 — Shopify for campus canteens" film.
Pairs with `02-STORYBOARD.md`. **Real product UI = screen recordings, never generated.**

> Workflow: prepend the **STYLE PREAMBLE** to every image prompt, append the **shared NEGATIVE** prompt, and reuse character **reference images + seeds** for consistency. Generate characters first (turnarounds), then scenes that reference them.

---

## (A) STYLE PREAMBLE — prepend to EVERY image prompt

```
Premium flat 2D vector explainer illustration, "fintech-clean Kurzgesagt" style.
Limited-frame animation aesthetic, clean geometric shapes, consistent medium line weights,
smooth soft gradients, subtle grain, shallow depth with gentle parallax layering.
Warm, human Indian college-campus characters (not caricatures), friendly proportions.
16:9 widescreen composition, generous negative space, editorial layout, crisp vector edges.
Color palette (use exact hexes): brand cream #E9E2D0, black #0e0a06, brand red #e60000,
persimmon #ef6a3a, student red #e60000, kitchen tomato #d52821,
admin chartreuse #cdfa50, lime #8fb305.
Lighting: flat ambient with one soft directional glow, gentle rim light, no harsh shadows.
Typography when shown: heavy condensed grotesque display + a single red serif-italic accent word.
High production value, brand-consistent, designed-for-motion.
```

### Per-section palette override (swap into the preamble per scene)
- Cold open / problem: background `#0e0a06`, accent `#ef6a3a`.
- Home / reveal / impact / close: background `#E9E2D0`, ink black, accent red `#e60000`.
- Student demo framing: accent `#e60000`.
- Kitchen demo framing: accent `#d52821`.
- Admin demo framing: accent `#cdfa50` / `#8fb305`.

---

## (B) CHARACTER SHEETS

> For each, generate a **turnaround sheet** (front, 3/4, side) on a neutral cream background first; lock the seed; reuse as a reference image (`--cref` in Midjourney, "reference image" upload in Runway/Kling/Sora/Higgsfield) in every scene.

### B1 — STUDENT PROTAGONIST ("Aanya/Arjun" — pick one, keep consistent)
```
[STYLE PREAMBLE]
Character turnaround sheet of a warm, relatable Indian college student, early 20s,
casual modern campus outfit (hoodie or kurta-tee, backpack, wristwatch, smartphone in hand),
expressive friendly face, natural proportions, NOT a caricature.
Two expressions: (1) anxious/time-pressured glancing at watch, (2) calm/relieved.
Front, three-quarter, and side views on neutral cream #E9E2D0 background.
Flat 2D vector, consistent line weight, accent color student red #e60000.
```
Consistency tips: lock seed; keep hoodie color + backpack as fixed signature props; reuse turnaround as reference for Scenes 1, 2, 5, 9.

### B2 — CANTEEN OWNER (warm "anna/aunty" persona)
```
[STYLE PREAMBLE]
Character turnaround sheet of a warm, hardworking Indian campus canteen owner,
40s–50s, friendly "anna/aunty" energy, apron over simple shirt/saree, kind tired eyes,
welcoming smile, natural human proportions, dignified — NOT a caricature.
Two states: (1) overwhelmed, surrounded by cash and paper chits, (2) relieved and calm.
Front, three-quarter, and side views on neutral cream #E9E2D0 background.
Flat 2D vector, consistent line weight, accent kitchen tomato #d52821.
```
Consistency tips: lock seed; fixed apron color; reuse for Scenes 3, 7, 8, 9.

### B3 — COMMISSION GOBLIN (greedy, comedic — NOT an ethnic/religious caricature)
```
[STYLE PREAMBLE]
Character turnaround sheet of a small comedic fantasy goblin representing greedy
delivery-app commissions. Mischievous grin, grabby clawed hands, coin-shaped pot belly,
tiny pointed hat made of receipt paper, color a sickly muddy green-grey with persimmon accents.
Clearly a fantasy/abstract gremlin creature — explicitly NOT human, NOT representing any
real-world ethnicity, religion, or culture. Playful villain, comedic not scary.
Expressions: (1) gleeful biting a coin, (2) recoiling/shattering in defeat.
Front and three-quarter views on neutral background.
Flat 2D vector, consistent line weight.
```
Consistency tips: lock seed; keep the receipt-paper hat + coin-belly as signature; reuse for Scenes 3 and 8. Keep it abstract and creature-like.

### B4 — CLOCK MOTIF ("12:47")
```
[STYLE PREAMBLE]
Iconic clock motif reading exactly 12:47, hybrid analog face with large monospaced
digital numerals (Geist Mono / JetBrains Mono feel), persimmon #ef6a3a glow on warm
dark #0e0a06. Clean vector, single hero object, designed to tick and animate.
Also produce a "calm" variant on cream #E9E2D0 with black numerals for the impact/close.
```
Consistency tips: lock the numeral style; reuse as a recurring anchor (Scenes 1, 2, 9).

---

## (C) PER-SCENE PROMPTS

> Scenes 4, 5, 6, 7 are **SCREEN-RECORDINGS** of the real product (landing-hero / student-mobile / student-wide / kitchen / admin). Generated art is only the **frame/device/vault/thread** around the recording — no fake UI inside.

---

### SCENE 1 — HOOK "12:47" · CARTOON
**Image prompt**
```
[STYLE PREAMBLE — cold-open palette: bg #0e0a06, accent #ef6a3a]
Wide shot: a giant 12:47 clock motif glowing persimmon, foreground a crowded Indian
college canteen counter — seven students stacked deep in a chaotic line, raised hands,
paper chits flying, overlapping speech bubbles. The anxious student protagonist (use ref B1)
mid-queue glancing at wristwatch. Shallow parallax, limited-frame look, 16:9.
```
**Video / motion prompt** (Runway / Kling / Sora / Higgsfield)
```
Slow push-in on the 12:47 clock, then smooth dolly-back to reveal canteen chaos.
Clock second-hand ticks; paper chits flutter on a loop; speech bubbles pop in staccato.
Shallow parallax between layers. 12s, smooth easing, no camera shake.
```

### SCENE 2 — STAKES "debarred semester" · CARTOON
**Image prompt**
```
[STYLE PREAMBLE — cold-open palette: bg #0e0a06, accent #ef6a3a]
Split composition: left, protagonist (ref B1) stuck in line with a sweat bead; right, a
classroom door closing and an attendance sheet with a red "ABSENT" stamp landing.
Lower third reserved for a serif-italic line. 12:47 clock visible. 16:9, tense mood.
```
**Video / motion prompt**
```
Light tension float, quick whip-pan between line and closing door. "ABSENT" stamp slams
with a persimmon impact ring; clock ticks 12:47 to 12:54; editorial-serif line writes on.
12s, premium ease.
```

### SCENE 3 — TRAP + Commission Goblin · CARTOON
**Image prompt**
```
[STYLE PREAMBLE — cold-open palette: bg #0e0a06, accent #ef6a3a]
Canteen owner (ref B2) overwhelmed behind a counter, swirling cash, paper chits and ledgers.
A ₹100 coin on the counter. The Commission Goblin (ref B3) grinning, biting a 15–30% crescent
wedge out of the coin and pocketing it. Generic "Aggregator −30%" tags fluttering (no real
brand logos). 16:9, comedic-dark mood.
```
**Video / motion prompt**
```
Push-in on the coin; comedic pop-zoom as the goblin chomps a wedge out of it; mono counter
ticks the coin value 100 to 70; chits pile higher; owner sighs and slumps. 14s.
```

### SCENE 4 — REVEAL + HOME · BOTH (RECORDING: landing-hero)
**Image prompt** (frame only — do NOT generate UI)
```
[STYLE PREAMBLE — home palette: bg #E9E2D0, ink black, accent #e60000]
Bright editorial cream stage with a clean minimal browser frame (empty screen area left
blank for compositing a real screen recording). Heavy condensed headline reading
"MULTI-TENANT CANTEEN MANAGEMENT FOR colleges." with "colleges." in red serif-italic.
A green/persimmon energy thread looping once around the browser frame. 16:9.
```
**Note:** Composite the **landing-hero** recording into the blank browser frame. Headline can be motion-typed in After Effects or generated as overlay text.

### SCENE 5 — STUDENT DEMO · BOTH (RECORDING: student-mobile / student-wide)
**Image prompt** (device + hand frame only)
```
[STYLE PREAMBLE — accent student red #e60000]
Over-the-shoulder of the protagonist (ref B1), now calm, holding a smartphone with a BLANK
screen (for compositing a real recording). Soft red ambient gradient, cartoon hand, energy
thread anchored to the phone glowing green/persimmon. 16:9, clean.
```
**Note:** Composite **student-mobile** (primary) and **student-wide** (menu/prep) recordings into the blank phone/screen. Real flow shown: choose canteen → live menu → UPI QR → Place order → OTP.

### SCENE 6 — KITCHEN DEMO · BOTH (RECORDING: kitchen)
**Image prompt** (display frame only)
```
[STYLE PREAMBLE — accent kitchen tomato #d52821]
A wall-mounted kitchen display screen (BLANK screen for compositing) on a tomato-toned
kitchen wall, light steam and cartoon kitchen hands framing the edges. Energy thread arriving
into the screen from the right, tomato-tinted. 16:9.
```
**Note:** Composite the **kitchen** recording; real ticket advances Placed → Preparing.

### SCENE 7 — ADMIN DEMO · BOTH (RECORDING: admin)
**Image prompt** (dashboard frame only)
```
[STYLE PREAMBLE — accent chartreuse #cdfa50 / lime #8fb305]
A wide desk dashboard panel with a BLANK widescreen monitor (for compositing a real
recording), the canteen owner (ref B2) watching calmly beside it, chartreuse/lime accent
panel. Energy thread feeding into the monitor, chartreuse-tinted. 16:9.
```
**Note:** Composite the **admin** recording; real live order feed updates in real time (~300ms).

### SCENE 8 — CREDIBILITY (0% / vault / tug-of-war) · CARTOON
**Image prompt — Panel A (0% slam)**
```
[STYLE PREAMBLE — home palette: bg #E9E2D0, accent #e60000]
The Commission Goblin (ref B3) lunging at a whole ₹100 coin; a giant black-and-red "0%"
stamp slamming down with an impact ring; the goblin shattering/vanishing; coin stays whole
at ₹100. 16:9, triumphant.
```
**Image prompt — Panel B ("zero rows" vault)**
```
[STYLE PREAMBLE — home palette]
Tenant isolation as two thick bank-vault walls separating two canteens; a query "knocks" on
a neighbor vault and a mono readout shows "0 rows"; caption "zero rows, never a leaked one".
Clean schematic vector. 16:9.
```
**Image prompt — Panel C (samosa tug-of-war)**
```
[STYLE PREAMBLE — home palette]
"Two students, one last samosa": two order-tickets in a tug-of-war over a single samosa rope;
race condition resolving cleanly to a green check and "✓ ×1"; the loser shows a gentle
"sold out". Single unbroken energy thread runs through. 16:9.
```
**Video / motion prompt** (one per panel)
```
Punchy cut-on-action. A: 0% stamp slams, goblin shatters. B: vault doors clank shut, "0 rows"
ticks in mono. C: rope snaps taut then resolves to "✓ ×1". Each lands with an impact ring in
its proof color. 5s each.
```

### SCENE 9 — IMPACT "~12 minutes back" · CARTOON
**Image prompt**
```
[STYLE PREAMBLE — home palette, warm hopeful]
Same canteen as Scene 1 but the seven-deep line is dissolving into calm: students disperse
with phones and OTPs, picking up trays without shouting. Protagonist (ref B1) relaxed,
walking toward class on time; clock shows a comfortable margin. Mono "~12 minutes back"
callout. 16:9.
```
**Video / motion prompt**
```
Reverse of the opening: gentle pull-back revealing calm; queue figures evaporate
particle-by-particle; mono counter animates "~12 minutes back"; protagonist exhales. 12s.
```

### SCENE 10 — CLOSE / END CARD · BOTH (brief RECORDING: landing-hero) + CARTOON
**Image prompt** (end card)
```
[STYLE PREAMBLE — home palette: bg #E9E2D0, ink black, accent #e60000]
Clean centered end card: bold "TRAY" wordmark, one-liner "Shopify for campus canteens —
0% commission, no code, and the lunch line disappears." (one-liner in editorial serif,
key word red serif-italic), URL "trayy.vercel.app", credit "Built solo by Thribhuvan."
A single energy thread tying off into a knot/loop near the wordmark. 16:9, premium.
```
**Note:** Optionally open the scene with a 1–2s **landing-hero** headline reprise before morphing to the card. Optional ≤2s mono "What's next" tag — must read as clearly future/not-built.

---

## (D) SHARED NEGATIVE PROMPT — append to every image prompt

```
no real brand logos (no Swiggy, no Zomato, no Shopify marks), no fake app screenshots,
no invented UI, no text artifacts or gibberish typography, no misspelled words,
no photorealism, no 3D render, no harsh shadows, no clutter, no busy backgrounds,
no caricature, no ethnic/religious/cultural stereotype, no offensive imagery,
no extra fingers, no distorted hands or faces, no watermark, no signature,
no low-res, no jpeg artifacts, no neon over-saturation, no inconsistent line weights.
```

---

## (E) TOOL SUITABILITY QUICK-REFERENCE

| Need | Recommended tool |
|---|---|
| Hero stills / character turnarounds (style control, `--cref`/`--sref`, seeds) | **Midjourney** |
| Quick concept stills / typography-light boards | **DALL·E** |
| Image-to-video, smooth camera moves, parallax | **Runway**, **Kling** |
| Cinematic / narrative motion, longer beats | **Sora** |
| Templated motion presets, fast iteration | **Higgsfield** |

**Recordings (no art generation):** Scene 4 (landing-hero), Scene 5 (student-mobile, student-wide), Scene 6 (kitchen), Scene 7 (admin), plus brief landing-hero reprise in Scene 10. Capture these from https://trayy.vercel.app and composite into the cartoon frames above.

**Consistency workflow:** (1) Generate B1–B4 turnarounds, lock seeds. (2) For each scene, attach the relevant character ref image + reuse seed. (3) Keep signature props fixed (hoodie+backpack, apron, receipt-hat goblin, 12:47 numerals). (4) Maintain one continuous energy thread color logic across portals (red → tomato → chartreuse → home).

---

## SUMMARY

Produced two production-ready deliverables for the TRAY 2:00 hackathon film. `02-STORYBOARD.md` lays out 10 scenes mapped exactly to the locked beat map, each with timestamp, composition, camera move, CARTOON/SCREEN-RECORDING/BOTH tagging, per-portal color, matching real-screenshot reference, and energy-thread transitions. `03-GENERATION-PROMPTS.md` provides a reusable style preamble (flat-2D look + exact palette hexes + 16:9), four full character sheets (Student, Canteen Owner, Commission Goblin, Clock) with seed/reference-image consistency tips, per-scene image and motion prompts, a shared negative prompt, and a tool-suitability matrix. Honesty constraints are enforced throughout: real UI is recordings only, unbuilt features are confined to an optional ≤2s "what's next" tag, and the goblin is explicitly a non-caricature fantasy creature.
