"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const INTRO_KEY = "tray_landing_intro_seen";

export function LandingIntro() {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<"reveal" | "done">("reveal");
  const reduce = useReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if intro has already been seen in this session
    if (window.sessionStorage.getItem(INTRO_KEY) === "1") {
      setPhase("done");
      (window as any).__trayIntroStarted = true;
      window.dispatchEvent(new CustomEvent("tray-intro-start"));
      return;
    }

    window.sessionStorage.setItem(INTRO_KEY, "1");
    setShow(true);

    if (reduce) {
      const timeout = window.setTimeout(() => {
        (window as any).__trayIntroStarted = true;
        window.dispatchEvent(new CustomEvent("tray-intro-start"));
        setShow(false);
      }, 400);
      return () => window.clearTimeout(timeout);
    }

    // Monumental preloader display timer: 3.4 seconds
    const timer = window.setTimeout(() => {
      (window as any).__trayIntroStarted = true;
      window.dispatchEvent(new CustomEvent("tray-intro-start"));
      setShow(false);
    }, 3400);

    return () => window.clearTimeout(timer);
  }, [reduce]);

  if (phase === "done" || !show) return null;

  return (
    <AnimatePresence onExitComplete={() => setPhase("done")}>
      {show && (
        <motion.div
          key="preloader-wrapper"
          className={`fixed inset-0 z-[9999] overflow-hidden ${show ? "pointer-events-auto" : "pointer-events-none"}`}
          exit={reduce ? { opacity: 0 } : undefined}
          transition={reduce ? { duration: 0.4 } : undefined}
        >
          {/* Horizontal Split Curtains */}
          {!reduce && (
            <>
              {/* Top curtain pane */}
              <motion.div
                className="absolute top-0 left-0 w-full h-[50%] bg-[#0d0c0a] z-10 border-b border-white/[0.02]"
                initial={{ y: 0 }}
                exit={{ y: "-100%" }}
                transition={{ duration: 1.35, ease: [0.85, 0, 0.15, 1], delay: 0.05 }}
              />
              {/* Bottom curtain pane */}
              <motion.div
                className="absolute bottom-0 left-0 w-full h-[50%] bg-[#0d0c0a] z-10 border-t border-white/[0.02]"
                initial={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 1.35, ease: [0.85, 0, 0.15, 1], delay: 0.05 }}
              />
            </>
          )}

          {/* Central typographic content */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-transparent text-[#FAF8F5] select-none">
            <motion.div
              key="reveal-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -45, scale: 0.94, filter: "blur(8px)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-end relative px-6 w-full max-w-[90vw] md:max-w-5xl"
            >
              {/* Big bold monumental TRAY title (Thunder / Druk text style) */}
              <div className="overflow-hidden py-3 px-6 flex justify-center items-center w-full">
                <motion.h1
                  initial={{ 
                    y: "115%", 
                    rotateX: 25, 
                    scale: 0.93,
                    opacity: 0,
                  }}
                  animate={{ 
                    y: 0, 
                    rotateX: 0, 
                    scale: 1.0,
                    opacity: 1,
                  }}
                  transition={{
                    duration: 1.5,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  className="text-[clamp(7.5rem,23vw,21rem)] font-bold leading-[0.78] select-none text-[#FAF8F5] tracking-tighter uppercase text-center"
                  style={{
                    fontFamily: "var(--font-bebas)",
                    transformOrigin: "center bottom",
                  }}
                >
                  Tray
                </motion.h1>
              </div>

              {/* Tagline in Berfal Italic / Elegant Serif style aligned to the right edge */}
              <div className="overflow-hidden -mt-5 sm:-mt-9 md:-mt-11 mr-4 sm:mr-8 md:mr-10 self-end">
                <motion.p
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1.15, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="text-[clamp(1.5rem,4.2vw,3.2rem)] text-[#FAF8F5]/85 font-normal leading-none whitespace-nowrap"
                  style={{
                    fontFamily: "var(--font-instrument-serif)",
                    fontStyle: "italic",
                  }}
                >
                  campus edition
                </motion.p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
