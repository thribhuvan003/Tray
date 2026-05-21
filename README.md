<div align="center">

# Tray — Campus canteen ordering, reimagined.

[![Live](https://img.shields.io/badge/live-trayy.vercel.app-22c55e?style=flat-square)](https://trayy.vercel.app)
[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/thribhuvan003/Tray)
[![License: MIT](https://img.shields.io/badge/License-MIT-3178c6?style=flat-square)](./LICENSE)

**Students order from their phone. The kitchen sees a live queue. The admin gets real numbers — not complaints.**  
One deployment, any college, zero printed tokens.

</div>

---

## Live Demo

| Portal | URL | Who uses it |
|--------|-----|-------------|
| Student app | [trayy.vercel.app/c/aditya/menu](https://trayy.vercel.app/c/aditya/menu) | Students ordering |
| Kitchen board | [trayy.vercel.app/c/aditya/kitchen](https://trayy.vercel.app/c/aditya/kitchen) | Kitchen staff |
| Admin console | [trayy.vercel.app/c/aditya/admin/dashboard](https://trayy.vercel.app/c/aditya/admin/dashboard) | Canteen owner |
| College portal | [trayy.vercel.app/college/aditya](https://trayy.vercel.app/college/aditya) | College director |
| Demo flows | [trayy.vercel.app/demo/index.html](https://trayy.vercel.app/demo/index.html) | Quick preview |

No sign-up. No install. Open and explore.

---

## What it does

- **Students** browse today's menu on their phone, pay by UPI, and collect with a 4-digit OTP — they walk straight to the counter and skip the queue entirely.
- **Kitchen staff** see every incoming ticket on a live board with prep timers. Push a daily special and it lands on every student's menu in under 300 ms.
- **Admins** get daily revenue, peak-hour heatmaps, top items, and full audit trail — all live, all in one screen, per canteen.

---

## Architecture (the interesting part)

- **Multi-tenant:** 1 college → N canteens. Every DB row carries a `tenant_id`. Postgres RLS enforces isolation at the query level — no app-layer filtering, no cross-tenant leaks. New college = one row in `colleges`, one in `canteens`. Zero config per tenant.
- **Realtime:** Orders flow through an append-only `order_events` table (not REPLICA IDENTITY FULL — see Engineering Decisions below). Supabase Realtime subscribes to INSERT-only events and fans out to all connected clients via WebSocket. Students see live status. Kitchen sees live queue. Admin sees live revenue.
- **Payments:** Razorpay UPI generates a single-use QR per order. The webhook endpoint does an idempotent upsert keyed on `razorpay_order_id` — duplicate delivery is a no-op. Kitchen rejection triggers a refund via the Razorpay Refund API in the same webhook handler. Auto-expiry at 15 minutes via a QStash cron.
- **Auth:** Magic link email → Supabase Auth session → auto-enrolled in all canteens for the student's college (trigger on `auth.users`). Kitchen staff skip email entirely — they log in with a rotating 6-digit PIN issued per shift.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript strict |
| Styling | Tailwind CSS v4 — three separate portal design tokens |
| Database | Supabase (Postgres) — Row Level Security for multi-tenancy |
| Auth | Supabase Auth — magic link for students, PIN kiosk for kitchen |
| Realtime | Supabase Realtime — WebSocket fan-out from `order_events` |
| Payments | Razorpay UPI — HMAC-verified webhooks, no card data stored |
| State | TanStack Query + Zustand (cart persisted per user) |
| UI | Radix UI · Framer Motion · Vaul · Sonner · Lucide |
| Infra | Upstash Redis (rate limiting) · Resend (email) · QStash (cron) |
| Deployment | Vercel Edge — `middleware.ts` handles subdomain → tenant resolution |

---

## Key Engineering Decisions

**1. `order_events` instead of REPLICA IDENTITY FULL on the `orders` table**  
At 1,000 orders/day, full-row WAL replication writes the entire row on every status update — 4 writes per order lifecycle means 4× the WAL volume. An append-only events log writes one row per state transition, O(1) per write regardless of row width. Supabase Realtime subscribes to INSERT events only, which keeps the subscription filter trivial and eliminates noise from unrelated column updates.

**2. RLS over application-layer tenant filtering**  
Every query runs as the authenticated user role. RLS policies match `tenant_id = auth.jwt() ->> 'tenant_id'`. There is no `WHERE tenant_id = ?` scattered across the codebase — the database enforces it. This means a mis-scoped query returns zero rows rather than leaking data, and adding a new canteen requires no code change.

**3. Idempotent webhook upsert keyed on `razorpay_order_id`**  
Razorpay delivers webhooks at-least-once. The handler does `INSERT ... ON CONFLICT (razorpay_order_id) DO UPDATE SET status = EXCLUDED.status` — the second delivery is a no-op with no side effects. Refunds are only triggered on `payment.captured → kitchen.rejected` transitions stored in `order_events`, preventing double-refunds on retry.

**4. Subdomain-based tenant resolution in `middleware.ts`, not route params**  
`aditya.trayy.vercel.app` and `?tenant=aditya` both resolve to the same tenant context before any route handler runs. This keeps route handlers tenant-unaware — they read `tenant_id` from the request context, not the URL. New subdomains are wildcard-matched on Vercel; no DNS config needed per college.

---

## Getting Started

### Prerequisites

- Node 22+
- pnpm 10+
- A [Supabase](https://supabase.com) project (free tier works)
- A [Razorpay](https://razorpay.com) account (optional — payments skip gracefully without it)

### Clone and install

```bash
git clone https://github.com/thribhuvan003/Tray.git
cd Tray
pnpm install
cp .env.example .env.local
```

### Set up Supabase

Push migrations to your Supabase project:

```bash
supabase db push
```

Migrations live in `supabase/migrations/`. Run once on a fresh project — they create the schema, RLS policies, and seed the `aditya` demo tenant.

### Configure env vars

**Required:**

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin key |

**Optional** (features skip gracefully without these):

| Variable | Feature |
|----------|---------|
| `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` + `RAZORPAY_WEBHOOK_SECRET` | UPI payments |
| `RESEND_API_KEY` | Magic link email |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | Rate limiting |
| `QSTASH_TOKEN` + signing keys | Order expiry cron |

See [`.env.example`](./.env.example) for the full list.

### Run

```bash
pnpm dev    # → http://localhost:3000
```

For multi-tenant local dev, use `http://aditya.localhost:3000` or append `?tenant=aditya`.

---

## Project structure

```
src/
├── app/
│   ├── (public)/       landing, login, signup
│   ├── c/[slug]/       student menu, cart, payment, order tracking
│   ├── c/[slug]/kitchen/   live order queue + OTP verify
│   ├── c/[slug]/admin/ dashboard, menu manager, orders, analytics
│   └── api/            Razorpay webhooks, CSV export
├── components/         portal UI + shared components
├── lib/                Supabase clients, auth helpers, tenant context
└── middleware.ts       subdomain → tenant_id resolution

supabase/
└── migrations/         Postgres schema + RLS policies (source of truth)
```

---

## One-click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/thribhuvan003/Tray&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY&envDescription=Supabase%20project%20keys&envLink=https://supabase.com/dashboard/project/_/settings/api)

After deploy: run `supabase db push` against your project to apply the schema.

---

## License

MIT — see [LICENSE](./LICENSE).

---

<div align="center">

Built for college campuses &nbsp;·&nbsp; Made in India

</div>
