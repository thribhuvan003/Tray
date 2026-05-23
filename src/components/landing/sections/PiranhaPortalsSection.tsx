"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
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
        let virtualWidth = 1440;
        let scrollPx = 0;

        if (portalKey === "kitchen") {
          virtualWidth = 860;
          scrollPx = 95;
        } else if (portalKey === "admin") {
          virtualWidth = 1300;
          scrollPx = 140;
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
            <article
              key={portal.index}
              data-portal-card
              className="motion-card group flex flex-col select-none rounded-[18px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(26,26,25,0.08)]"
              style={{
                background: "#ffffff",
                border: "1px solid var(--tray-border, rgba(26, 26, 25, 0.12))",
              }}
            >
              {/* Portal Head — eyebrow + title */}
              <div
                className="flex flex-col gap-2.5"
                style={{
                  padding: "24px 24px 20px",
                  borderBottom: "1px solid var(--tray-border, rgba(26, 26, 25, 0.12))",
                }}
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
              </div>

              {/* Portal Frame — iframe preview or static mockup */}
              {portal.portalKey === "student" ? (
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
                  className="relative overflow-hidden h-[260px] sm:h-[320px] md:h-[400px]"
                  style={{
                    background: "var(--tray-surface, #E8DFD0)",
                    borderBottom: "1px solid var(--tray-border, rgba(26, 26, 25, 0.12))",
                  }}
                >
                  <iframe
                    src={portal.previewSrc}
                    title={`${portal.title} Live Preview`}
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin"
                    scrolling="no"
                    tabIndex={-1}
                    aria-hidden="true"
                    className="border-0 origin-top-left pointer-events-none absolute top-0 left-0"
                  />
                </div>
              )}

              {/* Portal Body — description + footer */}
              <div
                className="flex flex-col gap-4 flex-1"
                style={{ padding: "20px 24px 24px" }}
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
                    className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.08em] uppercase transition-all duration-200 hover:opacity-85"
                    style={{
                      fontFamily: "var(--font-geist-mono, monospace)",
                      color: portal.accentColor,
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LAUNCH DEMO →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
