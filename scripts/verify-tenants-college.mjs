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
  const { data: canteens, error: canErr } = await supabase
    .from("tenants")
    .select("id, name, slug, college_id")
    .in("slug", ["great-hall-canteen", "gryffindor-common-room-canteen"]);
    
  if (canErr) {
    console.error("Canteens error:", canErr);
    return;
  }
  
  console.log("Tenants details:");
  console.log(JSON.stringify(canteens, null, 2));

  const collegeIds = canteens.map(c => c.college_id);
  const { data: colleges, error: colErr } = await supabase
    .from("colleges")
    .select("id, name, slug")
    .in("id", collegeIds);
    
  if (colErr) {
    console.error("Colleges error:", colErr);
    return;
  }
  
  console.log("Colleges details:");
  console.log(JSON.stringify(colleges, null, 2));
}

main().catch(console.error);
