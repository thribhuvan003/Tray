import Link from "next/link";
import { headers } from "next/headers";
import { LoginForm } from "@/components/portal-student/login-form";
import { resolveTenant } from "@/lib/tenant";

export const metadata = { title: "Sign in - Tray" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const h = await headers();
  const tenant = await resolveTenant(h.get("x-tenant-slug") ?? "aditya");
  const next = sp.next ?? null;

  return (
    <div className="page active" data-screen-label="02 Login">
      <div className="auth-page">
        <aside className="auth-left">
          <div className="top">
            <Link className="brand" href="/">
              <span className="brand-mark">T</span>
              <span>
                Tray<span style={{ fontStyle: "italic", color: "var(--accent)" }}>.</span>
              </span>
            </Link>
            <span className="eyebrow">Sign in / 02</span>
          </div>
          <span className="glyph">e</span>
          <div>
            <p className="quote">
              &quot;The shortest distance between hunger and lunch is <span className="it">four digits.</span>&quot;
            </p>
            <p className="meta">Tray - Campus operations - v3.0</p>
          </div>
        </aside>
        <main className="auth-right">
          <div className="auth-form">
            <Link href="/" className="btn btn-ghost btn-sm" style={{ marginBottom: 24 }}>
              Back
            </Link>
            <div className="head">
              <h1>Welcome back.</h1>
              <p className="sub">Sign in with your campus email to continue.</p>
            </div>
            {sp.error && (
              <div className="surface" style={{ color: "var(--err)", padding: 12, marginBottom: 16 }}>
                {sp.error}
              </div>
            )}
            <LoginForm next={next} tenantId={tenant?.id ?? null} />
            <p className="sub" style={{ marginTop: 24, textAlign: "center" }}>
              New to Tray?{" "}
              <Link href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`} style={{ color: "var(--accent)", cursor: "pointer" }}>
                Create an account
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
