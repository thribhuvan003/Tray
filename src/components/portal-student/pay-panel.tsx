"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import Link from "next/link";
import Script from "next/script";
import { ArrowLeft, Loader2, Smartphone, Sparkles, X as XIcon } from "lucide-react";
import { toast } from "sonner";
import { formatRupees, cn } from "@/lib/utils";
import { upiQrPayload } from "@/lib/payments/upi";
import { simulatePaymentCapture, verifyPaymentNow } from "@/app/(student)/_actions";
import { getBrowserClient } from "@/lib/supabase/browser";

type Order = {
  id: string;
  short_code: string;
  total_paise: number;
  status: string;
  payment_expires_at: string | null;
  customer_name: string | null;
};
type Line = {
  id: string;
  name_snapshot: string;
  qty: number;
  price_paise_snapshot: number;
  diet_snapshot: "veg" | "nonveg" | "egg";
};

export function PayPanel({
  tenantSlug,
  tenantName,
  tenantUpi,
  order,
  lines,
  razorpayKeyId,
  razorpayOrderId,
  isSimMode = false,
}: {
  tenantSlug: string;
  tenantName: string;
  tenantUpi: string;
  order: Order;
  lines: Line[];
  razorpayKeyId: string;
  razorpayOrderId: string | null;
  isSimMode?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [verifying, startVerify] = useTransition();
  const [stillWaiting, setStillWaiting] = useState(false);
  const [remaining, setRemaining] = useState(() => {
    if (!order.payment_expires_at) return 900;
    return Math.max(0, Math.floor((new Date(order.payment_expires_at).getTime() - Date.now()) / 1000));
  });
  const [demoDismissed, setDemoDismissed] = useState(false);
  const [isPayingMobile, setIsPayingMobile] = useState(false);
  const [mobileVerifyingText, setMobileVerifyingText] = useState("Paying via UPI...");

  useEffect(() => {
    if (!order.payment_expires_at) return;
    const expiry = new Date(order.payment_expires_at).getTime();
    const tick = () => setRemaining(Math.max(0, Math.floor((expiry - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [order.payment_expires_at]);

  useEffect(() => {
    const sb = getBrowserClient();
    const channel = sb
      .channel(`order:${order.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${order.id}` },
        (payload) => {
          const next = (payload.new as { status: string }).status;
          if (next === "placed" || next === "preparing" || next === "ready") {
            router.push(`/c/${tenantSlug}/track/${order.id}`);
          }
        }
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, [order.id, router, tenantSlug]);

  useEffect(() => {
    const id = setInterval(async () => {
      const sb = getBrowserClient();
      const { data } = await sb
        .from("orders")
        .select("status")
        .eq("id", order.id)
        .maybeSingle<{ status: string }>();
      if (data && data.status !== "pending_payment") {
        router.push(`/c/${tenantSlug}/track/${order.id}`);
      }
    }, 4000);
    return () => clearInterval(id);
  }, [order.id, router, tenantSlug]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const expired = remaining === 0 && order.payment_expires_at;

  const upiUri = upiQrPayload({
    vpa: tenantUpi,
    name: tenantName,
    amountPaise: order.total_paise,
    note: order.short_code,
  });

  const onSimulate = () =>
    start(async () => {
      const r = await simulatePaymentCapture(order.id);
      if (!r.ok) toast.error(r.error ?? "Could not simulate payment");
      else {
        toast.success("Payment captured");
        router.push(`/c/${tenantSlug}/track/${order.id}`);
      }
    });

  const onIvePaid = () =>
    startVerify(async () => {
      setStillWaiting(false);
      // Show a brief "Confirming…" state before the server round-trip resolves
      await new Promise((r) => setTimeout(r, 700));
      const r = await verifyPaymentNow(order.id);
      if (r.status === "paid") {
        toast.success("Order placed — kitchen has it!");
        router.push(`/c/${tenantSlug}/track/${order.id}`);
      } else if (r.status === "failed") {
        toast.error("Payment failed — try the QR again");
      } else {
        setStillWaiting(true);
      }
    });

  const handleMobilePay = () => {
    setIsPayingMobile(true);
    setMobileVerifyingText("Paying via UPI...");
    
    // Deep-link to UPI app
    window.location.href = upiUri;
    
    // Start automated loading transition
    setTimeout(() => {
      setMobileVerifyingText("Verifying payment...");
      onIvePaid();
    }, 1500);
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPay = async () => {
    toast.loading("Starting secure payment...", { id: "rzp-init" });
    const loaded = await loadRazorpay();
    toast.dismiss("rzp-init");

    if (!loaded || typeof window === "undefined" || !(window as any).Razorpay) {
      toast.error("Failed to load payment gateway. Please check your connection.");
      return;
    }

    if (!razorpayOrderId) {
      toast.error("Payment ID missing. Please refresh and try again.");
      return;
    }

    const options = {
      key: razorpayKeyId,
      amount: order.total_paise,
      currency: "INR",
      name: tenantName,
      description: `Order ${order.short_code}`,
      order_id: razorpayOrderId,
      handler: async function (response: any) {
        toast.success("Payment authorized! Confirming order...");
        onIvePaid();
      },
      prefill: {
        name: order.customer_name ?? "Student",
        email: "student@canteen.edu",
        contact: "9999999999",
      },
      theme: {
        color: "#0f172a",
      },
      config: {
        display: {
          blocks: {
            upi: {
              name: "UPI / Google Pay / PhonePe",
              instruments: [
                {
                  method: "upi",
                },
              ],
            },
          },
          sequence: ["block.upi"],
          preferences: {
            show_default_blocks: true,
          },
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    
    rzp.on("payment.failed", function (response: any) {
      console.error("Payment failed", response.error);
      toast.error("Payment failed: " + (response.error.description || "Please try again"));
    });

    rzp.open();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-6 pb-12 pb-[max(3rem,env(safe-area-inset-bottom))]">
      <Link
        href={`/c/${tenantSlug}/menu`}
        className="inline-flex items-center gap-1.5 text-[13px] text-[color:var(--color-ink)]/60 hover:text-ocean-500 mb-4"
      >
        <ArrowLeft size={14} /> Back to menu
      </Link>

      {isSimMode && !demoDismissed && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30 px-4 py-2.5">
          <p className="text-[12.5px] text-amber-800 dark:text-amber-300 leading-snug">
            <span className="font-semibold">Demo mode</span> — scan the QR with any UPI app, then tap &ldquo;I&rsquo;ve paid&rdquo; to send your order to the kitchen.
          </p>
          <button
            aria-label="Dismiss demo banner"
            onClick={() => setDemoDismissed(true)}
            className="shrink-0 text-amber-600 hover:text-amber-800 dark:text-amber-400 transition-colors"
          >
            <XIcon size={14} />
          </button>
        </div>
      )}

      <div className="mb-8 text-center">
        <h1 className="font-display text-[clamp(32px,5vw,42px)] font-medium tracking-tight leading-tight mb-2">
          Pay by <span className="italic text-ocean-500">UPI.</span>
        </h1>
        <p className="text-[14.5px] text-[color:var(--color-ink)]/60">
          Verify your order details and pay securely
        </p>
      </div>

      <div className="mx-auto max-w-md rounded-[24px] bg-[color:var(--color-paper)] border border-[color:var(--color-line)] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        {isSimMode ? (
          <div className="flex flex-col items-center">
            {/* Beautifully Framed QR Code - Permanently Visible on all screen sizes */}
            <div className="p-4 bg-white rounded-2xl border border-[color:var(--color-line)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all hover:scale-[1.01] mb-6">
              <QRCode value={upiUri} size={190} bgColor="#ffffff" fgColor="#1A1A19" style={{ display: 'block' }} />
            </div>

            <div className="border-t border-[color:var(--color-line)] w-full my-6" />

            <div className="w-full space-y-4 text-[14.5px]">
              <div className="flex justify-between items-center">
                <span className="text-[color:var(--color-ink)]/60">Order ID</span>
                <span className="font-semibold text-[color:var(--color-ink)] font-mono">Order {order.short_code}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[color:var(--color-ink)]/60">Items</span>
                <span className="text-[color:var(--color-ink)] font-medium">{lines.reduce((s, l) => s + l.qty, 0)} items</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[color:var(--color-ink)]/60">Amount</span>
                <span className="font-bold text-[color:var(--color-ink)] text-lg">{formatRupees(order.total_paise)}</span>
              </div>
            </div>

            <div className="border-t border-[color:var(--color-line)] w-full my-6" />

            {/* Mobile Only: Pay Now button */}
            <button
              onClick={handleMobilePay}
              className="md:hidden w-full h-12 text-[15px] inline-flex items-center justify-center gap-2 rounded-xl bg-ocean-500 text-black font-bold hover:bg-ocean-600 transition-all shadow-lg active:scale-[0.98] shadow-ocean-500/10 mb-2"
            >
              <Smartphone size={16} /> Pay Now
            </button>

            {/* Desktop/Tablet Only: "I've Paid" confirm button */}
            <button
              onClick={onIvePaid}
              disabled={verifying || Boolean(expired)}
              className="hidden md:inline-flex w-full h-12 text-[15px] items-center justify-center gap-2 rounded-xl bg-ocean-500 text-black font-bold hover:bg-ocean-600 disabled:opacity-50 transition-all active:scale-[0.98] mb-2"
            >
              {verifying ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Confirming…
                </>
              ) : (
                <>I&rsquo;ve paid &mdash; confirm my order</>
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-ocean-500/10 text-ocean-500 rounded-full flex items-center justify-center mb-5 animate-pulse">
              <Sparkles size={32} />
            </div>
            
            <h3 className="font-display text-[22px] font-medium tracking-tight mb-2">
              Secure Live <span className="it">Payment</span>
            </h3>
            
            <p className="text-[12.5px] text-[color:var(--color-ink)]/60 max-w-[240px] mb-6 leading-normal">
              Pay using UPI, Google Pay, PhonePe, Cards, or Netbanking securely processed by Razorpay.
            </p>

            <div className="border-t border-[color:var(--color-line)] w-full my-6" />

            <div className="w-full space-y-4 text-[14.5px] text-left mb-6">
              <div className="flex justify-between items-center">
                <span className="text-[color:var(--color-ink)]/60">Order ID</span>
                <span className="font-semibold text-[color:var(--color-ink)] font-mono">Order {order.short_code}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[color:var(--color-ink)]/60">Items</span>
                <span className="text-[color:var(--color-ink)] font-medium">{lines.reduce((s, l) => s + l.qty, 0)} items</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[color:var(--color-ink)]/60">Amount</span>
                <span className="font-bold text-[color:var(--color-ink)] text-lg">{formatRupees(order.total_paise)}</span>
              </div>
            </div>

            <button
              onClick={handleRazorpayPay}
              className="w-full h-12 text-[14.5px] inline-flex items-center justify-center gap-2 rounded-xl bg-ocean-500 text-black font-bold hover:bg-ocean-600 transition-all shadow-lg active:scale-[0.98] shadow-ocean-500/10 mb-2"
            >
              <Smartphone size={16} /> Pay Securely Now
            </button>
            
            <p className="mt-3 text-[11px] opacity-50">
              Authorized signature webhook confirmation active.
            </p>
          </div>
        )}

        {/* Status / Expiry details */}
        <div className="mt-4 text-center">
          <div className="flex items-center justify-between text-xs text-[color:var(--color-ink)]/55 bg-[color:var(--color-paper-dim)] rounded-xl p-3 border border-[color:var(--color-line)]">
            <span>Payment window expires in:</span>
            <span className={cn("font-mono font-semibold text-sm tabular", expired ? "text-rose-500" : remaining < 60 ? "text-amber-600" : "text-[color:var(--color-ink)]")}>
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </span>
          </div>

          {expired ? (
            <p className="mt-2 text-xs text-rose-500">
              Payment window closed. <Link href={`/c/${tenantSlug}/menu`} className="underline">Start a new order</Link>.
            </p>
          ) : (
            <p className="mt-2 text-[11px] text-[color:var(--color-ink)]/45">
              Please pay within 15 min or the order will cancel automatically.
            </p>
          )}
        </div>

        {stillWaiting && !verifying && (
          <p className="text-[12px] text-amber-600 text-center mt-3 leading-normal">
            Still confirming your payment — UPI can take 30–60 seconds. Keep this page open.
          </p>
        )}

        {isSimMode && (
          <div className="mt-6 pt-6 border-t border-dashed border-[color:var(--color-line)] flex flex-col gap-2">
            <button
              onClick={onSimulate}
              disabled={pending}
              className="inline-flex items-center justify-center gap-2 h-11 rounded-xl border border-dashed border-ocean-600/40 text-ocean-900 text-[13px] font-medium hover:bg-ocean-50 dark:hover:bg-ocean-500/10 transition-colors"
            >
              <Sparkles size={14} /> DEV · simulate paid
            </button>
            <p className="text-[11px] text-[color:var(--color-ink)]/45 text-center leading-normal">
              Dev-only shortcut — flips the order to <b>placed</b> without a real payment.
            </p>
          </div>
        )}
      </div>


      {/* Dynamic UPI payment loader overlay on mobile */}
      {isPayingMobile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white animate-in fade-in duration-200">
          <div className="bg-[color:var(--color-paper)] dark:bg-zinc-900 border border-[color:var(--color-line)] rounded-2xl p-8 max-w-sm w-full text-center flex flex-col items-center gap-6 shadow-2xl">
            <div className="relative">
              <Loader2 size={48} className="animate-spin text-ocean-500" />
              <Sparkles size={16} className="absolute -top-1 -right-1 text-amber-500 animate-pulse" />
            </div>
            
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-bold text-[color:var(--color-ink)]">
                {mobileVerifyingText}
              </h3>
              <p className="text-xs text-[color:var(--color-ink)]/60 leading-relaxed">
                UPI transactions can take a few seconds to sync. Please do not close or refresh this page.
              </p>
            </div>

            <button
              onClick={() => setIsPayingMobile(false)}
              className="mt-2 text-xs font-semibold text-ocean-500 hover:text-ocean-600 underline transition-colors"
            >
              Cancel and try again
            </button>
          </div>
        </div>
      )}

      {/* Razorpay script is injected dynamically on click */}
    </div>
  );
}
