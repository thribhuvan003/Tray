-- Migration: 20260525200000_burst_load_indexes.sql
-- Critical performance indexes for handling 100s of concurrent orders
-- during peak lunch breaks without DB pressure or slow queries.

-- ── 1. Orders table: composite indexes for every major query pattern ──────

-- Kitchen data query: tenant_id + status + placed_at (most critical)
CREATE INDEX IF NOT EXISTS idx_orders_kitchen_live
  ON public.orders(tenant_id, status, placed_at DESC)
  WHERE status IN ('placed', 'preparing', 'ready');

-- Collected orders today (history/insights)
CREATE INDEX IF NOT EXISTS idx_orders_tenant_placed_at
  ON public.orders(tenant_id, placed_at DESC);

-- Admin dashboard: tenant_id + placed_at (14-day window)
CREATE INDEX IF NOT EXISTS idx_orders_admin_dashboard
  ON public.orders(tenant_id, placed_at DESC, status);

-- Student orders page: user_id lookup (fast for students checking their orders)
CREATE INDEX IF NOT EXISTS idx_orders_user_placed
  ON public.orders(user_id, placed_at DESC)
  WHERE user_id IS NOT NULL;

-- ── 2. Order items: composite index for bulk queries ──────────────────────

-- Fetch items for multiple orders at once (kitchen data + history)
CREATE INDEX IF NOT EXISTS idx_order_items_order_tenant
  ON public.order_items(order_id, tenant_id);

-- ── 3. Order events: composite for realtime filtering ────────────────────
-- These drive ALL realtime subscriptions across student/kitchen/admin portals

-- Per-order events (student track panel)
CREATE INDEX IF NOT EXISTS idx_order_events_order_created
  ON public.order_events(order_id, created_at DESC);

-- Per-tenant events (kitchen + admin realtime)
CREATE INDEX IF NOT EXISTS idx_order_events_tenant_created
  ON public.order_events(tenant_id, created_at DESC);

-- ── 4. Payments: fast webhook resolution ─────────────────────────────────

-- Webhook lookup by razorpay_order_id (fired on every payment)
CREATE INDEX IF NOT EXISTS idx_payments_rzp_order
  ON public.payments(razorpay_order_id)
  WHERE razorpay_order_id IS NOT NULL;

-- Idempotency check by razorpay_payment_id
CREATE INDEX IF NOT EXISTS idx_payments_rzp_payment
  ON public.payments(razorpay_payment_id)
  WHERE razorpay_payment_id IS NOT NULL;

-- Idempotency check by raw_event_id  
CREATE INDEX IF NOT EXISTS idx_payments_raw_event
  ON public.payments(raw_event_id)
  WHERE raw_event_id IS NOT NULL;

-- Fast lookup: all payments for a given order
CREATE INDEX IF NOT EXISTS idx_payments_order_tenant
  ON public.payments(order_id, tenant_id);

-- ── 5. Order status logs: admin activity feed ────────────────────────────
CREATE INDEX IF NOT EXISTS idx_osl_tenant_created
  ON public.order_status_logs(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_osl_order_created
  ON public.order_status_logs(order_id, created_at DESC);

-- ── 6. Menu items: fast live menu lookup ─────────────────────────────────
-- Student menu + walk-in item search
CREATE INDEX IF NOT EXISTS idx_menu_items_tenant_live
  ON public.menu_items(tenant_id, status, in_stock)
  WHERE status = 'live' AND in_stock = true;

-- Walk-in search by name (ILIKE uses pg_trgm)
CREATE INDEX IF NOT EXISTS idx_menu_items_name_trgm
  ON public.menu_items USING gin(name gin_trgm_ops);

-- ── 7. Pickup secrets: OTP lookup ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pickup_secrets_order
  ON public.pickup_secrets(order_id);

-- ── 8. Tenant memberships: auth role check ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tm_user_tenant_active
  ON public.tenant_memberships(user_id, tenant_id, is_active)
  WHERE is_active = true;

-- ── 9. Audit logs: admin review ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_audit_tenant_created
  ON public.audit_logs(tenant_id, created_at DESC);

-- ── 10. Analyze tables so query planner uses new indexes immediately ──────
ANALYZE public.orders;
ANALYZE public.order_items;
ANALYZE public.order_events;
ANALYZE public.payments;
ANALYZE public.menu_items;
ANALYZE public.order_status_logs;
ANALYZE public.tenant_memberships;
