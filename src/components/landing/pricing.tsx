import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const INCLUDES = [
  "Unlimited orders, students, and menu items",
  "Real-time kitchen queue + admin console",
  "UPI payments — money straight to your account",
  "Daily revenue, peak-hour heatmap, CSV export",
  "Email + magic-link auth, role-based access",
  "Multi-tenant — bring your sister campuses",
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-32 bg-[color:var(--color-paper-dim)] border-y border-[color:var(--color-line)]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-10 md:gap-16 items-end mb-14">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/55 mb-4">
              <span className="text-ocean-500 font-semibold">04</span> &nbsp;/&nbsp; Pricing
            </div>
            <h2 className="font-display font-medium text-[clamp(36px,5.5vw,64px)] leading-[1.02] tracking-[-0.035em]">
              Free for your<br />
              <span className="italic text-ocean-500">first college.</span>
            </h2>
          </div>
          <p className="text-[15px] sm:text-[16px] leading-[1.6] text-[color:var(--color-ink)]/65 max-w-[42ch]">
            No commission. No "platform fee". The canteen connects its own UPI account
            and every rupee lands there. We make money when you grow, not when you sell lunch.
          </p>
        </div>

        <div className="relative mx-auto max-w-3xl rounded-3xl border border-ocean-500/30 bg-[color:var(--color-paper)] p-8 sm:p-12 overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(0,102,255,0.15),transparent_70%)]"
          />
          <div className="relative grid sm:grid-cols-[1fr_auto] gap-6 items-end mb-8">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-ocean-500 mb-2">
                Year one · founding canteens
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[72px] sm:text-[88px] font-medium leading-none tracking-[-0.045em]">₹0</span>
                <span className="text-[16px] text-[color:var(--color-ink)]/55">/ month</span>
              </div>
              <div className="mt-2 text-[14px] text-[color:var(--color-ink)]/65">
                Tray takes <span className="font-semibold text-ocean-500">0%</span> of every order. Forever.
              </div>
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-ocean-500 text-white text-[14px] font-medium hover:bg-ocean-600 transition-colors"
            >
              Get started <ArrowRight size={16} />
            </Link>
          </div>

          <ul className="relative grid sm:grid-cols-2 gap-3 pt-6 border-t border-[color:var(--color-line)]">
            {INCLUDES.map((f) => (
              <li key={f} className="flex items-start gap-3 text-[14px] leading-[1.5]">
                <span className="inline-flex h-5 w-5 mt-0.5 items-center justify-center rounded-full bg-ocean-500/15 text-ocean-500 shrink-0">
                  <Check size={11} strokeWidth={3} />
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
