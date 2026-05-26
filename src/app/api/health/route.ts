import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const admin = getAdminClient();
    const { error } = await admin.from("tenants").select("id").limit(1);
    if (error) throw error;
    return NextResponse.json({ ok: true, db: "ok", ts: Date.now() });
  } catch {
    return NextResponse.json({ ok: false, db: "error", ts: Date.now() }, { status: 503 });
  }
}
