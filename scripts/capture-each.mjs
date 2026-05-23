import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const outDir = path.join(process.cwd(), ".playwright-screenshots/sections");
fs.mkdirSync(outDir, { recursive: true });

const artifactBase = "C:\\Users\\ntena\\.gemini\\antigravity\\brain\\5ed60574-6351-40b2-9d15-d37f5153fe51";
const artifactDir = path.join(artifactBase, "screenshots");
try {
  fs.mkdirSync(artifactDir, { recursive: true });
} catch (e) {
  // Ignored
}

const PORT = 3890;
const baseUrl = `http://localhost:${PORT}`;

async function main() {
  console.log(`Connecting to server on port ${PORT}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2, // High resolution screenshots
  });
  const page = await context.newPage();

  console.log(`Navigating to ${baseUrl}...`);
  await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 60000 });

  console.log("Waiting for preloader to clear...");
  await page.waitForTimeout(3800);

  const targets = [
    { name: "01-hero-section", selector: "#main" }, // Hero is at top of main
    { name: "02-campus-ticker-section", selector: "[data-ticker-track]" },
    { name: "03-try-demo-section", selector: "#try-demo" },
    { name: "04-portals-section", selector: "#portals" },
    { name: "05-trust-section", selector: "#trust" },
    { name: "06-campus-model-section", selector: "#campus" },
    { name: "07-sync-section", selector: "#sync" },
    { name: "08-kitchen-quote-section", selector: "section:has(blockquote)" },
    { name: "09-flow-section", selector: "#flow" },
    { name: "10-tech-stack-section", selector: "#stack" },
    { name: "11-closing-section", selector: "#closing" },
    { name: "12-footer-section", selector: "footer.tl-footer" },
  ];

  for (const target of targets) {
    console.log(`Capturing: ${target.name}...`);
    try {
      const element = page.locator(target.selector).first();
      await element.waitFor({ state: "visible", timeout: 10000 });
      
      // Scroll to position
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) {
          el.scrollIntoView({ block: "start", behavior: "auto" });
        }
      }, target.selector);

      // Wait 1.5s for smooth transitions and text animations to complete
      await page.waitForTimeout(1500);

      const filePath = path.join(outDir, `${target.name}.png`);
      await page.screenshot({ path: filePath });
      console.log(`✓ Saved screenshot: ${target.name}.png`);

      const artifactPath = path.join(artifactDir, `${target.name}.png`);
      fs.copyFileSync(filePath, artifactPath);
    } catch (err) {
      console.error(`✕ Failed to capture ${target.name}: ${err.message}`);
    }
  }

  await browser.close();
  console.log("🎉 All high-resolution screenshots generated successfully!");
}

main().catch((err) => {
  console.error("Fatal error during execution:", err);
  process.exit(1);
});
