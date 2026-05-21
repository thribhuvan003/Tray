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

## Cursor Cloud specific instructions

### Services

| Service | How to run | Notes |
| ------- | ---------- | ----- |
| Next.js dev server | `pnpm dev` | Serves all portals on `localhost:3000` |

Use `?tenant=aditya` query param for local subdomain simulation (e.g. `http://localhost:3000/menu?tenant=aditya`).

### Verification commands

See `package.json` scripts — the key ones:
- `pnpm lint` — ESLint via Next.js
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm build` — full production build

### Environment

- **Node 22 + pnpm 10** are required (matches CI).
- `.env.local` must exist with at minimum `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. These are injected as Cloud Agent secrets.
- Optional services (Razorpay, Resend, Upstash Redis, QStash) degrade gracefully when their env vars are blank.
- The `pnpm install` warning about ignored build scripts for `sharp` and `unrs-resolver` is harmless — no action needed.

### Gotchas

- Kitchen (`/kitchen`) and Admin (`/admin/*`) routes require authentication — they redirect to login when not logged in. This is expected behavior, not an error.
- The default branch is `main`. Always work from `main` unless told otherwise.
