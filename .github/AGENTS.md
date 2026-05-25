# Agent context — Tray

Read **`docs/PARALLEL-WORK.md`** and **`docs/DEMO-SPEC.md`** before planning or coding. The user runs **multiple AI sessions in parallel**; those files are the canonical cross-chat state and F1 feature checklist.

## Project (30s)

- **Tray** — multi-tenant college canteen ordering (student / kitchen / admin portals).
- **Stack:** Next.js 15, React 19, Supabase (RLS), Razorpay, Tailwind v4.
- **Tenancy:** subdomain → `x-tenant-id` → Postgres `app.current_tenant` → RLS.

## Must-read in repo

| File | Why |
| ---- | --- |
| `README.md` | Architecture, routes, order lifecycle |
| `docs/adr/*.md` | Recorded decisions |
| `docs/PARALLEL-WORK.md` | Cross-session work, blockers, parallel tracks |
| `CONTRIBUTING.md` | Branch naming, RLS/money checklist |

## Parallel-work rules

1. After meaningful work in any chat, append a dated entry to `docs/PARALLEL-WORK.md` (session log + active tracks).
2. Do not assume other chats’ context — verify in repo or ask.
3. If a decision is final, add an ADR under `docs/adr/` or implement it; remove from “Decisions (not yet in code)”.

## Sensitive areas (extra care)

- RLS / migrations — all roles: student, kitchen_staff, canteen_admin, super_admin
- Razorpay webhooks — HMAC + idempotency
- Money / order status transitions
