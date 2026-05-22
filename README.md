<div align="center">

# 🍽️ Tray — Campus canteen ordering, reimagined.

[![Live App](https://img.shields.io/badge/live-trayy.vercel.app-22c55e?style=for-the-badge&logo=vercel)](https://trayy.vercel.app)
[![Deploy to Vercel](https://img.shields.io/badge/deploy-vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/new/clone?repository-url=https://github.com/thribhuvan003/Tray)
[![License: MIT](https://img.shields.io/badge/License-MIT-3178c6?style=for-the-badge)](./LICENSE)

**Students order from their phone. The kitchen sees a live queue. The admin gets real numbers — not complaints.**  
Zero printed tokens. Zero configuration overhead. A premium college-wide dining experience.

</div>

---

## 💡 The Core Philosophy

> **"Regardless of the number of canteens, one Tray is enough."**

University dining is notoriously fragmented. Different academic blocks, food trucks, and third-party vendors run disparate, disconnected services. **Tray: Campus Edition** solves this by unifying an entire campus ecosystem under a single, highly-scalable, multi-tenant digital infrastructure. 

One single deployment serves:
* **The Student**: Ordering their hot lunch securely from their classroom desk.
* **The Kitchen Staff**: Spotting incoming preparation timers and marking food ready in real time.
* **The Administrator**: Auditing overall financial metrics and managing active menus.
* **The College Director**: Tracking consolidated campus-wide food safety and merchant payouts from a single screen.

Whether a college campus operates one student cafeteria or twenty distinct canteen blocks, **Tray scales infinitely with zero extra code, zero database duplication, and zero server re-configuration.**

---

## 🚀 Live Demo Portals

| Portal / Role | Live URL | Intended Audience |
| :--- | :--- | :--- |
| **📱 Student Ordering** | [trayy.vercel.app/c/aditya/menu](https://trayy.vercel.app/c/aditya/menu) | Mobile-responsive food ordering, payments, & status |
| **👨‍🍳 Kitchen Board** | [trayy.vercel.app/c/aditya/kitchen](https://trayy.vercel.app/c/aditya/kitchen) | Live ticket queues and preparation tracking |
| **📊 Admin Console** | [trayy.vercel.app/c/aditya/admin/dashboard](https://trayy.vercel.app/c/aditya/admin/dashboard) | Revenue tracking, visual reports, & menu management |
| **🏫 Campus Portal** | [trayy.vercel.app/college/aditya](https://trayy.vercel.app/college/aditya) | Higher-level administrative stats for college directors |
| **💡 Interactive Sandbox** | [trayy.vercel.app/demo/index.html](https://trayy.vercel.app/demo/index.html) | Standalone interactive offline mock-ups (no DB needed) |

---

## 🗺️ Repository Structure (Junior Dev Directory Map)

To make boarding and development as straightforward as possible, this directory tree maps the exact purpose of every core workspace path:

```
Tray/
├── .github/                 # GitHub CI configurations, pull request rules & codeownership
│   ├── workflows/           # Automations (Pre-merge linting, compilation, & dry-build checks)
│   ├── PULL_REQUEST_TEMPLATE.md  # Standard PR checklist for safety-critical checks (RLS, Money)
│   └── CODEOWNERS           # Auto-assigns reviewers based on sensitive paths (migrations, auth)
├── docs/                    # Architectural documents & team logs
│   ├── adr/                 # Architectural Decision Records (multi-tenancy, OTPs, cron loops)
│   └── research/            # Comparative studies (animation stack, design color palettes)
├── public/                  # Static assets & standalone pitch models
│   ├── demo/                # Offline pure HTML/JS/CSS mock-ups for lightning-fast merchant demos
│   └── design-preview/      # Local sandbox tools to test CSS animations and premium palettes
├── scripts/                 # Integrated testing & utility scripts
│   ├── test-real-backend.mjs  # Core integration test simulating student checkout → kitchen pickup
│   └── demo-verify.mjs      # Checks offline prototype code integrity
├── src/                     # Core Next.js 15 Application Source
│   ├── app/                 # Page router endpoints & directory boundaries
│   │   ├── (public)/        # Landing page, customer onboarding wizard, login gateway
│   │   ├── c/[slug]/        # Canteen-specific context (Dynamic Student Menu)
│   │   │   ├── kitchen/     # Real-time kitchen staff kiosk & security-cleared OTP gates
│   │   │   └── admin/       # Visual business metrics, item creators, and sales analytics
│   │   └── api/             # Webhook ingestion (Razorpay UPI, automatic cleanup crons)
│   ├── components/          # Reusable component files organized by portal theme
│   ├── lib/                 # Shared logic (Supabase client setups, middleware helpers, hooks)
│   └── middleware.ts        # Subdomain-based resolver routing hostnames to tenant contexts
└── supabase/                # PostgreSQL schema & database config
    └── migrations/          # Chronological DB migrations (tables, view matrices, security RLS)
```

---

## 🏗️ Technical Architecture Highlights

Tray uses a state-of-the-art tech stack selected for sub-second latency, security, and developer productivity:

### 1. Multi-Tenancy via Postgres Row Level Security (RLS)
Instead of error-prone application-layer filtering (`WHERE tenant_id = ...`), separation is enforced directly inside the database. The `middleware.ts` extracts the request tenant context, sets the database session parameters, and PostgreSQL limits row visibility automatically.
* **Benefit**: Zero cross-tenant data leaks. A developer query without a tenant clause is automatically secure.

### 2. Live State Updates via Event-Sourced Realtime Streams
To save write amplification (WAL replication overhead) at high volumes, database order updates are fed into a lightweight `order_events` log instead of constantly updating massive order rows. Connected clients listen via a standard WebSocket fan-out.
* **Benefit**: Student orders sync to the kitchen queue in under **300ms**.

### 3. Idempotent Payments & Secure Handshake
Razorpay UPI integrations generate single-use QR codes. Webhooks use transaction-level conflict-resolution keys (`ON CONFLICT (razorpay_order_id) DO UPDATE`). If the payment goes through but the kitchen cancels the item, an automatic refund is triggered instantly via Razorpay APIs.
* **Benefit**: No double-payments, resilient network error recovery, and zero manual administrative headache.

---

## 🛠️ Local Development & Setup

### Prerequisites
* **Node.js** v22+
* **pnpm** v10+ (Standard lockfile manager used by CI)
* **Supabase CLI** (For database schema syncing)

### 1. Installation
Clone the repository and install the standard dependencies:
```bash
git clone https://github.com/thribhuvan003/Tray.git
cd Tray
pnpm install
```

### 2. Configure Environment Variables
Copy the template file to set up local environment parameters:
```bash
cp .env.example .env.local
```
Fill in your Supabase variables in `.env.local`:
* `NEXT_PUBLIC_SUPABASE_URL`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* `SUPABASE_SERVICE_ROLE_KEY`

*(Optional integration keys like Razorpay, Resend, or Upstash can be left blank; the application will gracefully run in Simulation Mode).*

### 3. Synced Database
Push migrations to your local Postgres / Supabase instance:
```bash
supabase db push
```

### 4. Running the Dev Server
Launch Next.js:
```bash
pnpm dev
```
Open **[http://aditya.localhost:3000](http://aditya.localhost:3000)** (or **`http://localhost:3000/?tenant=aditya`**) to view the pre-seeded Aditya College Canteen.

---

## 🧪 Integrated Quality Tests

Before opening a pull request, run the local quality gate suite to ensure strict compilation standards are met:

```bash
pnpm typecheck          # Rigorous TypeScript verification
pnpm lint               # React rules & linting checks
pnpm build              # Compiles Next.js deployment output
pnpm demo:verify        # Validates offline pitch mockup integrity
```

---

## 🚀 One-Click Cloud Deployment

Deploy the Next.js frontend to **Vercel** immediately:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/thribhuvan003/Tray&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY&envDescription=Supabase%20project%20keys&envLink=https://supabase.com/dashboard/project/_/settings/api)

*Note: Following Vercel deployment, execute `supabase db push` against your project database to finalize your production schema.*

---

<div align="center">

Built for modern college campuses &nbsp;·&nbsp; Made with ❤️ in India  
Licensed under the [MIT License](./LICENSE)

</div>
