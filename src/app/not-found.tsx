"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CSS_404 = `
.tray-404 {
  background: #fef9ef;
  color: #0a1628;
  font-family: var(--font-geist), ui-sans-serif, system-ui;
  -webkit-font-smoothing: antialiased;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
  overflow: hidden;
  position: relative;
}

.tray-404::before {
  content: "";
  position: fixed;
  inset: -30%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: .03;
  pointer-events: none;
  z-index: 0;
}

.tray-404-inner {
  max-width: 400px;
  width: 100%;
  text-align: center;
  position: relative;
  z-index: 2;
}

/* ── 404 digits ── */
.tray-404-digits {
  font-family: var(--font-fraunces), ui-serif, Georgia;
  font-weight: 900;
  font-size: clamp(88px, 24vw, 180px);
  line-height: 0.88;
  letter-spacing: -0.05em;
  color: #0a1628;
  margin-bottom: 12px;
  user-select: none;
}

/* ── Metadata bar ── */
.tray-404-meta {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: rgba(10, 22, 40, 0.40);
  margin-bottom: 28px;
  font-weight: 500;
}
.tray-404-meta .clay { color: #c4622e; }

/* ── Receipt card ── */
@keyframes tray404ReceiptFall {
  0%   { opacity: 0; transform: translateY(-28px) rotate(-1.5deg); }
  100% { opacity: 1; transform: translateY(0px) rotate(0deg); }
}

.tray-404-receipt {
  background: #fffef8;
  border: 1px solid rgba(10, 22, 40, 0.12);
  border-radius: 14px;
  padding: 18px 20px 20px;
  text-align: left;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 11.5px;
  margin-bottom: 24px;
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(10, 22, 40, 0.04),
    0 8px 32px rgba(0, 0, 0, 0.04);
  animation: tray404ReceiptFall 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.15s both;
}

.tray-404-receipt-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px dashed rgba(10, 22, 40, 0.14);
}
.tray-404-receipt-title {
  font-family: var(--font-fraunces), ui-serif, Georgia;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: #0a1628;
}
.tray-404-receipt-num {
  font-size: 10px;
  letter-spacing: 0.12em;
  color: rgba(10, 22, 40, 0.38);
  text-transform: uppercase;
  text-align: right;
}

.tray-404-receipt-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3.5px 0;
  gap: 12px;
}
.tray-404-receipt-key {
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(10, 22, 40, 0.38);
  white-space: nowrap;
}
.tray-404-receipt-val {
  color: #0a1628;
  font-weight: 500;
  font-size: 11.5px;
  text-align: right;
}

.tray-404-status-chip {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 5px;
  background: rgba(196, 98, 46, 0.12);
  color: #c4622e;
  white-space: nowrap;
  transition: all 0.4s ease;
}
.tray-404-status-chip.is-searching {
  background: rgba(10, 22, 40, 0.06);
  color: rgba(10, 22, 40, 0.45);
}

.tray-404-otp-section {
  border-top: 1px dashed rgba(10, 22, 40, 0.14);
  margin-top: 14px;
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.tray-404-otp-label {
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(10, 22, 40, 0.38);
}
.tray-404-otp-digits {
  display: flex;
  gap: 6px;
  justify-content: center;
}
.tray-404-otp-digit {
  width: 44px;
  height: 52px;
  background: rgba(10, 22, 40, 0.05);
  border: 1px solid rgba(10, 22, 40, 0.12);
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-fraunces), ui-serif, Georgia;
  font-weight: 900;
  font-size: 28px;
  color: #0a1628;
  letter-spacing: -0.03em;
}

/* ── Receipt total strip ── */
.tray-404-receipt-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0 0;
  margin-top: 12px;
  border-top: 1px dashed rgba(10, 22, 40, 0.14);
}
.tray-404-receipt-total .tray-404-receipt-key {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgba(10, 22, 40, 0.55);
}
.tray-404-receipt-total .tray-404-receipt-val {
  font-size: 14px;
  font-weight: 700;
  color: #c4622e;
}

/* ── Headline + subtext ── */
.tray-404-headline {
  font-family: var(--font-fraunces), ui-serif, Georgia;
  font-size: clamp(22px, 5vw, 28px);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: #0a1628;
  margin-bottom: 8px;
}

.tray-404-sub {
  font-size: 14px;
  color: rgba(10, 22, 40, 0.58);
  line-height: 1.6;
  margin-bottom: 24px;
  max-width: 38ch;
  margin-left: auto;
  margin-right: auto;
}

/* ── Buttons ── */
@keyframes tray404BtnUp {
  0%   { opacity: 0; transform: translateY(14px); }
  100% { opacity: 1; transform: translateY(0); }
}

.tray-404-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  animation: tray404BtnUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) 0.65s both;
}

.tray-404-btn-pri {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 11px 22px;
  border-radius: 999px;
  background: #0a1628;
  color: #fef9ef;
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-geist), ui-sans-serif;
  transition: background 0.15s, transform 0.12s;
  text-decoration: none;
  border: none;
  cursor: pointer;
}
.tray-404-btn-pri:hover { background: #1e2d44; transform: translateY(-1px); }

.tray-404-btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 11px 22px;
  border-radius: 999px;
  background: transparent;
  border: 1px solid rgba(10, 22, 40, 0.18);
  color: #0a1628;
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-geist), ui-sans-serif;
  transition: border-color 0.15s, transform 0.12s;
  text-decoration: none;
  cursor: pointer;
}
.tray-404-btn-ghost:hover { border-color: rgba(10, 22, 40, 0.4); transform: translateY(-1px); }

/* ── 404 digit scramble animation ── */
@keyframes tray404DigitSettle {
  0%   { filter: blur(8px); letter-spacing: 0.1em; opacity: 0.4; }
  60%  { filter: blur(2px); letter-spacing: -0.03em; opacity: 0.85; }
  100% { filter: blur(0px); letter-spacing: -0.05em; opacity: 1; }
}

.tray-404-digits {
  animation: tray404DigitSettle 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) 0s both;
}

@media (prefers-reduced-motion: reduce) {
  .tray-404-receipt,
  .tray-404-actions,
  .tray-404-digits { animation: none !important; opacity: 1; transform: none; filter: none; }
}
`;

export default function NotFound() {
  const [status, setStatus] = useState<"searching" | "not-found">("searching");

  useEffect(() => {
    const id = setTimeout(() => setStatus("not-found"), 900);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="tray-404">
      <style dangerouslySetInnerHTML={{ __html: CSS_404 }} />

      <div className="tray-404-inner">
        {/* Big 404 */}
        <div className="tray-404-digits" aria-label="404">
          404
        </div>

        {/* Metadata */}
        <div className="tray-404-meta">
          <span className="clay">ERROR</span> · 404 · COUNTER CLOSED
        </div>

        {/* Receipt card */}
        <div className="tray-404-receipt" role="region" aria-label="Order receipt">
          <div className="tray-404-receipt-header">
            <div className="tray-404-receipt-title">Order not found.</div>
            <div className="tray-404-receipt-num">
              ORDER<br />#404
            </div>
          </div>

          <div className="tray-404-receipt-row">
            <span className="tray-404-receipt-key">Status</span>
            <span
              className={`tray-404-status-chip ${status === "searching" ? "is-searching" : ""}`}
            >
              {status === "searching" ? "Searching…" : "Missing"}
            </span>
          </div>
          <div className="tray-404-receipt-row">
            <span className="tray-404-receipt-key">Counter</span>
            <span className="tray-404-receipt-val">Closed</span>
          </div>
          <div className="tray-404-receipt-row">
            <span className="tray-404-receipt-key">Route</span>
            <span className="tray-404-receipt-val">Not found</span>
          </div>

          <div className="tray-404-otp-section">
            <span className="tray-404-otp-label">OTP</span>
            <div className="tray-404-otp-digits" aria-label="OTP 404">
              {["4", "0", "4"].map((d, i) => (
                <div key={i} className="tray-404-otp-digit">{d}</div>
              ))}
            </div>
          </div>

          <div className="tray-404-receipt-total">
            <span className="tray-404-receipt-key">Total</span>
            <span className="tray-404-receipt-val">₹0</span>
          </div>
        </div>

        {/* Copy */}
        <h1 className="tray-404-headline">Order not found.</h1>
        <p className="tray-404-sub">
          This counter does not exist, or the order was already picked up.
        </p>

        {/* Actions */}
        <div className="tray-404-actions">
          <Link href="/" className="tray-404-btn-pri">
            ← Back to Tray
          </Link>
          <a href="#try-demo" className="tray-404-btn-ghost">
            Open live demo
          </a>
        </div>
      </div>
    </div>
  );
}
