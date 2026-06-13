# Test-Screening Synthesis — what the panels said, what I changed, what's next

Two independent reviews were run on the locked plan:
- `REVIEW-cinematography.md` — a film editor/DP craft review. **Grade: B+** (A-level craft, mis-*allocated*: best motion spent on cartoon while real product arrived too late; several beats leaned on audio a muted judge won't hear).
- `REVIEW-audience.md` — a 3-viewer test screening (technical judge / impact judge / target student). **Scorecard: 19/25.** Recurring weakness across all three: **hard claims are asserted, not shown.** Biggest single risk: the word **"Guaranteed."**

---

## ✅ Already applied in the v2 animatic (`tray-animatic.mp4`)

1. **"Guaranteed." → "By design."** (script + captions). Removes the one line that could flip a concurrency bug into a credibility lie. "By design" is true and defensible — it's literally the atomic-capture + idempotency design.
2. **Real product pulled forward to ~0:41** (was 0:52). Added an "it's real" **proof triptych** — your actual OTP screen, kitchen Ready queue, and admin orders table — right after the reveal, so a skimming judge sees the working product 11s sooner.
3. **Demo shown in motion, color-coded by portal**, with the real screen recordings (student → kitchen → admin) carrying the middle.

---

## 🔧 Top fixes for the FINAL cut (ranked — do these before submitting)

**Tier 1 — credibility (both panels agree: show, don't tell)**
1. **Shoot the "two students, one last samosa" race for real.** Two browser tabs, same item, race the checkout, show only one capture succeeds. This is the #1 score-mover and the honest version of the old "Guaranteed." Until you have it, the claim stays "By design."
2. **Show a real RLS "zero rows" moment.** A 3–4s screen capture: same query, two tenants, one sees rows, the other sees zero. Proves isolation instead of asserting it.
3. **Put a real timestamp delta on the ~300ms claim.** Capture the student status flip and the kitchen/admin update side by side with a visible clock; let the number be observed, not narrated.

**Tier 2 — craft (cinematography review)**
4. **Tighten Act 1.** The cold open is ~4 equal beats; collapse the context-free clock and get a human-stress frame + the signature line readable by ~0:10.
5. **Kitchen/admin legibility at small size.** In the final, follow ONE ticket near full-bleed and redraw the KPI numbers as large punch-ins. (The animatic shows the board; the final should isolate the hero element.)
6. **Reconcile the "energy thread" count** — storyboard/cinematography say 4 portal boundaries, edit plan implies 5. Pick 4 so the signature transition isn't diluted.

**Tier 3 — content (audience review)**
7. **Add ONE honest line on the model** *if you have one* (e.g., a flat per-canteen SaaS fee). Don't invent it — if there's no model yet, say "0% commission to canteens" and leave it.
8. **Front-load one credibility chip** in the first ~12s ("live · 191 commits · 0% commission") so sk​immers get a reason to stay.

---

## 🚫 Do NOT do (honesty guardrails the panels reinforced)

- Don't *stage* the race/RLS/latency with the mocked demo pages — those are client-side mocks. Capture them against the **real** app or don't claim them as shown.
- Keep unbuilt features (AI forecasting, wallet, loyalty, Master Control) to a ≤2s "what's next" tag.
- Keep the "~" on ~12 min and ~300ms.

---

## Scorecard target

Current paper edit ≈ **19/25**. Landing Tier-1 (the three real proof shots) is what moves **Technical depth 3→4/5** and **Innovation 3→4/5** — the two lowest scores. That's the difference between "nice story" and "they actually built the hard part."
