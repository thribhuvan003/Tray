import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { getAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  if (!env.RAZORPAY_WEBHOOK_SECRET || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[Razorpay Webhook] Missing configuration environment variables.");
    return NextResponse.json({ ok: false, error: "Not configured" }, { status: 503 });
  }

  const sig = req.headers.get("x-razorpay-signature");
  if (!sig) {
    console.warn("[Razorpay Webhook] Missing x-razorpay-signature header.");
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const rawBody = await req.text();
  if (!verifyWebhookSignature(rawBody, sig)) {
    console.error("[Razorpay Webhook] Cryptographic verification failed for signature:", sig);
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
  }

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch (error) {
    console.error("[Razorpay Webhook] Failed to parse request body as JSON.");
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  const payment = body.payload?.payment?.entity;
  if (!payment?.order_id) {
    console.log("[Razorpay Webhook] Skipped: event payload does not contain razorpay order_id.");
    return NextResponse.json({ ok: true, skipped: true });
  }

  const admin = getAdminClient();
  const eventId = `${body.event}:${payment.id ?? "x"}:${body.created_at ?? Date.now()}`;
  
  let tenantOrderId = payment.notes?.order_id ?? payment.notes?.order;
  let tenantId = payment.notes?.tenant_id;

  // Resolve order_id if notes were stripped
  if (!tenantOrderId) {
    const { data: paymentRow } = await admin
      .from("payments")
      .select("order_id, tenant_id")
      .eq("razorpay_order_id", payment.order_id)
      .maybeSingle();

    if (paymentRow) {
      tenantOrderId = paymentRow.order_id;
      tenantId = paymentRow.tenant_id;
    } else {
      console.warn("[Razorpay Webhook] Failed to resolve tenant order ID for razorpay_order_id:", payment.order_id);
      return NextResponse.json({ ok: true, skipped: true });
    }
  }

  // Fallback lookup for tenantId if not in notes
  if (!tenantId && tenantOrderId) {
    const { data: orderRow } = await admin
      .from("orders")
      .select("tenant_id")
      .eq("id", tenantOrderId)
      .maybeSingle();
    tenantId = orderRow?.tenant_id;
  }

  if (!tenantId || !tenantOrderId) {
    console.error("[Razorpay Webhook] Missing context parameters.", { tenantId, tenantOrderId });
    return NextResponse.json({ error: "Missing Context Metadata Parameters" }, { status: 400 });
  }

  // Only process genuine capture events — not just any event that happens to
  // carry a captured payment entity (e.g. payment.authorized, payment.updated).
  if (body.event === "payment.captured") {
    console.log(`[Razorpay Webhook] Processing capture for order ${tenantOrderId} (tenant: ${tenantId})`);
    
    // Call PostgreSQL idempotent capture RPC
    const { data: rpcResult, error: rpcError } = await (admin as any).rpc("execute_idempotent_payment_capture", {
      p_order_id: tenantOrderId,
      p_tenant_id: tenantId,
      p_payment_id: payment.id || "UNKNOWN",
      p_razorpay_order_id: payment.order_id,
      p_amount_paise: payment.amount ?? 0,
      p_raw_event_id: eventId
    });

    if (rpcError) {
      console.error("[Razorpay Webhook] RPC execute_idempotent_payment_capture failed:", rpcError);
      return NextResponse.json({ error: "Lock Conflict / Processing Failure" }, { status: 409 });
    }

    const resObj = (rpcResult ?? {}) as { success?: boolean; updated?: boolean; error?: string };
    if (!resObj.success) {
      console.error("[Razorpay Webhook] RPC capture execution unsuccessful:", resObj.error);
      return NextResponse.json({ error: resObj.error || "Execution failed" }, { status: 409 });
    }

    if (resObj.updated) {
      console.log(`[Razorpay Webhook] Order ${tenantOrderId} successfully updated to PLACED. Emitting events.`);
      
      const { data: updated, error: orderFetchErr } = await admin
        .from("orders")
        .select("id, short_code, status, total_paise, placed_at, ready_at, collected_at, customer_name, order_type, table_label")
        .eq("id", tenantOrderId)
        .single();

      if (orderFetchErr || !updated) {
        console.error("[Razorpay Webhook] Could not fetch updated order for event payload:", orderFetchErr?.message);
        // Still return success — order is placed in DB; realtime will reconcile via 15s poll
        return NextResponse.json({ status: "success" });
      }

      const { data: orderLines } = await admin
        .from("order_items")
        .select("id, order_id, name_snapshot, qty, diet_snapshot")
        .eq("order_id", tenantOrderId);

      type OrderEventInsert = {
        tenant_id: string;
        order_id: string;
        event_type: string;
        payload: Record<string, unknown>;
      };

      await (
        admin.from("order_events") as unknown as {
          insert: (row: OrderEventInsert) => Promise<unknown>;
        }
      ).insert({
        tenant_id: tenantId,
        order_id: tenantOrderId,
        event_type: "status_changed",
        payload: {
          from: "pending_payment",
          to: "placed",
          source: "razorpay_webhook",
          order: updated,
          lines: orderLines || []
        },
      });

      await admin.from("order_status_logs").insert({
        tenant_id: tenantId,
        order_id: tenantOrderId,
        from_status: "pending_payment",
        to_status: "placed",
        note: "Razorpay captured",
      });
    } else {
      console.log(`[Razorpay Webhook] Order ${tenantOrderId} was already settled. Skipping event emission.`);
    }
  } else if (body.event === "payment.failed") {
    console.warn(`[Razorpay Webhook] Payment failed for order ${tenantOrderId}`);
    await admin
      .from("payments")
      .update({ status: "failed" })
      .eq("razorpay_order_id", payment.order_id)
      .eq("tenant_id", tenantId);
  }

  return NextResponse.json({ status: "success" });
}
