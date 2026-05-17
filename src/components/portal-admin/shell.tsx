"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function AdminShell({
  tenantName,
  userEmail,
  children,
}: {
  tenantName: string;
  tenantSlug: string;
  userEmail: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <div className="portal">
      <aside className="sidebar">
        <Link className="brand sidebar-brand" href="/">
          <span className="brand-mark">T</span>
          <span>Tray<span style={{ fontStyle: "italic", color: "var(--accent)" }}>.</span></span>
        </Link>
        <div className="sidebar-section-label">Operations</div>
        <Link className={`sidebar-link ${active("/admin/dashboard") ? "active" : ""}`} href="/admin/dashboard">Overview</Link>
        <Link className={`sidebar-link ${active("/admin/menu") ? "active" : ""}`} href="/admin/menu">Menu manager</Link>
        <Link className={`sidebar-link ${active("/admin/orders") ? "active" : ""}`} href="/admin/orders">Orders</Link>
        <Link className={`sidebar-link ${active("/admin/staff") ? "active" : ""}`} href="/admin/staff">Users</Link>
        <Link className="sidebar-link" href="/kitchen">Kitchen view</Link>

        <div className="sidebar-section-label">Insights</div>
        <Link className={`sidebar-link ${active("/admin/analytics") ? "active" : ""}`} href="/admin/analytics">Reports</Link>
        <Link className="sidebar-link" href="/admin/analytics">Audit log</Link>

        <div className="sidebar-footer">
          <ThemeToggle />
          <div className="sidebar-user">
            <div className="avatar">{(userEmail ?? "A").slice(0, 1).toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis" }}>{userEmail ?? "Admin"}</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Owner - {tenantName}</div>
            </div>
          </div>
          <Link href="/auth/signout" aria-label="Sign out" className="btn-icon">
            <LogOut size={14} />
          </Link>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
