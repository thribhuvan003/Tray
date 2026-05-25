"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";
type Ctx = { theme: Theme; resolved: "light" | "dark"; setTheme: (t: Theme) => void };

const ThemeContext = React.createContext<Ctx | null>(null);
const STORAGE_KEY = "tray:theme";

function readStored(): Theme {
  if (typeof window === "undefined") return "light";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "light" || v === "dark" || v === "system" ? v : "light";
}

function systemDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("light");
  const [resolved, setResolved] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    setThemeState(readStored());
  }, []);

  React.useEffect(() => {
    const apply = () => {
      const wantDark = theme === "dark" || (theme === "system" && systemDark());
      setResolved(wantDark ? "dark" : "light");
      const root = document.documentElement;
      root.classList.toggle("dark", wantDark);
      root.setAttribute("data-theme", wantDark ? "dark" : "light");
    };
    apply();
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [theme]);

  const setTheme = React.useCallback((t: Theme) => {
    window.localStorage.setItem(STORAGE_KEY, t);
    setThemeState(t);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const c = React.useContext(ThemeContext);
  if (!c) throw new Error("useTheme must be inside ThemeProvider");
  return c;
}
