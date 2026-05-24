import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { resolveTenant, getTenantSlugFromHeaders } from "@/lib/tenant";
import { requireRole } from "@/lib/auth/get-user";
import fs from "fs";
import path from "path";

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
  // We inject isLiveMode = true at the start of the head tag
  html = html.replace(
    "<head>",
    `<head>\n<script>let isLiveMode = true;</script>`
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

  // 5. Inject actual logged-in user details in sidebar
  const displayName = user.displayName || user.email || "Kitchen Staff";
  const avatarChar = displayName.charAt(0).toUpperCase();
  const roleLabel = user.role === "canteen_admin" ? "CANTEEN ADMIN" : user.role === "super_admin" ? "SUPER ADMIN" : "KITCHEN STAFF";
  
  html = html.replace(
    /<div class="sb-user">[\s\S]*?<\/div>\s*<\/div>/g,
    `<div class="sb-user">
        <div class="av">${avatarChar}</div>
        <div class="info"><div class="n">${displayName}</div><div class="r">${roleLabel}</div></div>
      </div>`
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
  
  const seenOrderIds = new Set();
  
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
      
      data.orders.forEach(o => {
        const idKey = o.dbId || o.id;
        if (!seenOrderIds.has(idKey)) {
          seenOrderIds.add(idKey);
          if (o.status === 'incoming' || o.status === 'preparing') {
            hasNewIncoming = true;
          }
        }
      });
      
      if (hasNewIncoming && !isInitialLoad) {
        playChime();
      }
      
      // Update global lexical state
      orders = data.orders;
      specials = data.specials;
      
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
    try {
      const res = await fetch('/api/kitchen/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'advance', tenant: currentCanteenId, orderId: targetId })
      });
      if (!res.ok) {
        toast('✕ Error updating order');
        return;
      }
      const nextStatus = { incoming: 'preparing', preparing: 'ready', ready: 'collected' }[o.status];
      if (nextStatus) {
        o.status = nextStatus;
        if (nextStatus === 'preparing') o.placedAt = Date.now();
        document.getElementById('qStat').innerHTML = \`Last update: <span class="serif-it stat">\${o.id} → \${nextStatus}</span>\`;
        if (nextStatus === 'collected') toast(\`✓ Handed over · \${o.id}\`);
      }
      renderQueue();
      await pollLiveData();
    } catch (err) {
      console.error(err);
      toast('✕ Network error');
    }
  };

  window.confirmOtp = async function() {
    const entered = Array.from(document.querySelectorAll('.otp-in input')).map(i => i.value.replace(/\\D/g, '')).join('');
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
        pendingOtp.status = 'collected';
        renderQueue();
        closeOtp();
        toast('✓ Verified · order handed over');
        await pollLiveData();
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
    
    pollLiveData();
    window.livePollInterval = setInterval(pollLiveData, 2000);
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
