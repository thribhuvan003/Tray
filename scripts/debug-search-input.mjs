import { chromium } from "playwright";

async function run() {
  console.log("🚀 Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("console", msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });

  page.on("pageerror", err => {
    console.error(`[BROWSER ERROR] ${err}`);
  });

  await page.goto("http://localhost:5599/c/great-hall-canteen/menu", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000); // wait for hydration

  const searchInput = page.locator("input[placeholder='Search for dishes...']");
  await searchInput.focus();
  await searchInput.click();
  
  console.log("Typing 'Burger'...");
  await page.keyboard.type("Burger", { delay: 100 });
  await page.waitForTimeout(1000);

  const inputValue = await searchInput.inputValue();
  console.log(`Input value after typing: "${inputValue}"`);
  console.log(`Current URL: ${page.url()}`);

  await browser.close();
}

run().catch(console.error);
