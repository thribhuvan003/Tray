import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const outDir = path.join(process.cwd(), ".playwright-screenshots/sections");
fs.mkdirSync(outDir, { recursive: true });

// Copy to artifact directory if available
const artifactBase = "C:\\Users\\ntena\\.gemini\\antigravity\\brain\\5ed60574-6351-40b2-9d15-d37f5153fe51";
const artifactDir = path.join(artifactBase, "screenshots");
try {
  fs.mkdirSync(artifactDir, { recursive: true });
} catch (e) {
  // Ignored
}

const baseUrl = process.env.LANDING_URL || "http://localhost:3005";

async function main() {
  console.log(`Launching headless Chromium... Target: ${baseUrl}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2, // High-resolution retina screenshots
  });
  const page = await context.newPage();

  // Handle cookies or overlays if any
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log(`[Browser Console Error]: ${msg.text()}`);
    }
  });

  console.log(`Navigating to ${baseUrl}...`);
  await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 60000 });
  
  // Wait for cinematic intro/preloader to finish (Intro is 3.0s, let's wait 3.5s to be absolutely sure the page is settled)
  console.log("Waiting for cinematic preloader intro to complete...");
  await page.waitForTimeout(3800);

  const targets = [
    { name: "01-hero-section", selector: "#hero" },
    { name: "02-campus-ticker-section", selector: ".tl-ticker" },
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
    console.log(`Capturing ${target.name}...`);
    try {
      const element = page.locator(target.selector).first();
      await element.waitFor({ state: "visible", timeout: 15000 });
      
      // Scroll exactly to center or align nicely in viewport
      await element.scrollIntoViewIfNeeded();
      
      // Additional micro wait for smooth scrolling/animations to settle
      await page.waitForTimeout(1000);

      const filePath = path.join(outDir, `${target.name}.png`);
      
      // Get bounding box of the element to take a perfect element screenshot if desired,
      // or take a viewport screenshot centered on it.
      const box = await element.boundingBox();
      if (box) {
        // If element is smaller than viewport, capture full viewport centered on it
        // Or if it fits nicely, capture viewport screenshot
        await page.screenshot({ path: filePath });
      } else {
        await page.screenshot({ path: filePath });
      }

      console.log(`✓ Saved to ${filePath}`);

      // Copy to artifact screenshots directory
      const artifactPath = path.join(artifactDir, `${target.name}.png`);
      fs.copyFileSync(filePath, artifactPath);
      console.log(`✓ Copied to artifact: ${artifactPath}`);
    } catch (err) {
      console.error(`✕ Failed to capture ${target.name}: ${err.message}`);
    }
  }

  await browser.close();
  console.log("All screenshots captured successfully!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
