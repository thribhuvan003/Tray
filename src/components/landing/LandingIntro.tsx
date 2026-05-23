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
    if (window.sessionStorage.getItem(INTRO_KEY) === "1") {
      setPhase("done");
      return;
    }
    window.sessionStorage.setItem(INTRO_KEY, "1");
    setShow(true);

    if (reduce) {
      const timeout = window.setTimeout(() => setShow(false), 400);
      return () => window.clearTimeout(timeout);
    }

    // Immediately display for exactly 1.5 seconds
    const timer = window.setTimeout(() => {
      setShow(false);
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [reduce]);

  if (phase === "done" || !show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader-wrapper"
          className="fixed inset-0 z-[9999] overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Split Panes for the Horizontal Fold Reveal */}
          {!reduce && (
            <>
              {/* Top Pane */}
              <motion.div
                className="absolute top-0 left-0 w-full h-[50%] bg-[#000000] z-10 border-b border-white/5"
                exit={{ y: "-100%" }}
                transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
              />
              {/* Bottom Pane */}
              <motion.div
                className="absolute bottom-0 left-0 w-full h-[50%] bg-[#000000] z-10 border-t border-white/5"
                exit={{ y: "100%" }}
                transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
              />
            </>
          )}

          {/* Core Content */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#000000] text-[#FAF8F5] select-none">
            <motion.div
              key="reveal-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05, y: -20 }}
              transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
              className="flex flex-col items-center"
            >
              {/* Unified Monumental Mask Reveal */}
              <div className="overflow-hidden py-2 px-10 flex justify-center items-center">
                <motion.h1
                  initial={{ 
                    y: "115%", 
                    rotateX: 35, 
                    scale: 0.92,
                    opacity: 0,
                  }}
                  animate={{ 
                    y: 0, 
                    rotateX: 0, 
                    scale: 1.0,
                    opacity: 1,
                  }}
                  transition={{
                    duration: 1.35,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  className="text-[clamp(8rem,22vw,18rem)] font-normal italic leading-none select-none text-[#FAF8F5] tracking-[-0.05em]"
                  style={{
                    fontFamily: "var(--font-newsreader)",
                    transformOrigin: "center bottom",
                  }}
                >
                  Tray
                </motion.h1>
              </div>

              {/* Tagline Slide Up */}
              <div className="overflow-hidden mt-4">
                <motion.p
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="text-xs uppercase tracking-[0.35em] text-[#FAF8F5] opacity-60 font-medium"
                  style={{ fontFamily: "var(--font-ui)" }}
                >
                  Campus food suite · Unified
                </motion.p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
