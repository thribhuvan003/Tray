"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import Link from "next/link";
import { toast } from "sonner";
import { formatRupees } from "@/lib/utils";
import { upiQrPayload } from "@/lib/payments/upi";
import { simulatePaymentCapture } from "@/app/(student)/_actions";
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
  tenantName,
  tenantUpi,
  order,
  lines,
}: {
  tenantName: string;
  tenantUpi: string;
  order: Order;
  lines: Line[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [remaining, setRemaining] = useState(0);

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
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${order.id}` }, (payload) => {
        const next = (payload.new as { status: string }).status;
        if (next !== "pending_payment") router.push(`/track/${order.id}`);
      })
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, [order.id, router]);

  const upiUri = upiQrPayload({
    vpa: tenantUpi,
    name: tenantName,
    amountPaise: order.total_paise,
    note: order.short_code,
  });

  const onSimulate = () =>
    start(async () => {
      const r = await simulatePaymentCapture(order.id);
      if (!r.ok) toast.error(r.error ?? "Could not verify payment");
      else {
        toast.success("Payment confirmed");
        window.dispatchEvent(
          new CustomEvent("tray:burst", {
            detail: { x: window.innerWidth / 2, y: window.innerHeight * 0.42 },
          })
        );
        window.setTimeout(() => router.push(`/track/${order.id}`), 420);
      }
    });

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className="pay-wrap">
      <div style={{ textAlign: "center" }}>
        <span className="chip chip-accent">Payment - Step 03 of 04</span>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px,5vw,64px)", lineHeight: 1, letterSpacing: "-0.02em", marginTop: 16, fontWeight: 400 }}>
          Pay by UPI
        </h1>
        <p style={{ color: "var(--ink-3)", marginTop: 8 }}>Scan with any UPI app. We&apos;ll confirm automatically.</p>
      </div>

      <div className="pay-card" id="pay-card">
        <div className="qr-frame">
          <QRCode value={upiUri} size={216} bgColor="#ffffff" fgColor="#0B1220" />
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 48, lineHeight: 1, margin: "16px 0 4px", letterSpacing: "-0.02em" }}>
          {formatRupees(order.total_paise)}
        </div>
        <div style={{ color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Order #{order.short_code}
        </div>
        <div className="upi-row" style={{ marginTop: 24 }}>
          <span>{tenantUpi}</span>
          <button className="btn btn-sm" onClick={() => navigator.clipboard?.writeText(tenantUpi).then(() => toast.success("UPI ID copied"))}>
            Copy ID
          </button>
        </div>
        <button className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 16 }} onClick={onSimulate} disabled={pending}>
          {pending ? "Verifying..." : "I've paid - Verify"}
        </button>
        <p style={{ color: "var(--ink-4)", fontSize: 12, marginTop: 12 }}>
          Single-use QR expires in {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}.
        </p>
      </div>

      <div className="surface" style={{ padding: 16 }}>
        <div className="eyebrow">Order summary</div>
        <div className="col gap-2" style={{ marginTop: 12 }}>
          {lines.map((line) => (
            <div className="row between" key={line.id}>
              <span>{line.qty} x {line.name_snapshot}</span>
              <span className="mono">{formatRupees(line.qty * line.price_paise_snapshot)}</span>
            </div>
          ))}
        </div>
      </div>

      <Link href="/menu" className="btn btn-ghost" style={{ alignSelf: "center" }}>
        Back to menu
      </Link>
    </div>
  );
}
