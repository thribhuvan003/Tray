"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, MapPin, Search, X } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export type CanteenOption = {
  id: string;
  name: string;
  location?: string | null;
  isOpen?: boolean;
  dishCount?: number;
  queueMinutes?: number;
  pendingOrdersCount?: number;
};

export function CanteenSwitcher({
  canteens,
  selectedCanteenId,
  onSelect,
}: {
  canteens: CanteenOption[];
  selectedCanteenId: string;
  onSelect: (canteen: CanteenOption) => void;
}) {
  const [open, setOpen] = useState(false);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const searchQuery = searchParams.get("q") || "";

  function handleSearchChange(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    replace(`${pathname}?${params.toString()}`);
  }

  // Handle outside clicks to close the dropdown cleanly
  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".canteen-switcher-container")) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [open]);

  const selected = canteens.find((c) => c.id === selectedCanteenId) ?? canteens[0];

  if (!selected) return null;

  return (
    <div className="canteen-switcher-container relative flex items-center w-full h-10 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow transition-shadow duration-200 px-3">
      {/* Left Section: Zomato-style Custom Curved Dropdown Trigger */}
      <div className="shrink-0 h-full flex items-center">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 cursor-pointer hover:opacity-85 text-left pr-2.5 outline-none select-none h-full shrink-0"
        >
          <MapPin size={15} className="text-rose-500 shrink-0" />
          <span className="text-[12.5px] sm:text-[13.5px] font-semibold text-gray-800 dark:text-gray-200 truncate font-sans">
            {selected.name}
          </span>
          {canteens.length > 1 && (
            <ChevronDown size={12} className="text-gray-400 dark:text-gray-500 shrink-0 mt-0.5 transition-transform duration-200" style={open ? { transform: "rotate(180deg)" } : {}} />
          )}
        </button>
      </div>

      {/* Separator Divider */}
      <div className="w-px h-5 bg-gray-200 dark:bg-gray-800 shrink-0 select-none" />

      {/* Right Section: Zomato Unified Search Input */}
      <div className="flex items-center gap-2 flex-1 min-w-0 pl-2.5">
        <Search size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
        <input
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search for dishes..."
          className="w-full bg-transparent border-none outline-none text-[12px] sm:text-[13px] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-1 py-1 focus:ring-0 focus:border-none focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearchChange("")}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:text-gray-500 transition shrink-0"
            aria-label="Clear search query"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Dropdown Menu - Compact curved edge menu aligned to the left with dynamic content height */}
      {open && canteens.length > 1 && (
        <div className="absolute top-[108%] left-0 z-50 w-72 sm:w-80 bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg py-1.5 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150 outline-none">
          {canteens.map((canteen) => {
            const active = canteen.id === selected.id;
            return (
              <button
                key={canteen.id}
                type="button"
                onClick={() => {
                  onSelect(canteen);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer outline-none ${
                  active
                    ? "bg-rose-500/5 text-rose-600 dark:text-rose-400 font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                }`}
              >
                {/* Left: Active Checkmark indicator with fixed width */}
                <div className="flex items-center justify-center w-4 shrink-0">
                  {active && <Check size={14} className="text-rose-500" />}
                </div>

                {/* Center: Name & Location */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans font-semibold text-[13.5px] sm:text-[14px]">
                    {canteen.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500 truncate font-sans">
                    {canteen.location || "Campus Block"} · {canteen.dishCount ?? 0} dishes
                  </p>
                </div>

                {/* Right: Status Dot */}
                <div className="flex items-center justify-center w-6 shrink-0 pl-2">
                  <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${canteen.isOpen ? "bg-emerald-500" : "bg-gray-300"}`} />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
