"use client";

import Link from "next/link";
import { Search, ShoppingCart, User } from "lucide-react";
import type { ResolvedTenant } from "@/lib/tenant";
import { useCart, cartItemCount } from "@/lib/cart/store";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function StudentTopBar({ tenant }: { tenant: ResolvedTenant }) {
  const count = useCart((s) => cartItemCount(s.lines));

  return (
    <header className="appbar">
      <Link className="brand" href="/">
        <span className="brand-mark">T</span>
        <span className="hide-mobile">
          Tray<span style={{ fontStyle: "italic", color: "var(--accent)" }}>.</span>
        </span>
      </Link>
      <label className="search" aria-label="Search dishes">
        <Search />
        <input
          className="input"
          placeholder={`Search dishes at ${tenant.name}...`}
          onFocus={() => window.dispatchEvent(new CustomEvent("tray:focus-search"))}
          readOnly
        />
      </label>
      <div className="right">
        <ThemeToggle />
        <button
          className="btn-icon cart-btn"
          aria-label="Cart"
          onClick={() => window.dispatchEvent(new CustomEvent("tray:cart-open"))}
        >
          <ShoppingCart size={18} />
          {count > 0 && (
            <span className="cnt">
              {count}
            </span>
          )}
        </button>
        <Link href="/login" className="avatar" aria-label="Account">
          <User size={14} />
        </Link>
      </div>
    </header>
  );
}
