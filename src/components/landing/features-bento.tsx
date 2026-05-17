import { Activity, ShieldCheck, Leaf, IndianRupee, Flame, LineChart } from "lucide-react";

export function FeaturesBento() {
  return (
    <section id="features" className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-10 md:gap-16 items-end mb-14">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/55 mb-4">
              <span className="text-ocean-500 font-semibold">02</span> &nbsp;/&nbsp; Six things
            </div>
            <h2 className="font-display font-medium text-[clamp(36px,5.5vw,64px)] leading-[1.02] tracking-[-0.035em]">
              that change <span className="italic text-ocean-500">everything.</span>
            </h2>
          </div>
          <p className="text-[15px] sm:text-[16px] leading-[1.6] text-[color:var(--color-ink)]/65 max-w-[42ch]">
            Built like the tools real operators use. Linear's responsiveness, Stripe's
            clarity, the Bloomberg terminal's density — adapted for a canteen counter.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-3 auto-rows-[160px] sm:auto-rows-[200px]">
          <Tile className="col-span-12 md:col-span-7 row-span-2" icon={Activity} title="Real-time order sync" accent="lime">
            <p>Sub-second WebSocket updates from Postgres logical replication. The kitchen sees the order before the student puts their phone away.</p>
            <SparklineRow />
          </Tile>
          <Tile className="col-span-12 md:col-span-5" icon={ShieldCheck} title="4-digit OTP handover">
            <p>Bcrypt-hashed at READY, verified at pickup. Three attempts, then it locks.</p>
          </Tile>
          <Tile className="col-span-6 md:col-span-5" icon={Leaf} title="Veg-safe by design" accent="mint">
            <p>FSSAI-style indicators on every item. No mix-ups.</p>
          </Tile>
          <Tile className="col-span-6 md:col-span-4" icon={IndianRupee} title="UPI native">
            <p>Razorpay rails, Tray takes <b>0%</b>. Money is in the canteen's account before the food is plated.</p>
          </Tile>
          <Tile className="col-span-6 md:col-span-4" icon={Flame} title="Peak-hour heatmap" accent="amber">
            <p>Know exactly when 200 students walk in.</p>
          </Tile>
          <Tile className="col-span-12 md:col-span-4" icon={LineChart} title="Daily revenue">
            <p>Live counter, weekly chart, monthly export. Numbers you can take to the board.</p>
          </Tile>
        </div>
      </div>
    </section>
  );
}

function Tile({
  className = "",
  icon: Icon,
  title,
  accent = "ocean",
  children,
}: {
  className?: string;
  icon: typeof Activity;
  title: string;
  accent?: "ocean" | "lime" | "mint" | "amber";
  children: React.ReactNode;
}) {
  const accentColor =
    accent === "lime"
      ? "text-[#7faf16] bg-[#d2fb50]/15"
      : accent === "mint"
      ? "text-emerald-600 bg-emerald-500/15"
      : accent === "amber"
      ? "text-amber-700 bg-amber-500/15"
      : "text-ocean-500 bg-ocean-50 dark:bg-ocean-500/15";
  return (
    <article
      className={`relative rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-paper-dim)] p-6 flex flex-col gap-3 overflow-hidden hover:border-ocean-500/40 transition-colors ${className}`}
    >
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${accentColor}`}>
        <Icon size={16} strokeWidth={1.8} />
      </div>
      <h3 className="font-display font-medium text-[18px] sm:text-[20px] leading-tight tracking-tight">{title}</h3>
      <div className="text-[13px] leading-[1.55] text-[color:var(--color-ink)]/65 [&_b]:text-[color:var(--color-ink)] [&_b]:font-semibold">
        {children}
      </div>
    </article>
  );
}

function SparklineRow() {
  return (
    <svg viewBox="0 0 400 60" className="w-full mt-auto" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkA" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(0,102,255)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="rgb(0,102,255)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 45 L40 38 L80 42 L120 30 L160 33 L200 22 L240 26 L280 14 L320 17 L360 8 L400 12 L400 60 L0 60 Z" fill="url(#sparkA)" />
      <path d="M0 45 L40 38 L80 42 L120 30 L160 33 L200 22 L240 26 L280 14 L320 17 L360 8 L400 12" fill="none" stroke="rgb(0,102,255)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
