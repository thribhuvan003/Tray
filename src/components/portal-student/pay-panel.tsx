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
}: {
  tenantSlug: string;
  tenantName: string;
  tenantUpi: string;
  order: Order;
  lines: Line[];
  razorpayKeyId: string;
  razorpayOrderId: string | null;
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
  const isSimMode = !process.env.NEXT_PUBLIC_RAZORPAY_LIVE;
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

  const handleRazorpayPay = () => {
    if (typeof window === "undefined" || !(window as any).Razorpay) {
      toast.error("Payment portal is initializing. Please try again in a moment.");
      return;
    }

    if (!razorpayOrderId) {
      toast.error("Razorpay order ID is missing. Please contact support.");
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

      <div className="mb-6">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/55">
          Order {order.short_code}
        </div>
        <h1 className="font-display text-[clamp(28px,5vw,42px)] font-medium tracking-tight leading-tight">
          Pay <span className="italic text-ocean-500">{formatRupees(order.total_paise)}</span> by <span className="it">UPI.</span>
        </h1>
      </div>

      <div className="grid md:grid-cols-[1.1fr_1fr] gap-5">
        <div className="rounded-2xl bg-[color:var(--color-paper)] border border-[color:var(--color-line)] p-6 flex flex-col items-center text-center justify-center">
          {isSimMode ? (
            <>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/55 mb-4">
                Scan QR to pay
              </div>
              
              {/* Beautifully Framed QR Code - Permanently Visible on all screen sizes */}
              <div className="p-4 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04),inset_0_0_0_1px_rgba(26,26,25,0.06)] transition-all hover:scale-[1.02]">
                <QRCode value={upiUri} size={190} bgColor="#ffffff" fgColor="#1A1A19" style={{ display: 'block' }} />
              </div>

              {/* Mobile Only: Big "Pay Now" Button directly below the QR code */}
              <button
                onClick={handleMobilePay}
                className="md:hidden mt-6 w-full h-12 text-[15px] inline-flex items-center justify-center gap-2 rounded-xl bg-ocean-500 text-black font-bold hover:bg-ocean-600 transition-colors shadow-lg shadow-ocean-500/10"
              >
                <Smartphone size={16} /> Pay Now
              </button>
              
              <p className="md:hidden mt-2 text-[11px] text-center opacity-60">
                Redirects directly to GPay, PhonePe, or any UPI app
              </p>

              <div className="mt-5 text-[12.5px] text-[color:var(--color-ink)]/55">
                Paying <span className="font-semibold text-[color:var(--color-ink)]">{tenantName}</span>
                <div className="font-mono text-[11px] mt-0.5 opacity-85">{tenantUpi}</div>
              </div>
            </>
          ) : (
            <div className="w-full flex flex-col items-center py-6 px-2">
              <div className="h-16 w-16 bg-ocean-500/10 text-ocean-500 rounded-full flex items-center justify-center mb-5 animate-pulse">
                <Sparkles size={32} />
              </div>
              
              <h3 className="font-display text-[22px] font-medium tracking-tight mb-2">
                Secure Live <span className="it">Payment</span>
              </h3>
              
              <p className="text-[12.5px] text-[color:var(--color-ink)]/60 max-w-[240px] mb-8 leading-normal">
                Pay using UPI, Google Pay, PhonePe, Cards, or Netbanking securely processed by Razorpay.
              </p>

              <button
                onClick={handleRazorpayPay}
                className="w-full h-12 text-[14px] inline-flex items-center justify-center gap-2 rounded-xl bg-ocean-500 text-black font-bold hover:bg-ocean-600 transition-all shadow-lg active:scale-[0.98] shadow-ocean-500/10"
              >
                <Smartphone size={16} /> Pay Securely Now
              </button>
              
              <p className="mt-3 text-[11px] text-center opacity-50">
                Authorized signature webhook confirmation active.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-[color:var(--color-paper-dim)] border border-[color:var(--color-line)] p-5">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/55">
                Time to pay
              </div>
              <div
                className={cn(
                  "font-mono text-[20px] font-semibold tabular",
                  expired ? "text-rose-500" : remaining < 60 ? "text-amber-600" : "text-[color:var(--color-ink)]"
                )}
              >
                {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
              </div>
            </div>
            {expired ? (
              <p className="mt-2 text-[12.5px] text-rose-500">
                Payment window closed. <Link href={`/c/${tenantSlug}/menu`} className="underline">Start a new order</Link>.
              </p>
            ) : (
              <p className="mt-2 text-[12.5px] text-[color:var(--color-ink)]/55">
                You have 15 min to pay — after that, we&rsquo;ll cancel and refund automatically.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[color:var(--color-line)] p-5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/55 mb-3">
              Order summary
            </div>
            <ul className="flex flex-col gap-2">
              {lines.map((l) => (
                <li key={l.id} className="flex items-center gap-3 text-[14px]">
                  <span
                    className={cn(
                      "h-3.5 w-3.5 inline-flex items-center justify-center border-2 rounded-sm",
                      l.diet_snapshot === "veg"
                        ? "border-emerald-500"
                        : l.diet_snapshot === "egg"
                        ? "border-amber-500"
                        : "border-rose-500"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        l.diet_snapshot === "veg"
                          ? "bg-emerald-500"
                          : l.diet_snapshot === "egg"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      )}
                    />
                  </span>
                  <span className="flex-1 min-w-0 truncate">
                    {l.qty} × {l.name_snapshot}
                  </span>
                  <span className="tabular text-[color:var(--color-ink)]/70">
                    {formatRupees(l.qty * l.price_paise_snapshot)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-[color:var(--color-line)] flex justify-between items-baseline">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/50" style={{ fontFamily: "var(--font-barlow, var(--font-manrope))" }}>Total</span>
              <span className="text-[32px] leading-none tabular text-ocean-600 dark:text-ocean-400" style={{ fontFamily: "var(--font-bebas, Impact, sans-serif)" }}>
                {formatRupees(order.total_paise)}
              </span>
            </div>
          </div>

          {/* Desktop Only: "I've Paid" or "Verify Status" Button */}
          <button
            onClick={onIvePaid}
            disabled={verifying || Boolean(expired)}
            className="hidden md:inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-ocean-500 text-black text-[14px] font-semibold hover:bg-ocean-600 disabled:opacity-50 transition-colors"
          >
            {verifying ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Confirming…
              </>
            ) : isSimMode ? (
              <>I&rsquo;ve paid &mdash; confirm my order</>
            ) : (
              <>Verify payment status</>
            )}
          </button>
          
          {stillWaiting && !verifying && (
            <p className="text-[12.5px] text-amber-600 text-center -mt-2">
              Still confirming your payment — UPI can take 30–60 seconds. Keep this page open.
            </p>
          )}

          {isSimMode && (
            <>
              <button
                onClick={onSimulate}
                disabled={pending}
                className="inline-flex items-center justify-center gap-2 h-11 rounded-xl border border-dashed border-ocean-600/40 text-ocean-900 text-[13px] font-medium hover:bg-ocean-50 dark:hover:bg-ocean-500/10 transition-colors"
              >
                <Sparkles size={14} /> DEV · simulate paid
              </button>
              <p className="text-[11px] text-[color:var(--color-ink)]/45 text-center -mt-2">
                Dev-only shortcut — flips the order to <b>placed</b> without a real payment.
              </p>
            </>
          )}
        </div>
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

      {/* Razorpay Standard Checkout SDK */}
      {!isSimMode && (
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      )}
    </div>
  );
}
