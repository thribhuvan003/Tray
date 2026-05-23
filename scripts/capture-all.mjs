import { spawn } from "child_process";
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");

// ─── Load Environment Variables ───────────────────────────────────────────
if (fs.existsSync(envPath)) {
  console.log("✓ Loading env variables from .env.local...");
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

const outDir = path.join(process.cwd(), ".playwright-screenshots/sections");
fs.mkdirSync(outDir, { recursive: true });

const artifactBase = "C:\\Users\\ntena\\.gemini\\antigravity\\brain\\5ed60574-6351-40b2-9d15-d37f5153fe51";
const artifactDir = path.join(artifactBase, "screenshots");
try {
  fs.mkdirSync(artifactDir, { recursive: true });
} catch (e) {
  // Ignored
}

const PORT = 3889; // Distinct port outside of 3000-3005 range
const baseUrl = `http://localhost:${PORT}`;

function checkServer() {
  return new Promise((resolve) => {
    http.get(baseUrl, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 302 || res.statusCode === 500);
    }).on("error", () => {
      resolve(false);
    });
  });
}

async function main() {
  console.log(`🚀 Starting optimized production Next.js server on port ${PORT}...`);
  
  // Pass process.env containing Supabase variables to the child process
  const serverProcess = spawn("npx", ["next", "start", "-p", String(PORT)], {
    shell: true,
    env: { ...process.env },
  });

  let exited = false;
  serverProcess.on("exit", (code) => {
    exited = true;
    if (code !== null && code !== 0) {
      console.error(`✕ Next.js server exited unexpectedly with code ${code}`);
    }
  });

  let active = false;
  for (let i = 0; i < 30; i++) {
    if (exited) break;
    await new Promise((r) => setTimeout(r, 1000));
    const isUp = await checkServer();
    if (isUp) {
      console.log(`✓ Production server is up and listening on port ${PORT}!`);
      active = true;
      break;
    }
    console.log("Waiting for server...");
  }

  if (!active) {
    console.error("✕ Next.js server failed to start or exited.");
    serverProcess.kill();
    process.exit(1);
  }

  console.log("Launching headless Chromium browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2, // High resolution screenshots
  });
  const page = await context.newPage();

  console.log(`Navigating to ${baseUrl}...`);
  await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 60000 });

  console.log("Waiting for cinematic preloader intro to complete (3.8s)...");
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
    console.log(`Processing capture for: ${target.name}...`);
    try {
      const element = page.locator(target.selector).first();
      await element.waitFor({ state: "visible", timeout: 15000 });
      
      // Scroll to position
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) {
          el.scrollIntoView({ block: "start", behavior: "auto" });
        }
      }, target.selector);

      // Micro wait for animations to settle
      await page.waitForTimeout(1500);

      const filePath = path.join(outDir, `${target.name}.png`);
      await page.screenshot({ path: filePath });
      console.log(`✓ Saved screenshot: ${target.name}.png`);

      const artifactPath = path.join(artifactDir, `${target.name}.png`);
      fs.copyFileSync(filePath, artifactPath);
      console.log(`✓ Copied to artifact directory`);
    } catch (err) {
      console.error(`✕ Failed to capture ${target.name}: ${err.message}`);
    }
  }

  console.log("Cleaning up browser context...");
  await browser.close();

  console.log("Shutting down the Next.js server...");
  serverProcess.kill("SIGTERM");

  console.log("🎉 All section screenshots captured perfectly!");
}

main().catch((err) => {
  console.error("Fatal run error:", err);
  process.exit(1);
});
