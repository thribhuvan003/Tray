"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import {
  prefersReducedMotion,
  registerTrayGsap,
} from "@/lib/motion/tray-motion";

const portals = [
  {
    index: "01",
    eyebrow: "STUDENT APP",
    accentColor: "#5cb1ff",
    title: "Order from any canteen.",
    description:
      "Choose canteen, browse menu, pay by UPI, track your order live, collect with a 4-digit OTP.",
    previewSrc: "/demo/student.html",
    deviceTag: "DESKTOP • STUDENT",
    portalKey: "student" as const,
  },
  {
    index: "02",
    eyebrow: "KITCHEN VIEW",
    accentColor: "#ef5749",
    title: "Run the live queue.",
    description:
      "New tickets land instantly, prep timers count down, OTP handover clears the order — no paper, no shouting.",
    previewSrc: "/demo/kitchen.html",
    deviceTag: "TABLET • KITCHEN",
    portalKey: "kitchen" as const,
  },
  {
    index: "03",
    eyebrow: "ADMIN CONSOLE",
    accentColor: "#cdfa50",
    title: "See the whole operation.",
    description:
      "Live orders, daily revenue, menu edits, staff access, full audit log — one screen, every metric.",
    previewSrc: "/demo/admin.html",
    deviceTag: "DESKTOP • ADMIN",
    portalKey: "admin" as const,
  },
] as const;

interface InteractivePortalCardProps {
  portal: typeof portals[number];
  idx: number;
  portalRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

function InteractivePortalCard({ portal, idx, portalRefs }: InteractivePortalCardProps) {
  const [mounted, setMounted] = React.useState(false);
  const [iframeLoaded, setIframeLoaded] = React.useState(true);
  const [isSandbox, setIsSandbox] = React.useState(false);
  const [syncMessage, setSyncMessage] = React.useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    function handleMessage(e: MessageEvent) {
      const data = e.data;
      if (!data || typeof data !== "object") return;

      if (portal.portalKey === "student" && data.type === "student_order_placed") {
        setSyncMessage(`Pushed Order #${data.orderId} to Kitchen via LocalStorage`);
        const tid = setTimeout(() => setSyncMessage(null), 3800);
        return () => clearTimeout(tid);
      }
      if (portal.portalKey === "kitchen" && data.type === "kitchen_order_received") {
        setSyncMessage(`Incoming Order #${data.orderId} detected (0ms delay)`);
        const tid = setTimeout(() => setSyncMessage(null), 3800);
        return () => clearTimeout(tid);
      }
      if (portal.portalKey === "admin" && data.type === "admin_revenue_updated") {
        setSyncMessage(`Revenue updated +₹${data.total} (Sync Complete)`);
        const tid = setTimeout(() => setSyncMessage(null), 3800);
        return () => clearTimeout(tid);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [portal.portalKey]);

  const enterSandbox = () => {
    setIsSandbox(true);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'pause_simulation' }, '*');
    }
  };

  const resetAutoplay = () => {
    setIsSandbox(false);
    if (iframeRef.current) {
      setIframeLoaded(false);
      iframeRef.current.src = portal.previewSrc;
    }
  };

  const containerBg = portal.portalKey === "admin" ? "#1A1A19" : "#F4EFE6";

  const isReducedMotion = useReducedMotion();
  const shouldAnimate = mounted && !isReducedMotion;

  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for cursor coordinates relative to card center (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const hoverProgress = useMotionValue(0);

  // Springs for smooth movement
  const springConfig = { stiffness: 120, damping: 20, mass: 0.6 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Rotations derived from mouse position
  const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8]);

  // Spotlight position (mapped to percentages 0% to 100%)
  const spotlightX = useTransform(springX, [-0.5, 0.5], [0, 100]);
  const spotlightY = useTransform(springY, [-0.5, 0.5], [0, 100]);

  // Spotlight color based on portal accent color
  const spotlightBg = useTransform(
    [spotlightX, spotlightY],
    ([sx, sy]) => {
      let spotlightColor = "rgba(255, 255, 255, 0.12)";
      if (portal.accentColor === "#5cb1ff") {
        spotlightColor = "rgba(92, 177, 255, 0.15)";
      } else if (portal.accentColor === "#ef5749") {
        spotlightColor = "rgba(239, 87, 73, 0.12)";
      } else if (portal.accentColor === "#cdfa50") {
        spotlightColor = "rgba(205, 250, 80, 0.18)";
      }
      return `radial-gradient(circle 240px at ${sx}% ${sy}%, ${spotlightColor}, transparent 80%)`;
    }
  );

  // Diagonal glare line position (sweeps from -60% to 60% relative offset)
  const glareX = useTransform(springX, [-0.5, 0.5], [-60, 60]);
  const glareXStr = useTransform(glareX, (v) => `${v}%`);
  const glareY = useTransform(springY, [-0.5, 0.5], [-60, 60]);
  const glareYStr = useTransform(glareY, (v) => `${v}%`);

  const spotlightOpacity = useSpring(hoverProgress, { stiffness: 150, damping: 25 });
  const glareOpacity = useSpring(useTransform(hoverProgress, [0, 1], [0, 0.18]), { stiffness: 150, damping: 25 });
  const scale = useSpring(useTransform(hoverProgress, [0, 1], [1, 1.025]), springConfig);
  const shadow = useTransform(
    hoverProgress,
    [0, 1],
    [
      "0px 1px 3px rgba(26, 26, 25, 0.05), 0px 1px 2px rgba(26, 26, 25, 0.03)",
      "0px 25px 60px rgba(26, 26, 25, 0.12)"
    ]
  );

  // Parallax offsets for inner layers
  const textParallaxX = useTransform(springX, [-0.5, 0.5], [-5, 5]);
  const textParallaxY = useTransform(springY, [-0.5, 0.5], [-5, 5]);

  const mediaParallaxX = useTransform(springX, [-0.5, 0.5], [-8, 8]);
  const mediaParallaxY = useTransform(springY, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const relativeX = (e.clientX - rect.left) / width - 0.5;
    const relativeY = (e.clientY - rect.top) / height - 0.5;
    x.set(relativeX);
    y.set(relativeY);
    hoverProgress.set(1);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    hoverProgress.set(0);
  };

  const bgGlow = useTransform(
    hoverProgress,
    [0, 1],
    [
      "rgba(255, 255, 255, 1)",
      portal.portalKey === "student"
        ? "rgba(244, 250, 255, 1)"
        : portal.portalKey === "kitchen"
        ? "rgba(255, 245, 245, 1)"
        : "rgba(253, 255, 240, 1)"
    ]
  );

  const borderColorGlow = useTransform(
    hoverProgress,
    [0, 1],
    [
      "var(--tray-border, rgba(26, 26, 25, 0.12))",
      portal.portalKey === "student"
        ? "rgba(92, 177, 255, 0.35)"
        : portal.portalKey === "kitchen"
        ? "rgba(239, 87, 73, 0.3)"
        : "rgba(205, 250, 80, 0.45)"
    ]
  );

  const style = shouldAnimate
    ? {
        rotateX,
        rotateY,
        scale,
        boxShadow: shadow,
        backgroundColor: bgGlow,
        borderColor: borderColorGlow,
        transformStyle: "preserve-3d" as const,
      }
    : {};

  return (
    <motion.article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-portal-card
      className="motion-card group relative flex flex-col select-none rounded-[18px] overflow-hidden border border-[var(--tray-border,rgba(26,26,25,0.12))] bg-white h-full flex-1 transition-colors duration-300"
      style={style}
    >
      {/* Spotlight glow overlay */}
      {shouldAnimate && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: spotlightBg,
            opacity: spotlightOpacity,
            z: 30,
          }}
        />
      )}

      {/* Diagonal Glare reflection line */}
      {shouldAnimate && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-30 mix-blend-overlay"
          style={{
            background:
              "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.7) 48%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.7) 52%, transparent 60%)",
            x: glareXStr,
            y: glareYStr,
            opacity: glareOpacity,
            z: 40,
          }}
        />
      )}

      {/* Portal Head — eyebrow + title */}
      <motion.div
        className="flex flex-col gap-2.5 z-10"
        style={
          shouldAnimate
            ? {
                padding: "24px 24px 20px",
                borderBottom: "1px solid var(--tray-border, rgba(26, 26, 25, 0.12))",
                x: textParallaxX,
                y: textParallaxY,
                z: 15,
              }
            : {
                padding: "24px 24px 20px",
                borderBottom: "1px solid var(--tray-border, rgba(26, 26, 25, 0.12))",
              }
        }
      >
        <div className="flex justify-between items-center text-[10.5px] font-medium tracking-[0.14em]">
          <span style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--tray-muted, #78716C)" }}>
            {portal.eyebrow}
          </span>
          <span className="flex items-center gap-1.5 font-bold" style={{ fontFamily: "var(--font-geist-mono, monospace)", color: portal.accentColor }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: portal.accentColor, boxShadow: `0 0 8px ${portal.accentColor}` }} />
            {portal.index}
          </span>
        </div>
        <h3
          className="text-[clamp(1.35rem,3vw,2rem)] tracking-[-0.025em] leading-[1.08] m-0 font-normal italic"
          style={{
            fontFamily: "var(--font-instrument-serif, 'Instrument Serif', serif)",
            color: "var(--tray-ink, #1A1A19)",
          }}
        >
          {portal.title}
        </h3>
      </motion.div>



      {/* Portal Frame — iframe preview or static mockup */}
      <motion.div
        className="z-10"
        style={
          shouldAnimate
            ? {
                x: mediaParallaxX,
                y: mediaParallaxY,
                z: 25,
              }
            : {}
        }
      >
        {(portal.portalKey as string) === "student-mock-disabled" ? (
          <div
            className="relative w-full h-[260px] sm:h-[320px] md:h-[400px] overflow-hidden"
            style={{
              background: "#F4EFE6",
              borderBottom: "1px solid var(--tray-border, rgba(26, 26, 25, 0.12))",
            }}
          >
            <div
              className="w-full h-[420px] flex flex-col overflow-hidden"
              style={{
                background: "#F4EFE6",
                color: "#1A1A19",
              }}
            >
              {/* TOP NAV */}
              <div
                className="flex-shrink-0 flex items-center justify-between gap-1.5 px-3"
                style={{
                  height: "50px",
                  background: "rgba(244,239,230,0.92)",
                  borderBottom: "1px solid rgba(26,26,25,0.12)",
                }}
              >
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="flex items-center justify-center font-bold text-[11px] h-6.5 w-6.5 rounded-[7px] bg-[#334155] text-[#F4EFE6]">
                    T
                  </span>
                  <span className="font-bold text-sm tracking-[-0.02em] text-[#1A1A19]">
                    Tray<span className="font-normal italic text-base text-[#334155]" style={{ fontFamily: "var(--font-instrument-serif)" }}>.</span>
                  </span>
                </div>
                <div className="flex-1 text-center min-w-0">
                  <div className="text-xs font-semibold tracking-[-0.01em] text-[#1A1A19] truncate">Hostel B Canteen</div>
                  <div className="text-[8.5px] font-mono tracking-[0.12em] uppercase text-black/40 mt-[1px]">Lunch · 11:42 IST</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <div className="w-7.5 h-7.5 rounded-full border border-black/12 flex items-center justify-center text-black/50">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  </div>
                  <div className="w-7.5 h-7.5 rounded-full border border-black/12 flex items-center justify-center text-black/50">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  </div>
                </div>
              </div>

              {/* BODY */}
              <div className="flex-1 grid grid-cols-[106px_1fr_132px] overflow-hidden">
                {/* LEFT CAT NAV */}
                <div className="flex-shrink-0 flex flex-col gap-[1px] p-2.5 border-r border-black/9" style={{ background: "#E8DFD0" }}>
                  <div className="text-[8.5px] font-bold tracking-[0.14em] uppercase text-black/38 mb-1.5 pl-1.5">Browse</div>
                  <div className="px-2 py-1.5 rounded-[9px] text-[11.5px] font-bold border" style={{ background: "rgba(51,65,85,0.1)", color: "#334155", borderColor: "rgba(51,65,85,0.2)", lineHeight: 1.2 }}>All items</div>
                  <div className="px-2 py-1.5 rounded-[9px] text-[11.5px] font-semibold text-black/58" style={{ lineHeight: 1.2 }}>Specials<br/><span className="text-[9px] text-black/35 font-normal">2 items</span></div>
                  <div className="px-2 py-1.5 rounded-[9px] text-[11.5px] font-semibold text-black/58" style={{ lineHeight: 1.2 }}>Mains<br/><span className="text-[9px] text-black/35 font-normal">6 items</span></div>
                  <div className="px-2 py-1.5 rounded-[9px] text-[11.5px] font-semibold text-black/58" style={{ lineHeight: 1.2 }}>South Indian<br/><span className="text-[9px] text-black/35 font-normal">4 items</span></div>
                  <div className="px-2 py-1.5 rounded-[9px] text-[11.5px] font-semibold text-black/58" style={{ lineHeight: 1.2 }}>Drinks<br/><span className="text-[9px] text-black/35 font-normal">3 items</span></div>
                  <div className="px-2 py-1.5 rounded-[9px] text-[11.5px] font-semibold text-black/58" style={{ lineHeight: 1.2 }}>Snacks<br/><span className="text-[9px] text-black/35 font-normal">3 items</span></div>
                </div>

                {/* CENTER MENU */}
                <div className="flex flex-col p-2.5 pb-0" style={{ background: "#F4EFE6" }}>
                  <div className="flex-shrink-0 mb-2">
                    <div className="text-[8px] font-mono tracking-[0.13em] uppercase text-black/40 mb-1 flex items-center gap-1">
                      <span className="w-1.25 h-1.25 rounded-full bg-[#16a34a] flex-shrink-0" />
                      Kitchen open · ~7 min wait
                    </div>
                    <div className="text-[17px] font-medium tracking-[-0.03em] text-[#1A1A19] leading-[1.1]">What's <span className="italic" style={{ fontFamily: "var(--font-instrument-serif)" }}>cooking, Ananya?</span></div>
                  </div>

                  <div className="flex-shrink-0 mb-2 relative">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(26,26,25,0.35)" strokeWidth="2" className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
                    <div className="h-8 pl-7 rounded-xl border border-black/10 text-[11px] text-black/35 flex items-center" style={{ background: "#E8DFD0" }}>Search menu items…</div>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <div className="grid grid-cols-2 gap-1.75">
                      {/* Card 1 */}
                      <div className="rounded-[13px] border border-black/10 overflow-hidden" style={{ background: "#F4EFE6" }}>
                        <div className="aspect-[4/3] relative flex items-center justify-center text-[26px] text-black/22 italic" style={{ background: "linear-gradient(135deg,#fce4ec,#ef9a9a)", fontFamily: "var(--font-instrument-serif)" }}>
                          B
                          <span className="absolute top-1.5 left-1.5 w-3.75 h-3.75 rounded-sm bg-white border-2 border-[#dc2626] flex items-center justify-center">
                            <span className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5.5px] border-b-[#dc2626]" />
                          </span>
                        </div>
                        <div className="p-2 pb-1.75">
                          <div className="text-[11.5px] font-semibold text-[#1A1A19] leading-[1.2] mb-0.5">Chicken Biryani</div>
                          <div className="text-[9.5px] text-black/48 leading-[1.3] mb-1.5">Basmati, slow-cooked</div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-[#334155]">₹180</span>
                            <span className="inline-flex items-center gap-0.5 h-6 px-2 rounded-full bg-[#334155] text-[#F4EFE6] text-[10px] font-semibold cursor-pointer">
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg> Add
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card 2 */}
                      <div className="rounded-[13px] border border-black/10 overflow-hidden" style={{ background: "#F4EFE6" }}>
                        <div className="aspect-[4/3] relative flex items-center justify-center text-[26px] text-black/22 italic" style={{ background: "linear-gradient(135deg,#e8f5e9,#a5d6a7)", fontFamily: "var(--font-instrument-serif)" }}>
                          P
                          <span className="absolute top-1.5 left-1.5 w-3.75 h-3.75 rounded-sm bg-white border-2 border-[#16a34a] flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
                          </span>
                        </div>
                        <div className="p-2 pb-1.75">
                          <div className="text-[11.5px] font-semibold text-[#1A1A19] leading-[1.2] mb-0.5">Paneer Butter Masala</div>
                          <div className="text-[9.5px] text-black/48 leading-[1.3] mb-1.5">Creamy tomato + 2 rotis</div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-[#334155]">₹160</span>
                            <span className="inline-flex items-center gap-0.5 h-6 px-2 rounded-full bg-[#334155] text-[#F4EFE6] text-[10px] font-semibold cursor-pointer">
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg> Add
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT CART */}
                <div className="flex-shrink-0 flex flex-col overflow-hidden border-l border-black/10" style={{ background: "#F4EFE6" }}>
                  <div className="p-2.5 pb-2 border-b border-black/10">
                    <div className="text-xs font-semibold text-[#1A1A19] leading-[1.1] tracking-[-0.01em]">Your <span className="italic" style={{ fontFamily: "var(--font-instrument-serif)" }}>tray.</span></div>
                    <div className="text-[8px] font-mono tracking-[0.12em] uppercase text-black/42 mt-0.5">Hostel B · ~7 min</div>
                  </div>

                  <div className="flex-1 overflow-hidden p-2 flex flex-col gap-1.5">
                    <div className="border border-black/10 rounded-[11px] p-1.75 px-2 bg-[#F4EFE6] flex items-start gap-1.5">
                      <span className="mt-0.5 w-3.25 h-3.25 rounded-sm bg-white border-[1.5px] border-[#dc2626] flex items-center justify-center flex-shrink-0">
                        <span className="w-0 h-0 border-l-[2.5px] border-l-transparent border-r-[2.5px] border-r-transparent border-b-[4.5px] border-b-[#dc2626]" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10.5px] font-semibold text-[#1A1A19] leading-[1.2] truncate">Chicken Biryani</div>
                        <div className="flex items-center gap-1.5 mt-0.75">
                          <div className="inline-flex items-center border border-black/12 rounded-full overflow-hidden">
                            <span className="w-5 h-5 flex items-center justify-center text-[10px] text-[#1A1A19]">-</span>
                            <span className="text-[10px] font-semibold text-[#1A1A19] w-3.5 text-center">1</span>
                            <span className="w-5 h-5 flex items-center justify-center text-[10px] text-[#1A1A19]">+</span>
                          </div>
                          <span className="text-[9px] text-black/45 font-mono">₹180 ea</span>
                        </div>
                      </div>
                      <div className="text-[11px] font-semibold text-[#1A1A19] flex-shrink-0">₹180</div>
                    </div>

                    <div className="border border-black/10 rounded-[11px] p-1.75 px-2 bg-[#F4EFE6] flex items-start gap-1.5">
                      <span className="mt-0.5 w-3.25 h-3.25 rounded-sm bg-white border-[1.5px] border-[#16a34a] flex items-center justify-center flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10.5px] font-semibold text-[#1A1A19] leading-[1.2] truncate">Paneer Butter Masala</div>
                        <div className="flex items-center gap-1.5 mt-0.75">
                          <div className="inline-flex items-center border border-black/12 rounded-full overflow-hidden">
                            <span className="w-5 h-5 flex items-center justify-center text-[10px] text-[#1A1A19]">-</span>
                            <span className="text-[10px] font-semibold text-[#1A1A19] w-3.5 text-center">2</span>
                            <span className="w-5 h-5 flex items-center justify-center text-[10px] text-[#1A1A19]">+</span>
                          </div>
                          <span className="text-[9px] text-black/45 font-mono">₹160 ea</span>
                        </div>
                      </div>
                      <div className="text-[11px] font-semibold text-[#1A1A19] flex-shrink-0">₹320</div>
                    </div>
                  </div>

                  <div className="p-2 border-t border-black/10 bg-[#E8DFD0] flex flex-col gap-1.5">
                    <div className="grid grid-cols-2 gap-1 p-0.75 rounded-[10px] border border-black/10 bg-[#F4EFE6]">
                      <div className="h-6.5 flex items-center justify-center gap-1 rounded-[7px] bg-[#334155] text-white text-[9.5px] font-semibold">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        Takeaway
                      </div>
                      <div className="h-6.5 flex items-center justify-center gap-1 text-[9.5px] font-semibold text-black/50">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                        Dine in
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <div>
                        <div className="text-[8px] font-mono tracking-[0.15em] uppercase text-black/45">Total</div>
                        <div className="text-lg font-semibold text-[#1A1A19] tracking-[-0.02em] leading-none">₹500</div>
                      </div>
                      <div className="inline-flex items-center gap-0.75 h-7.5 px-2.5 rounded-full bg-[#334155] text-white text-[10px] font-semibold cursor-pointer whitespace-nowrap">
                        Place order →
                      </div>
                    </div>

                    <div className="text-[8.5px] text-black/38 text-center font-mono tracking-[0.03em]">Tray takes 0%. Pays to Hostel B.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            ref={(el) => {
              portalRefs.current[idx] = el;
            }}
            className="relative overflow-hidden h-[260px] sm:h-[320px] md:h-[400px] transition-all duration-300"
            style={{
              background: containerBg,
              borderBottom: "1px solid var(--tray-border, rgba(26, 26, 25, 0.12))",
              boxShadow: syncMessage
                ? `inset 0 0 0 2px ${portal.accentColor}`
                : isSandbox
                ? "inset 0 0 0 2px #10b981"
                : "none",
            }}
          >
            {/* Real-time Sync Pipeline Banner Overlay */}
            {syncMessage && (
              <div
                className="absolute top-3 left-3 right-3 py-2 px-3.5 rounded-lg z-40 text-xs font-semibold flex items-center gap-2 shadow-lg select-none pointer-events-none animate-bounce"
                style={{
                  background: portal.accentColor === "#cdfa50" ? "#cdfa50" : portal.accentColor,
                  color: portal.accentColor === "#cdfa50" ? "#1A1A19" : "#ffffff",
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
                </span>
                <span>{syncMessage}</span>
              </div>
            )}

            {/* Premium skeleton loader placeholder */}
            {!iframeLoaded && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none transition-opacity duration-300"
                style={{ background: containerBg }}
              >
                <div
                  className="w-6 h-6 rounded-full border-2 animate-spin"
                  style={{
                    borderColor: portal.portalKey === "admin" ? "rgba(255,255,255,0.12)" : "rgba(26,26,25,0.08)",
                    borderTopColor: portal.portalKey === "admin" ? "#cdfa50" : "#334155",
                  }}
                />
                <span
                  className="text-[9px] tracking-[0.16em] uppercase font-mono mt-3"
                  style={{ color: portal.portalKey === "admin" ? "rgba(255,255,255,0.35)" : "rgba(26,26,25,0.4)" }}
                >
                  Spinning up portal...
                </span>
              </div>
            )}

            {/* Sandbox Mode click overlay */}
            {!isSandbox && iframeLoaded && (
              <div
                onClick={enterSandbox}
                className="absolute inset-0 bg-neutral-900/10 hover:bg-neutral-900/30 backdrop-blur-[0px] hover:backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer z-10"
              >
                <button
                  className="px-4 py-2 rounded-full text-xs font-semibold shadow-xl border flex items-center gap-2 transform translate-y-2 hover:scale-105 transition-all duration-200"
                  style={{
                    backgroundColor: portal.portalKey === "admin" ? "#cdfa50" : "#334155",
                    color: portal.portalKey === "admin" ? "#1A1A19" : "#ffffff",
                    borderColor: portal.portalKey === "admin" ? "#cdfa50" : "#334155",
                  }}
                >
                  <span>⚡</span> Live Sandbox: Click to Interact
                </button>
              </div>
            )}

            <iframe
              ref={iframeRef}
              src={portal.previewSrc}
              title={`${portal.title} Live Preview`}
              loading="eager"
              sandbox="allow-scripts allow-same-origin"
              scrolling="no"
              tabIndex={isSandbox ? 0 : -1}
              aria-hidden={!isSandbox}
              onLoad={() => setIframeLoaded(true)}
              className={`border-0 origin-top-left absolute top-0 left-0 transition-all duration-300 ${
                isSandbox ? "pointer-events-auto" : "pointer-events-none"
              }`}
            />

            {/* Floating Reset Autoplay Button */}
            {isSandbox && (
              <button
                onClick={resetAutoplay}
                className="absolute bottom-4 right-4 z-40 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border shadow-md flex items-center gap-1.5 bg-neutral-900 text-white border-neutral-700 hover:bg-neutral-800 transition-all duration-200 hover:scale-105"
              >
                Reset Autoplay ↻
              </button>
            )}

            {/* Bottom fade overlay to soften cropped edge */}
            <div
              className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-20"
              style={{
                background: `linear-gradient(to bottom, transparent, ${containerBg})`,
              }}
            />
          </div>
        )}
      </motion.div>

      {/* Portal Body — description + footer */}
      <motion.div
        className="flex flex-col gap-4 flex-1 z-10"
        style={
          shouldAnimate
            ? {
                padding: "20px 24px 24px",
                x: textParallaxX,
                y: textParallaxY,
                z: 15,
              }
            : { padding: "20px 24px 24px" }
        }
      >
        <p
          className="text-[13.5px] leading-relaxed m-0 opacity-80"
          style={{
            color: "var(--tray-muted, #78716C)",
            maxWidth: "34ch",
            fontFamily: "var(--font-inter, var(--font-geist, sans-serif))",
          }}
        >
          {portal.description}
        </p>

        {/* Footer row */}
        <div className="flex justify-between items-center mt-auto pt-4" style={{ borderTop: "1px solid var(--tray-border, rgba(26, 26, 25, 0.12))" }}>
          <span className="text-[10px] font-medium tracking-[0.12em]" style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--tray-muted, #78716C)" }}>
            {portal.deviceTag}
          </span>
          <a
            href={portal.previewSrc}
            className="group/btn flex items-center gap-1 text-[11px] font-semibold tracking-[0.08em] uppercase transition-all duration-200 hover:opacity-85"
            style={{
              fontFamily: "var(--font-geist-mono, monospace)",
              color: portal.accentColor,
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            LAUNCH DEMO <span className="inline-block transition-transform duration-200 group-hover/btn:translate-x-0.75">→</span>
          </a>
        </div>
      </motion.div>
    </motion.article>
  );
}

export function PiranhaPortalsSection() {
  const rootRef = useRef<HTMLElement>(null);
  const portalRefs = useRef<(HTMLDivElement | null)[]>([]);

  React.useEffect(() => {
    function resizeIframes() {
      portalRefs.current.forEach((frame, idx) => {
        if (!frame) return;
        const iframe = frame.querySelector("iframe");
        if (!iframe) return;
        const parentWidth = frame.clientWidth;
        const parentHeight = frame.clientHeight;
        if (parentWidth === 0) return;

        const portalKey = portals[idx]?.portalKey;
        let virtualWidth = 1024;
        let scrollPx = 0;

        if (portalKey === "kitchen") {
          virtualWidth = 980;
          scrollPx = 0;
        } else if (portalKey === "admin") {
          virtualWidth = 1300;
          scrollPx = 0;
        }

        const virtualHeight = parentHeight * (virtualWidth / parentWidth) + scrollPx;
        iframe.style.width = `${virtualWidth}px`;
        iframe.style.height = `${virtualHeight}px`;
        const scale = parentWidth / virtualWidth;
        iframe.style.transform = `scale(${scale}) translateY(-${scrollPx}px)`;
        iframe.style.transformOrigin = "0 0";
      });
    }

    resizeIframes();
    window.addEventListener("resize", resizeIframes);
    const interval = setInterval(resizeIframes, 1000);

    return () => {
      window.removeEventListener("resize", resizeIframes);
      clearInterval(interval);
    };
  }, []);

  useGSAP(
    () => {
      registerTrayGsap();
      if (prefersReducedMotion()) return;

      const root = rootRef.current;
      if (!root) return;

      const heading = root.querySelector("[data-portals-heading]") as HTMLElement;

      // Animate the statically defined word spans in the heading without modifying the DOM
      if (heading) {
        gsap.fromTo(
          heading.querySelectorAll(".split-word > span"),
          { yPercent: 105, rotate: 1.5, opacity: 0 },
          {
            yPercent: 0,
            rotate: 0,
            opacity: 1,
            duration: 1.05,
            stagger: 0.04,
            ease: "power4.out",
            scrollTrigger: { trigger: heading, start: "top 80%" },
          }
        );
      }

      // Animate card entrances using scroll trigger
      const cards = root.querySelectorAll("[data-portal-card]");
      if (cards.length) {
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: { trigger: root, start: "top 75%" },
          }
        );
      }
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden px-5 py-24 sm:px-8 lg:px-10 lg:min-h-screen lg:flex lg:flex-col lg:justify-center lg:py-24"
      style={{ background: "var(--tray-bg, #F4EFE6)", color: "var(--tray-ink, #1A1A19)" }}
    >
      {/* Dot-grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:18px_18px]" />

      <div className="relative z-10 mx-auto max-w-7xl w-full flex flex-col gap-16">
        {/* Heading panel */}
        <div className="max-w-4xl">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <p className="text-[0.72rem] font-code font-medium uppercase tracking-[0.24em] opacity-40">
              01 / The system
            </p>
          </div>

          <h2
            data-portals-heading
            className="leading-[0.9] tracking-[-0.03em] uppercase flex flex-col gap-1"
            style={{
              fontFamily: "var(--font-barlow)",
              fontWeight: 900,
              fontSize: "clamp(2.5rem, 6.5vw, 6.2rem)",
              color: "var(--tray-ink, #1A1A19)",
            }}
          >
            <span className="split-word inline-block overflow-hidden">
              <span className="inline-block">Three portals,</span>
            </span>
            <span className="split-word inline-block overflow-hidden">
              <span className="inline-block">one source of</span>
            </span>
            <span className="split-word inline-block overflow-hidden">
              <span className="inline-block">truth.</span>
            </span>
          </h2>

          <p
            className="mt-7 max-w-3xl text-[1.1rem] leading-8 opacity-70"
            style={{ fontFamily: "var(--font-geist)" }}
          >
            One database, three purpose-built views. What a student orders is what the
            kitchen prepares, which is what the admin monitors. No lag, no re-sync,
            no mystery. Open any portal below — fully live, no sign-up.
          </p>
        </div>

        {/* 3-Column Portal Grid — matches user screenshots */}
        <div
          id="portals"
          className="grid grid-cols-1 lg:grid-cols-3 gap-[18px] mt-14 w-full scroll-mt-24"
          style={{ perspective: "1200px" }}
        >
          {portals.map((portal, idx) => (
            <InteractivePortalCard
              key={portal.index}
              portal={portal}
              idx={idx}
              portalRefs={portalRefs}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
