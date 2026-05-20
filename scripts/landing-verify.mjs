import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const outDir = path.join(process.cwd(), ".playwright-screenshots");
fs.mkdirSync(outDir, { recursive: true });

const baseUrl = process.env.LANDING_URL || "http://localhost:3000";
const consoleErrors = [];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(String(err)));

const shot = async (name) => {
  const p = path.join(outDir, name);
  await page.screenshot({ path: p, fullPage: false });
  return p;
};

await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(2500);

const paths = {};
paths.hero = await shot("01-hero-load.png");

const heroCheck = await page.evaluate(() => {
  const root = document.querySelector(".tray-landing");
  const word = document.querySelector(".tray-landing .tl-h1 .tl-word");
  const op = (el) => {
    if (!el) return null;
    const s = getComputedStyle(el);
    return { opacity: s.opacity, visibility: s.visibility };
  };
  return {
    hasMotionReady: root?.classList.contains("tl-motion-ready"),
    hasAnimInit: root?.classList.contains("tl-anim-init"),
    wordOpacity: op(word),
    heroText: document.querySelector(".tray-landing .tl-h1")?.textContent?.slice(0, 100) || "",
  };
});

await page.evaluate(() => window.scrollTo(0, 400));
await page.waitForTimeout(800);
paths.navScrolled = await shot("02-navbar-scrolled.png");

const scrollCheck1 = await page.evaluate(() => {
  const nav = document.querySelector(".tray-landing .tl-nav");
  const bar = document.querySelector(".tray-landing .tl-scroll-progress");
  const barStyle = bar ? getComputedStyle(bar) : null;
  const m = barStyle?.transform?.match(/matrix\(([^)]+)\)/);
  let scaleX = 0;
  if (m) {
    const parts = m[1].split(",").map((x) => parseFloat(x.trim()));
    scaleX = parts[0] || 0;
  }
  return {
    navIsScrolled: nav?.classList.contains("is-scrolled"),
    progressScaleX: scaleX,
    scrollY: window.scrollY,
  };
});

const scrollToId = async (id, file) => {
  await page.locator(`#${id}`).scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  paths[file.replace(".png", "")] = await shot(file);
};

await scrollToId("system", "03-system.png");
await scrollToId("sync", "04-sync.png");
await scrollToId("flow", "05-flow.png");

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(2500);
paths.mobileHero = await shot("06-mobile-hero.png");
await page.evaluate(() => window.scrollTo(0, 300));
await page.waitForTimeout(600);
paths.mobileNav = await shot("07-mobile-nav-scrolled.png");

const gsapErrors = consoleErrors.filter((e) => /gsap|landingmotion|scrolltrigger/i.test(e));

const pass = {
  heroVisible: heroCheck.wordOpacity && parseFloat(heroCheck.wordOpacity.opacity) > 0.5,
  motionReady: heroCheck.hasMotionReady,
  navScrolled: scrollCheck1.navIsScrolled,
  progressBar: scrollCheck1.progressScaleX > 0.01,
  noGsapConsoleErrors: gsapErrors.length === 0,
};

const report = {
  url: baseUrl,
  paths,
  heroCheck,
  scrollCheck1,
  consoleErrors: consoleErrors.slice(0, 25),
  gsapErrors,
  pass,
};

fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

await browser.close();
