export function PullQuote() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <blockquote className="font-display font-medium tracking-[-0.035em] text-[clamp(28px,4.5vw,52px)] leading-[1.1]">
          Lunch hour is thirty minutes. Students currently spend{" "}
          <span className="italic text-ocean-500">twelve of them</span> standing in line —
          shouting names, fumbling change, missing class.
        </blockquote>
        <div className="mt-8 flex items-center gap-3 text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/55">
          <span className="w-8 h-px bg-[color:var(--color-line-strong)]" />
          Aditya Engineering College · Canteen audit · Jan 2026
        </div>
      </div>
    </section>
  );
}
