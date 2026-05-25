import { NextResponse, type NextRequest } from "next/server";
import { verifyPaymentNow } from "@/app/(student)/_actions";
import { getAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getTenantSlugFromHeaders, resolveTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("id");

  if (!orderId) {
    return NextResponse.json({ error: "Order ID missing" }, { status: 400 });
  }

  try {
    // Use admin client to fetch the order — bypasses RLS so guest orders work
    const globalAdmin = getAdminClient();
    const { data: ord } = await globalAdmin
      .from("orders")
      .select("id, tenant_id, status, user_id")
      .eq("id", orderId)
      .maybeSingle<{ id: string; tenant_id: string; status: string; user_id: string | null }>();

    if (!ord) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ── SECURITY: Validate tenant matches the request context ────────────────
    // Prevents cross-tenant order snooping via this endpoint.
    const tenant = await resolveTenant(getTenantSlugFromHeaders(req.headers));
    if (tenant && ord.tenant_id !== tenant.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (ord.user_id === null) {
      // ── Guest order: no auth required — order has no owner ────────────────
      // Guest orders are identified by user_id IS NULL. Anyone with the order
      // ID (stored in the guest's browser) can poll status. The order ID itself
      // acts as the bearer token for guest flows.
    } else {
      // ── Authenticated order: enforce ownership ────────────────────────────
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
      if (ord.user_id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // 1. Reconcile and verify payment via the server action
    await verifyPaymentNow(orderId);

    // 2. Fetch the updated order status
    const { data: updated } = await globalAdmin
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .maybeSingle<{ status: string }>();

    return NextResponse.json({ status: updated?.status ?? ord.status });
  } catch (_err) {
    // Do NOT leak internal error messages to the client
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
