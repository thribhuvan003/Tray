import Link from "next/link";
import { ArrowRight } from "lucide-react";

const PORTALS = [
  {
    tone: "student",
    href: "/menu",
    label: "01 — Student",
    title: "Order & ",
    accent: "collect.",
    body: "Mobile-first menu, UPI, OTP pickup. The phone in their hand.",
    classes: {
      card: "bg-ocean-50 dark:bg-ocean-500/10 border-ocean-500/20 hover:border-ocean-500",
      accent: "text-ocean-500",
    },
  },
  {
    tone: "kitchen",
    href: "/kitchen",
    label: "02 — Kitchen",
    title: "Prepare & ",
    accent: "hand over.",
    body: "Live queue with prep timers, status updates, OTP verification.",
    classes: {
      card: "bg-[#fff3e8] dark:bg-amber-500/10 border-amber-500/30 hover:border-amber-500",
      accent: "text-amber-600",
    },
  },
  {
    tone: "admin",
    href: "/admin/dashboard",
    label: "03 — Admin",
    title: "Run the ",
    accent: "operation.",
    body: "Revenue, peak hours, top items, full order history — one console.",
    classes: {
      card: "bg-graphite-900 text-graphite-200 border-lime/30 hover:border-lime",
      accent: "text-lime",
    },
  },
];

export function PortalCards() {
  return (
    <section id="portals" className="py-20 sm:py-32 bg-[color:var(--color-paper-dim)] border-y border-[color:var(--color-line)]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-10 md:gap-16 items-end mb-14">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/55 mb-4">
              <span className="text-ocean-500 font-semibold">03</span> &nbsp;/&nbsp; Three doors
            </div>
            <h2 className="font-display font-medium text-[clamp(36px,5.5vw,64px)] leading-[1.02] tracking-[-0.035em]">
              One system,
              <br />
              <span className="italic text-ocean-500">three doors.</span>
            </h2>
          </div>
          <p className="text-[15px] sm:text-[16px] leading-[1.6] text-[color:var(--color-ink)]/65 max-w-[42ch]">
            The student's app, the kitchen's queue, and the admin console are three
            views of the same data. Pick a door — every door opens.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          {PORTALS.map((p) => (
            <Link
              key={p.label}
              href={p.href}
              className={`group relative rounded-2xl border p-7 sm:p-8 flex flex-col gap-5 min-h-[260px] transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(10,22,40,0.2)] ${p.classes.card}`}
            >
              <div className={`text-[11px] font-mono uppercase tracking-wider ${p.classes.accent}`}>
                {p.label}
              </div>
              <h3 className="font-display font-medium text-[28px] sm:text-[32px] leading-[1.05] tracking-tight">
                {p.title}
                <span className={`italic ${p.classes.accent}`}>{p.accent}</span>
              </h3>
              <p className="text-[14px] leading-[1.6] opacity-75">{p.body}</p>
              <div className={`mt-auto inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-wider font-medium ${p.classes.accent}`}>
                Open <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
