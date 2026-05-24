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
  const primaryCollegeId = "d0fe0dd0-8a11-45e3-8405-d21330cf82c0"; // Hogwarts School of Witchcraft and Wizardry
  const duplicateCollegeId = "dad81368-44fe-46b6-83b7-bd2c2cfb57b2"; // Hogwarts School of Witchcraft and Wizardry-2

  console.log("Merging colleges...");

  // 1. Update tenants under duplicate college to point to primary college
  const { data: tenantUpdate, error: tenantErr } = await supabase
    .from("tenants")
    .update({ college_id: primaryCollegeId })
    .eq("college_id", duplicateCollegeId)
    .select();

  if (tenantErr) {
    console.error("Error updating tenants:", tenantErr);
    return;
  }
  console.log("Updated tenants:", tenantUpdate);

  // 2. Update college_memberships under duplicate college to point to primary college
  const { data: membershipUpdate, error: memberErr } = await supabase
    .from("college_memberships")
    .update({ college_id: primaryCollegeId })
    .eq("college_id", duplicateCollegeId)
    .select();

  if (memberErr) {
    console.warn("Note: college_memberships update error or not found:", memberErr.message);
  } else {
    console.log("Updated college_memberships:", membershipUpdate);
  }

  // 3. Delete duplicate college
  const { error: deleteErr } = await supabase
    .from("colleges")
    .delete()
    .eq("id", duplicateCollegeId);

  if (deleteErr) {
    console.error("Error deleting duplicate college:", deleteErr);
    return;
  }
  console.log("Deleted duplicate college successfully!");

  // 4. Verify canteens and colleges now
  const { data: finalColleges } = await supabase.from("colleges").select("*").eq("name", "Hogwarts School of Witchcraft and Wizardry");
  console.log("\nFinal Colleges in database:");
  console.log(finalColleges);

  const { data: finalCanteens } = await supabase.from("tenants").select("slug, name, college_id").in("slug", ["great-hall-canteen", "gryffindor-common-room-canteen"]);
  console.log("\nFinal Canteens in database:");
  console.log(finalCanteens);
}

main().catch(console.error);
