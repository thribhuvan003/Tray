import Link from "next/link";

export const metadata = {
  title: "Get Tray for your canteen — Tray",
  description:
    "Set up Tray for your campus canteen, food stall, or any food outlet. Get your own ordering portal, kitchen dashboard, and payments in minutes.",
};

export default function GetStartedPage() {
  return (
    <div
      data-portal="student"
      className="min-h-screen bg-[color:var(--color-paper)] text-[color:var(--color-ink)] flex flex-col"
    >
      {/* Top nav */}
      <header className="border-b border-[color:var(--color-line)] px-5 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2"
          aria-label="Tray home"
        >
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-ocean-500 text-white text-[12px] font-bold"
            style={{ fontFamily: "var(--font-bricolage)", fontWeight: 900 }}
          >
            T
          </span>
          <span
            className="tracking-[-0.02em]"
            style={{
              fontFamily: "var(--font-bricolage)",
              fontWeight: 700,
              fontSize: "1.2rem",
            }}
          >
            Tray
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-lg">
          {/* Label */}
          <p
            className="text-[0.72rem] font-bold uppercase tracking-[0.24em] text-neutral-400 mb-5"
            style={{ fontFamily: "var(--font-dm-mono)" }}
          >
            Tray for Outlets
          </p>

          {/* Hero */}
          <h1
            className="leading-[0.9] tracking-[-0.04em] uppercase mb-6"
            style={{
              fontFamily: "var(--font-barlow)",
              fontWeight: 900,
              fontSize: "clamp(2.4rem, 6vw, 4rem)",
              color: "var(--tray-ink, var(--color-ink))",
            }}
          >
            Your canteen.
            <br />
            <span
              style={{
                fontFamily: "var(--font-fraunces)",
                fontStyle: "italic",
                textTransform: "none",
                fontWeight: 400,
                color: "var(--color-ocean-500, #e60000)",
              }}
            >
              Fully digital.
            </span>
          </h1>

          <p className="text-[1rem] leading-7 text-neutral-600 mb-10">
            One sign-up gives you a dedicated ordering portal for students, a live
            kitchen queue for staff, and a revenue dashboard for your team — with
            UPI payments settled directly to your account.
          </p>

          {/* Feature list */}
          <ul className="flex flex-col gap-3 mb-10">
            {[
              "Your own subdomain (yourcanteen.trayy.app)",
              "Live menu with categories, prices & availability",
              "Kitchen order queue with 4-digit OTP collection",
              "UPI payments via Razorpay, zero card storage",
              "Multi-canteen support under one college account",
              "Daily revenue reports & CSV export",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-[0.9rem]">
                <span className="mt-0.5 h-5 w-5 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center flex-shrink-0 text-[11px] font-bold">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* CTA card */}
          <div className="rounded-[2rem] border border-[color:var(--color-line)] bg-white p-8 shadow-sm">
            <h2
              className="text-[1.1rem] font-bold mb-2"
              style={{ fontFamily: "var(--font-bricolage)" }}
            >
              Ready to go live?
            </h2>
            <p className="text-[0.88rem] text-neutral-500 mb-6">
              Reach out and we'll get your canteen set up within a day.
            </p>
            <a
              href="mailto:taum75448@gmail.com?subject=Get%20Tray%20for%20my%20canteen"
              className="inline-flex w-full h-12 items-center justify-center rounded-xl bg-ocean-500 text-white font-semibold text-[14px] hover:opacity-90 transition-opacity"
              style={{ fontFamily: "var(--font-bricolage)" }}
            >
              Contact us to get started →
            </a>
            <p className="mt-4 text-center text-[12px] text-neutral-400">
              Already have an account?{" "}
              <Link href="/login?role=owner" className="text-ocean-500 hover:underline">
                Sign in as admin
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[color:var(--color-line)] px-5 py-5">
        <div className="mx-auto max-w-lg flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400">
          <span>
            <Link href="/" className="hover:text-ocean-500 transition-colors font-medium">
              Tray
            </Link>{" "}
            · Campus Edition · Payments by Razorpay
          </span>
          <span className="flex items-center gap-3">
            <Link href="/legal/terms" className="hover:text-ocean-500 transition-colors">
              Terms
            </Link>
            <Link href="/legal/privacy" className="hover:text-ocean-500 transition-colors">
              Privacy
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
