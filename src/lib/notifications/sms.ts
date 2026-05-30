import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logging";

// Normalise Indian mobile numbers to E.164 (+91XXXXXXXXXX).
// Accepts bare 10-digit, +91-prefixed, or 091-prefixed forms.
function toE164India(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

export async function sendSms(to: string, body: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!sid || !token || !from) {
    // Graceful no-op — SMS is opt-in; missing credentials means feature is not configured yet.
    logger.info("sms:noop (no Twilio credentials)", { to, body: body.slice(0, 40) });
    return;
  }

  const toE164 = toE164India(to);
  const params = new URLSearchParams({ From: from, To: toE164, Body: body });

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      logger.error("sms:send failed", null, { to: toE164, status: res.status, err });
    } else {
      logger.info("sms:sent", { to: toE164, body: body.slice(0, 40) });
    }
  } catch (err) {
    logger.error("sms:send threw", err, { to: toE164 });
  }
}

// Called after a new order is confirmed (UPI or Razorpay).
// Looks up admin_phone from tenants, sends a concise SMS if set.
// Fire-and-forget — never throws, never blocks the order flow.
export async function notifyAdminNewOrder(orderId: string, tenantId: string): Promise<void> {
  try {
    const admin = getAdminClient(tenantId);

    const [tenantRes, orderRes] = await Promise.all([
      admin
        .from("tenants")
        .select("admin_phone, name, slug")
        .eq("id", tenantId)
        .maybeSingle<{ admin_phone: string | null; name: string; slug: string }>(),
      admin
        .from("orders")
        .select("short_code, total_paise")
        .eq("id", orderId)
        .eq("tenant_id", tenantId)
        .maybeSingle<{ short_code: string; total_paise: number }>(),
    ]);

    const tenant = tenantRes.data;
    const order = orderRes.data;

    if (!tenant?.admin_phone || !order) return;

    const amount = `₹${(order.total_paise / 100).toFixed(0)}`;
    const msg = `Tray: New order ${order.short_code} — ${amount}. Kitchen: trayy.vercel.app/c/${tenant.slug}/kitchen`;

    await sendSms(tenant.admin_phone, msg);
  } catch (err) {
    logger.error("notifyAdminNewOrder failed", err, { order_id: orderId, tenant_id: tenantId });
  }
}
