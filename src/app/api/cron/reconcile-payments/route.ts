import { NextResponse, type NextRequest } from "next/server";
import { Receiver } from "@upstash/qstash";
import { getAdminClient } from "@/lib/supabase/admin";
import { fetchRazorpayOrderStatus } from "@/lib/payments/razorpay";
import { env } from "@/lib/env";
import { initiateRefundForOrder } from "@/app/(student)/_actions";

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
  reconciliation_attempts: number;
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

export async function GET(req: NextRequest) {
  // Support GET in development/testing mode
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  }
  return handleReconciliation();
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const ok = await verifyQstash(req, raw);
  if (!ok) {
    console.warn("[Reconcile Cron] Unauthorised webhook invocation attempt.");
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  return handleReconciliation();
}

async function handleReconciliation() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[Reconcile Cron] Missing service role key configuration.");
    return NextResponse.json({ error: "Service role missing" }, { status: 503 });
  }

  const admin = getAdminClient();
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  // Bounded window: only orders that are pending/expired, placed in the last 30 minutes, and have failed < 5 reconciliation attempts
  const { data: candidates } = await admin
    .from("orders")
    .select("id, tenant_id, status, placed_at, payment_expires_at, reconciliation_attempts")
    .in("status", ["pending_payment", "expired"])
    .gt("placed_at", thirtyMinAgo)
    .lt("reconciliation_attempts", 5)
    .limit(50)
    .returns<(Candidate & { placed_at: string; payment_expires_at: string })[]>();

  if (!candidates || candidates.length === 0) {
    console.log("[Reconcile Cron] No pending or expired payment candidates found.");
    return await runRefundLoop(admin, 0);
  }

  const orderIds = candidates.map((c) => c.id);
  const { data: payments } = await admin
    .from("payments")
    .select("order_id, razorpay_order_id, amount_paise, created_at")
    .in("order_id", orderIds)
    .order("created_at", { ascending: false })
    .returns<PaymentLookup[]>();

  const latestByOrder = new Map<string, PaymentLookup>();
  for (const p of payments ?? []) {
    if (!latestByOrder.has(p.order_id)) latestByOrder.set(p.order_id, p);
  }

  let reconciled = 0;
  const chunkSize = 10;

  for (let i = 0; i < candidates.length; i += chunkSize) {
    const chunk = candidates.slice(i, i + chunkSize);
    
    await Promise.all(
      chunk.map(async (c) => {
        const pay = latestByOrder.get(c.id);
        if (!pay?.razorpay_order_id) {
          return;
        }

        let remoteStatus: "created" | "attempted" | "paid" | "failed" | "unknown" = "unknown";
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        try {
          remoteStatus = await fetchRazorpayOrderStatus(pay.razorpay_order_id, controller.signal);
        } catch (err: any) {
          console.warn(`[Reconcile Cron] Fetch failed or timed out for order ${c.id}:`, err.message);
        } finally {
          clearTimeout(timeoutId);
        }

        if (remoteStatus === "paid") {
          console.log(`[Reconcile Cron] Settling order ${c.id} via execute_idempotent_payment_capture RPC.`);
          const eventId = `cron_reconcile:${pay.razorpay_order_id}:${Date.now()}`;
          
          const { data: rpcResult, error: rpcError } = await (admin as any).rpc("execute_idempotent_payment_capture", {
            p_order_id: c.id,
            p_tenant_id: c.tenant_id,
            p_payment_id: "CRON_RECONCILED",
            p_razorpay_order_id: pay.razorpay_order_id,
            p_amount_paise: pay.amount_paise,
            p_raw_event_id: eventId
          });

          if (rpcError) {
            console.error(`[Reconcile Cron] RPC execution failed for order ${c.id}:`, rpcError);
            return;
          }

          const resObj = (rpcResult ?? {}) as { success?: boolean; updated?: boolean; error?: string };
          if (resObj.success && resObj.updated) {
            const { data: updated } = await admin
              .from("orders")
              .select("id, short_code, status, total_paise, placed_at, ready_at, collected_at, customer_name, order_type, table_label")
              .eq("id", c.id)
              .single();

            const { data: orderLines } = await admin
              .from("order_items")
              .select("id, order_id, name_snapshot, qty, diet_snapshot")
              .eq("order_id", c.id);

            await (
              admin.from("order_events") as unknown as {
                insert: (row: OrderEventInsert) => Promise<unknown>;
              }
            ).insert({
              tenant_id: c.tenant_id,
              order_id: c.id,
              event_type: "status_changed",
              payload: {
                from: c.status,
                to: "placed",
                source: "reconcile_cron",
                order: updated,
                lines: orderLines || []
              },
            });

            await admin.from("order_status_logs").insert({
              tenant_id: c.tenant_id,
              order_id: c.id,
              from_status: c.status,
              to_status: "placed",
              note: "Reconciled (QStash Razorpay poll)",
            });

            reconciled += 1;
            console.log(`[Reconcile Cron] Order ${c.id} successfully reconciled to PLACED.`);
          }
        } else {
          // Increment reconciliation attempts
          const nextAttempts = (c.reconciliation_attempts || 0) + 1;
          console.log(`[Reconcile Cron] Order ${c.id} status is unpaid (${remoteStatus}). Incrementing attempts to ${nextAttempts}.`);
          
          await (admin.from("orders") as any)
            .update({ reconciliation_attempts: nextAttempts } as any)
            .eq("id", c.id);

          if (nextAttempts >= 5) {
            console.error(`[Reconcile Cron] Order ${c.id} exceeded reconciliation limits. Marking for review.`);
            
            await admin.from("audit_logs").insert({
              tenant_id: c.tenant_id,
              action: "payment.reconciliation_failed_limit",
              target_type: "order",
              target_id: c.id,
              meta: {
                razorpay_order_id: pay.razorpay_order_id,
                attempts: nextAttempts,
                reason: "Exceeded 5 reconciliation attempts without capturing payment."
              }
            });
          }
        }
      })
    );
  }

  return await runRefundLoop(admin, reconciled);
}

async function runRefundLoop(admin: any, reconciled: number) {
  type CancelledOrder = { id: string; tenant_id: string };
  type RefundCandidate = { order_id: string; tenant_id: string };

  const { data: cancelledOrders } = (await admin
    .from("orders")
    .select("id, tenant_id")
    .in("status", ["cancelled_by_kitchen", "rejected"])
    .limit(20)) as { data: CancelledOrder[] | null };

  let refunded = 0;
  if (cancelledOrders && cancelledOrders.length > 0) {
    const cancelledIds = cancelledOrders.map((o: any) => o.id);

    const { data: capturedPayments } = (await admin
      .from("payments")
      .select("order_id, tenant_id")
      .in("order_id", cancelledIds)
      .eq("status", "captured")) as { data: RefundCandidate[] | null };

    const refundChunkSize = 5;
    const paymentsToRefund = capturedPayments ?? [];

    for (let i = 0; i < paymentsToRefund.length; i += refundChunkSize) {
      const chunk = paymentsToRefund.slice(i, i + refundChunkSize);
      
      await Promise.all(
        chunk.map(async (pay: any) => {
          try {
            console.log(`[Reconcile Cron] Initiating batch refund for order ${pay.order_id}`);
            const result = await initiateRefundForOrder(pay.order_id, pay.tenant_id);
            if (result.ok) {
              refunded += 1;
            } else {
              console.warn(`[Reconcile Cron] Refund failed for order ${pay.order_id}:`, result.error);
            }
          } catch (err: any) {
            console.error(`[Reconcile Cron] Error in batch refund for order ${pay.order_id}:`, err);
          }
        })
      );
    }
  }

  return NextResponse.json({ ok: true, reconciled, refunded });
}
