import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "@/lib/db/types";

export type ResolvedTenant = {
  id: string;
  slug: string;
  name: string;
  college_name: string;
  college_slug: string | null;
  hero_tagline: string | null;
  logo_url: string | null;
  allowed_domain: string | null;
  upi_vpa: string | null;
  building: string | null;
  zone: string | null;
  is_open: boolean;
  pending_orders_count?: number;
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
  dishCount?: number;
};

const RESERVED_SUBDOMAINS = new Set(["www", "app", "admin", "api", "auth", "static"]);

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

export function getTenantSlugFromHeaders(h: { get: (name: string) => string | null }): string {
  let slug = h.get("x-tenant-slug");
  if (slug) return slug;

  // Fallback for Next.js Server Actions
  const referer = h.get("referer");
  if (referer) {
    try {
      const url = new URL(referer);
      const match = url.pathname.match(/^\/c\/([^/]+)/);
      if (match) return match[1].toLowerCase();
    } catch {}
  }

  const host = h.get("host");
  const hostSlug = tenantSlugFromHost(host);
  if (hostSlug) return hostSlug;

  return "aditya";
}


const _resolverClient = () =>
  createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

const fetchTenantUncached = async (slug: string): Promise<ResolvedTenant | null> => {
  try {
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
      // Extended fields returned by the updated SECURITY DEFINER RPC
      college_slug: string | null;
      building: string | null;
      zone: string | null;
      is_open: boolean;
    };
    if (!row) return null;

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      college_name: row.college_name,
      college_slug: row.college_slug ?? null,
      hero_tagline: row.hero_tagline,
      logo_url: row.logo_url,
      allowed_domain: row.allowed_domain ?? null,
      upi_vpa: row.upi_vpa ?? null,
      building: row.building ?? null,
      zone: row.zone ?? null,
      is_open: row.is_open ?? true,
    };
  } catch (err) {
    console.error("resolveTenant failed:", err);
    return null;
  }
};

const fetchTenantEdgeCached = unstable_cache(
  fetchTenantUncached,
  ["resolve-tenant"],
  { revalidate: 60, tags: ["tenant"] }
);

export const resolveTenant = cache(async (slug: string): Promise<ResolvedTenant | null> => {
  const cached = await fetchTenantEdgeCached(slug);
  if (cached) return cached;
  return fetchTenantUncached(slug);
});

// College portal: list all canteens at a college with live wait/open status.
export const collegeCanteensUncached = async (collegeSlug: string): Promise<CollegeCanteen[]> => {
  try {
    const client = _resolverClient();
    const { data, error } = await client.rpc("college_canteens", { p_college_slug: collegeSlug });
    if (error || !data) return [];
    return data as unknown as CollegeCanteen[];
  } catch (err) {
    console.error("collegeCanteens failed:", err);
    return [];
  }
};

const fetchCollegeCanteensCached = unstable_cache(
  collegeCanteensUncached,
  ["college-canteens"],
  { revalidate: 30, tags: ["college-canteens"] }
);

export const collegeCanteens = cache(async (slug: string): Promise<CollegeCanteen[]> => {
  return fetchCollegeCanteensCached(slug);
});

