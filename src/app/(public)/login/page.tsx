import Link from "next/link";
import { headers } from "next/headers";
import { LoginForm } from "@/components/portal-student/login-form";
import { LoginRoleTabs } from "@/components/portal-student/login-role-tabs";
import { safeNext } from "@/lib/auth/safe-redirect";

export const metadata = { title: "Sign in — Tray" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; tenant?: string; error?: string; role?: string }>;
}) {
  const sp = await searchParams;
  const h = await headers();
  // ?tenant= explicit override, then x-tenant-slug from middleware (set when /c/[slug]/login rewrites here)
  const slug = sp.tenant ?? h.get("x-tenant-slug") ?? "";
  const next = safeNext(sp.next, slug ? `/c/${slug}/menu` : "/");
  const initialRole = (sp.role === "kitchen" || sp.role === "owner") ? sp.role : "student";

  return (
    <div
      data-portal="student"
      className="min-h-screen bg-[color:var(--color-paper)] text-[color:var(--color-ink)] flex flex-col"
    >
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          {/* Brand */}
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 mb-10"
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

          {/* Role tabs + dynamic copy + form */}
          <LoginRoleTabs
            initialRole={initialRole as "student" | "kitchen" | "owner"}
            next={next}
            slug={slug}
            error={sp.error}
          />
        </div>
      </div>
    </div>
  );
}
