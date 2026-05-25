import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { resolveTenant, getTenantSlugFromHeaders } from "@/lib/tenant";
import { requireRole } from "@/lib/auth/get-user";
import fs from "fs";
import path from "path";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const h = await headers();
  const slug = getTenantSlugFromHeaders(h);
  const tenant = await resolveTenant(slug);
  
  if (!tenant) {
    return new NextResponse("Tenant Not Found", { status: 404 });
  }

  const user = await requireRole(["kitchen_staff", "canteen_admin", "super_admin"]);
  if (!user) {
    return NextResponse.redirect(new URL(`/c/${tenant.slug}/login?next=/c/${tenant.slug}/kitchen`, req.url));
  }

  // Read the original static HTML file
  const htmlPath = path.join(process.cwd(), "public", "demo", "kitchen.html");
  
  let html = "";
  try {
    html = fs.readFileSync(htmlPath, "utf-8");
  } catch (error) {
    return new NextResponse("Demo HTML not found", { status: 500 });
  }

  // Normalize CRLF to LF for reliable regex matching across Windows and Unix environments
  html = html.replace(/\r\n/g, "\n");

  // 1. Force isLiveMode to true so the JS bypasses mock data and hits our live API
  // We inject isLiveMode = true at the start of the head tag, along with Supabase SDK & neo-pulse styles
  html = html.replace(
    "<head>",
    `<head>
<script>let isLiveMode = true;</script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<style>
.auto-item:hover {
  background: var(--cream-soft) !important;
}
.cart-row b {
  color: var(--tomato) !important;
}
#walkInModal .modal {
  background: var(--paper) !important;
  border: 2px solid var(--ink) !important;
  border-radius: 12px !important;
  box-shadow: 5px 5px 0 var(--ink) !important;
  padding: 24px !important;
}
@keyframes neoPulse {
  0% {
    box-shadow: 5px 5px 0 var(--ink);
    border-color: var(--ink);
  }
  50% {
    box-shadow: 0 0 15px var(--tomato);
    border-color: var(--tomato);
    background-color: var(--tomato-soft);
  }
  100% {
    box-shadow: 5px 5px 0 var(--ink);
    border-color: var(--ink);
  }
}
.new-order-flash {
  animation: neoPulse 1.5s infinite ease-in-out !important;
  position: relative !important;
}
.new-order-flash::after {
  content: "NEW ORDER" !important;
  position: absolute !important;
  top: -8px !important;
  right: 12px !important;
  background: var(--tomato) !important;
  color: white !important;
  font-family: var(--mono), monospace !important;
  font-size: 9px !important;
  font-weight: 700 !important;
  padding: 2px 6px !important;
  border-radius: 4px !important;
  border: 1px solid var(--ink) !important;
  box-shadow: 2px 2px 0 var(--ink) !important;
  letter-spacing: 0.06em !important;
  z-index: 10 !important;
}
@keyframes headerPulse {
  0% { background: var(--paper); }
  50% { background: var(--tomato-soft); color: var(--tomato); }
  100% { background: var(--paper); }
}
.column-flash {
  animation: headerPulse 1.5s infinite ease-in-out !important;
}
</style>`
  );

  // 2. Inject the true Canteen ID
  html = html.replace(
    /let currentCanteenId\s*=\s*TD\.getSelectedCanteenId\(\);?/g,
    `let currentCanteenId = "${tenant.slug}";`
  );

  // 3. Inject the exact tenant name so the "Aditya Eng. Canteen" is fully replaced dynamically
  // The HTML has: <title>Tray Kitchen — Aditya Engineering Canteen</title>
  html = html.replace(
    /<title>.*<\/title>/,
    `<title>Tray Kitchen — ${tenant.name}</title>`
  );

  // 4. Correct relative imports/links for Next.js routing context
  html = html.replace(
    /src="demo-canteens.js"/g,
    'src="/demo/demo-canteens.js"'
  );
  html = html.replace(
    /href="student.html"/g,
    `href="/c/${tenant.slug}/menu"`
  );
  html = html.replace(
    /href="admin.html"/g,
    `href="/c/${tenant.slug}/admin/dashboard"`
  );

  // 4b. Inject Walk-in Modal and update "+ Walk-in order" button trigger
  html = html.replace(
    /onclick="manualPush\(\)"/g,
    'onclick="openWalkIn()"'
  );
  html = html.replace(
    "<!-- OTP MODAL -->",
    `<!-- WALK-IN ORDER MODAL -->
<div class="modal-scrim" id="walkInModal">
  <div class="modal" onclick="event.stopPropagation()" style="max-width: 480px; width: 100%;">
    <span class="eyebrow" style="color:var(--tomato)">New Order</span>
    <h2 style="font-family:var(--display); font-size:26px; margin-bottom:4px;">Walk-in <span class="it">Order.</span></h2>
    <p class="sub" style="margin-bottom: 16px; font-size:13px; color:var(--ink-2);">Search/select items or type item ID/name to add them to this walk-in ticket.</p>
    
    <div style="display: flex; gap: 8px; margin-bottom: 12px; align-items: center;">
      <div style="flex: 1; position: relative;">
        <input id="walkInItemInput" placeholder="Type Item Name or ID..." style="width: 100%; padding: 10px 12px; border: 2px solid var(--ink); border-radius: 8px; font-family: var(--sans); background: var(--paper); color: var(--ink); font-size: 13px;" autocomplete="off"/>
        <div id="walkInAutocomplete" style="position: absolute; top: 100%; left: 0; right: 0; background: var(--paper); border: 2px solid var(--ink); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-height: 200px; overflow-y: auto; z-index: 1010; display: none; text-align: left;"></div>
      </div>
      <input id="walkInQtyInput" type="number" min="1" value="1" style="width: 65px; padding: 10px 8px; border: 2px solid var(--ink); border-radius: 8px; text-align: center; font-family: var(--mono); background: var(--paper); color: var(--ink); font-size: 13px;"/>
      <button class="btn btn-pri btn-sm" onclick="addWalkInItem()" style="padding: 0 16px; height: 38px; min-height: 38px; font-size: 12px; font-weight: 600; border: 2px solid var(--ink);">Add</button>
    </div>

    <div id="walkInCart" style="border: 2px solid var(--ink); border-radius: 8px; min-height: 80px; max-height: 180px; overflow-y: auto; padding: 10px; margin-bottom: 16px; background: var(--cream-soft); display: flex; flex-direction: column; gap: 8px; text-align: left;">
      <div id="walkInCartEmpty" style="text-align: center; color: var(--ink-3); padding: 24px 0; font-size: 13px;">No items added yet.</div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-top: 1px dashed var(--line); padding-top: 12px;">
      <span style="font-size: 13px; color: var(--ink-2); font-weight: 600;">Total Amount:</span>
      <span id="walkInTotal" style="font-family: var(--mono); font-weight: 700; font-size: 19px; color: var(--tomato);">₹0.00</span>
    </div>

    <div class="actions" style="margin-top: 0; display: flex; justify-content: flex-end; gap: 8px;">
      <button class="btn btn-ghost btn-sm" onclick="closeWalkIn()">Cancel</button>
      <button class="btn btn-tomato btn-sm" id="walkInSubmitBtn" onclick="submitWalkIn()">Create Order</button>
    </div>
  </div>
</div>

<!-- OTP MODAL -->`
  );

  // 5. Inject actual logged-in user details in sidebar
  const displayName = user.displayName || user.email || "Kitchen Staff";
  const avatarChar = displayName.charAt(0).toUpperCase();
  const roleLabel = user.role === "canteen_admin" ? "CANTEEN ADMIN" : user.role === "super_admin" ? "SUPER ADMIN" : "KITCHEN STAFF";
  
  html = html.replace(
    /<div class="sb-user">[\s\S]*?<\/aside>/g,
    `<div class="sb-user">
        <div class="av">${avatarChar}</div>
        <div class="info"><div class="n">${displayName}</div><div class="r">${roleLabel}</div></div>
      </div>
    </div>
  </aside>`
  );

  // 6. Hide canteen select dropdown and render plain text canteen label badge in the top bar
  html = html.replace(
    /<select id="kitchenCanteen"[^>]*><\/select>/g,
    `<div class="btn btn-ghost btn-sm" style="pointer-events:none; border:1px solid var(--line); background:var(--paper); font-weight:600; color:var(--ink-2); display:inline-flex; align-items:center; gap:8px; border-radius:8px; padding:6px 12px; font-size:13px">${tenant.name}</div>`
  );

  // 10. Empty out the "Today's special." input fields so admins can add their own specials from scratch
  html = html.replace(
    /value="Hyderabadi Dum Biryani"/g,
    'value=""'
  );
  html = html.replace(
    /Slow-cooked, sealed in dum/g,
    ''
  );
  html = html.replace(
    /value="240"/g,
    'value="" placeholder="e.g. 150"'
  );
  html = html.replace(
    /value="8"/g,
    'value="" placeholder="e.g. 10"'
  );
  html = html.replace(
    /<button data-d="nonveg" class="active">/g,
    '<button data-d="nonveg">'
  );

  // 10b. Intercept applyCanteen inputs overwrite in JS to prevent restoring Biryani defaults in Live Mode
  html = html.replace(
    "  const d = c.spDefaults;\n  if (document.getElementById('spName')) {\n    document.getElementById('spName').value = d.name;\n    document.getElementById('spDesc').value = d.desc;\n    document.getElementById('spPrice').value = d.price;\n    document.getElementById('spPrep').value = d.prep;\n    document.getElementById('spDiet').value = d.diet;\n  }",
    `  const d = isLiveMode ? { name: "", desc: "", price: "", prep: "", diet: "veg" } : c.spDefaults;
  if (document.getElementById('spName')) {
    document.getElementById('spName').value = d.name;
    document.getElementById('spDesc').value = d.desc;
    document.getElementById('spPrice').value = d.price;
    document.getElementById('spPrep').value = d.prep;
    document.querySelectorAll('#spDiet button').forEach(b => {
      if (b.dataset.d === d.diet) {
        b.classList.add('active');
        formDiet = b.dataset.d;
      } else {
        b.classList.remove('active');
      }
    });
  }`
  );

  // 11. Remove the hardcoded mock statistics and delta for Collected Today
  html = html.replace(
    /<div class="val" id="kColl">38<\/div>/g,
    '<div class="val" id="kColl">0</div>'
  );
  html = html.replace(
    /<div class="delta up">↑12% vs yesterday<\/div>/g,
    '<div class="delta up" style="display:none"></div>'
  );

  // 11b. Replace live KPI collected counter updater in renderQueue
  html = html.replace(
    "  $('#kColl').textContent = String(38 + orders.filter(o=>o.status==='collected').length);",
    "  $('#kColl').textContent = String(isLiveMode ? orders.filter(o=>o.status==='collected').length : (38 + orders.filter(o=>o.status==='collected').length));"
  );

  // 12. Make buildHistory dynamic and clean up simulated archive rows in Live Mode
  html = html.replace(
    "function buildHistory(){\n  const rows = [];\n  // current collected first\n  orders.filter(o=>o.status==='collected').forEach(o => {\n    rows.push({id:o.id, t:o.placedAt, items:o.items, total:o.total, stud:o.student, recent:true});\n  });\n  // simulated archive\n  const dishPool = DISH.concat(specials.map(s=>({name:s.name,diet:s.diet,tgt:s.prep})));\n  for (let i=0;i<28;i++){\n    const oid = `T-${counter - (i+12)}`;\n    const t = Date.now() - (i*9+18)*60000;\n    const it = dishPool[Math.floor(Math.random()*dishPool.length)];\n    const qty = 1 + Math.floor(Math.random()*2);\n    const total = (priceOf(it.name) || 150) * qty;\n    rows.push({id:oid, t, items:[{...it, q:qty}], total, stud:STUDENTS[(i*3+1)%STUDENTS.length], recent:false});\n  }\n  return rows;\n}",
    `function buildHistory(){
  const rows = [];
  orders.filter(o=>o.status==='collected').forEach(o => {
    rows.push({id:o.id, t:o.placedAt, items:o.items, total:o.total, stud:o.student, recent:true});
  });
  if (isLiveMode) {
    return rows.sort((a,b) => b.t - a.t);
  }
  const dishPool = DISH.concat(specials.map(s=>({name:s.name,diet:s.diet,tgt:s.prep})));
  for (let i=0;i<28;i++){
    const oid = \`T-\${counter - (i+12)}\`;
    const t = Date.now() - (i*9+18)*60000;
    const it = dishPool[Math.floor(Math.random()*dishPool.length)];
    if (!it) continue;
    const qty = 1 + Math.floor(Math.random()*2);
    const total = (priceOf(it.name) || 150) * qty;
    rows.push({id:oid, t, items:[Object.assign({}, it, {q:qty})], total, stud:STUDENTS[(i*3+1)%STUDENTS.length] || "Student", recent:false});
  }
  return rows;
}`
  );

  // 13. Dynamic renderHistory empty state handling in Live Mode
  html = html.replace(
    "function renderHistory(){\n  const rows = buildHistory();\n  const total = rows.reduce((a,r)=>a+r.total,0);\n  historyView.innerHTML = `\n    <div class=\"page-head\">",
    `function renderHistory(){
  const rows = buildHistory();
  const total = rows.reduce((a,r)=>a+r.total,0);
  if (isLiveMode && rows.length === 0) {
    historyView.innerHTML = \`
      <div class="page-head">
        <div class="l">
          <span class="eyebrow">Last 24 hours · 0 completed</span>
          <h1>Order <span class="it">history.</span></h1>
          <div class="sub">
            <span class="clk">₹0 total</span>
            <span class="live"><span class="d"></span>Auto-refreshes as orders complete</span>
          </div>
        </div>
      </div>
      <div class="queue-board" style="padding:40px 20px;text-align:center;color:var(--ink-3)">
        <div style="font-size:32px;margin-bottom:12px">∅</div>
        No completed orders today yet.<br/>Active orders will show up here once they are collected.
      </div>\`;
    return;
  }
  historyView.innerHTML = \`
    <div class="page-head">`
  );

  // 14. Make renderInsights dynamic based strictly on active canteen orders and menu in Live Mode
  html = html.replace(
    "function renderInsights(){\n  const collectedToday = 38 + orders.filter(o=>o.status==='collected').length;\n  const liveRev = orders.filter(o=>o.status==='collected').reduce((a,o)=>a+o.total,0);\n  const revenue = collectedToday * 162 + liveRev;\n  const avgTicket = Math.round(revenue/Math.max(1,collectedToday));\n  const topItems = [\n    {n:'Chicken Biryani', d:'nonveg', c:18, p:92},\n    {n:'Masala Dosa',     d:'veg',    c:14, p:74},\n    {n:'Veg Thali',       d:'veg',    c:11, p:58},\n    {n:'Paneer Butter Masala', d:'veg', c:9, p:48},\n    {n:'Filter Coffee',   d:'veg',    c:7,  p:36},\n  ];",
    `function renderInsights(){
  const collectedToday = isLiveMode ? orders.filter(o=>o.status==='collected').length : (38 + orders.filter(o=>o.status==='collected').length);
  const liveRev = orders.filter(o=>o.status==='collected').reduce((a,o)=>a+o.total,0);
  const revenue = isLiveMode ? liveRev : (collectedToday * 162 + liveRev);
  const avgTicket = Math.round(revenue/Math.max(1,collectedToday));
  let topItems = [];
  if (isLiveMode) {
    const counts = {};
    orders.forEach(o => {
      o.items.forEach(it => {
        if (!counts[it.name]) {
          counts[it.name] = { name: it.name, diet: it.diet, count: 0 };
        }
        counts[it.name].count += it.q;
      });
    });
    const sorted = Object.values(counts).sort((a,b) => b.count - a.count);
    const maxCount = sorted.length > 0 ? sorted[0].count : 1;
    topItems = sorted.slice(0, 5).map(item => ({
      n: item.name,
      d: item.diet,
      c: item.count,
      p: Math.round((item.count / maxCount) * 100)
    }));
  } else {
    topItems = [
      {n:'Chicken Biryani', d:'nonveg', c:18, p:92},
      {n:'Masala Dosa',     d:'veg',    c:14, p:74},
      {n:'Veg Thali',       d:'veg',    c:11, p:58},
      {n:'Paneer Butter Masala', d:'veg', c:9, p:48},
      {n:'Filter Coffee',   d:'veg',    c:7,  p:36},
    ];
  }`
  );

  // 15. Make the insights HTML render dynamic weekday headers, deltas, and handle empty state for Top Items
  html = html.replace(
    `  insightsView.innerHTML = \`
    <div class="page-head">
      <div class="l">
        <span class="eyebrow">Tuesday · lunch service</span>
        <h1>Kitchen <span class="it">insights.</span></h1>
        <div class="sub">
          <span class="clk">\${new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})}</span>
          <span class="live"><span class="d"></span>Updates as queue advances</span>
        </div>
      </div>
    </div>
    <div class="kpi-bar">
      <div class="kpi"><div class="lbl">Orders served</div><div class="val">\${collectedToday}</div><div class="delta up">↑ 12% vs yesterday</div></div>
      <div class="kpi"><div class="lbl">Revenue today</div><div class="val"><span class="acc serif-it">₹\${revenue.toLocaleString('en-IN')}</span></div><div class="delta">avg ₹\${avgTicket} / ticket</div></div>
      <div class="kpi"><div class="lbl">Avg prep time</div><div class="val">6:24</div><div class="delta">target 7:00 · on track</div></div>
      <div class="kpi"><div class="lbl">Peak window</div><div class="val" style="font-size:22px">12:30–1:30</div><div class="delta">62% of day's orders</div></div>
    </div>
    <div class="queue-board" style="padding:0;overflow:hidden">
      <div style="padding:18px 18px 8px;border-bottom:1px solid var(--line);display:flex;align-items:baseline;justify-content:space-between">
        <h3 style="font-family:var(--display);font-size:22px;font-weight:500;color:var(--ink)">Top items <span class="it">today.</span></h3>
        <span class="badge" style="font-family:var(--mono);font-size:10.5px;letter-spacing:0.06em;text-transform:uppercase;color:var(--ink-3)">By units sold</span>
      </div>
      <div class="ins-list">
        \${topItems.map((it,i)=>\`
          <div class="ins-row">
            <span class="ins-rk">\${String(i+1).padStart(2,'0')}</span>
            <div class="ins-info">
              <div class="ins-n"><span class="veg-dot \${it.d==='nonveg'?'nv':''}" style="display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:7px;vertical-align:middle"></span>\${it.n}</div>
              <div class="ins-bar"><i style="width:\${it.p}%"></i></div>
            </div>
            <span class="ins-c">\${it.c}<small>orders</small></span>
          </div>\`).join('')}
      </div>
    </div>\`;`,
    `  const weekdayEyebrow = isLiveMode ? new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) : "Tuesday · lunch service";
  const ordersServedDelta = isLiveMode ? "Today's completed orders" : "↑ 12% vs yesterday";
  
  let avgPrepTimeStr = "6:24";
  let prepTimeDeltaStr = "target 7:00 · on track";
  if (isLiveMode) {
    const prepTimes = [];
    orders.forEach(o => {
      const end = o.readyAt || o.collectedAt;
      if (end && o.placedAt) {
        const diffMin = (end - o.placedAt) / 60000;
        if (diffMin > 0 && diffMin < 120) {
          prepTimes.push(diffMin);
        }
      }
    });
    if (prepTimes.length > 0) {
      const avgMin = prepTimes.reduce((a,b)=>a+b, 0) / prepTimes.length;
      const mins = Math.floor(avgMin);
      const secs = Math.round((avgMin - mins) * 60);
      avgPrepTimeStr = \`\${mins}:\${String(secs).padStart(2,'0')}\`;
      if (avgMin <= 7) {
        prepTimeDeltaStr = \`target 7:00 · on track\`;
      } else {
        prepTimeDeltaStr = \`target 7:00 · slow service\`;
      }
    } else {
      avgPrepTimeStr = "—";
      prepTimeDeltaStr = "No prep time data yet";
    }
  }

  let peakWindowStr = "12:30–1:30";
  let peakPctStr = "62% of day's orders";
  if (isLiveMode) {
    if (orders.length > 0) {
      const hours = Array(24).fill(0);
      orders.forEach(o => {
        const date = new Date(o.placedAt);
        hours[date.getHours()]++;
      });
      let maxHour = 12;
      let maxCount = 0;
      for (let h = 0; h < 24; h++) {
        if (hours[h] > maxCount) {
          maxCount = hours[h];
          maxHour = h;
        }
      }
      const startHour = maxHour;
      const endHour = (maxHour + 1) % 24;
      const pad = (h) => String(h).padStart(2, '0');
      peakWindowStr = \`\${pad(startHour)}:00–\${pad(endHour)}:00\`;
      const peakPct = Math.round((maxCount / orders.length) * 100);
      peakPctStr = \`\${peakPct}% of day's orders\`;
    } else {
      peakWindowStr = "—";
      peakPctStr = "0 orders placed today";
    }
  }

  insightsView.innerHTML = \`
    <div class="page-head">
      <div class="l">
        <span class="eyebrow">\${weekdayEyebrow}</span>
        <h1>Kitchen <span class="it">insights.</span></h1>
        <div class="sub">
          <span class="clk">\${new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})}</span>
          <span class="live"><span class="d"></span>Updates as queue advances</span>
        </div>
      </div>
    </div>
    <div class="kpi-bar">
      <div class="kpi"><div class="lbl">Orders served</div><div class="val">\${collectedToday}</div><div class="delta up">\${ordersServedDelta}</div></div>
      <div class="kpi"><div class="lbl">Revenue today</div><div class="val"><span class="acc serif-it">₹\${revenue.toLocaleString('en-IN')}</span></div><div class="delta">avg ₹\${avgTicket} / ticket</div></div>
      <div class="kpi"><div class="lbl">Avg prep time</div><div class="val">\${avgPrepTimeStr}</div><div class="delta">\${prepTimeDeltaStr}</div></div>
      <div class="kpi"><div class="lbl">Peak window</div><div class="val" style="font-size:22px">\${peakWindowStr}</div><div class="delta">\${peakPctStr}</div></div>
    </div>
    <div class="queue-board" style="padding:0;overflow:hidden">
      <div style="padding:18px 18px 8px;border-bottom:1px solid var(--line);display:flex;align-items:baseline;justify-content:space-between">
        <h3 style="font-family:var(--display);font-size:22px;font-weight:500;color:var(--ink)">Top items <span class="it">today.</span></h3>
        <span class="badge" style="font-family:var(--mono);font-size:10.5px;letter-spacing:0.06em;text-transform:uppercase;color:var(--ink-3)">By units sold</span>
      </div>
      <div class="ins-list">
        \${topItems.length === 0 ? \`<div style="padding:40px 20px;text-align:center;color:var(--ink-3)">No items sold yet today.</div>\` : topItems.map((it,i)=>\`
          <div class="ins-row">
            <span class="ins-rk">\${String(i+1).padStart(2,'0')}</span>
            <div class="ins-info">
              <div class="ins-n"><span class="veg-dot \${it.d==='nonveg'?'nv':''}" style="display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:7px;vertical-align:middle"></span>\${it.n}</div>
              <div class="ins-bar"><i style="width:\${it.p}%"></i></div>
            </div>
            <span class="ins-c">\${it.c}<small>orders</small></span>
          </div>\`).join('')}
      </div>
    </div>\`;`
  );

  // Inject the live sync override script right before the end of the body
  const liveSyncScript = `
<script>
(function() {
  // Bind global lexical variables to window for components/external code that expect them
  window.isLiveMode = true;
  window.isSimulationActive = false;
  window.currentCanteenId = currentCanteenId;

  // Update the global lexical variables directly to control template logic
  isLiveMode = true;
  isSimulationActive = false;

  // ── Fix static eyebrow date immediately ───────────────────────────────
  (function fixEyebrow() {
    const el = document.getElementById('kitchenEyebrow');
    if (el) {
      const now = new Date();
      const dayStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const hour = now.getHours();
      const service = hour < 11 ? 'Breakfast service' : hour < 15 ? 'Lunch service' : hour < 19 ? 'Dinner service' : 'Late service';
      el.textContent = dayStr + ' · ' + service;
    }
  })();

  // ── Override renderQueue to remove the fake +38 collected offset ──────
  // We will replace the KPI collected count after every render with live-only data.
  // Store original renderQueue reference; our pollLiveData wrapper will handle the KPI fix.
  const _origRenderQueue2 = window.renderQueue;
  if (_origRenderQueue2) {
    window.renderQueue = function() {
      _origRenderQueue2();
      // In live mode: show ONLY real collected count (no fake +38 demo offset)
      const collectedEl = document.getElementById('kColl');
      if (collectedEl && window.isLiveMode) {
        const liveCollected = (window._liveOrders || orders).filter(o => o.status === 'collected').length;
        collectedEl.textContent = String(liveCollected).padStart(2, '0');
      }
      // Fix static delta texts on KPI bar
      const kpiBar = document.querySelector('.kpi-bar.queue-page-chrome');
      if (kpiBar && window.isLiveMode) {
        const deltas = kpiBar.querySelectorAll('.delta');
        if (deltas[0]) deltas[0].textContent = 'active orders';
        if (deltas[1]) deltas[1].textContent = 'in preparation';
        if (deltas[2]) deltas[2].textContent = 'awaiting pickup';
        if (deltas[3]) deltas[3].textContent = "today's completed";
      }
    };
  }

  // ── Override buildHistory to only show real collected orders ──────────
  window.buildHistory = function() {
    const liveOrders = window._liveOrders || orders || [];
    const rows = [];
    liveOrders.filter(o => o.status === 'collected').forEach(o => {
      rows.push({
        id: o.id,
        t: o.collectedAt || o.placedAt,
        items: o.items || [],
        total: o.total || 0,
        stud: o.student || 'Counter',
        recent: true
      });
    });
    // Sort most recently collected first
    rows.sort((a, b) => (b.t || 0) - (a.t || 0));
    return rows;
  };

  // ── Override renderHistory with full date-picker + API-powered version ──
  window._historyDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD, default = today

  function _fmtHistTime(ts) {
    if (!ts) return '--:--';
    const d = new Date(typeof ts === 'number' ? ts : ts);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  function _renderHistoryRows(rows, eyebrow, totalRev, dateLabel) {
    const historyView = document.getElementById('historyView');
    if (!historyView) return;
    const today = new Date().toISOString().slice(0, 10);
    const isToday = window._historyDate === today;
    const datePickerHtml = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:0">' +
      '<input type="date" id="histDatePicker" value="' + window._historyDate + '" max="' + today + '"' +
      ' style="font-family:var(--mono);font-size:11px;letter-spacing:0.08em;border:1px solid var(--line-2);background:var(--cream-4);color:var(--ink);border-radius:5px;padding:4px 8px;cursor:pointer;outline:none"' +
      ' onchange="window._historyDate=this.value;window.renderHistory();">' +
      (isToday ? '' : '<button class="btn btn-ghost btn-sm" onclick="window._historyDate=\''+today+'\';window.renderHistory()">Today</button>') +
      '</div>';
    const totalStr = '\u20b9' + Math.round(totalRev).toLocaleString('en-IN');
    const headerHtml = '<div class="page-head"><div class="l"><span class="eyebrow">' + eyebrow + '</span>' +
      '<h1>Order <span class="it">history.</span></h1>' +
      '<div class="sub"><span class="clk">' + totalStr + ' total</span>' +
      (isToday ? '<span class="live"><span class="d"></span>Live · auto-refreshes</span>' : '') +
      '</div></div>' +
      '<div class="r">' + datePickerHtml + '</div></div>';
    if (rows.length === 0) {
      historyView.innerHTML = headerHtml +
        '<div class="queue-board" style="padding:40px;text-align:center;color:var(--ink-3);font-family:var(--mono);font-size:13px">' +
        'No completed orders for ' + dateLabel + '. Try a different date.' +
        '</div>';
      return;
    }
    const tbody = rows.map(function(r) {
      const it = (r.items && r.items[0]) || { name: '\u2014', q: 1 };
      const extra = (r.items && r.items.length > 1) ? ' <span class="mono">+' + (r.items.length - 1) + '</span>' : '';
      const statusHtml = r.status === 'collected' ? '<span class="stat-pill">\u2713 Done</span>' :
        r.status === 'rejected' ? '<span class="stat-pill" style="background:var(--tomato)/15;color:var(--tomato)">Rejected</span>' :
        '<span class="stat-pill" style="opacity:0.5">' + (r.status || '?') + '</span>';
      return '<tr><td><span class="hist-id">' + r.id + '</span></td>' +
        '<td class="mono">' + _fmtHistTime(r.placedAt || r.t) + '</td>' +
        '<td>' + (r.student || r.stud || 'Counter') + '</td>' +
        '<td>' + it.name + extra + '</td>' +
        '<td class="mono">' + (it.q || it.qty || 1) + '\u00d7</td>' +
        '<td class="r mono">\u20b9' + Math.round(r.total || 0) + '</td>' +
        '<td class="r">' + statusHtml + '</td></tr>';
    }).join('');
    historyView.innerHTML = headerHtml +
      '<div class="queue-board" style="padding:0;overflow:hidden">' +
      '<table class="hist-table"><thead><tr>' +
      '<th>Ticket</th><th>Time</th><th>Customer</th><th>Item</th><th>Qty</th>' +
      '<th class="r">Total</th><th class="r">Status</th>' +
      '</tr></thead><tbody>' + tbody + '</tbody></table></div>';
  }

  window.renderHistory = function() {
    const historyView = document.getElementById('historyView');
    if (!historyView) return;
    const today = new Date().toISOString().slice(0, 10);
    const targetDate = window._historyDate || today;

    if (targetDate === today) {
      // Use live data from window._liveOrders
      const liveOrders = window._liveOrders || orders || [];
      const rows = liveOrders.filter(function(o) { return o.status === 'collected'; })
        .sort(function(a, b) { return (b.collectedAt || b.placedAt || 0) - (a.collectedAt || a.placedAt || 0); });
      const totalRev = rows.reduce(function(a, o) { return a + (o.total || 0); }, 0);
      _renderHistoryRows(rows, 'Today \u00b7 ' + rows.length + ' completed', totalRev, 'today');
    } else {
      // Fetch from kitchen history API
      historyView.innerHTML = '<div class="page-head"><div class="l">' +
        '<span class="eyebrow">Loading ' + targetDate + '...</span>' +
        '<h1>Order <span class="it">history.</span></h1></div>' +
        '<div class="r"><div style="display:flex;align-items:center;gap:8px">' +
        '<input type="date" id="histDatePicker" value="' + targetDate + '" max="' + today + '"' +
        ' style="font-family:var(--mono);font-size:11px;border:1px solid var(--line-2);background:var(--cream-4);color:var(--ink);border-radius:5px;padding:4px 8px;cursor:pointer"' +
        ' onchange="window._historyDate=this.value;window.renderHistory();">' +
        '<button class="btn btn-ghost btn-sm" onclick="window._historyDate=\''+today+'\';window.renderHistory()">Today</button>' +
        '</div></div></div>' +
        '<div style="padding:40px;text-align:center;color:var(--ink-3)">\u23f3 Loading history for ' + targetDate + '...</div>';
      const tenantId = window.currentCanteenId || '';
      fetch('/api/kitchen/history?tenant=' + encodeURIComponent(tenantId) + '&date=' + encodeURIComponent(targetDate))
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.error) {
            const hv = document.getElementById('historyView');
            if (hv) hv.innerHTML = '<div style="padding:40px;text-align:center;color:var(--tomato)">Error: ' + data.error + '</div>';
            return;
          }
          const dateLabel = new Date(targetDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
          const eyebrow = dateLabel + ' \u00b7 ' + data.stats.collected + ' completed';
          _renderHistoryRows(data.orders || [], eyebrow, data.stats.revenue, dateLabel);
        })
        .catch(function(err) {
          const hv = document.getElementById('historyView');
          if (hv) hv.innerHTML = '<div style="padding:40px;text-align:center;color:var(--tomato)">Failed to load history. Check network.</div>';
        });
    }
  };

  // Keep a global reference to _liveOrders (updated in pollLiveData) for history/insights
  window._liveOrders = [];

  // ── Fix kitchen column heights for proper scrolling ────────────────────
  (function fixColHeights() {
    const style = document.createElement('style');
    style.textContent = [
      '.col-body{max-height:calc(100vh - 260px)!important;overflow-y:auto!important}',
      '.col{height:calc(100vh - 190px)!important;min-height:200px!important}',
      '.queue-cols{height:100%!important}',
      '.queue-board{height:calc(100vh - 175px)!important}',
      '.queue-shell{height:calc(100vh - 160px)!important}',
    ].join('');
    document.head.appendChild(style);
  })();

  const seenOrderIds = new Set();
  const flashingOrderIds = {}; // idKey -> timestamp
  let columnFlashUntil = 0;
  
  function playChime() {
    if (!soundsOn) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playNote = (freq, delay, duration) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + delay);
        gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + delay + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + delay);
        osc.stop(audioCtx.currentTime + delay + duration);
      };
      playNote(659.25, 0, 0.8);
      playNote(830.61, 0.08, 0.8);
    } catch (err) {
      console.warn("Audio Context failed to play chime:", err);
    }
  }

  async function pollLiveData() {
    try {
      const res = await fetch(\`/api/kitchen/data?tenant=\${currentCanteenId}\`);
      if (!res.ok) return;
      const data = await res.json();
      
      const isInitialLoad = seenOrderIds.size === 0;
      let hasNewIncoming = false;
      const now = Date.now();
      
      data.orders.forEach(o => {
        const idKey = o.dbId || o.id;
        if (!seenOrderIds.has(idKey)) {
          seenOrderIds.add(idKey);
          if (o.status === 'incoming') {
            hasNewIncoming = true;
            flashingOrderIds[idKey] = now;
          }
        }
      });
      
      if (hasNewIncoming && !isInitialLoad) {
        playChime();
        columnFlashUntil = now + 10000;
      }
      
      // Update global lexical state
      orders = data.orders;
      specials = data.specials;
      // Update _liveOrders reference for buildHistory / renderInsights / renderQueue override
      window._liveOrders = data.orders;
      // Cache menu items for walk-in autocomplete (no second HTTP call needed)
      if (data.menuItems && data.menuItems.length > 0) {
        window.liveMenuItems = data.menuItems;
      }
      
      renderQueue();
      renderLiveSpecials();
      
      if (!document.getElementById('historyView').hidden) {
        renderHistory();
      }
      if (!document.getElementById('insightsView').hidden) {
        renderInsights();
      }
    } catch (err) {
      console.error("Failed to poll kitchen data:", err);
    }
  }

  window.advance = async function(id) {
    const o = orders.find(x => x.id === id);
    if (!o) return;
    const targetId = o.dbId || o.id;
    const nextStatus = { incoming: 'preparing', preparing: 'ready', ready: 'collected' }[o.status];
    if (nextStatus) {
      o.status = nextStatus;
      if (nextStatus === 'preparing') o.placedAt = Date.now();
      if (nextStatus === 'preparing') delete flashingOrderIds[targetId];
      document.getElementById('qStat').innerHTML = \`Last update: <span class="serif-it stat">\${o.id} → \${nextStatus}</span>\`;
      if (nextStatus === 'collected') toast(\`✓ Handed over · \${o.id}\`);
      renderQueue();
    }
    try {
      const res = await fetch('/api/kitchen/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'advance', tenant: currentCanteenId, orderId: targetId })
      });
      if (!res.ok) {
        toast('✕ Error updating order');
        await pollLiveData();
      }
    } catch (err) {
      console.error(err);
      toast('✕ Network error');
      await pollLiveData();
    }
  };

  window.confirmOtp = async function() {
    const entered = Array.from(document.querySelectorAll('.otp-in input')).map(i => i.value.replace(/\D/g, '')).join('');
    if (!pendingOtp) return closeOtp();
    if (entered.length < 4) {
      toast('Enter all 4 digits');
      return;
    }
    const targetId = pendingOtp.dbId || pendingOtp.id;
    try {
      const res = await fetch('/api/kitchen/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-otp', tenant: currentCanteenId, orderId: targetId, otp: entered })
      });
      if (!res.ok) {
        toast('✕ Error verifying OTP');
        return;
      }
      const data = await res.json();
      if (data.ok) {
        // Instant optimistic update — realtime event from order_events will confirm
        pendingOtp.status = 'collected';
        renderQueue();
        closeOtp();
        toast('✓ Verified · order handed over');
        // No pollLiveData needed — realtime INSERT on order_events fires debouncedPollLiveData
      } else {
        toast('✕ Code does not match. Try again.');
        document.querySelectorAll('.otp-in input').forEach(i => i.value = '');
        document.querySelectorAll('.otp-in input')[0].focus();
      }
    } catch (err) {
      console.error(err);
      toast('✕ Network error');
    }
  };

  window.manualPush = async function() {
    try {
      const res = await fetch('/api/kitchen/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'walk-in', tenant: currentCanteenId })
      });
      if (!res.ok) {
        toast('✕ Error creating walk-in order');
        return;
      }
      toast('✓ Walk-in order created');
      await pollLiveData();
    } catch (err) {
      console.error(err);
      toast('✕ Network error');
    }
  };

  window.renderLiveSpecials = function() {
    const host = document.getElementById('liveSpecials');
    if (!host) return;
    if (!specials.length){
      host.innerHTML = \`<div class="empty-state"><div class="ic">∅</div>No specials yet today.<br/>Add one above to push it live.</div>\`;
      return;
    }
    host.innerHTML = specials.map(s => \`
      <div class="live-spec">
        <span class="nm"><span class="veg-dot vd \${s.diet==='nonveg'?'nv':''}"></span><span class="nm-text">\${s.name}</span></span>
        <span class="pr">₹\${s.price}</span>
        <span class="rm" data-id="\${s.id}">REMOVE</span>
      </div>
    \`).join('');
    host.querySelectorAll('.rm').forEach(b => b.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/kitchen/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'special-remove', tenant: currentCanteenId, itemId: b.dataset.id })
        });
        if (!res.ok) {
          toast('✕ Error removing special');
          return;
        }
        toast('Removed from live menu');
        await pollLiveData();
      } catch (err) {
        console.error(err);
        toast('✕ Network error');
      }
    }));
  };

  // Monkey-patch renderQueue to dynamically inject neo-pulse pulsing CSS classes 
  // on Incoming header and cards. Keeps DOM logic extremely fast and optimized.
  const originalRenderQueue = window.renderQueue;
  window.renderQueue = function() {
    originalRenderQueue();
    const now = Date.now();

    // 1. Column Header Highlight
    const colHead = document.querySelector('[data-status="incoming"] .col-head');
    if (colHead) {
      if (now < columnFlashUntil) {
        colHead.classList.add('column-flash');
      } else {
        colHead.classList.remove('column-flash');
      }
    }

    // 2. Ticket Card Highlight
    document.querySelectorAll('[data-col="incoming"] .ticket').forEach(tk => {
      const actBtn = tk.querySelector('.tkt-action');
      if (!actBtn) return;
      const orderId = actBtn.dataset.id;
      const o = orders.find(x => x.id === orderId);
      if (!o) return;
      const idKey = o.dbId || o.id;

      const flashTime = flashingOrderIds[idKey];
      if (flashTime && (now - flashTime < 10000) && o.status === 'incoming') {
        tk.classList.add('new-order-flash');
      } else {
        tk.classList.remove('new-order-flash');
        delete flashingOrderIds[idKey];
      }
    });
  };

  // Continuously refresh ticket flashing classes every second so they fade out cleanly
  setInterval(() => {
    if (window.renderQueue) {
      window.renderQueue();
    }
  }, 1000);

  const originalApplyCanteen = window.applyCanteen;
  window.applyCanteen = function(id) {
    originalApplyCanteen(id);
    
    // Maintain state overrides
    window.isLiveMode = true;
    window.isSimulationActive = false;
    isLiveMode = true;
    isSimulationActive = false;
    
    if (window.livePollInterval) {
      clearInterval(window.livePollInterval);
    }
    if (window.realtimeChannel) {
      window.supabaseClient.removeChannel(window.realtimeChannel);
    }
    
    pollLiveData();
    
    // Setup Supabase Realtime for instant sync (WebSocket)
    const supabaseUrl = "${env.NEXT_PUBLIC_SUPABASE_URL}";
    const supabaseAnonKey = "${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}";
    
    if (!window.supabaseClient) {
      window.supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            "x-tenant-id": "${tenant.id}"
          }
        }
      });
    }
    
    let pollTimeout = null;
    function debouncedPollLiveData() {
      if (pollTimeout) clearTimeout(pollTimeout);
      pollTimeout = setTimeout(() => {
        pollLiveData();
      }, 50);
    }
    
    window.realtimeChannel = window.supabaseClient
      .channel('kitchen-realtime-v2')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'order_events', filter: 'tenant_id=eq.${tenant.id}' },
        (payload) => {
          const newRow = payload.new || {};
          const eventType = newRow.event_type;
          const evPayload = newRow.payload || {};
          const orderId = newRow.order_id;
          const now = Date.now();

          // ── Instant zero-latency status update (no HTTP round-trip) ──
          if (eventType === 'placed' || (eventType === 'status_changed' && evPayload.to === 'placed')) {
            // Brand-new order arriving from student payment
            const orderData = evPayload.order;
            const lines = evPayload.lines || [];
            if (orderData && !orders.find(o => (o.dbId || o.id) === orderData.id)) {
              const mapped = {
                dbId: orderData.id,
                id: orderData.short_code ? (orderData.short_code.startsWith('T-') ? orderData.short_code : 'T-' + orderData.short_code) : (newRow.order_id || ''),
                items: lines.map(l => ({ name: l.name_snapshot, diet: l.diet_snapshot, q: l.qty, special: false, tgt: 6 })),
                total: (orderData.total_paise || 0) / 100,
                otp: '0000',
                status: 'incoming',
                placedAt: orderData.placed_at ? new Date(orderData.placed_at).getTime() : now,
                readyAt: null,
                collectedAt: null,
                target: 360,
                student: orderData.customer_name || 'Student',
              };
              orders.push(mapped);
              const idKey = mapped.dbId || mapped.id;
              seenOrderIds.add(idKey);
              flashingOrderIds[idKey] = now;
              columnFlashUntil = now + 10000;
              playChime();
              renderQueue();
            }
            // Always do a background reconcile to get OTP + accurate data
            debouncedPollLiveData();
            return;
          }

          if (['preparing', 'ready', 'collected', 'rejected', 'expired', 'cancelled_by_kitchen', 'cancelled_by_student'].includes(eventType)) {
            // Status transition — update in-place instantly
            const o = orders.find(x => (x.dbId || x.id) === orderId || x.id === orderId);
            if (o) {
              const statusMap = { preparing: 'preparing', ready: 'ready', collected: 'collected', rejected: 'collected', expired: 'collected', cancelled_by_kitchen: 'collected', cancelled_by_student: 'collected' };
              o.status = statusMap[eventType] || eventType;
              if (eventType === 'ready') o.readyAt = now;
              if (eventType === 'collected' || eventType === 'rejected') o.collectedAt = now;
              document.getElementById('qStat').innerHTML = 'Last update: <span class="serif-it stat">' + o.id + ' \u2192 ' + eventType + '</span>';
              renderQueue();
              // Immediately update history/insights if visible (order status changed)
              const histView = document.getElementById('historyView');
              const insView = document.getElementById('insightsView');
              if (histView && !histView.hidden) renderHistory();
              if (insView && !insView.hidden) renderInsights();
            }
            debouncedPollLiveData();
            return;
          }

          // Generic fallback: just refresh
          debouncedPollLiveData();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Kitchen] Realtime channel active — zero-lag sync enabled');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.warn('[Kitchen] Realtime channel lost — relying on 15s fallback poll');
        }
      });
      
    // Fallback heartbeat poll every 15s (realtime is primary)
    window.livePollInterval = setInterval(pollLiveData, 15000);
  };

  const pushBtn = document.getElementById('spPush');
  if (pushBtn) {
    const newPushBtn = pushBtn.cloneNode(true);
    pushBtn.parentNode.replaceChild(newPushBtn, pushBtn);
    newPushBtn.addEventListener('click', async () => {
      const name = document.getElementById('spName').value.trim() || "Today's special";
      const desc = document.getElementById('spDesc').value.trim();
      const price = Number(document.getElementById('spPrice').value) || 0;
      const prep = Number(document.getElementById('spPrep').value) || 5;
      try {
        const res = await fetch('/api/kitchen/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'special-push', tenant: currentCanteenId, name, description: desc, price, prep, diet: formDiet })
        });
        if (!res.ok) {
          toast('✕ Error pushing special');
          return;
        }
        toast(\`✓ Pushed live · "\${name}"\`);
        
        const s = SAMPLES[sampleIdx % SAMPLES.length];
        sampleIdx++;
        document.getElementById('spName').value = s.name;
        document.getElementById('spDesc').value = s.desc;
        document.getElementById('spPrice').value = s.price;
        document.getElementById('spPrep').value = s.prep;
        document.querySelectorAll('#spDiet button').forEach(b => b.classList.toggle('active', b.dataset.d === s.diet));
        formDiet = s.diet;
        
        await pollLiveData();
      } catch (err) {
        console.error(err);
        toast('✕ Network error');
      }
    });
  }

  window.applyCanteen(currentCanteenId);

  // Walk-in Cart implementation — menu items are already cached by pollLiveData
  window.liveMenuItems = [];
  let walkInCart = [];
  // pollLiveData already sets window.liveMenuItems from data.menuItems.

  window.openWalkIn = function() {
    walkInCart = [];
    document.getElementById('walkInItemInput').value = '';
    delete document.getElementById('walkInItemInput').dataset.selectedId;
    document.getElementById('walkInQtyInput').value = '1';
    document.getElementById('walkInAutocomplete').style.display = 'none';
    renderWalkInCart();
    document.getElementById('walkInModal').classList.add('open');
    document.getElementById('walkInItemInput').focus();
  };

  window.closeWalkIn = function() {
    document.getElementById('walkInModal').classList.remove('open');
  };

  const input = document.getElementById('walkInItemInput');
  const autoDiv = document.getElementById('walkInAutocomplete');

  input.addEventListener('input', () => {
    const val = input.value.trim().toLowerCase();
    if (!val) {
      autoDiv.style.display = 'none';
      return;
    }
    const items = window.liveMenuItems && window.liveMenuItems.length > 0 
      ? window.liveMenuItems 
      : (DISH || []).map((d, i) => ({ id: \`demo-\\\${i}\`, name: d.name, price_paise: (priceOf(d.name) || 150) * 100, diet: d.diet }));

    const filtered = items.filter(item => 
      item.name.toLowerCase().includes(val) || 
      item.id.toLowerCase().includes(val)
    ).slice(0, 8);

    if (filtered.length === 0) {
      autoDiv.innerHTML = '<div style="padding: 8px 12px; color: var(--ink-3); font-size: 13px;">No items match</div>';
    } else {
      autoDiv.innerHTML = filtered.map(item => \`
        <div class="auto-item" data-id="\\\${item.id}" data-name="\\\${item.name}" style="padding: 8px 12px; cursor: pointer; border-bottom: 1px solid var(--line); font-size: 13px; display: flex; justify-content: space-between; align-items: center;" onclick="selectWalkInItem('\\\${item.id}', '\\\${item.name.replace(/'/g, "\\\\'")}')">
          <span><span class="veg-dot vd \\\${item.diet==='nonveg'?'nv':''}" style="display:inline-block; width:8px; height:8px; margin-right:6px; vertical-align: middle;"></span>\\\${item.name}</span>
          <span style="font-family: var(--mono); color: var(--ink-2);">₹\\\${(item.price_paise / 100).toFixed(2)}</span>
        </div>
      \`).join('');
    }
    autoDiv.style.display = 'block';
  });

  window.selectWalkInItem = function(id, name) {
    input.value = name;
    input.dataset.selectedId = id;
    autoDiv.style.display = 'none';
  };

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#walkInItemInput') && !e.target.closest('#walkInAutocomplete')) {
      autoDiv.style.display = 'none';
    }
  });

  window.addWalkInItem = function() {
    const val = input.value.trim();
    if (!val) return;
    const qty = Math.max(1, parseInt(document.getElementById('walkInQtyInput').value) || 1);
    
    const items = window.liveMenuItems && window.liveMenuItems.length > 0 
      ? window.liveMenuItems 
      : (DISH || []).map((d, i) => ({ id: \`demo-\\\${i}\`, name: d.name, price_paise: (priceOf(d.name) || 150) * 100, diet: d.diet }));

    let matchedItem = items.find(item => item.id === input.dataset.selectedId);
    if (!matchedItem) {
      matchedItem = items.find(item => item.name.toLowerCase() === val.toLowerCase() || item.id.toLowerCase() === val.toLowerCase());
    }
    if (!matchedItem) {
      matchedItem = items.find(item => item.name.toLowerCase().includes(val.toLowerCase()));
    }

    if (!matchedItem) {
      toast('✕ Item not found in menu');
      return;
    }

    const existing = walkInCart.find(c => c.item.id === matchedItem.id);
    if (existing) {
      existing.qty += qty;
    } else {
      walkInCart.push({ item: matchedItem, qty });
    }

    input.value = '';
    delete input.dataset.selectedId;
    document.getElementById('walkInQtyInput').value = '1';
    renderWalkInCart();
  };

  window.removeWalkInCartItem = function(id) {
    walkInCart = walkInCart.filter(c => c.item.id !== id);
    renderWalkInCart();
  };

  function renderWalkInCart() {
    const cartDiv = document.getElementById('walkInCart');
    const emptyDiv = document.getElementById('walkInCartEmpty');
    const totalSpan = document.getElementById('walkInTotal');
    
    cartDiv.querySelectorAll('.cart-row').forEach(el => el.remove());

    if (walkInCart.length === 0) {
      emptyDiv.style.display = 'block';
      totalSpan.textContent = '₹0.00';
      return;
    }

    emptyDiv.style.display = 'none';

    let total = 0;
    walkInCart.forEach(c => {
      const lineTotal = (c.item.price_paise / 100) * c.qty;
      total += lineTotal;

      const row = document.createElement('div');
      row.className = 'cart-row';
      row.style = 'display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px dashed var(--line); font-size: 13px;';
      row.innerHTML = \`
        <span><b style="color: var(--tomato);">\\\${c.qty}x</b> \\\${c.item.name}</span>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-family: var(--mono); font-weight: 600;">₹\\\${lineTotal.toFixed(2)}</span>
          <button style="border: none; background: transparent; color: var(--tomato); cursor: pointer; padding: 0 4px; font-weight: bold; font-size: 14px;" onclick="removeWalkInCartItem('\\\${c.item.id}')">✕</button>
        </div>
      \`;
      cartDiv.appendChild(row);
    });

    totalSpan.textContent = '₹' + total.toFixed(2);
  }

  window.submitWalkIn = async function() {
    if (walkInCart.length === 0) {
      toast('Add at least one item');
      return;
    }
    const submitBtn = document.getElementById('walkInSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';
    try {
      const itemsPayload = walkInCart.map(c => ({ idOrName: c.item.name, qty: c.qty }));
      const res = await fetch('/api/kitchen/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'walk-in', tenant: currentCanteenId, items: itemsPayload })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast('✕ Error: ' + (errData.error || 'Failed to create order'));
        return;
      }
      toast('✓ Walk-in order created');
      closeWalkIn();
      // The server emits an order_events INSERT → realtime fires → debouncedPollLiveData.
      // No manual pollLiveData() needed — realtime handles instant update.
    } catch (err) {
      console.error(err);
      toast('✕ Network error');
      await pollLiveData(); // Only on error, fallback refresh
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Order';
    }
  };
})();
</script>
`;
  html = html.replace("</body>", liveSyncScript + "\n</body>");

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}
