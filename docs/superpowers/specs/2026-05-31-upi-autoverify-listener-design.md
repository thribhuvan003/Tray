# Design: Auto-verify Direct-UPI Payments ("Money-arrival listener")

**Date:** 2026-05-31
**Status:** Approved design — pending implementation plan
**Author:** Tray team
**Scope:** The `direct_upi` payment rail only. The `razorpay` rail is unchanged.

---

## Problem

Canteen admins on the **direct UPI** rail receive money peer-to-peer into their own
personal UPI/bank account. There is no API, webhook, or reliable bank SMS that tells
the server a specific order was paid. Today's code is explicit about this
(`src/components/portal-student/pay-panel.tsx`):

> "P2P UPI has no API. The 20s 'I paid' button is the only anti-fraud gate on the
> direct_upi path."

Consequences reported in the field:

1. The admin gets **no notification he can act on** per order — he must open his bank/UPI
   app and check manually.
2. During a rush he **cannot check every order**.
3. Students tap **"I paid"** without paying. The order enters the kitchen flagged
   `upi_unverified`, staff don't catch it under load, and the student collects food for
   free. **The canteen loses money.**

The admin's constraints (confirmed):
- Wants money **instantly in his own account** (rejects Razorpay's T+1 settlement).
- Wants **no KYC / business onboarding**.
- Wants to **keep his existing personal UPI** — no new app or account to receive money.
- Fees are **not** a concern.
- **Confirmed:** his UPI app shows a "Received ₹X" **notification** when money arrives.

## Goal

Automatically and reliably confirm a direct-UPI payment to the correct order, with **no
manual checking** and **no fakeable self-confirmation**, while the admin keeps his own
personal UPI and instant settlement.

## Non-goals

- Changing the `razorpay` rail.
- Eliminating the operational dependency on the counter phone (accepted trade-off).
- Programmatic refunds on direct UPI (already handled as `refund_owed` / manual).
- Building a native Android app in this phase (MacroDroid recipe is the v1 listener).

---

## Approach (chosen)

**"Money-arrival listener" + unique-amount matching + a manual safety net.**

The only signal that real money arrived is the **notification the admin's own UPI app
already shows**. We bridge that signal to the server and match it to an order by giving
each order a **unique amount**.

Rejected alternatives (for the record):
- **Razorpay / gateway (existing):** robust, but T+1 settlement + onboarding — rejected by admin.
- **UPI merchant account (PhonePe/Paytm/BharatPe for Business):** cleanest, near-instant,
  zero-MDR, light KYC — but requires onboarding a business app. Hold as the future option.
- **Dedicated Tray Android companion app:** same idea as the listener, more polish, more
  build cost. Deferred to a later phase; MacroDroid first.
- **Tighten manual flow only:** kept, but only as the *safety net* beneath the listener.

---

## How it works (happy path)

1. Student checks out. Order total ₹50.00 → system assigns **`upi_verify_paise` = 43**,
   a tag unique among that canteen's currently-unpaid orders in the payment window.
2. The QR / `upi://` link requests the **final amount ₹50.43**.
3. Student pays from their own UPI app to the admin's own VPA. Nothing changes for the admin.
4. Money lands instantly. The admin's UPI app shows **"Received ₹50.43"**.
5. A free automation app (MacroDroid) on the **counter phone** catches that notification and
   `POST`s its text to a new Tray endpoint with the canteen's secret.
6. Tray parses "₹50.43", finds the single pending order whose final amount is ₹50.43, and
   marks it **PAID — verified** via an atomic, idempotent path modeled on the existing
   `safe_capture_payment` RPC. It emits an `order_events` row.
7. The student's pay screen flips to success via the **existing Realtime subscription**;
   the kitchen sees a **verified** order.

A random personal UPI payment to the admin (not from Tray) matches no pending order and is
safely recorded as an **unmatched credit** — never confirms anything.

---

## Components

### 1. Unique amount per order
- **DB:** add `orders.upi_verify_paise SMALLINT NULL` (1–99).
- **Generation:** in `placeOrder` (`src/app/(student)/_actions.ts`), after computing `total`,
  pick a tag so that `total + tag` is unique among this tenant's orders with
  `status = 'pending_payment'` and an unexpired `payment_expires_at`. Retry on collision;
  if all 99 are exhausted (extreme concurrency on the same base amount), fall back to
  `tag = 0` and flag the order so it routes to the manual safety net.
- **Charge amount** (used by QR and matching) = `total_paise + upi_verify_paise`.
  Student pays up to ₹0.99 over the menu total (approved: "add paise").
- `total_paise` stays the menu total for accounting; the tag is additive and tracked separately.

### 2. Listener endpoint
- **Route:** `POST /api/webhooks/upi-credit`.
- **Auth:** per-tenant shared secret (`tenants.upi_listener_secret`) sent in a header.
  Constant-time compare. Reject on mismatch (401).
- **Request body (from MacroDroid):**
  `{ tenant: "<id-or-slug>", text: "<notification text>", package: "<app pkg>", received_at: "<iso>" }`
  with the secret in a header (e.g. `x-tray-upi-secret`).
- **Parsing:** extract the rupee amount (e.g. `₹50.43`, `Rs 50.43`, `INR 50.43`) from `text`
  for the major UPI apps (PhonePe `com.phonepe.app`, Google Pay `com.google.android.apps.nbu.paisa.user`,
  Paytm `net.one97.paytm`, BHIM `in.org.npci.upiapp`). Normalize to integer paise.
  Unparseable text is stored (status `unparsed`) for tuning, not dropped.
- **Matching:** find tenant orders with `status='pending_payment'`, unexpired window, and
  `total_paise + upi_verify_paise = parsed_paise`. Expect exactly one (uniqueness guarantees it).
  - 1 match → confirm (below).
  - 0 matches → record as `unmatched`.
  - >1 match (should not happen) → confirm the **oldest**, log a warning.
- **Confirmation:** an atomic, idempotent DB function (new `safe_capture_upi_credit`, or a
  guarded update mirroring `safe_capture_payment`) that:
  - upserts the `payments` row (status `captured`, `razorpay_payment_id = 'upi_listener_<hash>'`,
    unique `raw_event_id` for idempotency),
  - transitions the order `pending_payment → placed` only if still `pending_payment`,
  - inserts an `order_events` row `{ from, to, source: 'upi_listener', verified: true }`,
  - inserts an `order_status_logs` row.
- **Idempotency:** dedup on a hash of `(tenant, parsed_paise, received_at, text)` recorded in
  `upi_credit_events`; a replayed notification cannot double-confirm.

### 3. Verified vs unverified state
- Listener confirmations are **truly verified** (no `upi_unverified` flag).
- The student "I paid" path (`verifyPaymentNow` direct_upi branch) remains as a **fallback**
  but is de-emphasized in the UI and continues to flag `upi_unverified: true`.

### 4. Pay panel (student) — `src/components/portal-student/pay-panel.tsx`
- When the tenant has `upi_autoverify_enabled = true`:
  - QR/link uses the **final amount** (`total + tag`); the displayed "Pay ₹X" shows the final amount.
  - After "Open UPI App", show **"Waiting for payment confirmation…"**. The existing Realtime +
    polling listeners flip to success when the listener confirms. **No self-confirm "I paid"
    button** on this path.
  - **Fallback:** if no confirmation arrives within a grace period (e.g. 90s), reveal the
    existing "I paid" button, which routes to the **unverified** flow (Approach-3 net). This
    keeps the system usable if the counter phone is offline.
- When `upi_autoverify_enabled = false`: behavior is exactly as today.

### 5. Kitchen board — `src/components/portal-kitchen/*`
- Listener-verified orders show a **✅ Auto-verified** badge and flow normally.
- Unverified orders are **held**: the "Start preparing" action is disabled until staff taps
  **"Payment received ✓"** (records a staff confirmation event). This is the manual safety net.

### 6. Admin setup — `src/app/(admin)/admin/settings/*`
- New "Auto-verify UPI (beta)" section:
  - Enable/disable toggle (`tenants.upi_autoverify_enabled`).
  - The canteen's **secret** + **webhook URL** (copyable), with a **rotate secret** action.
  - A **step-by-step MacroDroid setup guide** (install → notification trigger on the UPI app →
    HTTP POST action to the URL with the secret header).
  - A **"last credit received"** line (from `upi_credit_events`) so the admin can confirm it works.
- **Unmatched-credits view:** a list from `upi_credit_events` where status is `unmatched`/`unparsed`,
  so the admin can see "money came in but no order matched."

---

## Data model changes

- `orders.upi_verify_paise SMALLINT NULL` — per-order uniqueness tag (1–99).
- `tenants.upi_listener_secret TEXT` — per-tenant listener auth secret.
- `tenants.upi_autoverify_enabled BOOLEAN NOT NULL DEFAULT false` — feature toggle.
- New table `upi_credit_events`:
  - `id`, `tenant_id`, `raw_text`, `package`, `parsed_paise INT NULL`, `received_at`,
    `matched_order_id NULL`, `status TEXT` (`matched` | `unmatched` | `unparsed` | `duplicate`),
    `dedup_hash TEXT UNIQUE`, `created_at`.
  - Serves as idempotency ledger + admin audit/unmatched view.

All writes go through tenant-scoped admin clients (`getAdminClient(tenant.id)`), matching the
existing pattern in `placeOrder` / `verifyPaymentNow` / the reconcile cron.

---

## Error handling & failure modes

- **Counter phone off / offline:** no confirmations arrive; orders sit `pending_payment` and,
  after the grace period, fall back to the student "I paid" → unverified → staff-held flow.
  System degrades to today's behavior, never breaks.
- **Unparseable notification:** stored as `unparsed`; surfaced to admin; never confirms an order.
- **Unmatched amount (personal payment, or paid after expiry):** stored as `unmatched`;
  no order confirmed.
- **Duplicate notification (MacroDroid retry):** rejected by `dedup_hash`.
- **Collision exhaustion (99 same-base concurrent orders):** order routed to manual safety net.
- **Secret leak:** rotatable; forging still requires the exact live unique amount + real money.

## Security

- Per-tenant secret, constant-time compared; HTTPS only.
- Confirmation requires a real pending order whose unique amount matches — a forged POST with a
  guessed amount confirms nothing unless such an order is live.
- Rate-limit the endpoint per tenant (reuse `rateLimit` / `tenantRateLimit`).

## Testing

- **Unit:** amount parser across PhonePe/GPay/Paytm/BHIM sample strings, including odd
  formats and unparseable text; unique-tag generator (uniqueness + collision retry).
- **Integration:** listener endpoint — 1-match confirm, 0-match unmatched, duplicate dedup,
  bad secret 401, amount-after-expiry no-confirm, idempotent replay.
- **Flow:** place order → simulate listener POST → order becomes verified `placed` →
  Realtime event emitted (mirror existing `webhook-idempotency`/`order-creation` tests).
- **Anti-fraud:** student "I paid" without a matching credit → order is unverified and held
  in the kitchen (cannot move to preparing without staff confirm).

---

## Build order (phased)

1. DB migration: `upi_verify_paise`, `tenants` columns, `upi_credit_events`, confirm RPC.
2. Unique-amount generation in `placeOrder`; QR/charge uses final amount.
3. Listener endpoint: auth + parser + matcher + confirm path.
4. Pay panel: autoverify wait-for-confirmation + graceful fallback.
5. Kitchen board: auto-verified badge + hold/confirm for unverified.
6. Admin settings: secret/URL/MacroDroid guide/toggle + unmatched-credits view.

## Open questions

- Exact MacroDroid payload shape (header name, JSON keys) — finalize when writing the recipe.
- Grace period before the fallback "I paid" button appears (proposed 90s).
- Whether to also rotate the secret automatically on a schedule (probably not for v1).
