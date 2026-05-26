<div align="center">

# Tray

**Institutional food ordering infrastructure.**  
One deployment. Any number of colleges, canteens, or campuses. Every stakeholder gets their own portal the moment they sign up.

[![Live](https://img.shields.io/badge/live-trayy.vercel.app-22c55e?style=flat-square&logo=vercel)](https://trayy.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-gray?style=flat-square)](./LICENSE)

</div>

---

## What it is

Tray is a multi-tenant SaaS platform that replaces paper tokens and queues at institutional food counters. A new canteen owner signs up, adds their menu, and immediately has:

- A **student-facing ordering app** at their own URL
- A **live kitchen board** for their staff
- A **business dashboard** with revenue, analytics, and order management
- **Instant UPI payments** going directly to their bank account

No IT team. No per-tenant infrastructure. The system handles everything.

---

## Live demo

| Portal | URL | For |
|--------|-----|-----|
| Student app | [trayy.vercel.app/c/aditya/menu](https://trayy.vercel.app/c/aditya/menu) | Students ordering |
| Kitchen board | [trayy.vercel.app/c/aditya/kitchen](https://trayy.vercel.app/c/aditya/kitchen) | Kitchen staff |
| Admin console | [trayy.vercel.app/c/aditya/admin/dashboard](https://trayy.vercel.app/c/aditya/admin/dashboard) | Canteen owner |
| College portal | [trayy.vercel.app/college/aditya](https://trayy.vercel.app/college/aditya) | College director |

No sign-up required to explore.

---

## The problem it solves

At any institution with a captive audience and a food counter — a college campus, a hospital cafeteria, a stadium concession stand, an airport lounge, a corporate office — the same bottleneck exists:

- Staff write orders on paper
- Students queue for 20 minutes during lunch hour
- Owners have no idea what sold, what didn't, or when peak hours hit
- Payment is cash, change is slow, errors are common

Tray eliminates all of it. The system is designed for real institutional conditions: 300+ orders per hour, wet hands on cheap Android tablets, flaky campus WiFi, and students who close the app immediately after paying.

---

## Architecture

### Multi-tenancy

Every database row carries a `tenant_id`. Postgres Row Level Security enforces isolation at the query layer — not the application layer. There is no `WHERE tenant_id = ?` scattered across the codebase. A mis-scoped query returns zero rows; it cannot leak data to another tenant.

Adding a college: one row in `colleges`, one row in `tenants`. Zero code changes. Zero infrastructure. The new tenant's portals are live immediately.

A single Vercel deployment serves **N colleges**, each with **M canteens per college**, each with their own URL, menu, payments, and dashboard.

### Routing

Tenants are resolved from the URL path before any page handler runs:

```
/c/[slug]/menu          →  student ordering app for that canteen
/c/[slug]/kitchen       →  live queue board
/c/[slug]/admin/...     →  business dashboard
/college/[slug]         →  college-level multi-canteen view
```

`middleware.ts` extracts the slug, resolves the tenant, and injects `x-tenant-slug` into every downstream request header. Route handlers and server actions are tenant-unaware — they read context, not URLs.

Custom domains are supported via subdomain routing. `canteen.yourcollege.edu` resolves the same way via `tenantSlugFromHost()`.

### Payments

Students pay the **canteen owner directly** via UPI — Tray is never in the payment flow.

1. Student places order → Razorpay order created, linked to canteen's UPI VPA
2. Mobile: `upi://` deep link opens GPay / PhonePe / Paytm directly
3. Desktop: QR code rendered from the canteen's live UPI ID
4. Razorpay fires `payment.captured` → HMAC-SHA256 verified → `safe_capture_payment()` Postgres function acquires a `FOR UPDATE` row lock and captures atomically
5. Order appears in kitchen queue in under 1 second

The webhook is idempotent: a `raw_event_id` unique constraint on `payments` makes any duplicate delivery a database no-op. Failed webhooks write to a Dead Letter Queue. A daily reconciliation cron cross-checks every `pending_payment` order against Razorpay's API.

### Realtime

Order state propagates through an append-only `order_events` table. Kitchen boards and admin dashboards subscribe to `INSERT` events via Supabase Realtime WebSockets:

```
payment.captured webhook
  → orders.status = 'placed'
  → order_events INSERT
    → kitchen board refresh   (< 1 second)
    → admin KPI update        (< 1 second)
    → student track page      (< 1 second)
```

All three portals stay in sync. A 20-second poll fallback and exponential-backoff reconnect (900ms base, 30s cap, ±400ms jitter) guarantee the kitchen board survives 30–60 second WiFi drops without losing context or forcing a full reload.

### Why the same architecture works beyond campuses

The domain model is intentionally generic:

| Institution | "Tenant" | "Customer" | "Kitchen" |
|-------------|----------|-----------|-----------|
| College | Canteen | Student | Cook |
| Hospital | Cafeteria | Staff / visitor | Kitchen |
| Stadium | Concession stand | Fan | Counter staff |
| Airport | Lounge F&B | Passenger | Galley |
| Corporate | Office canteen | Employee | Kitchen |

Every one of these is: a captive audience, a food counter, UPI payments, a live queue, and an owner who wants numbers. The schema, payment flow, and queue logic are identical. Only the copy changes.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 App Router + React 19 + TypeScript strict |
| Database | Supabase Postgres — Row Level Security, multi-tenant by design |
| Auth | Supabase Auth — magic link for students, PIN kiosk for kitchen staff |
| Realtime | Supabase Realtime — WebSocket fan-out from `order_events` INSERT |
| Payments | Razorpay UPI — HMAC webhooks, direct bank settlement, no card data stored |
| Styling | Tailwind CSS v4 — separate design tokens per portal |
| State | Zustand (cart, per-tenant bucket) + TanStack Query (server state) |
| Animation | Framer Motion + GSAP |
| UI primitives | Radix UI + Vaul + Sonner + Lucide |
| Rate limiting | Upstash Redis — per-IP and per-tenant, with in-memory fallback |
| Background jobs | QStash — order expiry at 15 min, daily payment reconciliation |
| Email | Resend — magic link delivery |
| Logging | Structured JSON logger — `order_id`, `tenant_id`, `payment_id` on every line |
| Deployment | Vercel — edge middleware for tenant resolution, zero config |

---

## Portals

### Student `/c/[slug]/`

- Browse menu with live availability, search, and veg/egg/nonveg filters
- Cart with takeaway or dine-in selection, persisted per canteen
- UPI deep link to GPay/PhonePe/Paytm (mobile) or QR code (desktop)
- Real-time order tracking: Placed → Preparing → Ready → Collected
- 4-digit OTP handover at the counter with 3-attempt lockout
- 5-minute cancel window with automatic refund
- Order history with status labels and re-order links

### Kitchen board `/c/[slug]/kitchen`

- Four-column live queue: Incoming → Preparing → Ready → Collected
- 44–56px tap targets designed for wet or gloved hands on low-end tablets
- 5-second undo bar after any status advance — one tap reverses a mistake
- Order rejection with selectable reason + free text; refund triggered automatically
- Prep totals: aggregated quantities across active orders (e.g. "7× Biryani")
- One-tap SOLD OUT per item; updates student menu in under 300ms
- Walk-in orders: search or browse menu, add to cart, place cash order from the board
- New-order bell chime with mute toggle
- Three-state connection indicator: Online / Reconnecting / OFFLINE
- Exponential backoff reconnect; 20-second poll fallback; survives WiFi drops
- Session expiry overlay with one-tap re-login — orders are never lost
- PIN kiosk for shift-based staff login

### Admin console `/c/[slug]/admin/`

- Live KPIs: revenue, orders, avg ticket, avg pickup — all vs. same time last week
- 7-day revenue chart and peak-hour heatmap
- Top items by volume
- Real-time activity feed
- Menu management: add, edit, toggle availability, categories, sort order
- Order management: full history, cancel any active order with logged reason
- Staff management: invite by email, manage PIN access
- Settings: UPI VPA, canteen name, opening hours, pause/unpause
- CSV export with date range filter

### College portal `/college/[slug]/`

- Multi-canteen view for a college director
- Live order counts and open/close toggle per outlet
- College-level reports

---

## Project structure

```
tray/
├── src/
│   ├── app/
│   │   ├── (admin)/              Admin portal route group
│   │   │   ├── admin/
│   │   │   │   ├── _actions.ts   Server actions: menu, orders, staff, settings
│   │   │   │   ├── analytics/    Analytics & KPI page
│   │   │   │   ├── dashboard/    Main dashboard with live KPIs
│   │   │   │   ├── menu/         Menu management (list, new, edit)
│   │   │   │   ├── orders/       Order history & management
│   │   │   │   ├── settings/     Canteen settings & UPI ID
│   │   │   │   └── staff/        Staff invites & PIN management
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (kitchen)/            Kitchen portal route group
│   │   │   ├── _actions.ts       markPreparing, markReady, rejectOrder, revertStatus, createWalkInOrder
│   │   │   ├── kitchen/
│   │   │   │   ├── page.tsx      Live queue board (force-dynamic)
│   │   │   │   ├── history/      Today's completed orders
│   │   │   │   └── staff-select/ PIN kiosk login
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (student)/            Student portal route group
│   │   │   ├── _actions.ts       placeOrder, cancelOrder, verifyPayment, getOtp, initiateRefund
│   │   │   ├── menu/             Menu browse
│   │   │   ├── orders/           Order history
│   │   │   ├── pay/[orderId]/    UPI payment screen
│   │   │   └── track/[orderId]/  Live order tracking + OTP display
│   │   │
│   │   ├── (public)/             Unauthenticated pages
│   │   │   ├── login/            Email magic link
│   │   │   ├── signup/           New student signup
│   │   │   └── legal/            Terms of service, Privacy policy
│   │   │
│   │   ├── api/
│   │   │   ├── health/           GET — DB connectivity check for uptime monitors
│   │   │   ├── admin/export/orders/  GET — tenant-scoped CSV export (auth-gated)
│   │   │   ├── cron/
│   │   │   │   ├── expire-orders/    QStash: expire unpaid orders at 15 min
│   │   │   │   └── reconcile-payments/ QStash: daily DB vs Razorpay reconcile
│   │   │   └── webhooks/razorpay/ POST — HMAC-verified payment events
│   │   │
│   │   ├── auth/                 Supabase auth callbacks + staff invite handler
│   │   ├── c/[slug]/             Canteen entry + paused-countdown
│   │   ├── college/[slug]/       College multi-canteen portal
│   │   ├── college-admin/        College director dashboard
│   │   ├── get-started/          Self-serve onboarding wizard
│   │   └── page.tsx              Landing page
│   │
│   ├── components/
│   │   ├── portal-admin/         Dashboard, KPI cards, charts, heatmap, activity feed
│   │   ├── portal-kitchen/       Board, order columns, OTP dialog, walk-in dialog
│   │   ├── portal-student/       Menu board, cart drawer, pay panel, track panel
│   │   ├── landing/              Landing page sections and animations
│   │   └── ui/                   Button, input, badge, theme toggle
│   │
│   ├── lib/
│   │   ├── auth/get-user.ts      Session resolution + role checks
│   │   ├── cart/store.ts         Zustand cart — per-tenant bucket, localStorage
│   │   ├── db/types.ts           Generated Supabase TypeScript types
│   │   ├── email/resend.ts       Transactional email (magic link)
│   │   ├── payments/
│   │   │   ├── razorpay.ts       Order creation + HMAC signature verification
│   │   │   └── upi.ts            UPI QR / deep link payload generator
│   │   ├── rate-limit/           Upstash Redis rate limiting, in-memory fallback
│   │   ├── student/pickup-eta.ts ETA estimation from order history
│   │   ├── supabase/
│   │   │   ├── admin.ts          Service-role admin client
│   │   │   ├── browser.ts        SSR cookie-aware browser client
│   │   │   └── server.ts         Server RSC client
│   │   ├── env.ts                Validated environment variables (zod)
│   │   ├── logging.ts            Structured JSON logger
│   │   ├── tenant.ts             Tenant resolution + caching
│   │   └── utils.ts              Date, currency, className utilities
│   │
│   └── middleware.ts             Path-based tenant resolution → x-tenant-slug header
│
├── supabase/
│   └── migrations/
│       ├── 0001_init.sql                              Core schema
│       ├── 0002_rls.sql                               Row Level Security policies
│       ├── 0003_realtime_seed.sql                     Realtime publication
│       ├── 0006_security.sql                          Security hardening
│       ├── 0007_fix_rls_membership_recursion.sql      RLS recursion fix
│       ├── 0008_harden_function_search_paths.sql      Function search path security
│       ├── 0009_multi_canteen_foundation.sql          Multi-canteen schema
│       ├── 0009a_enum_extensions.sql                  Status enum extensions
│       ├── 0010_rls_multi_canteen.sql                 Multi-canteen RLS
│       ├── 0011_realtime_order_events.sql             order_events publication
│       ├── 0012_idempotency_ledger_and_webhook_dlq.sql  Idempotency + Dead Letter Queue
│       ├── 0013_payment_failed_status.sql             payment_failed status
│       └── 0014_safe_capture_and_walkin.sql           Atomic payment capture + walk-in
│
├── design-system/                Design tokens and portal-specific CSS variables
├── docs/                         Architecture decision records
├── public/                       Static assets, icons, OG images
├── vercel.json                   Cron job schedule (QStash)
├── next.config.ts
└── tsconfig.json
```

---

## Key engineering decisions

**Append-only `order_events` instead of `REPLICA IDENTITY FULL` on `orders`**
Full-row WAL replication writes the entire row on every column update. Four status transitions per order = 4× the WAL volume. An append-only events log writes one row per transition. Realtime subscribes to INSERT events only — no noise from unrelated column updates, no duplicates.

**Postgres RLS over application-layer filtering**
Every query runs under the authenticated user's role. RLS policies enforce `tenant_id = auth.jwt() ->> 'tenant_id'`. A mis-scoped query returns zero rows, not another tenant's data. Adding a new canteen requires no code change.

**`safe_capture_payment()` — atomic row-locked capture**
The webhook calls a `SECURITY DEFINER` Postgres function that does `SELECT ... FOR UPDATE` before updating the order status. This guarantees atomicity under thundering-herd webhook retries. The `raw_event_id` unique constraint on `payments` makes the operation fully idempotent — duplicate delivery is a database no-op.

**Per-tenant cart bucket in `localStorage`**
A student browsing two canteens from the same college keeps a separate cart for each. `ensureTenant()` saves the outgoing cart state and loads the incoming one — switching canteens never clears or mixes a cart.

**`middleware.ts` resolves tenant before any handler runs**
No route handler parses a URL for tenant context. They all read `x-tenant-slug` from the request header. This makes handlers testable in isolation and keeps the tenant resolution logic in one place.

---

## Local setup

### Prerequisites

- Node.js 22+
- pnpm 10+
- Supabase project (free tier works)
- Razorpay account (optional — dev sim mode available)

### Steps

```bash
git clone https://github.com/thribhuvan003/Tray.git
cd Tray
pnpm install
cp .env.example .env.local
# fill in .env.local
supabase db push
pnpm dev
```

Open `http://localhost:3000/c/aditya/menu`.

### Environment variables

**Required:**

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin key |

**Optional:**

| Variable | Feature |
|----------|---------|
| `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` + `RAZORPAY_WEBHOOK_SECRET` | Live UPI payments |
| `NEXT_PUBLIC_RAZORPAY_LIVE=true` | Hides the dev simulate button in production |
| `RESEND_API_KEY` | Magic link email delivery |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | Rate limiting |
| `QSTASH_TOKEN` + signing keys | Order expiry + reconciliation cron |

---

## Deployment

### One-click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/thribhuvan003/Tray&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY)

After deploy: `supabase db push` against your project, then visit `/c/your-canteen-slug/menu`.

### Adding a canteen

No code changes required. One SQL insert:

```sql
INSERT INTO tenants (slug, name, college_id, upi_vpa)
VALUES ('block-b', 'Block B Canteen', 'your-college-id', 'canteen@upi');
```

The portals are live at `/c/block-b/menu`, `/c/block-b/kitchen`, and `/c/block-b/admin/dashboard` immediately.

### Webhook setup

Register `https://your-domain/api/webhooks/razorpay` in the Razorpay dashboard. Required events: `payment.captured`, `payment.authorized`, `payment.failed`.

### Uptime monitoring

`GET /api/health` returns `{"ok":true,"db":"ok"}` when healthy, `503` when the database is unreachable. Point UptimeRobot or Better Uptime at this endpoint.

---

## Contributors

| | Name | Role |
|-|------|------|
| [@thribhuvan003](https://github.com/thribhuvan003) | Thribhuvan | Creator & engineer |
| [Cursor](https://cursor.com) | Cursor | AI pair programmer |

---

## License

MIT — see [LICENSE](./LICENSE).

---

<div align="center">

Built in India &nbsp;·&nbsp; Works anywhere there is a queue and a counter

</div>
