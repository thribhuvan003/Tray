import { NextResponse, type NextRequest } from "next/server";
import { getServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await getServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", req.url));
}

export async function GET(req: NextRequest) {
  // GET requests are used for Next.js pre-fetching. 
  // We do NOT sign out the user on GET to prevent background pre-fetching from logging them out.
  return NextResponse.redirect(new URL("/", req.url));
}
