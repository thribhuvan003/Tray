import Link from "next/link";
import type { ResolvedTenant } from "@/lib/tenant";
import { ThemeToggle } from "@/components/ui/theme-toggle";

function Brand() {
  return (
    <Link className="brand" href="/">
      <span className="brand-mark">T</span>
      <span>Tray<span style={{ fontStyle: "italic", color: "var(--accent)" }}>.</span></span>
    </Link>
  );
}

export function LandingPage({ tenant }: { tenant: ResolvedTenant | null }) {
  const college = tenant?.college_name ?? "Aditya Engineering College";

  return (
    <section className="page active landing" data-screen-label="01 Landing">
      <header id="topnav" className="topnav">
        <Brand />
        <nav className="nav-links hide-mobile">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <Link href="/admin/dashboard">For staff</Link>
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          <Link className="btn btn-ghost hide-mobile" href="/login">Sign in</Link>
          <Link className="btn btn-primary" href="/signup">Open menu -&gt;</Link>
        </div>
      </header>

      <div className="hero container">
        <div className="hero-bg" />
        <div className="hero-eyebrow-row">
          <span className="pulse-dot" />
          <span className="eyebrow">Open now - 11:42 AM - {college}</span>
        </div>

        <div className="hero-title-wrap">
          <h1 className="hero-title">
            A canteen system<br />
            for the <span className="it">whole campus.</span>
          </h1>
        </div>

        <div className="hero-meta">
          <div className="col gap-5">
            <p className="hero-lede">
              Tray replaces the printed-token queue with a phone-first ordering system. Students order and pay before
              they walk to the counter. The kitchen sees a live queue. Pickup is verified with a four-digit code.
            </p>
            <div className="hero-cta">
              <Link className="btn btn-primary btn-lg" href="/signup">Open the menu</Link>
              <Link className="btn btn-ghost btn-lg" href="/kitchen">Kitchen view -&gt;</Link>
            </div>
          </div>
          <div className="hero-meta-cards">
            <div className="hero-meta-card"><div className="num">3</div><div className="lbl">Role-based portals</div></div>
            <div className="hero-meta-card"><div className="num">UPI</div><div className="lbl">Native payments</div></div>
            <div className="hero-meta-card"><div className="num">OTP</div><div className="lbl">Verified pickup</div></div>
          </div>
        </div>
      </div>

      <section className="section container">
        <div className="section-head reveal">
          <h2 className="section-title">Three portals,<br />one system.</h2>
          <p className="section-side">Tray runs as a single application with three role-based views. The same data drives every screen.</p>
        </div>
        <div className="portals">
          <Link className="portal-tile reveal" href="/login">
            <div>
              <div className="ix">01 - Student</div>
              <h3>Order and collect.</h3>
              <p>Browse the daily menu, filter by veg or non-veg, pay through UPI, and collect with a four-digit code.</p>
            </div>
            <div className="arrow">Open -&gt;</div>
          </Link>
          <Link className="portal-tile reveal" href="/kitchen">
            <div>
              <div className="ix">02 - Kitchen</div>
              <h3>Prepare and hand over.</h3>
              <p>A live order queue with preparation timers, status updates, and OTP verification for every handover.</p>
            </div>
            <div className="arrow">Open -&gt;</div>
          </Link>
          <Link className="portal-tile reveal" href="/admin/dashboard">
            <div>
              <div className="ix">03 - Admin</div>
              <h3>Manage operations.</h3>
              <p>Daily revenue, peak hours, top-selling items, full order history, and menu management in one console.</p>
            </div>
            <div className="arrow">Open -&gt;</div>
          </Link>
        </div>
      </section>

      <section id="features" className="section container">
        <div className="section-head reveal">
          <h2 className="section-title">What it does.</h2>
          <p className="section-side">Five capabilities that cover the full canteen workflow - from menu publishing to handover.</p>
        </div>
        <div className="feat-grid reveal">
          <Feature n="01" title="Real-time order status." text="Student and kitchen views update from the same source. Status changes propagate without a refresh." />
          <Feature n="02" title="OTP-verified handover." text="Each order generates a four-digit code. Pickup is confirmed only when the code matches at the counter." />
          <Feature n="03" title="Veg and non-veg separated." text="Menu, filters and order tickets carry the FSSAI mark from end to end." />
          <Feature n="04" title="Daily revenue dashboard." text="Total sales, item count, peak hours and top items are calculated from the order log." />
          <Feature n="05" title="UPI payments." text="Each order produces a single-use UPI QR with the exact amount." />
        </div>
      </section>

      <section id="how" className="section container">
        <div className="section-head reveal">
          <h2 className="section-title">How it works.</h2>
          <p className="section-side">A single flow from the student&apos;s phone to the kitchen counter.</p>
        </div>
        <div className="steps reveal">
          <Step n="01" title="Browse the menu." text="Live availability, preparation time, and FSSAI veg or non-veg mark on every item." />
          <Step n="02" title="Pay through UPI." text="Scan a single-use QR with any UPI app. The order is confirmed automatically." />
          <Step n="03" title="Track in real time." text="Watch the order move from queued to preparing to ready, updated by the kitchen." />
          <Step n="04" title="Collect with OTP." text="Read the four-digit code at the counter. Staff verifies and marks the order complete." />
        </div>
      </section>

      <section className="bigcta reveal">
        <h2>Try the system.</h2>
        <p>Walk through the student, kitchen and admin views. No sign-up needed for the demo.</p>
        <div className="row gap-3" style={{ justifyContent: "center" }}>
          <Link className="btn btn-primary btn-lg" href="/signup">Open the student app</Link>
          <Link className="btn btn-ghost btn-lg" href="/kitchen">Open the kitchen view -&gt;</Link>
        </div>
      </section>

      <footer className="footer container">
        <div className="row1">
          <div className="f-about">
            <Brand />
            <p>A canteen ordering system designed for college and university campuses. Open-source friendly and deployable on a single server alongside any college ERP.</p>
          </div>
          <div>
            <h4>About</h4>
            <p className="f-text">Tray is a complete order management system for campus canteens, covering student, kitchen and administrative workflows in one application.</p>
          </div>
          <div>
            <h4>Contact</h4>
            <ul className="f-list">
              <li>github.com/thribhuvan003/Tray</li>
              <li>trayy.vercel.app</li>
            </ul>
          </div>
        </div>
        <div className="wordmark">tray</div>
        <div className="row2"><span>Built as a campus canteen management system.</span><span className="mono">v3.0</span></div>
      </footer>
    </section>
  );
}

function Feature({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="feat">
      <span className="feat-num">{n}</span>
      <div><h3>{title}</h3><p>{text}</p></div>
      <div className="visual"><div className="live-chip"><span className="pulse-dot" /><span className="mono">T-2421 - Preparing</span></div></div>
    </div>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="step">
      <div className="ix">{n}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
