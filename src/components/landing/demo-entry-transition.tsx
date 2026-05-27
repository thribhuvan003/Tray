"use client";

import { useEffect, useRef, useState } from "react";

const CSS = `
.tray-demo-wipe {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  overflow: hidden;
}
.tray-demo-wipe-bg {
  position: absolute;
  inset: 0;
  background: #F7F0DF;
  transform: translateY(100%);
  transition: transform 0.55s cubic-bezier(0.76, 0, 0.24, 1);
}
.tray-demo-wipe.is-entering .tray-demo-wipe-bg {
  transform: translateY(0);
}
.tray-demo-wipe.is-leaving .tray-demo-wipe-bg {
  transform: translateY(-100%);
  transition: transform 0.5s cubic-bezier(0.76, 0, 0.24, 1) 0.2s;
}
.tray-demo-wipe-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.25s ease 0.35s;
}
.tray-demo-wipe.is-entering .tray-demo-wipe-content {
  opacity: 1;
}
.tray-demo-wipe.is-leaving .tray-demo-wipe-content {
  opacity: 0;
  transition: opacity 0.2s ease;
}
.tray-demo-wipe-word {
  font-family: var(--font-fraunces), ui-serif, Georgia;
  font-weight: 900;
  font-size: clamp(80px, 20vw, 200px);
  line-height: 0.88;
  letter-spacing: -0.05em;
  color: #111111;
  user-select: none;
}
.tray-demo-wipe-role {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: rgba(17, 17, 17, 0.45);
  font-weight: 500;
}
`;

type WipeState = "idle" | "entering" | "leaving";

let globalTrigger: ((href: string, role: string) => void) | null = null;

export function triggerDemoEntry(href: string, role: string): void {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.location.href = href;
    return;
  }
  globalTrigger?.(href, role);
}

export function DemoEntryTransition() {
  const [state, setState] = useState<WipeState>("idle");
  const [role, setRole] = useState("");
  const pendingRef = useRef<string>("");

  useEffect(() => {
    globalTrigger = (href: string, roleLabel: string) => {
      pendingRef.current = href;
      setRole(roleLabel);
      setState("entering");
    };
    return () => {
      globalTrigger = null;
    };
  }, []);

  useEffect(() => {
    if (state !== "entering") return;
    const t1 = setTimeout(() => {
      setState("leaving");
    }, 700);
    const t2 = setTimeout(() => {
      window.location.href = pendingRef.current;
    }, 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [state]);

  if (state === "idle") return null;

  return (
    <div
      className={`tray-demo-wipe ${state === "entering" ? "is-entering" : state === "leaving" ? "is-leaving" : ""}`}
      aria-hidden
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="tray-demo-wipe-bg" />
      <div className="tray-demo-wipe-content">
        <div className="tray-demo-wipe-word">Tray</div>
        {role && <div className="tray-demo-wipe-role">{role}</div>}
      </div>
    </div>
  );
}
