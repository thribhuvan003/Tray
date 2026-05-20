"use client";

import { useEffect, useState } from "react";

export function LiveTimestamp() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      aria-live="polite"
      aria-atomic="true"
      style={{
        fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
      }}
    >
      Updated {seconds === 0 ? "just now" : `${seconds}s ago`}
    </span>
  );
}
