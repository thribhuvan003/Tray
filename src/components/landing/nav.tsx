"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const LINKS = [
  { href: "#how", label: "How" },
  { href: "#features", label: "Features" },
  { href: "#portals", label: "For staff" },
  { href: "#pricing", label: "Pricing" },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 16);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors border-b",
        scrolled
          ? "bg-[color:var(--color-paper)]/85 backdrop-blur-xl border-[color:var(--color-line)]"
          : "bg-transparent border-transparent"
      )}
    >
      <nav className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="inline-flex items-center gap-2.5 font-display text-[19px] tracking-tight">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-ocean-500 text-white font-mono text-[12px] font-bold">
            T
          </span>
          <span className="font-medium">Tray<span className="italic text-ocean-500">.</span></span>
        </Link>

        <ul className="hidden md:flex items-center gap-7 text-[13.5px] text-[color:var(--color-ink)]/70">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="hover:text-ocean-500 transition-colors">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-[13.5px] text-[color:var(--color-ink)]/70 hover:text-ocean-500 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 rounded-full bg-ocean-500 text-white px-4 h-9 text-[13px] font-medium hover:bg-ocean-600 transition-colors"
          >
            Open the menu
            <span aria-hidden>→</span>
          </Link>
        </div>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-line)]"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-[color:var(--color-line)] bg-[color:var(--color-paper)]">
          <div className="mx-auto max-w-7xl px-5 py-4 flex flex-col gap-1">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-[15px] text-[color:var(--color-ink)]/80"
              >
                {l.label}
              </a>
            ))}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-[color:var(--color-line)]">
              <ThemeToggle />
              <Link
                href="/menu"
                className="inline-flex items-center gap-1.5 rounded-full bg-ocean-500 text-white px-4 h-10 text-[13px] font-medium"
              >
                Open the menu →
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
