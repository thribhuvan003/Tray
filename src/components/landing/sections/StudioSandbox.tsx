"use client";

import React, { useState, useEffect } from "react";
import { THEMES, FONTS } from "../DesignerCustomizer";
import { motion, AnimatePresence } from "framer-motion";
import { CountUp } from "@/lib/motion/tray-framer";

export function StudioSandbox() {
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof THEMES>("A");
  const [selectedFont, setSelectedFont] = useState<keyof typeof FONTS>(1);
  const [activeCategory, setActiveCategory] = useState<"all" | "dark" | "light" | "editorial" | "brutalist">("all");
  const [copied, setCopied] = useState(false);

  // Synchronize with any changes applied elsewhere
  const applyTheme = (key: keyof typeof THEMES) => {
    setSelectedTheme(key);
    const theme = THEMES[key];
    const root = document.documentElement;

    root.style.setProperty("--tray-bg", theme.bg);
    root.style.setProperty("--tray-surface", theme.surface);
    root.style.setProperty("--tray-ink", theme.ink);
    root.style.setProperty("--tray-muted", theme.muted);
    root.style.setProperty("--tray-clay", theme.clay);
    root.style.setProperty("--tray-green", theme.green);
    root.style.setProperty("--tray-cream", theme.cream);
    root.style.setProperty("--tray-border", theme.border);
  };

  const applyFont = (key: keyof typeof FONTS) => {
    setSelectedFont(key);
    const font = FONTS[key];
    const root = document.documentElement;

    root.style.setProperty("--font-barlow", font.barlow);
    root.style.setProperty("--font-fraunces", font.editorial);
    root.style.setProperty("--font-display-cond", font.displayCond);
    root.style.setProperty("--font-editorial", font.editorial);
    root.style.setProperty("--font-jakarta", font.jakarta);
    root.style.setProperty("--font-ui", font.ui);
    root.style.setProperty("--font-geist", font.ui);
  };

  const copyCSS = () => {
    const t = THEMES[selectedTheme];
    const f = FONTS[selectedFont];
    const code = `/* Tray Custom Design Presets */
:root {
  --tray-bg: ${t.bg};
  --tray-surface: ${t.surface};
  --tray-ink: ${t.ink};
  --tray-muted: ${t.muted};
  --tray-clay: ${t.clay};
  --tray-green: ${t.green};
  --tray-cream: ${t.cream};
  --tray-border: ${t.border};
  
  /* Font Pairing: ${f.name} */
  /* ${f.desc} */
}`;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Helper to categorize themes for easy visual scanning
  const filterTheme = (key: keyof typeof THEMES): boolean => {
    const theme = THEMES[key];
    const isDark = theme.bg === "#000000" || theme.bg.startsWith("#0a") || theme.bg.startsWith("#1") || theme.bg === "#030206" || theme.bg === "#05050a" || theme.bg === "#0c061a";
    if (activeCategory === "dark") return isDark;
    if (activeCategory === "light") return !isDark;
    if (activeCategory === "editorial") return theme.name.toLowerCase().includes("editorial") || theme.name.toLowerCase().includes("luxury") || theme.name.toLowerCase().includes("vintage") || theme.name.toLowerCase().includes("polaroid");
    if (activeCategory === "brutalist") return theme.name.toLowerCase().includes("brutalist") || theme.name.toLowerCase().includes("cyber") || theme.name.toLowerCase().includes("acid") || theme.name.toLowerCase().includes("techno") || theme.name.toLowerCase().includes("neon");
    return true;
  };

  const filteredThemeKeys = (Object.keys(THEMES) as Array<keyof typeof THEMES>).filter(filterTheme);

  return (
    <section id="sandbox-board" className="relative border-b border-[var(--tray-border)] px-5 py-24 sm:px-8 lg:px-10 bg-[var(--tray-surface)]/20 transition-all duration-300">
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,var(--tray-ink)_1px,transparent_0)] [background-size:24px_24px]" />
      
      <div className="mx-auto max-w-7xl">
        
        {/* Section Header */}
        <div className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-clay)" }}>
                00 / Interactive Sandbox
              </span>
              <span className="rounded-full bg-[var(--tray-ink)] px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-[var(--tray-cream)] animate-pulse">
                77 Themes + 28 Font Combos
              </span>
            </div>
            <h2 className="leading-[0.88] tracking-[-0.04em] font-cond text-5xl sm:text-6xl md:text-7xl uppercase" style={{ color: "var(--tray-ink)" }}>
              Art Director's <span style={{ fontFamily: "var(--font-editorial)", fontStyle: "italic", textTransform: "none", color: "var(--tray-clay)" }}>playground.</span>
            </h2>
            <p className="mt-4 max-w-xl text-[1rem] leading-[1.65] opacity-70 font-ui">
              Mix and match elite Google Font parings and visual color palettes. Select any configuration to immediately skin the entire landing page, and export the CSS instantly.
            </p>
          </div>

          {/* Quick Counter Stats */}
          <div className="flex gap-8 border-t border-[var(--tray-border)] pt-6 md:border-none md:pt-0">
            <div>
              <p className="font-cond text-4xl font-black text-[var(--tray-clay)] leading-none"><CountUp end={77} /></p>
              <p className="mt-1 text-[0.62rem] uppercase tracking-[0.2em] opacity-50" style={{ fontFamily: "var(--font-dm-mono)" }}>Palettes Available</p>
            </div>
            <div className="h-10 w-[1px] bg-[var(--tray-border)]" />
            <div>
              <p className="font-cond text-4xl font-black text-[var(--tray-clay)] leading-none"><CountUp end={28} /></p>
              <p className="mt-1 text-[0.62rem] uppercase tracking-[0.2em] opacity-50" style={{ fontFamily: "var(--font-dm-mono)" }}>Font Pairings</p>
            </div>
          </div>
        </div>

        {/* Art Board Grid Layout */}
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          
          {/* Left Block: The Interactive Specimen and Selectors */}
          <div className="space-y-6">
            
            {/* The Huge Specimen Preview Box */}
            <div className="relative overflow-hidden rounded-[2.5rem] border p-8 sm:p-10 transition-all duration-300"
              style={{
                border: "1px solid var(--tray-border)",
                background: "rgba(255,255,255,0.48)",
                backdropFilter: "blur(16px)",
              }}
            >
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--tray-border)] pb-6">
                <div>
                  <span className="text-[0.65rem] uppercase tracking-[0.22em] text-[var(--tray-muted)]" style={{ fontFamily: "var(--font-dm-mono)" }}>
                    Active Font Specimen combo
                  </span>
                  <h3 className="mt-1 font-semibold text-lg tracking-tight" style={{ color: "var(--tray-ink)" }}>
                    {FONTS[selectedFont].name}
                  </h3>
                </div>
                <div className="rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em]"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    color: "var(--tray-clay)",
                    borderColor: "var(--tray-border)",
                    background: "var(--tray-cream)",
                  }}
                >
                  Pair {selectedFont} / 22
                </div>
              </div>

              {/* Real-time Font Render Area */}
              <div className="space-y-6 select-none">
                <div>
                  <span className="block text-[0.62rem] uppercase tracking-[0.25em] text-[var(--tray-clay)] mb-3 font-semibold" style={{ fontFamily: "var(--font-dm-mono)" }}>
                    Giant Header Specimen:
                  </span>
                  <h1 className="leading-[0.85] tracking-[-0.04em] uppercase text-4xl sm:text-5xl md:text-6xl lg:text-7xl break-words"
                    style={{
                      fontFamily: FONTS[selectedFont].barlow.includes("fraunces") || FONTS[selectedFont].barlow.includes("newsreader") || FONTS[selectedFont].barlow.includes("cormorant") || FONTS[selectedFont].barlow.includes("instrument")
                        ? "var(--font-editorial)"
                        : FONTS[selectedFont].barlow.includes("bebas")
                        ? "var(--font-bebas)"
                        : "var(--font-display-cond)",
                      fontWeight: 900,
                    }}
                  >
                    THUNDER <span className="font-editorial normal-case italic" style={{ color: "var(--tray-clay)" }}>redefined.</span>
                  </h1>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 pt-4 border-t border-[var(--tray-border)]/50">
                  <div>
                    <span className="block text-[0.62rem] uppercase tracking-[0.25em] text-[var(--tray-clay)] mb-2 font-semibold" style={{ fontFamily: "var(--font-dm-mono)" }}>
                      Body Font Specimen:
                    </span>
                    <p className="text-[1.05rem] leading-[1.65] opacity-80"
                      style={{
                        fontFamily: FONTS[selectedFont].jakarta.includes("jetbrains")
                          ? "var(--font-jetbrains)"
                          : FONTS[selectedFont].jakarta.includes("dm-mono")
                          ? "var(--font-dm-mono)"
                          : FONTS[selectedFont].jakarta.includes("inter")
                          ? "var(--font-sans)"
                          : FONTS[selectedFont].jakarta.includes("manrope")
                          ? "var(--font-manrope)"
                          : "var(--font-jakarta)",
                      }}
                    >
                       UPI payments in seconds. Beautiful RLS Postgres security. A premium, modern stack running on Next.js 15 and Supabase, built for massive college canteens across India.
                    </p>
                  </div>
                  <div>
                    <span className="block text-[0.62rem] uppercase tracking-[0.25em] text-[var(--tray-clay)] mb-2 font-semibold" style={{ fontFamily: "var(--font-dm-mono)" }}>
                      Full Character Set:
                    </span>
                    <p className="text-[1rem] tracking-wider leading-relaxed opacity-60 break-words"
                      style={{
                        fontFamily: FONTS[selectedFont].jakarta.includes("jetbrains")
                          ? "var(--font-jetbrains)"
                          : FONTS[selectedFont].jakarta.includes("dm-mono")
                          ? "var(--font-dm-mono)"
                          : "var(--font-sans)",
                      }}
                    >
                      Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 0123456789 (!@#$%^&*)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Typography Combinations Selector Box */}
            <div className="rounded-[2.25rem] border p-6 sm:p-8"
              style={{
                border: "1px solid var(--tray-border)",
                background: "rgba(255,255,255,0.35)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--tray-muted)]" style={{ fontFamily: "var(--font-dm-mono)" }}>
                  Select Premium Typography Pairing
                </h4>
                <p className="mt-1 text-[0.68rem] uppercase tracking-[0.14em] text-[var(--tray-muted)] opacity-60" style={{ fontFamily: "var(--font-dm-mono)" }}>
                  22 Elegant visual alignments
                </p>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2 max-h-[290px] overflow-y-auto pr-1 tray-no-scrollbar">
                {(Object.keys(FONTS) as unknown as Array<keyof typeof FONTS>).map((key) => {
                  const item = FONTS[key];
                  const active = selectedFont === Number(key);
                  return (
                    <button
                      key={key}
                      onClick={() => applyFont(Number(key) as keyof typeof FONTS)}
                      className={`flex flex-col rounded-2xl border p-4 text-left transition hover:scale-[1.01] ${
                        active
                          ? "border-[var(--tray-clay)] bg-[var(--tray-ink)] text-[var(--tray-cream)]"
                          : "border-[var(--tray-border)] bg-white/40 text-[var(--tray-ink)] hover:bg-white/60"
                      }`}
                    >
                      <span className="text-[0.62rem] uppercase tracking-[0.18em]" style={{ fontFamily: "var(--font-dm-mono)", opacity: active ? 0.6 : 0.4 }}>
                        Pairing {key}
                      </span>
                      <span className="mt-1 font-bold text-xs uppercase tracking-[0.06em]">
                        {item.name}
                      </span>
                      <span className="mt-1 text-[0.68rem] opacity-60 leading-normal">
                        {item.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Block: 60 Custom Visual Color Palettes */}
          <div className="flex flex-col gap-6">
            
            {/* The Palettes Panel */}
            <div className="flex-1 rounded-[2.25rem] border p-6 sm:p-8 flex flex-col"
              style={{
                border: "1px solid var(--tray-border)",
                background: "rgba(255,255,255,0.48)",
                backdropFilter: "blur(16px)",
              }}
            >
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--tray-muted)]" style={{ fontFamily: "var(--font-dm-mono)" }}>
                    Visual Color Palettes
                  </h4>
                  <p className="mt-1 text-[0.68rem] uppercase tracking-[0.14em] text-[var(--tray-muted)] opacity-60" style={{ fontFamily: "var(--font-dm-mono)" }}>
                    Theme {selectedTheme}: {THEMES[selectedTheme].name}
                  </p>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap gap-1">
                  {(["all", "dark", "light", "editorial", "brutalist"] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`rounded px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.12em] transition ${
                        activeCategory === cat
                          ? "bg-[var(--tray-ink)] text-[var(--tray-cream)]"
                          : "bg-[var(--tray-border)]/5 text-[var(--tray-muted)] hover:bg-[var(--tray-border)]/15"
                      }`}
                      style={{ fontFamily: "var(--font-dm-mono)" }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Palette List */}
              <div className="grid gap-2 overflow-y-auto max-h-[380px] pr-1 tray-no-scrollbar">
                {filteredThemeKeys.map((key) => {
                  const item = THEMES[key];
                  const active = selectedTheme === key;
                  return (
                    <button
                      key={key}
                      onClick={() => applyTheme(key)}
                      className={`flex flex-col rounded-xl border p-3 text-left transition hover:scale-[1.01] ${
                        active
                          ? "border-[var(--tray-clay)] bg-white/70"
                          : "border-[var(--tray-border)] bg-white/20 hover:border-[var(--tray-border)]/40 hover:bg-white/30"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[0.68rem] font-bold uppercase tracking-[0.1em]" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-ink)" }}>
                          {key}: {item.name}
                        </span>
                        {active && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--tray-clay)] shadow-lg shadow-[var(--tray-clay)]" />
                        )}
                      </div>
                      
                      {/* Color Preview Block */}
                      <div className="mt-2.5 flex h-3.5 w-full overflow-hidden rounded border" style={{ borderColor: "var(--tray-border)" }}>
                        <span className="flex-1" style={{ background: item.bg }} title="Background" />
                        <span className="w-1/5" style={{ background: item.surface }} title="Surface" />
                        <span className="w-1/5" style={{ background: item.ink }} title="Text/Ink" />
                        <span className="w-1/5" style={{ background: item.clay }} title="Accent" />
                        <span className="w-1/5" style={{ background: item.green }} title="Green" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Code Generator & CSS Export Block */}
            <div className="rounded-[2.25rem] border p-6"
              style={{
                border: "1px solid var(--tray-border)",
                background: "rgba(255,255,255,0.60)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="rounded-2xl border bg-black/5 p-4 border-[var(--tray-border)]">
                <span className="block text-[0.62rem] uppercase tracking-[0.2em] text-[var(--tray-muted)]" style={{ fontFamily: "var(--font-dm-mono)" }}>
                  Active Preset:
                </span>
                <span className="mt-1 block text-sm font-bold uppercase tracking-[0.06em]" style={{ color: "var(--tray-ink)" }}>
                  Theme {selectedTheme} + Pair {selectedFont}
                </span>
              </div>

              <button
                onClick={copyCSS}
                className="mt-4 flex w-full items-center justify-center rounded-2xl bg-[var(--tray-ink)] text-[var(--tray-cream)] py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition hover:opacity-90 active:scale-98"
                style={{ fontFamily: "var(--font-dm-mono)" }}
              >
                {copied ? "✓ Copied CSS!" : "Copy Combination CSS"}
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
