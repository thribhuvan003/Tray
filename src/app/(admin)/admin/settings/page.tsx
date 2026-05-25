import { headers } from "next/headers";
import { resolveTenant, getTenantSlugFromHeaders } from "@/lib/tenant";
import { getAdminClient } from "@/lib/supabase/admin";
import { updateCanteenHours, pauseCanteen, updateCanteenSettings } from "../_actions";
import type { Tenant } from "@/lib/db/types";
import { PauseCountdown } from "@/components/portal-admin/pause-countdown";

export const dynamic = "force-dynamic";

function formatPausedUntil(pausedUntil: string | null): string | null {
  if (!pausedUntil) return null;
  const until = new Date(pausedUntil);
  const now = new Date();
  const diffMs = until.getTime() - now.getTime();
  if (diffMs <= 0) return null;
  const diffMin = Math.ceil(diffMs / 60_000);
  if (diffMin >= 60) {
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${diffMin}m`;
}

export default async function SettingsPage() {
  const h = await headers();
  const slug = getTenantSlugFromHeaders(h);
  const tenant = await resolveTenant(slug);
  if (!tenant) return null;

  const tenantSlug = tenant.slug;

  // Fetch full tenant row (resolveTenant only returns a subset)
  const admin = getAdminClient(tenant.id);
  const { data: tenantRow } = await admin
    .from("tenants")
    .select("is_open, opens_at, closes_at, paused_until, guest_orders_enabled, upi_vpa")
    .eq("id", tenant.id)
    .single<
      Pick<
        Tenant,
        "is_open" | "opens_at" | "closes_at" | "paused_until" | "guest_orders_enabled" | "upi_vpa"
      >
    >();

  const row = tenantRow ?? {
    is_open: false,
    opens_at: null,
    closes_at: null,
    paused_until: null,
    guest_orders_enabled: false,
    upi_vpa: null,
  };

  const pauseCountdown = formatPausedUntil(row.paused_until);
  const isPaused = pauseCountdown !== null;

  // ── Bound server actions (form bindings) ──────────────────────────────────

  async function handleHours(fd: FormData) {
    "use server";
    const isOpen = fd.get("is_open") === "on";
    const opensAt = (fd.get("opens_at") as string | null) || null;
    const closesAt = (fd.get("closes_at") as string | null) || null;
    await updateCanteenHours({ isOpen, opensAt, closesAt, tenantSlug });
  }

  async function handlePause15(fd: FormData) {
    "use server";
    void fd;
    await pauseCanteen(15, tenantSlug);
  }

  async function handlePause30(fd: FormData) {
    "use server";
    void fd;
    await pauseCanteen(30, tenantSlug);
  }

  async function handlePause60(fd: FormData) {
    "use server";
    void fd;
    await pauseCanteen(60, tenantSlug);
  }

  async function handleClearPause(fd: FormData) {
    "use server";
    void fd;
    await pauseCanteen(0, tenantSlug);
  }

  async function handleSettings(fd: FormData) {
    "use server";
    const guestOrdersEnabled = fd.get("guest_orders_enabled") === "on";
    const upiVpa = (fd.get("upi_vpa") as string | null)?.trim() || null;
    await updateCanteenSettings({ guestOrdersEnabled, upiVpa, tenantSlug });
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-8 border-b border-[var(--admin-line)] pb-5">
        <h1 className="font-display text-[30px] sm:text-[36px] font-medium tracking-tight text-[var(--admin-ink)]">
          Manage Canteen <span className="it text-[var(--admin-lime)]">Settings</span>
        </h1>
        <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--admin-ink-3)] mt-1">
          Canteen configuration & portal preferences
        </div>
      </div>

      <div className="flex flex-col gap-6 max-w-xl">
        {/* ── 1. Canteen status ─────────────────────────────────────── */}
        <section className="rounded-xl border border-[var(--admin-line-2)] bg-[var(--admin-bg-2)] p-6 shadow-sm">
          <h2 className="text-[12px] font-mono font-semibold uppercase tracking-[0.16em] text-[var(--admin-lime)] mb-4">
            Canteen status
          </h2>

          {/* Open/close toggle */}
          <form action={handleHours} className="mb-5">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                name="is_open"
                defaultChecked={row.is_open}
                className="h-4 w-4 rounded border-[var(--admin-line-3)] accent-[var(--admin-lime)] bg-[var(--admin-bg-3)] focus:ring-[var(--admin-lime)]"
              />
              {/* hidden time fields preserve current values when toggling */}
              <input type="hidden" name="opens_at" value={row.opens_at ?? ""} />
              <input type="hidden" name="closes_at" value={row.closes_at ?? ""} />
              <span className="text-[14px] text-[var(--admin-ink)] font-semibold">
                Canteen is open
              </span>
            </label>
            <button
              type="submit"
              className="mt-4 h-9 px-4 rounded-md bg-[var(--admin-lime)] text-[var(--admin-bg)] text-[12px] font-bold hover:bg-[var(--admin-lime-2)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              Save open/close
            </button>
          </form>

          {/* Pause orders */}
          <div className="border-t border-[var(--admin-line)] pt-4">
            <div className="text-[13px] text-[var(--admin-ink-2)] font-semibold mb-3">
              Pause orders
              {row.paused_until && (
                <PauseCountdown pausedUntil={row.paused_until} />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <form action={handlePause15}>
                <button
                  type="submit"
                  className="h-9 px-3.5 rounded-md border border-[var(--admin-line-2)] bg-[var(--admin-bg-3)] text-[11px] font-mono text-[var(--admin-ink-2)] hover:border-[var(--admin-lime)] hover:text-[var(--admin-lime)] transition-all duration-200 cursor-pointer"
                >
                  15 min
                </button>
              </form>
              <form action={handlePause30}>
                <button
                  type="submit"
                  className="h-9 px-3.5 rounded-md border border-[var(--admin-line-2)] bg-[var(--admin-bg-3)] text-[11px] font-mono text-[var(--admin-ink-2)] hover:border-[var(--admin-lime)] hover:text-[var(--admin-lime)] transition-all duration-200 cursor-pointer"
                >
                  30 min
                </button>
              </form>
              <form action={handlePause60}>
                <button
                  type="submit"
                  className="h-9 px-3.5 rounded-md border border-[var(--admin-line-2)] bg-[var(--admin-bg-3)] text-[11px] font-mono text-[var(--admin-ink-2)] hover:border-[var(--admin-lime)] hover:text-[var(--admin-lime)] transition-all duration-200 cursor-pointer"
                >
                  60 min
                </button>
              </form>
              {isPaused && (
                <form action={handleClearPause}>
                  <button
                    type="submit"
                    className="h-9 px-3.5 rounded-md border border-[var(--admin-mint)] text-[var(--admin-mint)] hover:bg-[var(--admin-mint-soft)] text-[11px] font-mono transition-all duration-200 cursor-pointer"
                  >
                    Clear pause
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ── 2. Operating hours ────────────────────────────────────── */}
        <section className="rounded-xl border border-[var(--admin-line-2)] bg-[var(--admin-bg-2)] p-6 shadow-sm">
          <h2 className="text-[12px] font-mono font-semibold uppercase tracking-[0.16em] text-[var(--admin-lime)] mb-4">
            Operating hours
          </h2>
          <form action={handleHours} className="flex flex-col gap-4">
            {/* preserve is_open when changing hours */}
            <input type="hidden" name="is_open" value={row.is_open ? "on" : ""} />
            <div className="flex gap-4 flex-wrap">
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--admin-ink-3)]">
                  Opens at
                </span>
                <input
                  type="time"
                  name="opens_at"
                  defaultValue={row.opens_at ?? ""}
                  className="h-10 px-3.5 rounded-md border border-[var(--admin-line-2)] bg-[var(--admin-bg-3)] text-[14px] text-[var(--admin-ink)] focus:border-[var(--admin-lime)] focus:ring-[var(--admin-lime)] focus:outline-none transition-colors"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--admin-ink-3)]">
                  Closes at
                </span>
                <input
                  type="time"
                  name="closes_at"
                  defaultValue={row.closes_at ?? ""}
                  className="h-10 px-3.5 rounded-md border border-[var(--admin-line-2)] bg-[var(--admin-bg-3)] text-[14px] text-[var(--admin-ink)] focus:border-[var(--admin-lime)] focus:ring-[var(--admin-lime)] focus:outline-none transition-colors"
                />
              </label>
            </div>
            <div className="mt-2">
              <button
                type="submit"
                className="h-9 px-4 rounded-md bg-[var(--admin-lime)] text-[var(--admin-bg)] text-[12px] font-bold hover:bg-[var(--admin-lime-2)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                Save hours
              </button>
            </div>
          </form>
        </section>

        {/* ── 3 & 4. Guest orders + UPI VPA (single form) ───────────── */}
        <section className="rounded-xl border border-[var(--admin-line-2)] bg-[var(--admin-bg-2)] p-6 shadow-sm">
          <h2 className="text-[12px] font-mono font-semibold uppercase tracking-[0.16em] text-[var(--admin-lime)] mb-4">
            Ordering settings
          </h2>
          <form action={handleSettings} className="flex flex-col gap-5">
            {/* Guest orders */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="guest_orders_enabled"
                  defaultChecked={row.guest_orders_enabled}
                  className="mt-1 h-4 w-4 rounded border-[var(--admin-line-3)] accent-[var(--admin-lime)] bg-[var(--admin-bg-3)] focus:ring-[var(--admin-lime)]"
                />
                <div>
                  <div className="text-[14px] text-[var(--admin-ink)] font-semibold">
                    Allow guest orders
                  </div>
                  <div className="text-[12px] text-[var(--admin-ink-3)] mt-1">
                    Allow visitors without a college email to order
                  </div>
                </div>
              </label>
            </div>

            {/* UPI ID */}
            <div className="border-t border-[var(--admin-line)] pt-4 flex flex-col gap-1.5">
              <label
                htmlFor="upi_vpa"
                className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--admin-ink-3)]"
              >
                UPI ID <span className="normal-case tracking-normal font-sans text-[var(--admin-ink-3)]/70">(your payment address)</span>
              </label>
              <input
                id="upi_vpa"
                type="text"
                name="upi_vpa"
                defaultValue={row.upi_vpa ?? ""}
                placeholder="e.g. canteen@okaxis or 9876543210@ybl"
                className="h-10 px-3.5 rounded-md border border-[var(--admin-line-2)] bg-[var(--admin-bg-3)] text-[14px] text-[var(--admin-ink)] placeholder:text-[var(--admin-ink-3)]/40 focus:border-[var(--admin-lime)] focus:ring-[var(--admin-lime)] focus:outline-none transition-colors"
              />
              <p className="text-[12px] text-[var(--admin-ink-3)] mt-2 leading-relaxed">
                Your UPI ID (e.g. yourname@okaxis). Students will pay directly to this ID — money goes straight to your bank. No platform cut.
              </p>
            </div>

            <div className="mt-2">
              <button
                type="submit"
                className="h-9 px-4 rounded-md bg-[var(--admin-lime)] text-[var(--admin-bg)] text-[12px] font-bold hover:bg-[var(--admin-lime-2)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                Save settings
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
