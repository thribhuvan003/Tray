import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

if (fs.existsSync(envPath)) {
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function getOrCreateUser(email, password, fullName) {
  // Try finding existing user first
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) throw listErr;
  
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    console.log(`User ${email} already exists.`);
    // Reset password to match TestPassword123!
    const { error: updateErr } = await supabase.auth.admin.updateUserById(existing.id, { password });
    if (updateErr) throw updateErr;
    return existing;
  }

  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });
  
  if (createErr) throw createErr;
  console.log(`User ${email} created successfully.`);
  return created.user;
}

async function main() {
  console.log("Starting fake canteen seeding...");

  // 1. Create College
  const collegeSlug = "fake-uni";
  const collegeName = "Fake Technical University";
  
  let { data: college } = await supabase
    .from("colleges")
    .select("id")
    .eq("slug", collegeSlug)
    .maybeSingle();

  if (!college) {
    const { data: newCollege, error: colErr } = await supabase
      .from("colleges")
      .insert({
        name: collegeName,
        slug: collegeSlug,
        city: "Chennai",
        allowed_domains: ["gmail.com"],
        is_active: true
      })
      .select("id")
      .single();
      
    if (colErr) throw colErr;
    college = newCollege;
    console.log(`College '${collegeName}' created.`);
  } else {
    console.log(`College '${collegeName}' already exists.`);
  }

  // 2. Create Tenant (Canteen)
  const tenantSlug = "fake-canteen";
  const canteenName = "Fake Canteen";
  
  let { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", tenantSlug)
    .maybeSingle();

  if (!tenant) {
    const { data: newTenant, error: tenErr } = await supabase
      .from("tenants")
      .insert({
        name: canteenName,
        slug: tenantSlug,
        college_name: collegeName,
        college_id: college.id,
        building: "Main Block Ground Floor",
        upi_vpa: "fakecanteen@paytm",
        opens_at: "08:00:00",
        closes_at: "21:00:00",
        allowed_domain: "gmail.com",
        is_active: true,
        is_open: true,
        guest_orders_enabled: true
      })
      .select("id")
      .single();

    if (tenErr) throw tenErr;
    tenant = newTenant;
    console.log(`Tenant (Canteen) '${canteenName}' created.`);
  } else {
    console.log(`Tenant (Canteen) '${canteenName}' already exists.`);
  }

  // 3. Create Admin User
  const adminEmail = "fakeowner2026@gmail.com";
  const adminName = "Fake Owner";
  const adminUser = await getOrCreateUser(adminEmail, "TestPassword123!", adminName);

  // 4. Admin Membership
  const { error: admColErr } = await supabase
    .from("college_memberships")
    .upsert({ college_id: college.id, user_id: adminUser.id, is_active: true }, { onConflict: "college_id,user_id" });
  if (admColErr) console.error("Admin college membership error", admColErr);

  const { error: admTenErr } = await supabase
    .from("tenant_memberships")
    .upsert({ tenant_id: tenant.id, user_id: adminUser.id, role: "canteen_admin", display_name: adminName, is_active: true }, { onConflict: "tenant_id,user_id" });
  if (admTenErr) console.error("Admin tenant membership error", admTenErr);

  // 5. Create Chef User
  const chefEmail = "fakechef2026@gmail.com";
  const chefName = "Fake Chef";
  const chefUser = await getOrCreateUser(chefEmail, "TestPassword123!", chefName);

  // 6. Chef Membership
  const { error: chefColErr } = await supabase
    .from("college_memberships")
    .upsert({ college_id: college.id, user_id: chefUser.id, is_active: true }, { onConflict: "college_id,user_id" });
  if (chefColErr) console.error("Chef college membership error", chefColErr);

  const { error: chefTenErr } = await supabase
    .from("tenant_memberships")
    .upsert({ tenant_id: tenant.id, user_id: chefUser.id, role: "kitchen_staff", display_name: chefName, is_active: true }, { onConflict: "tenant_id,user_id" });
  if (chefTenErr) console.error("Chef tenant membership error", chefTenErr);

  // 7. Seed Sample Categories
  const categoriesList = [
    { name: "Specials", sort_order: 1 },
    { name: "Snacks", sort_order: 2 },
    { name: "Beverages", sort_order: 3 }
  ];

  const catMap = {};
  for (const cat of categoriesList) {
    let { data: dbCat } = await supabase
      .from("menu_categories")
      .select("id")
      .eq("tenant_id", tenant.id)
      .eq("name", cat.name)
      .maybeSingle();

    if (!dbCat) {
      const { data: newCat, error: catErr } = await supabase
        .from("menu_categories")
        .insert({
          tenant_id: tenant.id,
          name: cat.name,
          sort_order: cat.sort_order
        })
        .select("id")
        .single();
      if (catErr) throw catErr;
      dbCat = newCat;
      console.log(`Category '${cat.name}' created.`);
    }
    catMap[cat.name] = dbCat.id;
  }

  // 8. Seed Sample Menu Items
  const itemsList = [
    {
      category: "Specials",
      name: "Paneer Butter Masala Combo",
      description: "Butter paneer served with 2 butter naans, pickle, and salad.",
      price_paise: 12000,
      diet: "veg",
      image_url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60"
    },
    {
      category: "Specials",
      name: "Chicken Tikka Masala Combo",
      description: "Creamy tandoori chicken tikka gravy served with fragrant jeera rice.",
      price_paise: 15000,
      diet: "nonveg",
      image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=60"
    },
    {
      category: "Snacks",
      name: "Samosa (2 pcs)",
      description: "Crispy fried pastry filled with spiced potato and peas mixture, served with sweet tamarind chutney.",
      price_paise: 3000,
      diet: "veg",
      image_url: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60"
    },
    {
      category: "Snacks",
      name: "Vada Pav",
      description: "Classic Mumbai street food style batata vada inside a soft pav bun with garlic chutney.",
      price_paise: 4000,
      diet: "veg",
      image_url: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&auto=format&fit=crop&q=60"
    },
    {
      category: "Beverages",
      name: "Adrak Masala Chai",
      description: "Hot, comforting milk tea brewed with fresh ginger, cardamom, and tea leaves.",
      price_paise: 1500,
      diet: "veg",
      image_url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60"
    },
    {
      category: "Beverages",
      name: "Premium Cold Coffee",
      description: "Chilled rich blended coffee with fresh milk, vanilla ice cream, and chocolate syrup drizzle.",
      price_paise: 5000,
      diet: "veg",
      image_url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=60"
    }
  ];

  for (const item of itemsList) {
    const { data: existingItem } = await supabase
      .from("menu_items")
      .select("id")
      .eq("tenant_id", tenant.id)
      .eq("name", item.name)
      .maybeSingle();

    if (!existingItem) {
      const { error: itemErr } = await supabase
        .from("menu_items")
        .insert({
          tenant_id: tenant.id,
          category_id: catMap[item.category],
          name: item.name,
          description: item.description,
          price_paise: item.price_paise,
          diet: item.diet,
          image_url: item.image_url,
          in_stock: true,
          status: "live",
          sort_order: 0
        });

      if (itemErr) console.error(`Error inserting ${item.name}`, itemErr);
      else console.log(`Menu item '${item.name}' created.`);
    } else {
      console.log(`Menu item '${item.name}' already exists.`);
    }
  }

  console.log("\n=======================================================");
  console.log("  CANTEEN SEEDING SUCCESSFUL!");
  console.log("=======================================================");
  console.log(`Tenant Slug:      ${tenantSlug}`);
  console.log(`College Name:     ${collegeName}`);
  console.log("\n  SIGN-IN DETAILS FOR TESTING:");
  console.log("-------------------------------------------------------");
  console.log("  1. ADMIN DASHBOARD:");
  console.log(`     URL:         http://localhost:3000/c/${tenantSlug}/admin/dashboard`);
  console.log(`     Email:       ${adminEmail}`);
  console.log(`     Password:    TestPassword123!`);
  console.log("\n  2. KITCHEN BOARD:");
  console.log(`     URL:         http://localhost:3000/c/${tenantSlug}/kitchen`);
  console.log(`     Email:       ${chefEmail}`);
  console.log(`     Password:    TestPassword123!`);
  console.log("\n  3. STUDENT MENU:");
  console.log(`     URL:         http://localhost:3000/c/${tenantSlug}/menu`);
  console.log("=======================================================\n");
}

main().catch(console.error);
