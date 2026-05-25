"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import dayjs from "dayjs";
import { resolveTenant, getTenantSlugFromHeaders } from "@/lib/tenant";
import { getServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/get-user";
import { rateLimit } from "@/lib/rate-limit";
import { createRazorpayOrder, initiateRazorpayRefund, createDynamicMarketplaceOrder } from "@/lib/payments/razorpay";
import type { Diet, OrderType } from "@/lib/db/types";

// ── Student-initiated cancel (Phase 8) ─────────────────────────────────
// Lives at the TOP of this file so a parallel Phase 6 edit appending new
// actions at the bottom does not collide on the same line range.
// Refund itself is handled out-of-band by the reconciliation cron / admin —
// we just flip status and emit an append-only event for Realtime listeners.

type CancelResult = { ok: true } | { ok: false; error: string };

export async function cancelOrderByStudent(orderId: string): Promise<CancelResult> {
  const h = await headers();
  const slug = getTenantSlugFromHeaders(h);
  const tenant = await resolveTenant(slug);
  if (!tenant) return { ok: false, error: "Tenant not found" };

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in to cancel" };

  const rl = await rateLimit(`cancelOrder:${user.id}`, { limit: 5, windowMs: 60_000 });
  if (!rl.success) return { ok: false, error: "Too many cancel attempts — slow down" };

  const admin = getAdminClient(tenant.id);

  // Re-check ownership, status, and the 5-minute window on the server.
  // Never trust the client clock — derive elapsed from placed_at server-side.
  const { data: order, error: loadErr } = await admin
    .from("orders")
    .select("id, user_id, status, placed_at, total_paise")
    .eq("id", orderId)
    .eq("tenant_id", tenant.id)
    .maybeSingle<{
      id: string;
      user_id: string | null;
      status: string;
      placed_at: string;
      total_paise: number;
    }>();
  if (loadErr || !order) return { ok: false, error: "Order not found" };
  if (order.user_id !== user.id) return { ok: false, error: "Not your order" };
  if (order.status !== "placed") {
    return { ok: false, error: "Too late — kitchen has already started." };
  }
  const elapsedMs = Date.now() - new Date(order.placed_at).getTime();
  if (elapsedMs >= 5 * 60 * 1000) {
    return { ok: false, error: "Cancel window has closed (5 minutes)." };
  }

  // We reuse cancelled_by_kitchen because the downstream effects (release
  // stock, notify kitchen UI, queue refund) are identical regardless of who
  // pulled the cord. The event_type below preserves the actual actor.
  const upd = await admin
    .from("orders")
    // Cast — Database types haven't been regenerated for the new enum values
    // yet (migration 0009a). Safe at runtime: the enum value exists in PG.
    .update({ status: "cancelled_by_kitchen" as unknown as "rejected" })
    .eq("id", orderId)
    .eq("tenant_id", tenant.id)
    .eq("status", "placed"); // optimistic guard against concurrent updates
  if (upd.error) return { ok: false, error: upd.error.message };

  await admin.from("order_status_logs").insert({
    tenant_id: tenant.id,
    order_id: orderId,
    from_status: "placed",
    // Same cast reason as above.
    to_status: "cancelled_by_kitchen" as unknown as "rejected",
    actor_user_id: user.id,
    note: "Cancelled by student within 5-minute grace window",
  });

  // Append-only event row — Realtime listeners subscribe to this.
  // order_events isn't in the regenerated Database types yet, so go untyped.
  await (
    admin as unknown as {
      from: (t: string) => {
        insert: (row: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
      };
    }
  )
    .from("order_events")
    .insert({
      tenant_id: tenant.id,
      order_id: orderId,
      event_type: "cancelled_by_student",
      payload: {
        actor_user_id: user.id,
        elapsed_ms: elapsedMs,
        total_paise: order.total_paise,
      },
    });

  await admin.from("audit_logs").insert({
    tenant_id: tenant.id,
    actor_user_id: user.id,
    action: "order.cancelled_by_student",
    target_type: "order",
    target_id: orderId,
    meta: { elapsed_ms: elapsedMs },
  });

  // Best-effort refund — don't block the cancellation on refund success.
  void initiateRefundForOrder(orderId, tenant.id).catch(() => {});

  revalidatePath(`/c/${tenant.slug}/track/${orderId}`);
  revalidatePath(`/c/${tenant.slug}/orders`);
  return { ok: true };
}

type PlaceArgs = { menuItemId: string; qty: number }[];

type PlaceResult =
  | { ok: true; orderId: string; razorpayOrderId: string | null; simulated: boolean }
  | { ok: false; error: string; code?: "AUTH_REQUIRED" | "EMPTY" | "RATE_LIMITED" | "OUT_OF_STOCK" };

type MenuRow = {
  id: string;
  name: string;
  price_paise: number;
  diet: Diet;
  status: "draft" | "live" | "archived";
  in_stock: boolean;
  stock_qty: number | null;
};

export async function placeOrder(
  lines: PlaceArgs,
  note: string,
  orderType: OrderType = "takeaway",
  tableLabel: string | null = null
): Promise<PlaceResult> {
  try {
    if (!lines || lines.length === 0) return { ok: false, error: "Cart is empty", code: "EMPTY" };

  const h = await headers();
  const slug = getTenantSlugFromHeaders(h);
  const tenant = await resolveTenant(slug);
  if (!tenant) return { ok: false, error: "Tenant not found" };

  const user = await getCurrentUser();
  // Auth check is deferred below (after reading guest_orders_enabled from DB)

  const rl = user
    ? await rateLimit(`placeOrder:${user.id}`, { limit: 5, windowMs: 60_000 })
    : { success: true };
  if (!rl.success) return { ok: false, error: "Too many orders — slow down a moment", code: "RATE_LIMITED" };

  const supabase = await getServerClient(tenant.id);

  // Verify canteen is accepting orders + check guest_orders_enabled
  const { data: tenantStatus } = await supabase
    .from("tenants")
    .select("is_open, paused_until, guest_orders_enabled, razorpay_account_id")
    .eq("id", tenant.id)
    .maybeSingle<{ is_open: boolean; paused_until: string | null; guest_orders_enabled: boolean; razorpay_account_id: string | null }>();

  if (tenantStatus) {
    const isPaused = tenantStatus.paused_until && new Date(tenantStatus.paused_until) > new Date();
    if (!tenantStatus.is_open || isPaused) {
      return { ok: false, error: isPaused ? "Orders are paused — please try again shortly" : "This canteen is currently closed" };
    }
  }

  // Require auth unless the canteen has guest orders enabled
  if (!user && !tenantStatus?.guest_orders_enabled) {
    return { ok: false, error: "Sign in to place an order", code: "AUTH_REQUIRED" };
  }

  const ids = lines.map((l) => l.menuItemId);
  const { data: itemsRaw, error: itemsErr } = await supabase
    .from("menu_items")
    .select("id, name, price_paise, diet, status, in_stock, stock_qty")
    .in("id", ids)
    .returns<MenuRow[]>();
  if (itemsErr || !itemsRaw) return { ok: false, error: "Could not load menu" };

  const map = new Map<string, MenuRow>(itemsRaw.map((i) => [i.id, i]));
  let total = 0;
  const validated: { item: MenuRow; qty: number }[] = [];
  for (const l of lines) {
    const it = map.get(l.menuItemId);
    if (!it) return { ok: false, error: "An item in your cart is no longer available", code: "OUT_OF_STOCK" };
    if (it.status !== "live" || !it.in_stock) {
      return { ok: false, error: `${it.name} just went out of stock`, code: "OUT_OF_STOCK" };
    }
    if (it.stock_qty !== null && it.stock_qty < l.qty) {
      return { ok: false, error: `Only ${it.stock_qty} ${it.name} left`, code: "OUT_OF_STOCK" };
    }
    if (l.qty <= 0 || l.qty > 20) return { ok: false, error: "Bad quantity" };
    total += it.price_paise * l.qty;
    validated.push({ item: it, qty: l.qty });
  }

  const admin = getAdminClient(tenant.id);
  const { data: codeData, error: codeErr } = await admin.rpc("next_order_short_code", {
    p_tenant: tenant.id,
  });
  // Use RPC result or fall back to a random 4-digit code so orders always work
  const shortCode = (!codeErr && codeData != null)
    ? String(codeData)
    : String(Math.floor(1000 + Math.random() * 9000));

  const orderInsert = await admin
    .from("orders")
    .insert({
      tenant_id: tenant.id,
      user_id: user?.id ?? null,
      short_code: shortCode,
      status: "pending_payment",
      total_paise: total,
      order_type: orderType,
      table_label: tableLabel,
      customer_name: user?.displayName ?? user?.email ?? "Guest",
      notes: note ? note.slice(0, 120) : null,
      payment_expires_at: dayjs().add(15, "minute").toISOString(),
    })
    .select("id, short_code")
    .single<{ id: string; short_code: string }>();
  if (orderInsert.error || !orderInsert.data) {
    return { ok: false, error: orderInsert.error?.message ?? "Could not create order" };
  }
  const order = orderInsert.data;

  await admin.from("order_items").insert(
    validated.map((v) => ({
      tenant_id: tenant.id,
      order_id: order.id,
      menu_item_id: v.item.id,
      name_snapshot: v.item.name,
      price_paise_snapshot: v.item.price_paise,
      diet_snapshot: v.item.diet,
      qty: v.qty,
    }))
  );

  await admin.from("order_status_logs").insert({
    tenant_id: tenant.id,
    order_id: order.id,
    from_status: null,
    to_status: "pending_payment",
    actor_user_id: user?.id ?? null,
    note: "Order placed",
  });
  await admin.from("audit_logs").insert({
    tenant_id: tenant.id,
    actor_user_id: user?.id ?? null,
    action: "order.placed",
    target_type: "order",
    target_id: order.id,
    meta: { total_paise: total, items: validated.length, order_type: orderType },
  });

  const rzp = await createDynamicMarketplaceOrder({
    amountPaise: total,
    tenantVpa: tenant.upi_vpa,
    tenantMerchantId: tenantStatus?.razorpay_account_id,
    notes: {
      tenant: tenant.slug,
      order_id: order.id,
      tenant_name: tenant.name,
    },
  });

  const isSim = rzp.type === "SIMULATED" || (rzp as any).simulated;
  const payOrderId = (rzp.type === "RAZORPAY" || rzp.type === "SIMULATED") ? (rzp as any).id : null;

  await admin.from("payments").insert({
    tenant_id: tenant.id,
    order_id: order.id,
    razorpay_order_id: payOrderId,
    amount_paise: total,
    status: "initiated",
  });

  revalidatePath(`/c/${tenant.slug}/menu`);
  return { ok: true, orderId: order.id, razorpayOrderId: payOrderId, simulated: !!isSim };
  } catch (error: any) {
    console.error("SERVER ACTION PLACE_ORDER ERROR:", error);
    return { ok: false, error: error?.message ?? "An unexpected error occurred" };
  }
}

export async function simulatePaymentCapture(orderId: string): Promise<{ ok: boolean; error?: string }> {
  // Hard gate: never simulate captures once real Razorpay keys are present,
  // unless NEXT_PUBLIC_RAZORPAY_LIVE is explicitly set to "false" (allowing simulator testing).
  const { featureFlags } = await import("@/lib/env");
  const isLive = featureFlags.razorpayLive && process.env.NEXT_PUBLIC_RAZORPAY_LIVE !== "false";
  if (isLive) {
    return { ok: false, error: "Simulator disabled in live mode" };
  }
  const h = await headers();
  const slug = getTenantSlugFromHeaders(h);
  const tenant = await resolveTenant(slug);
  if (!tenant) return { ok: false, error: "Tenant missing" };

  const user = await getCurrentUser().catch(() => null);

  const admin = getAdminClient(tenant.id);
  const { data: order } = await admin
    .from("orders")
    .select("id, user_id, status, total_paise")
    .eq("id", orderId)
    .eq("tenant_id", tenant.id)
    .maybeSingle<{ id: string; user_id: string | null; status: string; total_paise: number }>();
  if (!order) return { ok: false, error: "Order not found" };

  if (order.user_id) {
    if (!user || order.user_id !== user.id) {
      return { ok: false, error: "Order not found" };
    }
  }
  if (order.status !== "pending_payment") return { ok: true };

  // Use the same idempotent RPC as the real webhook — prevents double-placement on concurrent calls
  const { data: rpcResult, error: rpcError } = await (admin as any).rpc("execute_idempotent_payment_capture", {
    p_order_id: orderId,
    p_tenant_id: tenant.id,
    p_payment_id: `pay_sim_${orderId.slice(0, 8)}`,
    p_razorpay_order_id: null,
    p_amount_paise: order.total_paise ?? 0,
    p_raw_event_id: `sim_capture_${orderId}`,
  });

  if (rpcError) {
    console.error("[simulatePaymentCapture] RPC failed:", rpcError);
    return { ok: false, error: "Simulation RPC failed" };
  }

  const resObj = rpcResult as { success?: boolean; updated?: boolean; error?: string };
  if (!resObj.success) {
    // Already settled — idempotent
    return { ok: true };
  }

  if (resObj.updated) {
    const { data: updatedOrder } = await admin.from("orders").select("id, short_code, status, total_paise, placed_at, ready_at, collected_at, customer_name, order_type, table_label").eq("id", orderId).single();
    const { data: orderLines } = await admin.from("order_items").select("id, order_id, name_snapshot, qty, diet_snapshot").eq("order_id", orderId);

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
      tenant_id: tenant.id,
      order_id: orderId,
      event_type: "status_changed",
      payload: { from: "pending_payment", to: "placed", source: "simulator", order: updatedOrder, lines: orderLines },
    });

    await admin.from("order_status_logs").insert({
      tenant_id: tenant.id,
      order_id: orderId,
      from_status: "pending_payment",
      to_status: "placed",
      actor_user_id: user?.id ?? null,
      note: "Simulated payment capture",
    });
  }

  return { ok: true };
}

export async function getMyOrderOtp(orderId: string): Promise<{ otp: string | null }> {
  const h = await headers();
  const slug = getTenantSlugFromHeaders(h);
  const tenant = await resolveTenant(slug);
  if (!tenant) return { otp: null };

  const admin = getAdminClient(tenant.id);

  // 1. Fetch order details to enforce status & ownership controls server-side
  const { data: order } = await admin
    .from("orders")
    .select("user_id, status")
    .eq("id", orderId)
    .maybeSingle<{ user_id: string | null; status: string }>();

  if (!order || order.status !== "ready") {
    return { otp: null };
  }

  const user = await getCurrentUser().catch(() => null);

  // 2. If registered order, visitor must be the owning user
  if (order.user_id) {
    if (!user || user.id !== order.user_id) {
      return { otp: null };
    }
  }

  // 3. Since authorization checks passed, fetch plaintext OTP directly from pickup_secrets
  const { data: secret } = await admin
    .from("pickup_secrets")
    .select("otp_plain, expires_at")
    .eq("order_id", orderId)
    .maybeSingle<{ otp_plain: string; expires_at: string }>();

  if (!secret) return { otp: null };
  if (new Date(secret.expires_at) <= new Date()) return { otp: null };

  return { otp: secret.otp_plain };
}

type VerifyResult = { status: "paid" | "pending" | "failed" };

/**
 * "I've paid" handler. In UPI-direct mode (no live Razorpay keys) we trust the
 * student's tap immediately — money went straight to the canteen's bank account
 * and there is nothing to verify on our side. In live mode we poll Razorpay's
 * REST API as a webhook-drop fallback. Idempotent — repeated calls cannot
 * double-place an order because the order update is gated on status =
 * 'pending_payment' and the payments insert is gated on a unique
 * raw_event_id ('manual_verify_<razorpay_order_id>').
 */
export async function verifyPaymentNow(orderId: string): Promise<VerifyResult> {
  const { featureFlags } = await import("@/lib/env");

  const user = await getCurrentUser().catch(() => null);

  const globalAdmin = getAdminClient();
  const { data: orderRow } = await globalAdmin
    .from("orders")
    .select("id, tenant_id, user_id, status, payment_expires_at")
    .eq("id", orderId)
    .maybeSingle<{ id: string; tenant_id: string; user_id: string | null; status: string; payment_expires_at: string | null }>();
  if (!orderRow) return { status: "pending" };

  if (orderRow.user_id) {
    if (!user || orderRow.user_id !== user.id) {
      return { status: "pending" };
    }
  }

  // Terminal states: order is already done (not pending payment)
  if (![
    "pending_payment",
    "expired",
  ].includes(orderRow.status)) {
    // Map terminal failure/cancellation states to "failed" so the student isn't
    // shown a success message for a cancelled or rejected order.
    const paidStates = ["placed", "preparing", "ready", "collected"];
    return { status: paidStates.includes(orderRow.status) ? "paid" : "failed" };
  }

  const admin = getAdminClient(orderRow.tenant_id);
  const { data: payRow } = await admin
    .from("payments")
    .select("razorpay_order_id, amount_paise")
    .eq("order_id", orderId)
    .eq("tenant_id", orderRow.tenant_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ razorpay_order_id: string | null; amount_paise: number }>();

  // ── UPI-direct mode: trust the student's tap immediately ─────────────────────
  // Money already went directly to the canteen's bank account via UPI. We have no
  // Razorpay payment to verify. Mark placed, insert a captured payment record,
  // emit the order event, and let the kitchen board pick it up.
  const isLive = featureFlags.razorpayLive && process.env.NEXT_PUBLIC_RAZORPAY_LIVE !== "false";
  const isUpiIntent = !payRow?.razorpay_order_id;

  if (!isLive || isUpiIntent) {
    // Server-side expiry check for UPI-direct mode
    if (orderRow.payment_expires_at && new Date(orderRow.payment_expires_at) < new Date()) {
      return { status: "failed" };
    }

    // Fetch tenant's UPI VPA so we can record WHICH account received the money
    // This is critical for admin reconciliation (trust-but-verify audit trail)
    const globalAdminForTenant = getAdminClient();
    const { data: tenantRow } = await globalAdminForTenant
      .from("tenants")
      .select("upi_vpa, name")
      .eq("id", orderRow.tenant_id)
      .maybeSingle<{ upi_vpa: string | null; name: string }>();
    const tenantUpiVpa = tenantRow?.upi_vpa ?? null;

    // Also fetch order amount from order row directly (don't rely on payRow which may have 0)
    const { data: orderAmount } = await admin
      .from("orders")
      .select("total_paise, customer_name, short_code")
      .eq("id", orderId)
      .maybeSingle<{ total_paise: number; customer_name: string | null; short_code: string }>();
    const amountPaise = orderAmount?.total_paise ?? payRow?.amount_paise ?? 0;

    const { data: rpcResult, error: rpcError } = await (admin as any).rpc("execute_idempotent_payment_capture", {
      p_order_id: orderId,
      p_tenant_id: orderRow.tenant_id,
      p_payment_id: `pay_upi_${orderId.slice(0, 8)}`,
      p_razorpay_order_id: payRow?.razorpay_order_id ?? null,
      p_amount_paise: amountPaise,
      p_raw_event_id: `upi_trust_${orderId}`
    });

    if (rpcError) {
      console.error("[verifyPaymentNow] UPI RPC call failed:", rpcError);
      return { status: "pending" };
    }

    const resObj = rpcResult as { success?: boolean; updated?: boolean; error?: string };
    if (!resObj.success) {
      console.error("[verifyPaymentNow] UPI RPC execution unsuccessful:", resObj.error);
      return { status: "pending" };
    }

    if (resObj.updated) {
      // ── Record UPI VPA in payments row for admin visibility ────────────────
      if (tenantUpiVpa) {
        await admin
          .from("payments")
          .update({ upi_vpa: tenantUpiVpa } as any)
          .eq("order_id", orderId)
          .eq("tenant_id", orderRow.tenant_id);
      }

      // ── UPI payment audit log — gives admin full reconciliation trail ───────
      // Admin can see: order ID, amount, UPI VPA that received money, student name, time
      try {
        await (admin as any).from("upi_payment_logs").insert({
          tenant_id: orderRow.tenant_id,
          order_id: orderId,
          amount_paise: amountPaise,
          upi_vpa: tenantUpiVpa ?? "unknown",
          student_name: orderAmount?.customer_name ?? user?.displayName ?? user?.email ?? "Guest",
          short_code: orderAmount?.short_code ?? "",
          trust_event: "student_confirmed",
        });
      } catch (logErr) {
        // Never fail the payment for an audit log error — just log it
        console.error("[verifyPaymentNow] Failed to write UPI audit log:", logErr);
      }

      const { data: updated } = await admin
        .from("orders")
        .select("id, short_code, status, total_paise, placed_at, ready_at, collected_at, customer_name, order_type, table_label")
        .eq("id", orderId)
        .single();
      const { data: orderLines } = await admin.from("order_items").select("id, order_id, name_snapshot, qty, diet_snapshot").eq("order_id", orderId);

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
        tenant_id: orderRow.tenant_id,
        order_id: orderId,
        event_type: "status_changed",
        payload: {
          from: "pending_payment",
          to: "placed",
          source: "upi_trust",
          upi_vpa: tenantUpiVpa,
          order: updated,
          lines: orderLines
        },
      });
      await admin.from("order_status_logs").insert({
        tenant_id: orderRow.tenant_id,
        order_id: orderId,
        from_status: "pending_payment",
        to_status: "placed",
        actor_user_id: user?.id ?? null,
        note: `UPI payment confirmed by student → ${tenantUpiVpa ?? "UPI"}`,
      });
    }

    return { status: "paid" };
  }

  // ── Live Razorpay mode: poll the API as webhook-drop fallback ─────────────────
  const { data: paymentRow } = await admin
    .from("payments")
    .select("razorpay_order_id, amount_paise")
    .eq("order_id", orderId)
    .eq("tenant_id", orderRow.tenant_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ razorpay_order_id: string | null; amount_paise: number }>();
  if (!paymentRow?.razorpay_order_id) return { status: "pending" };

  const { fetchRazorpayOrderStatus } = await import("@/lib/payments/razorpay");
  const remote = await fetchRazorpayOrderStatus(paymentRow.razorpay_order_id);
  if (remote === "failed") return { status: "failed" };
  if (remote !== "paid") {
    // If not paid yet, check if order has expired
    if (orderRow.payment_expires_at && new Date(orderRow.payment_expires_at) < new Date()) {
      return { status: "failed" };
    }
    return { status: "pending" };
  }

  const { data: rpcResult, error: rpcError } = await (admin as any).rpc("execute_idempotent_payment_capture", {
    p_order_id: orderId,
    p_tenant_id: orderRow.tenant_id,
    p_payment_id: `pay_poll_${paymentRow.razorpay_order_id.slice(6, 14)}`,
    p_razorpay_order_id: paymentRow.razorpay_order_id,
    p_amount_paise: paymentRow.amount_paise,
    p_raw_event_id: `manual_verify_${paymentRow.razorpay_order_id}`,
  });

  if (rpcError) {
    console.error("[verifyPaymentNow] Razorpay RPC call failed:", rpcError);
    return { status: "pending" };
  }

  const resObj = rpcResult as { success?: boolean; updated?: boolean; error?: string };
  if (!resObj.success) {
    console.error("[verifyPaymentNow] Razorpay RPC execution unsuccessful:", resObj.error);
    return { status: "pending" };
  }

  if (resObj.updated) {
    const { data: updated } = await admin
      .from("orders")
      .select("id, short_code, status, total_paise, placed_at, ready_at, collected_at, customer_name, order_type, table_label")
      .eq("id", orderId)
      .single();
    const { data: orderLines } = await admin.from("order_items").select("id, order_id, name_snapshot, qty, diet_snapshot").eq("order_id", orderId);

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
      tenant_id: orderRow.tenant_id,
      order_id: orderId,
      event_type: "status_changed",
      payload: { from: "pending_payment", to: "placed", source: "manual_verify", order: updated, lines: orderLines },
    });
    await admin.from("order_status_logs").insert({
      tenant_id: orderRow.tenant_id,
      order_id: orderId,
      from_status: "pending_payment",
      to_status: "placed",
      actor_user_id: user?.id ?? null,
      note: "UPI payment verified via fallback polling",
    });
  }

  return { status: "paid" };
}

// ── Refund initiation ───────────────────────────────────────────────────────

type PaymentRow = {
  id: string;
  razorpay_payment_id: string | null;
  amount_paise: number;
  status: string;
};

type OrderEventInsertUntyped = {
  tenant_id: string;
  order_id: string;
  event_type: string;
  payload: Record<string, unknown>;
};

/**
 * Internal helper — called by cancelOrderByStudent and the reconcile cron.
 * Looks up the captured payment for an order and initiates a Razorpay refund.
 * Safe to call multiple times — idempotent via payment status check.
 */
export async function initiateRefundForOrder(
  orderId: string,
  tenantId: string
): Promise<{ ok: boolean; error?: string; refundId?: string }> {
  const admin = getAdminClient(tenantId);

  const { data: payment } = await admin
    .from("payments")
    .select("id, razorpay_payment_id, amount_paise, status")
    .eq("order_id", orderId)
    .eq("tenant_id", tenantId)
    .maybeSingle<PaymentRow>();

  if (!payment || payment.status !== "captured") {
    return { ok: false, error: "No captured payment found" };
  }

  if (!payment.razorpay_payment_id) {
    return { ok: false, error: "No razorpay_payment_id on payment row" };
  }

  const result = await initiateRazorpayRefund({
    razorpayPaymentId: payment.razorpay_payment_id,
    amountPaise: payment.amount_paise,
    notes: { order_id: orderId },
  });

  if ("error" in result) {
    return { ok: false, error: result.error };
  }

  const { refundId } = result;

  // Mark payment as refunded.
  await admin
    .from("payments")
    .update({ status: "refunded" as unknown as "initiated" })
    .eq("id", payment.id)
    .eq("tenant_id", tenantId);

  // Flip order status to refunded.
  await admin
    .from("orders")
    .update({ status: "refunded" as unknown as "rejected" })
    .eq("id", orderId)
    .eq("tenant_id", tenantId);

  // Append-only event row for Realtime listeners.
  await (
    admin as unknown as {
      from: (t: string) => {
        insert: (row: OrderEventInsertUntyped) => Promise<{ error: { message: string } | null }>;
      };
    }
  )
    .from("order_events")
    .insert({
      tenant_id: tenantId,
      order_id: orderId,
      event_type: "refunded",
      payload: { refund_id: refundId, source: "initiateRefundForOrder" },
    });

  return { ok: true, refundId };
}
