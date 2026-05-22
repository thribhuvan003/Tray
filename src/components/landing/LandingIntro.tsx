"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const INTRO_KEY = "tray_landing_intro_seen";

export function LandingIntro() {
  const [show, setShow] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(INTRO_KEY) === "1") return;
    window.sessionStorage.setItem(INTRO_KEY, "1");
    setShow(true);
    const timeout = window.setTimeout(() => setShow(false), reduce ? 400 : 1700);
    return () => window.clearTimeout(timeout);
  }, [reduce]);

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key="intro"
          aria-hidden
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ background: "var(--tray-ink)", color: "var(--tray-cream)" }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={
            reduce
              ? { opacity: 0, transition: { duration: 0.25 } }
              : {
                  opacity: 0,
                  scale: 1.08,
                  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                }
          }
        >
          {/* Tray wordmark scales in from 0.72 to 1 */}
          <motion.div
            className="flex flex-col items-center"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.72, y: 16 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.span
              className="select-none"
              style={{
                fontFamily: "var(--font-barlow)",
                fontWeight: 900,
                fontSize: "clamp(6rem, 20vw, 16rem)",
                lineHeight: 0.85,
                letterSpacing: "-0.05em",
                textTransform: "uppercase",
              }}
            >
              Tray
            </motion.span>

            {/* Bar grows left-to-right */}
            <motion.div
              className="mt-4 h-[2px] rounded-full origin-left"
              style={{ background: "var(--tray-clay)", width: "8rem" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.45, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* Tagline fades in */}
            <motion.p
              className="mt-3 text-xs uppercase tracking-[0.28em] select-none"
              style={{ fontFamily: "var(--font-dm-mono)", opacity: 0.45 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              transition={{ duration: 0.4, delay: 0.55 }}
            >
              Campus canteen system
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
