import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { getAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { logger, withRequestContext } from "@/lib/logging";
import { rateLimit } from "@/lib/rate-limit";

type RazorpayEvent = {
  event: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        status?: string;
        amount?: number;
        notes?: Record<string, string>;
      };
    };
  };
  created_at?: number;
};

export async function POST(req: NextRequest) {
  const start = Date.now();

  // Basic defense-in-depth rate limiting on the money webhook (per SRE recommendation).
  // Uses the existing rateLimit helper. Per-IP or global burst protection.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = await rateLimit(`webhook:razorpay:${ip}`, { limit: 120, windowMs: 60_000 });
  if (!rl.success) {
    logger.warn("razorpay webhook rate limited", { ip });
    return NextResponse.json({ ok: true }, { status: 200 }); // still ack to provider
  }

  if (!env.RAZORPAY_WEBHOOK_SECRET || !env.SUPABASE_SERVICE_ROLE_KEY) {
    logger.error("webhook misconfigured", null, { latency_ms: Date.now() - start });
    return NextResponse.json({ ok: false, error: "Not configured" }, { status: 503 });
  }

  const sig = req.headers.get("x-razorpay-signature");
  if (!sig) {
    logger.warn("webhook missing signature");
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const raw = await req.text();

  if (!verifyWebhookSignature(raw, sig)) {
    logger.error("webhook invalid signature", null, { latency_ms: Date.now() - start });
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
  }

  let body: RazorpayEvent;
  try {
    body = JSON.parse(raw) as RazorpayEvent;
  } catch {
    logger.error("webhook bad JSON", null, { latency_ms: Date.now() - start });
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  const payment = body.payload?.payment?.entity;
  if (!payment?.order_id) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const tenantSlug = payment.notes?.tenant;
  const tenantOrderId = payment.notes?.order;

  if (!tenantSlug || !tenantOrderId) {
    logger.warn("webhook payment missing tenant/order notes", {
      event: body.event,
      razorpay_payment_id: payment.id,
      latency_ms: Date.now() - start,
    });
    return NextResponse.json({ ok: true, skipped: true });
  }

  const log = logger.withContext({
    tenant_slug: tenantSlug,
    order_id: tenantOrderId,
    razorpay_order_id: payment.order_id,
    razorpay_payment_id: payment.id,
    event: body.event,
  });

  log.info("razorpay webhook received");

  const admin = getAdminClient();
  const eventId = `${body.event}:${payment.id ?? "x"}:${body.created_at ?? Date.now()}`;

  const { data: orderRow } = await admin
    .from("orders")
    .select("id, tenant_id, status")
    .eq("id", tenantOrderId)
    .maybeSingle<{ id: string; tenant_id: string; status: string }>();

  if (!orderRow) {
    // Webhook arrived before the order row was visible (race with placeOrder).
    // This is a real scenario in the checklist. We DLQ it for visibility and let
    // the existing reconcile cron (with the same guards) catch it later.
    try {
      await admin.from("webhook_dlq" as any).insert({
        tenant_id: null,
        razorpay_event: body.event,
        razorpay_payment_id: payment.id,
        razorpay_order_id: payment.order_id,
        payload: body as any,
        error_message: "Order row not found at webhook processing time",
      });
    } catch (dlqErr) {
      logger.error("CRITICAL: failed to write to webhook_dlq", dlqErr);
    }
    log.warn("webhook order not found — queued to DLQ (reconcile safety net active)");
    return NextResponse.json({ ok: true, skipped: true });
  }

  const adminScoped = getAdminClient(orderRow.tenant_id);
  const tenantLog = log.withContext({ tenant_id: orderRow.tenant_id, order_id: orderRow.id });

  try {
    if (body.event === "payment.captured" || body.event === "payment.authorized" || payment.status === "captured") {
      // Use the DB-level row-locked capture function (FOR UPDATE) to guarantee atomicity
      // even under thundering-herd webhook retries and concurrent reconcile runs.
      const { data: captureResult, error: captureErr } = await (adminScoped as unknown as {
        rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: string | null; error: unknown }>;
      }).rpc("safe_capture_payment", {
        p_order_id: orderRow.id,
        p_tenant_id: orderRow.tenant_id,
        p_razorpay_pid: payment.id ?? null,
        p_razorpay_oid: payment.order_id,
        p_amount_paise: payment.amount ?? 0,
        p_raw_event_id: eventId,
      });

      if (captureErr) {
        tenantLog.error("safe_capture_payment rpc failed", captureErr);
        throw captureErr;
      }

      if (captureResult === "amount_mismatch") {
        // Priority 2: Paid amount < order total. Log and DLQ for manual review.
        // Never flip the order to 'placed' on an underpayment.
        tenantLog.error("AMOUNT MISMATCH — webhook capture rejected", null, {
          razorpay_amount: payment.amount,
          order_id: orderRow.id,
          latency_ms: Date.now() - start,
        });
        await admin.from("webhook_dlq" as any).insert({
          tenant_id: orderRow.tenant_id,
          razorpay_event: body.event,
          razorpay_payment_id: payment.id,
          razorpay_order_id: payment.order_id,
          payload: body as any,
          error_message: `Amount mismatch: received ${payment.amount} paise`,
        });
      } else if (captureResult === "captured") {
        tenantLog.info("order transitioned via webhook (row-locked capture)", { result: captureResult, latency_ms: Date.now() - start });
      } else {
        tenantLog.info("webhook capture no-op", { result: captureResult });
      }
    } else if (body.event === "payment.failed") {
      const { data: failResult, error: failErr } = await (adminScoped as unknown as {
        rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: string | null; error: unknown }>;
      }).rpc("safe_fail_payment", {
        p_order_id:     orderRow.id,
        p_tenant_id:    orderRow.tenant_id,
        p_razorpay_oid: payment.order_id,
      });

      if (failErr) {
        tenantLog.error("safe_fail_payment rpc failed", failErr);
        throw failErr;
      }

      if (failResult === "failed") {
        tenantLog.info("order transitioned to payment_failed via webhook (atomic)", { latency_ms: Date.now() - start });
      } else {
        tenantLog.info("payment.failed no-op (guard or prior path won the race)", { result: failResult });
      }
    }

    tenantLog.info("webhook processed successfully", { latency_ms: Date.now() - start });
    return NextResponse.json({ ok: true });
  } catch (err) {
    // Any transient error after signature verification → DLQ + ack to Razorpay.
    // This prevents infinite retries while giving us full forensics.
    tenantLog.error("webhook processing error — DLQ entry created", err);
    try {
      await admin.from("webhook_dlq" as any).insert({
        tenant_id: orderRow.tenant_id,
        razorpay_event: body.event,
        razorpay_payment_id: payment.id,
        razorpay_order_id: payment.order_id,
        payload: body as any,
        error_message: err instanceof Error ? err.message : String(err),
        error_stack: err instanceof Error ? err.stack : undefined,
      });
    } catch (dlqErr) {
      logger.error("CRITICAL: DLQ write also failed", dlqErr);
    }
    return NextResponse.json({ ok: true, dlq: true });
  }
}
