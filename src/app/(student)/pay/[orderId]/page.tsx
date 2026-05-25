import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { resolveTenant, getTenantSlugFromHeaders } from "@/lib/tenant";
import { getAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/get-user";
import { PayPanel } from "@/components/portal-student/pay-panel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PayPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const h = await headers();
  const slug = getTenantSlugFromHeaders(h);
  const tenant = await resolveTenant(slug);
  if (!tenant) notFound();

  const user = await getCurrentUser();
  const admin = getAdminClient(tenant.id);
  const { data: order } = await admin
    .from("orders")
    .select("id, short_code, total_paise, status, payment_expires_at, customer_name, user_id")
    .eq("id", orderId)
    .eq("tenant_id", tenant.id)
    .maybeSingle<{
      id: string;
      short_code: string;
      total_paise: number;
      status: string;
      payment_expires_at: string | null;
      customer_name: string | null;
      user_id: string | null;
    }>();
  if (!order) notFound();

  // If the order belongs to a registered user, ensure the visitor is that user.
  // Anonymous guest orders (user_id = null) can be paid without signing in.
  if (order.user_id && (!user || user.id !== order.user_id)) {
    redirect(`/c/${tenant.slug}/login?next=/c/${tenant.slug}/pay/${orderId}`);
  }
  if (order.status !== "pending_payment") {
    redirect(`/c/${tenant.slug}/track/${orderId}`);
  }

  const { data: lines } = await admin
    .from("order_items")
    .select("id, name_snapshot, qty, price_paise_snapshot, diet_snapshot")
    .eq("order_id", orderId)
    .returns<{
      id: string;
      name_snapshot: string;
      qty: number;
      price_paise_snapshot: number;
      diet_snapshot: "veg" | "nonveg" | "egg";
    }[]>();

  if (!tenant.upi_vpa) {
    // Redirect back to menu with a notice — invalid UPI means payment is impossible
    redirect(`/c/${tenant.slug}/menu?msg=no-upi`);
  }

  // Fetch the razorpay_order_id associated with the payment record
  const { data: payment } = await admin
    .from("payments")
    .select("razorpay_order_id")
    .eq("order_id", orderId)
    .maybeSingle<{ razorpay_order_id: string | null }>();

  const isSimMode =
    !process.env.NEXT_PUBLIC_RAZORPAY_LIVE ||
    process.env.NEXT_PUBLIC_RAZORPAY_LIVE === "false" ||
    process.env.NEXT_PUBLIC_RAZORPAY_LIVE === "0";

  // Pass real user email for Razorpay prefill (improves checkout UX)
  const userEmail = user?.email ?? null;

  return (
    <PayPanel
      tenantSlug={tenant.slug}
      tenantName={tenant.name}
      tenantUpi={tenant.upi_vpa}
      order={order}
      lines={lines ?? []}
      razorpayKeyId={process.env.RAZORPAY_KEY_ID ?? ""}
      razorpayOrderId={payment?.razorpay_order_id ?? null}
      isSimMode={isSimMode}
      userEmail={userEmail}
    />
  );
}
