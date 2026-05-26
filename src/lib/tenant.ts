import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging";
import type { Database } from "@/lib/db/types";

export type ResolvedTenant = {
  id: string;
  slug: string;
  name: string;
  college_name: string;
  hero_tagline: string | null;
  logo_url: string | null;
  allowed_domain: string | null;
  upi_vpa: string | null;
};

export type CollegeCanteen = {
  slug: string;
  name: string;
  hero_tagline: string | null;
  building: string | null;
  zone: string | null;
  mess_type: string | null;
  is_open: boolean;
  paused_until: string | null;
  opens_at: string | null;
  closes_at: string | null;
  logo_url: string | null;
  pending_orders_count: number;
};

const RESERVED_SUBDOMAINS = new Set(["www", "app", "admin", "api", "auth", "static"]);

// Hosts that look subdomain-y but aren't tenant subdomains. *.vercel.app
// is a preview/prod alias, not a college; we treat it as "no tenant" so the
// caller falls back to DEFAULT_TENANT_SLUG.
const NON_TENANT_HOST_SUFFIXES = [".vercel.app", ".vercel.sh"];

export function tenantSlugFromHost(host: string | null | undefined): string | null {
  if (!host) return null;
  const clean = host.split(":")[0]?.toLowerCase() ?? "";
  if (!clean) return null;
  if (clean === "localhost" || clean === "127.0.0.1") return null;
  if (NON_TENANT_HOST_SUFFIXES.some((s) => clean.endsWith(s))) return null;
  const parts = clean.split(".");
  if (parts.length < 2) return null;
  if (clean.endsWith(".localhost")) {
    return parts[0] && !RESERVED_SUBDOMAINS.has(parts[0]) ? parts[0] : null;
  }
  if (parts.length >= 3) {
    const sub = parts[0];
    return sub && !RESERVED_SUBDOMAINS.has(sub) ? sub : null;
  }
  return null;
}

// Anon-key client that bypasses cookies — used purely to resolve the public
// tenant record from the slug. Cached per request by React.
const _resolverClient = () =>
  createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

// Edge-cached tenant lookup: 500 concurrent students hitting /c/iitb-h9/menu within
// a minute trigger ONE Supabase call, not 500. React.cache() is still wrapped on top
// so within a single request the same slug resolves once.
const fetchTenantUncached = async (slug: string): Promise<ResolvedTenant | null> => {
  const client = _resolverClient();
  const { data, error } = await client.rpc("resolve_tenant", { p_slug: slug });
  if (error || !data || data.length === 0) return null;
  const row = data[0] as unknown as {
    id: string;
    slug: string;
    name: string;
    college_name: string;
    hero_tagline: string | null;
    logo_url: string | null;
    allowed_domain: string | null;
    upi_vpa: string | null;
  };
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    college_name: row.college_name,
    hero_tagline: row.hero_tagline,
    logo_url: row.logo_url,
    allowed_domain: row.allowed_domain ?? null,
    upi_vpa: row.upi_vpa ?? null,
  };
};

const fetchTenantEdgeCached = unstable_cache(
  fetchTenantUncached,
  ["resolve-tenant"],
  { revalidate: 60, tags: ["tenant"] }
);

export const resolveTenant = cache(async (slug: string): Promise<ResolvedTenant | null> => {
  return fetchTenantEdgeCached(slug);
});

// College portal: list all canteens at a college with live wait/open status.
const fetchCollegeCanteensUncached = async (collegeSlug: string): Promise<CollegeCanteen[]> => {
  const client = _resolverClient();
  const { data, error } = await client.rpc("college_canteens", { p_college_slug: collegeSlug });
  if (error || !data) return [];
  return data as unknown as CollegeCanteen[];
};

const fetchCollegeCanteensCached = unstable_cache(
  fetchCollegeCanteensUncached,
  ["college-canteens"],
  { revalidate: 30, tags: ["college-canteens"] }
);

export const collegeCanteens = cache(async (slug: string): Promise<CollegeCanteen[]> => {
  return fetchCollegeCanteensCached(slug);
});

// ── Production-Grade Tenant Context Helper (BlackRock/HFT level) ─────────────
//
// This helper is one of the central "puzzle pieces" for the core product promise:
//
// "One login → each admin gets:
//   - their own pages / experience
//   - their own URL / subdomain (or custom domain)
//   - their own data (respective DB or strong isolation to store & retrieve)
//   - their own servers (feeling of a dedicated system)"
//
// Every critical path in the system must flow through explicit tenant context
// so that this promise is not just marketing — it is technically enforced and
// observable.
//
// Design goals:
// - Fail fast with clear errors (better than silent cross-tenant data leaks)
// - Works for both authenticated user flows and service-role background jobs
// - Rich structured logging on every resolution (for 2am debugging + audits)
// - Minimal magic — easy to audit, extend toward dedicated DB resources per large tenant
// - Makes the "own subdomain + own data" vision real and defensible at scale (thousands of users/orders across many tenants)

export type TenantContext = {
  tenant: ResolvedTenant;
  slug: string;
  isServiceRole: boolean;
};

/**
 * Resolves and returns a strict tenant context from the current request.
 * Use this at the very top of Server Actions and API routes.
 *
 * Throws on missing/invalid tenant (intentional — better to fail loud in production).
 */
export async function requireTenantContext(): Promise<TenantContext> {
  const { headers } = await import("next/headers");
  const h = await headers();
  const slug = h.get("x-tenant-slug");

  if (!slug) {
    logger.error("tenant context resolution failed — missing x-tenant-slug header", null, { reason: "no_header" });
    throw new Error("Invalid tenant context: missing x-tenant-slug header (middleware should have set this)");
  }

  const tenant = await resolveTenant(slug);
  if (!tenant) {
    logger.error("tenant context resolution failed", null, { slug, reason: "not_found" });
    throw new Error(`Invalid tenant context: ${slug}`);
  }

  logger.info("tenant context resolved", {
    tenant_id: tenant.id,
    slug: tenant.slug,
    source: "header",
  });

  return {
    tenant,
    slug: tenant.slug,
    isServiceRole: false, // will be enhanced later for cron paths
  };
}

/**
 * For background jobs / crons that run across tenants or with service role.
 * Accepts an explicit tenant slug (or runs with a provided admin client).
 */
export async function requireTenantContextForJob(slug: string): Promise<TenantContext> {
  const tenant = await resolveTenant(slug);
  if (!tenant) {
    logger.error("tenant context resolution failed in job", null, { slug, reason: "not_found" });
    throw new Error(`Invalid tenant for job: ${slug}`);
  }

  logger.info("tenant context resolved for job", {
    tenant_id: tenant.id,
    slug: tenant.slug,
  });

  return {
    tenant,
    slug: tenant.slug,
    isServiceRole: true,
  };
}
