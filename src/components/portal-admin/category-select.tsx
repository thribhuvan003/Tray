"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Custom category picker for the menu-item forms.
 *
 * Replaces a native <select> because a native select's open popup is drawn by
 * the OS — its background and the active-option highlight cannot be restyled,
 * so on a dark OS theme it renders as a grey panel that clashes with the light
 * admin form. This component is fully token-driven (matches --admin-bg-card and
 * the admin font) and submits its value through a hidden input, so the parent
 * server-action form is unchanged.
 */
type Cat = { id: string; name: string };

export function CategorySelect({
  name,
  categories,
  defaultValue = "",
}: {
  name: string;
  categories: Cat[];
  defaultValue?: string;
}) {
  const options: Cat[] = [{ id: "", name: "No category" }, ...categories];
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-lg border border-admin-line-2 bg-admin-bg-card px-3 py-2 text-left text-[14px] text-admin-ink focus:outline-none focus:ring-2 focus:ring-admin-lime-soft focus:border-admin-lime transition-colors"
      >
        <span className={selected.id ? "" : "text-admin-ink-4"}>{selected.name}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-admin-ink-3 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-admin-line-2 bg-admin-bg-card p-1 shadow-lg shadow-black/5"
        >
          {options.map((o) => {
            const active = o.id === value;
            return (
              <li key={o.id || "__none"}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setValue(o.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-[14px] transition-colors ${
                    active
                      ? "bg-admin-lime-soft text-admin-lime font-medium"
                      : o.id
                        ? "text-admin-ink hover:bg-admin-bg-2"
                        : "text-admin-ink-4 hover:bg-admin-bg-2"
                  }`}
                >
                  <span className="truncate">{o.name}</span>
                  {active && (
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
