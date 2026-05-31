import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { getAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging";
import { rateLimit } from "@/lib/rate-limit";
import { parseUpiCreditPaise } from "@/lib/payments/upi-parse";
import { finalAmountPaise } from "@/lib/payments/upi-verify";

type Body = { tenant?: string; text?: string; package?: string; received_at?: string };
type TenantRow = { id: string; upi_listener_secret: string | null; upi_autoverify_enabled: boolean };
type OrderRow = { id: string; total_paise: number; upi_verify_paise: number | null; placed_at: string };

function constantTimeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export async function POST(req: NextRequest) {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: false, error: "Not configured" }, { status: 503 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = await rateLimit(`webhook:upi-credit:${ip}`, { limit: 120, windowMs: 60_000 });
  if (!rl.success) return NextResponse.json({ ok: true }, { status: 200 });

  const raw = await req.text();
  let body: Body;
  try {
    body = JSON.parse(raw) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  const tenantId = body.tenant?.trim();
  const text = (body.text ?? "").toString();
  const providedSecret = req.headers.get("x-tray-upi-secret") ?? "";
  if (!tenantId) return NextResponse.json({ ok: false, error: "Missing tenant" }, { status: 400 });

  const admin = getAdminClient();
  const { data: tenantRow } = await admin
    .from("tenants")
    .select("id, upi_listener_secret, upi_autoverify_enabled")
    .eq("id", tenantId)
    .maybeSingle<TenantRow>();

  if (!tenantRow?.upi_listener_secret || !constantTimeEqual(providedSecret, tenantRow.upi_listener_secret)) {
    logger.warn("upi-credit: bad secret", { tenant_id: tenantId });
    return NextResponse.json({ ok: false, error: "Unauthorised" }, { status: 401 });
  }

  const tenantAdmin = getAdminClient(tenantId);
  const dedupHash = crypto
    .createHash("sha256")
    .update(`${tenantId}|${text}|${body.received_at ?? ""}`)
    .digest("hex")
    .slice(0, 40);

  const parsedPaise = parseUpiCreditPaise(text);

  // Record the credit event (idempotent on dedup_hash). Best-effort: a duplicate
  // (same dedup_hash) hits the unique constraint and is silently ignored.
  const record = async (status: string, matchedOrderId: string | null) => {
    await (tenantAdmin as any).from("upi_credit_events").insert({
      tenant_id: tenantId,
      raw_text: text.slice(0, 500),
      package: body.package ?? null,
      parsed_paise: parsedPaise,
      received_at: body.received_at ?? null,
      matched_order_id: matchedOrderId,
      status,
      dedup_hash: dedupHash,
    });
  };

  if (parsedPaise === null) {
    await record("unparsed", null);
    return NextResponse.json({ ok: true, parsed: false });
  }

  // Find pending orders whose final amount equals the credited amount.
  const { data: pending } = await (tenantAdmin
    .from("orders")
    .select("id, total_paise, upi_verify_paise, placed_at")
    .eq("tenant_id", tenantId)
    .eq("status", "pending_payment")
    .gt("payment_expires_at", new Date().toISOString()) as any);

  const matches = ((pending ?? []) as OrderRow[])
    .filter((o) => finalAmountPaise(o.total_paise, o.upi_verify_paise) === parsedPaise)
    .sort((a, b) => new Date(a.placed_at).getTime() - new Date(b.placed_at).getTime());

  if (matches.length === 0) {
    await record("unmatched", null);
    return NextResponse.json({ ok: true, parsed: true, matched: false });
  }

  const target = matches[0]; // oldest; uniqueness should make this the only one
  const rawEventId = `upi_listener_${dedupHash}`;
  const { data: result } = await (tenantAdmin as any).rpc("safe_capture_upi_credit", {
    p_order_id: target.id,
    p_tenant_id: tenantId,
    p_amount_paise: parsedPaise,
    p_raw_event_id: rawEventId,
  });

  const matched = result === "captured" || result === "already_captured";
  await record(matched ? "matched" : "unmatched", target.id);
  logger.info("upi-credit processed", { tenant_id: tenantId, order_id: target.id, result, parsed_paise: parsedPaise });

  return NextResponse.json({ ok: true, parsed: true, matched, result });
}
