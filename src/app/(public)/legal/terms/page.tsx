import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Tray",
  description: "Terms of service for Tray, the campus canteen ordering platform.",
};

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 80px", fontFamily: "system-ui, sans-serif", lineHeight: 1.7, color: "#1a1a1a" }}>
      <Link href="/" style={{ fontSize: 14, color: "#666", textDecoration: "none" }}>← Back to Tray</Link>
      <h1 style={{ marginTop: 32, marginBottom: 8, fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Terms of Service</h1>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 40 }}>Effective date: 1 June 2025 · Governing law: India</p>

      <section>
        <h2>1. Who We Are</h2>
        <p>
          Tray is a software platform that enables college and university canteens ("Canteens") to accept digital food
          orders from students ("Students"). Tray is operated by the developer(s) listed at{" "}
          <a href="https://github.com/thribhuvan003/Tray" target="_blank" rel="noreferrer">
            github.com/thribhuvan003/Tray
          </a>
          . Tray is a technology intermediary — it is not the seller of any food or beverages; each Canteen is the
          seller of its own products.
        </p>
      </section>

      <section>
        <h2>2. Acceptance</h2>
        <p>
          By accessing or using Tray (including any canteen sub-domain powered by Tray), you agree to these Terms. If
          you are acting on behalf of a Canteen, you represent that you have authority to bind that Canteen.
        </p>
      </section>

      <section>
        <h2>3. Payments</h2>
        <p>
          All payments are processed by <strong>Razorpay Software Private Limited</strong> under their terms of service
          and privacy policy. Tray does not store any card numbers, UPI PINs, or other payment credentials. When you
          pay via UPI, your funds are transferred directly to the Canteen's registered bank account; Tray does not hold
          or pool money.
        </p>
        <p>Transaction amounts are shown in Indian Rupees (INR) inclusive of any applicable taxes.</p>
      </section>

      <section>
        <h2>4. Cancellations and Refunds</h2>
        <ul>
          <li>
            <strong>Before payment:</strong> You may abandon an order at any time before completing payment; no charge
            is made.
          </li>
          <li>
            <strong>Within 5 minutes of placing a paid order:</strong> You may cancel from the order tracking page.
            Any amount charged will be refunded to the original payment method within 5–7 business days.
          </li>
          <li>
            <strong>After 5 minutes / once preparation begins:</strong> Orders cannot be cancelled by Students. If
            the Canteen rejects your order, a full refund will be issued automatically.
          </li>
          <li>
            <strong>Item unavailable:</strong> If a Canteen marks an item as unavailable after your order is placed,
            they may issue a partial refund for that item at their discretion.
          </li>
        </ul>
        <p>
          Refunds are processed through Razorpay and credited to the original payment source. Tray is not responsible
          for delays caused by your bank or UPI provider.
        </p>
      </section>

      <section>
        <h2>5. Canteen Responsibilities</h2>
        <p>
          Each Canteen is solely responsible for the accuracy of its menu, item availability, food quality, hygiene,
          and timely preparation of orders. Tray provides the technology platform only and makes no representations
          about the food sold by any Canteen.
        </p>
      </section>

      <section>
        <h2>6. Prohibited Use</h2>
        <p>You may not use Tray to:</p>
        <ul>
          <li>Place fraudulent orders or initiate illegitimate chargebacks</li>
          <li>Attempt to access another student's or canteen's data</li>
          <li>Reverse-engineer, scrape, or abuse the platform</li>
          <li>Violate any applicable Indian law or regulation</li>
        </ul>
      </section>

      <section>
        <h2>7. Intellectual Property</h2>
        <p>
          Tray's source code is source-available under the licence in the{" "}
          <a href="https://github.com/thribhuvan003/Tray" target="_blank" rel="noreferrer">
            repository
          </a>
          . The Tray name and logo are the property of the developer. Canteens retain ownership of their menus, logos,
          and branding uploaded to the platform.
        </p>
      </section>

      <section>
        <h2>8. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by applicable law, Tray and its developers shall not be liable for any
          indirect, incidental, or consequential damages arising from your use of the platform, including but not
          limited to food quality issues, payment delays, or loss of order data due to network failures.
        </p>
      </section>

      <section>
        <h2>9. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Material changes will be notified via the platform or by
          email. Continued use after the effective date constitutes acceptance.
        </p>
      </section>

      <section>
        <h2>10. Governing Law and Disputes</h2>
        <p>
          These Terms are governed by the laws of India. Any disputes shall first be attempted to be resolved
          amicably by contacting us at{" "}
          <a href="mailto:taum75448@gmail.com">taum75448@gmail.com</a>. If unresolved, disputes shall be subject
          to the exclusive jurisdiction of the courts of India.
        </p>
      </section>

      <section>
        <h2>11. Contact</h2>
        <p>
          Questions about these Terms? Email us at{" "}
          <a href="mailto:taum75448@gmail.com">taum75448@gmail.com</a>.
        </p>
      </section>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #e5e5e5", display: "flex", gap: 24, fontSize: 14 }}>
        <Link href="/legal/privacy" style={{ color: "#666" }}>Privacy Policy</Link>
        <Link href="/" style={{ color: "#666" }}>Home</Link>
      </div>
    </main>
  );
}
