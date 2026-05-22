import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // Log console messages
  page.on("console", (msg) => console.log(`[CONSOLE] ${msg.type()}: ${msg.text()}`));
  page.on("pageerror", (err) => console.error(`[PAGE ERROR] ${err.message}`));

  try {
    console.log("Navigating to login page...");
    await page.goto("http://localhost:3005/login?tenant=aditya&next=/c/aditya/admin/menu/new", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    fs.mkdirSync(".debug-screenshots", { recursive: true });
    await page.screenshot({ path: ".debug-screenshots/01-loaded.png" });
    console.log("Screenshot saved: 01-loaded.png");

    const htmlBefore = await page.content();
    fs.writeFileSync(".debug-screenshots/before.html", htmlBefore);
    console.log("HTML source before click saved.");

    console.log("Locating 'I own a canteen' buttons...");
    const buttons = page.locator('button');
    const count = await buttons.count();
    console.log(`Found ${count} buttons on page.`);
    for (let i = 0; i < count; i++) {
      const text = await buttons.nth(i).innerText();
      console.log(`  Button ${i}: "${text.replace(/\n/g, ' ')}"`);
    }

    const card = page.locator('button:has-text("I own a canteen")').first();
    const visible = await card.isVisible();
    console.log(`Card 'I own a canteen' visible: ${visible}`);

    console.log("Clicking 'I own a canteen' card...");
    await card.click();
    await page.waitForTimeout(2000);

    await page.screenshot({ path: ".debug-screenshots/02-clicked.png" });
    console.log("Screenshot saved: 02-clicked.png");

    const htmlAfter = await page.content();
    fs.writeFileSync(".debug-screenshots/after.html", htmlAfter);
    console.log("HTML source after click saved.");

  } catch (err) {
    console.error("Error occurred:", err);
  } finally {
    await browser.close();
  }
}

run();
