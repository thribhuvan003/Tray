"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const INTRO_KEY = "tray_landing_intro_seen";

export function LandingIntro() {
  const [show, setShow] = useState(false);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<"counting" | "reveal" | "done">("counting");
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
      setCount(100);
      setPhase("reveal");
      const timeout = window.setTimeout(() => setShow(false), 400);
      return () => window.clearTimeout(timeout);
    }

    // Counting phase: 0 to 100 in 900ms
    const duration = 900;
    const startTime = performance.now();

    let frameId: number;
    const updateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for a premium, non-linear count acceleration
      const easeProgress = 1 - Math.pow(1 - progress, 3); 
      const currentCount = Math.floor(easeProgress * 100);
      
      setCount(currentCount);

      if (progress < 1) {
        frameId = requestAnimationFrame(updateCount);
      } else {
        setPhase("reveal");
        // Hold on reveal phase for 1.2s, then hide
        const fadeTimeout = window.setTimeout(() => {
          setShow(false);
        }, 1200);
        return () => window.clearTimeout(fadeTimeout);
      }
    };

    frameId = requestAnimationFrame(updateCount);

    return () => {
      cancelAnimationFrame(frameId);
    };
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
                transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1], delay: 0.6 }}
              />
              {/* Bottom Pane */}
              <motion.div
                className="absolute bottom-0 left-0 w-full h-[50%] bg-[#000000] z-10 border-t border-white/5"
                exit={{ y: "100%" }}
                transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1], delay: 0.6 }}
              />
            </>
          )}

          {/* Core Content */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#000000] text-[#FAF8F5] select-none">
            
            {/* Phase 1: Massive Kinetic Percentage Counter */}
            {phase === "counting" && (
              <motion.div
                key="counter-container"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -40, scale: 1.05 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center justify-center"
              >
                <div className="relative font-bold text-[clamp(7rem,20vw,16rem)] leading-none tracking-tighter" style={{ fontFamily: "var(--font-jetbrains)" }}>
                  <span className="tabular-nums">{count.toString().padStart(2, "0")}</span>
                  <span className="text-[#FAF8F5] opacity-35 text-[0.35em] absolute top-[0.1em] ml-1">%</span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FAF8F5] opacity-50 animate-pulse" />
                  <span className="text-xs uppercase tracking-[0.3em] opacity-45" style={{ fontFamily: "var(--font-outfit)" }}>
                    Initializing Campus Core
                  </span>
                </div>
              </motion.div>
            )}

            {/* Phase 2: Letter stagger reveal of "Tray" */}
            {phase === "reveal" && (
              <motion.div
                key="reveal-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.05, y: -20, rotateX: 10 }}
                transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                className="flex flex-col items-center"
                style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
              >
                {/* Unified Monumental Mask Reveal */}
                <div 
                   className="overflow-hidden py-4 px-10 flex justify-center items-center"
                   style={{ transformStyle: "preserve-3d" }}
                >
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
                    className="text-[clamp(10rem,32vw,30rem)] font-normal italic leading-none select-none text-[#FAF8F5] tracking-[-0.05em] lowercase"
                    style={{
                      fontFamily: "var(--font-newsreader)",
                      transformOrigin: "center bottom",
                    }}
                  >
                    tray
                  </motion.h1>
                </div>

                {/* Tagline Slide Up */}
                <div className="overflow-hidden mt-2">
                  <motion.p
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="text-xs uppercase tracking-[0.35em] text-[#FAF8F5] opacity-60 font-medium"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    Campus food suite · Unified
                  </motion.p>
                </div>
              </motion.div>
            )}

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
