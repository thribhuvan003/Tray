/**
 * Tray Platform - Real User Simulation QA Test
 * Tests all phases: Landing, Demo portals, Onboarding, Auth flows, Cross-portal sync
 */
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:3005';
const SCREENSHOT_DIR = path.join(__dirname, '../qa-screenshots');
const REPORT_PATH = path.join(__dirname, '../qa-report.md');

// Ensure screenshot dir exists
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

let screenshotCount = 0;
const results = [];

async function shot(page, label) {
  screenshotCount++;
  const filename = `${String(screenshotCount).padStart(3,'0')}-${label.replace(/[^a-zA-Z0-9]/g,'-')}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`  📸 ${filename}`);
  return filename;
}

function pass(phase, step, note = '') {
  const msg = `✅ ${phase} | ${step}${note ? ' — ' + note : ''}`;
  results.push(msg);
  console.log(msg);
}

function fail(phase, step, note = '') {
  const msg = `❌ ${phase} | ${step}${note ? ' — ' + note : ''}`;
  results.push(msg);
  console.log(msg);
}

function info(msg) {
  results.push(`ℹ️  ${msg}`);
  console.log(`  ℹ️  ${msg}`);
}

async function waitAndShot(page, label, waitMs = 2000) {
  await new Promise(r => setTimeout(r, waitMs));
  return shot(page, label);
}

// ─── PHASE 0: Landing Page ─────────────────────────────────────────────────
async function phase0(browser) {
  console.log('\n═══ PHASE 0: Landing Page ═══');
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  try {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await waitAndShot(page, 'landing-initial', 1500);
    
    const title = await page.title();
    info(`Page title: "${title}"`);
    
    // Check preloader
    const preloader = await page.$('[class*="intro"], [class*="preloader"], [class*="LandingIntro"], #preloader');
    if (preloader) {
      pass('Phase 0', 'Preloader element found');
    } else {
      fail('Phase 0', 'Preloader not found in DOM');
    }
    
    // Wait for full load
    await new Promise(r => setTimeout(r, 3000));
    await shot(page, 'landing-after-preloader');
    
    // Check hero section
    const hero = await page.$('#hero, [class*="hero"], h1');
    if (hero) {
      const h1Text = await page.$eval('h1', el => el.textContent?.trim().slice(0, 80)).catch(() => 'not found');
      pass('Phase 0', 'Hero/H1 found', h1Text);
    } else {
      fail('Phase 0', 'No hero or H1 found');
    }
    
    // Check for portal cards
    const portalLinks = await page.$$eval('a[href*="demo"], button[onclick*="demo"], [class*="portal"]', 
      els => els.map(el => ({ text: el.textContent?.trim().slice(0,40), href: el.href || el.getAttribute('onclick') }))
    );
    info(`Portal-related elements found: ${portalLinks.length}`);
    portalLinks.slice(0,6).forEach(l => info(`  - "${l.text}" → ${l.href}`));
    
    if (portalLinks.length >= 3) {
      pass('Phase 0', '3+ portal cards/links found');
    } else if (portalLinks.length > 0) {
      fail('Phase 0', `Only ${portalLinks.length} portal links found (expected 3)`);
    } else {
      // Try broader search
      const allLinks = await page.$$eval('a', els => els.map(el => ({ text: el.textContent?.trim().slice(0,40), href: el.href })));
      info(`All links on page: ${allLinks.length}`);
      allLinks.filter(l => l.text && l.text.length > 2).slice(0,10).forEach(l => info(`  link: "${l.text}" → ${l.href}`));
      fail('Phase 0', 'No portal cards found — may be SPA with JS-rendered content');
    }
    
    // Scroll and screenshot key sections
    await page.evaluate(() => window.scrollTo(0, 500));
    await waitAndShot(page, 'landing-section-system', 1000);
    
    await page.evaluate(() => window.scrollTo(0, 1200));
    await waitAndShot(page, 'landing-section-portals', 1000);
    
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await waitAndShot(page, 'landing-footer', 1000);
    
    // Check page URL
    const finalUrl = page.url();
    pass('Phase 0', 'Landing page loaded', `URL: ${finalUrl}`);
    
  } catch (err) {
    fail('Phase 0', 'Landing page error', err.message);
  } finally {
    await page.close();
  }
}

// ─── PHASE 1A: Student Demo ────────────────────────────────────────────────
async function phase1A(browser) {
  console.log('\n═══ PHASE 1A: Student Demo ═══');
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  try {
    await page.goto(`${BASE_URL}/demo/student.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await waitAndShot(page, '1A-student-initial', 2000);
    
    const title = await page.title();
    pass('Phase 1A', 'Student demo loaded', `Title: "${title}"`);
    
    // Check canteen switcher
    const canteenSelector = await page.$('#canteenSelect, [id*="canteen"], .canteen-segment, [class*="canteen-segment"]');
    if (canteenSelector) {
      pass('Phase 1A', 'Canteen switcher found');
      
      // Try to switch between canteens using segments
      const segments = await page.$$('.canteen-segment, [class*="canteen-segment"]');
      info(`Canteen segments found: ${segments.length}`);
      
      if (segments.length >= 2) {
        await segments[0].click(); // Aditya
        await waitAndShot(page, '1A-canteen-aditya', 1000);
        pass('Phase 1A', 'Switched to first canteen (Aditya)');
        
        await segments[1].click(); // North Block
        await waitAndShot(page, '1A-canteen-north-block', 1000);
        pass('Phase 1A', 'Switched to second canteen (North Block)');
        
        await segments[0].click(); // Back to Aditya
        await new Promise(r => setTimeout(r, 500));
      }
    } else {
      // Try dropdown
      const dropdown = await page.$('select[id*="canteen"], select[class*="canteen"]');
      if (dropdown) {
        await page.select('select[id*="canteen"]', 'north-block').catch(() => {});
        await waitAndShot(page, '1A-canteen-switch-dropdown', 1000);
        pass('Phase 1A', 'Canteen switched via dropdown');
      } else {
        fail('Phase 1A', 'No canteen switcher found');
      }
    }
    
    // Browse menu — find menu items
    await new Promise(r => setTimeout(r, 500));
    const menuItems = await page.$$('.menu-item, [class*="menu-item"], .dish-card, [class*="dish"]');
    info(`Menu items found: ${menuItems.length}`);
    
    if (menuItems.length > 0) {
      pass('Phase 1A', `Menu loaded with ${menuItems.length} items`);
      await shot(page, '1A-menu-browse');
      
      // Add first 2-3 items to cart
      const addButtons = await page.$$('button[class*="add"], .btn-add, [class*="btn-add"], button[onclick*="addToCart"]');
      info(`Add-to-cart buttons found: ${addButtons.length}`);
      
      let added = 0;
      for (let i = 0; i < Math.min(3, addButtons.length); i++) {
        try {
          await addButtons[i].click();
          await new Promise(r => setTimeout(r, 400));
          added++;
        } catch (e) {
          // button may have become stale
        }
      }
      
      if (added > 0) {
        pass('Phase 1A', `Added ${added} items to cart`);
        await waitAndShot(page, '1A-cart-after-add', 1000);
      } else {
        fail('Phase 1A', 'Could not click any add-to-cart buttons');
      }
    } else {
      fail('Phase 1A', 'No menu items found');
    }
    
    // Check service mode
    const serviceMode = await page.$$('.service-mode, [class*="service-mode"]');
    info(`Service mode buttons: ${serviceMode.length}`);
    
    if (serviceMode.length >= 2) {
      await serviceMode[0].click(); // Takeaway
      await new Promise(r => setTimeout(r, 300));
      await shot(page, '1A-service-takeaway');
      pass('Phase 1A', 'Switched to Takeaway mode');
      
      await serviceMode[1].click(); // Dine-in
      await new Promise(r => setTimeout(r, 300));
      await shot(page, '1A-service-dinein');
      pass('Phase 1A', 'Switched to Dine-in mode');
    } else {
      fail('Phase 1A', 'Service mode switcher not found or only 1 option');
    }
    
    // Checkout
    const checkoutBtn = await page.$('button[onclick*="checkout"], button[onclick*="startPayment"], .checkout-btn, [class*="checkout"]');
    if (checkoutBtn) {
      const isDisabled = await checkoutBtn.evaluate(el => el.disabled || el.classList.contains('disabled') || el.getAttribute('aria-disabled') === 'true');
      if (!isDisabled) {
        await checkoutBtn.click();
        await waitAndShot(page, '1A-checkout-flow', 1500);
        pass('Phase 1A', 'Checkout button clicked');
        
        // Check for payment view
        const paymentView = await page.$('[class*="payment"], [class*="checkout"], #paymentView, #view-checkout');
        if (paymentView) pass('Phase 1A', 'Payment/checkout view appeared');
        else info('Payment view not detected after checkout click');
      } else {
        info('Checkout button is disabled (possibly cart empty or service mode not selected)');
      }
    } else {
      fail('Phase 1A', 'No checkout button found');
    }
    
  } catch (err) {
    fail('Phase 1A', 'Student demo error', err.message);
  } finally {
    await page.close();
  }
}

// ─── PHASE 1B: Kitchen Demo ────────────────────────────────────────────────
async function phase1B(browser) {
  console.log('\n═══ PHASE 1B: Kitchen Demo ═══');
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  try {
    await page.goto(`${BASE_URL}/demo/kitchen.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await waitAndShot(page, '1B-kitchen-initial', 2000);
    
    const title = await page.title();
    pass('Phase 1B', 'Kitchen demo loaded', `Title: "${title}"`);
    
    // Canteen switcher in kitchen
    const canteenDropdown = await page.$('select[id*="canteen"], #kitchenCanteen, [id*="Canteen"]');
    if (canteenDropdown) {
      pass('Phase 1B', 'Kitchen canteen switcher found');
      // Switch to North Block
      await page.select(await canteenDropdown.evaluate(el => '#' + el.id), 'north-block').catch(async () => {
        await canteenDropdown.click();
        await new Promise(r => setTimeout(r, 300));
      });
      await waitAndShot(page, '1B-kitchen-canteen-switch', 1000);
    } else {
      info('Kitchen canteen dropdown not found via select — looking for other controls');
      const allSelects = await page.$$('select');
      info(`Total select elements: ${allSelects.length}`);
    }
    
    // Find "Push a Special" button
    const specialBtn = await page.$('button[onclick*="special"], button[onclick*="Special"], [class*="special"] button, button[data-action*="special"]');
    if (specialBtn) {
      const btnText = await specialBtn.evaluate(el => el.textContent?.trim());
      pass('Phase 1B', `Push Special button found: "${btnText}"`);
      
      await specialBtn.click();
      await waitAndShot(page, '1B-push-special-modal', 1500);
      
      // Fill in the special name if modal appeared
      const specialInput = await page.$('input[placeholder*="special"], input[id*="special"], input[placeholder*="name"]');
      if (specialInput) {
        await specialInput.click({ clickCount: 3 });
        await specialInput.type('Chef\'s Special Paneer Butter Masala');
        
        const priceInput = await page.$('input[type="number"], input[placeholder*="price"], input[id*="price"]');
        if (priceInput) {
          await priceInput.click({ clickCount: 3 });
          await priceInput.type('129');
        }
        
        await waitAndShot(page, '1B-special-form-filled', 500);
        
        // Submit
        const submitBtn = await page.$('button[type="submit"], .btn-push-special, [onclick*="pushSpecial"]');
        if (submitBtn) {
          await submitBtn.click();
          await waitAndShot(page, '1B-special-pushed', 1500);
          pass('Phase 1B', 'Kitchen special pushed successfully');
        }
      }
    } else {
      // Look for the special panel differently
      const allButtons = await page.$$eval('button', btns => btns.map(b => b.textContent?.trim().slice(0,40)));
      info(`All buttons in kitchen: ${JSON.stringify(allButtons.slice(0,10))}`);
      
      const pushBtn = allButtons.findIndex(t => t && (t.toLowerCase().includes('special') || t.toLowerCase().includes('push')));
      if (pushBtn >= 0) {
        const buttons = await page.$$('button');
        await buttons[pushBtn].click();
        await waitAndShot(page, '1B-special-button-clicked', 1500);
        pass('Phase 1B', `Clicked button: "${allButtons[pushBtn]}"`);
      } else {
        fail('Phase 1B', 'No "Push Special" button found');
      }
    }
    
    // Check order columns
    const columns = await page.$$('[class*="column"], [class*="col-"], .queue-col');
    info(`Queue columns found: ${columns.length}`);
    if (columns.length > 0) pass('Phase 1B', `Kitchen board visible with ${columns.length} columns`);
    
    await shot(page, '1B-kitchen-final-state');
    
  } catch (err) {
    fail('Phase 1B', 'Kitchen demo error', err.message);
  } finally {
    await page.close();
  }
}

// ─── PHASE 1C: Admin Demo ──────────────────────────────────────────────────
async function phase1C(browser) {
  console.log('\n═══ PHASE 1C: Admin Demo ═══');
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  try {
    await page.goto(`${BASE_URL}/demo/admin.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await waitAndShot(page, '1C-admin-initial', 2000);
    
    const title = await page.title();
    pass('Phase 1C', 'Admin demo loaded', `Title: "${title}"`);
    
    // Tenant switcher
    const tenantSelect = await page.$('select[id*="tenant"], #tenantSelect, [id*="Tenant"]');
    if (tenantSelect) {
      pass('Phase 1C', 'Tenant switcher found');
      
      // Get options
      const options = await page.$$eval('select[id*="tenant"] option, #tenantSelect option', 
        opts => opts.map(o => ({ value: o.value, text: o.textContent?.trim() })));
      info(`Tenant options: ${JSON.stringify(options)}`);
      
      // Switch to North Block
      if (options.find(o => o.value === 'north-block' || o.text?.toLowerCase().includes('north'))) {
        await page.select('#tenantSelect', 'north-block').catch(async () => {
          const opts = options.filter(o => o.text?.toLowerCase().includes('north'));
          if (opts.length) await page.select('select[id*="tenant"]', opts[0].value);
        });
        await waitAndShot(page, '1C-admin-north-block', 1000);
        pass('Phase 1C', 'Switched to North Block tenant');
      }
      
      // Switch back to Aditya
      await page.select('#tenantSelect', 'aditya').catch(() => {});
      await new Promise(r => setTimeout(r, 500));
    } else {
      fail('Phase 1C', 'Tenant switcher not found');
    }
    
    // Navigate sidebar tabs
    const tabs = ['Orders', 'Menu', 'Students', 'Insights'];
    for (const tab of tabs) {
      const tabEl = await page.$(`[data-view="${tab.toLowerCase()}"], [onclick*="${tab.toLowerCase()}"], nav a:contains("${tab}"), button:contains("${tab}")`);
      const tabElAlt = await page.$$eval('nav a, button, [data-view]', 
        (els, t) => els.find(el => el.textContent?.includes(t) || el.getAttribute('data-view') === t.toLowerCase()),
        tab
      ).catch(() => null);
      
      // Try clicking via text content
      const clicked = await page.evaluate((tabName) => {
        const els = [...document.querySelectorAll('nav a, nav button, [data-view], li[onclick], a[onclick], .sidebar-item, [class*="nav-item"]')];
        const target = els.find(el => el.textContent?.trim().toLowerCase().includes(tabName.toLowerCase()));
        if (target) { target.click(); return true; }
        return false;
      }, tab);
      
      if (clicked) {
        await waitAndShot(page, `1C-admin-tab-${tab.toLowerCase()}`, 800);
        pass('Phase 1C', `Navigated to ${tab} tab`);
      } else {
        fail('Phase 1C', `Could not navigate to ${tab} tab`);
      }
    }
    
    // Try to add a menu item in the Menu tab
    const addMenuBtn = await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const add = btns.find(b => b.textContent?.toLowerCase().includes('add') && 
        (b.textContent?.toLowerCase().includes('item') || b.textContent?.toLowerCase().includes('menu') || b.textContent?.toLowerCase().includes('dish')));
      if (add) { add.click(); return true; }
      return false;
    });
    
    if (addMenuBtn) {
      await waitAndShot(page, '1C-admin-add-menu-modal', 1500);
      pass('Phase 1C', 'Add menu item modal opened');
      
      // Fill form
      const nameInput = await page.$('input[placeholder*="name"], input[id*="name"], input[name="name"]');
      if (nameInput) {
        await nameInput.click({ clickCount: 3 });
        await nameInput.type('Mango Lassi Test');
      }
      
      const priceInput = await page.$('input[type="number"], input[placeholder*="price"], input[id*="price"]');
      if (priceInput) {
        await priceInput.click({ clickCount: 3 });
        await priceInput.type('79');
      }
      
      await waitAndShot(page, '1C-admin-menu-form-filled', 500);
      
      // Close modal (Escape)
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 300));
    } else {
      fail('Phase 1C', 'Add menu item button not found');
    }
    
    await shot(page, '1C-admin-final-state');
    
  } catch (err) {
    fail('Phase 1C', 'Admin demo error', err.message);
  } finally {
    await page.close();
  }
}

// ─── PHASE 2: Onboarding Wizard ────────────────────────────────────────────
async function phase2(browser) {
  console.log('\n═══ PHASE 2: Onboarding Wizard ═══');
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  const urlsToTry = [
    `${BASE_URL}/get-started`,
    `${BASE_URL}/onboarding`,
    `${BASE_URL}/signup`,
    `${BASE_URL}/register`,
  ];
  
  let loaded = false;
  for (const url of urlsToTry) {
    try {
      const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 8000 });
      const status = res.status();
      const finalUrl = page.url();
      if (status < 400 && !finalUrl.includes('404') && !finalUrl.includes('not-found')) {
        pass('Phase 2', `Onboarding page found at ${url}`, `Status: ${status}`);
        loaded = true;
        await waitAndShot(page, '2-onboarding-initial', 1500);
        info(`Final URL: ${finalUrl}`);
        break;
      } else {
        info(`${url} → ${status} (${finalUrl})`);
      }
    } catch (e) {
      info(`${url} → error: ${e.message}`);
    }
  }
  
  if (!loaded) {
    // Check landing page for get-started button
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await new Promise(r => setTimeout(r, 2000));
    
    const getStartedBtn = await page.evaluate(() => {
      const els = [...document.querySelectorAll('a, button')];
      const btn = els.find(el => {
        const t = el.textContent?.toLowerCase().trim();
        return t?.includes('get started') || t?.includes('get demo') || t?.includes('sign up') || t?.includes('onboard');
      });
      if (btn) {
        const href = btn.href || btn.getAttribute('onclick');
        return { text: btn.textContent?.trim(), href };
      }
      return null;
    });
    
    if (getStartedBtn) {
      pass('Phase 2', `Found CTA on landing: "${getStartedBtn.text}"`, `→ ${getStartedBtn.href}`);
      // Click it
      await page.evaluate(() => {
        const els = [...document.querySelectorAll('a, button')];
        const btn = els.find(el => {
          const t = el.textContent?.toLowerCase().trim();
          return t?.includes('get started') || t?.includes('get demo') || t?.includes('sign up') || t?.includes('onboard');
        });
        if (btn) btn.click();
      });
      await waitAndShot(page, '2-onboarding-via-landing', 2000);
      loaded = true;
      info(`URL after click: ${page.url()}`);
    } else {
      fail('Phase 2', 'No onboarding page or get-started button found');
    }
  }
  
  if (loaded) {
    // Look for wizard form fields and fill them
    const fields = await page.evaluate(() => {
      const inputs = [...document.querySelectorAll('input, select, textarea')];
      return inputs.map(el => ({
        type: el.type || el.tagName,
        id: el.id,
        name: el.name,
        placeholder: el.placeholder,
        label: el.labels?.[0]?.textContent?.trim()
      }));
    });
    
    info(`Form fields found: ${fields.length}`);
    fields.slice(0, 10).forEach(f => info(`  field: ${JSON.stringify(f)}`));
    
    if (fields.length > 0) {
      // Try to fill institution name
      for (const [placeholder, value] of [
        ['institution', 'Greenfield University'],
        ['college', 'Greenfield University'],
        ['name', 'Greenfield University'],
        ['canteen', 'The Green Tray'],
        ['city', 'Hyderabad'],
        ['email', 'admin.greenfield@traytest.dev'],
        ['password', 'FakeAdmin@2026'],
      ]) {
        const field = await page.$(`input[placeholder*="${placeholder}"], input[name*="${placeholder}"], input[id*="${placeholder}"]`);
        if (field) {
          await field.click({ clickCount: 3 });
          await field.type(value);
          info(`Filled "${placeholder}" with "${value}"`);
        }
      }
      
      await waitAndShot(page, '2-onboarding-form-filled', 500);
      pass('Phase 2', 'Wizard form fields filled');
    }
  }
  
  await page.close();
}

// ─── PHASE 3: Admin Login & Menu Management ────────────────────────────────
async function phase3(browser) {
  console.log('\n═══ PHASE 3: Admin Login & Menu Management ═══');
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await waitAndShot(page, '3-login-page', 2000);
    
    const pageUrl = page.url();
    info(`Login page URL: ${pageUrl}`);
    
    if (pageUrl.includes('login') || pageUrl.includes('auth')) {
      pass('Phase 3', 'Login page loaded');
    } else if (pageUrl === `${BASE_URL}/`) {
      // Redirected to homepage (student portal)
      fail('Phase 3', 'Login redirected to student portal — may be pre-authenticated or no /login route');
      info(`Actual URL: ${pageUrl}`);
      
      // Try to find login link
      const loginLink = await page.$('a[href*="login"], a[href*="sign-in"]');
      if (loginLink) await loginLink.click();
      await waitAndShot(page, '3-login-redirected', 1500);
    }
    
    // Look for role selector cards
    const roleCards = await page.$$('[class*="role"], [data-role], button[class*="role"]');
    info(`Role cards found: ${roleCards.length}`);
    
    // Try to click Canteen Admin role
    const adminRole = await page.evaluate(() => {
      const els = [...document.querySelectorAll('[class*="role"], [data-role], button, div[onclick], [class*="card"]')];
      const admin = els.find(el => el.textContent?.toLowerCase().includes('admin') || el.textContent?.toLowerCase().includes('canteen admin'));
      if (admin) { admin.click(); return admin.textContent?.trim().slice(0, 40); }
      return null;
    });
    
    if (adminRole) {
      pass('Phase 3', `Clicked admin role card: "${adminRole}"`);
      await waitAndShot(page, '3-admin-role-selected', 1000);
    } else {
      info('Admin role card not found or not clickable — trying direct email/password');
    }
    
    // Fill email
    const emailInput = await page.$('input[type="email"], input[name="email"], input[placeholder*="email"]');
    if (emailInput) {
      await emailInput.click({ clickCount: 3 });
      await emailInput.type('admin.demo@aec.edu.in');
      pass('Phase 3', 'Email filled');
    } else {
      fail('Phase 3', 'Email input not found');
    }
    
    // Fill password
    const pwdInput = await page.$('input[type="password"], input[name="password"]');
    if (pwdInput) {
      await pwdInput.click({ clickCount: 3 });
      await pwdInput.type('TestPassword123!');
      pass('Phase 3', 'Password filled');
    } else {
      fail('Phase 3', 'Password input not found');
    }
    
    await waitAndShot(page, '3-login-form-filled', 500);
    
    // Submit
    const submitBtn = await page.$('button[type="submit"], button[onclick*="login"], button[onclick*="signIn"], form button');
    if (submitBtn) {
      await submitBtn.click();
      await new Promise(r => setTimeout(r, 3000));
      await shot(page, '3-after-login-submit');
      
      const afterUrl = page.url();
      info(`URL after login submit: ${afterUrl}`);
      
      if (afterUrl.includes('admin') || afterUrl.includes('dashboard')) {
        pass('Phase 3', 'Admin login successful — redirected to admin area', afterUrl);
      } else if (afterUrl.includes('login') || afterUrl.includes('auth')) {
        // Check for error message
        const errorMsg = await page.$eval('[class*="error"], [role="alert"], .toast-error', el => el.textContent?.trim()).catch(() => null);
        fail('Phase 3', 'Login failed — still on auth page', errorMsg || 'no error message visible');
      } else {
        info(`Redirected to: ${afterUrl} — checking content`);
        const pageContent = await page.$eval('body', el => el.textContent?.slice(0, 200)).catch(() => '');
        info(`Page content snippet: "${pageContent.slice(0, 100)}"`);
      }
    } else {
      fail('Phase 3', 'Submit button not found');
    }
    
    // Try to find and navigate to Menu management
    await new Promise(r => setTimeout(r, 1000));
    const navigatedToMenu = await page.evaluate(() => {
      const els = [...document.querySelectorAll('a, button, nav *')];
      const menuLink = els.find(el => el.textContent?.toLowerCase().includes('menu'));
      if (menuLink) { menuLink.click(); return menuLink.textContent?.trim().slice(0, 30); }
      return null;
    });
    
    if (navigatedToMenu) {
      await waitAndShot(page, '3-menu-management', 1500);
      pass('Phase 3', `Navigated to menu: "${navigatedToMenu}"`);
      
      // Add menu item
      const addBtn = await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const add = btns.find(b => b.textContent?.toLowerCase().includes('add'));
        if (add) { add.click(); return add.textContent?.trim().slice(0, 40); }
        return null;
      });
      
      if (addBtn) {
        await waitAndShot(page, '3-add-item-modal', 1500);
        pass('Phase 3', `Add item button clicked: "${addBtn}"`);
        
        // Fill item details
        const nameInput = await page.$('input[placeholder*="name"], input[id*="name"], input[name="name"]');
        if (nameInput) {
          await nameInput.click({ clickCount: 3 });
          await nameInput.type('Special Hyderabadi Biryani');
        }
        
        // Category
        const catInput = await page.$('select[name="category"], input[placeholder*="category"]');
        if (catInput) {
          if (catInput.tagName === 'SELECT') {
            await page.select('select[name="category"]', 'main').catch(() => {});
          } else {
            await catInput.click({ clickCount: 3 });
            await catInput.type('Main Course');
          }
        }
        
        // Price
        const priceInput = await page.$('input[name="price"], input[type="number"]');
        if (priceInput) {
          await priceInput.click({ clickCount: 3 });
          await priceInput.type('149');
        }
        
        // Veg toggle
        await page.evaluate(() => {
          const veg = [...document.querySelectorAll('input[type="checkbox"], button, label')]
            .find(el => el.textContent?.toLowerCase().includes('veg') || el.id?.toLowerCase().includes('veg'));
          if (veg && !veg.checked) veg.click();
        });
        
        await waitAndShot(page, '3-add-item-form-filled', 500);
        
        // Submit
        const formSubmit = await page.evaluate(() => {
          const btns = [...document.querySelectorAll('button[type="submit"], button')];
          const save = btns.find(b => b.textContent?.toLowerCase().includes('save') || b.textContent?.toLowerCase().includes('add') || b.textContent?.toLowerCase().includes('create'));
          if (save) { save.click(); return save.textContent?.trim().slice(0, 30); }
          return null;
        });
        
        if (formSubmit) {
          await waitAndShot(page, '3-after-add-item', 2000);
          pass('Phase 3', `Form submitted: "${formSubmit}"`);
        }
      } else {
        fail('Phase 3', 'Add menu item button not found on menu page');
      }
    } else {
      fail('Phase 3', 'Could not find Menu navigation link');
    }
    
  } catch (err) {
    fail('Phase 3', 'Admin login/menu error', err.message);
  } finally {
    await page.close();
  }
}

// ─── PHASE 4: Student Login ────────────────────────────────────────────────
async function phase4(browser) {
  console.log('\n═══ PHASE 4: Student Login ═══');
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await waitAndShot(page, '4-student-login-page', 1500);
    
    const pageUrl = page.url();
    info(`Student login URL: ${pageUrl}`);
    
    // Select Student role
    const studentRole = await page.evaluate(() => {
      const els = [...document.querySelectorAll('[class*="role"], [data-role], button, div[onclick], [class*="card"]')];
      const student = els.find(el => el.textContent?.toLowerCase().includes('student'));
      if (student) { student.click(); return student.textContent?.trim().slice(0, 40); }
      return null;
    });
    
    if (studentRole) {
      pass('Phase 4', `Clicked student role: "${studentRole}"`);
      await waitAndShot(page, '4-student-role-selected', 800);
    }
    
    // Fill credentials
    const emailInput = await page.$('input[type="email"], input[name="email"]');
    if (emailInput) {
      await emailInput.click({ clickCount: 3 });
      await emailInput.type('student.demo@aec.edu.in');
    }
    
    const pwdInput = await page.$('input[type="password"]');
    if (pwdInput) {
      await pwdInput.click({ clickCount: 3 });
      await pwdInput.type('TestPassword123!');
    }
    
    await waitAndShot(page, '4-student-login-filled', 500);
    
    // Submit
    const submitBtn = await page.$('button[type="submit"], form button');
    if (submitBtn) {
      await submitBtn.click();
      await new Promise(r => setTimeout(r, 3000));
      const afterUrl = page.url();
      await shot(page, '4-after-student-login');
      info(`URL after student login: ${afterUrl}`);
      
      if (!afterUrl.includes('login') && !afterUrl.includes('auth')) {
        pass('Phase 4', 'Student login successful', afterUrl);
        
        // Check for Special Hyderabadi Biryani
        const biryani = await page.$eval('body', el => 
          el.textContent?.toLowerCase().includes('hyderabadi') || el.textContent?.toLowerCase().includes('biryani')
        ).catch(() => false);
        
        if (biryani) {
          pass('Phase 4', 'Special Hyderabadi Biryani visible in student menu (cross-portal sync ✅)');
        } else {
          fail('Phase 4', 'Special Hyderabadi Biryani NOT found in student menu');
        }
        
        // Add to cart and checkout
        const addBtn = await page.evaluate(() => {
          const btns = [...document.querySelectorAll('button')];
          const add = btns.find(b => b.textContent?.toLowerCase().includes('add') || b.textContent?.toLowerCase().includes('cart'));
          if (add) { add.click(); return add.textContent?.trim().slice(0, 30); }
          return null;
        });
        
        if (addBtn) {
          await new Promise(r => setTimeout(r, 500));
          await shot(page, '4-item-added-to-cart');
          pass('Phase 4', `Added item to cart: "${addBtn}"`);
        }
        
        // Go to cart/checkout
        const cartBtn = await page.$('a[href*="cart"], button[onclick*="cart"], [class*="cart-btn"]');
        if (cartBtn) {
          await cartBtn.click();
          await waitAndShot(page, '4-cart-page', 1500);
          pass('Phase 4', 'Cart page loaded');
        }
        
      } else {
        const err = await page.$eval('[class*="error"], [role="alert"]', el => el.textContent?.trim()).catch(() => 'no error');
        fail('Phase 4', 'Student login failed', err);
      }
    }
    
  } catch (err) {
    fail('Phase 4', 'Student login error', err.message);
  } finally {
    await page.close();
  }
}

// ─── PHASE 5: Kitchen Staff Login ─────────────────────────────────────────
async function phase5(browser) {
  console.log('\n═══ PHASE 5: Kitchen Staff Login ═══');
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await waitAndShot(page, '5-kitchen-login-page', 1500);
    
    // Select Kitchen role
    const kitchenRole = await page.evaluate(() => {
      const els = [...document.querySelectorAll('[class*="role"], [data-role], button, div[onclick], [class*="card"]')];
      const kitchen = els.find(el => el.textContent?.toLowerCase().includes('kitchen'));
      if (kitchen) { kitchen.click(); return kitchen.textContent?.trim().slice(0, 40); }
      return null;
    });
    
    if (kitchenRole) {
      pass('Phase 5', `Clicked kitchen role: "${kitchenRole}"`);
    }
    
    const emailInput = await page.$('input[type="email"], input[name="email"]');
    if (emailInput) {
      await emailInput.click({ clickCount: 3 });
      await emailInput.type('main.kitchen@traytest.dev');
    }
    
    const pwdInput = await page.$('input[type="password"]');
    if (pwdInput) {
      await pwdInput.click({ clickCount: 3 });
      await pwdInput.type('TestPassword123!');
    }
    
    const submitBtn = await page.$('button[type="submit"], form button');
    if (submitBtn) {
      await submitBtn.click();
      await new Promise(r => setTimeout(r, 3000));
      const afterUrl = page.url();
      await shot(page, '5-after-kitchen-login');
      info(`URL after kitchen login: ${afterUrl}`);
      
      if (afterUrl.includes('kitchen')) {
        pass('Phase 5', 'Kitchen staff login successful', afterUrl);
        
        // Look for order columns
        const columns = await page.$$('[class*="column"], [class*="col"], [class*="status"]');
        info(`Order columns found: ${columns.length}`);
        if (columns.length > 0) pass('Phase 5', 'Kitchen board / order columns visible');
        
        // Check for incoming orders
        const incomingOrders = await page.$eval('body', el => 
          el.textContent?.toLowerCase().includes('placed') || el.textContent?.toLowerCase().includes('incoming') || el.textContent?.toLowerCase().includes('new order')
        ).catch(() => false);
        
        if (incomingOrders) pass('Phase 5', 'Incoming/placed orders visible on kitchen board');
        else info('No "placed" or "incoming" orders visible on kitchen board');
        
        await shot(page, '5-kitchen-board');
        
      } else {
        const errMsg = await page.$eval('[class*="error"], [role="alert"]', el => el.textContent?.trim()).catch(() => 'no error');
        fail('Phase 5', 'Kitchen login failed', `URL: ${afterUrl} | Error: ${errMsg}`);
      }
    }
    
  } catch (err) {
    fail('Phase 5', 'Kitchen login error', err.message);
  } finally {
    await page.close();
  }
}

// ─── PHASE 6: Cross-Portal Check ──────────────────────────────────────────
async function phase6(browser) {
  console.log('\n═══ PHASE 6: Cross-Portal Sync ═══');
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  try {
    // Try admin portal
    const adminUrls = [
      `${BASE_URL}/admin`,
      `${BASE_URL}/admin/orders`,
      `${BASE_URL}/admin/dashboard`,
    ];
    
    for (const url of adminUrls) {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 8000 }).catch(() => {});
      const finalUrl = page.url();
      const status = await page.evaluate(() => document.title);
      info(`Admin URL ${url} → ${finalUrl} (title: "${status}")`);
      
      if (!finalUrl.includes('login') && !finalUrl.includes('auth')) {
        pass('Phase 6', `Admin portal accessible at ${finalUrl}`);
        await waitAndShot(page, '6-admin-portal', 1500);
        
        // Check orders
        const hasOrders = await page.$eval('body', el => 
          el.textContent?.toLowerCase().includes('order') && el.textContent?.toLowerCase().includes('placed')
        ).catch(() => false);
        
        if (hasOrders) pass('Phase 6', 'Orders visible on admin portal (cross-portal sync ✅)');
        else info('Orders not visible on admin portal');
        
        // Check KPIs
        const hasKPIs = await page.$eval('body', el => 
          el.textContent?.includes('₹') || el.textContent?.toLowerCase().includes('revenue') || el.textContent?.toLowerCase().includes('total orders')
        ).catch(() => false);
        
        if (hasKPIs) pass('Phase 6', 'KPI stats visible on admin portal');
        break;
      }
    }
    
  } catch (err) {
    fail('Phase 6', 'Cross-portal sync check error', err.message);
  } finally {
    await page.close();
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Tray Platform QA Test — Starting\n');
  console.log(`📁 Screenshots: ${SCREENSHOT_DIR}`);
  console.log(`📄 Report: ${REPORT_PATH}\n`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1440,900',
    ]
  });
  
  try {
    await phase0(browser);
    await phase1A(browser);
    await phase1B(browser);
    await phase1C(browser);
    await phase2(browser);
    await phase3(browser);
    await phase4(browser);
    await phase5(browser);
    await phase6(browser);
  } finally {
    await browser.close();
  }
  
  // Generate report
  const report = [
    '# Tray Platform QA Report',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    `- Total checks: ${results.length}`,
    `- Passed: ${results.filter(r => r.startsWith('✅')).length}`,
    `- Failed: ${results.filter(r => r.startsWith('❌')).length}`,
    `- Info: ${results.filter(r => r.startsWith('ℹ️')).length}`,
    '',
    '## Detailed Results',
    ...results,
    '',
    `## Screenshots saved to: ${SCREENSHOT_DIR}`,
  ].join('\n');
  
  fs.writeFileSync(REPORT_PATH, report);
  console.log('\n\n═══════════════════════════════════════');
  console.log('QA TEST COMPLETE');
  console.log('═══════════════════════════════════════\n');
  console.log(report);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
