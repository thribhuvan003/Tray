# 🛠️ Contributing to Tray — Professional Engineering Guide
> **Standards:** Google & Apple Engineering Repository Standards.

Welcome! This repository maintains the highest standard of software quality, safety, performance, and scalability. This manual dictates the rules, checklists, and testing protocols required to contribute to **Tray**.

All changes must satisfy strict verification constraints before integration into the `main` branch.

---

## 🗺️ 1. Development Lifecycle & Git Workflow

### 🌿 A. Branch Architecture
We follow a structured branching model. All work must be isolated to descriptive branches branched directly from `main`:

```
[type]/[scope]-[short-description]
```

#### Allowed Namespaces:
*   `feat/`      - Introduces a new feature or capability.
*   `fix/`       - Resolves a bug, crash, or regression.
*   `refactor/`  - Code adjustments that neither fix a bug nor add a feature (e.g., decoupling components).
*   `perf/`      - Performance optimizations.
*   `chore/`     - Tooling, dependencies, scaffolding, or build configurations.
*   `docs/`      - Documentation adjustments.

*Example:* `feat/student-veg-lane-filter` or `fix/auth-login-loop-referrer`.

---

### 📝 B. Commit Message Guidelines (Conventional Commits)
Commits must be structured using the Conventional Commits specification. They must be lowercase, written in the imperative mood (e.g., "add feature", not "added feature"), and specify the affected scope:

```
<type>(<scope>): <short imperative description> (#<issue-id>)
```

#### Example Commits:
*   `feat(menu): add veg-only filtering toggle`
*   `fix(auth): resolve server action redirect loop due to header stripping`
*   `refactor(kitchen): decouple InsightsView from main kitchen board`
*   `chore(deps): upgrade supabase ssr helper client library to v0.5.2`

---

## 💻 2. Engineering Standards & Code Style

To guarantee maximum execution performance and static safety:

*   **TypeScript Strictness:** Never use `any` unless absolutely necessary and backed by an explanatory inline comment. All database queries must be cast to explicit TypeScript types compiled from the Supabase database schema generator.
*   **Next.js 15 Server Components:** Maximize performance by keeping components as **Server Components** by default. Use `"use client"` only when incorporating client-side event listeners, local React states, or interactive animation libraries (GSAP / Framer Motion).
*   **Styling (Tailwind CSS v4):** Utilize Tailwind utility classes for all stylings. Ad-hoc style tags are strictly forbidden. Declare repetitive design tokens or animations under the global `@theme` in `globals.css`.
*   **Component Co-location:** Keep small subcomponents co-located in the same directory as their usage. Promote them to the global `src/components/` directory only when shared across multiple distinct portals.
*   **Repository Hygiene:** Clean up any temporary logs, debug states, or local mock data. Never commit test output directories (`.e2e-screenshots/`, `next-dev.log`, `*.tsbuildinfo`, etc.) to the remote history.

---

## 🛡️ 3. Database Integrity & Row-Level Security (RLS)

Every database adjustment is critical. We operate a multi-tenant PostgreSQL backend secured via strict RLS.

### 🗄️ A. Migration Protocol
1.  **Generate Chronological Migration:** Create a timestamped SQL file under `supabase/migrations/`.
2.  **Define Row-Level Security (RLS):** Ensure **every single table** has RLS enabled explicitly.
3.  **Regenerate Types:** Update the local database TypeScript contracts instantly:
    ```bash
    supabase gen types typescript --project-id <ref> --schema public > src/lib/db/types.ts
    ```

### 👥 B. RLS Role Verification Checklist
Before submitting a pull request that alters schemas or database functions, you must verify that the security policy is secure across **all four active roles**:
*   `student`       - Access restricted solely to active, live menu items under their college tenant. Read-only permissions on canteens and orders they created.
*   `kitchen_staff` - Write permissions restricted to order status transitions (placed → preparing → ready → collected) inside their specific sub-canteen. Read-only access to customer orders.
*   `canteen_admin` - Write permissions for menu item curations, staff registrations, and revenue KPI reads, locked solely to their active canteen UUID.
*   `super_admin`   - Global read-write across all system instances.

---

## 🔒 4. Production Security Guardrails

Contributions touching auth, webhooks, or money must pass this high-precision checklist:

*   [ ] **Idempotent Webhooks:** Razorpay callback events and capturing processes must be protected by PostgreSQL database unique constraint locks (`payment_ref` key mapping). This prevents duplicate order registrations or double-charging during network retries.
*   [ ] **Cryptographic Signature Verification:** Webhook API endpoints must verify request payloads using strong cryptographic HMAC SHA256 signatures before reading data.
*   [ ] **No Leakage of Secrets:** Ensure all private keys (Supabase service roles, SMTP credentials, Resend tokens) are configured as secret environment variables. Double check that `.env.local` or raw secret strings are never committed to the git repository.
*   [ ] **Referrer-Independent Authentication:** Server actions and callbacks must use explicitly bound and closed-over parameters (e.g., passing the `tenantSlug` from forms) rather than relying on browser referrer headers, which can be stripped down to the host origin by strict privacy settings.

---

## 🚀 5. Pre-Submission Quality Gate

Before requesting a review or creating a Pull Request, you **MUST** run the complete verification suite locally to confirm zero warnings or compilation errors. Failure to do so is unacceptable.

```bash
# 1. Verify TypeScript compilation and type safety
pnpm typecheck

# 2. Run code style linting checks
pnpm lint

# 3. Compile full Next.js production build and check for optimization warnings
pnpm build

# 4. Execute structural routing checks on static demo portals
pnpm demo:verify

# 5. Run Playwright E2E browser user simulation suite
pnpm demo:verify:e2e
```

Ensure `git status` is clean, and only correct, formatted, and linted files are tracked.
