import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-lg border border-graphite-300/30 bg-paper px-3 py-2 text-sm",
        "placeholder:text-graphite-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500 focus-visible:border-transparent",
        "disabled:cursor-not-allowed disabled:opacity-50 tabular",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
