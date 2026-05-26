"use client";

// BUG 3 FIX: The CartDrawer should not appear on pay or track pages because
// it is irrelevant and confusing on those screens. The (student) layout is a
// Server Component so it cannot call usePathname() directly — this thin Client
// Component wrapper checks the path and conditionally renders CartDrawer.

import { usePathname } from "next/navigation";
import { CartDrawer } from "./cart-drawer";

export function CartDrawerConditional({
  tenantSlug,
  tenantName,
}: {
  tenantSlug: string;
  tenantName: string;
}) {
  const pathname = usePathname();
  // Hide the cart on the payment and order-tracking pages.
  if (pathname.includes("/pay/") || pathname.includes("/track/")) {
    return null;
  }
  return <CartDrawer tenantSlug={tenantSlug} tenantName={tenantName} />;
}
