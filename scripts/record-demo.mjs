import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import pw from '/tmp/pw/node_modules/playwright/index.js';
const { chromium } = pw;

const ROOT = path.resolve('public');
const OUT = path.resolve('video/footage');
fs.mkdirSync(OUT, { recursive: true });
const RAW = path.resolve('video/footage/_raw');
fs.mkdirSync(RAW, { recursive: true });

const MIME = { '.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json','.ico':'image/x-icon','.woff2':'font/woff2','.woff':'font/woff' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/' || p === '') p = '/demo/index.html';
  let fp = path.join(ROOT, p);
  if (fs.existsSync(fp) && fs.statSync(fp).isDirectory()) fp = path.join(fp, 'index.html');
  if (!fs.existsSync(fp)) { res.statusCode = 404; res.end('nf'); return; }
  res.setHeader('content-type', MIME[path.extname(fp)] || 'application/octet-stream');
  fs.createReadStream(fp).pipe(res);
});
await new Promise((r) => server.listen(5066, r));
const base = 'http://127.0.0.1:5066';

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

async function clip(name, w, h, fn) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, recordVideo: { dir: RAW, size: { width: w, height: h } } });
  const page = await ctx.newPage();
  try { await fn(page); } catch (e) { console.log('WARN', name, e.message); }
  const vid = page.video();
  await ctx.close();
  const src = await vid.path();
  const dst = path.join(RAW, name + '.webm');
  fs.renameSync(src, dst);
  console.log('clip', name, '->', dst);
}

const wait = (p, ms) => p.waitForTimeout(ms);

// 1) STUDENT FLOW
await clip('student-flow', 1240, 840, async (page) => {
  await page.goto(base + '/demo/student.html', { waitUntil: 'load' });
  await wait(page, 2200);
  // show multi-canteen: click a different canteen then back
  const seg = page.locator('[data-canteen]');
  if (await seg.count() > 1) { await seg.nth(1).click().catch(()=>{}); await wait(page, 1100); await seg.nth(0).click().catch(()=>{}); await wait(page, 900); }
  // add a few items (fly-to-cart animation)
  const add = page.locator('[data-action="add"]');
  const n = Math.min(3, await add.count());
  for (let i = 0; i < n; i++) { await add.nth(i).click().catch(()=>{}); await wait(page, 850); }
  await wait(page, 700);
  // checkout
  const ck = page.locator('#btnCheckoutDesktop');
  if (await ck.isVisible().catch(()=>false)) await ck.click({ force: true }).catch(()=>{});
  else await page.locator('#btnCheckoutMobile').click({ force: true }).catch(()=>{});
  await wait(page, 2200); // show UPI / payment view
  await page.locator('#btnPaid').click({ force: true }).catch(()=>{});
  await wait(page, 12500); // confirming -> preparing -> ready -> OTP flip-in
  await wait(page, 2600); // hold on OTP
});

// 2) KITCHEN ADVANCE
await clip('kitchen-advance', 1600, 900, async (page) => {
  await page.goto(base + '/demo/kitchen.html', { waitUntil: 'load' });
  await wait(page, 2400);
  const cols = ['incoming', 'preparing', 'ready'];
  for (let round = 0; round < 5; round++) {
    for (const c of cols) {
      const card = page.locator(`.col-body[data-col="${c}"] > *`).first();
      if (await card.count() && await card.isVisible().catch(()=>false)) {
        await card.click().catch(()=>{});
        await wait(page, 1500);
        // dismiss any OTP verify modal so the queue stays visible
        await page.keyboard.press('Escape').catch(()=>{});
        break;
      }
    }
  }
  await wait(page, 1500);
});

// 3) ADMIN LIVE FEED
await clip('admin-feed', 1600, 900, async (page) => {
  await page.goto(base + '/demo/admin.html', { waitUntil: 'load' });
  await wait(page, 3000);             // KPI count-up animation
  await page.mouse.wheel(0, 600); await wait(page, 4500);  // reveal chart + heatmap + feed
  await page.mouse.wheel(0, 500); await wait(page, 6000);  // let live feed tick
  await page.mouse.wheel(0, -1100); await wait(page, 1500);
});

await browser.close();
server.close();
console.log('RECORDING DONE');
