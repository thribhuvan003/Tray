const TESTIMONIALS = [
  {
    quote:
      "I used to plan my class around the canteen queue. Now I tap, walk over four minutes later, and eat. It's stupid how much time I got back.",
    name: "Ananya R.",
    role: "Year 3, Mech",
  },
  {
    quote:
      "We do 200 lunches in 40 minutes. Tray showed us our actual peak — 12:18 to 12:34 — and we now staff for it. Revenue up 18% in two months.",
    name: "Pradeep K.",
    role: "Canteen Admin",
  },
  {
    quote:
      "Before this, our register guy used to write tokens on paper. Now everything's on one screen. Even my mother can use it.",
    name: "Karthik V.",
    role: "Year 1, IT",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid md:grid-cols-3 gap-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-paper-dim)] p-7 flex flex-col gap-5"
            >
              <blockquote className="font-display text-[18px] sm:text-[19px] leading-[1.4] tracking-tight">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-auto pt-4 border-t border-[color:var(--color-line)] flex items-center gap-3 text-[13px]">
                <div className="h-9 w-9 rounded-full bg-ocean-500/15 text-ocean-500 inline-flex items-center justify-center font-medium">
                  {t.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/55">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
