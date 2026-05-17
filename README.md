<div align="center">

# Tray

**Canteen ordering for college campuses.**
Mobile-first menu · UPI payment · OTP pickup · live kitchen queue · dense admin console.
One codebase, many colleges, isolated by subdomain.

[![CI](https://github.com/thribhuvan003/tray/actions/workflows/ci.yml/badge.svg)](https://github.com/thribhuvan003/tray/actions/workflows/ci.yml)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-000?logo=next.js)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-RLS-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## Table of contents

- [Overview](#overview)
- [Stack](#stack)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Order lifecycle](#order-lifecycle)
- [Routes](#routes)
- [Design decisions](#design-decisions)
- [Project layout](#project-layout)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [Security](#security)

---

## Overview

Tray serves three audiences from the same codebase, each with its own visual language:

| Portal     | Path                                            | Look                          |
| ---------- | ----------------------------------------------- | ----------------------------- |
| Student    | `/menu` · `/cart` · `/pay/[id]` · `/track/[id]` | Ocean + serif, consumer       |
| Kitchen    | `/kitchen`                                      | Cream + tomato, newspaper     |
| Admin      | `/admin/*`                                      | Graphite + chartreuse, dense  |

Multi-tenant by design — one deployment serves many colleges via subdomain (`aditya.tray.app`, `vit.tray.app`).

## Stack

- **Framework** — Next.js 15 App Router, React 19, TypeScript strict
- **Styling** — Tailwind CSS v4 (CSS-first `@theme`, three portal themes, dark mode)
- **Data** — Supabase (Postgres + RLS + Auth + Realtime)
- **Payments** — Razorpay UPI (HMAC-verified webhook + in-app simulator for dev)
- **State** — TanStack Query, Zustand (persisted cart per tenant)
- **UI** — Radix UI, Vaul, Framer Motion, Sonner, lucide-react, react-qr-code
- **Infra** — Upstash Ratelimit, Resend email, QStash scheduled jobs (graceful no-op without keys)

## Architecture

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

The application never has to remember to filter by tenant — the database does it.

## Getting started

Prerequisites: **Node 22**, **pnpm 10**, a Supabase project.

```bash
pnpm install
cp .env.example .env.local              # fill in Supabase + Razorpay keys
pnpm dev                                # http://localhost:3000
```

Subdomain-based tenants in dev:

```bash
http://aditya.localhost:3000            # subdomain
http://localhost:3000/?tenant=aditya    # query override
```

### Database

Migrations live in `supabase/migrations/`. Apply them with the Supabase CLI, then regenerate types:

```bash
supabase db push
supabase gen types typescript --project-id <project-ref> --schema public > src/lib/db/types.ts
```

## Environment variables

Required to build:

| Variable                          | Used for                |
| --------------------------------- | ----------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | Supabase REST + Auth    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Browser client          |
| `SUPABASE_SERVICE_ROLE_KEY`       | Admin/server actions    |

Optional (features degrade gracefully when absent):

| Variable                                                                   | Used for                |
| -------------------------------------------------------------------------- | ----------------------- |
| `RAZORPAY_KEY_ID` · `RAZORPAY_KEY_SECRET` · `RAZORPAY_WEBHOOK_SECRET`      | UPI payments            |
| `RESEND_API_KEY`                                                           | Transactional email     |
| `UPSTASH_REDIS_REST_URL` · `UPSTASH_REDIS_REST_TOKEN`                      | Rate limiting           |
| `QSTASH_TOKEN` · `QSTASH_CURRENT_SIGNING_KEY` · `QSTASH_NEXT_SIGNING_KEY`  | Scheduled jobs          |
| `APP_URL` · `DEFAULT_TENANT_SLUG`                                          | URL + tenant fallback   |

See `.env.example` for the full list.

## Order lifecycle

```
pending_payment ── (capture) ─► placed ── (kitchen) ─► preparing ── (ready) ─► ready ── (OTP) ─► collected
                       │                                                          │
                       └─► expired (15 min)                                       └─► rejected (refund)
```

OTP is generated in the same transaction that flips status to `ready`, stored as a bcrypt hash, and surfaced to the student via a server action that re-verifies ownership.

## Routes

| Path                                                                | Audience            | Purpose                                         |
| ------------------------------------------------------------------- | ------------------- | ----------------------------------------------- |
| `/`                                                                 | public              | Landing                                         |
| `/login` · `/signup` · `/auth/callback`                             | public              | Magic-link or password                          |
| `/menu` · `/cart` · `/pay/[id]` · `/track/[id]` · `/orders`         | student             | The full ordering flow                          |
| `/kitchen`                                                          | kitchen_staff+      | Live kanban + OTP verify                        |
| `/admin/dashboard`                                                  | canteen_admin+      | KPIs, revenue, heatmap, activity feed           |
| `/admin/menu`                                                       | canteen_admin+      | CRUD with draft / live / archived               |
| `/admin/orders`                                                     | canteen_admin+      | Filterable list + CSV export                    |
| `/admin/staff`                                                      | canteen_admin+      | Invite, revoke, list                            |
| `/admin/analytics`                                                  | canteen_admin+      | Deeper insights                                 |
| `/api/webhooks/razorpay`                                            | system              | Capture / fail / refund                         |
| `/api/admin/export/orders`                                          | canteen_admin+      | Streamed CSV                                    |

## Design decisions

Architectural choices and their rationale live in [`docs/adr/`](./docs/adr):

- [0001 — Multi-tenant via RLS](./docs/adr/0001-multi-tenant-via-rls.md)
- [0002 — OTP at "ready"](./docs/adr/0002-otp-at-ready.md)
- [0003 — QStash scheduled jobs](./docs/adr/0003-qstash-scheduled-jobs.md)

Quick highlights:

- **Auth** — Supabase Auth + a `tenant_memberships(user_id, tenant_id, role, is_active)` table, not JWT claims, so one human can be student@VIT + admin@LPU and revocation is instant.
- **Money** — Razorpay direct, canteen's own UPI VPA, Tray takes 0%. Webhook verifies HMAC-SHA256 over the raw body, idempotent via unique `raw_event_id`.
- **Realtime** — channels filter by `tenant_id`; on `visibilitychange === "visible"` the client snapshot-refetches. Realtime is never trusted as a source of truth.
- **Performance** — Server Components by default; route-level dynamic for fresh data; `tabular-nums` everywhere money or time appears.

## Project layout

```
src/
├── app/
│   ├── (public)/         marketing + auth
│   ├── (student)/        menu, cart, pay, track, orders
│   ├── (kitchen)/        live queue
│   ├── (admin)/          dashboard, menu, orders, staff, analytics
│   ├── api/              route handlers (webhooks, exports)
│   └── auth/             callbacks
├── components/           shared UI primitives
├── lib/                  env, supabase clients, tenant, auth, email
├── styles/               theme + globals
└── middleware.ts         subdomain → tenant resolution
supabase/
├── migrations/           schema + RLS
└── setup.sql             one-shot setup for a fresh project
docs/adr/                 architectural decision records
```

## Scripts

```bash
pnpm dev            # next dev
pnpm build          # next build
pnpm start          # next start
pnpm lint           # next lint
pnpm typecheck      # tsc --noEmit
```

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for branch naming, commit conventions, and the pre-PR checklist.

## Security

If you've found a vulnerability, please follow the responsible disclosure process in [`SECURITY.md`](./SECURITY.md) rather than opening a public issue.
