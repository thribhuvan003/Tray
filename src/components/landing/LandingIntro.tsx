"use client";

import { useEffect } from "react";

export function LandingIntro() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as any).__trayIntroStarted = true;
    document.documentElement.classList.add("tl-intro-done");
    window.dispatchEvent(new CustomEvent("tray-intro-start"));
  }, []);

  return null;
}
