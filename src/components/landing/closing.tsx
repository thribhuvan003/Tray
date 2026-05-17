import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ClosingCta() {
  return (
    <section className="py-24 sm:py-36 text-center relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[400px] bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,rgba(0,102,255,0.14),transparent_70%)]"
      />
      <div className="relative mx-auto max-w-3xl px-5 sm:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-ocean-500/30 bg-ocean-500/10 px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-ocean-500 mb-8">
          <span className="h-2 w-2 rounded-full bg-ocean-500" />
          Demo · live · clickable
        </span>
        <h2 className="font-display font-medium text-[clamp(56px,10vw,128px)] leading-[0.95] tracking-[-0.045em]">
          Skip the <span className="italic text-ocean-500">line.</span>
        </h2>
        <p className="mt-6 max-w-[44ch] mx-auto text-[16px] sm:text-[17px] leading-[1.55] text-[color:var(--color-ink)]/70">
          Walk through the student, kitchen, and admin views. Every metric is wired to
          a real Supabase backend. Nothing to install.
        </p>
        <div className="mt-9 flex flex-wrap gap-3 justify-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-ocean-500 text-white text-[14px] font-medium hover:bg-ocean-600 transition-colors"
          >
            Launch the menu <ArrowRight size={16} />
          </Link>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-[color:var(--color-line-strong)] text-[14px] font-medium hover:border-ocean-500 hover:text-ocean-500 transition-colors"
          >
            Open the console
          </Link>
        </div>
      </div>
    </section>
  );
}
