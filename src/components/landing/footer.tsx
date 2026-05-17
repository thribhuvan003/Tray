import Link from "next/link";

const COLS = [
  { title: "Product", links: ["Student app", "Kitchen view", "Admin console", "Onboarding"] },
  { title: "Resources", links: ["Spec sheet", "Schema", "API · v1", "Changelog"] },
  { title: "Contact", links: ["hello@tray.app", "github.com/tray", "twitter.com/tray"] },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-[color:var(--color-line)] bg-[color:var(--color-paper-dim)]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-16 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 font-display text-[19px] tracking-tight">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-ocean-500 text-white font-mono text-[12px] font-bold">T</span>
              <span className="font-medium">Tray<span className="italic text-ocean-500">.</span></span>
            </Link>
            <p className="mt-4 text-[13.5px] leading-[1.6] text-[color:var(--color-ink)]/65 max-w-[34ch]">
              A canteen ordering system for college and university campuses.
              Self-hostable, multi-tenant, open-source friendly.
            </p>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/55 mb-4 font-semibold">
                {c.title}
              </h4>
              <ul className="flex flex-col gap-3 text-[13.5px] text-[color:var(--color-ink)]/75">
                {c.links.map((l) => (
                  <li key={l}>
                    <a className="hover:text-ocean-500 transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="font-display font-medium select-none text-[120px] sm:text-[180px] lg:text-[220px] leading-[0.86] tracking-[-0.055em] text-[color:var(--color-ink)]/[0.04] text-center border-t border-[color:var(--color-line)] pt-8 overflow-hidden">
          tra<span className="italic text-ocean-500/15">y</span>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-6 text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/45">
          <span>Built for campus canteens · Made in India</span>
          <span>v1.0 · May 2026</span>
        </div>
      </div>
    </footer>
  );
}
