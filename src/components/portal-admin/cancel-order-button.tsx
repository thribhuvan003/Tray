"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { cancelOrderAsAdmin } from "@/app/(admin)/admin/_actions";

export function CancelOrderButton({ orderId, shortCode }: { orderId: string; shortCode: string }) {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const reason = (e.currentTarget.elements.namedItem("reason") as HTMLInputElement)?.value?.trim() || "Admin cancelled";
          start(async () => {
            const r = await cancelOrderAsAdmin(orderId, reason);
            if (r.ok) toast.success(`#${shortCode} cancelled — refund queued`);
            else toast.error(r.error ?? "Failed to cancel");
            setConfirming(false);
          });
        }}
        className="flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          name="reason"
          defaultValue="Admin cancelled"
          autoFocus
          className="h-7 w-28 rounded border border-graphite-200/20 bg-graphite-600 px-2 text-[11px] text-graphite-200 outline-none focus:border-rose-500/50"
          maxLength={80}
        />
        <button
          type="submit"
          disabled={pending}
          className="h-7 px-2 rounded text-[10px] font-mono uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 disabled:opacity-50 transition-colors"
        >
          {pending ? "…" : "OK"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="h-7 px-2 rounded text-[10px] font-mono uppercase tracking-wider text-graphite-400 border border-graphite-200/10 hover:text-graphite-200 transition-colors"
        >
          No
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="h-6 px-2 rounded text-[10px] font-mono uppercase tracking-wider text-rose-400 border border-rose-500/20 hover:border-rose-500/50 hover:bg-rose-500/10 transition-colors"
    >
      Cancel
    </button>
  );
}
