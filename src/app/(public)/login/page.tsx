import Link from "next/link";
import { headers } from "next/headers";
import { safeNext } from "@/lib/auth/safe-redirect";
import { SmartLoginForm } from "@/components/portal-student/smart-login-form";

export const metadata = { title: "Sign in — Tray" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string;
    tenant?: string;
    error?: string;
    role?: string;
    msg?: string;
  }>;
}) {
  const sp = await searchParams;
  const h = await headers();
  const slug = sp.tenant ?? h.get("x-tenant-slug") ?? "";
  const next = safeNext(sp.next, slug ? `/c/${slug}/menu` : "/");

  const infoMsg =
    sp.msg === "select-canteen"
      ? "Signed in! Share your canteen URL with students so they can start ordering."
      : sp.msg === "already-has-canteen"
      ? "Your canteen is already set up. Sign in below to reach your dashboard."
      : undefined;

  return (
    <div
      data-portal="student"
      className="min-h-screen flex items-center justify-center px-5 py-12"
      style={{ background: "var(--color-paper, #F4EFE6)" }}
    >
      <div className="w-full max-w-[400px]">
        {/* Brand */}
        <Link href="/" className="inline-flex items-center gap-2 mb-10" aria-label="Tray home">
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] text-white text-[13px] font-black"
            style={{ background: "var(--color-ink, #1A1A19)", fontFamily: "var(--font-bricolage)" }}
          >
            T
          </span>
          <span
            style={{
              fontFamily: "var(--font-bricolage)",
              fontWeight: 800,
              fontSize: "1.3rem",
              letterSpacing: "-0.03em",
              color: "var(--color-ink, #1A1A19)",
            }}
          >
            Tray
          </span>
        </Link>

        <h1
          className="text-[1.65rem] font-bold tracking-tight mb-1"
          style={{ color: "var(--color-ink)", fontFamily: "var(--font-bricolage)" }}
        >
          Welcome back
        </h1>
        <p className="text-[14px] mb-8" style={{ color: "var(--color-ink)", opacity: 0.5 }}>
          Sign in to continue to your portal.
        </p>

        {/* Info / error banner */}
        {(infoMsg || sp.error) && (
          <div
            className="mb-6 rounded-xl border px-4 py-3 text-[13px] leading-[1.55]"
            style={
              sp.error
                ? { borderColor: "rgba(230,0,0,0.2)", background: "rgba(230,0,0,0.04)", color: "#c00" }
                : { borderColor: "rgba(22,163,74,0.2)", background: "rgba(22,163,74,0.05)", color: "#15803d" }
            }
          >
            {sp.error ?? infoMsg}
          </div>
        )}

        <SmartLoginForm next={next} slug={slug} hintRole={sp.role} />

        <div className="mt-8 pt-6 border-t border-[color:var(--color-line)]">
          <p className="text-[13px] text-center" style={{ color: "var(--color-ink)", opacity: 0.45 }}>
            Setting up a new canteen?{" "}
            <Link
              href="/get-started"
              className="font-semibold hover:underline underline-offset-2"
              style={{ color: "var(--color-ocean-500, #e60000)", opacity: 1 }}
            >
              Get started →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
