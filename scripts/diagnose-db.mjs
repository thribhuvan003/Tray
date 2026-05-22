import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");

// Load .env.local manually
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const firstEq = trimmed.indexOf("=");
    if (firstEq === -1) continue;
    const key = trimmed.slice(0, firstEq).trim();
    let val = trimmed.slice(firstEq + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    } else if (val.startsWith("'") && val.endsWith("'")) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log("Connecting to Supabase at:", supabaseUrl);
  
  // 1. Fetch tenants
  const { data: tenants, error: tenantErr } = await supabase
    .from("tenants")
    .select("*");
    
  if (tenantErr) {
    console.error("Error fetching tenants:", tenantErr);
  } else {
    console.log(`\nFound ${tenants.length} tenants:`);
    for (const t of tenants) {
      console.log(`- Slug: ${t.slug}, Name: ${t.name}, ID: ${t.id}`);
    }
  }

  // 2. Fetch categories
  const { data: categories, error: catErr } = await supabase
    .from("menu_categories")
    .select("*");
    
  if (catErr) {
    console.error("Error fetching categories:", catErr);
  } else {
    console.log(`\nFound ${categories.length} categories:`);
    for (const c of categories) {
      console.log(`- Name: ${c.name}, Tenant ID: ${c.tenant_id}`);
    }
  }

  // 3. Fetch menu items count
  const { count, error: itemErr } = await supabase
    .from("menu_items")
    .select("*", { count: "exact", head: true });
    
  if (itemErr) {
    console.error("Error fetching menu items:", itemErr);
  } else {
    console.log(`\nFound ${count} menu items in total.`);
  }

  // 4. Fetch auth users
  const { data: { users }, error: authErr } = await supabase.auth.admin.listUsers();
  if (authErr) {
    console.error("Error listing auth users:", authErr);
  } else {
    console.log(`\nFound ${users.length} auth users in Supabase:`);
    for (const u of users) {
      console.log(`- Email: ${u.email}, ID: ${u.id}`);
    }
  }

  // 5. Fetch memberships
  const { data: memberships, error: memErr } = await supabase
    .from("tenant_memberships")
    .select("*");
    
  if (memErr) {
    console.error("Error fetching memberships:", memErr);
  } else {
    console.log(`\nFound ${memberships.length} memberships in total:`);
    for (const m of memberships) {
      console.log(`- User ID: ${m.user_id}, Role: ${m.role}, Tenant ID: ${m.tenant_id}`);
    }
  }
}

main().catch(err => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
