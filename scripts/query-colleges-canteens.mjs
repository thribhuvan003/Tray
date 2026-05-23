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

async function main() {
  const { data: colleges, error: colErr } = await supabase.from("colleges").select("*");
  if (colErr) {
    console.error("Colleges query error:", colErr);
    return;
  }
  console.log("Colleges:");
  for (const col of colleges) {
    console.log(`- [${col.slug}] ${col.name} (id: ${col.id}, allowed_domains: ${col.allowed_domains})`);
  }

  const { data: canteens, error: canErr } = await supabase.from("tenants").select("*");
  if (canErr) {
    console.error("Canteens query error:", canErr);
    return;
  }
  console.log("\nCanteens:");
  for (const can of canteens) {
    const college = colleges.find(c => c.id === can.college_id);
    console.log(`- [${can.slug}] ${can.name} (id: ${can.id}, college: ${college ? college.name : "NONE"})`);
  }
}

main().catch(console.error);
