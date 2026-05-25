"use client";

import Link from "next/link";
import { Clock, History, User, LogOut, ShoppingCart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ResolvedTenant, CollegeCanteen } from "@/lib/tenant";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CanteenSwitcher, type CanteenOption } from "@/components/portal-student/canteen-switcher";
import { getBrowserClient } from "@/lib/supabase/browser";
import type { CurrentUser } from "@/lib/auth/get-user";
import { useCart, cartItemCount } from "@/lib/cart/store";

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
  user?: CurrentUser | null;
};

export function StudentTopBar({ tenant, siblings = [], user }: Props) {
  const lines = useCart((s) => s.lines);
  const count = cartItemCount(lines);
  const setIsOpen = useCart((s) => s.setIsOpen);

  const [t, setT] = useState("");
  const [serviceLabel, setServiceLabel] = useState(() => currentServiceLabel());
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/auth/signout", { method: "POST" });
    window.location.href = `/c/${tenant.slug}/menu`;
  }

  useEffect(() => {
    const tick = () =>
      setT(new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata",
      }).format(new Date()));
    tick();
    const id = setInterval(() => { tick(); setServiceLabel(currentServiceLabel()); }, 60_000);
    return () => clearInterval(id);
  }, []);

  const [activeCanteens, setActiveCanteens] = useState<CollegeCanteen[]>(siblings);

  useEffect(() => {
    const sb = getBrowserClient();
    
    async function fetchFreshSiblings() {
      if (!tenant.college_slug) return;
      const { data, error } = await (sb as any).rpc("college_canteens", { p_college_slug: tenant.college_slug });
      if (!error && data) {
        // Fetch sibling dish counts dynamically on client-side
        const { data: counts } = await (sb as any)
          .from("menu_items")
          .select("id, tenants!inner(slug)")
          .eq("status", "live");

        const canteensList = data as unknown as CollegeCanteen[];
        if (counts) {
          const dishCountsMap: Record<string, number> = {};
          for (const item of counts) {
            const s = (item.tenants as any)?.slug;
            if (s) {
              dishCountsMap[s] = (dishCountsMap[s] || 0) + 1;
            }
          }
          for (const sib of canteensList) {
            sib.dishCount = dishCountsMap[sib.slug] ?? 0;
          }
        }
        setActiveCanteens(canteensList);
      }
    }
    
    // Fetch immediately on mount
    fetchFreshSiblings();

    // Poll every 60s as a safety fallback (Realtime subscription is primary)
    const intervalId = setInterval(fetchFreshSiblings, 60_000);

    // Subscribe to all insertions, updates, or deletes on tenants table
    // to dynamically refresh sibling canteens switcher list.
    const tenantsCh = sb
      .channel("realtime-tenants-global-switcher")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tenants" },
        async (payload) => {
          const newCollegeName = (payload.new as any)?.college_name;
          const oldCollegeName = (payload.old as any)?.college_name;
          
          const isOurCollege = 
            newCollegeName === tenant.college_name ||
            oldCollegeName === tenant.college_name;
            
          if (isOurCollege) {
            await fetchFreshSiblings();
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(intervalId);
      sb.removeChannel(tenantsCh);
    };
  }, [tenant.college_slug, tenant.college_name, router]);

  // Convert CollegeCanteen[] to CanteenOption[] for the switcher
  const canteenOptions = useMemo<CanteenOption[]>(() => {
    const list = activeCanteens.length > 0 ? activeCanteens : [
      {
        slug: tenant.slug,
        name: tenant.name,
        building: tenant.building,
        zone: tenant.zone,
        is_open: tenant.is_open,
        pending_orders_count: tenant.pending_orders_count ?? 0,
        dishCount: 0,
      }
    ];
    return (list as any[]).map((c) => ({
      id: c.slug,
      name: c.name,
      location: [c.building, c.zone].filter(Boolean).join(" · ") || null,
      isOpen: c.is_open,
      dishCount: c.dishCount,
      queueMinutes: c.is_open
        ? Math.min(20, Math.max(3, 3 + c.pending_orders_count))
        : undefined,
      pendingOrdersCount: c.pending_orders_count,
    }));
  }, [activeCanteens, tenant]);

  function handleCanteenSelect(canteen: CanteenOption) {
    if (canteen.id !== tenant.slug) {
      window.location.href = `/c/${canteen.id}/menu`;
    }
  }

  return (
    <header
      className="sticky top-0 z-40 bg-[color:var(--color-paper)]/85 backdrop-blur-xl border-b border-[color:var(--color-line)]"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Tray logo → always goes to landing page */}
        <Link
          href="/"
          className="flex-shrink-0 inline-flex items-center gap-2 group"
          aria-label="Back to Tray home"
        >
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-ocean-500 text-white text-[12px] transition group-hover:scale-105"
            style={{ fontFamily: "var(--font-bricolage)", fontWeight: 900 }}
          >T</span>
          <span
            className="hidden tracking-[-0.02em] sm:inline"
            style={{ fontFamily: "var(--font-bricolage)", fontWeight: 700, fontSize: "1.2rem" }}
          >Tray</span>
        </Link>

        {/* Center: Zomato-style Unified Location & Search Bar with max-width constraint */}
        <div className="flex items-center justify-center flex-1 min-w-0 px-2">
          <div className="w-full max-w-[640px]">
            <CanteenSwitcher
              canteens={canteenOptions}
              selectedCanteenId={tenant.slug}
              onSelect={handleCanteenSelect}
            />
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open tray"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-line)] hover:border-ocean-500 hover:text-ocean-500 transition-colors cursor-pointer"
          >
            <ShoppingCart size={15} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-white text-[9.5px] font-bold">
                {count}
              </span>
            )}
          </button>
          <Link
            href={`/c/${tenant.slug}/orders`}
            aria-label="My orders"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-line)] hover:border-ocean-500 hover:text-ocean-500 transition-colors"
          >
            <History size={15} />
          </Link>
          {user ? (
            <button
              onClick={handleSignOut}
              aria-label="Sign out"
              title={`Sign out (${user.email})`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-line)] hover:border-rose-500 hover:text-rose-500 transition-colors"
            >
              <LogOut size={15} />
            </button>
          ) : (
            <Link
              href={`/c/${tenant.slug}/login?next=/c/${tenant.slug}/menu`}
              aria-label="Account"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-line)] hover:border-ocean-500 hover:text-ocean-500 transition-colors"
            >
              <User size={15} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
