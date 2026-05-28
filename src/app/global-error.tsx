"use client";

import { useEffect } from "react";
import Link from "next/link";

// global-error.tsx catches unhandled errors in the root layout itself.
// It must include its own <html> and <body> tags.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[tray:global]", error.digest, error.message);
    // Sentry is already wired via logger.error in logging.ts,
    // but capture here too since this catches errors outside Server Components.
    import("@sentry/nextjs").then(({ captureException }) => {
      captureException(error);
    }).catch(() => {});
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
          background: "#F4EFE6",
          color: "#1A1A19",
        }}
      >
        <div style={{ maxWidth: "440px", width: "100%" }}>
          <p
            style={{
              fontFamily: "var(--font-dm-mono, monospace)",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#e60000",
              marginBottom: "20px",
            }}
          >
            Critical error
          </p>

          <h1
            style={{
              fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(2rem, 6vw, 3rem)",
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Something{" "}
            <span
              style={{
                fontFamily: "'Fraunces', serif",
                fontStyle: "italic",
                textTransform: "none",
                fontWeight: 400,
                color: "#e60000",
              }}
            >
              broke.
            </span>
          </h1>

          <p
            style={{ fontSize: "13.5px", lineHeight: 1.65, opacity: 0.55, marginBottom: "28px" }}
          >
            A critical error occurred. Your orders and payment data are safe.
            Try reloading the page.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              onClick={reset}
              style={{
                height: "48px",
                borderRadius: "14px",
                border: "none",
                background: "#1A1A19",
                color: "#F4EFE6",
                fontSize: "13.5px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.85"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
            >
              Try again
            </button>
            <Link
              href="/"
              style={{
                height: "48px",
                borderRadius: "14px",
                border: "1px solid rgba(26,26,25,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13.5px",
                fontWeight: 500,
                color: "#1A1A19",
                textDecoration: "none",
                transition: "opacity 0.15s",
              }}
            >
              Back to home
            </Link>
          </div>

          {error.digest && (
            <p
              style={{
                marginTop: "20px",
                fontFamily: "monospace",
                fontSize: "10px",
                opacity: 0.35,
                textAlign: "center",
              }}
            >
              Error ref: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
