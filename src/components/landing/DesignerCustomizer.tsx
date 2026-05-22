"use client";

import React, { useState, useEffect } from "react";

// Curated 30 visual palettes for full sandbox selection
export const THEMES = {
  A: {
    name: "Parisian Linen & Chestnut",
    bg: "#FAF9F6",
    surface: "#EFEBE4",
    ink: "#1A110B",
    muted: "#5A6B5C",
    clay: "#C23B22",
    green: "#5A6B5C",
    cream: "#FAF9F6",
    border: "rgba(26,17,11,0.08)",
  },
  B: {
    name: "Swiss Cyberpunk Lime",
    bg: "#000000",
    surface: "#0D0E11",
    ink: "#F1F3F5",
    muted: "#8A8A93",
    clay: "#D2FB50",
    green: "#3FE6A3",
    cream: "#0D0E11",
    border: "rgba(255,255,255,0.08)",
  },
  C: {
    name: "Nordic Slate & Arctic Ice",
    bg: "#F3F6F9",
    surface: "#E6ECF1",
    ink: "#0F172A",
    muted: "#7D8F9E",
    clay: "#2B59C3",
    green: "#7D8F9E",
    cream: "#F3F6F9",
    border: "rgba(15,23,42,0.08)",
  },
  D: {
    name: "Deep Space Aurora",
    bg: "#030308",
    surface: "#0D0E1C",
    ink: "#EAEBFC",
    muted: "#7D829A",
    clay: "#A855F7",
    green: "#00F3FF",
    cream: "#0D0E1C",
    border: "rgba(255,255,255,0.08)",
  },
  E: {
    name: "Desert Sun & Sandstone",
    bg: "#F7F2EB",
    surface: "#EFE6DA",
    ink: "#3A2312",
    muted: "#7B4834",
    clay: "#D46A43",
    green: "#7B4834",
    cream: "#F7F2EB",
    border: "rgba(58,35,18,0.08)",
  },
  F: {
    name: "Matcha Tea & Blush Rose",
    bg: "#FAF9F6",
    surface: "#EBEFE9",
    ink: "#1E2D1F",
    muted: "#F2B2AC",
    clay: "#386641",
    green: "#386641",
    cream: "#FAF9F6",
    border: "rgba(30,45,31,0.08)",
  },
  G: {
    name: "Brutalist Steel & Flame",
    bg: "#0A0A0A",
    surface: "#1A1A1A",
    ink: "#F2F2F5",
    muted: "#8A8A93",
    clay: "#FF5A1F",
    green: "#8A8A93",
    cream: "#1A1A1A",
    border: "rgba(255,255,255,0.08)",
  },
  H: {
    name: "Vintage Editorial Pulp",
    bg: "#F4EFE6",
    surface: "#E8DFD0",
    ink: "#1A1A19",
    muted: "#78716C",
    clay: "#E60000",
    green: "#16A34A",
    cream: "#F4EFE6",
    border: "rgba(26,26,25,0.12)",
  },
  I: {
    name: "Tokyo Cyberpunk Neon",
    bg: "#000000",
    surface: "#0C081A",
    ink: "#FFFFFF",
    muted: "#7E70A6",
    clay: "#FF007F",
    green: "#00F0FF",
    cream: "#0C081A",
    border: "rgba(255,0,127,0.15)",
  },
  J: {
    name: "Imperial Gold & Burgundy",
    bg: "#FAF6EE",
    surface: "#F2ECDC",
    ink: "#3D1018",
    muted: "#3A5E4E",
    clay: "#CCA43B",
    green: "#3A5E4E",
    cream: "#FAF6EE",
    border: "rgba(61,16,24,0.08)",
  },
  K: {
    name: "Liquid Mercury Chrome",
    bg: "#08090C",
    surface: "#12151D",
    ink: "#E2E8F0",
    muted: "#94A3B8",
    clay: "#FFFFFF",
    green: "#94A3B8",
    cream: "#12151D",
    border: "rgba(255,255,255,0.1)",
  },
  L: {
    name: "Apple Cupertino Studio",
    bg: "#F5F5F7",
    surface: "#FFFFFF",
    ink: "#1D1D1F",
    muted: "#86868B",
    clay: "#0071E3",
    green: "#34C759",
    cream: "#FFFFFF",
    border: "rgba(0,0,0,0.06)",
  },
  M: {
    name: "Warm Cappuccino & Cream",
    bg: "#3d2f25",
    surface: "#4c3a2e",
    ink: "#fdfbf7",
    muted: "#a68d7c",
    clay: "#e07a5f",
    green: "#f2cc8f",
    cream: "#4c3a2e",
    border: "rgba(253,251,247,0.08)",
  },
  N: {
    name: "Sage & Lavender Dream",
    bg: "#e3e8e1",
    surface: "#d1dcd0",
    ink: "#1a1c18",
    muted: "#5a6358",
    clay: "#7b2cbf",
    green: "#4f359b",
    cream: "#e3e8e1",
    border: "rgba(26,28,24,0.08)",
  },
  O: {
    name: "Brutalist Acid Chrome",
    bg: "#141517",
    surface: "#1e2024",
    ink: "#e2e8f0",
    muted: "#717984",
    clay: "#d946ef",
    green: "#38bdf8",
    cream: "#222429",
    border: "rgba(255,255,255,0.08)",
  },
  P: {
    name: "Dark Royal Emerald",
    bg: "#081c15",
    surface: "#0d2d22",
    ink: "#f4f9f4",
    muted: "#709f8d",
    clay: "#d4af37",
    green: "#52b788",
    cream: "#0d2d22",
    border: "rgba(212,175,55,0.12)",
  },
  Q: {
    name: "Obsidian & Liquid Mercury",
    bg: "#000000",
    surface: "#111111",
    ink: "#f3f4f6",
    muted: "#888888",
    clay: "#ffffff",
    green: "#3b82f6",
    cream: "#222222",
    border: "rgba(255,255,255,0.08)",
  },
  R: {
    name: "Terracotta Ink & Sand",
    bg: "#1e1916",
    surface: "#2d2521",
    ink: "#f7ebe8",
    muted: "#a08d88",
    clay: "#ff6b35",
    green: "#f7ebe8",
    cream: "#2d2521",
    border: "rgba(255,107,53,0.12)",
  },
  S: {
    name: "Ultraviolet Cyber-Noir",
    bg: "#030206",
    surface: "#0b0914",
    ink: "#ece8e0",
    muted: "#7f7b8c",
    clay: "#d946ef",
    green: "#38bdf8",
    cream: "#0f0d22",
    border: "rgba(255,255,255,0.06)",
  },
  T: {
    name: "Sage & Copper Editorial",
    bg: "#f3f6f4",
    surface: "#e4ece7",
    ink: "#2f4f4f",
    muted: "#5f8a8a",
    clay: "#b2533e",
    green: "#2f4f4f",
    cream: "#f3f6f4",
    border: "rgba(47,79,79,0.07)",
  },
  U: {
    name: "Solar Glitch Acid",
    bg: "#09090b",
    surface: "#15151c",
    ink: "#e2e8f0",
    muted: "#71717a",
    clay: "#eab308",
    green: "#10b981",
    cream: "#1e1e24",
    border: "rgba(255,255,255,0.06)",
  },
  V: {
    name: "Deep Velvet Bordeaux",
    bg: "#1c0d0d",
    surface: "#2d1616",
    ink: "#fcf8f2",
    muted: "#a8918d",
    clay: "#e5c158",
    green: "#fcf8f2",
    cream: "#2d1616",
    border: "rgba(229,193,88,0.12)",
  },
  W: {
    name: "Sandstone & Prussian Blue",
    bg: "#fbf9f4",
    surface: "#efebe0",
    ink: "#003153",
    muted: "#53728c",
    clay: "#e67e22",
    green: "#003153",
    cream: "#fbf9f4",
    border: "rgba(0,49,83,0.08)",
  },
  X: {
    name: "Cyber Metallic Mint",
    bg: "#0d0f12",
    surface: "#161a22",
    ink: "#bdc3c7",
    muted: "#7f8c8d",
    clay: "#2ecc71",
    green: "#bdc3c7",
    cream: "#161a22",
    border: "rgba(255,255,255,0.05)",
  },
  Y: {
    name: "Aurora Synthwave",
    bg: "#05020c",
    surface: "#0f0724",
    ink: "#f1ebfa",
    muted: "#8a7bba",
    clay: "#ff007f",
    green: "#00f3ff",
    cream: "#160a33",
    border: "rgba(255,0,127,0.15)",
  },
  Z: {
    name: "Monaco Racing Gold",
    bg: "#0c2417",
    surface: "#143d26",
    ink: "#f5fcf8",
    muted: "#7fa88e",
    clay: "#dfb127",
    green: "#52b788",
    cream: "#143d26",
    border: "rgba(223,177,39,0.14)",
  },
  AA: {
    name: "Tuscan Vineyard",
    bg: "#f4ebe1",
    surface: "#e8dac8",
    ink: "#2d172f",
    muted: "#6a526d",
    clay: "#8c2d19",
    green: "#4f5d2f",
    cream: "#f4ebe1",
    border: "rgba(45,23,47,0.08)",
  },
  BB: {
    name: "Tokyo Techno",
    bg: "#000000",
    surface: "#0d0d0d",
    ink: "#ffffff",
    muted: "#777777",
    clay: "#b026ff",
    green: "#39ff14",
    cream: "#151515",
    border: "rgba(176,38,255,0.15)",
  },
  CC: {
    name: "Silent Nordic Ice",
    bg: "#f3f7fa",
    surface: "#e5edf2",
    ink: "#0f2537",
    muted: "#4f6b82",
    clay: "#0066ff",
    green: "#0ea5e9",
    cream: "#f3f7fa",
    border: "rgba(15,37,55,0.08)",
  },
  DD: {
    name: "Desert Dune Editorial",
    bg: "#eadeca",
    surface: "#dccea7",
    ink: "#1d1815",
    muted: "#68594d",
    clay: "#ba5229",
    green: "#2b3e2a",
    cream: "#eadeca",
    border: "rgba(29,24,21,0.08)",
  },
  EE: {
    name: "Tokyo Midnight Cyberpunk",
    bg: "#05050a",
    surface: "#0e1017",
    ink: "#fafafa",
    muted: "#5a6b8c",
    clay: "#00ff66",
    green: "#00f0ff",
    cream: "#05050a",
    border: "rgba(0,240,255,0.12)",
  },
  FF: {
    name: "Kyoto Tea Garden",
    bg: "#1c2b20",
    surface: "#121e15",
    ink: "#f3f6f2",
    muted: "#7d8f82",
    clay: "#c9a054",
    green: "#d9e2d5",
    cream: "#1c2b20",
    border: "rgba(201,160,84,0.14)",
  },
  GG: {
    name: "Nordic Minimalist Pure",
    bg: "#fafafa",
    surface: "#ededed",
    ink: "#111111",
    muted: "#888888",
    clay: "#0033ff",
    green: "#22c55e",
    cream: "#ffffff",
    border: "rgba(17,17,17,0.08)",
  },
  HH: {
    name: "Brutalist Cardboard",
    bg: "#d6cbb5",
    surface: "#c4b89f",
    ink: "#000000",
    muted: "#5c5446",
    clay: "#e63946",
    green: "#2d3a1a",
    cream: "#d6cbb5",
    border: "rgba(0,0,0,0.12)",
  },
  II: {
    name: "Metropolitan Monopolist",
    bg: "#0b132b",
    surface: "#1c2541",
    ink: "#e0e1dd",
    muted: "#3a506b",
    clay: "#5bc0be",
    green: "#a78bfa",
    cream: "#0b132b",
    border: "rgba(91,192,190,0.15)",
  },
  JJ: {
    name: "Sunset Crimson",
    bg: "#2b0f1a",
    surface: "#1a050f",
    ink: "#f7c59f",
    muted: "#7f5a6b",
    clay: "#ff6b35",
    green: "#eef1f7",
    cream: "#2b0f1a",
    border: "rgba(255,107,53,0.15)",
  },
  KK: {
    name: "Desert Sage & Rust",
    bg: "#d4dcd6",
    surface: "#c2cac4",
    ink: "#1e2f23",
    muted: "#57645d",
    clay: "#b8531a",
    green: "#4f5e43",
    cream: "#f5f7f5",
    border: "rgba(184,83,26,0.10)",
  },
  LL: {
    name: "Swiss Brutalist Red",
    bg: "#f9f6f0",
    surface: "#ebe5d9",
    ink: "#111111",
    muted: "#666666",
    clay: "#e60000",
    green: "#0080ff",
    cream: "#ffffff",
    border: "rgba(230,0,0,0.10)",
  },
  MM: {
    name: "Liquid Chrome Synth",
    bg: "#08080a",
    surface: "#15161a",
    ink: "#f1f2f6",
    muted: "#717984",
    clay: "#00ffd2",
    green: "#ff007f",
    cream: "#15161a",
    border: "rgba(0,255,210,0.15)",
  },
  NN: {
    name: "Royal High-Contrast Amber",
    bg: "#000000",
    surface: "#1a1a1a",
    ink: "#fdfcf7",
    muted: "#777777",
    clay: "#ffaa00",
    green: "#00ff88",
    cream: "#1a1a1a",
    border: "rgba(255,170,0,0.18)",
  },
  OO: {
    name: "Vintage Polaroid Print",
    bg: "#fcf9f2",
    surface: "#f2ece0",
    ink: "#222222",
    muted: "#77726a",
    clay: "#e07a5f",
    green: "#407076",
    cream: "#fcf9f2",
    border: "rgba(224,122,95,0.14)",
  },
  PP: {
    name: "Retro CRT Terminal",
    bg: "#030c04",
    surface: "#09180c",
    ink: "#33ff33",
    muted: "#1e5e26",
    clay: "#ffb000",
    green: "#88ff88",
    cream: "#09180c",
    border: "rgba(51,255,51,0.16)",
  },
  QQ: {
    name: "Electric Indigo Brutalist",
    bg: "#3a0ca3",
    surface: "#1a0033",
    ink: "#fafaff",
    muted: "#b5179e",
    clay: "#f72585",
    green: "#4cc9f0",
    cream: "#3a0ca3",
    border: "rgba(247,37,133,0.18)",
  },
  RR: {
    name: "Silent Alabaster & Sage",
    bg: "#faf9f6",
    surface: "#f0eee9",
    ink: "#2a3321",
    muted: "#7a8c73",
    clay: "#c8654b",
    green: "#52796f",
    cream: "#faf9f6",
    border: "rgba(200,101,75,0.12)",
  },
  SS: {
    name: "Cyber Synth Gold",
    bg: "#0c061a",
    surface: "#180d33",
    ink: "#e8daff",
    muted: "#8a7bba",
    clay: "#f39c12",
    green: "#d81b60",
    cream: "#180d33",
    border: "rgba(243,156,18,0.15)",
  },
  TT: {
    name: "Apple Cupertino Studio",
    bg: "#f5f5f7",
    surface: "#e8e8ed",
    ink: "#1d1d1f",
    muted: "#86868b",
    clay: "#0071e3",
    green: "#34c759",
    cream: "#f5f5f7",
    border: "rgba(0,0,0,0.06)",
  },
  UU: {
    name: "Midnight Cyberpunk Acid",
    bg: "#040608",
    surface: "#0d1117",
    ink: "#f0f6fc",
    muted: "#8b949e",
    clay: "#ff003c",
    green: "#abff00",
    cream: "#090d16",
    border: "rgba(255,255,255,0.07)",
  },
  VV: {
    name: "Brutalist Peach & Olive",
    bg: "#fdf5e6",
    surface: "#f5ebdc",
    ink: "#2f3e23",
    muted: "#6b7f5c",
    clay: "#e97451",
    green: "#4f7942",
    cream: "#fdf5e6",
    border: "rgba(47,62,35,0.08)",
  },
  WW: {
    name: "Deep Indigo Cyber-Luxe",
    bg: "#060814",
    surface: "#0f122c",
    ink: "#f1f3f9",
    muted: "#848bb2",
    clay: "#6366f1",
    green: "#a5b4fc",
    cream: "#0b0d24",
    border: "rgba(99,102,241,0.15)",
  },
  XX: {
    name: "Creamy Cocoa Editorial",
    bg: "#faf6f0",
    surface: "#eedecd",
    ink: "#3d2314",
    muted: "#7a5843",
    clay: "#c85a17",
    green: "#526f35",
    cream: "#faf6f0",
    border: "rgba(61,35,20,0.08)",
  },
  YY: {
    name: "Monochrome Stark Minimalist",
    bg: "#ffffff",
    surface: "#f0f0f0",
    ink: "#000000",
    muted: "#666666",
    clay: "#000000",
    green: "#333333",
    cream: "#ffffff",
    border: "rgba(0,0,0,0.12)",
  },
  ZZ: {
    name: "Silent Teal Forest",
    bg: "#0c1917",
    surface: "#152e2a",
    ink: "#e2eded",
    muted: "#728c89",
    clay: "#e9a15a",
    green: "#3fa89e",
    cream: "#152e2a",
    border: "rgba(233,161,90,0.14)",
  },
  AAA: {
    name: "Neo-Brutalist Electric Purple",
    bg: "#000000",
    surface: "#121212",
    ink: "#ffffff",
    muted: "#a3a3a3",
    clay: "#8b5cf6",
    green: "#10b981",
    cream: "#1a1a1a",
    border: "rgba(139,92,246,0.2)",
  },
  BBB: {
    name: "Retro Newspaper Pulp",
    bg: "#f4efe6",
    surface: "#e8ded0",
    ink: "#1c1917",
    muted: "#78716c",
    clay: "#dc2626",
    green: "#16a34a",
    cream: "#f4efe6",
    border: "rgba(28,25,23,0.12)",
  },
  CCC: {
    name: "Nordic Frost & Lavender",
    bg: "#f5f6fa",
    surface: "#e8ecf5",
    ink: "#1e293b",
    muted: "#64748b",
    clay: "#7c3aed",
    green: "#0ea5e9",
    cream: "#f5f6fa",
    border: "rgba(30,41,59,0.08)",
  },
  DDD: {
    name: "Electric Tangerine",
    bg: "#0c0703",
    surface: "#1c0f05",
    ink: "#fdf7f2",
    muted: "#a89b91",
    clay: "#ff6600",
    green: "#38bdf8",
    cream: "#1c0f05",
    border: "rgba(255,102,0,0.18)",
  },
  EEE: {
    name: "Pistachio & Burgundy",
    bg: "#f2f7f4",
    surface: "#e2ebe5",
    ink: "#450a0a",
    muted: "#7f1d1d",
    clay: "#10b981",
    green: "#b91c1c",
    cream: "#f2f7f4",
    border: "rgba(69,10,10,0.08)",
  },
  FFF: {
    name: "Sleek Dark Slate",
    bg: "#0f172a",
    surface: "#1e293b",
    ink: "#f8fafc",
    muted: "#94a3b8",
    clay: "#38bdf8",
    green: "#34d399",
    cream: "#1e293b",
    border: "rgba(56,189,248,0.12)",
  },
  GGG: {
    name: "Gold Leaf on Alabaster",
    bg: "#fdfdfc",
    surface: "#f5f4ef",
    ink: "#1a1813",
    muted: "#6e6859",
    clay: "#cca43b",
    green: "#355c4d",
    cream: "#fdfdfc",
    border: "rgba(204,164,59,0.1)",
  },
  HHH: {
    name: "Brutalist Steel & Flame",
    bg: "#18181b",
    surface: "#27272a",
    ink: "#f4f4f5",
    muted: "#71717a",
    clay: "#ef4444",
    green: "#eab308",
    cream: "#27272a",
    border: "rgba(239,68,68,0.15)",
  },
  III: {
    name: "Swiss Neo-Grotesque Black",
    bg: "#080808",
    surface: "#141414",
    ink: "#ffffff",
    muted: "#8c8c8c",
    clay: "#f3f4f6",
    green: "#a3a3a3",
    cream: "#000000",
    border: "rgba(255,255,255,0.08)",
  },
  JJJ: {
    name: "Pistachio & Chocolate Cream",
    bg: "#FAF6F0",
    surface: "#ede4d5",
    ink: "#3c2f2f",
    muted: "#857373",
    clay: "#556b2f",
    green: "#8b4513",
    cream: "#FAF6F0",
    border: "rgba(60,47,47,0.07)",
  },
  KKK: {
    name: "Kyoto Moss Garden",
    bg: "#151b17",
    surface: "#1f2722",
    ink: "#ecf2ee",
    muted: "#7d8f84",
    clay: "#d4af37",
    green: "#2e5d42",
    cream: "#1f2722",
    border: "rgba(212,175,55,0.12)",
  },
  LLL: {
    name: "Milano Rosso & Cream",
    bg: "#FAF8F5",
    surface: "#f3ebd9",
    ink: "#1c1917",
    muted: "#78716c",
    clay: "#8b0000",
    green: "#4a3c31",
    cream: "#FAF8F5",
    border: "rgba(139,0,0,0.1)",
  },
  MMM: {
    name: "Ocean Depths Indigo",
    bg: "#040510",
    surface: "#0c0d22",
    ink: "#e8effc",
    muted: "#6f82a6",
    clay: "#00f3ff",
    green: "#adff2f",
    cream: "#0c0d22",
    border: "rgba(0,243,255,0.15)",
  },
  NNN: {
    name: "Sahara Sunset & Gold",
    bg: "#1e130c",
    surface: "#2d1f15",
    ink: "#fcf6f0",
    muted: "#a8907d",
    clay: "#ff9f1c",
    green: "#e07a5f",
    cream: "#2d1f15",
    border: "rgba(255,159,28,0.14)",
  },
  OOO: {
    name: "Parisian Café & Linen",
    bg: "#f5f3ef",
    surface: "#e9e5db",
    ink: "#1a2530",
    muted: "#5a6b7c",
    clay: "#b87333",
    green: "#2c3e50",
    cream: "#f5f3ef",
    border: "rgba(26,37,48,0.08)",
  },
  PPP: {
    name: "Electric Acid Cyberpunk",
    bg: "#000000",
    surface: "#140a1c",
    ink: "#ffffff",
    muted: "#9b7eb8",
    clay: "#ff007f",
    green: "#cdfa50",
    cream: "#140a1c",
    border: "rgba(255,0,127,0.2)",
  },
  QQQ: {
    name: "Danish Pastel Mint",
    bg: "#f3f7f4",
    surface: "#e5ece8",
    ink: "#2c3e2f",
    muted: "#6b8e73",
    clay: "#ffb7b2",
    green: "#b5e2fa",
    cream: "#f3f7f4",
    border: "rgba(44,62,47,0.07)",
  },
  RRR: {
    name: "Cyber Brutalist Amber",
    bg: "#0a0a0a",
    surface: "#171717",
    ink: "#f5f5f5",
    muted: "#737373",
    clay: "#ff6600",
    green: "#facc15",
    cream: "#171717",
    border: "rgba(255,102,0,0.18)",
  },
  SSS: {
    name: "Nordic Dusk Lavender",
    bg: "#f4f4f7",
    surface: "#e4e5eb",
    ink: "#1f2029",
    muted: "#64677a",
    clay: "#9f7aea",
    green: "#4299e1",
    cream: "#f4f4f7",
    border: "rgba(159,122,234,0.1)",
  },
  TTT: {
    name: "Golden Honey & Oat",
    bg: "#FAF8F5",
    surface: "#f3efe4",
    ink: "#3d301f",
    muted: "#7c6a51",
    clay: "#d48c00",
    green: "#8e6c43",
    cream: "#FAF8F5",
    border: "rgba(212,140,0,0.1)",
  },
  UUU: {
    name: "Japanese Ink Wash",
    bg: "#faf8f2",
    surface: "#f0ebe0",
    ink: "#0f0f0f",
    muted: "#5c5c5c",
    clay: "#b81d18",
    green: "#2b2b2b",
    cream: "#faf8f2",
    border: "rgba(184,29,24,0.12)",
  },
  VVV: {
    name: "Deep Space Nebula",
    bg: "#05030a",
    surface: "#100b1a",
    ink: "#f1ebfa",
    muted: "#7e6d9b",
    clay: "#bd93f9",
    green: "#8be9fd",
    cream: "#100b1a",
    border: "rgba(189,147,249,0.16)",
  },
  WWW: {
    name: "Alpine Pine & Slate",
    bg: "#f2f5f3",
    surface: "#dfede5",
    ink: "#1b2c23",
    muted: "#4e6a5b",
    clay: "#4f758a",
    green: "#2a4d3b",
    cream: "#f2f5f3",
    border: "rgba(27,44,35,0.08)",
  },
  XXX: {
    name: "Tangerine & Cream Soda",
    bg: "#fdf8f4",
    surface: "#fbebe0",
    ink: "#2c1c0f",
    muted: "#7c5c43",
    clay: "#f97316",
    green: "#06b6d4",
    cream: "#fdf8f4",
    border: "rgba(249,115,22,0.12)",
  },
  YYY: {
    name: "Prada Black & Chrome",
    bg: "#000000",
    surface: "#141414",
    ink: "#fbfbfb",
    muted: "#7c7c7c",
    clay: "#2563eb",
    green: "#a1a1aa",
    cream: "#000000",
    border: "rgba(37,99,235,0.18)",
  },
};

// Curated trendy visual font combinations
export const FONTS = {
  1: {
    name: "THUNDER + NEUE HAAS GROTESK",
    desc: "Barlow Condensed display + Geist Sans body",
    barlow: "var(--font-barlow)",
    displayCond: "var(--font-barlow)",
    editorial: "var(--font-fraunces)",
    jakarta: "var(--font-geist)",
    ui: "var(--font-geist)",
    geist: "var(--font-geist)",
  },
  2: {
    name: "INSTRUMENT SERIF + PLUS JAKARTA SANS",
    desc: "Instrument Serif display + Plus Jakarta Sans body",
    barlow: "var(--font-instrument-serif)",
    displayCond: "var(--font-instrument-serif)",
    editorial: "var(--font-instrument-serif)",
    jakarta: "var(--font-jakarta)",
    ui: "var(--font-jakarta)",
    geist: "var(--font-jakarta)",
  },
  3: {
    name: "SPACE GROTESK + JETBRAINS MONO",
    desc: "Space Grotesk display + JetBrains Mono body",
    barlow: "var(--font-space-grotesk)",
    displayCond: "var(--font-space-grotesk)",
    editorial: "var(--font-fraunces)",
    jakarta: "var(--font-jetbrains)",
    ui: "var(--font-jetbrains)",
    geist: "var(--font-jetbrains)",
  },
  4: {
    name: "FRAUNCES DISPLAY + BARLOW CONDENSED",
    desc: "Fraunces Display + Barlow Condensed body",
    barlow: "var(--font-fraunces)",
    displayCond: "var(--font-fraunces)",
    editorial: "var(--font-fraunces)",
    jakarta: "var(--font-barlow)",
    ui: "var(--font-barlow)",
    geist: "var(--font-barlow)",
  },
  5: {
    name: "DRUK CONDENSED + NEUE HAAS MONO",
    desc: "Bebas Neue Display + DM Mono tabular body",
    barlow: "var(--font-bebas)",
    displayCond: "var(--font-bebas)",
    editorial: "var(--font-dm-mono)",
    jakarta: "var(--font-dm-mono)",
    ui: "var(--font-dm-mono)",
    geist: "var(--font-dm-mono)",
  },
  6: {
    name: "CORMORANT GARAMOND + GEIST SANS",
    desc: "Cormorant Garamond Serif + Geist Sans body",
    barlow: "var(--font-cormorant)",
    displayCond: "var(--font-cormorant)",
    editorial: "var(--font-cormorant)",
    jakarta: "var(--font-geist)",
    ui: "var(--font-geist)",
    geist: "var(--font-geist)",
  },
  7: {
    name: "DM SERIF + MANROPE",
    desc: "DM Serif Display + Manrope UI body",
    barlow: "var(--font-dm-serif)",
    displayCond: "var(--font-dm-serif)",
    editorial: "var(--font-fraunces)",
    jakarta: "var(--font-manrope)",
    ui: "var(--font-manrope)",
    geist: "var(--font-manrope)",
  },
  8: {
    name: "NEWSREADER DISPLAY + GEIST SANS",
    desc: "Newsreader Display + Geist Sans body",
    barlow: "var(--font-newsreader)",
    displayCond: "var(--font-newsreader)",
    editorial: "var(--font-newsreader)",
    jakarta: "var(--font-geist)",
    ui: "var(--font-geist)",
    geist: "var(--font-geist)",
  },
  9: {
    name: "PLUS JAKARTA + GEIST MONO",
    desc: "Plus Jakarta display + Geist Mono body",
    barlow: "var(--font-jakarta)",
    displayCond: "var(--font-jakarta)",
    editorial: "var(--font-jakarta)",
    jakarta: "var(--font-geist-mono)",
    ui: "var(--font-geist-mono)",
    geist: "var(--font-geist-mono)",
  },
  10: {
    name: "THUNDER + FRAUNCES ITALIC",
    desc: "Barlow Condensed display + Fraunces Italic body",
    barlow: "var(--font-barlow)",
    displayCond: "var(--font-barlow)",
    editorial: "var(--font-fraunces)",
    jakarta: "var(--font-fraunces)",
    ui: "var(--font-fraunces)",
    geist: "var(--font-fraunces)",
  },
  11: {
    name: "CLASH DISPLAY + NEUE HAAS",
    desc: "Space Grotesk display + Geist Sans UI",
    barlow: "var(--font-space-grotesk)",
    displayCond: "var(--font-space-grotesk)",
    editorial: "var(--font-fraunces)",
    jakarta: "var(--font-geist)",
    ui: "var(--font-geist)",
    geist: "var(--font-geist)",
  },
  12: {
    name: "DM SERIF + MANROPE",
    desc: "DM Serif Display + Manrope UI",
    barlow: "var(--font-dm-serif)",
    displayCond: "var(--font-dm-serif)",
    editorial: "var(--font-fraunces)",
    jakarta: "var(--font-manrope)",
    ui: "var(--font-manrope)",
    geist: "var(--font-manrope)",
  },
  13: {
    name: "BRUTALIST BEBAS + JETBRAINS",
    desc: "Bebas Neue Display + JetBrains Mono body",
    barlow: "var(--font-bebas)",
    displayCond: "var(--font-bebas)",
    editorial: "var(--font-jetbrains)",
    jakarta: "var(--font-jetbrains)",
    ui: "var(--font-jetbrains)",
    geist: "var(--font-jetbrains)",
  },
  14: {
    name: "NEWSREADER DISPLAY + INTER",
    desc: "Newsreader Serif + Inter Sans body",
    barlow: "var(--font-newsreader)",
    displayCond: "var(--font-newsreader)",
    editorial: "var(--font-newsreader)",
    jakarta: "var(--font-inter)",
    ui: "var(--font-inter)",
    geist: "var(--font-inter)",
  },
  15: {
    name: "FRAUNCES + MANROPE EDITORIAL",
    desc: "Fraunces serif display + Manrope body",
    barlow: "var(--font-fraunces)",
    displayCond: "var(--font-fraunces)",
    editorial: "var(--font-fraunces)",
    jakarta: "var(--font-manrope)",
    ui: "var(--font-manrope)",
    geist: "var(--font-manrope)",
  },
  16: {
    name: "GEIST MONO + PLUS JAKARTA",
    desc: "Geist Mono technical + Plus Jakarta body",
    barlow: "var(--font-geist-mono)",
    displayCond: "var(--font-geist-mono)",
    editorial: "var(--font-fraunces)",
    jakarta: "var(--font-jakarta)",
    ui: "var(--font-jakarta)",
    geist: "var(--font-jakarta)",
  },
  17: {
    name: "INSTRUMENT SERIF + MANROPE",
    desc: "Instrument Serif display + Manrope body",
    barlow: "var(--font-instrument-serif)",
    displayCond: "var(--font-instrument-serif)",
    editorial: "var(--font-instrument-serif)",
    jakarta: "var(--font-manrope)",
    ui: "var(--font-manrope)",
    geist: "var(--font-manrope)",
  },
  18: {
    name: "BEBAS NEUE + GEIST SANS",
    desc: "Bebas Neue brutalist display + Geist Sans body",
    barlow: "var(--font-bebas)",
    displayCond: "var(--font-bebas)",
    editorial: "var(--font-fraunces)",
    jakarta: "var(--font-geist)",
    ui: "var(--font-geist)",
    geist: "var(--font-geist)",
  },
  19: {
    name: "SPACE GROTESK + DM MONO",
    desc: "Space Grotesk display + DM Mono technical body",
    barlow: "var(--font-space-grotesk)",
    displayCond: "var(--font-space-grotesk)",
    editorial: "var(--font-fraunces)",
    jakarta: "var(--font-dm-mono)",
    ui: "var(--font-dm-mono)",
    geist: "var(--font-dm-mono)",
  },
  20: {
    name: "DM SERIF + PLUS JAKARTA SANS",
    desc: "DM Serif Display + Plus Jakarta Sans body",
    barlow: "var(--font-dm-serif)",
    displayCond: "var(--font-dm-serif)",
    editorial: "var(--font-fraunces)",
    jakarta: "var(--font-jakarta)",
    ui: "var(--font-jakarta)",
    geist: "var(--font-jakarta)",
  },
  21: {
    name: "FRAUNCES BOLD + JETBRAINS MONO",
    desc: "Fraunces bold display + JetBrains Mono body",
    barlow: "var(--font-fraunces)",
    displayCond: "var(--font-fraunces)",
    editorial: "var(--font-fraunces)",
    jakarta: "var(--font-jetbrains)",
    ui: "var(--font-jetbrains)",
    geist: "var(--font-jetbrains)",
  },
  22: {
    name: "NEWSREADER ITALIC + GEIST SANS",
    desc: "Newsreader Serif Italic + Geist Sans body",
    barlow: "var(--font-newsreader)",
    displayCond: "var(--font-newsreader)",
    editorial: "var(--font-newsreader)",
    jakarta: "var(--font-geist)",
    ui: "var(--font-geist)",
    geist: "var(--font-geist)",
  },
  23: {
    name: "SPACE GROTESK + INTER SANS",
    desc: "Space Grotesk tech display + Inter Sans body",
    barlow: "var(--font-space-grotesk)",
    displayCond: "var(--font-space-grotesk)",
    editorial: "var(--font-fraunces)",
    jakarta: "var(--font-inter)",
    ui: "var(--font-inter)",
    geist: "var(--font-inter)",
  },
  24: {
    name: "DM SERIF + JETBRAINS MONO",
    desc: "DM Serif Display + JetBrains Mono technical body",
    barlow: "var(--font-dm-serif)",
    displayCond: "var(--font-dm-serif)",
    editorial: "var(--font-dm-serif)",
    jakarta: "var(--font-jetbrains)",
    ui: "var(--font-jetbrains)",
    geist: "var(--font-jetbrains)",
  },
  25: {
    name: "FRAUNCES ITALIC + GEIST MONO",
    desc: "Fraunces Serif Italic display + Geist Mono tech body",
    barlow: "var(--font-fraunces)",
    displayCond: "var(--font-fraunces)",
    editorial: "var(--font-fraunces)",
    jakarta: "var(--font-geist-mono)",
    ui: "var(--font-geist-mono)",
    geist: "var(--font-geist-mono)",
  },
  26: {
    name: "BEBAS NEUE + PLUS JAKARTA SANS",
    desc: "Bebas Neue brutalist display + Plus Jakarta Sans body",
    barlow: "var(--font-bebas)",
    displayCond: "var(--font-bebas)",
    editorial: "var(--font-fraunces)",
    jakarta: "var(--font-jakarta)",
    ui: "var(--font-jakarta)",
    geist: "var(--font-jakarta)",
  },
  27: {
    name: "CORMORANT ITALIC + INTER SANS",
    desc: "Cormorant Garamond Italic + Inter Sans neutral body",
    barlow: "var(--font-cormorant)",
    displayCond: "var(--font-cormorant)",
    editorial: "var(--font-cormorant)",
    jakarta: "var(--font-inter)",
    ui: "var(--font-inter)",
    geist: "var(--font-inter)",
  },
  28: {
    name: "BARLOW CONDENSED + DM MONO",
    desc: "Barlow Condensed display + DM Mono brutalist body",
    barlow: "var(--font-barlow)",
    displayCond: "var(--font-barlow)",
    editorial: "var(--font-fraunces)",
    jakarta: "var(--font-dm-mono)",
    ui: "var(--font-dm-mono)",
    geist: "var(--font-dm-mono)",
  },
};

export function DesignerCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"palettes" | "typography">("palettes");
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof THEMES>("A");
  const [selectedFont, setSelectedFont] = useState<keyof typeof FONTS>(1);
  const [copied, setCopied] = useState(false);

  // Apply default custom variables once mounted to match active state
  useEffect(() => {
    applyTheme("A");
    applyFont(1);
  }, []);

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

  const copyConfig = () => {
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
  
  /* Font Pairing: ${f.name} */
}`;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-[999] flex items-center gap-2 rounded-full bg-[var(--tray-ink)] px-5 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--tray-cream)] shadow-2xl transition hover:scale-105 active:scale-95"
        style={{
          border: "1px solid var(--tray-border)",
          fontFamily: "var(--font-dm-mono)",
        }}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
        </span>
        🎨 Designer Sandbox
      </button>

      {/* Drawer backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Slide-out drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-[1001] flex w-full flex-col bg-[#0b0a09] text-[#edeae4] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] sm:w-[420px] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-[var(--tray-clay)] font-black text-white text-[12px]">
                T
              </span>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-dm-mono)" }}>
                Sandbox Options
              </h2>
            </div>
            <p className="mt-1 text-[0.62rem] uppercase tracking-[0.14em] text-white/40" style={{ fontFamily: "var(--font-dm-mono)" }}>
              Interactive Visual Tuning
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-lg hover:bg-white/10"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5">
          <button
            onClick={() => setActiveTab("palettes")}
            className={`flex-1 py-3.5 text-center text-xs font-bold uppercase tracking-[0.16em] transition ${
              activeTab === "palettes"
                ? "border-b-2 border-[var(--tray-clay)] text-white bg-white/5"
                : "text-white/40 hover:text-white"
            }`}
            style={{ fontFamily: "var(--font-dm-mono)" }}
          >
            Palettes ({Object.keys(THEMES).length})
          </button>
          <button
            onClick={() => setActiveTab("typography")}
            className={`flex-1 py-3.5 text-center text-xs font-bold uppercase tracking-[0.16em] transition ${
              activeTab === "typography"
                ? "border-b-2 border-[var(--tray-clay)] text-white bg-white/5"
                : "text-white/40 hover:text-white"
            }`}
            style={{ fontFamily: "var(--font-dm-mono)" }}
          >
            Typography ({Object.keys(FONTS).length})
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === "palettes" ? (
            <div className="grid grid-cols-1 gap-3">
              {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map((key) => {
                const item = THEMES[key];
                const active = selectedTheme === key;
                return (
                  <button
                    key={key}
                    onClick={() => applyTheme(key)}
                    className={`flex flex-col rounded-xl border p-4 text-left transition hover:scale-[1.01] ${
                      active
                        ? "border-[var(--tray-clay)] bg-white/10"
                        : "border-white/5 bg-[#121110] hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold uppercase tracking-[0.12em]" style={{ fontFamily: "var(--font-dm-mono)" }}>
                        Theme {key}: {item.name}
                      </span>
                      {active && (
                        <span className="h-2 w-2 rounded-full bg-[var(--tray-clay)] shadow-lg shadow-[var(--tray-clay)]" />
                      )}
                    </div>
                    {/* Visual color bar preview */}
                    <div className="mt-3 flex h-4 w-full overflow-hidden rounded-md border border-white/10">
                      <span className="flex-1" style={{ background: item.bg }} title="Background" />
                      <span className="w-1/4" style={{ background: item.surface }} title="Surface" />
                      <span className="w-1/4" style={{ background: item.ink }} title="Text/Ink" />
                      <span className="w-1/4" style={{ background: item.clay }} title="Accent" />
                      <span className="w-1/4" style={{ background: item.green }} title="Cool" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {(Object.keys(FONTS) as unknown as Array<keyof typeof FONTS>).map((key) => {
                const item = FONTS[key];
                const active = selectedFont === Number(key);
                return (
                  <button
                    key={key}
                    onClick={() => applyFont(Number(key) as keyof typeof FONTS)}
                    className={`flex flex-col rounded-xl border p-4 text-left transition hover:scale-[1.01] ${
                      active
                        ? "border-[var(--tray-clay)] bg-white/10"
                        : "border-white/5 bg-[#121110] hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold uppercase tracking-[0.12em]" style={{ fontFamily: "var(--font-dm-mono)" }}>
                        Pair {key}: {item.name}
                      </span>
                      {active && (
                        <span className="h-2 w-2 rounded-full bg-[var(--tray-clay)]" />
                      )}
                    </div>
                    <span className="mt-1 text-[0.68rem] text-white/50">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="border-t border-white/10 bg-[#121110] p-6 space-y-3">
          <div className="rounded-lg border border-white/5 bg-black/40 p-4">
            <span className="block text-[0.62rem] uppercase tracking-[0.16em] text-white/40" style={{ fontFamily: "var(--font-dm-mono)" }}>
              Active Combination:
            </span>
            <span className="mt-1 block text-xs font-bold uppercase tracking-[0.08em] text-white">
              Theme {selectedTheme} + Preset {selectedFont}
            </span>
          </div>

          <button
            onClick={copyConfig}
            className="flex w-full items-center justify-center rounded-xl bg-white text-black py-3.5 text-xs font-bold uppercase tracking-[0.16em] transition hover:bg-white/90 active:scale-98"
            style={{ fontFamily: "var(--font-dm-mono)" }}
          >
            {copied ? "✓ Copied CSS!" : "Copy Active Theme CSS"}
          </button>
        </div>
      </div>
    </>
  );
}
