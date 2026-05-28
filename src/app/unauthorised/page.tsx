import Link from "next/link";
import { headers } from "next/headers";
import { getTenantSlugFromHeaders, resolveTenant } from "@/lib/tenant";
import { getCurrentUser } from "@/lib/auth/get-user";

export const dynamic = "force-dynamic";

export default async function UnauthorisedPage() {
  const h = await headers();
  const slug = getTenantSlugFromHeaders(h);
  const tenant = await resolveTenant(slug).catch(() => null);
  const user = await getCurrentUser().catch(() => null);

  // Determine where each role should actually be so we can offer correct links
  const studentHref = slug ? `/c/${slug}/menu` : "/";
  const kitchenHref = slug ? `/c/${slug}/kitchen/staff-select` : "/";
  const adminHref = slug ? `/c/${slug}/admin/dashboard` : "/";

  const roleLinks: { label: string; href: string; hint: string }[] = [
    { label: "Go to menu", href: studentHref, hint: "Student ordering portal" },
    { label: "Kitchen board", href: kitchenHref, hint: "For kitchen staff" },
    { label: "Admin dashboard", href: adminHref, hint: "For canteen owners" },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-16"
      style={{
        background:
          "radial-gradient(circle at 20% 20%, rgba(230,0,0,0.06), transparent 40%), var(--tray-bg, #F4EFE6)",
        color: "var(--tray-ink, #1A1A19)",
        fontFamily: "var(--font-geist, system-ui)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Brand */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-12"
          aria-label="Tray home"
        >
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-white text-[12px] font-bold"
            style={{ background: "var(--tray-ink, #1A1A19)", fontFamily: "var(--font-bricolage)" }}
          >
            T
          </span>
          <span
            className="tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-bricolage)", fontWeight: 700, fontSize: "1.15rem" }}
          >
            Tray
          </span>
        </Link>

        {/* Status tag */}
        <p
          className="text-[0.72rem] font-bold uppercase tracking-[0.28em] mb-5"
          style={{ fontFamily: "var(--font-dm-mono)", color: "var(--tray-clay, #e60000)" }}
        >
          Access restricted
        </p>

        {/* Heading */}
        <h1
          className="leading-[0.9] tracking-[-0.04em] uppercase mb-4"
          style={{
            fontFamily: "var(--font-barlow, var(--font-bricolage))",
            fontWeight: 900,
            fontSize: "clamp(2.2rem, 6vw, 3.2rem)",
          }}
        >
          Wrong door.{" "}
          <span
            style={{
              fontFamily: "var(--font-fraunces, serif)",
              fontStyle: "italic",
              textTransform: "none",
              fontWeight: 400,
              color: "var(--tray-clay, #e60000)",
            }}
          >
            Wrong role.
          </span>
        </h1>

        <p className="text-[14px] leading-[1.7] opacity-60 mb-8">
          {user
            ? `Your account doesn't have permission to access this section${tenant ? ` of ${tenant.name}` : ""}. Use the links below to go where you belong.`
            : "You need to be signed in with the right role to access this page."}
        </p>

        {/* Role links */}
        <div className="flex flex-col gap-3 mb-8">
          {roleLinks.map(({ label, href, hint }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between rounded-2xl border px-5 py-4 transition-all hover:scale-[1.02] hover:shadow-md"
              style={{
                border: "1px solid var(--tray-border, rgba(26,26,25,0.12))",
                background: "rgba(255,255,255,0.55)",
              }}
            >
              <div>
                <span className="block text-[14px] font-semibold">{label}</span>
                <span
                  className="block text-[11px] mt-0.5 opacity-50 uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-dm-mono)" }}
                >
                  {hint}
                </span>
              </div>
              <span className="opacity-40 text-lg">→</span>
            </Link>
          ))}
        </div>

        {/* Sign out / sign in */}
        <div className="text-[12px] opacity-45 text-center">
          {user ? (
            <>
              Signed in as{" "}
              <span className="font-mono opacity-80">{user.email}</span>
              {" · "}
              <Link href={slug ? `/c/${slug}/login` : "/login"} className="underline">
                Switch account
              </Link>
            </>
          ) : (
            <Link
              href={slug ? `/c/${slug}/login` : "/login"}
              className="underline"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
