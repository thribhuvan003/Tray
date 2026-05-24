import { cookies, headers } from "next/headers";
import { resolveTenant, getTenantSlugFromHeaders } from "@/lib/tenant";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TestAuthPage() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const slug = getTenantSlugFromHeaders(headerStore);
  const tenant = await resolveTenant(slug);
  
  let user = null;
  let userError = null;
  let membership = null;
  let memError = null;
  
  if (tenant) {
    const supabase = await getServerClient(tenant.id);
    const { data: userData, error: uErr } = await supabase.auth.getUser();
    user = userData?.user ?? null;
    userError = uErr?.message ?? null;
    
    if (user) {
      const { data: m, error: mErr } = await supabase
        .from("tenant_memberships")
        .select("*")
        .eq("user_id", user.id)
        .eq("tenant_id", tenant.id)
        .eq("is_active", true)
        .maybeSingle();
      membership = m;
      memError = mErr?.message ?? null;
    }
  }

  const allCookies = cookieStore.getAll().map(c => ({ name: c.name, value: c.value.slice(0, 15) + "..." }));
  const importantHeaders = {
    host: headerStore.get("host"),
    referer: headerStore.get("referer"),
    "x-tenant-slug": headerStore.get("x-tenant-slug"),
    cookie: headerStore.get("cookie") ? "present (truncated)" : "missing"
  };

  return (
    <div style={{ padding: 40, fontFamily: "monospace", background: "#111", color: "#eee", minHeight: "100vh" }}>
      <h1>Auth Diagnostics Page</h1>
      <h2>Tenant Details</h2>
      <pre>{JSON.stringify({ slug, tenant }, null, 2)}</pre>
      
      <h2>Supabase Auth</h2>
      <pre>{JSON.stringify({ user, userError }, null, 2)}</pre>
      
      <h2>Tenant Membership</h2>
      <pre>{JSON.stringify({ membership, memError }, null, 2)}</pre>
      
      <h2>Cookies</h2>
      <pre>{JSON.stringify(allCookies, null, 2)}</pre>
      
      <h2>Headers</h2>
      <pre>{JSON.stringify(importantHeaders, null, 2)}</pre>
    </div>
  );
}
