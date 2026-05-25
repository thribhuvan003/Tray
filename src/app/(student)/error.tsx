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
    // Log to server monitoring (safe — no stack trace to client)
    console.error("[Student portal error]", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
          <p className="text-sm text-[color:var(--color-ink-3)]">
            We hit an unexpected error. Your order and payment data are safe — this is just a display issue.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full py-2.5 px-4 rounded-xl bg-ocean-500 text-white text-sm font-semibold hover:bg-ocean-600 active:scale-[0.98] transition-all"
          >
            Try again
          </button>
          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-xl border border-[color:var(--color-line)] text-sm font-medium hover:bg-[color:var(--color-cream-3)] transition-colors"
          >
            Go back to menu
          </Link>
        </div>

        {error.digest && (
          <p className="text-[10px] text-[color:var(--color-ink-4)] font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
