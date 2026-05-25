import { NextResponse, type NextRequest } from "next/server";
import { Receiver } from "@upstash/qstash";
import { getAdminClient } from "@/lib/supabase/admin";
import { fetchRazorpayOrderStatus } from "@/lib/payments/razorpay";
import { env } from "@/lib/env";
import { initiateRefundForOrder } from "@/app/(student)/_actions";

// Belt-and-braces for the webhook: India sees ~2-3% Razorpay webhook drops
// (NAT churn, ISP filtering, our own cold starts). QStash hits this every
// minute and re-polls Razorpay for any order still stuck on pending_payment
// inside its viable window. All updates flow through the same idempotent
// gated upsert used by verifyPaymentNow and the webhook, so a triple-arrival
// (webhook + student tap + cron) cannot double-place anything.
async function verifyQstash(req: NextRequest, raw: string): Promise<boolean> {
  if (!env.QSTASH_CURRENT_SIGNING_KEY || !env.QSTASH_NEXT_SIGNING_KEY) return false;
  const signature = req.headers.get("upstash-signature");
  if (!signature) return false;
  const receiver = new Receiver({
    currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY,
    nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY,
  });
  try {
    return await receiver.verify({ signature, body: raw, url: req.url });
  } catch {
    return false;
  }
}

type Candidate = {
  id: string;
  tenant_id: string;
  status: "pending_payment" | "expired";
};

type PaymentLookup = {
  order_id: string;
  razorpay_order_id: string | null;
  amount_paise: number;
  created_at: string;
};

type OrderEventInsert = {
  tenant_id: string;
  order_id: string;
  event_type: string;
  payload: Record<string, unknown>;
};

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const ok = await verifyQstash(req, raw);
  if (!ok) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Service role missing" }, { status: 503 });
  }

  const admin = getAdminClient();
  const nowIso = new Date().toISOString();
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  // Bounded window: only orders that are still inside their payment window
  // AND were placed within the last 30 minutes. Anything older is either
  // already expired by the other cron or beyond the point of Razorpay's
  // useful state.
  const { data: candidates } = await admin
    .from("orders")
    .select("id, tenant_id, status, placed_at, payment_expires_at")
    .in("status", ["pending_payment", "expired"])
    .gt("placed_at", thirtyMinAgo)
    .limit(200)
    .returns<(Candidate & { placed_at: string; payment_expires_at: string })[]>();

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ ok: true, reconciled: 0 });
  }

  const orderIds = candidates.map((c) => c.id);
  const { data: payments } = await admin
    .from("payments")
    .select("order_id, razorpay_order_id, amount_paise, created_at")
    .in("order_id", orderIds)
    .order("created_at", { ascending: false })
    .returns<PaymentLookup[]>();

  // Most-recent payment row per order — the one carrying the razorpay_order_id
  // we originally handed to the student's QR.
  const latestByOrder = new Map<string, PaymentLookup>();
  for (const p of payments ?? []) {
    if (!latestByOrder.has(p.order_id)) latestByOrder.set(p.order_id, p);
  }

  let reconciled = 0;

  // Batch processing to avoid Vercel timeouts (N+1 HTTP calls)
  const chunkSize = 10;
  for (let i = 0; i < candidates.length; i += chunkSize) {
    const chunk = candidates.slice(i, i + chunkSize);
    
    await Promise.all(chunk.map(async (c) => {
      const pay = latestByOrder.get(c.id);
      if (!pay?.razorpay_order_id) return;
      let remote: Awaited<ReturnType<typeof fetchRazorpayOrderStatus>>;
      try {
        remote = await fetchRazorpayOrderStatus(pay.razorpay_order_id);
      } catch {
        // Razorpay flaked — leave for next minute's run.
        return;
      }
      if (remote !== "paid") return;

      // Idempotent payments row — same shape and key as verifyPaymentNow so a
      // reconcile + manual-verify race resolves to a single row.
      await admin.from("payments").upsert(
        {
          tenant_id: c.tenant_id,
          order_id: c.id,
          razorpay_order_id: pay.razorpay_order_id,
          amount_paise: pay.amount_paise,
          status: "captured",
          raw_event_id: `manual_verify_${pay.razorpay_order_id}`,
        },
        { onConflict: "raw_event_id", ignoreDuplicates: true }
      );

      const { data: updated } = await admin
        .from("orders")
        .update({ status: "placed" })
        .eq("id", c.id)
        .eq("tenant_id", c.tenant_id)
        .in("status", ["pending_payment", "expired"])
        .select("id");

      if (updated && updated.length > 0) {
        await (
          admin.from("order_events") as unknown as {
            insert: (row: OrderEventInsert) => Promise<unknown>;
          }
        ).insert({
          tenant_id: c.tenant_id,
          order_id: c.id,
          event_type: "status_changed",
          payload: { from: c.status, to: "placed", source: "reconcile_cron" },
        });
        await admin.from("order_status_logs").insert({
          tenant_id: c.tenant_id,
          order_id: c.id,
          from_status: c.status,
          to_status: "placed",
          note: "Reconciled (QStash Razorpay poll)",
        });
        reconciled += 1;
      }
    }));
  }

  // ── Refund loop ────────────────────────────────────────────────────────────
  // Find orders stuck in cancelled_by_kitchen that still have a captured
  // payment (i.e. the best-effort refund call in cancelOrderByStudent either
  // never ran or failed transiently). Cap at 20 per cron run.

  type CancelledOrder = { id: string; tenant_id: string };
  type RefundCandidate = { order_id: string; tenant_id: string };

  const { data: cancelledOrders } = await admin
    .from("orders")
    .select("id, tenant_id")
    .in("status", ["cancelled_by_kitchen", "rejected"]) // Include "rejected" to prevent cron state mismatch
    .limit(20)
    .returns<CancelledOrder[]>();

  let refunded = 0;
  if (cancelledOrders && cancelledOrders.length > 0) {
    const cancelledIds = cancelledOrders.map((o) => o.id);

    // Find which of those have a still-captured payment (not yet refunded).
    const { data: capturedPayments } = await admin
      .from("payments")
      .select("order_id, tenant_id")
      .in("order_id", cancelledIds)
      .eq("status", "captured")
      .returns<RefundCandidate[]>();

    for (const pay of capturedPayments ?? []) {
      try {
        const result = await initiateRefundForOrder(pay.order_id, pay.tenant_id);
        if (result.ok) refunded += 1;
      } catch {
        // Transient failure — leave for next cron run.
      }
    }
  }

  return NextResponse.json({ ok: true, reconciled, refunded });
}
