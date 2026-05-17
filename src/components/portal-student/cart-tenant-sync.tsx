"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart/store";

export function CartTenantSync({ slug }: { slug: string }) {
  const ensure = useCart((s) => s.ensureTenant);
  useEffect(() => {
    ensure(slug);
  }, [slug, ensure]);
  return null;
}
