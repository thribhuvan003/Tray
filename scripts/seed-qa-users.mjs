import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");

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
  try {
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });
    if (createErr) {
      if (createErr.message.includes("already been registered") || createErr.code === "email_exists") {
        // Fall through to list users
      } else {
        throw createErr;
      }
    } else {
      console.log(`User ${email} created successfully.`);
      return created.user;
    }
  } catch (err) {
    // ignore
  }

  // Fallback: list users to find the existing one
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) throw listErr;
  
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    console.log(`User ${email} already exists (found via list).`);
    const { error: updateErr } = await supabase.auth.admin.updateUserById(existing.id, { password });
    if (updateErr) throw updateErr;
    return existing;
  }
  throw new Error(`Failed to create or retrieve user: ${email}`);
}

async function ensureMembership(userId, tenantId, role, displayName) {
  const { data: existing, error: queryErr } = await supabase
    .from("tenant_memberships")
    .select("*")
    .eq("user_id", userId)
    .eq("tenant_id", tenantId)
    .maybeSingle();
    
  if (queryErr) throw queryErr;
  if (existing) {
    console.log(`Membership for User ID ${userId} in Tenant ${tenantId} as ${role} already exists.`);
    // Ensure active and role
    await supabase
      .from("tenant_memberships")
      .update({ role, is_active: true, display_name: displayName })
      .eq("id", existing.id);
    return;
  }
  
  const { error: insertErr } = await supabase.from("tenant_memberships").insert({
    user_id: userId,
    tenant_id: tenantId,
    role,
    display_name: displayName,
    is_active: true
  });
  if (insertErr) throw insertErr;
  console.log(`Membership for User ID ${userId} created as ${role}.`);
}

async function main() {
  const tenantSlug = "aditya";
  const { data: tenant, error: tenantErr } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", tenantSlug)
    .single();
    
  if (tenantErr || !tenant) {
    throw new Error(`Tenant '${tenantSlug}' not found: ${tenantErr?.message}`);
  }
  const tenantId = tenant.id;
  console.log(`Tenant '${tenantSlug}' ID: ${tenantId}`);

  // 1. Student User
  const student = await getOrCreateUser("student.demo@aec.edu.in", "TestPassword123!", "QA Student");
  await ensureMembership(student.id, tenantId, "student", "QA Student");

  // 2. Kitchen User
  const kitchen = await getOrCreateUser("main.kitchen@traytest.dev", "TestPassword123!", "QA Kitchen Chef");
  await ensureMembership(kitchen.id, tenantId, "kitchen_staff", "QA Kitchen Chef");

  // 3. Admin User
  const admin = await getOrCreateUser("main.admin@traytest.dev", "TestPassword123!", "QA Canteen Admin");
  await ensureMembership(admin.id, tenantId, "canteen_admin", "QA Canteen Admin");

  console.log("Seeding QA users complete.");
}

main().catch(console.error);
