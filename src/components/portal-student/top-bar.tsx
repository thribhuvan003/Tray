"use client";

import Link from "next/link";
import { Clock, History, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ResolvedTenant, CollegeCanteen } from "@/lib/tenant";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CanteenSwitcher, type CanteenOption } from "@/components/portal-student/canteen-switcher";

function currentServiceLabel(): string {
  const h = new Date(Date.now() + 5.5 * 3600000).getUTCHours();
  if (h < 11) return "Breakfast";
  if (h < 15) return "Lunch";
  if (h < 18) return "Evening";
  return "Dinner";
}

type Props = {
  tenant: ResolvedTenant;
  siblings?: CollegeCanteen[];
};

export function StudentTopBar({ tenant, siblings = [] }: Props) {
  const [t, setT] = useState("");
  const [serviceLabel, setServiceLabel] = useState(() => currentServiceLabel());
  const router = useRouter();

  useEffect(() => {
    const tick = () =>
      setT(new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata",
      }).format(new Date()));
    tick();
    const id = setInterval(() => { tick(); setServiceLabel(currentServiceLabel()); }, 60_000);
    return () => clearInterval(id);
  }, []);

  // Convert CollegeCanteen[] to CanteenOption[] for the switcher
  const canteenOptions = useMemo<CanteenOption[]>(() => {
    if (siblings.length === 0) return [];
    return siblings.map((c) => ({
      id: c.slug,
      name: c.name,
      location: [c.building, c.zone].filter(Boolean).join(" · ") || null,
      isOpen: c.is_open,
      dishCount: c.dishCount,
      queueMinutes: c.is_open
        ? Math.min(20, Math.max(3, 3 + c.pending_orders_count))
        : undefined,
    }));
  }, [siblings]);

  function handleCanteenSelect(canteen: CanteenOption) {
    if (canteen.id !== tenant.slug) {
      router.push(`/c/${canteen.id}/menu`);
    }
  }

  return (
    <header
      className="sticky top-0 z-40 bg-[color:var(--color-paper)]/85 backdrop-blur-xl border-b border-[color:var(--color-line)]"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-6 h-14 flex items-center justify-between gap-3">
        {/* Left: Tray logo → always goes to landing page */}
        <Link
          href="/"
          className="flex-shrink-0 inline-flex items-center gap-2 group"
          aria-label="Back to Tray home"
        >
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-ocean-500 text-black text-[12px] transition group-hover:scale-105"
            style={{ fontFamily: "var(--font-barlow, var(--font-geist))", fontWeight: 900 }}
          >T</span>
          <span
            className="hidden tracking-[-0.05em] sm:inline"
            style={{ fontFamily: "var(--font-fraunces, var(--font-geist))", fontWeight: 700, fontSize: "1.05rem" }}
          >Tray<em className="not-italic text-ocean-500" style={{ fontStyle: "italic" }}>.</em></span>
        </Link>

        {/* Center: canteen switcher (if campus has siblings) or static name */}
        <div className="flex flex-col items-center flex-1 min-w-0 px-2">
          {canteenOptions.length > 1 ? (
            <CanteenSwitcher
              canteens={canteenOptions}
              selectedCanteenId={tenant.slug}
              onSelect={handleCanteenSelect}
            />
          ) : (
            <div className="text-center">
              <div className="text-[13px] font-semibold tracking-tight text-[color:var(--color-ink)] truncate max-w-[180px] sm:max-w-none">
                {tenant.name}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[color:var(--color-ink)]/45">
                {tenant.college_name}
              </div>
            </div>
          )}
          <div className="text-[10px] font-mono tabular text-[color:var(--color-ink)]/40 flex items-center gap-1 mt-0.5">
            <Clock size={9} />
            <span>{serviceLabel} · {t || "--:--"} IST</span>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <ThemeToggle />
          <Link
            href={`/c/${tenant.slug}/orders`}
            aria-label="My orders"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-line)] hover:border-ocean-500 hover:text-ocean-500 transition-colors"
          >
            <History size={15} />
          </Link>
          <Link
            href="/login"
            aria-label="Account"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-line)] hover:border-ocean-500 hover:text-ocean-500 transition-colors"
          >
            <User size={15} />
          </Link>
        </div>
      </div>
    </header>
  );
}
