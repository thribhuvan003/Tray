import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Tray",
  description: "Privacy policy for Tray, the campus canteen ordering platform.",
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 80px", fontFamily: "system-ui, sans-serif", lineHeight: 1.7, color: "#1a1a1a" }}>
      <Link href="/" style={{ fontSize: 14, color: "#666", textDecoration: "none" }}>← Back to Tray</Link>
      <h1 style={{ marginTop: 32, marginBottom: 8, fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Privacy Policy</h1>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 40 }}>Effective date: 1 June 2025</p>

      <section>
        <h2>1. What We Collect</h2>
        <p>When you use Tray, we collect:</p>
        <ul>
          <li><strong>Account data:</strong> Email address and display name (provided during sign-up or login via Supabase Auth)</li>
          <li><strong>Order data:</strong> Items ordered, quantities, timestamps, and order status history</li>
          <li><strong>Device/session data:</strong> IP address, browser type, and session token (used for security and rate limiting)</li>
        </ul>
        <p>
          <strong>We do not collect or store</strong> any payment credentials — card numbers, UPI PINs, bank account
          details, or CVVs. All payment data is collected and processed exclusively by Razorpay under their{" "}
          <a href="https://razorpay.com/privacy/" target="_blank" rel="noreferrer">Privacy Policy</a>.
        </p>
      </section>

      <section>
        <h2>2. How We Use Your Data</h2>
        <ul>
          <li>To process and fulfill your food orders</li>
          <li>To show you your order history and status</li>
          <li>To allow Canteen administrators to manage and fulfill orders</li>
          <li>To prevent fraud, abuse, and unauthorised access</li>
          <li>To send transactional emails (e.g., order confirmation) via Resend</li>
        </ul>
        <p>We do not sell your data to third parties. We do not use your data for advertising.</p>
      </section>

      <section>
        <h2>3. Data Isolation</h2>
        <p>
          Each Canteen's data is strictly isolated from other Canteens using row-level security in our database. A
          student's order data at "Canteen A" is never visible to "Canteen B" or its administrators.
        </p>
      </section>

      <section>
        <h2>4. Third-Party Services</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e5e5" }}>
              <th style={{ textAlign: "left", padding: "8px 0", fontWeight: 600 }}>Service</th>
              <th style={{ textAlign: "left", padding: "8px 0", fontWeight: 600 }}>Purpose</th>
              <th style={{ textAlign: "left", padding: "8px 0", fontWeight: 600 }}>Data Shared</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
              <td style={{ padding: "10px 0" }}>Supabase</td>
              <td style={{ padding: "10px 0" }}>Database and authentication</td>
              <td style={{ padding: "10px 0" }}>Email, order data</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
              <td style={{ padding: "10px 0" }}>Razorpay</td>
              <td style={{ padding: "10px 0" }}>Payment processing</td>
              <td style={{ padding: "10px 0" }}>Order amount, UPI/card details (direct, never stored by us)</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
              <td style={{ padding: "10px 0" }}>Vercel</td>
              <td style={{ padding: "10px 0" }}>Hosting and CDN</td>
              <td style={{ padding: "10px 0" }}>Request logs, IP addresses</td>
            </tr>
            <tr>
              <td style={{ padding: "10px 0" }}>Resend</td>
              <td style={{ padding: "10px 0" }}>Transactional email</td>
              <td style={{ padding: "10px 0" }}>Email address, order details</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>5. Data Retention</h2>
        <ul>
          <li>Order history is retained for 90 days after order completion, then archived</li>
          <li>Account data is retained while your account is active</li>
          <li>Session logs are retained for 30 days for security purposes</li>
        </ul>
      </section>

      <section>
        <h2>6. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of your personal data held by us</li>
          <li><strong>Export:</strong> Download your order history (available in the student portal)</li>
          <li><strong>Delete:</strong> Request deletion of your account and associated data</li>
          <li><strong>Correct:</strong> Request correction of inaccurate personal data</li>
        </ul>
        <p>
          To exercise any of these rights, email us at{" "}
          <a href="mailto:taum75448@gmail.com">taum75448@gmail.com</a> with the subject line "Data Request".
          We will respond within 30 days.
        </p>
      </section>

      <section>
        <h2>7. Security</h2>
        <p>
          We use industry-standard security measures including TLS encryption in transit, row-level security in the
          database, HMAC-SHA256 webhook signature verification, and bcrypt-hashed OTP secrets. However, no system
          is perfectly secure — please contact us immediately if you discover a vulnerability.
        </p>
      </section>

      <section>
        <h2>8. Children's Privacy</h2>
        <p>
          Tray is intended for use by college and university students (18 years and above). We do not knowingly
          collect data from users under 18.
        </p>
      </section>

      <section>
        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. The "Effective date" at the top will reflect the latest
          revision. Continued use of the platform constitutes acceptance.
        </p>
      </section>

      <section>
        <h2>10. Contact</h2>
        <p>
          Privacy questions? Email{" "}
          <a href="mailto:taum75448@gmail.com">taum75448@gmail.com</a>.
        </p>
      </section>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #e5e5e5", display: "flex", gap: 24, fontSize: 14 }}>
        <Link href="/legal/terms" style={{ color: "#666" }}>Terms of Service</Link>
        <Link href="/" style={{ color: "#666" }}>Home</Link>
      </div>
    </main>
  );
}
