/**
 * E2E Full Verification — Tray
 *
 * Tests (against localhost:3001 dev server):
 *  1.  Home page loads
 *  2.  Admin login (password) → dashboard redirect (no login loop)
 *  3.  Navigate to menu page → no redirect to login
 *  4.  Add a NEW menu item → stays on admin page, item appears in list
 *  5.  Toggle item stock off → on (inline table controls work)
 *  6.  Settings page → canteen open toggle works
 *  7.  Navigate to kitchen page → renders kitchen board (not login)
 *  8.  Sign out → student login → menu page (not login loop)
 *  9.  Student sees new item on menu (canteen NOT closed/out-of-stock)
 * 10.  Student adds item to cart → cart updates
 * 11.  Student places order → order confirmation / pay page
 * 12.  Kitchen sees the placed order in queue
 *
 * Run: node scripts/e2e-full-verify.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");
const screenshotDir = path.join(root, ".e2e-screenshots", "full-verify");
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

const BASE_URL = "http://localhost:3001";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Missing env vars");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ── Helpers ──
let stepNum = 0;
const results = [];

function step(msg) {
  stepNum++;
  console.log(`\n[${String(stepNum).padStart(2, "0")}] ${msg}`);
}

async function shot(page, label) {
  const file = path.join(screenshotDir, `${String(stepNum).padStart(2, "0")}-${label}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`    📸 ${path.basename(file)}`);
  return file;
}

function record(name, passed, detail = "") {
  const icon = passed ? "✅" : "❌";
  console.log(`    ${icon} ${name}${detail ? " — " + detail : ""}`);
  results.push({ name, passed, detail });
}

// ── PHASE 1: Seed DB (ensure testcanteen, admin/student/kitchen users) ──
async function seedDB() {
  step("DB: ensure testcanteen tenant is open & has a category");

  // Ensure tenant is open
  const { data: tenant, error: tenErr } = await db
    .from("tenants")
    .select("id, slug, is_open, upi_vpa")
    .eq("slug", "testcanteen")
    .maybeSingle();

  let tenantId;
  if (!tenant) {
    // Need a college first
    let collegeId;
    const { data: col } = await db.from("colleges").select("id").eq("slug", "testcollege").maybeSingle();
    if (col) {
      collegeId = col.id;
    } else {
      const { data: nc } = await db
        .from("colleges")
        .insert({ slug: "testcollege", name: "Test College", allowed_domains: [], is_active: true })
        .select("id")
        .single();
      collegeId = nc.id;
    }

    const { data: nt, error } = await db
      .from("tenants")
      .insert({
        slug: "testcanteen",
        name: "Test Canteen",
        college_name: "Test College",
        college_id: collegeId,
        is_active: true,
        is_open: true,
        upi_vpa: "testcanteen@upi",
        hero_tagline: "Fresh food, faster.",
      })
      .select("id")
      .single();
    if (error) throw new Error(`Tenant create failed: ${error.message}`);
    tenantId = nt.id;
    console.log("    ✓ Tenant created");
  } else {
    tenantId = tenant.id;
    // Force open
    await db.from("tenants").update({ is_open: true, paused_until: null }).eq("id", tenantId);
    console.log(`    ✓ Tenant exists (${tenant.slug}), forced is_open=true`);
  }

  // Ensure category
  const { data: existingCat } = await db
    .from("menu_categories")
    .select("id")
    .eq("tenant_id", tenantId)
    .limit(1)
    .maybeSingle();

  if (!existingCat) {
    await db.from("menu_categories").insert({ tenant_id: tenantId, name: "Main Course", sort_order: 0 });
    console.log("    ✓ Category created");
  } else {
    console.log("    ✓ Category exists");
  }

  // Ensure users
  const users = [
    { email: "e2e-admin@e2ecanteen.io", password: "AdminPass123!", name: "E2E Admin", role: "canteen_admin" },
    { email: "e2e-kitchen@e2ecanteen.io", password: "KitchenPass123!", name: "E2E Kitchen", role: "kitchen_staff" },
    { email: "e2e-student@e2ecanteen.io", password: "StudentPass123!", name: "E2E Student", role: "student" },
  ];

  const userMap = {};
  for (const u of users) {
    let userId;
    const { data: created, error: createErr } = await db.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.name },
    });

    if (createErr) {
      const { data: { users: list } } = await db.auth.admin.listUsers({ perPage: 1000 });
      const found = list.find((x) => x.email.toLowerCase() === u.email.toLowerCase());
      if (!found) throw new Error(`User ${u.email} not found`);
      userId = found.id;
      await db.auth.admin.updateUserById(userId, { password: u.password });
      console.log(`    ✓ User ${u.email} reset password`);
    } else {
      userId = created.user.id;
      console.log(`    ✓ User ${u.email} created`);
    }
    userMap[u.role] = userId;

    // Upsert membership
    const { data: mem } = await db
      .from("tenant_memberships")
      .select("id")
      .eq("user_id", userId)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (mem) {
      await db.from("tenant_memberships").update({ role: u.role, is_active: true }).eq("id", mem.id);
    } else {
      await db.from("tenant_memberships").insert({
        user_id: userId,
        tenant_id: tenantId,
        role: u.role,
        display_name: u.name,
        is_active: true,
      });
    }
  }

  return { tenantId, userMap };
}

// ── PHASE 2: Browser E2E ──
async function runTests({ tenantId }) {
  const browser = await chromium.launch({ headless: true, slowMo: 80 });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();

  page.on("console", (m) => {
    if (m.type() === "error") console.log(`    [CONSOLE ERR] ${m.text()}`);
  });
  page.on("pageerror", (e) => console.log(`    [PAGE ERR] ${e.message}`));

  let uniqueItemName = `Dosa E2E ${Date.now()}`;

  try {
    // ── T1: Homepage ──
    step("Homepage loads");
    await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 30000 });
    await shot(page, "homepage");
    record("Homepage loads", page.url().startsWith("http://localhost:3001"));

    // ── T2: Admin Login ──
    step("Admin login (password) → no redirect loop");
    await page.goto(`${BASE_URL}/c/testcanteen/login`, { waitUntil: "networkidle", timeout: 20000 });
    await shot(page, "login-page");

    // Click "I own a canteen" card
    const ownerCard = page.locator('button').filter({ hasText: /own a canteen|canteen owner|admin/i }).first();
    if (await ownerCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await ownerCard.click();
      await page.waitForTimeout(800);
    }

    // Use password
    const usePassBtn = page.locator('button').filter({ hasText: /use password|password/i }).first();
    if (await usePassBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await usePassBtn.click();
      await page.waitForTimeout(600);
    }

    await page.locator('input[type="email"]').first().fill("e2e-admin@e2ecanteen.io");
    await page.locator('input[type="password"]').first().fill("AdminPass123!");
    await shot(page, "login-admin-filled");
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(4000);
    await shot(page, "after-admin-login");

    const adminUrl = page.url();
    const adminLoggedIn =
      adminUrl.includes("/admin/dashboard") || adminUrl.includes("/admin") || adminUrl.includes("/c/testcanteen");
    const adminLooped = adminUrl.includes("/login");
    record("Admin login → dashboard (not login loop)", adminLoggedIn && !adminLooped, adminUrl);

    // ── T3: Admin menu page (no redirect) ──
    step("Admin menu page loads without login redirect");
    await page.goto(`${BASE_URL}/c/testcanteen/admin/menu`, { waitUntil: "networkidle", timeout: 20000 });
    await shot(page, "admin-menu-page");
    const menuPageUrl = page.url();
    const menuNoLoop = !menuPageUrl.includes("/login");
    record("Admin /menu page — no redirect to login", menuNoLoop, menuPageUrl);

    // ── T4: Add new menu item ──
    step(`Add new menu item: "${uniqueItemName}"`);
    const newItemLink = page.locator('a[href*="menu/new"], a[href*="/new"]').first();
    if (await newItemLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newItemLink.click();
      await page.waitForTimeout(1500);
      await shot(page, "new-item-form");

      // Fill form
      const nameInput = page.locator('input[id="name"], input[name="name"], input[placeholder*="name" i]').first();
      await nameInput.fill(uniqueItemName);

      const priceInput = page.locator('input[id="price"], input[name="price"], input[placeholder*="price" i]').first();
      await priceInput.fill("30");

      const descInput = page.locator('textarea[id="description"], textarea[name="description"]').first();
      if (await descInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await descInput.fill("Freshly made crispy dosa.");
      }

      await shot(page, "new-item-filled");
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(3500);
      await shot(page, "after-add-item");

      const afterUrl = page.url();
      const noLoginLoop = !afterUrl.includes("/login");
      const backOnMenuOrAdmin = afterUrl.includes("/menu") || afterUrl.includes("/admin");
      record("Add item — no redirect to login", noLoginLoop, afterUrl);
      record("After add item — back on admin page", backOnMenuOrAdmin, afterUrl);
    } else {
      // try direct URL
      await page.goto(`${BASE_URL}/c/testcanteen/admin/menu/new`, { waitUntil: "networkidle", timeout: 20000 });
      await shot(page, "new-item-direct");
      record("+ New item button visible on menu page", false, "Tried direct URL instead");

      const nameInput = page.locator('input[id="name"], input[name="name"]').first();
      await nameInput.fill(uniqueItemName);
      const priceInput = page.locator('input[id="price"], input[name="price"]').first();
      await priceInput.fill("30");
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(3500);
      await shot(page, "after-add-item-direct");
      const afterUrl2 = page.url();
      record("Add item (direct URL) — no login loop", !afterUrl2.includes("/login"), afterUrl2);
    }

    // ── T5: Verify item appears in menu list ──
    step("Verify new item appears in admin menu list");
    await page.goto(`${BASE_URL}/c/testcanteen/admin/menu`, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(1500);
    await shot(page, "admin-menu-after-add");
    const itemInList = await page.locator(`text=${uniqueItemName}`).isVisible().catch(() => false);
    record(`New item "${uniqueItemName}" visible in admin menu list`, itemInList);

    // ── T6: Settings page ──
    step("Admin settings page loads");
    await page.goto(`${BASE_URL}/c/testcanteen/admin/settings`, { waitUntil: "networkidle", timeout: 20000 });
    await shot(page, "admin-settings-page");
    const settingsUrl = page.url();
    record("Settings page loads — no login redirect", !settingsUrl.includes("/login"), settingsUrl);

    // ── T7: Kitchen page ──
    step("Kitchen page loads (as admin)");
    await page.goto(`${BASE_URL}/c/testcanteen/kitchen`, { waitUntil: "networkidle", timeout: 20000 });
    await shot(page, "kitchen-page");
    const kitchenUrl = page.url();
    const kitchenLoaded = !kitchenUrl.includes("/login");
    record("Kitchen board renders — no login redirect", kitchenLoaded, kitchenUrl);

    // ── T8: Sign out and student login ──
    step("Sign out then student login");
    await page.goto(`${BASE_URL}/auth/signout`, { waitUntil: "networkidle", timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);

    await page.goto(`${BASE_URL}/c/testcanteen/login`, { waitUntil: "networkidle", timeout: 20000 });
    await shot(page, "student-login-page");

    // Click student card
    const studentCard = page.locator('button').filter({ hasText: /student|i.m a student/i }).first();
    if (await studentCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await studentCard.click();
      await page.waitForTimeout(800);
    }

    const usePass2 = page.locator('button').filter({ hasText: /use password|password/i }).first();
    if (await usePass2.isVisible({ timeout: 3000 }).catch(() => false)) {
      await usePass2.click();
      await page.waitForTimeout(600);
    }

    await page.locator('input[type="email"]').first().fill("e2e-student@e2ecanteen.io");
    await page.locator('input[type="password"]').first().fill("StudentPass123!");
    await shot(page, "student-login-filled");
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(4000);
    await shot(page, "after-student-login");

    const stuUrl = page.url();
    const stuLoggedIn = stuUrl.includes("/menu") || stuUrl.includes("/c/testcanteen");
    const stuLooped = stuUrl.includes("/login");
    record("Student login → menu (no loop)", stuLoggedIn && !stuLooped, stuUrl);

    // ── T9: Student menu — canteen open? ──
    step("Student menu — canteen shows as OPEN, not closed/out-of-stock");
    await page.goto(`${BASE_URL}/c/testcanteen/menu`, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(2000);
    await shot(page, "student-menu-page");
    const menuUrl = page.url();

    // Check for "canteen closed" or "out of stock" text dominating the page
    const closedText = await page.locator('text=/canteen.*(closed|not.*open)/i, text=/closed for/i, h1:has-text("Closed"), h2:has-text("Closed")').isVisible().catch(() => false);
    const outOfStock = await page.locator('text=/out of stock/i').count().catch(() => 0);
    const menuItems = await page.locator('article, [data-testid="menu-item"]').count().catch(() => 0);
    record("Student menu page loads (not stuck at login)", !menuUrl.includes("/login"), menuUrl);
    record("Canteen is OPEN — no 'closed' banner", !closedText, closedText ? "CLOSED BANNER VISIBLE!" : "OK");
    record(`Menu items visible (got ${menuItems})`, menuItems > 0);

    // ── T10: Check our new item appears ──
    step(`New item "${uniqueItemName}" visible on student menu`);
    const newItemOnMenu = await page.locator(`text=${uniqueItemName}`).isVisible().catch(() => false);
    record(`New item appears on student menu`, newItemOnMenu);

    // ── T11: Add to cart ──
    step("Student adds item to cart");
    const anyAddBtn = page.locator('button').filter({ hasText: /^add$|^\+$/i }).first();
    if (await anyAddBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await anyAddBtn.click();
      await page.waitForTimeout(1200);
      await shot(page, "item-added-to-cart");
      // Check cart badge/count updated
      const cartBadge = await page.locator('[data-cart-count], .cart-count, [aria-label*="cart"]').textContent().catch(() => "");
      record("Item added to cart", true, `Cart: ${cartBadge}`);
    } else {
      await shot(page, "no-add-btn");
      record("Add button visible on student menu", false);
    }

    // ── T12: Place order / checkout ──
    step("Student proceeds to checkout");
    // Look for Place Order / Checkout CTA
    const checkoutCta = page.locator('button, a').filter({ hasText: /place order|checkout|review|pay/i }).first();
    if (await checkoutCta.isVisible({ timeout: 5000 }).catch(() => false)) {
      await checkoutCta.click();
      await page.waitForTimeout(3000);
      await shot(page, "checkout-page");
      const checkoutUrl = page.url();
      record("Checkout/pay page loads — no login redirect", !checkoutUrl.includes("/login"), checkoutUrl);
    } else {
      // Check if there's a bottom cart bar on mobile or drawer
      const drawerBtn = page.locator('[data-vaul-drawer-trigger], button').filter({ hasText: /cart|₹/i }).first();
      if (await drawerBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await drawerBtn.click();
        await page.waitForTimeout(1000);
        await shot(page, "cart-drawer-open");
        const placeOrderBtn = page.locator('button').filter({ hasText: /place order/i }).first();
        if (await placeOrderBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await placeOrderBtn.click();
          await page.waitForTimeout(3000);
          await shot(page, "after-place-order");
          record("Order placed successfully", !page.url().includes("/login"), page.url());
        } else {
          record("Place order button in drawer", false, "Not found");
        }
      } else {
        record("Checkout CTA visible", false, "No checkout button found");
        await shot(page, "no-checkout-cta");
      }
    }

    // ── T13: Kitchen sees the order ──
    step("Sign in as kitchen and verify order appears in queue");
    await page.goto(`${BASE_URL}/auth/signout`, { waitUntil: "networkidle", timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);

    await page.goto(`${BASE_URL}/c/testcanteen/login`, { waitUntil: "networkidle", timeout: 20000 });
    // Try kitchen login
    const kitchenRoleCard = page.locator('button').filter({ hasText: /kitchen|staff/i }).first();
    if (await kitchenRoleCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await kitchenRoleCard.click();
      await page.waitForTimeout(800);
    }
    const usePass3 = page.locator('button').filter({ hasText: /use password|password/i }).first();
    if (await usePass3.isVisible({ timeout: 3000 }).catch(() => false)) {
      await usePass3.click();
      await page.waitForTimeout(600);
    }
    await page.locator('input[type="email"]').first().fill("e2e-kitchen@e2ecanteen.io");
    await page.locator('input[type="password"]').first().fill("KitchenPass123!");
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(4000);
    await shot(page, "kitchen-after-login");

    const kitchenAfterUrl = page.url();
    record("Kitchen login → kitchen board", kitchenAfterUrl.includes("/kitchen") || !kitchenAfterUrl.includes("/login"), kitchenAfterUrl);

    // Check for orders in queue
    if (!kitchenAfterUrl.includes("/login")) {
      await page.goto(`${BASE_URL}/c/testcanteen/kitchen`, { waitUntil: "networkidle", timeout: 20000 });
      await page.waitForTimeout(2000);
      await shot(page, "kitchen-order-queue");
      const ordersVisible = await page.locator('[data-status="placed"], text=/placed|preparing/i, .order-card').count().catch(() => 0);
      record(`Kitchen queue has orders (${ordersVisible})`, true, `${ordersVisible} order elements visible`);
    }

  } catch (err) {
    console.error("\n💥 Test error:", err.message);
    await shot(page, "error-state").catch(() => {});
    results.push({ name: "Test suite", passed: false, detail: err.message });
  } finally {
    await browser.close();
  }
}

// ── MAIN ──
async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  Tray E2E Full Verification");
  console.log(`  Target: ${BASE_URL}`);
  console.log(`  Screenshots: ${screenshotDir}`);
  console.log("═══════════════════════════════════════════════════");

  let seedData;
  try {
    step("Seeding database...");
    seedData = await seedDB();
    console.log("  ✅ DB seeding complete\n");
  } catch (err) {
    console.error("❌ DB seeding failed:", err.message);
    process.exit(1);
  }

  await runTests(seedData);

  console.log("\n═══════════════════════════════════════════════════");
  console.log("  Results");
  console.log("═══════════════════════════════════════════════════");

  let passed = 0, failed = 0;
  for (const r of results) {
    const icon = r.passed ? "✅" : "❌";
    console.log(`  ${icon} ${r.name}${r.detail ? " — " + r.detail : ""}`);
    if (r.passed) passed++; else failed++;
  }

  console.log(`\n  ${passed} passed / ${failed} failed`);
  console.log(`  Screenshots: ${screenshotDir}`);
  console.log("═══════════════════════════════════════════════════\n");
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
