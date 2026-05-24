import { chromium } from "playwright";
import path from "path";

const outDir = "C:\\Users\\ntena\\.gemini\\antigravity\\brain\\4a9ccf34-47a9-448a-bc9a-f53f7cddd31f";

async function run() {
  console.log("🚀 Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  
  console.log("Navigating to student menu page...");
  await page.goto("http://localhost:5599/c/great-hall-canteen/menu", { waitUntil: "networkidle" });
  
  console.log("Waiting for switcher container...");
  const trigger = page.locator(".canteen-switcher-container button").first();
  await trigger.waitFor({ state: "visible", timeout: 10000 });
  
  console.log("Clicking the dropdown trigger...");
  await trigger.click();
  
  // Wait for the dropdown options menu to animate in
  console.log("Waiting for dropdown menu...");
  await page.waitForTimeout(800);
  
  console.log("Taking screenshot of the open dropdown in student nav bar...");
  await page.screenshot({ path: path.join(outDir, "student_nav_dropdown.png") });
  
  await page.close();
  await context.close();
  await browser.close();
  console.log("✅ Screenshot saved as student_nav_dropdown.png");
}

run().catch(err => {
  console.error("❌ Error running script:", err);
  process.exit(1);
});
