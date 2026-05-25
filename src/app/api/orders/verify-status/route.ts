import { NextResponse, type NextRequest } from "next/server";
import { verifyPaymentNow } from "@/app/(student)/_actions";
import { getAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("id");

  if (!orderId) {
    return NextResponse.json({ error: "Order ID missing" }, { status: 400 });
  }

  try {
    // 1. Reconcile and verify payment via the server action
    await verifyPaymentNow(orderId);

    // 2. Fetch the updated order status
    const globalAdmin = getAdminClient();
    const { data: ord } = await globalAdmin
      .from("orders")
      .select("tenant_id, status")
      .eq("id", orderId)
      .maybeSingle<{ tenant_id: string; status: string }>();

    if (!ord) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ status: ord.status });
  } catch (err: any) {
    console.error("Error in verify-status API route:", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
