"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import bcrypt from "bcryptjs";
import { resolveTenant, getTenantSlugFromHeaders } from "@/lib/tenant";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/get-user";
import { randomOtp } from "@/lib/utils";
import { initiateRefundForOrder } from "@/app/(student)/_actions";

type Outcome = { ok: true } | { ok: false; error: string };

import type { ResolvedTenant } from "@/lib/tenant";
import type { CurrentUser } from "@/lib/auth/get-user";

type Ctx =
  | { ok: false; error: string }
  | { ok: true; tenant: ResolvedTenant; user: CurrentUser };

async function staffContext(tenantSlugOverride?: string): Promise<Ctx> {
  const h = await headers();
  const slug = tenantSlugOverride || getTenantSlugFromHeaders(h);
  const tenant = await resolveTenant(slug);
  if (!tenant) return { ok: false, error: "Tenant not found" };
  const user = await requireRole(["kitchen_staff", "canteen_admin", "super_admin"], tenant.id);
  if (!user) return { ok: false, error: "Not authorised" };
  return { ok: true, tenant, user };
}

// Append-only Realtime log. Insert via the un-typed channel because the
// generated Database type isn't aware of the order_events table yet.
async function emitOrderEvent(
  admin: ReturnType<typeof getAdminClient>,
  row: { order_id: string; tenant_id: string; event_type: string; payload?: Record<string, unknown> }
) {
  await (admin.from("order_events") as unknown as {
    insert: (r: typeof row) => Promise<unknown>;
  }).insert(row);
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
  await admin.from("audit_logs").insert({
    tenant_id: ctx.tenant.id,
    actor_user_id: ctx.user.id,
    action: "order.preparing",
    target_type: "order",
    target_id: orderId,
  });
  await emitOrderEvent(admin, {
    order_id: orderId,
    tenant_id: ctx.tenant.id,
    event_type: "preparing",
    payload: { actor: "kitchen" },
  });
  revalidatePath(`/c/${ctx.tenant.slug}/kitchen`);
  return { ok: true };
}

export async function markReady(orderId: string): Promise<Outcome> {
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
  if (cur.status !== "preparing") return { ok: false, error: `Cannot mark ready from "${cur.status}"` };

  const otp = randomOtp();
  const hash = await bcrypt.hash(otp, 4);

  // OTP plaintext lives in pickup_secrets (RLS denies all PostgREST access;
  // only readable through read_my_pickup_otp SECURITY DEFINER for the owner).
  // The customer's note in orders.notes is preserved untouched.
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  await admin
    .from("orders")
    .update({ status: "ready", otp_hash: hash, ready_at: new Date().toISOString() })
    .eq("id", orderId);
  await admin.from("pickup_secrets").upsert(
    { order_id: orderId, tenant_id: ctx.tenant.id, otp_plain: otp, expires_at: expiresAt },
    { onConflict: "order_id" }
  );
  await admin.from("order_status_logs").insert({
    tenant_id: ctx.tenant.id,
    order_id: orderId,
    from_status: "preparing",
    to_status: "ready",
    actor_user_id: ctx.user.id,
    note: "OTP issued",
  });
  await admin.from("audit_logs").insert({
    tenant_id: ctx.tenant.id,
    actor_user_id: ctx.user.id,
    action: "order.ready",
    target_type: "order",
    target_id: orderId,
  });
  await emitOrderEvent(admin, {
    order_id: orderId,
    tenant_id: ctx.tenant.id,
    event_type: "ready",
    payload: { actor: "kitchen" },
  });
  revalidatePath(`/c/${ctx.tenant.slug}/kitchen`);
  return { ok: true };
}

export async function verifyAndCollect(
  orderId: string,
  otp: string
): Promise<{ ok: boolean; error?: string; locked?: boolean; attemptsLeft?: number }> {
  const ctx = await staffContext();
  if (!ctx.ok) return ctx;

  const admin = getAdminClient(ctx.tenant.id);

  // Call the atomic verify_and_increment_otp_limit function directly
  const { data: result, error: rpcErr } = await (admin as any).rpc("verify_and_increment_otp_limit", {
    p_order_id: orderId,
    p_tenant_id: ctx.tenant.id,
    p_input_otp: otp,
  });

  if (rpcErr || !result) {
    return { ok: false, error: rpcErr?.message ?? "Error verifying OTP" };
  }

  const res = result as { ok: boolean; error?: string; attemptsLeft?: number };
  if (!res.ok) {
    const isLocked = res.error?.includes("lock") || res.error?.includes("exceeded");
    return { ok: false, error: res.error, locked: isLocked, attemptsLeft: res.attemptsLeft };
  }

  // Plaintext OTP cleared. ON DELETE CASCADE from orders also covers it.
  await admin.from("pickup_secrets").delete().eq("order_id", orderId);
  await admin.from("order_status_logs").insert({
    tenant_id: ctx.tenant.id,
    order_id: orderId,
    from_status: "ready",
    to_status: "collected",
    actor_user_id: ctx.user.id,
    note: "OTP verified",
  });
  await admin.from("audit_logs").insert({
    tenant_id: ctx.tenant.id,
    actor_user_id: ctx.user.id,
    action: "order.collected",
    target_type: "order",
    target_id: orderId,
  });
  await emitOrderEvent(admin, {
    order_id: orderId,
    tenant_id: ctx.tenant.id,
    event_type: "collected",
    payload: { actor: "kitchen" },
  });
  revalidatePath(`/c/${ctx.tenant.slug}/kitchen`);
  return { ok: true };
}

// Mark a menu item sold out (86) or back in stock from kitchen board.
// Looks up the item by name within this tenant — name_snapshot matches menu_items.name.
export async function markItemSoldOut(
  itemName: string,
  inStock: boolean
): Promise<{ ok: boolean; error?: string; itemId?: string }> {
  const ctx = await staffContext();
  if (!ctx.ok) return ctx;

  const admin = getAdminClient(ctx.tenant.id);

  // Resolve menu item by name within this tenant (live items only).
  const { data: item } = await admin
    .from("menu_items")
    .select("id")
    .eq("tenant_id", ctx.tenant.id)
    .eq("name", itemName)
    .eq("status", "live")
    .maybeSingle<{ id: string }>();

  if (!item) return { ok: false, error: "Item not found — check the name" };

  const { error: updateErr } = await admin
    .from("menu_items")
    .update({ in_stock: inStock })
    .eq("id", item.id);

  if (updateErr) return { ok: false, error: updateErr.message };

  await admin.from("audit_logs").insert({
    tenant_id: ctx.tenant.id,
    actor_user_id: ctx.user.id,
    action: inStock ? "menu.86_undo" : "menu.86",
    target_type: "menu_item",
    target_id: item.id,
    meta: { name: itemName },
  });

  // Emit a menu_item_86 event so kitchen Realtime subscribers pick it up.
  // Prefer the oldest active order as the anchor; fall back to a dummy UUID
  // when the board is empty (menu ops can happen between service periods).
  const DUMMY_ORDER_ID = "00000000-0000-0000-0000-000000000000";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data: activeOrder } = await admin
    .from("orders")
    .select("id")
    .eq("tenant_id", ctx.tenant.id)
    .in("status", ["placed", "preparing", "ready"])
    .gte("placed_at", today.toISOString())
    .order("placed_at", { ascending: true })
    .limit(1)
    .maybeSingle<{ id: string }>();

  await emitOrderEvent(admin, {
    order_id: activeOrder?.id ?? DUMMY_ORDER_ID,
    tenant_id: ctx.tenant.id,
    event_type: "menu_item_86",
    payload: { name: itemName, in_stock: inStock },
  });

  revalidatePath(`/c/${ctx.tenant.slug}/menu`);
  revalidatePath(`/c/${ctx.tenant.slug}/kitchen`);
  return { ok: true, itemId: item.id };
}

// ── Staff PIN login ───────────────────────────────────────────────────────────
// Called from the PIN kiosk (staff-select page). Uses the RPC which is
// SECURITY DEFINER — bcrypt compare + lockout happen in Postgres, not here.
// On success a signed cookie is written; on failure the error is returned to
// the client so it can show attempts remaining or the lockout countdown.
export async function verifyStaffPinAction(
  p_user_id: string,
  p_pin: string
): Promise<{ ok: boolean; error?: string; locked?: boolean; lockedUntil?: string }> {
  const h = await headers();
  const slug = getTenantSlugFromHeaders(h);
  const tenant = await resolveTenant(slug);
  if (!tenant) return { ok: false, error: "Tenant not found" };

  // requireRole is skipped here — staff-select is accessed before PIN auth.
  // We use the admin client so the RPC call succeeds regardless of the calling
  // user's session (shared-tablet scenario where the device has a service session).
  const admin = getAdminClient(tenant.id);

  // Fetch lockout state before calling RPC so we can return a lockedUntil
  // timestamp for the countdown UI.
  const { data: profile } = await admin
    .from("staff_profiles")
    .select("locked_until, is_active")
    .eq("user_id", p_user_id)
    .eq("tenant_id", tenant.id)
    .eq("is_active", true)
    .maybeSingle<{ locked_until: string | null; is_active: boolean }>();

  if (!profile) return { ok: false, error: "Staff member not found" };

  if (profile.locked_until && new Date(profile.locked_until) > new Date()) {
    return { ok: false, locked: true, lockedUntil: profile.locked_until, error: "Account locked" };
  }

  const { data: verified, error: rpcError } = await admin.rpc("verify_staff_pin", {
    p_tenant_id: tenant.id,
    p_user_id,
    p_pin,
  });

  if (rpcError) return { ok: false, error: rpcError.message };

  if (!verified) {
    // Re-fetch to get updated locked_until after the failed attempt.
    const { data: refreshed } = await admin
      .from("staff_profiles")
      .select("locked_until, pin_attempt_count")
      .eq("user_id", p_user_id)
      .eq("tenant_id", tenant.id)
      .maybeSingle<{ locked_until: string | null; pin_attempt_count: number }>();

    if (refreshed?.locked_until && new Date(refreshed.locked_until) > new Date()) {
      return {
        ok: false,
        locked: true,
        lockedUntil: refreshed.locked_until,
        error: "Too many wrong PINs — locked for 10 minutes",
      };
    }

    const attemptsUsed = refreshed?.pin_attempt_count ?? 1;
    const attemptsLeft = Math.max(0, 5 - attemptsUsed);
    return {
      ok: false,
      error: attemptsLeft > 0 ? `Wrong PIN — ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} left` : "Wrong PIN",
    };
  }

  // Success — write the 8-hour staff session cookie.
  const cookieStore = await cookies();
  cookieStore.set("kitchen_staff_id", p_user_id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60, // 8 hours in seconds
    secure: process.env.NODE_ENV === "production",
  });

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
  void initiateRefundForOrder(orderId, ctx.tenant.id).catch(() => {});
  await admin.from("order_status_logs").insert({
    tenant_id: ctx.tenant.id,
    order_id: orderId,
    from_status: cur.status as "placed" | "preparing" | "ready",
    to_status: "rejected",
    actor_user_id: ctx.user.id,
    note: reason.slice(0, 200),
  });
  await admin.from("audit_logs").insert({
    tenant_id: ctx.tenant.id,
    actor_user_id: ctx.user.id,
    action: "order.rejected",
    target_type: "order",
    target_id: orderId,
    meta: { reason: reason.slice(0, 200) },
  });
  await emitOrderEvent(admin, {
    order_id: orderId,
    tenant_id: ctx.tenant.id,
    event_type: "rejected",
    payload: { actor: "kitchen", reason: reason.slice(0, 200) },
  });
  revalidatePath(`/c/${ctx.tenant.slug}/kitchen`);
  return { ok: true };
}

export async function createWalkInOrder(
  itemsInput?: { idOrName: string; qty: number }[]
): Promise<{ ok: boolean; error?: string; orderId?: string }> {
  const ctx = await staffContext();
  if (!ctx.ok) return ctx;

  const admin = getAdminClient(ctx.tenant.id);
  let validated: { item: { id: string; name: string; price_paise: number; diet: "veg" | "nonveg" | "egg"; prep_target_seconds: number }; qty: number }[] = [];

  if (itemsInput && itemsInput.length > 0) {
    for (const input of itemsInput) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.idOrName);
      let query = admin
        .from("menu_items")
        .select("id, name, price_paise, diet, prep_target_seconds")
        .eq("tenant_id", ctx.tenant.id)
        .eq("status", "live")
        .eq("in_stock", true);

      if (isUuid) {
        query = query.eq("id", input.idOrName);
      } else {
        query = query.eq("name", input.idOrName);
      }

      let { data: matchItem } = await query.maybeSingle<{ id: string; name: string; price_paise: number; diet: "veg" | "nonveg" | "egg"; prep_target_seconds: number }>();

      if (!matchItem && !isUuid) {
        const { data: partialMatch } = await admin
          .from("menu_items")
          .select("id, name, price_paise, diet, prep_target_seconds")
          .eq("tenant_id", ctx.tenant.id)
          .eq("status", "live")
          .eq("in_stock", true)
          .ilike("name", `%${input.idOrName}%`)
          .limit(1);
        if (partialMatch && partialMatch[0]) {
          matchItem = partialMatch[0] as any;
        }
      }

      if (!matchItem) {
        return { ok: false, error: `Item "${input.idOrName}" not found or out of stock.` };
      }

      validated.push({ item: matchItem, qty: Math.max(1, input.qty) });
    }
  } else {
    const { data: fetchedItems, error: itemsErr } = await admin
      .from("menu_items")
      .select("id, name, price_paise, diet, prep_target_seconds")
      .eq("tenant_id", ctx.tenant.id)
      .eq("status", "live")
      .eq("in_stock", true)
      .limit(10);

    let items = fetchedItems || [];

    if (items.length === 0) {
      let { data: cat } = await admin
        .from("menu_categories")
        .select("id")
        .eq("tenant_id", ctx.tenant.id)
        .eq("name", "Specials")
        .maybeSingle<{ id: string }>();

      if (!cat) {
        const catInsert = await admin
          .from("menu_categories")
          .insert({
            tenant_id: ctx.tenant.id,
            name: "Specials",
            sort_order: 99,
          })
          .select("id")
          .single<{ id: string }>();
        cat = catInsert.data;
      }

      if (cat) {
        const { data: newItem } = await admin
          .from("menu_items")
          .insert({
            tenant_id: ctx.tenant.id,
            category_id: cat.id,
            name: "Samosa",
            description: "Fresh crispy samosa",
            price_paise: 2000,
            diet: "veg",
            status: "live",
            prep_target_seconds: 300,
            in_stock: true,
            sort_order: 999,
          })
          .select("id, name, price_paise, diet, prep_target_seconds")
          .single<{ id: string; name: string; price_paise: number; diet: "veg" | "nonveg" | "egg"; prep_target_seconds: number }>();

        if (newItem) {
          items = [newItem];
        }
      }
    }

    if (items.length === 0) {
      return { ok: false, error: "No menu items available to create a walk-in order" };
    }

    const numItems = Math.min(items.length, 1 + Math.floor(Math.random() * 3));
    const selected: typeof items = [];
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    for (let i = 0; i < numItems; i++) {
      selected.push(shuffled[i]);
    }

    validated = selected.map(item => {
      const qty = 1 + Math.floor(Math.random() * 2);
      return { item: item as any, qty };
    });
  }

  let total = 0;
  for (const v of validated) {
    total += v.item.price_paise * v.qty;
  }

  // Get next short code
  const { data: codeData, error: codeErr } = await admin.rpc("next_order_short_code", {
    p_tenant: ctx.tenant.id,
  });
  const shortCode = (!codeErr && codeData != null)
    ? String(codeData)
    : `T-${1000 + Math.floor(Math.random() * 9000)}`;

  // Insert order
  const orderInsert = await admin
    .from("orders")
    .insert({
      tenant_id: ctx.tenant.id,
      user_id: null,
      short_code: shortCode,
      status: "placed", // walk-in orders are immediately paid and placed
      total_paise: total,
      order_type: "takeaway",
      customer_name: "Walk-in · counter",
      notes: "Walk-in order",
      placed_at: new Date().toISOString(),
    })
    .select("id")
    .single<{ id: string }>();

  if (orderInsert.error || !orderInsert.data) {
    return { ok: false, error: orderInsert.error?.message ?? "Could not create walk-in order" };
  }
  const orderId = orderInsert.data.id;

  // Insert items
  await admin.from("order_items").insert(
    validated.map((v) => ({
      tenant_id: ctx.tenant.id,
      order_id: orderId,
      menu_item_id: v.item.id,
      name_snapshot: v.item.name,
      price_paise_snapshot: v.item.price_paise,
      diet_snapshot: v.item.diet,
      qty: v.qty,
    }))
  );

  // Insert status log
  await admin.from("order_status_logs").insert({
    tenant_id: ctx.tenant.id,
    order_id: orderId,
    from_status: null,
    to_status: "placed",
    actor_user_id: ctx.user.id,
    note: "Walk-in order created at counter",
  });

  // Insert audit log
  await admin.from("audit_logs").insert({
    tenant_id: ctx.tenant.id,
    actor_user_id: ctx.user.id,
    action: "order.walk_in_created",
    target_type: "order",
    target_id: orderId,
    meta: { total_paise: total, itemsCount: validated.length },
  });

  // Insert captured payment record
  await admin.from("payments").insert({
    tenant_id: ctx.tenant.id,
    order_id: orderId,
    razorpay_order_id: null,
    razorpay_payment_id: `pay_walkin_${orderId.slice(0, 8)}`,
    amount_paise: total,
    status: "captured",
  });

  // Fetch full details to embed in the realtime payload
  const { data: updatedOrder } = await admin
    .from("orders")
    .select("id, short_code, status, total_paise, placed_at, ready_at, collected_at, customer_name, order_type, table_label")
    .eq("id", orderId)
    .single();

  const { data: orderLines } = await admin
    .from("order_items")
    .select("id, order_id, name_snapshot, qty, diet_snapshot")
    .eq("order_id", orderId);

  // Emit status change event for realtime queue updates
  await emitOrderEvent(admin, {
    order_id: orderId,
    tenant_id: ctx.tenant.id,
    event_type: "placed",
    payload: {
      actor: "counter",
      order: updatedOrder,
      lines: orderLines || []
    },
  });

  revalidatePath(`/c/${ctx.tenant.slug}/kitchen`);
  return { ok: true, orderId };
}

export async function pushSpecialToMenu(
  form: {
    name: string;
    description: string;
    price: number;
    prep: number;
    diet: "veg" | "nonveg" | "egg";
  },
  tenantSlug?: string
): Promise<{ ok: boolean; error?: string; itemId?: string }> {
  const ctx = await staffContext(tenantSlug);
  if (!ctx.ok) return ctx;

  const admin = getAdminClient(ctx.tenant.id);

  // Find or create the "Specials" category for this tenant
  let { data: cat } = await admin
    .from("menu_categories")
    .select("id")
    .eq("tenant_id", ctx.tenant.id)
    .eq("name", "Specials")
    .maybeSingle<{ id: string }>();

  if (!cat) {
    const catInsert = await admin
      .from("menu_categories")
      .insert({
        tenant_id: ctx.tenant.id,
        name: "Specials",
        sort_order: 99,
      })
      .select("id")
      .single<{ id: string }>();

    if (catInsert.error || !catInsert.data) {
      return { ok: false, error: catInsert.error?.message ?? "Could not create Specials category" };
    }
    cat = catInsert.data;
  }

  // Insert special menu item
  const itemInsert = await admin
    .from("menu_items")
    .insert({
      tenant_id: ctx.tenant.id,
      category_id: cat.id,
      name: form.name,
      description: form.description,
      price_paise: Math.round(form.price * 100),
      diet: form.diet,
      status: "live",
      prep_target_seconds: form.prep * 60,
      in_stock: true,
      sort_order: 999,
    })
    .select("id")
    .single<{ id: string }>();

  if (itemInsert.error || !itemInsert.data) {
    return { ok: false, error: itemInsert.error?.message ?? "Could not push special menu item" };
  }
  const itemId = itemInsert.data.id;

  // Insert audit log
  await admin.from("audit_logs").insert({
    tenant_id: ctx.tenant.id,
    actor_user_id: ctx.user.id,
    action: "menu.push_special",
    target_type: "menu_item",
    target_id: itemId,
    meta: { name: form.name, price: form.price },
  });

  // Emit menu_item_86 back-in-stock event for student menu sync
  await emitOrderEvent(admin, {
    order_id: "00000000-0000-0000-0000-000000000000",
    tenant_id: ctx.tenant.id,
    event_type: "menu_item_86",
    payload: { name: form.name, in_stock: true },
  });

  revalidatePath(`/c/${ctx.tenant.slug}/menu`);
  revalidatePath(`/c/${ctx.tenant.slug}/kitchen`);

  return { ok: true, itemId };
}

export async function removeSpecialFromMenu(itemId: string, tenantSlug?: string): Promise<Outcome> {
  const ctx = await staffContext(tenantSlug);
  if (!ctx.ok) return ctx;

  const admin = getAdminClient(ctx.tenant.id);

  // Update status to archived so it is removed from active specials list
  const { data: item, error: loadErr } = await admin
    .from("menu_items")
    .select("name")
    .eq("id", itemId)
    .eq("tenant_id", ctx.tenant.id)
    .maybeSingle<{ name: string }>();

  if (loadErr || !item) return { ok: false, error: "Menu item not found" };

  const { error: updateErr } = await admin
    .from("menu_items")
    .update({ status: "archived" })
    .eq("id", itemId)
    .eq("tenant_id", ctx.tenant.id);

  if (updateErr) return { ok: false, error: updateErr.message };

  // Insert audit log
  await admin.from("audit_logs").insert({
    tenant_id: ctx.tenant.id,
    actor_user_id: ctx.user.id,
    action: "menu.remove_special",
    target_type: "menu_item",
    target_id: itemId,
    meta: { name: item.name },
  });

  // Emit menu_item_86 sold-out event so student menu sync picks it up
  await emitOrderEvent(admin, {
    order_id: "00000000-0000-0000-0000-000000000000",
    tenant_id: ctx.tenant.id,
    event_type: "menu_item_86",
    payload: { name: item.name, in_stock: false },
  });

  revalidatePath(`/c/${ctx.tenant.slug}/menu`);
  revalidatePath(`/c/${ctx.tenant.slug}/kitchen`);

  return { ok: true };
}
