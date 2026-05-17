# ADR 0002: OTP issuance at `ready`, bcrypt hash + ephemeral plaintext

## Context
Pickup OTPs need to be verifiable at the counter (kitchen staff sees the entered code) and viewable on the student's phone, without ever being exfiltratable from a stolen database snapshot.

## Decision
When the kitchen flips an order from `preparing` → `ready`, the server action atomically:
1. Generates a random 4-digit OTP.
2. Stores `bcrypt.hash(otp, 10)` in `orders.otp_hash`.
3. Embeds the plaintext OTP in `orders.notes` as a JSON blob (`{ "_otp": "1234" }`), readable only via a server action that re-verifies `auth.uid() = orders.user_id`.
4. On `verifyAndCollect`, bcrypt-compares the entered code. Three wrong attempts locks the order.
5. On successful collection the plaintext is stripped from `notes` and `notes` is set back to `null` (or to the customer's note JSON, with `_otp` removed).

## Consequences
- A DB dump alone does not yield usable OTPs after collection (only the hash remains).
- The plaintext window is bounded by the time between `ready` and `collected`.
- TODO (Phase 2): move the plaintext into a signed cookie keyed by order id, or into a transient `_ready_otps` table purged on collection. The current pattern is a pragmatic v1.
