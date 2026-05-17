# Tray

A canteen ordering system for college campuses. Mobile-first menu, UPI payment, OTP pickup, real-time kitchen queue, dense admin console. Multi-tenant by design — one codebase serves many colleges via subdomain (`aditya.tray.app`, `vit.tray.app`).

```
Student     /menu /cart /pay/[id] /track/[id] /orders   ocean + serif consumer
Kitchen     /kitchen                                    cream + tomato newspaper
Admin       /admin/{dashboard,menu,orders,staff,…}     graphite + chartreuse terminal
```

## Stack

- **Next.js 15** App Router · React 19 · TypeScript strict
- **Tailwind CSS v4** (CSS-first @theme, single token system, three portal themes)
- **Supabase** — Postgres + RLS + Auth + Realtime (`canteenflow`, ap-northeast-1)
- **Razorpay** UPI (test-mode) with HMAC-verified webhook + an in-app simulator for dev
- **TanStack Query**, **Zustand** (persisted cart per tenant), **Framer Motion**, **Radix UI**, **Vaul**, **Sonner**, **lucide-react**, **react-qr-code**, **bcryptjs**
- **Upstash Ratelimit** + **Resend** with no-op fallbacks until keys are provided
- Dark mode end-to-end (light / dark / system)

## Multi-tenancy

Every tenant-scoped row carries `tenant_id`. The browser/server sends `x-tenant-id` on every PostgREST request; a Postgres `pre_request` hook installs it into `app.current_tenant`, which RLS keys off of:

```
subdomain → middleware → tenant slug → resolve_tenant() → x-tenant-id header
                                                              ↓
                                                         pre_request hook
                                                              ↓
                                                  set_config('app.current_tenant')
                                                              ↓
                                                         RLS policies
```

This means the application never has to remember to filter by tenant — the database does it.

## Setup

```bash
pnpm install
cp .env.example .env.local              # fill in Supabase + Razorpay keys
pnpm dev                                # http://localhost:3000
# subdomain-based tenants in dev:       http://aditya.localhost:3000
# or override:                          http://localhost:3000/?tenant=aditya
```

Migrations live in `supabase/migrations/` and are applied to the linked project. Types are generated from the live DB:

```bash
supabase gen types typescript --project-id mepowrsrbjddaqfvzvtc --schema public > src/lib/db/types.ts
```

## Order lifecycle

```
pending_payment ── (capture) ─► placed ── (kitchen) ─► preparing ── (ready) ─► ready ── (OTP) ─► collected
                       │                                                          │
                       └─► expired (15 min)                                       └─► rejected (refund)
```

OTP is generated in the same transaction that flips status to `ready`, stored as a bcrypt hash, and surfaced to the student via a server action that re-verifies ownership.

## Stripe of decisions

- **Auth model**: Supabase Auth + a `tenant_memberships(user_id, tenant_id, role, is_active)` table — not JWT claims, so the same human can be student@VIT + admin@LPU and revocation is instant.
- **Money**: Razorpay direct, canteen's own UPI VPA, Tray takes 0%. Webhook verifies HMAC-SHA256 over the raw body, idempotent via unique `raw_event_id`.
- **Realtime**: subscribed channels filter by `tenant_id`. On `visibilitychange === "visible"` the client snapshot-refetches — we never trust Realtime as a source of truth.
- **Performance**: Server Components by default; route-level dynamic for fresh data; tabular-nums everywhere money or time appears.

## Routes

| Path | Who | What |
| --- | --- | --- |
| `/` | public | Landing |
| `/login`, `/signup`, `/auth/callback` | public | Magic-link or password |
| `/menu`, `/cart` (drawer), `/pay/[id]`, `/track/[id]`, `/orders` | student | The full ordering flow |
| `/kitchen` | kitchen_staff+ | Live kanban + OTP verify |
| `/admin/dashboard` | canteen_admin+ | KPIs, revenue, heatmap, activity feed, top items |
| `/admin/menu` | canteen_admin+ | CRUD with draft/live/archived |
| `/admin/orders` | canteen_admin+ | Filterable list + CSV export |
| `/admin/staff` | canteen_admin+ | Invite, revoke, list |
| `/admin/analytics` | canteen_admin+ | Deeper insights |
| `/api/webhooks/razorpay` | system | Capture / fail / refund |
| `/api/admin/export/orders` | canteen_admin+ | Streamed CSV |
