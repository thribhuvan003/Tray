import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "node:crypto";
import dayjs from "dayjs";

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

async function main() {
  const email = "fakestaff2026@gmail.com";
  const tenantSlug = "aditya";

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", tenantSlug)
    .single();

  if (!tenant) throw new Error("aditya canteen not found");

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = dayjs().add(48, "hour").toISOString();

  // Delete existing fake invite if any to avoid duplicates
  await supabase
    .from("staff_invites")
    .delete()
    .eq("tenant_id", tenant.id)
    .eq("email", email);

  const { error } = await supabase.from("staff_invites").insert({
    tenant_id: tenant.id,
    email,
    role: "kitchen_staff",
    token,
    expires_at: expiresAt,
  });

  if (error) throw error;

  console.log(`Successfully created fake invite for ${email} in canteen ${tenantSlug}!`);
  console.log(`Invite link: http://localhost:3000/auth/invite/${token}`);
}

main().catch(console.error);
