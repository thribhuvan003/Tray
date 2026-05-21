"use client";

import { useState } from "react";

export function ShareQR({ portalUrl }: { portalUrl: string }) {
  const [open, setOpen] = useState(false);
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(portalUrl)}`;

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          height: 36,
          padding: "0 14px",
          borderRadius: 8,
          border: "1px solid rgba(196,168,130,0.35)",
          background: "rgba(196,168,130,0.07)",
          color: "rgba(232,228,220,0.72)",
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          cursor: "pointer",
          transition: "border-color 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(196,168,130,0.65)";
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(232,228,220,1)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(196,168,130,0.35)";
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(232,228,220,0.72)";
        }}
      >
        {/* QR icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <path d="M14 14h1v1h-1zM17 14h3v1h-3zM14 17h1v3h-1zM17 17h3v1h-3zM17 20h3v1h-3z" fill="currentColor" stroke="none" />
        </svg>
        {open ? "Close QR" : "Share QR"}
      </button>

      {open && (
        <div
          style={{
            marginTop: 12,
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            padding: "16px 16px 12px",
            borderRadius: 14,
            background: "#ffffff",
            boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrSrc}
            alt={`QR code for ${portalUrl}`}
            width={200}
            height={200}
            style={{ display: "block", borderRadius: 4 }}
          />
          <p
            style={{
              fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
              fontSize: 10,
              letterSpacing: "0.06em",
              color: "#555",
              margin: 0,
              maxWidth: 200,
              textAlign: "center",
              wordBreak: "break-all",
            }}
          >
            {portalUrl}
          </p>
          <a
            href={qrSrc}
            download="tray-college-qr.png"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 30,
              padding: "0 12px",
              borderRadius: 6,
              background: "#1a2548",
              color: "rgba(232,228,220,0.85)",
              fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            Download PNG
          </a>
        </div>
      )}
    </>
  );
}
