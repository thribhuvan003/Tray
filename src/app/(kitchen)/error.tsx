"use client";

import { useEffect } from "react";

export default function KitchenError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[tray:kitchen:error]", error.digest ?? error.message);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--kt-paper, #fffaf0)", color: "var(--kt-ink, #2a160a)" }}
    >
      <div
        className="w-full max-w-md"
        style={{
          border: "2px solid var(--kt-tomato, #d52821)",
          borderRadius: "10px",
          padding: "28px 28px 24px",
          background: "var(--kt-cream-4, #fdf5dc)",
          boxShadow: "6px 6px 0 0 var(--kt-tomato, #d52821)",
        }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-[0.18em] mb-4"
          style={{ fontFamily: "var(--font-jetbrains, monospace)", color: "var(--kt-tomato, #d52821)" }}
        >
          Queue Error
        </p>

        <h1
          style={{
            fontFamily: "var(--font-newsreader, serif)",
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: "12px",
          }}
        >
          Queue is jammed.
        </h1>

        <p
          style={{
            fontFamily: "var(--font-jetbrains, monospace)",
            fontSize: "12px",
            color: "var(--kt-ink-2, #5c3e26)",
            lineHeight: 1.6,
            marginBottom: "20px",
          }}
        >
          {error.message
            ? `Error: ${error.message}`
            : "An unexpected error occurred on the kitchen board. Your orders are safe — reload to reconnect."}
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={reset}
            style={{
              height: "48px",
              minHeight: "48px",
              borderRadius: "7px",
              background: "var(--kt-tomato, #d52821)",
              color: "#fff",
              fontFamily: "var(--font-jetbrains, monospace)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              border: "none",
            }}
          >
            Reload live queue
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              height: "44px",
              borderRadius: "7px",
              background: "transparent",
              color: "var(--kt-ink-3, #8c6f4c)",
              fontFamily: "var(--font-jetbrains, monospace)",
              fontSize: "11px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
              border: "1px solid var(--kt-line-2, rgba(42,22,10,0.20))",
            }}
          >
            Hard reload page
          </button>
        </div>

        {error.digest && (
          <p
            className="mt-5 text-[9px] font-mono opacity-40"
            style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
          >
            Ref: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
