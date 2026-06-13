# TRAY — 02 STORYBOARD

**Film:** "12:47 — Shopify for campus canteens"
**Runtime:** 2:00 (locked) · **Aspect:** 16:9 · **Creator:** Thribhuvan · **Live:** https://trayy.vercel.app

---

## How to read this document

- **CARTOON** = original flat-2D vector animation (generate art, see `03-GENERATION-PROMPTS.md`).
- **SCREEN-RECORDING** = real product UI captured from https://trayy.vercel.app. **Never** recreate these as art.
- **BOTH** = real recording composited inside a cartoon frame (device, vault, energy thread, etc.).
- **Energy thread wipe** = the green/persimmon thread that carries ONE order across portals; it is the standard transition between portal-colored sections.

### Master color-by-portal map

| Section | Mood / Portal | Primary palette |
|---|---|---|
| Cold open / problem | Warm dark | `#0e0a06` bg + persimmon `#ef6a3a` |
| Reveal / home | Brand home | cream `#E9E2D0` + black + red accent `#e60000` |
| Student demo | Student | red `#e60000` |
| Kitchen demo | Kitchen | tomato `#d52821` |
| Admin demo | Admin | chartreuse `#cdfa50` / lime `#8fb305` |
| Impact / close | Back to home | cream `#E9E2D0` + black + red `#e60000` |

### Type system (recurring)
- Display: heavy condensed grotesque (headlines).
- Accent: red serif-italic single word (e.g. `colleges.`, `disappears.`) — matches real home page.
- Editorial: Instrument Serif / Newsreader. UI: Geist / Manrope / Bricolage. Numbers/data: Geist Mono / JetBrains Mono.

---

## SCENE 1 — HOOK · "12:47"
- **Timestamp:** 0:00–0:12
- **Type:** CARTOON
- **Per-portal color:** Warm dark `#0e0a06` + persimmon `#ef6a3a`
- **Frame / Composition:** Open on a giant analog-meets-mono clock reading **12:47**, monospaced numerals glowing persimmon against warm dark. Pull back to reveal a crowded campus canteen counter: seven students stacked deep, paper chits flying, raised hands, speech bubbles colliding ("Two samosas!" "Anna!" "Chai!"). A single anxious student (our protagonist) is mid-queue, eyeing a wristwatch.
- **Camera & move:** Slow push-in on clock, then a smooth dolly-back / zoom-out to expose the chaos. Shallow parallax between counter, crowd, and background.
- **Key action / animation:** Clock second-hand ticks; chit-papers flutter on a limited-frame loop; overlapping speech bubbles pop in staccato. Caption types in (mono): "It's 12:47. Thirteen minutes to class."
- **Screenshot reference:** n/a — original cartoon
- **Transition out:** Clock hand sweeps; a persimmon motion-streak wipes left → reveals the stakes scene.

---

## SCENE 2 — STAKES · "A samosa is not worth a debarred semester"
- **Timestamp:** 0:12–0:24
- **Type:** CARTOON
- **Per-portal color:** Warm dark `#0e0a06` + persimmon `#ef6a3a`
- **Frame / Composition:** Split focus — left: the protagonist still stuck in line, sweat-bead; right: a classroom door closing, an attendance sheet with a red **"ABSENT"** stamp landing. Center lower-third reserved for the signature line.
- **Camera & move:** Subtle handheld-style float (very light) to raise tension; quick whip between line and closing door.
- **Key action / animation:** Attendance "ABSENT" stamp slams down (persimmon impact ring). Clock ticks 12:47 → 12:54. Editorial-serif line writes on: *"A samosa is not worth a debarred semester."*
- **Screenshot reference:** n/a — original cartoon
- **Transition out:** Camera racks to a ₹100 coin spinning into frame — persimmon glint catches it. Cut to the trap.

---

## SCENE 3 — THE TRAP · Commission Goblin (–30% bite)
- **Timestamp:** 0:24–0:38
- **Type:** CARTOON
- **Per-portal color:** Warm dark `#0e0a06` + persimmon `#ef6a3a`
- **Frame / Composition:** The other side of the story — a warm canteen owner ("anna/aunty") behind a counter, drowning in a swirl of cash, paper chits, and ledger pages. A ₹100 coin sits on the counter. The **Commission Goblin** scuttles in, grins, and chomps a **15–30%** crescent bite out of the coin, pocketing it.
- **Camera & move:** Push-in on the coin for the bite; small comedic "pop" zoom as the goblin chomps; then a slow defeated pull-back on the owner.
- **Key action / animation:** Goblin bite removes a wedge; mono counter ticks the coin value `₹100 → ₹70`. Logo-agnostic delivery-app "tax" tags (no real brand marks; generic "Aggregator −30%") flutter down. Owner sighs; chits pile higher.
- **Screenshot reference:** n/a — original cartoon
- **Transition out:** Goblin recoils as a clean cream light blooms from the right; persimmon dark peels away → cream home palette floods in (the energy thread is "born" here, green-tipped).

---

## SCENE 4 — REVEAL · "Shopify for campus canteens" + Home
- **Timestamp:** 0:38–0:52
- **Type:** BOTH (cartoon frame + SCREEN-RECORDING of home page)
- **Per-portal color:** Cream `#E9E2D0` + black + red `#e60000`
- **Frame / Composition:** Tone flips to bright editorial cream. Heavy condensed headline assembles: **"MULTI-TENANT CANTEEN MANAGEMENT FOR _colleges._"** with `colleges.` as red serif-italic. The real landing page slides up inside a clean browser frame. One-liner lower-third: "Shopify for campus canteens: 0% commission, no code, and the lunch line disappears."
- **Camera & move:** Confident settle — headline kinetic-types, then a gentle upward reveal of the **landing-hero** recording. No shake; premium ease.
- **Key action / animation:** Headline words snap into place on the grid; red italic word lands last with a small flourish. Energy thread loops once around the home frame, green/persimmon, hinting "coordination layer."
- **Screenshot reference:** **landing-hero** (real recording inside cartoon browser frame)
- **Transition out:** Energy thread peels off the home frame and shoots right, turning **student red** — wipe into the student demo.

---

## SCENE 5 — DEMO: STUDENT · choose canteen → live menu → UPI → Place order → OTP
- **Timestamp:** 0:52–1:06
- **Type:** BOTH (cartoon phone in protagonist's hand + SCREEN-RECORDING)
- **Per-portal color:** Student red `#e60000`
- **Frame / Composition:** The protagonist (now calm, out of the chaotic line) holds a phone. The **student-mobile** recording fills the device screen. Cartoon hand and red ambient gradient frame it; optional second beat widens to **student-wide** for the menu/prep view.
- **Camera & move:** Over-the-shoulder framing on the phone; subtle tilt to follow taps. One smooth scale-up to full-bleed on the recording for the UPI QR moment.
- **Key action / animation:** Real UI flow: choose canteen → live menu with prep times → **UPI QR** appears → **Place order** → status `Placed` → and the **4-digit OTP** reveals. The energy thread anchors to this single order and pulses (~300ms beat).
- **Screenshot reference:** **student-mobile** (primary), **student-wide** (menu/prep beat)
- **Transition out:** The order (energy thread) leaves the phone and travels along the thread, shifting from red toward **kitchen tomato** — wipe into kitchen.

---

## SCENE 6 — DEMO: KITCHEN · ticket advances
- **Timestamp:** 1:06–1:14
- **Type:** BOTH (cartoon kitchen-display frame + SCREEN-RECORDING)
- **Per-portal color:** Kitchen tomato `#d52821`
- **Frame / Composition:** A kitchen display screen mounted on a tomato-toned wall; the **kitchen** recording fills it. The same order (carried by the thread) lands as a fresh ticket. Cartoon kitchen hands/steam frame the edges.
- **Camera & move:** Locked-off on the display with a slight push as the ticket advances; micro-parallax on steam.
- **Key action / animation:** Real UI: the ticket moves `Placed → Preparing`. Thread "delivers" the order into the column; ~300ms realtime sync emphasized with a quick mono timestamp tick.
- **Screenshot reference:** **kitchen**
- **Transition out:** Ticket flips to `Preparing`; thread brightens and turns **admin chartreuse/lime** — wipe into admin.

---

## SCENE 7 — DEMO: ADMIN · live feed
- **Timestamp:** 1:14–1:24
- **Type:** BOTH (cartoon dashboard frame + SCREEN-RECORDING)
- **Per-portal color:** Admin chartreuse `#cdfa50` / lime `#8fb305`
- **Frame / Composition:** A wide admin dashboard on a chartreuse-accented panel; the **admin** recording fills it. The single order appears in the live feed alongside others, owner persona watching calmly (no more chit-chaos).
- **Camera & move:** Smooth horizontal drift across the live feed; gentle scale to highlight the order row updating in real time.
- **Key action / animation:** Real UI: live order feed updates; the tracked order's status syncs in real time. Mono "~300ms" callout ticks once. Owner gives a small relieved nod.
- **Screenshot reference:** **admin**
- **Transition out:** All three portal colors (red/tomato/chartreuse) converge on the thread and resolve to a clean home-cream stage — wipe into credibility.

---

## SCENE 8 — CREDIBILITY · 0% slam · "zero rows" vault · samosa tug-of-war ×1
- **Timestamp:** 1:24–1:40
- **Type:** CARTOON (may inset a 1–2s recording for the 0% home detail)
- **Per-portal color:** Cream `#E9E2D0` + black + red `#e60000`, with portal accent flashes per proof beat
- **Frame / Composition:** Three rapid proof panels.
  1. **0% slam:** The Commission Goblin returns, lunges at the ₹100 coin — a giant **"0%"** stamp slams down; goblin shatters/vanishes. Coin stays whole at `₹100`.
  2. **"Zero rows" vault:** Tenant isolation as thick vault walls between two canteens; a query knocks on a neighbor's vault and gets **"0 rows"** — caption: *"zero rows, never a leaked one."* (Postgres RLS.)
  3. **Samosa tug-of-war:** "Two students, one last samosa" — a rope tug between two order-tickets; race resolves cleanly to **"✓ ×1"** (one wins, one gets a graceful "sold out").
- **Camera & move:** Punchy cut-on-action between the three panels; each lands with an impact ring in its proof color.
- **Key action / animation:** 0% stamp impact; vault doors clank shut with "0 rows" readout (mono); tug-of-war snaps to `✓ ×1`. Energy thread stays single and unbroken across all three (one order, one truth).
- **Screenshot reference:** n/a — original cartoon (optional 1–2s **landing-hero** "0% commission" inset)
- **Transition out:** Thread sweeps back through the canteen — wipe into impact.

---

## SCENE 9 — IMPACT · line dissolves · "~12 minutes back"
- **Timestamp:** 1:40–1:52
- **Type:** CARTOON
- **Per-portal color:** Cream `#E9E2D0` + black + red `#e60000` (warm, hopeful)
- **Frame / Composition:** Return to the Scene 1 canteen — but the seven-deep line **dissolves**: students disperse calmly, phones in hand, OTPs ready, picking up trays without shouting. The protagonist walks toward class on time. Clock reads a comfortable margin.
- **Camera & move:** Reverse of the opening — a gentle pull-back that now reveals calm instead of chaos; the line literally evaporates particle-by-particle.
- **Key action / animation:** Queue figures fade/disperse; mono counter animates **"~12 minutes back"**; clock no longer menacing. Protagonist gives a relaxed exhale.
- **Screenshot reference:** n/a — original cartoon
- **Transition out:** Energy thread loops once around the calm scene, then draws the home headline onto a cream end stage.

---

## SCENE 10 — CLOSE · Home headline + End card (Thribhuvan)
- **Timestamp:** 1:52–2:00
- **Type:** BOTH (cartoon end card + brief SCREEN-RECORDING of home headline)
- **Per-portal color:** Cream `#E9E2D0` + black + red `#e60000`
- **Frame / Composition:** Home headline reprises: **"MULTI-TENANT CANTEEN MANAGEMENT FOR _colleges._"** then collapses into the end card: **TRAY** wordmark, one-liner *"Shopify for campus canteens — 0% commission, no code, and the lunch line disappears."*, URL **trayy.vercel.app**, and credit **"Built solo by Thribhuvan."** Optional tiny mono "What's next" tag (≤2s) for roadmap items — clearly future, not built.
- **Camera & move:** Clean settle to a centered, locked end card; one subtle energy-thread flourish that ties off into the TRAY logo.
- **Key action / animation:** Headline → wordmark morph; URL and credit fade in; thread ties a final knot/loop. Hold on end card.
- **Screenshot reference:** **landing-hero** (brief headline reprise) → original cartoon end card
- **Transition out:** Fade to cream. End.

---

## Honesty notes (apply throughout)
- Real product UI (Scenes 4–8 recordings) = screen recordings only; do **not** generate fake screens.
- Do **not** depict AI forecasting, weather-tuned prep, inventory/auto-86, wallet, loyalty, subscriptions, or a "Master Control Centre" as shipped features. If referenced at all, confine to the ≤2s "What's next" tag in Scene 10.
- Commission Goblin is comedic and greedy — explicitly **not** an ethnic/religious/cultural caricature.
- Characters are warm, human Indian college-campus people — not exaggerated caricatures.
