import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { tenantSlugFromHost } from "@/lib/tenant";

const DEFAULT_TENANT_SLUG = process.env.DEFAULT_TENANT_SLUG ?? "aditya";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;
  const requestHeaders = new Headers(req.headers);

  // 1. Resolve tenant slug from path, subdomain, or query override
  const canteenMatch = pathname.match(/^\/c\/([^/]+)(\/.*)?$/);
  const collegeMatch = pathname.match(/^\/college\/([^/]+)(\/.*)?$/);

  let tenantSlug: string | null = null;
  let collegeSlug: string | null = null;

  if (canteenMatch) {
    tenantSlug = canteenMatch[1]?.toLowerCase() ?? null;
  } else if (collegeMatch) {
    collegeSlug = collegeMatch[1]?.toLowerCase() ?? null;
  } else {
    tenantSlug = tenantSlugFromHost(req.headers.get("host"));
  }

  const queryOverride = url.searchParams.get("tenant");
  if (queryOverride) tenantSlug = queryOverride.toLowerCase();

  const resolvedTenantSlug = (tenantSlug || DEFAULT_TENANT_SLUG).toLowerCase();
  requestHeaders.set("x-tenant-slug", resolvedTenantSlug);
  if (collegeSlug) requestHeaders.set("x-college-slug", collegeSlug);

  // 2. Refresh Supabase auth tokens FIRST so the refreshed cookies reach
  //    the page handler. We collect the refreshed cookies, then build the
  //    response (rewrite or next) with those cookies applied to both the
  //    forwarded request headers and the response SET-COOKIE headers.
  const refreshedCookies: { name: string; value: string; options: CookieOptions }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(set: { name: string; value: string; options: CookieOptions }[]) {
          for (const cookie of set) {
            refreshedCookies.push(cookie);
            // Update req so the page handler sees the refreshed token
            req.cookies.set(cookie.name, cookie.value);
          }
        },
      },
    }
  );
  await supabase.auth.getUser();

  // Rebuild request headers with refreshed cookie values
  if (refreshedCookies.length > 0) {
    const cookieHeader = req.cookies.getAll()
      .map(({ name, value }) => `${name}=${value}`)
      .join("; ");
    requestHeaders.set("cookie", cookieHeader);
  }

  // 3. Build the response — rewrite /c/[slug]/<rest> to internal portal routes, and root to /landing if no tenant slug is found.
  let res: NextResponse;
  if (pathname === "/" && !tenantSlug) {
    const rewriteUrl = url.clone();
    rewriteUrl.pathname = "/landing";
    res = NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
  } else if (canteenMatch && canteenMatch[2] && canteenMatch[2] !== "/") {
    const rewriteUrl = url.clone();
    rewriteUrl.pathname = canteenMatch[2];
    res = NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
  } else {
    res = NextResponse.next({ request: { headers: requestHeaders } });
  }

  res.headers.set("x-tenant-slug", resolvedTenantSlug);
  if (collegeSlug) res.headers.set("x-college-slug", collegeSlug);

  // 4. Apply refreshed cookies to response so browser stores them
  for (const { name, value, options } of refreshedCookies) {
    res.cookies.set(name, value, options);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|html)$).*)"],
};
