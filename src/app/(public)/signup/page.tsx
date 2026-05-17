import Link from "next/link";
import { headers } from "next/headers";
import { SignupForm } from "@/components/portal-student/signup-form";
import { resolveTenant } from "@/lib/tenant";

export const metadata = { title: "Create account - Tray" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const h = await headers();
  const tenant = await resolveTenant(h.get("x-tenant-slug") ?? "aditya");

  return (
    <div className="page active" data-screen-label="03 Signup">
      <div className="auth-page">
        <aside className="auth-left">
          <div className="top">
            <Link className="brand" href="/">
              <span className="brand-mark">T</span>
              <span>
                Tray<span style={{ fontStyle: "italic", color: "var(--accent)" }}>.</span>
              </span>
            </Link>
            <span className="eyebrow">Create account / 03</span>
          </div>
          <span className="glyph">&amp;</span>
          <div>
            <p className="quote">
              Order in <span className="it">seconds.</span> Pickup with a <span className="it">code.</span>
            </p>
            <p className="meta">30-second signup - UPI - OTP-secured</p>
          </div>
        </aside>
        <main className="auth-right">
          <div className="auth-form">
            <Link href="/" className="btn btn-ghost btn-sm" style={{ marginBottom: 24 }}>
              Back
            </Link>
            <div className="head">
              <h1>Create your account.</h1>
              <p className="sub">
                Join students already skipping the queue with your {tenant?.college_name ?? "campus"} email
                {tenant?.allowed_domain ? ` (@${tenant.allowed_domain})` : ""}.
              </p>
            </div>
            <SignupForm
              next={sp.next ?? "/menu"}
              tenantSlug={tenant?.slug ?? "aditya"}
              allowedDomain={tenant?.allowed_domain ?? null}
            />
            <p className="sub" style={{ marginTop: 24, textAlign: "center" }}>
              Already have one?{" "}
              <Link href={`/login${sp.next ? `?next=${encodeURIComponent(sp.next)}` : ""}`} style={{ color: "var(--accent)", cursor: "pointer" }}>
                Sign in
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
