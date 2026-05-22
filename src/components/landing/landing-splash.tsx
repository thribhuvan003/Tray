"use client";

import { useEffect, useState } from "react";

export function LandingSplash() {
    const [phase, setPhase] = useState<"hidden" | "enter" | "hold" | "exit" | "done">("hidden");

    useEffect(() => {
        // Reduced motion — skip entirely
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            sessionStorage.setItem("tray-splash-seen", "1");
            return;
        }
        // Session gate — only show once
        if (sessionStorage.getItem("tray-splash-seen") === "1") {
            return;
        }

        setPhase("enter");

        const holdTimer = setTimeout(() => setPhase("exit"), 1800);
        const doneTimer = setTimeout(() => {
            setPhase("done");
            sessionStorage.setItem("tray-splash-seen", "1");
        }, 2350);

        return () => {
            clearTimeout(holdTimer);
            clearTimeout(doneTimer);
        };
    }, []);

    if (phase === "hidden" || phase === "done") return null;

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@800&display=swap');

        .tray-splash {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #0d1220;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: all;
        }

        .tray-splash-word {
          font-family: 'Big Shoulders Display', sans-serif;
          font-weight: 800;
          font-size: clamp(80px, 18vw, 180px);
          letter-spacing: -0.04em;
          color: #c4a882;
          line-height: 1;
          opacity: 0;
          transform: translateY(20px);
          animation: splashEnter 0.6s cubic-bezier(0.2, 0.7, 0.3, 1) 0.1s forwards;
          user-select: none;
        }

        @keyframes splashEnter {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .tray-splash[data-phase="exit"] {
          animation: splashExit 0.55s cubic-bezier(0.76, 0, 0.24, 1) forwards;
        }

        @keyframes splashExit {
          from { clip-path: inset(0 0 0% 0); }
          to   { clip-path: inset(0 0 100% 0); }
        }
      `}</style>
            <div className="tray-splash" data-phase={phase} aria-hidden="true">
                <span className="tray-splash-word">Tray</span>
            </div>
        </>
    );
}
