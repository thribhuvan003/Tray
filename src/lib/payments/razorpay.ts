import "server-only";
import crypto from "node:crypto";
import { env, featureFlags } from "@/lib/env";

export type CreateOrderInput = {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
  tenantAccountId?: string | null;
};

export type CreatedOrder = {
  id: string;
  amount: number;
  currency: "INR";
  receipt: string;
  status: "created";
  simulated: boolean;
};

/**
 * Creates a Razorpay order. When keys are absent, returns a deterministic
 * simulated order so the rest of the flow (QR display, status polling, OTP
 * issuance on capture) can run end-to-end in dev.
 */
export async function createRazorpayOrder(input: CreateOrderInput): Promise<CreatedOrder> {
  if (!featureFlags.razorpayLive) {
    return {
      id: `order_sim_${crypto.randomBytes(8).toString("hex")}`,
      amount: input.amountPaise,
      currency: "INR",
      receipt: input.receipt,
      status: "created",
      simulated: true,
    };
  }

  const auth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString(
    "base64"
  );
  const bodyPayload: any = {
    amount: input.amountPaise,
    currency: "INR",
    receipt: input.receipt,
    payment_capture: 1, // Auto-capture payments instantly on successful PIN completion
    notes: input.notes,
  };

  if (input.tenantAccountId) {
    bodyPayload.transfers = [
      {
        account: input.tenantAccountId,
        amount: Math.floor(input.amountPaise * 0.98),
        currency: "INR",
        on_hold: false,
      },
    ];
  }

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyPayload),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Razorpay order create failed: ${res.status} ${body}`);
  }
  const data = (await res.json()) as { id: string; amount: number; receipt: string };
  return {
    id: data.id,
    amount: data.amount,
    currency: "INR",
    receipt: data.receipt,
    status: "created",
    simulated: false,
  };
}

/**
 * Verifies a Razorpay webhook signature. Compares HMAC-SHA256 over the raw
 * request body using the configured webhook secret. Constant-time compare.
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.byteLength !== expectedBuf.byteLength) return false;
  return crypto.timingSafeEqual(sigBuf, expectedBuf);
}

/**
 * Polls Razorpay's REST API for the current order status. Used by the
 * "I've paid" manual-verify path and the QStash reconcile cron when a webhook
 * was dropped. In simulator mode (no live keys) we treat sim orders as
 * 'paid' so the manual-verify path mirrors the simulate-capture button.
 */
export async function fetchRazorpayOrderStatus(
  razorpayOrderId: string,
  signal?: AbortSignal
): Promise<"created" | "attempted" | "paid" | "failed" | "unknown"> {
  if (!featureFlags.razorpayLive) {
    return razorpayOrderId.startsWith("order_sim_") ? "paid" : "unknown";
  }
  const auth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString(
    "base64"
  );
  const res = await fetch(`https://api.razorpay.com/v1/orders/${razorpayOrderId}`, {
    method: "GET",
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store",
    signal,
  });
  if (res.status === 404) return "unknown";
  if (!res.ok) {
    // Don't throw — callers treat unknown as "keep waiting" so a transient
    // Razorpay 5xx never accidentally marks an order paid or failed.
    return "unknown";
  }
  const data = (await res.json()) as { status?: string };
  const s = data.status;
  if (s === "paid" || s === "attempted" || s === "created" || s === "failed") return s;
  return "unknown";
}

export function upiQrPayload(opts: { vpa: string; name: string; amountPaise: number; note?: string }) {
  const params = new URLSearchParams({
    pa: opts.vpa,
    pn: opts.name,
    am: (opts.amountPaise / 100).toFixed(2),
    cu: "INR",
  });
  if (opts.note) params.set("tn", opts.note);
  return `upi://pay?${params.toString()}`;
}

/**
 * Initiates a Razorpay refund for a captured payment.
 * Returns the Razorpay refund ID on success.
 * In simulator mode, returns a fake refund ID so the flow works end-to-end.
 */
export async function initiateRazorpayRefund(opts: {
  razorpayPaymentId: string;
  amountPaise: number;
  notes?: Record<string, string>;
}): Promise<{ refundId: string; simulated: boolean } | { error: string }> {
  const { razorpayPaymentId, amountPaise, notes } = opts;

  // Use simulator when live keys are absent or the payment ID itself is simulated.
  if (!featureFlags.razorpayLive || razorpayPaymentId.startsWith("pay_sim_")) {
    return {
      refundId: "rfnd_sim_" + crypto.randomBytes(8).toString("hex"),
      simulated: true,
    };
  }

  const auth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const res = await fetch(`https://api.razorpay.com/v1/payments/${razorpayPaymentId}/refund`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount: amountPaise, notes }),
  });

  if (!res.ok) {
    return { error: `Razorpay refund failed: ${res.status}` };
  }

  const data = (await res.json()) as { id: string };
  return { refundId: data.id, simulated: false };
}

interface OrderPayload {
  amountPaise: number;
  tenantVpa: string | null | undefined;
  tenantMerchantId: string | null | undefined;
  notes: Record<string, string>;
}

export async function createDynamicMarketplaceOrder(input: OrderPayload) {
  // If the transaction can be completed using direct peer-to-peer UPI
  if (input.tenantVpa) {
    return {
      type: "UPI_INTENT" as const,
      qr_payload: `upi://pay?pa=${input.tenantVpa}&pn=${encodeURIComponent(input.notes.tenant_name || "Canteen")}&am=${(input.amountPaise / 100).toFixed(2)}&cu=INR${input.notes.order_id ? `&tr=${input.notes.order_id}` : ""}`,
      id: null,
      simulated: false,
    };
  }

  // Otherwise, route the transaction through your integrated marketplace split logic
  if (!featureFlags.razorpayLive) {
    return {
      type: "SIMULATED" as const,
      id: `order_sim_${crypto.randomBytes(8).toString("hex")}`,
      amount: input.amountPaise,
      currency: "INR",
      receipt: `rcpt_${input.notes.order_id || crypto.randomBytes(4).toString("hex")}`,
      status: "created",
      simulated: true,
    };
  }

  const auth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64");
  
  const orderBody: any = {
    amount: input.amountPaise,
    currency: "INR",
    receipt: `rcpt_${input.notes.order_id}`,
    payment_capture: 1, // Auto-capture payments instantly on successful PIN completion
    notes: input.notes
  };

  if (input.tenantMerchantId) {
    orderBody.transfers = [
      {
        account: input.tenantMerchantId, // Routes cash straight to the specific vendor account
        amount: Math.floor(input.amountPaise * 0.98), // Allocates vendor balance after transaction fees
        currency: "INR",
        on_hold: false
      }
    ];
  }

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderBody),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Razorpay order create failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  return {
    type: "RAZORPAY" as const,
    ...data,
    simulated: false,
  };
}