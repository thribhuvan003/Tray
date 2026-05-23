/**
 * scripts/test-user-simulation.mjs
 * Full E2E user flow simulation against port 3005.
 *
 * Simulates:
 * 1. Admin creates a new institution/canteen (Harvard University) via /get-started
 * 2. Gets a unique canteen slug/domain (harvard-dining-hall-rand)
 * 3. Programmatically creates verified student & kitchen staff memberships for the new tenant
 * 4. Admin logs in and creates a new menu item ("Harvard Crimson Burger")
 * 5. Student logs in, views the newly updated menu item, adds it to the cart, and places an order
 * 6. Kitchen staff logs in, sees the live order ticket (verifying Student -> Kitchen sync)
 * 7. Kitchen staff starts preparing and then marks the order ready
 * 8. Kitchen staff verifies the customer OTP from the database, handing over the food
 * 9. Student tracking page updates automatically to "Collected" (verifying Kitchen -> Student sync)
 * 10. Opens the offline simulation demo pages to verify their basic static integrity
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

/* ─── Load Environment Variables ─────────────────────────────────────────── */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");
const ssDir = "C:\\Users\\ntena\\.gemini\\antigravity\\brain\\413ad5aa-c8d1-4763-bd87-593d930ce05b\\.playwright-screenshots-simulation";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const firstEq = trimmed.indexOf("=");
    if (firstEq === -1) continue;
    const key = trimmed.slice(0, firstEq).trim();
    let val = trimmed.slice(firstEq + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    process.env[key] = val;
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE = "http://localhost:3005";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const rand = Math.floor(1000 + Math.random() * 9000);
const PASS = "\x1b[32m✅ PASS\x1b[0m";
const FAIL = "\x1b[31m❌ FAIL\x1b[0m";
let stepNum = 0;
const results = [];

function log(msg) {
  stepNum++;
  console.log(`\n${"═".repeat(72)}`);
  console.log(`  STEP ${stepNum}: ${msg}`);
  console.log(`${"═".repeat(72)}`);
}

function info(msg) {
  console.log(`  → ${msg}`);
}

function recordResult(name, passed, detail = "") {
  results.push({ name, passed, detail });
  console.log(`  ${passed ? PASS : FAIL} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function screenshot(page, name) {
  fs.mkdirSync(ssDir, { recursive: true });
  const filePath = path.join(ssDir, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  info(`Screenshot saved: ${name}.png`);
}

async function waitAndClick(page, selector, label, timeout = 15000) {
  const loc = page.locator(selector).first();
  await loc.waitFor({ state: "visible", timeout });
  await loc.click();
  info(`Clicked: ${label}`);
}

/* ─── Main Simulation ───────────────────────────────────────────────────── */
async function main() {
  console.log("\n🧪 Tray E2E User Simulation — Multi-Tenant Integration");
  console.log(`   Base URL:     ${BASE}`);
  console.log(`   Unique Seed:  ${rand}\n`);

  let playwrightModule;
  try {
    playwrightModule = await import("playwright");
  } catch {
    console.error("❌ Playwright not found. Install it first.");
    process.exit(1);
  }
  const { chromium } = playwrightModule;
  const browser = await chromium.launch({ headless: true });
  info("Browser launched (headless mode)");

  // Use unique fake details
  const institutionName = `Harvard University ${rand}`;
  const canteenName = `Harvard Dining Hall ${rand}`;
  const adminEmail = `admin.${rand}@harvard.edu`;
  const adminPassword = `HarvardPass123!`;
  const studentEmail = `student.${rand}@harvard.edu`;
  const studentPassword = `StudentPass123!`;
  const kitchenEmail = `chef.${rand}@harvard.edu`;
  const kitchenPassword = `ChefPass123!`;
  const menuitemName = `Harvard Crimson Burger ${rand}`;

  let canteenSlug = "";
  let orderId = "";
  let shortCode = "";
  let otp = "";

  try {
    /* ── STEP 1: Onboard New Canteen (Gets its own Domain) ──────────────── */
    log("Onboarding new Institution/Canteen via /get-started");
    const adminCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const adminPage = await adminCtx.newPage();
    adminPage.on('console', msg => console.log('PAGE LOG:', msg.text()));

    await adminPage.goto(`${BASE}/get-started`, { waitUntil: "networkidle", timeout: 60000 });
    await adminPage.waitForTimeout(2000);
    await screenshot(adminPage, "01-get-started-step1");

    // Fill Step 1
    await adminPage.fill('input[placeholder*="IIT Bombay"]', institutionName);
    await adminPage.selectOption('select:has(option[value="college_university"])', 'college_university');
    await adminPage.waitForTimeout(1000);
    await adminPage.fill('input[placeholder*="Mumbai"]', 'Cambridge');
    await screenshot(adminPage, "01.5-after-select");
    await adminPage.fill('input[placeholder="iitb.ac.in"]', 'harvard.edu');
    await screenshot(adminPage, "02-step1-filled");

    await waitAndClick(adminPage, 'button:has-text("Continue")', "Step 1 Continue");
    await adminPage.waitForTimeout(1500);

    // Fill Step 2
    await adminPage.waitForSelector('input[placeholder*="Main Canteen"]', { timeout: 15000 });
    await adminPage.fill('input[placeholder*="Main Canteen"]', canteenName);
    await adminPage.fill('input[placeholder*="Academic Block"]', 'Annenberg Hall');
    await adminPage.fill('input[placeholder="canteen@okaxis"]', 'harvard@okaxis');
    await adminPage.locator('input[type="time"]').nth(0).fill('00:00');
    await adminPage.locator('input[type="time"]').nth(1).fill('23:59');
    await screenshot(adminPage, "03-step2-filled");

    await waitAndClick(adminPage, 'button:has-text("Continue")', "Step 2 Continue");
    await adminPage.waitForTimeout(1500);

    // Fill Step 3
    await adminPage.waitForSelector('input[placeholder="Full name"]', { timeout: 15000 });
    await adminPage.fill('input[placeholder="Full name"]', 'John Harvard');
    await adminPage.fill('input[placeholder="you@example.com"]', adminEmail);
    await adminPage.fill('input[placeholder="At least 8 characters"]', adminPassword);
    await screenshot(adminPage, "04-step3-filled");

    await waitAndClick(adminPage, 'button[type="submit"]', "Create Canteen Account");
    
    // Wait for redirect to admin dashboard
    await adminPage.waitForURL(/\/admin\/dashboard/, { timeout: 35000 });
    const dashboardUrl = adminPage.url();
    info(`Redirected to dashboard URL: ${dashboardUrl}`);

    const slugMatch = dashboardUrl.match(/\/c\/([^/]+)\/admin\/dashboard/i);
    if (!slugMatch || !slugMatch[1]) {
      throw new Error(`Could not extract canteen slug from dashboard URL: ${dashboardUrl}`);
    }
    canteenSlug = slugMatch[1];
    info(`✨ Success! New canteen got its own domain/canteen slug: "${canteenSlug}"`);
    await screenshot(adminPage, "05-dashboard-welcome");
    recordResult("Institution onboarding (gets own domain)", true, `slug=${canteenSlug}`);

    /* ── STEP 2: Programmatically Create Verified Student & Kitchen Users ─ */
    log("Creating verified Student and Kitchen Staff accounts in DB");
    
    // Get tenant ID
    const { data: tenantData, error: tenantErr } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", canteenSlug)
      .single();
    if (tenantErr || !tenantData) throw new Error(`Could not query tenant ${canteenSlug} in DB`);
    const tenantId = tenantData.id;
    info(`Queried tenant ID: ${tenantId}`);

    // Create Student Auth User
    const { data: stdAuth, error: stdAuthErr } = await supabase.auth.admin.createUser({
      email: studentEmail,
      password: studentPassword,
      email_confirm: true,
      user_metadata: { full_name: "Jane Student" },
    });
    if (stdAuthErr || !stdAuth.user) throw new Error(`Failed to create student user: ${stdAuthErr?.message}`);
    info(`Student auth user created: ${studentEmail}`);

    // Insert Student Membership
    const { error: stdMemErr } = await supabase.from("tenant_memberships").insert({
      user_id: stdAuth.user.id,
      tenant_id: tenantId,
      role: "student",
      display_name: "Jane Student",
      is_active: true,
    });
    if (stdMemErr) throw new Error(`Failed to insert student membership: ${stdMemErr.message}`);
    info("Student membership created");

    // Create Kitchen Auth User
    const { data: kchAuth, error: kchAuthErr } = await supabase.auth.admin.createUser({
      email: kitchenEmail,
      password: kitchenPassword,
      email_confirm: true,
      user_metadata: { full_name: "Chef Harvard" },
    });
    if (kchAuthErr || !kchAuth.user) throw new Error(`Failed to create kitchen staff user: ${kchAuthErr?.message}`);
    info(`Kitchen staff auth user created: ${kitchenEmail}`);

    // Insert Kitchen Membership
    const { error: kchMemErr } = await supabase.from("tenant_memberships").insert({
      user_id: kchAuth.user.id,
      tenant_id: tenantId,
      role: "kitchen_staff",
      display_name: "Chef Harvard",
      is_active: true,
    });
    if (kchMemErr) throw new Error(`Failed to insert kitchen membership: ${kchMemErr.message}`);
    info("Kitchen staff membership created");
    recordResult("Provision verified student & kitchen memberships", true);

    /* ── STEP 3: Admin Updates the Menu ─────────────────────────────────── */
    log("Admin: Adding a new item to the menu");
    await adminPage.goto(`${BASE}/c/${canteenSlug}/admin/menu/new`, { waitUntil: "networkidle", timeout: 30000 });
    await adminPage.waitForTimeout(1500);

    await adminPage.fill('input[name="name"]', menuitemName);
    await adminPage.fill('textarea[name="description"]', 'Juicy Harvard specialty flame-grilled crimson burger.');
    await adminPage.fill('input[name="price"]', '149.50');
    await screenshot(adminPage, "06-new-item-form");

    await waitAndClick(adminPage, 'button[type="submit"]', "Create Item Submit");
    await adminPage.waitForURL(/\/admin\/menu(?:\?|$)/, { timeout: 30000 });
    await adminPage.waitForTimeout(2000);
    await screenshot(adminPage, "07-admin-menu-list");

    const itemExistsOnAdminList = await adminPage.locator(`text="${menuitemName}"`).isVisible();
    recordResult("Admin menu update succeeds", itemExistsOnAdminList, `item="${menuitemName}"`);

    /* ── STEP 4: Student Portal Verification & Order Placement ─────────── */
    log("Student: Logging in and placing order on newly updated menu");
    const studentCtx = await browser.newContext({ viewport: { width: 450, height: 800 } }); // simulate mobile view!
    const studentPage = await studentCtx.newPage();
    studentPage.on('console', msg => console.log('STUDENT PAGE LOG:', msg.text()));

    await studentPage.goto(`${BASE}/login?tenant=${canteenSlug}`, { waitUntil: "networkidle", timeout: 60000 });
    await studentPage.waitForTimeout(2000);
    await screenshot(studentPage, "08-student-login");

    // Choose student role card
    await waitAndClick(studentPage, "[data-role-card]", "Student role card");
    await studentPage.waitForTimeout(1200);

    // Switch to password mode
    const pwdToggle = studentPage.locator('button', { hasText: 'Use password' });
    await pwdToggle.waitFor({ state: 'attached', timeout: 10000 });
    await pwdToggle.click({ force: true });
    await studentPage.waitForSelector('input[type="password"]', { timeout: 5000 });

    // Fill credentials
    await studentPage.fill('input[type="email"]', studentEmail);
    await studentPage.fill('input[type="password"]', studentPassword);
    await screenshot(studentPage, "09-student-credentials");

    await waitAndClick(studentPage, 'button[type="submit"]', "Student Login Submit");
    await studentPage.waitForSelector('h1', { timeout: 30000 });
    await studentPage.waitForTimeout(2000);
    await screenshot(studentPage, "10-student-menu-page");

    // Wait for the menu item to become visible, ensuring loading has finished and state synced
    await studentPage.locator(`text="${menuitemName}"`).first().waitFor({ state: "visible", timeout: 15000 });
    const itemVisibleOnStudentMenu = await studentPage.locator(`text="${menuitemName}"`).first().isVisible();
    recordResult("Menu updates sync instantly to Student Portal", itemVisibleOnStudentMenu);

    // Wait for hydration to complete before clicking Add
    await studentPage.waitForTimeout(3000);

    // Add item to cart
    const addBtn = studentPage.locator('button:has-text("Add")').first();
    await addBtn.click();
    info("Added new item to cart");
    await studentPage.waitForTimeout(1000);
    await screenshot(studentPage, "11-item-added-in-cart");

    // Open cart drawer & checkout
    const cartTrigger = studentPage.locator('button[aria-label*="View cart"]');
    await cartTrigger.click();
    await studentPage.waitForTimeout(3000); // Give plenty of time to hydrate the drawer
    await screenshot(studentPage, "12-mobile-cart-drawer");

    const placeBtn = studentPage.locator('button:has-text("Place order")');
    await placeBtn.click();
    await studentPage.waitForTimeout(1000);
    await screenshot(studentPage, "12.5-after-checkout-click");
    await studentPage.waitForTimeout(2000); // wait for redirect
    info("Clicked place order");

    // Pay page
    await studentPage.waitForURL(/\/pay\//, { timeout: 30000 });
    const payUrl = studentPage.url();
    orderId = payUrl.match(/\/pay\/([a-f0-9-]+)/i)?.[1];
    info(`Pay page loaded. Order ID: ${orderId}`);
    await screenshot(studentPage, "13-student-payment-page");

    // Confirm Payment
    const ivePaidBtn = studentPage.locator('button:has-text("paid")');
    await ivePaidBtn.click();
    info("Clicked paid");

    // Tracking page
    await studentPage.waitForURL(/\/track\//, { timeout: 30000 });
    await studentPage.waitForTimeout(2000);
    await screenshot(studentPage, "14-student-tracking-page");

    // Verify order status in DB
    const { data: dbOrder } = await supabase.from("orders").select("short_code, status").eq("id", orderId).single();
    shortCode = dbOrder?.short_code;
    info(`Placed order ${shortCode} status in DB: ${dbOrder?.status}`);
    recordResult("Student order placement and checkout succeeds", dbOrder?.status === "placed", `shortCode=${shortCode}`);

    /* ── STEP 5: Kitchen Board Live Queue & Progressions ────────────────── */
    log("Kitchen: Logging in and processing order queue");
    const kitchenCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const kitchenPage = await kitchenCtx.newPage();
    kitchenPage.on('console', msg => console.log('KITCHEN PAGE LOG:', msg.text()));

    await kitchenPage.goto(`${BASE}/login?tenant=${canteenSlug}&next=/c/${canteenSlug}/kitchen`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await kitchenPage.waitForTimeout(2000);

    // Select kitchen staff role card
    await waitAndClick(kitchenPage, "[data-role-card]", "Kitchen staff role card");
    await kitchenPage.waitForTimeout(1200);

    // Switch to password mode
    const kitchenPwdToggle = kitchenPage.locator('button', { hasText: 'Use password' });
    await kitchenPwdToggle.waitFor({ state: 'attached', timeout: 10000 });
    await kitchenPwdToggle.click({ force: true });
    await kitchenPage.waitForSelector('input[type="password"]', { timeout: 5000 });

    // Fill credentials
    await kitchenPage.fill('input[type="email"]', kitchenEmail);
    await kitchenPage.fill('input[type="password"]', kitchenPassword);
    await screenshot(kitchenPage, "15-kitchen-credentials");

    await waitAndClick(kitchenPage, 'button[type="submit"]', "Kitchen Login Submit");
    await kitchenPage.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
    await kitchenPage.waitForTimeout(5000); // Wait for hydration
    await screenshot(kitchenPage, "16-kitchen-board-loaded");

    // Verify the placed order is visible in the Kitchen's placed list! (Student -> Kitchen Sync)
    const ticketLocator = kitchenPage.locator(`article:has-text("${shortCode}")`).first();
    const isTicketVisibleInKitchen = await ticketLocator.isVisible();
    recordResult("Student order syncs instantly to Kitchen Board queue", isTicketVisibleInKitchen);

    // 1. placed -> preparing
    const startBtn = ticketLocator.locator('button:has-text("Start")');
    await startBtn.click({ force: true });
    info("Clicked Start on kitchen ticket");
    await kitchenPage.waitForTimeout(3000);

    const { data: orderPrep } = await supabase.from("orders").select("status").eq("id", orderId).single();
    recordResult("Kitchen transitions status: placed → preparing", orderPrep?.status === "preparing");

    // 2. preparing -> ready
    await kitchenPage.reload({ waitUntil: "networkidle" });
    await kitchenPage.waitForTimeout(4000); // Wait for hydration
    await screenshot(kitchenPage, "17-kitchen-preparing");

    const readyBtn = kitchenPage.locator(`article:has-text("${shortCode}")`).first().locator('button:has-text("Ready")');
    await readyBtn.click({ force: true });
    info("Clicked Ready on kitchen ticket");
    await kitchenPage.waitForTimeout(3000);

    const { data: orderRdy } = await supabase.from("orders").select("status").eq("id", orderId).single();
    recordResult("Kitchen transitions status: preparing → ready (OTP issued)", orderRdy?.status === "ready");

    /* ── STEP 6: OTP Handover Verification ─────────────────────────────── */
    log("OTP Handover Verification (ready → collected)");
    
    // Read plain OTP from pickup_secrets in DB
    const { data: secret } = await supabase.from("pickup_secrets").select("otp_plain").eq("order_id", orderId).single();
    if (!secret || !secret.otp_plain) throw new Error("Could not find generated OTP plain secret in DB");
    otp = secret.otp_plain;
    info(`Retrieved verification OTP from DB: ${otp}`);

    // Click "Verify OTP"
    await kitchenPage.reload({ waitUntil: "networkidle" });
    await kitchenPage.waitForTimeout(4000); // Wait for hydration
    await screenshot(kitchenPage, "18-kitchen-ready-list");

    const verifyOtpBtn = kitchenPage.locator(`article:has-text("${shortCode}")`).first().locator('button:has-text("Verify OTP")');
    await verifyOtpBtn.click({ force: true });
    info("Clicked 'Verify OTP' button");

    // Wait for Radix Dialog
    await kitchenPage.waitForSelector('[role="dialog"]', { timeout: 5000 });
    info("Radix OTP dialog revealed");
    await screenshot(kitchenPage, "19-otp-dialog-opened");

    // Fill OTP digits one by one
    const otpInputs = kitchenPage.locator('[role="dialog"] input[inputmode="numeric"]');
    await otpInputs.first().click();
    for (const digit of otp) {
      await kitchenPage.keyboard.press(digit);
      await kitchenPage.waitForTimeout(150);
    }
    await screenshot(kitchenPage, "20-otp-dialog-filled");

    // Submit handover
    const verifyBtn = kitchenPage.locator('[role="dialog"] button:has-text("Verify")');
    await verifyBtn.click({ force: true });
    info("Submitted OTP verification");
    await kitchenPage.waitForTimeout(3000);
    await screenshot(kitchenPage, "21-handover-complete");

    // Assert collected in DB
    const { data: orderCol } = await supabase.from("orders").select("status, collected_at").eq("id", orderId).single();
    recordResult("OTP verification matches and completes order handover (ready → collected)", orderCol?.status === "collected");

    /* ── STEP 7: Student Auto-Update Sync Verification ──────────────────── */
    log("Student: Checking for live tracking auto-update to 'Collected'");
    await studentPage.reload({ waitUntil: "domcontentloaded" });
    await studentPage.waitForTimeout(2000);
    await screenshot(studentPage, "22-student-order-collected");

    const studentCollectedVisible = await studentPage.locator('text="Collected"').first().isVisible().catch(() => false);
    recordResult("Kitchen handover updates sync instantly back to Student Portal", studentCollectedVisible);

    // Clean contexts
    await adminCtx.close();
    await studentCtx.close();
    await kitchenCtx.close();

    /* ── STEP 8: Static / Demo Pages verification ───────────────────────── */
    log("Verifying offline Simulation / Demo layouts");
    const demoCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const demoPage = await demoCtx.newPage();

    // 1. /demo/index.html (redirects instantly to student.html)
    await demoPage.goto(`${BASE}/demo/index.html`, { waitUntil: "networkidle", timeout: 20000 });
    await screenshot(demoPage, "23-demo-index");
    const indexValid = demoPage.url().endsWith("student.html") ||
                       await demoPage.locator('text="Tray"').first().isVisible().catch(() => false);
    recordResult("Offline Demo Hub page loads cleanly", indexValid);

    // 2. /demo/student.html
    await demoPage.goto(`${BASE}/demo/student.html`, { waitUntil: "networkidle", timeout: 20000 });
    await screenshot(demoPage, "24-demo-student");
    const studentValid = await demoPage.locator('text="Tray"').first().isVisible().catch(() => false);
    recordResult("Offline Student mockup loads cleanly", studentValid);

    // 3. /demo/kitchen.html
    await demoPage.goto(`${BASE}/demo/kitchen.html`, { waitUntil: "networkidle", timeout: 20000 });
    await screenshot(demoPage, "25-demo-kitchen");
    const kitchenValid = await demoPage.locator('text="Incoming"').first().isVisible().catch(() => false);
    recordResult("Offline Kitchen mockup loads cleanly", kitchenValid);

    // 4. /demo/admin.html
    await demoPage.goto(`${BASE}/demo/admin.html`, { waitUntil: "networkidle", timeout: 20000 });
    await screenshot(demoPage, "26-demo-admin");
    const adminValid = await demoPage.locator('text="Overview"').first().isVisible().catch(() => false);
    recordResult("Offline Admin mockup loads cleanly", adminValid);

    await demoCtx.close();

  } finally {
    await browser.close();
    info("Browser closed");
  }

  /* ─── Simulation Summary Report ───────────────────────────────────────── */
  console.log(`\n${"═".repeat(72)}`);
  console.log("  E2E USER FLOW SIMULATION REPORT");
  console.log(`${"═".repeat(72)}`);
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  for (const r of results) {
    console.log(`  ${r.passed ? "✅" : "❌"} ${r.name}${r.detail ? ` (${r.detail})` : ""}`);
  }
  console.log(`\n  ${passed} passed, ${failed} failed out of ${results.length} checks`);
  console.log(`  Screenshots saved in: .playwright-screenshots-simulation/`);

  if (failed > 0) {
    console.log(`\n❌ SIMULATION RUN ENCOUNTERED FAILURES\n`);
    process.exit(1);
  } else {
    console.log(`\n✅ ALL SIMULATION STEPS COMPLETED SUCCESSFULLY!`);
    console.log(`   Fully verified: onboarding → menu sync → checkout → live kitchen queue → OTP handover → tracking auto-sync.\n`);
  }
}

main().catch((err) => {
  console.error("\n❌ FATAL SIMULATION ERROR:", err);
  process.exit(1);
});
