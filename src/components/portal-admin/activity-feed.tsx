"use client";
import { motion, AnimatePresence } from "framer-motion";
import { formatTimeIST } from "@/lib/utils";

type Log = {
  id: string;
  order_id: string;
  to_status: string;
  from_status: string | null;
  created_at: string;
  note: string | null;
};

const TONE: Record<string, string> = {
  placed: "bg-[var(--admin-sky)]",
  preparing: "bg-[var(--admin-amber)]",
  ready: "bg-[var(--admin-lime)]",
  collected: "bg-[var(--admin-mint)]",
  rejected: "bg-[var(--admin-rose)]",
  expired: "bg-[var(--admin-rose)]",
  pending_payment: "bg-[var(--admin-ink-3)]",
};

export function ActivityFeed({ logs }: { logs: Log[] }) {
  return (
    <section className="bg-[var(--admin-bg-2)] border border-[var(--admin-line)] rounded-xl p-4 min-h-[260px]">
      <header className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-[13px] font-semibold text-[var(--admin-ink)]">Live activity</h3>
          <p className="text-[10px] font-mono uppercase tracking-[0.08em] text-[var(--admin-ink-3)] mt-0.5">
            Real-time events · today
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-full border border-[var(--admin-mint)]/30 text-[var(--admin-mint)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--admin-mint)] animate-pulse" /> Live
        </span>
      </header>
      {logs.length === 0 ? (
        <div className="text-[12px] text-[var(--admin-ink-3)] text-center py-8">No activity yet today.</div>
      ) : (
        <ul className="flex flex-col gap-1 max-h-[260px] overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {logs.slice(0, 8).map((l) => (
              <motion.li
                key={l.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.35, ease: [0.34, 1.26, 0.64, 1] }}
                className="flex items-center gap-3 text-[11.5px] font-mono py-1.5 px-2 rounded-md hover:bg-[var(--admin-bg-3)]/40"
              >
                <span className="text-[var(--admin-ink-3)] w-[58px] tabular shrink-0">
                  {formatTimeIST(l.created_at)}
                </span>
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${TONE[l.to_status] ?? "bg-[var(--admin-ink-3)]"}`} />
                <span className="flex-1 text-[var(--admin-ink-2)]">
                  <span className="text-[var(--admin-ink)] font-semibold">{(l.order_id ?? "").slice(0, 6)}</span>{" "}
                  · {l.from_status ?? "—"} → <span className="text-[var(--admin-ink)]">{l.to_status ?? "—"}</span>
                  {(l.note ?? null) && <span className="text-[var(--admin-ink-3)]"> · {l.note}</span>}
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
