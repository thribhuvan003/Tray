# TRAY — Audience Screening Report

**Asset reviewed:** `01-SCRIPT.md` (locked 2:00 narration + 0:90 alt) and `02-STORYBOARD.md` (10 scenes).
**Format:** Three simulated viewers react to the *video as scripted/storyboarded* (no final cut available — reactions assume the script is executed competently).
**Reviewer stance:** Honest, slightly harsh. Flattery helps no one.

---

## VIEWER 1 — TECHNICAL JUDGE
*Cares about architecture, correctness, real engineering: RLS, idempotency, realtime.*

- **First 10s gut reaction:** Mild impatience. The clock and the canteen chaos are charming but content-free for me. I'm waiting to find out if this is a Figma toy or a real system. I don't get my first signal until 0:38.
- **The line/moment they'll remember:** *"Worst case is zero rows, never a leaked one."* That is the single most credible engineering sentence in the whole piece — it shows the author actually understands RLS failure modes (deny-by-default), not just the buzzword. The "two students, one last samosa — only one charge goes through" is the second-best moment because it implies an idempotency/concurrency story.
- **What confused or bored them:** The samosa concurrency claim is *stated* but never *shown*. "Only one charge goes through. Guaranteed." — guaranteed by what? A unique constraint? A row lock? An idempotency key on the Razorpay order? I can't tell, and "Guaranteed" without a mechanism reads as marketing. Same with "~300ms" — I want to know it's Postgres `LISTEN/NOTIFY` / Supabase Realtime / websockets, not a polling loop dressed up. The storyboard's "energy thread pulses ~300ms" is animation, not evidence.
- **What made them lean in:** The Scene 8 "zero rows vault" framing (a query knocking on a neighbor tenant and getting 0 rows). If the screen recording actually shows a cross-tenant query returning empty under RLS, that's a genuine flex. 27 migrations + 191 commits also signals real, sustained build work rather than a weekend mock.
- **Shortlist?** **MAYBE.** One reason: the claims are architecturally literate and plausible, but the video *asserts* correctness (RLS isolation, single-charge idempotency, 300ms) without *demonstrating* any of it on screen — so I can't separate "engineered" from "narrated."

---

## VIEWER 2 — IMPACT / BUSINESS JUDGE
*Cares about the problem, market, the 0%-commission model, who it helps.*

- **First 10s gut reaction:** Hooked. "12:47, thirteen minutes to class, seven people deep" is a problem I can feel in my body. This is a real, specific, repeated pain — not an invented one.
- **The line/moment they'll remember:** *"A samosa is not worth a debarred semester."* It's the whole thesis — small purchase, disproportionate cost — in one sentence. Closely followed by the Commission Goblin biting ₹100 → ₹70: it makes the 15–30% take rate visceral and explains *why* canteens can't just use Swiggy/Zomato.
- **What confused or bored them:** The market size and "who exactly buys this" are never quantified. How many canteens? How many colleges? Is the buyer the canteen owner, the college administration, or a contractor? The "Shopify for campus canteens" analogy is strong, but Shopify's whole story is *scale and GMV* — I get zero numbers on adoption, pilots, or even a single real canteen using it. "In our testing" appears twice, which is honest but quietly admits there's no live customer yet.
- **What made them lean in:** The 0%-commission + direct UPI settlement model. "Money settles straight to each canteen's bank through Razorpay" is the business unlock — it sidesteps the aggregator tax that the Goblin just dramatized. That's a coherent wedge. Self-serve no-code onboarding ("logs in once") also implies low CAC, which I care about.
- **Shortlist?** **MAYBE (leaning yes).** One reason: the problem and the wedge are genuinely sharp and well-told, but with no traction, no market sizing, and no monetization model (if it's 0% commission, *how does Tray make money?*), I can't yet believe it's a business rather than a great demo.

---

## VIEWER 3 — TARGET STUDENT
*Hungry, impatient, non-technical, the actual end user.*

- **First 10s gut reaction:** "Okay this is literally my life." The clock and the shouting line are exactly the thing. Instant recognition.
- **The line/moment they'll remember:** *"No chit. No cash. No shouting."* — that's the dream. And the 4-digit OTP pickup: I get *why* it's better than yelling my order and hoping.
- **What confused or bored them:** The middle (kitchen view, admin dashboard, RLS, "Postgres row-level security," "300 milliseconds") is not for me and I tune out around 1:06–1:24. As a student I don't care about the owner's dashboard or where data is isolated — I care: is it faster, does my food show up, do I get it without losing my spot? The "single-use UPI QR" is slightly unclear — do I scan it or does it scan me? I'd want to *see* a payment finish in one tap.
- **What made them lean in:** "About twelve minutes back, every lunch." Twelve minutes is real to me. And seeing the order go Placed → Preparing → Ready means I can stay seated and not hover at the counter. That's the feature I'd tell my friends about.
- **Shortlist? (would they use it):** **YES.** One reason: it directly removes the wait and the chit/cash hassle — if my canteen had this I'd switch today. (Caveat I can't shake: every canteen near me already has a UPI QR taped to the counter — Tray has to be clearly faster than just paying and waiting, and the video almost makes that case but leans on the queue, not the food-arrival time.)

---

## CONSOLIDATED JUDGE SCORECARD
*1 = weak, 5 = excellent.*

| Criterion | Score | One-line justification |
|---|---|---|
| **Innovation** | 3 / 5 | Multi-tenant "Shopify for canteens" + 0% commission is a sharp framing, but the underlying parts (RLS, UPI, order status) are well-trodden; novelty is in the packaging, not the tech. |
| **Impact** | 4 / 5 | Real, specific, repeated pain with a credible cost ("debarred semester"); held back only by zero traction numbers and no stated revenue model. |
| **Technical depth** | 3 / 5 | Architecturally literate claims (RLS deny-by-default, idempotent charge, realtime) but *asserted*, not *shown*; "Guaranteed" and "~300ms" need on-screen proof. |
| **Demo clarity** | 4 / 5 | Student → kitchen → admin flow is clean and well-sequenced with real recordings; the energy-thread-carries-one-order device is genuinely good storytelling for a system demo. |
| **Presentation / Storytelling** | 5 / 5 | Excellent. The 12:47 spine, the signature line, the Goblin, the color-by-portal system, and the line-dissolves payoff are professional-grade narrative craft. |
| **TOTAL** | **19 / 25** | Strong, story-led submission; capped by un-shown technical proof and missing business/traction substance. |

---

## TOP 5 CHANGES THAT WOULD MOST INCREASE THE SCORE
*Ranked. Concrete. Achievable solo before submission.*

1. **Show the concurrency proof, don't just say "Guaranteed."** In Scene 8, replace (or back) the tug-of-war cartoon with a 2-second real screen recording: two browser windows both hit "Place order" on the last samosa; one succeeds, the other gets a clean "sold out." This converts your single best technical claim from assertion to evidence and directly fixes the technical judge's biggest doubt. (Two browser tabs + your existing build = ~30 min.)
2. **Show RLS returning zero rows for real.** Briefly flash a real query/console where Tenant B's session queries Tenant A's orders and gets `0 rows`. Even 1.5s of a real terminal or Supabase SQL editor turns "zero rows, never a leaked one" into a credibility moment instead of a slogan.
3. **Add one line answering "how does Tray make money?"** A 0%-commission pitch invites the obvious question. A single end-card line (e.g., "Canteens pay a flat monthly fee, not a cut") removes the impact judge's main objection. If undecided, at least say "no per-order commission" so the model is legible.
4. **Quantify the realtime and the queue, on screen.** Put a real mono timestamp delta on the kitchen ticket (e.g., placed `12:47:03.1` → appears `12:47:03.4`) so "~300ms in our testing" is visible, and anchor the "12 minutes" to food-arrival, not just queue length — that's what the student actually questioned.
5. **Tighten the front-loading for judges who skim.** Move one hard credibility beat (0% commission + "your own isolated system") to flash within the first 12s, even as on-screen text. Right now a technical/business judge gets no signal until 0:38 — in a stack of submissions that's a long time to wait. Keep the emotional hook, just layer one proof chip over it.

---

## THE ONE THING THAT COULD HURT CREDIBILITY / GET IT DISQUALIFIED

**Overclaiming certainty on the concurrency guarantee.** The word **"Guaranteed."** (delivered as a hard mic-drop with no upspeak) is the single riskiest line. If a judge opens trayy.vercel.app, races two orders on a low-stock item, and gets a double-charge or a race condition, the entire submission's credibility collapses — and "Guaranteed" makes it a *correctness lie*, not just a bug. Either (a) demonstrate it on screen so it's defensible, or (b) soften to "only one charge goes through" without the absolute guarantee.

Secondary watch-item (lower risk, well-handled): the script already hedges "~300ms *in our testing*" and "*about* twelve minutes," and the storyboard's Honesty Notes explicitly bar showing unbuilt features (forecasting, wallet, loyalty) outside a ≤2s "what's next" tag. That discipline is good — keep it; the only place the discipline lapses is "Guaranteed."

---

## SUMMARY

Tray is a genuinely well-told, story-first submission: the 12:47 lunch-line spine, the "samosa is not worth a debarred semester" line, and the color-by-portal demo are professional-grade and will be remembered. Its ceiling is capped by one consistent gap — it *narrates* its hardest claims (tenant isolation, single-charge idempotency, 300ms realtime) instead of *showing* them, and it leaves the business model and traction unaddressed. The cheapest, highest-leverage fixes are all on-screen proofs the author can record solo in an afternoon: a live two-tab race for the last samosa, a real zero-rows RLS query, and one line on how a 0%-commission product earns. Drop or demonstrate the word "Guaranteed." Do those, and an honest 19/25 becomes a shortlist-worthy 22+.
