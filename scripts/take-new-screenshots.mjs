import { chromium, devices } from "playwright";
import path from "path";
import fs from "fs";

const outDir = "C:\\Users\\ntena\\.gemini\\antigravity\\brain\\4a9ccf34-47a9-448a-bc9a-f53f7cddd31f";

async function run() {
  console.log("🚀 Launching browser...");
  const browser = await chromium.launch({ headless: true });
  
  // ── DESKTOP FLOW ──
  console.log("🖥️ Testing Desktop view...");
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  
  console.log("Navigating to student menu page...");
  await page.goto("http://localhost:5599/c/great-hall-canteen/menu", { waitUntil: "networkidle" });
  
  // Wait for canteen-bar to be visible
  await page.waitForSelector(".canteen-bar", { timeout: 10000 }).catch(() => console.log("Canteen bar not found, continuing..."));
  
  console.log("Capturing desktop initial menu...");
  await page.screenshot({ path: path.join(outDir, "student_desktop_menu.png") });
  
  // Add some items
  console.log("Adding items to tray...");
  const addButtons = page.locator('button:has-text("Add")');
  const count = await addButtons.count();
  if (count > 0) {
    await addButtons.first().click();
    await page.waitForTimeout(800);
    const newAddButtons = page.locator('button:has-text("Add")');
    if (await newAddButtons.count() > 0) {
      await newAddButtons.first().click();
      await page.waitForTimeout(800);
    }
  } else {
    // Try to find specials add buttons
    const specialAdd = page.locator('article button:has-text("Add")');
    if (await specialAdd.count() > 0) {
      await specialAdd.first().click();
      await page.waitForTimeout(800);
    }
  }
  
  console.log("Capturing desktop menu with floating cart button...");
  await page.screenshot({ path: path.join(outDir, "student_desktop_cart_floating.png") });
  
  // Open the tray via header cart button
  console.log("Opening tray via header cart button...");
  await page.click('button[aria-label="Open tray"]');
  await page.waitForTimeout(800); // wait for slide animation
  
  console.log("Capturing open slide-over tray...");
  await page.screenshot({ path: path.join(outDir, "student_desktop_cart_open.png") });
  
  await page.close();
  await context.close();
  
  // ── MOBILE FLOW ──
  console.log("📱 Testing Mobile view...");
  const mobileContext = await browser.newContext({
    ...devices["iPhone 12"],
    deviceScaleFactor: 2
  });
  const mobilePage = await mobileContext.newPage();
  
  console.log("Navigating to student menu on mobile...");
  await mobilePage.goto("http://localhost:5599/c/great-hall-canteen/menu", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(1000);
  
  console.log("Capturing mobile initial menu...");
  await mobilePage.screenshot({ path: path.join(outDir, "student_mobile_menu_new.png") });
  
  // Add an item
  console.log("Adding item to tray on mobile...");
  const mAddButtons = mobilePage.locator('button:has-text("Add")');
  if (await mAddButtons.count() > 0) {
    await mAddButtons.first().click();
    await mobilePage.waitForTimeout(800);
  }
  
  console.log("Capturing mobile menu with sticky bottom cart bar...");
  await mobilePage.screenshot({ path: path.join(outDir, "student_mobile_cart_bar_new.png") });
  
  // Click Browse Menu floating button
  console.log("Clicking floating Browse Menu button...");
  await mobilePage.click('button:has-text("Browse Menu")');
  await mobilePage.waitForTimeout(500);
  
  console.log("Capturing open mobile category browse drawer...");
  await mobilePage.screenshot({ path: path.join(outDir, "student_mobile_browse_drawer.png") });
  
  await mobilePage.close();
  await mobileContext.close();
  
  await browser.close();
  console.log("✅ All screenshots taken successfully!");
}

run().catch(err => {
  console.error("❌ Error running script:", err);
  process.exit(1);
});
