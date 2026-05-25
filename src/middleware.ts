// Cache reload trigger - force reload 1
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { tenantSlugFromHost } from "@/lib/tenant";

const DEFAULT_TENANT_SLUG = process.env.DEFAULT_TENANT_SLUG ?? "";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Edge-level in-memory cache for tenants and user roles to avoid database pressure
const tenantCache = new Map<string, { tenant: any; expiresAt: number }>();
const roleCache = new Map<string, { role: string | null; expiresAt: number }>();

async function getMiddlewareTenant(slug: string) {
  const now = Date.now();
  const cached = tenantCache.get(slug);
  if (cached && cached.expiresAt > now) {
    return cached.tenant;
  }
  try {
    const url = `${supabaseUrl}/rest/v1/rpc/resolve_tenant`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "apikey": supabaseAnonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_slug: slug }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;
    const tenant = data[0];
    tenantCache.set(slug, { tenant, expiresAt: now + 5 * 60 * 1000 }); // 5 minutes TTL
    return tenant;
  } catch (err) {
    console.error("Error resolving tenant in middleware:", err);
    return null;
  }
}

async function getMiddlewareUserRole(supabase: any, userId: string, tenantId: string, collegeId: string | null) {
  const cacheKey = `${userId}:${tenantId}`;
  const now = Date.now();
  const cached = roleCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.role;
  }

  try {
    // 1. Fetch from tenant_memberships using the authenticated supabase client
    const { data: memData } = await supabase
      .from("tenant_memberships")
      .select("role")
      .eq("user_id", userId)
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .maybeSingle();
    let role: string | null = memData ? memData.role : null;

    // 2. If no role, check college admin
    if (!role && collegeId) {
      const { data: colData } = await supabase
        .from("college_memberships")
        .select("is_active")
        .eq("user_id", userId)
        .eq("college_id", collegeId)
        .eq("is_active", true)
        .maybeSingle();
      if (colData) {
        role = "canteen_admin";
      }
    }

    roleCache.set(cacheKey, { role, expiresAt: now + 5 * 60 * 1000 }); // 5 minutes TTL
    return role;
  } catch (err) {
    console.error("Error getting user role in middleware:", err);
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // Exclude static assets and global API entry hooks from rewrite execution
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

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
    supabaseUrl,
    supabaseAnonKey,
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

  // OPTIMIZATION: Only verify token via getUser() if a Supabase cookie exists.
  // This drastically cuts down on redundant auth API calls.
  const hasSessionCookie = req.cookies.getAll().some(cookie => cookie.name.startsWith("sb-"));
  let user = null;
  if (hasSessionCookie) {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  // 3. Strict authentication edge protection for protected kitchen & admin routes
  const isKitchenPath = pathname.match(/^\/c\/([^/]+)\/kitchen(\/.*)?$/) || pathname.startsWith("/kitchen");
  const isAdminPath = pathname.match(/^\/c\/([^/]+)\/admin(\/.*)?$/) || pathname.startsWith("/admin");

  if (isKitchenPath || isAdminPath) {
    const targetSlug = resolvedTenantSlug;
    if (!user) {
      return NextResponse.redirect(new URL(`/c/${targetSlug}/login?next=${encodeURIComponent(pathname)}`, req.url));
    }
    const tenant = await getMiddlewareTenant(targetSlug);
    if (!tenant) {
      return new NextResponse("Tenant Not Found", { status: 404 });
    }
    const role = await getMiddlewareUserRole(supabase, user.id, tenant.id, tenant.college_id);

    if (isKitchenPath) {
      if (role !== "kitchen_staff" && role !== "canteen_admin" && role !== "super_admin") {
        return NextResponse.redirect(new URL(`/c/${targetSlug}/unauthorised`, req.url));
      }
    } else if (isAdminPath) {
      if (role !== "canteen_admin" && role !== "super_admin") {
        return NextResponse.redirect(new URL(`/c/${targetSlug}/unauthorised`, req.url));
      }
    }
  }

  // Rebuild request headers with the current cookie values (including any refreshed ones)
  const cookieHeader = req.cookies.getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
  requestHeaders.set("cookie", cookieHeader);

  // 4. Build the response — rewrite /c/[slug]/<rest> to internal portal routes.
  let res: NextResponse;
  if (canteenMatch && canteenMatch[2] && canteenMatch[2] !== "/") {
    const rewriteUrl = url.clone();
    rewriteUrl.pathname = canteenMatch[2];
    res = NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
  } else {
    res = NextResponse.next({ request: { headers: requestHeaders } });
  }

  res.headers.set("x-tenant-slug", resolvedTenantSlug);
  if (collegeSlug) res.headers.set("x-college-slug", collegeSlug);

  // 5. Apply refreshed cookies to response so browser stores them
  for (const { name, value, options } of refreshedCookies) {
    res.cookies.set(name, value, options);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|html)$).*)"],
};
