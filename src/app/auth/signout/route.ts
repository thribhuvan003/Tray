import { NextResponse, type NextRequest } from "next/server";
import { getServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await getServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", req.url));
}

// GET sign-out is intentionally removed — GET requests are pre-fetched by browsers
// and can be triggered via <img> tags (CSRF). Sign-out must be POST only.
