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

const _resolverClient = () =>
  createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

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

  // Fetch college_slug via tenants→colleges join (cached separately).
  // Uses anon key so college table must have public SELECT.
  let college_slug: string | null = null;
  let building: string | null = null;
  let zone: string | null = null;
  let is_open = true;

  try {
    const { data: tenantRow } = await client
      .from("tenants")
      .select("college_id, building, zone, is_open, colleges(slug)")
      .eq("slug", slug)
      .single();

    if (tenantRow) {
      building = tenantRow.building ?? null;
      zone = tenantRow.zone ?? null;
      is_open = tenantRow.is_open ?? true;
      const colleges = tenantRow.colleges as unknown as { slug: string } | null;
      college_slug = colleges?.slug ?? null;
    }
  } catch {
    // Graceful degradation — college switcher won't show if this fails
  }

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    college_name: row.college_name,
    college_slug,
    hero_tagline: row.hero_tagline,
    logo_url: row.logo_url,
    allowed_domain: row.allowed_domain ?? null,
    upi_vpa: row.upi_vpa ?? null,
    building,
    zone,
    is_open,
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
