"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { resolveTenant } from "@/lib/tenant";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/get-user";
import { randomOtp } from "@/lib/utils";

type Outcome = { ok: true } | { ok: false; error: string };

import type { ResolvedTenant } from "@/lib/tenant";
import type { CurrentUser } from "@/lib/auth/get-user";

type Ctx =
  | { ok: false; error: string }
  | { ok: true; tenant: ResolvedTenant; user: CurrentUser };

async function staffContext(): Promise<Ctx> {
  const h = await headers();
  const slug = h.get("x-tenant-slug") ?? "aditya";
  const tenant = await resolveTenant(slug);
  if (!tenant) return { ok: false, error: "Tenant not found" };
  const user = await requireRole(["kitchen_staff", "canteen_admin", "super_admin"]);
  if (!user) return { ok: false, error: "Not authorised" };
  return { ok: true, tenant, user };
}

export async function markPreparing(orderId: string): Promise<Outcome> {
  const ctx = await staffContext();
  if (!ctx.ok) return ctx;

  const admin = getAdminClient(ctx.tenant.id);
  const { data: cur } = await admin
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .eq("tenant_id", ctx.tenant.id)
    .maybeSingle<{ status: string }>();
  if (!cur) return { ok: false, error: "Order not found" };
  if (cur.status !== "placed") return { ok: false, error: `Cannot start an order in "${cur.status}"` };

  await admin.from("orders").update({ status: "preparing" }).eq("id", orderId);
  await admin.from("order_status_logs").insert({
    tenant_id: ctx.tenant.id,
    order_id: orderId,
    from_status: "placed",
    to_status: "preparing",
    actor_user_id: ctx.user.id,
  });
  revalidatePath("/kitchen");
  return { ok: true };
}

export async function markReady(orderId: string): Promise<Outcome> {
  const ctx = await staffContext();
  if (!ctx.ok) return ctx;

  const admin = getAdminClient(ctx.tenant.id);
  const { data: cur } = await admin
    .from("orders")
    .select("status, notes")
    .eq("id", orderId)
    .eq("tenant_id", ctx.tenant.id)
    .maybeSingle<{ status: string; notes: string | null }>();
  if (!cur) return { ok: false, error: "Order not found" };
  if (cur.status !== "preparing") return { ok: false, error: `Cannot mark ready from "${cur.status}"` };

  const otp = randomOtp();
  const hash = await bcrypt.hash(otp, 10);

  let existingNote: Record<string, unknown> = {};
  try {
    if (cur.notes) {
      const parsed = JSON.parse(cur.notes);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) existingNote = parsed as Record<string, unknown>;
    } else {
      existingNote = {};
    }
  } catch {
    existingNote = cur.notes ? { user_note: cur.notes } : {};
  }
  existingNote._otp = otp;
  const notesJson = JSON.stringify(existingNote);

  await admin
    .from("orders")
    .update({ status: "ready", otp_hash: hash, ready_at: new Date().toISOString(), notes: notesJson })
    .eq("id", orderId);
  await admin.from("order_status_logs").insert({
    tenant_id: ctx.tenant.id,
    order_id: orderId,
    from_status: "preparing",
    to_status: "ready",
    actor_user_id: ctx.user.id,
    note: "OTP issued",
  });
  revalidatePath("/kitchen");
  return { ok: true };
}

export async function verifyAndCollect(
  orderId: string,
  otp: string
): Promise<{ ok: boolean; error?: string; locked?: boolean; attemptsLeft?: number }> {
  const ctx = await staffContext();
  if (!ctx.ok) return ctx;

  const admin = getAdminClient(ctx.tenant.id);
  const { data: cur } = await admin
    .from("orders")
    .select("status, otp_hash, otp_attempts, notes")
    .eq("id", orderId)
    .eq("tenant_id", ctx.tenant.id)
    .maybeSingle<{ status: string; otp_hash: string | null; otp_attempts: number; notes: string | null }>();
  if (!cur || !cur.otp_hash) return { ok: false, error: "Order not ready for pickup" };
  if (cur.status !== "ready") return { ok: false, error: `Order is "${cur.status}"` };
  if (cur.otp_attempts >= 3) return { ok: false, error: "Locked — ask an admin to unlock", locked: true };

  const ok = await bcrypt.compare(otp, cur.otp_hash);
  if (!ok) {
    const left = 3 - (cur.otp_attempts + 1);
    await admin
      .from("orders")
      .update({ otp_attempts: cur.otp_attempts + 1 })
      .eq("id", orderId);
    return { ok: false, error: "Wrong code", attemptsLeft: Math.max(0, left) };
  }

  let cleanNotes: string | null = null;
  try {
    if (cur.notes) {
      const parsed = JSON.parse(cur.notes);
      if (parsed && typeof parsed === "object") {
        delete (parsed as Record<string, unknown>)._otp;
        const remaining = parsed as Record<string, unknown>;
        cleanNotes = Object.keys(remaining).length === 0 ? null : JSON.stringify(remaining);
      }
    }
  } catch {
    cleanNotes = null;
  }

  await admin
    .from("orders")
    .update({
      status: "collected",
      collected_at: new Date().toISOString(),
      notes: cleanNotes,
    })
    .eq("id", orderId);
  await admin.from("order_status_logs").insert({
    tenant_id: ctx.tenant.id,
    order_id: orderId,
    from_status: "ready",
    to_status: "collected",
    actor_user_id: ctx.user.id,
    note: "OTP verified",
  });
  revalidatePath("/kitchen");
  return { ok: true };
}

export async function rejectOrder(orderId: string, reason: string): Promise<Outcome> {
  const ctx = await staffContext();
  if (!ctx.ok) return ctx;
  const admin = getAdminClient(ctx.tenant.id);
  const { data: cur } = await admin
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .eq("tenant_id", ctx.tenant.id)
    .maybeSingle<{ status: string }>();
  if (!cur) return { ok: false, error: "Order not found" };
  if (["collected", "rejected", "expired"].includes(cur.status)) {
    return { ok: false, error: `Cannot reject a "${cur.status}" order` };
  }

  await admin.from("orders").update({ status: "rejected" }).eq("id", orderId);
  await admin.from("payments").update({ status: "refunded" }).eq("order_id", orderId);
  await admin.from("order_status_logs").insert({
    tenant_id: ctx.tenant.id,
    order_id: orderId,
    from_status: cur.status as "placed" | "preparing" | "ready",
    to_status: "rejected",
    actor_user_id: ctx.user.id,
    note: reason.slice(0, 200),
  });
  revalidatePath("/kitchen");
  return { ok: true };
}
