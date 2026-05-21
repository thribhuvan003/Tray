"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Clock, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Drawer } from "vaul";
import * as Popover from "@radix-ui/react-popover";
import { useCart, cartItemCount } from "@/lib/cart/store";
import type { CollegeCanteen } from "@/lib/tenant";

// ── Helpers ──────────────────────────────────────────────────────────────────

function waitMin(c: CollegeCanteen) {
  if (!c.is_open) return null;
  return Math.min(20, Math.max(3, 3 + c.pending_orders_count));
}

function StatusChip({ canteen }: { canteen: CollegeCanteen }) {
  if (!canteen.is_open) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/45">
        Closed
      </span>
    );
  }
  const wait = waitMin(canteen);
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[#16A34A]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-[live-pulse_2s_ease-out_infinite]" />
      Open · ~{wait} min
    </span>
  );
}

// ── Canteen option row ────────────────────────────────────────────────────────

function CanteenOption({
  canteen,
  isCurrent,
  onSelect,
}: {
  canteen: CollegeCanteen;
  isCurrent: boolean;
  onSelect: (slug: string) => void;
}) {
  const location = [canteen.building, canteen.zone].filter(Boolean).join(" · ");

  return (
    <button
      type="button"
      disabled={isCurrent}
      onClick={() => onSelect(canteen.slug)}
      className={[
        "w-full text-left px-4 py-3.5 rounded-xl border transition-all",
        isCurrent
          ? "border-ocean-500 bg-ocean-50 cursor-default"
          : "border-[color:var(--color-line)] hover:border-ocean-500/40 hover:bg-[color:var(--color-paper-dim)] active:scale-[0.98]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-[color:var(--color-ink)] truncate">
              {canteen.name}
            </span>
            {isCurrent && (
              <CheckCircle2
                size={14}
                className="text-ocean-500 flex-shrink-0"
                aria-label="Currently selected"
              />
            )}
          </div>
          {location && (
            <div className="flex items-center gap-1 mt-0.5 text-[11px] text-[color:var(--color-ink)]/45">
              <MapPin size={10} />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
        <StatusChip canteen={canteen} />
      </div>
    </button>
  );
}

// ── Canteen list (shared between drawer and popover) ──────────────────────────

function CanteenList({
  canteens,
  currentSlug,
  collegeName,
  onSelect,
  onClose,
}: {
  canteens: CollegeCanteen[];
  currentSlug: string;
  collegeName: string;
  onSelect: (slug: string) => void;
  onClose: () => void;
}) {
  const lines = useCart((s) => s.lines);
  const itemCount = cartItemCount(lines);
  const pendingFrom = useCart((s) => s.tenantSlug);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);

  const handleSelect = useCallback(
    (slug: string) => {
      if (slug === currentSlug) return;
      if (itemCount > 0 && pendingFrom === currentSlug) {
        // Show in-sheet confirmation
        setPendingSlug(slug);
      } else {
        onSelect(slug);
      }
    },
    [currentSlug, itemCount, pendingFrom, onSelect]
  );

  const targetName = canteens.find((c) => c.slug === pendingSlug)?.name ?? pendingSlug;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/45">
            {collegeName}
          </p>
          <h2 className="text-[17px] font-semibold text-[color:var(--color-ink)] tracking-tight mt-0.5">
            Switch canteen
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="h-8 w-8 flex items-center justify-center rounded-full border border-[color:var(--color-line)] text-[color:var(--color-ink)]/55 hover:text-[color:var(--color-ink)] hover:border-[color:var(--color-line-strong)] transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {/* Inline cart-items warning */}
      {pendingSlug && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
          <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-[color:var(--color-ink)] font-medium">
              Your cart from this canteen will be saved
            </p>
            <p className="text-[12px] text-[color:var(--color-ink)]/60 mt-0.5">
              {itemCount} item{itemCount !== 1 ? "s" : ""} will be waiting when you come back.
              Switch to <strong>{targetName}</strong>?
            </p>
            <div className="flex gap-2 mt-2.5">
              <button
                type="button"
                onClick={() => onSelect(pendingSlug)}
                className="h-8 px-4 rounded-full bg-[color:var(--color-ink)] text-[color:var(--color-paper)] text-[12px] font-medium transition-opacity hover:opacity-80"
              >
                Switch
              </button>
              <button
                type="button"
                onClick={() => setPendingSlug(null)}
                className="h-8 px-4 rounded-full border border-[color:var(--color-line)] text-[color:var(--color-ink)] text-[12px] font-medium transition-colors hover:border-[color:var(--color-line-strong)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {canteens.map((c) => (
          <CanteenOption
            key={c.slug}
            canteen={c}
            isCurrent={c.slug === currentSlug}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <p className="text-[11px] text-[color:var(--color-ink)]/35 text-center font-mono">
        CART IS SAVED PER CANTEEN
      </p>
    </div>
  );
}

// ── Main CanteenSwitcher ──────────────────────────────────────────────────────

type Props = {
  currentSlug: string;
  currentName: string;
  currentBuilding: string | null;
  currentZone: string | null;
  currentIsOpen: boolean;
  collegeName: string;
  collegeSlug: string | null;
  siblings: CollegeCanteen[];
};

export function CanteenSwitcher({
  currentSlug,
  currentName,
  currentBuilding,
  currentZone,
  currentIsOpen,
  collegeName,
  siblings,
}: Props) {
  // All hooks must be called unconditionally before any early return.
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleSelect = useCallback(
    (slug: string) => {
      setDrawerOpen(false);
      setPopoverOpen(false);
      router.push(`/c/${slug}/menu`);
    },
    [router]
  );

  // Don't render the switcher if there's only one canteen
  if (siblings.length <= 1) return null;

  const location = [currentBuilding, currentZone].filter(Boolean).join(" · ");

  const triggerContent = (
    <>
      <div className="flex flex-col items-start min-w-0">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-ink)]/45 leading-none">
          {collegeName}
        </span>
        <span className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[14px] font-semibold text-[color:var(--color-ink)] leading-tight truncate max-w-[140px] sm:max-w-[200px]">
            {currentName}
          </span>
          <ChevronDown size={13} className="flex-shrink-0 text-[color:var(--color-ink)]/55" />
        </span>
        {location && (
          <span className="flex items-center gap-1 mt-0.5 text-[10px] text-[color:var(--color-ink)]/40">
            <MapPin size={9} />
            <span className="truncate">{location}</span>
          </span>
        )}
      </div>
      <span
        className={[
          "w-2 h-2 rounded-full flex-shrink-0 ml-1",
          currentIsOpen ? "bg-[#16A34A]" : "bg-[color:var(--color-ink)]/20",
        ].join(" ")}
        aria-hidden
      />
    </>
  );

  const triggerClass =
    "flex items-center gap-1.5 max-w-full hover:opacity-75 transition-opacity";

  return (
    <>
      {/* ── Mobile: Vaul bottom drawer (hidden on desktop) ────────────── */}
      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Trigger asChild>
          <button
            type="button"
            className={`${triggerClass} lg:hidden`}
            aria-label={`Current canteen: ${currentName}. Tap to switch.`}
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
          >
            {triggerContent}
          </button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-50 outline-none"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            aria-label="Switch canteen"
          >
            <div className="bg-[color:var(--color-paper)] rounded-t-2xl border-t border-[color:var(--color-line)] p-5 pb-6 max-h-[85dvh] overflow-y-auto">
              <div className="w-10 h-1 bg-[color:var(--color-ink)]/15 rounded-full mx-auto mb-5" />
              <CanteenList
                canteens={siblings}
                currentSlug={currentSlug}
                collegeName={collegeName}
                onSelect={handleSelect}
                onClose={() => setDrawerOpen(false)}
              />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* ── Desktop: Radix Popover (hidden on mobile) ─────────────────── */}
      <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className={`${triggerClass} hidden lg:flex`}
            aria-label={`Current canteen: ${currentName}. Click to switch.`}
            aria-haspopup="dialog"
            aria-expanded={popoverOpen}
          >
            {triggerContent}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={12}
            align="center"
            className="z-50 w-80 bg-[color:var(--color-paper)] border border-[color:var(--color-line)] rounded-2xl shadow-xl p-4 outline-none data-[state=open]:animate-[slide-up_0.2s_var(--ease-snap)_both]"
            aria-label="Switch canteen"
          >
            <CanteenList
              canteens={siblings}
              currentSlug={currentSlug}
              collegeName={collegeName}
              onSelect={handleSelect}
              onClose={() => setPopoverOpen(false)}
            />
            <Popover.Arrow className="fill-[color:var(--color-paper)]" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </>
  );
}
