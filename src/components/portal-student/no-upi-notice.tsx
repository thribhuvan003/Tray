"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function NoUpiNotice() {
  useEffect(() => {
    toast.error(
      "Payments are not configured for this canteen yet. You can browse the menu but ordering is unavailable.",
      { duration: 8000, id: "no-upi-notice" }
    );
  }, []);
  return null;
}
