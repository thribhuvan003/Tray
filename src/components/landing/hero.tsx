import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ResolvedTenant } from "@/lib/tenant";

export function LandingHero({ tenant }: { tenant: ResolvedTenant | null }) {
  const college = tenant?.college_name ?? "Aditya Engineering College";
  return (
    <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-x-0 -top-32 h-[480px] bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(0,102,255,0.10),transparent_70%)]"
      />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-16 items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-paper-dim)] px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/65">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500">
                <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60" />
              </span>
              Kitchen open · 11:42 AM
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/45">
              {college}
            </span>
          </div>

          <h1 className="font-display font-medium text-[clamp(48px,8.5vw,112px)] leading-[0.96] tracking-[-0.045em]">
            Skip the line.
            <br />
            <span className="italic text-ocean-500">Eat sooner.</span>
          </h1>

          <p className="mt-7 max-w-[44ch] text-[17px] sm:text-[18px] leading-[1.55] text-[color:var(--color-ink)]/70">
            Order from your phone, pay by UPI, collect with a 4-digit code. Tray turns
            the canteen counter into <span className="text-ocean-500 font-medium">a tap</span>{" "}
            — for two thousand students and the kitchen that feeds them.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-ocean-500 text-white text-[14px] font-medium hover:bg-ocean-600 transition-colors"
            >
              Open the menu <ArrowRight size={16} />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-[color:var(--color-line-strong)] text-[14px] font-medium hover:border-ocean-500 hover:text-ocean-500 transition-colors"
            >
              How it works
            </a>
            <span className="text-[12px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/45 ml-1">
              17 dishes available today
            </span>
          </div>
        </div>

        <HeroPhone />
      </div>
    </section>
  );
}

function HeroPhone() {
  return (
    <div className="relative mx-auto w-full max-w-[360px] lg:max-w-none lg:ml-auto">
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-[64px] bg-[radial-gradient(ellipse_at_center,rgba(0,102,255,0.12),transparent_70%)]"
      />
      <div className="relative aspect-[9/19] w-full max-w-[340px] mx-auto rounded-[44px] bg-[color:var(--color-ink)] p-3 shadow-[0_30px_80px_-20px_rgba(10,22,40,0.35)] ring-1 ring-[color:var(--color-line-strong)]">
        <div className="absolute left-1/2 -translate-x-1/2 top-3 h-6 w-24 rounded-full bg-black/95 z-10" />
        <div className="h-full w-full rounded-[36px] bg-[color:var(--color-paper)] overflow-hidden">
          <PhoneScreen />
        </div>
      </div>
      <div className="hidden lg:flex absolute -left-12 top-12 flex-col items-end gap-1 text-[10px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/40">
        <span>01 · MENU</span>
        <span className="w-8 h-px bg-[color:var(--color-line-strong)]" />
      </div>
      <div className="hidden lg:flex absolute -right-14 bottom-24 flex-col items-start gap-1 text-[10px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/40">
        <span>02 · UPI · OTP</span>
        <span className="w-8 h-px bg-[color:var(--color-line-strong)]" />
      </div>
    </div>
  );
}

function PhoneScreen() {
  const items = [
    { name: "Chicken Biryani", price: "₹180", diet: "nonveg" as const },
    { name: "Masala Dosa", price: "₹90", diet: "veg" as const },
    { name: "Filter Coffee", price: "₹30", diet: "veg" as const },
    { name: "Paneer B.M.", price: "₹160", diet: "veg" as const },
  ];
  return (
    <div className="h-full w-full flex flex-col">
      <div className="px-5 pt-7 pb-2 flex items-center justify-between">
        <div className="font-display text-[15px]">
          Tray<span className="italic text-ocean-500">.</span>
        </div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/45">
          11:42
        </div>
      </div>
      <div className="px-5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/45">
          ADITYA · LUNCH
        </div>
        <div className="font-display text-[22px] leading-tight mt-1">
          What's <span className="italic text-ocean-500">cooking.</span>
        </div>
      </div>
      <div className="px-3 mt-3 grid gap-2 flex-1 overflow-hidden">
        {items.map((it) => (
          <div
            key={it.name}
            className="flex items-center gap-3 rounded-2xl border border-[color:var(--color-line)] p-3"
          >
            <div
              className={
                "h-10 w-10 rounded-xl flex items-center justify-center text-[11px] font-mono " +
                (it.diet === "veg"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300")
              }
            >
              {it.diet === "veg" ? "V" : "N"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium truncate">{it.name}</div>
              <div className="text-[11px] text-[color:var(--color-ink)]/55">Mains</div>
            </div>
            <div className="text-[13px] font-medium tabular">{it.price}</div>
            <button className="h-7 w-7 rounded-full bg-ocean-500 text-white text-[14px] leading-none">+</button>
          </div>
        ))}
      </div>
      <div className="mx-3 mb-4 mt-1 rounded-full bg-ocean-500 text-white px-4 py-3 flex items-center justify-between">
        <span className="text-[12px] font-medium">3 items · ₹430</span>
        <span className="text-[12px] font-medium">Pay by UPI →</span>
      </div>
    </div>
  );
}
