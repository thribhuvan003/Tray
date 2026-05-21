"use client";

import Link from "next/link";
import { ArrowLeft, Clock, History, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ResolvedTenant, CollegeCanteen } from "@/lib/tenant";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CanteenSwitcher } from "@/components/portal-student/canteen-switcher";

function currentServiceLabel(): string {
  const nowUtcMs = Date.now();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const h = new Date(nowUtcMs + istOffsetMs).getUTCHours();
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
  const [t, setT] = useState<string>("");
  const [serviceLabel, setServiceLabel] = useState<string>(() => currentServiceLabel());
  const router = useRouter();

  useEffect(() => {
    const tick = () =>
      setT(
        new Intl.DateTimeFormat("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Asia/Kolkata",
        }).format(new Date())
      );
    tick();
    const id = setInterval(() => {
      tick();
      setServiceLabel(currentServiceLabel());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const hasMultipleCanteens = siblings.length > 1;

  return (
    <header
      className="sticky top-0 z-40 bg-[color:var(--color-paper)]/85 backdrop-blur-xl border-b border-[color:var(--color-line)]"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Left: back + brand */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            aria-label="Go back"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-[12px] font-mono text-[color:var(--color-ink)]/50 hover:text-[color:var(--color-ink)] transition-colors"
          >
            <ArrowLeft size={13} /> Back
          </button>
          <Link
            href={`/c/${tenant.slug}/menu`}
            className="inline-flex items-center gap-2 font-display text-[17px] tracking-tight"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-ocean-500 text-white font-mono text-[11px] font-bold">
              T
            </span>
            <span className="font-medium hidden sm:inline">
              Tray<span className="italic text-ocean-500">.</span>
            </span>
          </Link>
        </div>

        {/* Center: canteen switcher or static name */}
        <div className="flex flex-col items-center flex-1 min-w-0 px-2">
          {hasMultipleCanteens ? (
            <CanteenSwitcher
              currentSlug={tenant.slug}
              currentName={tenant.name}
              currentBuilding={tenant.building ?? null}
              currentZone={tenant.zone ?? null}
              currentIsOpen={tenant.is_open ?? true}
              collegeName={tenant.college_name}
              collegeSlug={tenant.college_slug}
              siblings={siblings}
            />
          ) : (
            <>
              <div className="text-[13px] font-semibold tracking-tight text-[color:var(--color-ink)] truncate max-w-[180px] sm:max-w-none">
                {tenant.name}
              </div>
              <div className="hidden sm:flex text-[10px] font-mono uppercase tracking-[0.14em] text-[color:var(--color-ink)]/45">
                {tenant.college_name}
              </div>
            </>
          )}
          <div className="text-[10px] font-mono tabular text-[color:var(--color-ink)]/40 flex items-center gap-1.5 mt-0.5">
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
            href={`/c/${tenant.slug}/login`}
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
