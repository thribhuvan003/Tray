import { NextResponse, type NextRequest } from "next/server";
import { verifyPaymentNow } from "@/app/(student)/_actions";
import { getAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/get-user";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("id");

  if (!orderId) {
    return NextResponse.json({ error: "Order ID missing" }, { status: 400 });
  }

  // ── SECURITY: Must be an authenticated user ──────────────────────────────
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Verify the order belongs to this user BEFORE calling verifyPaymentNow
    const globalAdmin = getAdminClient();
    const { data: ord } = await globalAdmin
      .from("orders")
      .select("id, tenant_id, status, user_id")
      .eq("id", orderId)
      .maybeSingle<{ id: string; tenant_id: string; status: string; user_id: string | null }>();

    if (!ord) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Ownership check — student can only poll their own order
    // Walk-in orders have null user_id — only kitchen staff should poll those,
    // but we still gate them here since this is a student-facing endpoint.
    if (ord.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
