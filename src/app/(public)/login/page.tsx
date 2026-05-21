import Link from "next/link";
import { headers } from "next/headers";
import { RoleSelector } from "@/components/auth/RoleSelector";

export const metadata = { title: "Sign in — Tray" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; tenant?: string; error?: string; role?: string }>;
}) {
  const sp = await searchParams;
  const h = await headers();
  const slug = sp.tenant ?? h.get("x-tenant-slug") ?? "";
  const next = sp.next ?? (slug ? `/c/${slug}/menu` : "/");

  return (
    <div
      className="min-h-svh overflow-x-hidden"
      style={{ background: "var(--tray-bg, #D8C9AE)", color: "var(--tray-ink, #1A1614)" }}
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-20 h-[30rem] w-[30rem] rounded-full blur-[6rem]"
          style={{ background: "rgba(184,83,26,0.13)" }} />
        <div className="absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full blur-[6rem]"
          style={{ background: "rgba(42,110,58,0.10)" }} />
      </div>

      <div className="flex min-h-svh flex-col items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-lg">
          {/* Brand */}
          <Link href="/" className="mb-10 inline-flex items-center gap-2.5 group">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-[0.65rem] text-[13px] transition group-hover:scale-105"
              style={{
                fontFamily: "var(--font-barlow)",
                fontWeight: 900,
                background: "var(--tray-ink)",
                color: "var(--tray-cream, #EDE5D2)",
              }}
            >
              T
            </span>
            <span
              className="text-[1.25rem] tracking-[-0.05em]"
              style={{ fontFamily: "var(--font-barlow)", fontWeight: 900, textTransform: "uppercase" }}
            >
              Tray
            </span>
          </Link>

          {/* Headline — Fraunces editorial */}
          <h1
            className="mb-2 leading-[0.9] tracking-[-0.05em]"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontWeight: 900,
              fontSize: "clamp(3rem, 8vw, 5.5rem)",
            }}
          >
            Welcome{" "}
            <em className="not-italic" style={{ fontStyle: "italic", color: "var(--tray-clay)" }}>
              back.
            </em>
          </h1>

          <p
            className="mb-8 text-[1rem] leading-[1.6] opacity-65"
            style={{ fontFamily: "var(--font-geist)" }}
          >
            Tell us who you are and we&rsquo;ll take you straight to the right place.
          </p>

          {/* Role selector → login form */}
          <RoleSelector next={next} slug={slug} error={sp.error} />

          {/* Footer links */}
          <p
            className="mt-8 text-center text-[0.8rem]"
            style={{ fontFamily: "var(--font-geist)", color: "var(--tray-muted)" }}
          >
            New campus?{" "}
            <Link
              href="/get-started"
              className="font-semibold transition hover:opacity-75"
              style={{ color: "var(--tray-clay)" }}
            >
              Set up Tray for free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
