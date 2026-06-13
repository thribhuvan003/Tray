import fs from 'node:fs';
import path from 'node:path';
import pw from '/tmp/pw/node_modules/playwright/index.js';
const { chromium } = pw;

const OUT = path.resolve('video/animatic/cards');
fs.mkdirSync(OUT, { recursive: true });

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@800;900&family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;600;800&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">`;

const BASE = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;overflow:hidden}
.card{width:1920px;height:1080px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:140px;position:relative}
.disp{font-family:'Anton',sans-serif;text-transform:uppercase;letter-spacing:-.01em;line-height:.94}
.serif-it{font-family:'Instrument Serif',serif;font-style:italic}
.mono{font-family:'Geist Mono',monospace;letter-spacing:.18em;text-transform:uppercase}
.body{font-family:'Manrope',sans-serif}
.eyebrow{font-family:'Geist Mono',monospace;letter-spacing:.32em;text-transform:uppercase;font-size:24px;opacity:.65;margin-bottom:46px}
.sub{font-family:'Manrope',sans-serif;font-weight:600;font-size:34px;line-height:1.45;margin-top:54px;max-width:1180px;opacity:.82}
.dot{display:inline-block;width:26px;height:26px;border-radius:50%;vertical-align:middle;margin-left:24px}
/* themes */
.dark{background:radial-gradient(120% 90% at 18% -10%,rgba(239,106,58,.20),transparent 55%),#0e0a06;color:#f5efe4}
.cream{background:radial-gradient(120% 90% at 82% -10%,rgba(239,106,58,.10),transparent 55%),#ECE5D6;color:#1a140e}
.kcream{background:#f4e6c1;color:#2a160a}
.graph{background:#0e110d;color:#f4f3ea}
.persimmon{color:#ef6a3a}.red{color:#e60000}.tomato{color:#d52821}.lime{color:#b6e600}.limed{color:#8fb305}
`;

const cards = [
  { id: 'c01-hook', theme: 'dark', html: `
    <div class="eyebrow">Peak lunch · the canteen line</div>
    <div class="disp" style="font-size:340px;color:#f5efe4">12<span class="persimmon">:</span>47</div>
    <div class="sub">Thirteen minutes to class. Seven people deep.<br>Twenty students shouting. Paper chits. Cash. A kitchen that can't hear you.</div>` },

  { id: 'c02-stakes', theme: 'dark', html: `
    <div class="disp" style="font-size:128px">A samosa is not worth a</div>
    <div class="serif-it red" style="font-size:170px;margin-top:10px">debarred semester.</div>
    <div class="sub">Miss the line, miss the class. Lost attendance over a plate of food.</div>` },

  { id: 'c03-trap', theme: 'dark', html: `
    <div class="eyebrow">And the counter's only options are worse</div>
    <div class="disp" style="font-size:150px">Drown in cash &amp; paper —</div>
    <div class="disp" style="font-size:150px;margin-top:8px">or give <span class="persimmon">15–30%</span> away</div>
    <div class="sub">A commission to Swiggy &amp; Zomato that a small campus canteen simply can't afford.</div>` },

  { id: 'c04-reveal', theme: 'cream', html: `
    <div class="eyebrow" style="opacity:.8">● Campus edition · live</div>
    <div class="disp" style="font-size:124px">Multi-tenant canteen<br>management for <span class="serif-it red" style="font-size:150px">colleges.</span></div>
    <div class="sub" style="font-weight:800;opacity:1">Shopify for campus canteens — 0% commission. No code.</div>` },

  { id: 'c05-student', theme: 'cream', html: `
    <div class="disp" style="font-size:200px">Student<span class="dot" style="background:#e60000;width:40px;height:40px"></span></div>
    <div class="mono" style="font-size:30px;margin-top:40px;opacity:.7">Choose canteen · order · UPI · track · OTP</div>` },

  { id: 'c06-kitchen', theme: 'kcream', html: `
    <div class="disp" style="font-size:200px">Kitchen<span class="dot" style="background:#d52821;width:40px;height:40px"></span></div>
    <div class="mono" style="font-size:30px;margin-top:40px;opacity:.7">Live queue · prep · verify OTP</div>` },

  { id: 'c07-admin', theme: 'graph', html: `
    <div class="disp" style="font-size:200px">Admin<span class="dot" style="background:#b6e600;width:40px;height:40px"></span></div>
    <div class="mono" style="font-size:30px;margin-top:40px;opacity:.7">Revenue · orders · live activity feed</div>` },

  { id: 'c08-zero', theme: 'cream', html: `
    <div class="disp" style="font-size:420px;line-height:.85"><span class="limed">0%</span></div>
    <div class="disp" style="font-size:96px;margin-top:20px">commission</div>
    <div class="sub">Payments settle straight to each canteen's own bank, via UPI.</div>` },

  { id: 'c09-rows', theme: 'graph', html: `
    <div class="disp" style="font-size:170px"><span class="lime">Zero rows.</span></div>
    <div class="disp" style="font-size:96px;margin-top:14px">never a leaked one</div>
    <div class="sub">Tenant isolation enforced inside Postgres — not in code you have to remember.</div>` },

  { id: 'c10-samosa', theme: 'cream', html: `
    <div class="disp" style="font-size:120px">Two students. One last samosa.</div>
    <div class="disp" style="font-size:200px;margin-top:18px"><span class="red">Charged ×1.</span></div>
    <div class="sub">Atomic capture + idempotency. No double-sell. No double-charge.</div>` },

  { id: 'c11-impact', theme: 'cream', html: `
    <div class="disp" style="font-size:150px">~12 minutes back,</div>
    <div class="serif-it red" style="font-size:180px;margin-top:6px">every lunch.</div>
    <div class="sub">The line was never about food. It was about coordination.</div>` },

  { id: 'c12-end', theme: 'dark', html: `
    <div class="disp" style="font-size:200px">Tray<span class="dot" style="background:#ef6a3a;width:40px;height:40px"></span></div>
    <div class="mono persimmon" style="font-size:34px;margin-top:30px">trayy.vercel.app</div>
    <div class="body" style="font-weight:800;font-size:46px;margin-top:36px">Built solo by Thribhuvan</div>
    <div class="mono" style="font-size:24px;margin-top:22px;opacity:.6">191 commits · 27 migrations · shipped &amp; live</div>` },
];

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox','--disable-dev-shm-usage'] });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
for (const c of cards) {
  const doc = `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE}</style></head><body><div class="card ${c.theme}">${c.html}</div></body></html>`;
  await page.setContent(doc, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, c.id + '.png') });
  console.log('card', c.id);
}
await browser.close();
console.log('CARDS DONE');
