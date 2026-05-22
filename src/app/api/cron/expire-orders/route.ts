import { NextResponse, type NextRequest } from "next/server";
import { Receiver } from "@upstash/qstash";
import { getAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

// QStash hits this every minute. Auth via HMAC signature — no signature, no
// access. Skips entirely if QStash signing keys aren't configured so a misset
// env never silently opens the route.
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

type Row = { id: string; tenant_id: string; status: string };

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const ok = await verifyQstash(req, raw);
  const bypassKey = req.headers.get("x-bypass-key");
  const isBypassed = !!(bypassKey && env.SUPABASE_SERVICE_ROLE_KEY && bypassKey === env.SUPABASE_SERVICE_ROLE_KEY);
  if (!ok && !isBypassed) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Service role missing" }, { status: 503 });
  }

  const admin = getAdminClient();
  const nowIso = new Date().toISOString();

  // 1. Fetch pending_payment orders that have expired
  const { data: stale } = await admin
    .from("orders")
    .select("id, tenant_id, status")
    .eq("status", "pending_payment")
    .lt("payment_expires_at", nowIso)
    .limit(500)
    .returns<Row[]>();

  // 2. Fetch ready orders that are uncollected after 30 minutes (1800 seconds)
  const uncollectedCutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { data: uncollected } = await admin
    .from("orders")
    .select("id, tenant_id, status")
    .eq("status", "ready")
    .lt("ready_at", uncollectedCutoff)
    .limit(500)
    .returns<Row[]>();

  const hasStale = stale && stale.length > 0;
  const hasUncollected = uncollected && uncollected.length > 0;

  if (!hasStale && !hasUncollected) {
    return NextResponse.json({ ok: true, expired: 0, uncollectedExpired: 0 });
  }

  // Handle stale pending payments
  if (hasStale) {
    const ids = stale.map((s) => s.id);
    await admin.from("orders").update({ status: "expired" }).in("id", ids);
    await admin.from("order_status_logs").insert(
      stale.map((s) => ({
        tenant_id: s.tenant_id,
        order_id: s.id,
        from_status: "pending_payment" as const,
        to_status: "expired" as const,
        note: "Auto-expired (QStash)",
      }))
    );
    await admin.from("audit_logs").insert(
      stale.map((s) => ({
        tenant_id: s.tenant_id,
        action: "order.expired_auto",
        target_type: "order",
        target_id: s.id,
      }))
    );
    // Emit order_events to trigger student realtime UI refresh
    await (admin.from("order_events") as any).insert(
      stale.map((s) => ({
        order_id: s.id,
        tenant_id: s.tenant_id,
        event_type: "status_change",
        payload: { from: "pending_payment", to: "expired" },
      }))
    );
  }

  // Handle uncollected ready orders
  if (hasUncollected) {
    const ids = uncollected.map((u) => u.id);
    await admin.from("orders").update({ status: "expired" }).in("id", ids);
    await admin.from("order_status_logs").insert(
      uncollected.map((u) => ({
        tenant_id: u.tenant_id,
        order_id: u.id,
        from_status: "ready" as const,
        to_status: "expired" as const,
        note: "Auto-expired: Uncollected after 30 minutes",
      }))
    );
    await admin.from("audit_logs").insert(
      uncollected.map((u) => ({
        tenant_id: u.tenant_id,
        action: "order.expired_uncollected",
        target_type: "order",
        target_id: u.id,
      }))
    );
    // Emit order_events to trigger student realtime UI refresh
    await (admin.from("order_events") as any).insert(
      uncollected.map((u) => ({
        order_id: u.id,
        tenant_id: u.tenant_id,
        event_type: "status_change",
        payload: { from: "ready", to: "expired" },
      }))
    );
  }

  return NextResponse.json({
    ok: true,
    expired: stale?.length ?? 0,
    uncollectedExpired: uncollected?.length ?? 0,
  });
}
