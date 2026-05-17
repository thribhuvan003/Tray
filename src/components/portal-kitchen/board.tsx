"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChefHat, History as HistoryIcon, Radio } from "lucide-react";
import { toast } from "sonner";
import { getBrowserClient } from "@/lib/supabase/browser";
import { formatRupees, formatTimeIST } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { OrderColumn } from "./order-column";
import { OtpVerifyDialog } from "./otp-verify-dialog";
import { KitchenMarquee } from "./marquee";

type Status = "placed" | "preparing" | "ready" | "collected";
type OrderRow = {
  id: string;
  short_code: string;
  status: Status | "pending_payment" | "rejected" | "expired";
  total_paise: number;
  placed_at: string;
  ready_at: string | null;
  collected_at: string | null;
  customer_name: string | null;
  order_type: "takeaway" | "dine_in";
  table_label: string | null;
};
type LineRow = {
  id: string;
  order_id: string;
  name_snapshot: string;
  qty: number;
  diet_snapshot: "veg" | "nonveg" | "egg";
};

export function KitchenBoard({
  tenantId,
  tenantName,
  orders: initialOrders,
  lines: initialLines,
  marquee,
}: {
  tenantId: string;
  tenantName: string;
  orders: OrderRow[];
  lines: LineRow[];
  marquee: { id: string; name: string; price_paise: number; diet: "veg" | "nonveg" | "egg" }[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [lines, setLines] = useState(initialLines);
  const [verifyId, setVerifyId] = useState<string | null>(null);
  const [clock, setClock] = useState<string>("--:--");
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    const tick = () => setClock(formatTimeIST(new Date()));
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const sb = getBrowserClient();

    const refresh = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data } = await sb
        .from("orders")
        .select(
          "id, short_code, status, total_paise, placed_at, ready_at, collected_at, customer_name, order_type, table_label"
        )
        .eq("tenant_id", tenantId)
        .in("status", ["placed", "preparing", "ready", "collected"])
        .gte("placed_at", today.toISOString())
        .order("placed_at", { ascending: true })
        .limit(120)
        .returns<OrderRow[]>();
      if (data) {
        setOrders(data);
        const ids = data.map((o) => o.id);
        if (ids.length === 0) {
          setLines([]);
        } else {
          const { data: l } = await sb
            .from("order_items")
            .select("id, order_id, name_snapshot, qty, diet_snapshot")
            .in("order_id", ids)
            .returns<LineRow[]>();
          setLines(l ?? []);
        }
      }
    };

    const channel = sb
      .channel(`kitchen:${tenantId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `tenant_id=eq.${tenantId}` },
        () => {
          void refresh();
        }
      )
      .subscribe((status) => {
        setWsConnected(status === "SUBSCRIBED");
      });

    const onVis = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      sb.removeChannel(channel);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [tenantId]);

  const groups = useMemo(() => {
    const g: Record<Status, OrderRow[]> = { placed: [], preparing: [], ready: [], collected: [] };
    for (const o of orders) {
      if (o.status in g) g[o.status as Status].push(o);
    }
    g.collected = g.collected.slice(-10);
    return g;
  }, [orders]);

  const linesByOrder = useMemo(() => {
    const m = new Map<string, LineRow[]>();
    for (const l of lines) {
      if (!m.has(l.order_id)) m.set(l.order_id, []);
      m.get(l.order_id)!.push(l);
    }
    return m;
  }, [lines]);

  const verifyOrder = verifyId ? orders.find((o) => o.id === verifyId) ?? null : null;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b-2 border-tomato-900 bg-cream-50 dark:bg-graphite-900">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-4 justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-tomato-900/70 dark:text-cream-200/60">
              Edition 03 · Tuesday 16 May 2026 · {tenantName} · Lunch Service
            </div>
            <h1 className="font-display font-medium tracking-[-0.025em] text-[24px] sm:text-[28px] leading-none mt-1">
              The kitchen <span className="italic text-tomato-500">queue.</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tomato-900/5 dark:bg-cream-200/5 text-[10px] font-mono uppercase tracking-wider">
              <Radio size={11} className={wsConnected ? "text-emerald-500" : "text-amber-500"} />
              {wsConnected ? "Live · WS" : "Reconnecting"}
            </span>
            <span className="font-mono tabular text-[18px] font-semibold text-tomato-900 dark:text-cream-200">
              {clock}
            </span>
            <ThemeToggle className="text-tomato-900 dark:text-cream-200" />
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border-2 border-tomato-900 dark:border-cream-200 text-[12px] font-medium hover:bg-tomato-900 hover:text-cream-50 dark:hover:bg-cream-200 dark:hover:text-graphite-900 transition-colors"
            >
              <HistoryIcon size={12} /> Admin
            </Link>
          </div>
        </div>
        <KitchenKpiStrip orders={orders} />
      </header>

      <KitchenMarquee items={marquee} />

      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <OrderColumn
            title="Incoming"
            subtitle="Just paid · awaiting kitchen"
            status="placed"
            orders={groups.placed}
            linesByOrder={linesByOrder}
            onAction={async (id, action) => {
              const { markPreparing } = await import("@/app/(kitchen)/_actions");
              const r = await markPreparing(id);
              if (!r.ok) toast.error(r.error);
              if (action === "start" && r.ok) toast.success(`Started ${id.slice(0, 6)}`);
            }}
          />
          <OrderColumn
            title="Preparing"
            subtitle="On the line"
            status="preparing"
            orders={groups.preparing}
            linesByOrder={linesByOrder}
            onAction={async (id) => {
              const { markReady } = await import("@/app/(kitchen)/_actions");
              const r = await markReady(id);
              if (!r.ok) toast.error(r.error);
              else toast.success("Ready — pickup code issued");
            }}
          />
          <OrderColumn
            title="Ready"
            subtitle="Awaiting OTP at counter"
            status="ready"
            orders={groups.ready}
            linesByOrder={linesByOrder}
            onAction={(id) => setVerifyId(id)}
          />
          <OrderColumn
            title="Collected"
            subtitle="Today · last 10"
            status="collected"
            orders={groups.collected}
            linesByOrder={linesByOrder}
            onAction={() => {}}
          />
        </div>
      </main>

      <OtpVerifyDialog
        open={Boolean(verifyId)}
        order={verifyOrder}
        onClose={() => setVerifyId(null)}
        onResult={(ok) => {
          if (ok) setVerifyId(null);
        }}
      />
    </div>
  );
}

function KitchenKpiStrip({ orders }: { orders: OrderRow[] }) {
  const counts = useMemo(() => {
    return {
      placed: orders.filter((o) => o.status === "placed").length,
      preparing: orders.filter((o) => o.status === "preparing").length,
      ready: orders.filter((o) => o.status === "ready").length,
      collected: orders.filter((o) => o.status === "collected").length,
      revenue: orders.reduce((acc, o) => (o.status !== "rejected" && o.status !== "expired" ? acc + o.total_paise : acc), 0),
    };
  }, [orders]);
  const cells: { label: string; value: string; tone?: string; icon?: React.ReactNode }[] = [
    { label: "Incoming", value: String(counts.placed) },
    { label: "Preparing", value: String(counts.preparing) },
    { label: "Ready", value: String(counts.ready), tone: "text-tomato-500" },
    { label: "Collected today", value: String(counts.collected) },
    { label: "Revenue today", value: formatRupees(counts.revenue), icon: <ChefHat size={11} /> },
  ];
  return (
    <div className="border-t-2 border-tomato-900 px-4 sm:px-6 lg:px-8 py-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {cells.map((c) => (
        <div
          key={c.label}
          className="bg-cream-50 dark:bg-graphite-800 border-2 border-tomato-900 dark:border-cream-200/30 p-2.5 shadow-[4px_4px_0_0_var(--color-tomato-900)] dark:shadow-[4px_4px_0_0_rgba(247,200,194,0.3)]"
        >
          <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-tomato-900/65 dark:text-cream-200/60 flex items-center gap-1.5">
            {c.icon} {c.label}
          </div>
          <div className={`font-display text-[24px] sm:text-[28px] font-medium tabular leading-none mt-1 ${c.tone ?? ""}`}>
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}
