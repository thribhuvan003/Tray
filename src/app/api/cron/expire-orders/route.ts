import { NextResponse, type NextRequest } from "next/server";
import { Receiver } from "@upstash/qstash";
import { getAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Expire-orders cron (QStash scheduled).
 * Production-hardened with explicit tenant context for every privileged background job.
 *
 * This job touches money-adjacent state (pending_payment orders across all tenants).
 * It must never leak across tenants and must be fully observable — part of the
 * "one login = own dedicated system + own data" guarantee at scale.
 *
 * Pattern: requireTenantContextForJob + per-tenant getAdminClient inside the loop
 * (same as the already-hardened reconcile cron and the kitchen/student surfaces).
 */

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
  if (!ok) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Service role missing" }, { status: 503 });
  }

  // Additional defense-in-depth rate limiting on this privileged background job.
  const cronRl = await rateLimit("cron:expire-orders", { limit: 10, windowMs: 60_000 });
  if (!cronRl.success) {
    logger.warn("expire-orders cron rate limited");
    return NextResponse.json({ ok: true, skipped: "rate_limited" });
  }

  const start = Date.now();

  logger.info("expire-orders cron started", {
    job: "expire-orders",
  });

  const admin = getAdminClient();
  const nowIso = new Date().toISOString();
  const { data: stale } = await admin
    .from("orders")
    .select("id, tenant_id, status")
    .eq("status", "pending_payment")
    .lt("payment_expires_at", nowIso)
    .limit(500)
    .returns<Row[]>();

  if (!stale || stale.length === 0) {
    logger.info("expire-orders cron completed (no work)", { job: "expire-orders", expired: 0, duration_ms: Date.now() - start });
    return NextResponse.json({ ok: true, expired: 0 });
  }

  // Group by tenant and use explicit per-tenant admin clients for true isolation
  // (defensive even though RLS + tenant_id filters are present).
  const byTenant = new Map<string, Row[]>();
  for (const r of stale) {
    if (!byTenant.has(r.tenant_id)) byTenant.set(r.tenant_id, []);
    byTenant.get(r.tenant_id)!.push(r);
  }

  let totalExpired = 0;
  for (const [tenantId, rows] of byTenant) {
    const tAdmin = getAdminClient(tenantId);
    const ids = rows.map((r) => r.id);

    await tAdmin.from("orders").update({ status: "expired" }).in("id", ids);

    await tAdmin.from("order_status_logs").insert(
      rows.map((r) => ({
        tenant_id: r.tenant_id,
        order_id: r.id,
        from_status: "pending_payment" as const,
        to_status: "expired" as const,
        note: "Auto-expired (QStash)",
      }))
    );

    await tAdmin.from("audit_logs").insert(
      rows.map((r) => ({
        tenant_id: r.tenant_id,
        action: "order.expired_auto",
        target_type: "order",
        target_id: r.id,
      }))
    );

    totalExpired += rows.length;

    logger.info("expire-orders tenant batch", {
      job: "expire-orders",
      tenant_id: tenantId,
      expired_in_batch: rows.length,
    });
  }

  const duration = Date.now() - start;

  logger.info("expire-orders cron completed", {
    job: "expire-orders",
    tenants_affected: byTenant.size,
    expired: totalExpired,
    duration_ms: duration,
  });

  return NextResponse.json({ ok: true, expired: totalExpired, duration_ms: duration, tenants: byTenant.size });
}
