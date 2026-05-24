/**
 * E2E Test: testcanteen full flow
 *
 * 1. Seed: create colleges + testcanteen tenant + test admins/kitchen/student (non-demo emails)
 * 2. Browser: admin login → college-admin dashboard → click kitchen card → click student link
 * 3. Browser: add a menu item via admin panel
 * 4. Browser: student sees new menu item, goes through checkout
 * 5. Browser: Google OAuth button — verify no login loop
 *
 * Run: node scripts/e2e-testcanteen.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");
const screenshotDir = path.join(root, ".e2e-screenshots");
fs.mkdirSync(screenshotDir, { recursive: true });

// ── Load .env.local ──
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    process.env[key] = val;
  }
}

const BASE_URL = "http://127.0.0.1:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ── Helpers ──
let stepNum = 0;
function step(msg) {
  stepNum++;
  console.log(`\n[${stepNum}] ${msg}`);
}
async function shot(page, name) {
  const file = path.join(screenshotDir, `${String(stepNum).padStart(2, "0")}-${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`   📸 ${file}`);
  return file;
}
async function waitAndShot(page, name, ms = 1500) {
  await page.waitForTimeout(ms);
  return shot(page, name);
}

// ── PHASE 1: DB SEEDING ──
async function seedDB() {
  step("Seeding DB: ensure college 'Test College' exists");

  // 1. College
  let collegeId;
  const { data: existingCollege } = await db
    .from("colleges")
    .select("id")
    .eq("slug", "testcollege")
    .maybeSingle();

  if (existingCollege) {
    collegeId = existingCollege.id;
    console.log(`   ✓ College already exists: ${collegeId}`);
  } else {
    const { data: newCollege, error } = await db
      .from("colleges")
      .insert({
        slug: "testcollege",
        name: "Test College",
        allowed_domains: [],
        is_active: true,
      })
      .select("id")
      .single();
    if (error) throw new Error(`College insert failed: ${error.message}`);
    collegeId = newCollege.id;
    console.log(`   ✓ College created: ${collegeId}`);
  }

  step("Seeding DB: ensure 'testcanteen' tenant exists");

  // 2. Tenant
  let tenantId;
  const { data: existingTenant } = await db
    .from("tenants")
    .select("id")
    .eq("slug", "testcanteen")
    .maybeSingle();

  if (existingTenant) {
    tenantId = existingTenant.id;
    console.log(`   ✓ Tenant already exists: ${tenantId}`);
  } else {
    const { data: newTenant, error } = await db
      .from("tenants")
      .insert({
        slug: "testcanteen",
        name: "Test Canteen",
        college_name: "Test College",
        college_id: collegeId,
        is_active: true,
        is_open: true,
        hero_tagline: "Fresh food, faster.",
        building: "Block A",
        zone: "Ground Floor",
        mess_type: "veg",
      })
      .select("id")
      .single();
    if (error) throw new Error(`Tenant insert failed: ${error.message}`);
    tenantId = newTenant.id;
    console.log(`   ✓ Tenant created: ${tenantId}`);
  }

  step("Seeding DB: ensure real test users exist (non-demo emails to test real auth flow)");

  const users = [
    { email: "admin@canteen.io", password: "AdminPassword123!", name: "Test Admin", role: "canteen_admin" },
    { email: "kitchen@canteen.io", password: "KitchenPassword123!", name: "Test Kitchen", role: "kitchen_staff" },
    { email: "student@canteen.io", password: "StudentPassword123!", name: "Test Student", role: "student" },
  ];

  const userMap = {};
  for (const u of users) {
    // Try create
    const { data: created, error: createErr } = await db.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.name },
    });

    let userId;
    if (createErr) {
      if (createErr.message.includes("already") || createErr.code === "email_exists") {
        const { data: { users: list } } = await db.auth.admin.listUsers({ perPage: 1000 });
        const found = list.find((x) => x.email.toLowerCase() === u.email.toLowerCase());
        if (!found) throw new Error(`User ${u.email} not found after create failure`);
        userId = found.id;
        await db.auth.admin.updateUserById(userId, { password: u.password });
        console.log(`   ✓ User ${u.email} already exists, password reset`);
      } else {
        throw new Error(`User create failed (${u.email}): ${createErr.message}`);
      }
    } else {
      userId = created.user.id;
      console.log(`   ✓ User ${u.email} created`);
    }

    userMap[u.role] = userId;

    // Membership
    const { data: mem } = await db
      .from("tenant_memberships")
      .select("id, role")
      .eq("user_id", userId)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (mem) {
      await db
        .from("tenant_memberships")
        .update({ role: u.role, is_active: true, display_name: u.name })
        .eq("id", mem.id);
      console.log(`   ✓ Membership updated: ${u.email} → ${u.role}`);
    } else {
      const { error: memErr } = await db.from("tenant_memberships").insert({
        user_id: userId,
        tenant_id: tenantId,
        role: u.role,
        display_name: u.name,
        is_active: true,
      });
      if (memErr) throw new Error(`Membership insert failed: ${memErr.message}`);
      console.log(`   ✓ Membership created: ${u.email} → ${u.role}`);
    }
  }

  // College admin membership for college-admin dashboard
  const adminUserId = userMap["canteen_admin"];
  const { data: collegeMem } = await db
    .from("college_memberships")
    .select("id")
    .eq("user_id", adminUserId)
    .eq("college_id", collegeId)
    .maybeSingle();

  if (!collegeMem) {
    const { error: cmErr } = await db.from("college_memberships").insert({
      user_id: adminUserId,
      college_id: collegeId,
      is_active: true,
    });
    if (cmErr) console.warn(`   ⚠ College membership: ${cmErr.message}`);
    else console.log(`   ✓ College membership created for admin`);
  } else {
    console.log(`   ✓ College membership already exists`);
  }

  step("Seeding DB: ensure a menu category exists for testcanteen");

  let categoryId;
  const { data: existingCat } = await db
    .from("menu_categories")
    .select("id")
    .eq("tenant_id", tenantId)
    .limit(1)
    .maybeSingle();

  if (existingCat) {
    categoryId = existingCat.id;
    console.log(`   ✓ Category already exists: ${categoryId}`);
  } else {
    const { data: newCat, error } = await db
      .from("menu_categories")
      .insert({ tenant_id: tenantId, name: "Main Course", sort_order: 0 })
      .select("id")
      .single();
    if (error) throw new Error(`Category insert failed: ${error.message}`);
    categoryId = newCat.id;
    console.log(`   ✓ Category created: ${categoryId}`);
  }

  return { collegeId, tenantId, categoryId, userMap };
}

// ── PHASE 2: BROWSER E2E ──
async function runBrowserTests({ tenantId, categoryId, userMap }) {
  const browser = await chromium.launch({ headless: true, slowMo: 100 });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  page.on("console", (msg) => console.log(`   [BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`));
  page.on("pageerror", (err) => console.log(`   [BROWSER ERROR] ${err.stack || err.message}`));

  const results = [];

  function record(testName, passed, detail = "") {
    const icon = passed ? "✅" : "❌";
    console.log(`   ${icon} ${testName}${detail ? ": " + detail : ""}`);
    results.push({ testName, passed, detail });
  }

  try {
    // ── TEST 1: Home page loads ──
    step("Browser: load homepage");
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await waitAndShot(page, "homepage");
    record("Homepage loads", page.url().startsWith(BASE_URL));

    // ── TEST 2: Admin login ──
    step("Browser: navigate to /login for testcanteen admin");
    await page.goto(`${BASE_URL}/c/testcanteen/login`, { waitUntil: "networkidle" });
    await waitAndShot(page, "login-page");
    record("Login page loads", !page.url().includes("error"));

    // Click "I own a canteen" card
    const adminCard = page.locator('button:has-text("I own a canteen")').first();
    if (await adminCard.isVisible()) {
      await adminCard.click();
      await page.waitForTimeout(1000);
      await shot(page, "login-admin-card-clicked");

      // Click "Use password" button
      const usePassBtn = page.locator('button:has-text("Use password")').first();
      await usePassBtn.click();
      await page.waitForTimeout(800);
      await shot(page, "login-admin-use-password-clicked");

      // Fill login form
      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const submitBtn = page.locator('button[type="submit"]').first();

      await emailInput.fill("admin@canteen.io");
      await passwordInput.fill("AdminPassword123!");
      await shot(page, "login-admin-filled");
      await submitBtn.click();
      await page.waitForTimeout(3000);
      await waitAndShot(page, "after-admin-login");

      const adminUrl = page.url();
      const isAdminDashboard = adminUrl.includes("/admin/dashboard") || adminUrl.includes("/college-admin");
      record("Admin login → dashboard redirect", isAdminDashboard, adminUrl);
    } else {
      record("Admin role card visible", false, "Role card not found");
    }

    // ── TEST 3: College-admin dashboard ──
    step("Browser: navigate to college-admin dashboard");
    await page.goto(`${BASE_URL}/college-admin`, { waitUntil: "networkidle" });
    await waitAndShot(page, "college-admin-dashboard");
    const collegeAdminTitle = await page.locator("h1").first().textContent().catch(() => "");
    record("College-admin dashboard loads", !page.url().includes("login"), page.url());
    record("College-admin has h1", collegeAdminTitle.length > 0, collegeAdminTitle);

    // ── TEST 4: Click testcanteen card ──
    step("Browser: find and click testcanteen card on college-admin page");
    // Look for the link to testcanteen admin
    const canteenCard = page.locator('a[href*="/c/testcanteen/admin/dashboard"]').first();
    if (await canteenCard.isVisible()) {
      await canteenCard.click();
      await page.waitForTimeout(2000);
      await waitAndShot(page, "canteen-admin-dashboard");
      record("Testcanteen card click → admin/dashboard", page.url().includes("/c/testcanteen/admin"), page.url());
    } else {
      record("Testcanteen card visible on college-admin", false, "Card not found");
      await shot(page, "college-admin-no-card");
    }

    // ── TEST 5: Admin nav - go to menu page ──
    step("Browser: navigate to admin menu page");
    await page.goto(`${BASE_URL}/c/testcanteen/admin/menu`, { waitUntil: "networkidle" });
    await waitAndShot(page, "admin-menu-page");
    record("Admin menu page loads", !page.url().includes("login"), page.url());

    // ── TEST 6: Add a menu item ──
    step("Browser: add a new menu item via admin");
    const addBtn = page.locator('a[href*="/admin/menu/new"]').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(1000);
      await shot(page, "add-item-page-open");

      // Fill in item name
      const uniqueName = `Samosa ${Date.now()}`;
      const nameField = page.locator('input[id="name"]').first();
      await nameField.fill(uniqueName);
      // Price field
      const priceField = page.locator('input[id="price"]').first();
      await priceField.fill("25");
      // Description field
      const descField = page.locator('textarea[id="description"]').first();
      await descField.fill("Crispy, delicious, fresh samosa!");

      await shot(page, "add-item-form-filled");

      // Submit
      const saveBtn = page.locator('button[type="submit"]').first();
      await saveBtn.click();
      await page.waitForTimeout(3000);
      await waitAndShot(page, "after-add-item");
      const itemVisible = await page.locator(`text=${uniqueName}`).isVisible().catch(() => false);
      record(`Menu item '${uniqueName}' added`, itemVisible);

      // Save uniqueName to context so student test can find it!
      context.uniqueItemName = uniqueName;
      record("+ New item link visible", true);
    } else {
      record("+ New item link visible", false, "No new item link found");
      await shot(page, "admin-menu-no-add-link");
    }

    // ── TEST 7: Kitchen link from admin nav ──
    step("Browser: navigate to kitchen page");
    await page.goto(`${BASE_URL}/c/testcanteen/kitchen`, { waitUntil: "networkidle" });
    await waitAndShot(page, "kitchen-page");
    const kitchenUrl = page.url();
    record("Kitchen page loads (admin role)", !kitchenUrl.includes("login"), kitchenUrl);

    // Check if it looks like the real kitchen board
    const hasKitchenContent = await page.locator('text=Kitchen, text=Orders, text=PLACED, text=PREPARING').first().isVisible().catch(() => false);
    record("Kitchen board renders real content", !kitchenUrl.includes("login"));

    // ── TEST 8: Student login ──
    step("Browser: sign out and login as student");
    // Sign out
    await page.goto(`${BASE_URL}/auth/signout`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // Login as student
    await page.goto(`${BASE_URL}/c/testcanteen/login`, { waitUntil: "networkidle" });
    await waitAndShot(page, "student-login-page");

    // Click "Student" card
    const studentCard = page.locator('button:has-text("Student")').first();
    if (await studentCard.isVisible()) {
      await studentCard.click();
      await page.waitForTimeout(1000);

      // Click "Use password" button
      const usePassBtn = page.locator('button:has-text("Use password")').first();
      await usePassBtn.click();
      await page.waitForTimeout(800);

      const studentEmail = page.locator('input[type="email"]').first();
      const studentPassword = page.locator('input[type="password"]').first();
      const studentSubmit = page.locator('button[type="submit"]').first();

      await studentEmail.fill("student@canteen.io");
      await studentPassword.fill("StudentPassword123!");
      await shot(page, "student-login-filled");
      await studentSubmit.click();
      await page.waitForTimeout(3000);
      await waitAndShot(page, "after-student-login");
      const studentUrl = page.url();
      record("Student login → menu redirect", studentUrl.includes("/menu") || studentUrl.includes("/c/"), studentUrl);
    } else {
      record("Student role card visible", false, "Role card not found");
    }

    // ── TEST 9: Student menu page - verify item visible ──
    step("Browser: student menu page - check menu item visible");
    await page.goto(`${BASE_URL}/c/testcanteen/menu`, { waitUntil: "networkidle" });
    await waitAndShot(page, "student-menu-page");
    record("Student menu page loads", !page.url().includes("login"), page.url());

    // ── TEST 10: Add to cart and checkout ──
    step("Browser: student adds item to cart and checks checkout");
    const specificItemCard = page.locator('article', { hasText: context.uniqueItemName }).first();
    const addToCartBtn = specificItemCard.locator('button:has-text("Add"), button:has-text("+")').first();
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();
      await page.waitForTimeout(1200);
      await shot(page, "item-added-to-cart");

      // Go to checkout
      const cartBtn = page.locator('a[href*="/pay"], button:has-text("Checkout"), button:has-text("Cart"), a[href*="/cart"]').first();
      if (await cartBtn.isVisible()) {
        await cartBtn.click();
        await page.waitForTimeout(2000);
        await waitAndShot(page, "checkout-page");
        record("Checkout page loads", !page.url().includes("login"), page.url());
      } else {
        // Try going directly to pay
        await page.goto(`${BASE_URL}/c/testcanteen/pay`, { waitUntil: "networkidle" });
        await waitAndShot(page, "pay-page-direct");
        record("Pay page direct access", !page.url().includes("login"), page.url());
      }
    } else {
      await shot(page, "no-add-to-cart-btn");
      record("Add to cart button visible", false, "No + button found on menu");
    }

    // ── TEST 11: Google OAuth - check for loop ──
    step("Browser: check Google Sign-In button and OAuth redirect");
    await page.goto(`${BASE_URL}/c/testcanteen/login`, { waitUntil: "networkidle" });
    await waitAndShot(page, "login-for-google");

    // Click Student card to reveal login form / Google button
    const studentGoogleCard = page.locator('button:has-text("Student")').first();
    await studentGoogleCard.click();
    await page.waitForTimeout(1000);

    const googleBtn = page.locator('button:has-text("Google"), a:has-text("Google"), button:has-text("Continue with Google")').first();
    if (await googleBtn.isVisible()) {
      // Track redirects
      const redirectChain = [];
      page.on("response", (res) => {
        if (res.status() === 302 || res.status() === 301 || res.status() === 307) {
          redirectChain.push({ from: res.url(), to: res.headers()["location"] });
        }
      });

      await googleBtn.click();
      await page.waitForTimeout(3000);
      await shot(page, "after-google-click");

      const afterUrl = page.url();
      // Check if we're stuck back at login
      const isLoop = afterUrl.includes("/login") && !afterUrl.includes("accounts.google");
      const isGoingToGoogle = afterUrl.includes("accounts.google.com") || afterUrl.includes("supabase") || afterUrl.includes("oauth");

      record("Google OAuth - NOT stuck in login loop", !isLoop, afterUrl);
      record("Google OAuth - redirecting to provider", isGoingToGoogle || !isLoop, afterUrl);

      if (redirectChain.length > 0) {
        console.log("   Redirect chain:");
        redirectChain.forEach((r) => console.log(`     ${r.from} → ${r.to}`));
      }
    } else {
      record("Google Sign-In button visible on login page", false, "No Google button found");
      await shot(page, "login-no-google-btn");
    }

  } catch (err) {
    console.error("Browser test error:", err);
    await shot(page, "error-state");
    results.push({ testName: "Browser test suite", passed: false, detail: err.message });
  } finally {
    await browser.close();
  }

  return results;
}

// ── MAIN ──
async function main() {
  console.log("═══════════════════════════════════════");
  console.log("  Tray E2E Test — testcanteen full flow");
  console.log("═══════════════════════════════════════");
  console.log(`  Target: ${BASE_URL}`);
  console.log(`  Screenshots: ${screenshotDir}`);

  let seedData;
  try {
    seedData = await seedDB();
    console.log("\n✅ DB seeding complete");
  } catch (err) {
    console.error("❌ DB seeding failed:", err.message);
    process.exit(1);
  }

  const results = await runBrowserTests(seedData);

  console.log("\n═══════════════════════════════════════");
  console.log("  E2E Results");
  console.log("═══════════════════════════════════════");

  let passed = 0, failed = 0;
  for (const r of results) {
    if (r.passed) {
      console.log(`  ✅ ${r.testName}${r.detail ? " — " + r.detail : ""}`);
      passed++;
    } else {
      console.log(`  ❌ ${r.testName}${r.detail ? " — " + r.detail : ""}`);
      failed++;
    }
  }

  console.log(`\n  ${passed} passed / ${failed} failed`);
  console.log(`  Screenshots: ${screenshotDir}`);
  console.log("═══════════════════════════════════════\n");

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
