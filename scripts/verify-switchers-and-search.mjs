import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const outDir = "C:\\Users\\ntena\\.gemini\\antigravity\\brain\\a6a322c8-21a3-4ca3-a27f-60e2ceda5aa0\\scratch";

// Ensure output directory exists
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log("🚀 Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  // Test Great Hall Canteen
  console.log("\n--- Testing Great Hall Canteen Menu ---");
  await page.goto("http://localhost:5599/c/great-hall-canteen/menu", { waitUntil: "networkidle" });
  console.log(`Page URL: ${page.url()}`);
  
  // Wait 3 seconds to guarantee React hydration is complete
  console.log("Waiting for React hydration...");
  await page.waitForTimeout(3000);

  // 1. Verify page elements load
  const header = await page.locator("h1").innerText();
  console.log(`Header found: "${header}"`);

  // Extract all initial dishes on the board
  const initialDishes = await page.locator("article h3").allTextContents();
  console.log(`Dishes found on menu board (${initialDishes.length}):`, initialDishes);

  // 2. Click Canteen Switcher in the topbar
  console.log("Locating the topbar canteen switcher trigger button...");
  const switcherContainer = page.locator(".canteen-switcher-container");
  await switcherContainer.waitFor({ state: "visible", timeout: 10000 });
  const triggerBtn = switcherContainer.locator("button").first();
  await triggerBtn.click();
  console.log("Clicked topbar canteen switcher trigger.");

  // Wait for dropdown to animate in
  await page.waitForTimeout(1000);

  // Take a screenshot of the open dropdown
  const dropdownScreenshotPath = path.join(outDir, "great_hall_dropdown.png");
  await page.screenshot({ path: dropdownScreenshotPath });
  console.log(`Screenshot saved: ${dropdownScreenshotPath}`);

  // Get all options in the dropdown
  const dropdownMenu = switcherContainer.locator("div.z-50");
  const options = await dropdownMenu.locator("button p.font-semibold").allTextContents();
  console.log("Dropdown canteen options found:", options);

  // Verify dropdown lists both canteens
  const hasGreatHall = options.some(opt => opt.includes("Great Hall"));
  const hasGryffindor = options.some(opt => opt.includes("Gryffindor"));
  console.log(`Great Hall Canteen in dropdown: ${hasGreatHall ? "✅ YES" : "❌ NO"}`);
  console.log(`Gryffindor Canteen in dropdown: ${hasGryffindor ? "✅ YES" : "❌ NO"}`);

  if (!hasGreatHall || !hasGryffindor) {
    throw new Error("Missing canteens in the switcher dropdown!");
  }

  // Close the dropdown by clicking the trigger again
  await triggerBtn.click();
  await page.waitForTimeout(500);

  // 3. Verify Search functionality
  if (initialDishes.length > 0) {
    // Select a dish name and sanitize it by removing trailing dot if present
    let targetDish = initialDishes[0].replace(/\.$/, "").trim();
    // Use the first 3 words to avoid typing mismatch
    targetDish = targetDish.split(" ").slice(0, 3).join(" ");
    console.log(`\nTesting search for dish: "${targetDish}"`);
    
    // Fill search input
    const searchInput = switcherContainer.locator("input[placeholder='Search for dishes...']");
    await searchInput.fill(targetDish);
    
    console.log("Waiting for search results to filter...");
    await page.waitForTimeout(2000); // Wait for Next.js async URL transition

    // Verify URL query param is updated
    const currentUrl = page.url();
    console.log(`Current URL with query: ${currentUrl}`);
    const hasQueryParam = currentUrl.includes("q=");
    console.log(`URL updated with ?q=...: ${hasQueryParam ? "✅ YES" : "❌ NO"}`);

    // Verify only filtered items are visible
    // We target the titles of MenuItemCard components which have class 'menu-card__title'
    const filteredDishes = await page.locator(".menu-card__title").allTextContents();
    console.log(`Filtered MenuItemCard titles:`, filteredDishes);
    const allMatch = filteredDishes.length > 0 && filteredDishes.every(dish => dish.toLowerCase().includes(targetDish.toLowerCase()));
    console.log(`All visible MenuItemCards match search term: ${allMatch ? "✅ YES" : "❌ NO"}`);

    // Take screenshot of search results
    const searchScreenshotPath = path.join(outDir, "great_hall_search.png");
    await page.screenshot({ path: searchScreenshotPath });
    console.log(`Screenshot saved: ${searchScreenshotPath}`);

    // Clear search
    console.log("Clearing search input...");
    const clearSearchBtn = switcherContainer.locator("button[aria-label='Clear search query']");
    if (await clearSearchBtn.isVisible()) {
      await clearSearchBtn.click();
      await page.waitForTimeout(1000);
      console.log("Search query cleared via button click.");
    } else {
      // Fallback manual clearing
      await searchInput.focus();
      await page.keyboard.press("Control+A");
      await page.keyboard.press("Backspace");
      await page.waitForTimeout(1000);
      console.log("Search query cleared via backspace.");
    }
  } else {
    console.log("⚠️ No dishes found to test search functionality!");
  }


  // Test Gryffindor Canteen
  console.log("\n--- Testing Gryffindor Canteen Menu ---");
  await page.goto("http://localhost:5599/c/gryffindor-common-room-canteen/menu", { waitUntil: "networkidle" });
  console.log(`Page URL: ${page.url()}`);
  
  console.log("Waiting for React hydration on Gryffindor page...");
  await page.waitForTimeout(3000);

  // 1. Verify page elements load
  const gryffindorHeader = await page.locator("h1").innerText();
  console.log(`Header found: "${gryffindorHeader}"`);

  // Extract all dishes on Gryffindor
  const gryffindorDishes = await page.locator(".menu-card__title").allTextContents();
  console.log(`Dishes found on Gryffindor menu board (${gryffindorDishes.length}):`, gryffindorDishes);

  // 2. Verify topbar switcher dropdown lists canteens on Gryffindor
  const gryffindorSwitcher = page.locator(".canteen-switcher-container");
  const gryffindorTrigger = gryffindorSwitcher.locator("button").first();
  await gryffindorTrigger.click();
  await page.waitForTimeout(1000);

  const gryffindorDropdownMenu = gryffindorSwitcher.locator("div.z-50");
  const gryffindorOptions = await gryffindorDropdownMenu.locator("button p.font-semibold").allTextContents();
  console.log("Dropdown options found on Gryffindor page:", gryffindorOptions);

  const hasGreatHallG = gryffindorOptions.some(opt => opt.includes("Great Hall"));
  const hasGryffindorG = gryffindorOptions.some(opt => opt.includes("Gryffindor"));
  console.log(`Great Hall Canteen in dropdown: ${hasGreatHallG ? "✅ YES" : "❌ NO"}`);
  console.log(`Gryffindor Canteen in dropdown: ${hasGryffindorG ? "✅ YES" : "❌ NO"}`);

  // Close dropdown
  await gryffindorTrigger.click();
  await page.waitForTimeout(500);

  // 3. Verify single-line layout (Campus Canteens)
  console.log("Verifying the inline single-line layout (Campus Canteens block)...");
  const campusCanteensBlock = page.locator(".canteen-bar");
  if (await campusCanteensBlock.isVisible()) {
    console.log("Campus Canteens block is visible.");
    const siblingButtons = await campusCanteensBlock.locator("button").all();
    console.log(`Number of buttons in Campus Canteens selector: ${siblingButtons.length}`);
    
    // Check grid layout classes
    const gridDiv = campusCanteensBlock.locator("div.grid");
    const gridClasses = await gridDiv.getAttribute("class");
    console.log(`Grid container classes: "${gridClasses}"`);
    console.log(`Has single-line grid columns class (e.g., grid-cols-2): ${gridClasses.includes("grid-cols-2") || gridClasses.includes("grid-cols-3") ? "✅ YES" : "❌ NO"}`);

    // Verify each sibling details
    for (let i = 0; i < siblingButtons.length; i++) {
      const buttonText = await siblingButtons[i].locator("div.font-bold").innerText();
      const isButtonActive = (await siblingButtons[i].getAttribute("class")).includes("border-ocean-500");
      console.log(`Button ${i + 1}: "${buttonText.trim()}" | Active state: ${isButtonActive ? "🟢 Active" : "⚪ Inactive"}`);
    }
  } else {
    console.log("⚠️ Campus Canteens inline block was not found or is hidden.");
  }

  // Take screenshot of Gryffindor menu page
  const gryffindorScreenshotPath = path.join(outDir, "gryffindor_menu.png");
  await page.screenshot({ path: gryffindorScreenshotPath });
  console.log(`Screenshot saved: ${gryffindorScreenshotPath}`);

  await page.close();
  await context.close();
  await browser.close();
  console.log("\n✅ Script completed successfully!");
}

run().catch(err => {
  console.error("❌ Error running script:", err);
  process.exit(1);
});
