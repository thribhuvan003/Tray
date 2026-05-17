"use client";

import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      aria-pressed={isDark}
      className={cn("theme-toggle", className)}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <span className="knob" aria-hidden="true" />
    </button>
  );
}
