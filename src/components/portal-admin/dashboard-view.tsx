"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { subscribeToTenant } from "@/lib/supabase/realtime";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUp, Copy, Download, IndianRupee, ListOrdered, Receipt, Timer } from "lucide-react";
import dayjs from "dayjs";
import { formatRupees, formatTimeIST, fmtElapsed } from "@/lib/utils";
import { getBrowserClient } from "@/lib/supabase/browser";
import { KpiCard } from "./kpi-card";
import { RevenueChart } from "./revenue-chart";
import { PeakHeatmap } from "./peak-heatmap";
import { TopItems } from "./top-items";
import { ActivityFeed } from "./activity-feed";

import { OrderRow } from "@/types/portal";
type StatusLog = {
  id: string;
  order_id: string;
  to_status: string;
  from_status: string | null;
  created_at: string;
  note: string | null;
};
type ItemRow = {
  id: string;
  order_id: string;
  name_snapshot: string;
  qty: number;
  diet_snapshot: "veg" | "nonveg" | "egg";
  price_paise_snapshot: number;
};

export function DashboardView({
  tenantName,
  tenantSlug,
  tenantId,
  ordersWeek,
  todayOrders,
  lastWeekToday,
  logs: initialLogs,
  todayItems,
}: {
  tenantName: string;
  tenantSlug: string;
  tenantId: string;
  ordersWeek: OrderRow[];
  todayOrders: OrderRow[];
  lastWeekToday: OrderRow[];
  logs: StatusLog[];
  todayItems: ItemRow[];
}) {
  const router = useRouter();
  const [logs, setLogs] = useState(initialLogs);

  useEffect(() => {
    setLogs(initialLogs);
  }, [initialLogs]);

  useEffect(() => {
    const sb = getBrowserClient();
    // H5: Subscribe to order_events — the ONLY table in supabase_realtime publication.
    // order_status_logs is NOT replicated, so subscribing there gives zero events.
    const ch = sb
      .channel(`admin-dashboard-${tenantId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "order_events", filter: `tenant_id=eq.${tenantId}` },
        (payload) => {
          // Status change events also update the activity feed
          const ev = payload.new as { event_type?: string; payload?: any; created_at?: string; order_id?: string };
          if (ev.event_type === "status_changed" && ev.payload) {
            const fromStatus = ev.payload.from;
            const toStatus = ev.payload.to;
            if (fromStatus && toStatus) {
              setLogs((prev) => [
                { id: ev.order_id ?? "", order_id: ev.order_id ?? "", from_status: fromStatus, to_status: toStatus, created_at: ev.created_at ?? new Date().toISOString(), note: null } as StatusLog,
                ...prev,
              ].slice(0, 40));
            }
          }
          // Refresh KPI numbers on every new event
          router.refresh();
        }
      )
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, [tenantId, router]);

  const kpis = useMemo(() => {
    const paid = (rows: OrderRow[]) =>
      rows.filter((o) => !["pending_payment", "rejected", "expired"].includes(o.status));
    const today = paid(todayOrders);
    const prior = paid(lastWeekToday);

    const revenue = today.reduce((acc, o) => acc + o.total_paise, 0);
    const priorRevenue = prior.reduce((acc, o) => acc + o.total_paise, 0);
    const count = today.length;
    const priorCount = prior.length;
    const avgTicket = count ? Math.round(revenue / count) : 0;
    const priorAvg = priorCount ? Math.round(priorRevenue / priorCount) : 0;

    const pickupSecs = (rows: OrderRow[]) =>
      rows
        .filter((o) => o.collected_at && o.placed_at)
        .map((o) => (new Date(o.collected_at!).getTime() - new Date(o.placed_at).getTime()) / 1000);
    const pickups = pickupSecs(today);
    const priorPickups = pickupSecs(prior);
    const avgPickup = pickups.length ? Math.round(pickups.reduce((a, b) => a + b, 0) / pickups.length) : 0;
    const priorAvgPickup = priorPickups.length
      ? Math.round(priorPickups.reduce((a, b) => a + b, 0) / priorPickups.length)
      : 0;

    return { revenue, priorRevenue, count, priorCount, avgTicket, priorAvg, avgPickup, priorAvgPickup };
  }, [todayOrders, lastWeekToday]);

  const deltaPct = (current: number, prior: number) => {
    if (prior === 0 && current === 0) return { text: "—", up: true };
    if (prior === 0) return { text: "new", up: true };
    const pct = ((current - prior) / prior) * 100;
    const sign = pct >= 0 ? "+" : "";
    return { text: `${sign}${pct.toFixed(1)}%`, up: pct >= 0 };
  };
  const deltaTime = (current: number, prior: number) => {
    if (prior === 0 && current === 0) return { text: "—", up: true };
    if (prior === 0) return { text: "new", up: true };
    const diff = current - prior;
    const sign = diff <= 0 ? "-" : "+";
    const abs = Math.abs(diff);
    return { text: `${sign}${Math.floor(abs / 60)}:${String(abs % 60).padStart(2, "0")}`, up: diff <= 0 };
  };
  const dRev = deltaPct(kpis.revenue, kpis.priorRevenue);
  const dCount = deltaPct(kpis.count, kpis.priorCount);
  const dAvg = deltaPct(kpis.avgTicket, kpis.priorAvg);
  const dPickup = deltaTime(kpis.avgPickup, kpis.priorAvgPickup);

  const dayBuckets = useMemo(() => {
    const start = dayjs().startOf("day").subtract(6, "day");
    const days: { label: string; key: string; revenue: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = start.add(i, "day");
      days.push({ label: d.format("ddd").toUpperCase(), key: d.format("YYYY-MM-DD"), revenue: 0 });
    }
    for (const o of ordersWeek) {
      if (["rejected", "expired", "pending_payment"].includes(o.status)) continue;
      const k = dayjs(o.placed_at).format("YYYY-MM-DD");
      const b = days.find((x) => x.key === k);
      if (b) b.revenue += o.total_paise;
    }
    return days;
  }, [ordersWeek]);

  const heatmap = useMemo(() => {
    const grid: number[][] = Array.from({ length: 7 }, () => Array(12).fill(0));
    for (const o of ordersWeek) {
      const d = dayjs(o.placed_at);
      const dow = (d.day() + 6) % 7;
      const hour = d.hour();
      if (hour < 8 || hour > 19) continue;
      const col = hour - 8;
      grid[dow]![col]! += 1;
    }
    return grid;
  }, [ordersWeek]);

  const topItems = useMemo(() => {
    const m = new Map<string, { name: string; qty: number; revenue: number; diet: "veg" | "nonveg" | "egg" }>();
    for (const i of todayItems) {
      const cur = m.get(i.name_snapshot) ?? { name: i.name_snapshot, qty: 0, revenue: 0, diet: i.diet_snapshot };
      cur.qty += i.qty;
      cur.revenue += i.qty * i.price_paise_snapshot;
      m.set(i.name_snapshot, cur);
    }
    return [...m.values()].sort((a, b) => b.qty - a.qty).slice(0, 6);
  }, [todayItems]);

  const isFirstDay = ordersWeek.length === 0;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* ── First-run onboarding checklist ───────────────────────────── */}
      {isFirstDay && (
        <div
          className="mb-5 rounded-xl p-5"
          style={{ border: "1px solid var(--admin-line-2)", background: "var(--admin-bg-card)" }}
        >
          <div className="text-[13px] font-semibold mb-3" style={{ color: "var(--admin-lime)" }}>
            Welcome! Here&rsquo;s how to get your first order in 3 steps:
          </div>
          <ol className="flex flex-col gap-2.5">
            {[
              {
                n: "1",
                text: "Add your menu items",
                href: `/c/${tenantSlug}/admin/menu/new`,
                cta: "Go to Menu →",
              },
              {
                n: "2",
                text: "Set your UPI ID so students can pay you",
                href: `/c/${tenantSlug}/admin/settings`,
                cta: "Go to Settings →",
              },
              {
                n: "3",
                text: "Share your ordering link with students",
                href: null,
                cta: null,
                copyStudentLink: true,
              },
            ].map((step) => (
              <li key={step.n} className="flex items-start gap-3">
                <span
                  className="mt-0.5 shrink-0 h-5 w-5 rounded-full text-[11px] font-bold inline-flex items-center justify-center"
                  style={{ background: "var(--admin-lime-soft)", color: "var(--admin-lime)" }}
                >
                  {step.n}
                </span>
                <div className="flex flex-col gap-1.5 flex-1 text-[13px]" style={{ color: "var(--admin-ink-2)" }}>
                  <span>{step.text}</span>
                  {"copyStudentLink" in step && step.copyStudentLink && (
                    <button
                      onClick={() => {
                        const origin = typeof window !== "undefined" ? window.location.origin : "";
                        navigator.clipboard.writeText(`${origin}/c/${tenantSlug}/menu`).catch(() => undefined);
                      }}
                      className="inline-flex items-center gap-1.5 text-[12px] font-mono bg-[var(--admin-lime-soft)] border border-[var(--admin-lime)]/20 text-[var(--admin-lime)] px-3 py-1.5 rounded-lg hover:bg-[var(--admin-lime)]/20 transition-colors w-fit"
                    >
                      <Copy size={11} /> Copy student link
                    </button>
                  )}
                  {step.href && step.cta && (
                    <a
                      href={step.href}
                      className="ml-2 text-[12px] font-medium hover:underline inline-flex items-center gap-0.5"
                      style={{ color: "var(--admin-lime)" }}
                    >
                      {step.cta} <ArrowRight size={11} />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ── Page heading + topbar-style row ─────────────────────────── */}
      <div
        className="flex flex-wrap items-end justify-between gap-3 mb-6 pb-5"
        style={{ borderBottom: "1px solid var(--admin-line)" }}
      >
        <div>
          <h1
            className="font-semibold leading-tight"
            style={{ fontSize: 24, letterSpacing: "-0.025em", color: "var(--admin-ink)" }}
          >
            Today&rsquo;s overview
          </h1>
          <div
            className="font-mono uppercase mt-1"
            style={{ fontSize: 11, letterSpacing: "0.06em", color: "var(--admin-ink-3)" }}
          >
            {dayjs().format("ddd · D MMM YYYY").toUpperCase()} · {tenantName.toUpperCase()} · COUNTER 01
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/admin/export/orders?tenant=${tenantSlug}`}
            className="inline-flex items-center gap-1.5 font-mono uppercase tracking-wider transition-colors"
            style={{
              height: 36,
              padding: "0 12px",
              borderRadius: 7,
              border: "1px solid var(--admin-line-2)",
              fontSize: 11,
              color: "var(--admin-ink-2)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--admin-lime)"; (e.currentTarget as HTMLElement).style.color = "var(--admin-lime)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--admin-line-2)"; (e.currentTarget as HTMLElement).style.color = "var(--admin-ink-2)"; }}
          >
            <Download size={11} /> Export CSV
          </a>
        </div>
      </div>

      {/* ── KPI cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        {isFirstDay ? (
          <>
            {/* First-day setup prompts replace numeric KPIs */}
            {(
              [
                {
                  icon: IndianRupee,
                  label: "Revenue today",
                  prompt: "Set up your UPI ID to receive payments",
                  href: `/c/${tenantSlug}/admin/settings`,
                  cta: "Go to Settings →",
                },
                {
                  icon: ListOrdered,
                  label: "Orders",
                  prompt: "Share your student link to get first orders",
                  href: `/c/${tenantSlug}/admin/settings`,
                  cta: "Copy link →",
                },
                {
                  icon: Receipt,
                  label: "Avg ticket",
                  prompt: "Coming soon after your first order",
                  href: null,
                  cta: null,
                },
                {
                  icon: Timer,
                  label: "Avg pickup",
                  prompt: "Coming soon after your first order",
                  href: null,
                  cta: null,
                },
              ] as const
            ).map((card) => (
              <div
                key={card.label}
                className="relative overflow-hidden flex flex-col gap-3 transition-colors"
                style={{
                  padding: "18px 20px",
                  background: "var(--admin-bg-card)",
                  border: "1px solid var(--admin-line)",
                  borderRadius: 12,
                  boxShadow: "3px 3px 0 var(--admin-line)",
                }}
              >
                <div
                  className="inline-flex items-center justify-center rounded-md"
                  style={{ height: 28, width: 28, background: "var(--admin-bg-3)" }}
                >
                  <card.icon size={13} strokeWidth={1.6} style={{ color: "var(--admin-ink-3)" }} />
                </div>
                <div
                  className="font-mono uppercase font-medium"
                  style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--admin-ink-3)" }}
                >
                  {card.label}
                </div>
                <p
                  className="leading-snug"
                  style={{ fontSize: 13, color: "var(--admin-ink-2)", margin: 0 }}
                >
                  {card.prompt}
                </p>
                {card.href && card.cta && (
                  <a
                    href={card.href}
                    className="font-mono font-medium hover:underline"
                    style={{ fontSize: 11, color: "var(--admin-lime)", letterSpacing: "0.04em" }}
                  >
                    {card.cta}
                  </a>
                )}
              </div>
            ))}
          </>
        ) : (
          <>
            <KpiCard label="Revenue today" value={formatRupees(kpis.revenue)} delta={dRev.text} deltaUp={dRev.up} icon={IndianRupee} />
            <KpiCard label="Orders" value={String(kpis.count)} delta={dCount.text} deltaUp={dCount.up} icon={ListOrdered} />
            <KpiCard label="Avg ticket" value={formatRupees(kpis.avgTicket)} delta={dAvg.text} deltaUp={dAvg.up} icon={Receipt} tone="amber" />
            <KpiCard label="Avg pickup" value={kpis.avgPickup ? fmtElapsed(kpis.avgPickup) : "—"} delta={dPickup.text} deltaUp={dPickup.up} icon={Timer} tone="rose" />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-2 mb-3">
        <RevenueChart days={dayBuckets} />
        <PeakHeatmap grid={heatmap} />
      </div>

      <div className="grid lg:grid-cols-2 gap-2">
        <ActivityFeed logs={logs} />
        <TopItems items={topItems} />
      </div>
    </motion.div>
  );
}

export function _UnusedIcons({ a, b }: { a: typeof ArrowUp; b: typeof ArrowDown }) {
  return (
    <span>
      <a />
      <b />
    </span>
  );
}
