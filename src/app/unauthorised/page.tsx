import { headers } from "next/headers";
import Link from "next/link";
import { ShieldAlert, LogOut, Home } from "lucide-react";
import { resolveTenant, getTenantSlugFromHeaders } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function UnauthorisedPage() {
  const h = await headers();
  const slug = getTenantSlugFromHeaders(h);
  const tenant = await resolveTenant(slug);

  const canteenName = tenant ? tenant.name : "this Canteen";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-cream-50 dark:bg-graphite-950 text-graphite-900 dark:text-cream-100 font-sans">
      <div className="max-w-md w-full border-2 border-tomato-900 dark:border-cream-200/40 bg-white dark:bg-graphite-900 p-8 shadow-[8px_8px_0_0_rgba(213,40,33,1)] dark:shadow-[8px_8px_0_0_rgba(247,200,194,0.3)] text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-tomato-500/10 text-tomato-500">
          <ShieldAlert size={36} />
        </div>
        
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-medium tracking-tight text-tomato-900 dark:text-cream-50">
            Access <span className="italic text-tomato-500">denied.</span>
          </h1>
          <p className="text-sm text-tomato-900/60 dark:text-cream-200/60 leading-relaxed">
            Your account does not have staff or administrator permissions for <strong className="text-tomato-900 dark:text-cream-50 font-semibold">{canteenName}</strong>.
          </p>
        </div>

        <div className="border-t border-tomato-900/10 dark:border-cream-200/10 pt-6 flex flex-col gap-3">
          <Link
            href={slug ? `/c/${slug}/menu` : "/"}
            className="w-full h-12 text-[14px] inline-flex items-center justify-center gap-2 rounded-xl bg-tomato-500 hover:bg-tomato-600 text-white font-bold transition-colors shadow-sm"
          >
            <Home size={16} /> Go to Student Menu
          </Link>
          
          <a
            href={slug ? `/c/${slug}/login?next=/c/${slug}/kitchen` : "/login"}
            className="w-full h-12 text-[14px] inline-flex items-center justify-center gap-2 rounded-xl border-2 border-tomato-900 dark:border-cream-200 hover:bg-tomato-50 dark:hover:bg-graphite-800 transition-colors font-semibold text-tomato-900 dark:text-cream-100"
          >
            <LogOut size={16} /> Log In with Another Account
          </a>
        </div>
      </div>
    </div>
  );
}
