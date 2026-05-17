import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium tabular",
        className
      )}
      {...props}
    />
  );
}

export function DietDot({ diet }: { diet: "veg" | "nonveg" | "egg" }) {
  const ring =
    diet === "veg"
      ? "border-[#16a34a]"
      : diet === "egg"
      ? "border-[#c69214]"
      : "border-[#dc2626]";
  const fill =
    diet === "veg" ? "bg-[#16a34a]" : diet === "egg" ? "bg-[#c69214]" : "bg-[#dc2626]";
  return (
    <span
      aria-label={diet}
      className={cn(
        "inline-flex h-3 w-3 items-center justify-center border-[1.5px] rounded-sm align-middle",
        ring
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", fill)} />
    </span>
  );
}
