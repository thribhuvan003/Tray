"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function StudentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Student portal error]", error.digest ?? error.message);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-16"
      style={{
        background:
          "radial-gradient(circle at 10% 10%, rgba(230,0,0,0.06), transparent 40%), var(--color-paper, #F4EFE6)",
        color: "var(--color-ink, #1A1A19)",
      }}
    >
      <div className="w-full max-w-md">
        <p
          className="text-[0.68rem] font-bold uppercase tracking-[0.28em] mb-5"
          style={{ fontFamily: "var(--font-dm-mono)", color: "var(--color-ocean-500, #e60000)" }}
        >
          Something broke
        </p>

        <h1
          className="leading-[0.9] tracking-[-0.04em] uppercase mb-4"
          style={{
            fontFamily: "var(--font-barlow, var(--font-bricolage))",
            fontWeight: 900,
            fontSize: "clamp(2rem, 6vw, 3rem)",
          }}
        >
          Unexpected{" "}
          <span
            style={{
              fontFamily: "var(--font-fraunces, serif)",
              fontStyle: "italic",
              textTransform: "none",
              fontWeight: 400,
              color: "var(--color-ocean-500, #e60000)",
            }}
          >
            error.
          </span>
        </h1>

        <p className="text-[13.5px] leading-[1.65] opacity-55 mb-8">
          Your order and payment data are safe — this is a display issue only. Try again or go back to the menu.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full py-3.5 rounded-2xl text-[13.5px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "var(--color-ocean-500, #e60000)" }}
          >
            Try again
          </button>
          <Link
            href="/"
            className="w-full py-3.5 rounded-2xl text-[13.5px] font-medium text-center transition-colors hover:opacity-80"
            style={{ border: "1px solid var(--tray-border, rgba(26,26,25,0.12))", background: "rgba(255,255,255,0.5)" }}
          >
            Back to menu
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-[10px] font-mono opacity-35 text-center">
            Reference: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
