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

### Services & commands

| Task | Command |
| ---- | ------- |
| Install deps | `pnpm install` |
| Dev server | `pnpm dev` (http://localhost:3000) |
| Lint | `pnpm lint` |
| Type check | `pnpm typecheck` |
| Production build | `pnpm build` |

### Dev tenant access

Subdomain-based tenancy doesn't work out of the box in Cloud VMs. Use the query-parameter fallback instead:

```
http://localhost:3000/?tenant=aditya
http://localhost:3000/menu?tenant=aditya
```

The default tenant slug is `aditya` (set via `DEFAULT_TENANT_SLUG` env var).

### Environment variables

All required secrets (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are injected as VM environment variables. Create `.env.local` from `.env.example` and populate from the environment if it doesn't exist. Optional services (Razorpay, Resend, Upstash, QStash) degrade gracefully when keys are absent.

### Authentication-protected routes

`/kitchen`, `/admin/*` redirect to `/login` when unauthenticated. To test these portals you need a Supabase Auth session with the appropriate `tenant_memberships` role (`kitchen_staff`, `canteen_admin`, or `super_admin`).

### Build scripts warning

pnpm may warn about ignored build scripts for `sharp` and `unrs-resolver`. This is expected and does not affect functionality.
