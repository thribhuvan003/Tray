import { ScanLine, Smartphone, BellRing, HandPlatter } from "lucide-react";

const STEPS = [
  { time: "11:42", icon: Smartphone, title: "Browse the menu", body: "Diet filter on. Add to cart in a tap. Real menu, real stock — updated as the kitchen cooks." },
  { time: "11:43", icon: ScanLine, title: "Pay by UPI", body: "Scan the QR or tap to open any UPI app. The money goes straight to the canteen — Tray takes nothing." },
  { time: "11:48", icon: BellRing, title: "Track it live", body: "Your phone shows preparing → ready in real time. No refreshing, no guessing." },
  { time: "11:53", icon: HandPlatter, title: "Collect with a code", body: "Read your 4-digit OTP at the counter. Verified in a second. No names shouted across the queue." },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-20 sm:py-32 bg-[color:var(--color-paper-dim)] border-y border-[color:var(--color-line)]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-10 md:gap-16 items-end mb-14">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/55 mb-4">
              <span className="text-ocean-500 font-semibold">01</span> &nbsp;/&nbsp; How it works
            </div>
            <h2 className="font-display font-medium text-[clamp(36px,5.5vw,64px)] leading-[1.02] tracking-[-0.035em]">
              Phone to plate,
              <br />
              in <span className="italic text-ocean-500">eleven minutes.</span>
            </h2>
          </div>
          <p className="text-[15px] sm:text-[16px] leading-[1.6] text-[color:var(--color-ink)]/65 max-w-[42ch]">
            One flow. Four steps. The line stays at zero, the kitchen stays calm, the
            customer goes back to class with food still warm.
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="relative rounded-2xl bg-[color:var(--color-paper)] border border-[color:var(--color-line)] p-6 hover:border-ocean-500/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-ocean-50 text-ocean-500 dark:bg-ocean-500/15">
                  <s.icon size={18} strokeWidth={1.8} />
                </div>
                <div className="text-[11px] font-mono tabular text-[color:var(--color-ink)]/45">
                  {String(i + 1).padStart(2, "0")} · {s.time}
                </div>
              </div>
              <h3 className="font-display text-[20px] sm:text-[22px] leading-tight font-medium mb-2">{s.title}</h3>
              <p className="text-[13.5px] leading-[1.55] text-[color:var(--color-ink)]/65">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
