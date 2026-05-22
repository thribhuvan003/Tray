# E2E Testing for the Real Next.js / Supabase Backend

This implementation plan outlines the steps to build and execute a fully automated integration test against the real Tray backend (running locally on Next.js + real Supabase DB).

Unlike the static offline prototypes in `public/demo/*`, this test will utilize the active routes (`/login`, `/c/aditya/menu`, `/kitchen`, etc.), authenticate real database users, place actual orders, and verify Postgres RLS policies and live state transitions.

## User Review Required

> [!IMPORTANT]
> **Self-Contained Credentials Auto-Setup**
> Since authentication uses actual Supabase Auth, we will programmatically reset the passwords of existing seeded testing emails (`student.demo@aec.edu.in` and `main.kitchen@traytest.dev`) to a uniform test password (`TestPassword123!`) using the Supabase Service Role Key before running the test. This avoids the need for magic link click interception.

## Proposed Changes

We will create a new self-contained integration test script using Playwright.

### Testing Scaffolding

#### [NEW] [test-real-backend.mjs](file:///c:/Users/ntena/Downloads/yyyy/scripts/test-real-backend.mjs)
A Node script that:
1. Manually reads `.env.local` to configure Supabase and app URLs.
2. Initializes the Supabase Admin Client using `SUPABASE_SERVICE_ROLE_KEY`.
3. Resets the password of the seeded student `student.demo@aec.edu.in` and kitchen staff `main.kitchen@traytest.dev` to `TestPassword123!`.
4. Starts a Playwright automation flow:
   - **Student Portal**:
     - Logs into the student account using the real `/login` path with "Use password" option.
     - Adds a Samosa to the cart.
     - Selects takeaway mode and proceeds to payment.
     - Clicks the developer simulation payment button `DEV · simulate paid` to transition the order to `placed` state in the DB.
     - Navigates to the live tracking page.
   - **Kitchen Portal**:
     - Opens a separate tab/context.
     - Logs in as `main.kitchen@traytest.dev`.
     - Identifies the newly created order in the "Incoming / Placed" column.
     - Clicks `Start →` to mark it preparing in the database.
     - Clicks `Ready →` to mark it ready.
   - **Handover Verification**:
     - Student tab receives the 4-digit OTP code (read either from the tracking UI or directly from `pickup_secrets` table).
     - Kitchen tab clicks `Verify OTP` on the card.
     - Enters the 4 digits and clicks `Verify & hand over`.
     - Verifies the order status moves to `collected` (handover completed).

## Verification Plan

### Automated Run
We will execute the test script by running:
```bash
node scripts/test-real-backend.mjs
```
This script will output console messages for each step, and save screenshots in `.playwright-screenshots/` in case of failure or for verification.

### Manual Verification
- We can run `npm run dev` and perform the same steps manually using the password credentials set by our script.
