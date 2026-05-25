"use client";
import { useEffect, useState } from "react";

function formatCountdown(until: string): string | null {
  const diffMs = new Date(until).getTime() - Date.now();
  if (diffMs <= 0) return null;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffSec = Math.floor((diffMs % 60_000) / 1000);
  if (diffMin >= 60) {
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  if (diffMin > 0) return `${diffMin}m ${diffSec}s`;
  return `${diffSec}s`;
}

export function PauseCountdown({ pausedUntil }: { pausedUntil: string }) {
  const [text, setText] = useState<string | null>(() => formatCountdown(pausedUntil));

  useEffect(() => {
    const iv = setInterval(() => {
      const t = formatCountdown(pausedUntil);
      setText(t);
      if (!t) clearInterval(iv);
    }, 1000);
    return () => clearInterval(iv);
  }, [pausedUntil]);

  if (!text) return null;

  return (
    <span className="ml-2 px-2 py-0.5 rounded-full bg-[var(--admin-amber-soft)] text-[var(--admin-amber)] text-[10px] font-mono animate-pulse">
      Paused — resumes in {text}
    </span>
  );
}
