import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import pw from '/tmp/pw/node_modules/playwright/index.js';
const { chromium } = pw;

const ROOT = path.resolve('public');
const OUT = path.resolve('.screenshots');
fs.mkdirSync(OUT, { recursive: true });

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.json': 'application/json', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff',
};

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/' || p === '') p = '/demo/index.html';
  let fp = path.join(ROOT, p);
  if (fs.existsSync(fp) && fs.statSync(fp).isDirectory()) fp = path.join(fp, 'index.html');
  if (!fs.existsSync(fp)) { res.statusCode = 404; res.end('nf'); return; }
  res.setHeader('content-type', MIME[path.extname(fp)] || 'application/octet-stream');
  fs.createReadStream(fp).pipe(res);
});

await new Promise((r) => server.listen(5055, r));
const base = 'http://127.0.0.1:5055';

const shots = [
  { name: '01-landing-hero',  url: '/demo/index.html',   w: 1440, h: 900,  full: false },
  { name: '01b-landing-full', url: '/demo/index.html',   w: 1440, h: 900,  full: true,  reveal: true },
];

async function autoScroll(page) {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const step = Math.round(window.innerHeight * 0.7);
    const max = document.body.scrollHeight;
    for (let y = 0; y <= max; y += step) { window.scrollTo(0, y); await sleep(220); }
    window.scrollTo(0, 0); await sleep(400);
  });
}

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
for (const s of shots) {
  const ctx = await browser.newContext({
    viewport: { width: s.w, height: s.h },
    deviceScaleFactor: 2,
    isMobile: !!s.mobile,
    hasTouch: !!s.mobile,
  });
  const page = await ctx.newPage();
  try {
    await page.goto(base + s.url, { waitUntil: 'load', timeout: 20000 });
  } catch (e) {
    console.log('goto warn', s.name, e.message);
  }
  // let fonts + entry animations settle
  await page.waitForTimeout(2800);
  if (s.reveal) await autoScroll(page);
  const file = path.join(OUT, s.name + '.png');
  await page.screenshot({ path: file, fullPage: s.full });
  console.log('saved', file);
  await ctx.close();
}
await browser.close();
server.close();
console.log('done');
