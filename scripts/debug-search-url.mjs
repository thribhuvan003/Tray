import { chromium } from "playwright";

async function run() {
  console.log("🚀 Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("http://localhost:5599/c/great-hall-canteen/menu", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000); // wait for hydration

  const searchInput = page.locator("input[placeholder='Search for dishes...']");
  await searchInput.fill("Crimson");
  console.log("Filled input with 'Crimson'");

  // Wait and check URL in a loop for up to 5 seconds
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(500);
    const url = page.url();
    const val = await searchInput.inputValue();
    console.log(`[${i*500}ms] URL: "${url}" | Input value: "${val}"`);
  }

  await browser.close();
}

run().catch(console.error);
