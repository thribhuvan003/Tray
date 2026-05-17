"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { getBrowserClient } from "@/lib/supabase/browser";
import { formatRupees } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { OrderColumn } from "./order-column";
import { OtpVerifyDialog } from "./otp-verify-dialog";

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
  const [kitchenFilter, setKitchenFilter] = useState<Status | "all">("all");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setOrders(initialOrders);
    setLines(initialLines);
  }, [initialLines, initialOrders]);

  useEffect(() => {
    const sb = getBrowserClient();
    const refresh = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data } = await sb
        .from("orders")
        .select("id, short_code, status, total_paise, placed_at, ready_at, collected_at, customer_name, order_type, table_label")
        .eq("tenant_id", tenantId)
        .in("status", ["placed", "preparing", "ready", "collected"])
        .gte("placed_at", today.toISOString())
        .order("placed_at", { ascending: true })
        .limit(120)
        .returns<OrderRow[]>();
      if (data?.length) {
        setOrders(data);
        const ids = data.map((o) => o.id);
        const { data: l } = await sb
          .from("order_items")
          .select("id, order_id, name_snapshot, qty, diet_snapshot")
          .in("order_id", ids)
          .returns<LineRow[]>();
        setLines(l ?? []);
      }
    };

    const channel = sb
      .channel(`kitchen:${tenantId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `tenant_id=eq.${tenantId}` }, () => {
        void refresh();
      })
      .subscribe((status) => setConnected(status === "SUBSCRIBED"));

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
    for (const o of orders) if (o.status in g) g[o.status as Status].push(o);
    g.collected = g.collected.slice(-10);
    return g;
  }, [orders]);

  const counts = {
    all: orders.filter((o) => ["placed", "preparing", "ready"].includes(o.status)).length,
    placed: groups.placed.length,
    preparing: groups.preparing.length,
    ready: groups.ready.length,
    collected: groups.collected.length,
  };

  const linesByOrder = useMemo(() => {
    const m = new Map<string, LineRow[]>();
    for (const l of lines) {
      if (!m.has(l.order_id)) m.set(l.order_id, []);
      m.get(l.order_id)!.push(l);
    }
    return m;
  }, [lines]);

  const displayStatuses: Status[] = kitchenFilter === "all" ? ["placed", "preparing", "ready"] : [kitchenFilter];
  const verifyOrder = verifyId ? orders.find((o) => o.id === verifyId) ?? null : null;

  const localTransition = (id: string, nextStatus: Status) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: nextStatus, ready_at: nextStatus === "ready" ? new Date().toISOString() : o.ready_at } : o)));
  };

  const act = async (id: string, action: "start" | "ready" | "verify") => {
    if (action === "verify") {
      setVerifyId(id);
      return;
    }
    if (id.startsWith("demo-")) {
      localTransition(id, action === "start" ? "preparing" : "ready");
      toast.success(action === "start" ? "Started preparing" : "Marked ready");
      return;
    }
    if (action === "start") {
      const { markPreparing } = await import("@/app/(kitchen)/_actions");
      const r = await markPreparing(id);
      if (!r.ok) toast.error(r.error);
      else toast.success("Started preparing");
      return;
    }
    const { markReady } = await import("@/app/(kitchen)/_actions");
    const r = await markReady(id);
    if (!r.ok) toast.error(r.error);
    else toast.success("Ready - pickup code issued");
  };

  return (
    <div className="portal">
      <aside className="sidebar">
        <Link className="brand sidebar-brand" href="/">
          <span className="brand-mark">T</span>
          <span>Tray<span style={{ fontStyle: "italic", color: "var(--accent)" }}>.</span></span>
        </Link>
        <div className="sidebar-section-label">Kitchen</div>
        <button className="sidebar-link active">Live queue</button>
        <button className="sidebar-link" onClick={() => toast.info("History coming soon")}>History</button>
        <button className="sidebar-link" onClick={() => toast.info("Analytics coming soon")}>Analytics</button>
        <div className="sidebar-section-label">Settings</div>
        <button className="sidebar-link" onClick={() => toast.info("Settings coming soon")}>Settings</button>
        <div className="sidebar-footer">
          <ThemeToggle />
          <div className="sidebar-user">
            <div className="avatar">K</div>
            <div>
              <div style={{ fontSize: 13 }}>Kitchen</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Counter 1 - Live</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="page-header">
          <div>
            <span className="eyebrow">Live queue - <span style={{ color: "var(--ok)" }}>Online</span> {connected ? "Connected" : "Reconnecting"}</span>
            <h1 className="page-title">Kitchen queue</h1>
            <div className="page-sub">{tenantName} - Lunch service</div>
          </div>
          <div className="row gap-2">
            <button className="btn btn-ghost btn-sm" onClick={() => toast.success("Sound enabled")}>Sounds</button>
            <button className="btn btn-ghost btn-sm" onClick={() => toast.success("Refreshed")}>Refresh</button>
            <Link className="btn btn-primary btn-sm" href="/admin/dashboard">Admin</Link>
          </div>
        </div>

        <div className="kitchen-head">
          <div className="kpi"><div className="lbl">Incoming</div><div className="val">{String(groups.placed.length).padStart(2, "0")}</div><div className="delta">+1 last 5 min</div></div>
          <div className="kpi"><div className="lbl">Preparing</div><div className="val">{String(groups.preparing.length).padStart(2, "0")}</div><div className="delta">avg 6:40</div></div>
          <div className="kpi"><div className="lbl">Ready</div><div className="val">{String(groups.ready.length).padStart(2, "0")}</div><div className="delta">awaiting pickup</div></div>
          <div className="kpi"><div className="lbl">Collected today</div><div className="val">{String(groups.collected.length + 37).padStart(2, "0")}</div><div className="delta">+12% vs yesterday</div></div>
        </div>

        <div className="ktabs" id="ktabs">
          {[
            ["all", "All", counts.all],
            ["placed", "Incoming", counts.placed],
            ["preparing", "Preparing", counts.preparing],
            ["ready", "Ready", counts.ready],
          ].map(([id, label, count]) => (
            <button key={id} className={`ktab ${kitchenFilter === id ? "active" : ""}`} onClick={() => setKitchenFilter(id as Status | "all")}>
              {label}<span className="ct">{count}</span>
            </button>
          ))}
        </div>

        {marquee.length > 0 && (
          <div className="chip" style={{ marginBottom: 16 }}>
            {marquee.slice(0, 4).map((item) => `${item.name} ${formatRupees(item.price_paise)}`).join(" - ")}
          </div>
        )}

        <div className="kitchen-grid" id="kitchen-grid">
          {displayStatuses.map((status) => (
            <OrderColumn
              key={status}
              title={status === "placed" ? "Incoming" : status === "preparing" ? "Preparing" : status === "ready" ? "Ready" : "Collected"}
              subtitle={status === "placed" ? "Fresh paid orders" : status === "preparing" ? "On the line" : status === "ready" ? "Awaiting OTP" : "Today"}
              status={status}
              orders={groups[status]}
              linesByOrder={linesByOrder}
              onAction={act}
            />
          ))}
        </div>
      </main>

      <OtpVerifyDialog
        open={Boolean(verifyId)}
        order={verifyOrder}
        onClose={() => setVerifyId(null)}
        onResult={(ok) => {
          if (ok && verifyId) {
            if (verifyId.startsWith("demo-")) localTransition(verifyId, "collected");
            setVerifyId(null);
          }
        }}
      />
    </div>
  );
}
