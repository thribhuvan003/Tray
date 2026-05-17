import { headers } from "next/headers";
import { resolveTenant } from "@/lib/tenant";
import { getServerClient } from "@/lib/supabase/server";
import { StaffPanel } from "@/components/portal-admin/staff-panel";

type Member = {
  id: string;
  user_id: string;
  role: "student" | "kitchen_staff" | "canteen_admin" | "super_admin";
  display_name: string | null;
  is_active: boolean;
  created_at: string;
};
type Invite = {
  id: string;
  email: string;
  role: "student" | "kitchen_staff" | "canteen_admin" | "super_admin";
  token: string;
  expires_at: string;
  accepted_at: string | null;
};

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const h = await headers();
  const slug = h.get("x-tenant-slug") ?? "aditya";
  const tenant = await resolveTenant(slug);
  if (!tenant) return null;
  const supabase = await getServerClient(tenant.id);
  const [{ data: members }, { data: invites }] = await Promise.all([
    supabase
      .from("tenant_memberships")
      .select("id, user_id, role, display_name, is_active, created_at")
      .eq("tenant_id", tenant.id)
      .order("created_at", { ascending: false })
      .returns<Member[]>(),
    supabase
      .from("staff_invites")
      .select("id, email, role, token, expires_at, accepted_at")
      .eq("tenant_id", tenant.id)
      .is("accepted_at", null)
      .order("created_at", { ascending: false })
      .returns<Invite[]>(),
  ]);
  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-[26px] sm:text-[30px] font-semibold tracking-tight">Staff</h1>
        <div className="text-[11px] font-mono uppercase tracking-[0.12em] text-graphite-400 mt-0.5">
          Members &amp; pending invites
        </div>
      </div>
      <StaffPanel members={members ?? []} invites={invites ?? []} />
    </div>
  );
}
