import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { tenantSlugFromHost } from "@/lib/tenant";

const DEFAULT_TENANT_SLUG = process.env.DEFAULT_TENANT_SLUG ?? "aditya";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });

  // Resolve tenant slug from subdomain, ?tenant= override, or fall back.
  const hostSlug = tenantSlugFromHost(req.headers.get("host"));
  const querySlug = req.nextUrl.searchParams.get("tenant");
  const slug = (querySlug || hostSlug || DEFAULT_TENANT_SLUG).toLowerCase();
  res.headers.set("x-tenant-slug", slug);

  // Pipe Supabase auth cookies forward AND refresh the session.
  // The @supabase/ssr docs require this getUser() call in middleware so refreshed
  // cookies are written back via setAll — without it, sessions silently expire.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(set: { name: string; value: string; options: CookieOptions }[]) {
          for (const { name, value, options } of set) {
            res.cookies.set(name, value, options);
          }
        },
      },
    }
  );
  await supabase.auth.getUser();

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
