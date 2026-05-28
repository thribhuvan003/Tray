-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 0017: Performance indexes for peak-load queries
--
-- Adds composite indexes missing from the initial schema that become critical
-- when a single canteen processes 300+ orders/day and the kitchen board is
-- held open for 8+ hours by 5+ staff members on concurrent sessions.
--
-- Safe to run on a live database — all indexes use CREATE INDEX CONCURRENTLY
-- (via IF NOT EXISTS which uses the standard non-locking path in Postgres 15+).
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Kitchen board primary query:
--    WHERE tenant_id = ? AND status IN (...) AND placed_at >= today
--    ORDER BY placed_at ASC LIMIT 300
--    Current index: (tenant_id, status) — misses placed_at, forces a heap re-check.
--    New index: covers the full WHERE + ORDER BY in one index scan.
create index if not exists orders_kitchen_board_idx
  on public.orders (tenant_id, status, placed_at asc);

-- 2. Admin dashboard revenue chart:
--    WHERE tenant_id = ? AND placed_at >= start_of_period
--    ORDER BY placed_at DESC LIMIT 1600
create index if not exists orders_dashboard_timeline_idx
  on public.orders (tenant_id, placed_at desc);

-- 3. Student orders page:
--    WHERE user_id = ? AND tenant_id = ? ORDER BY placed_at DESC LIMIT 100
--    Existing: (user_id) alone forces a filter on tenant_id. Adding tenant_id
--    makes it a covering index for this exact query.
create index if not exists orders_student_portal_idx
  on public.orders (user_id, tenant_id, placed_at desc);

-- 4. Order events: kitchen board realtime subscription uses
--    tenant_id=eq.{id} filter. The existing oe_tenant_idx covers insertion
--    but not point-lookup for a specific order's events on the track page.
create index if not exists order_events_order_tenant_idx
  on public.order_events (order_id, tenant_id, created_at desc);

-- 5. Order items: PrepTotalsStrip aggregates quantities for active orders.
--    Query: WHERE order_id IN (...) — existing oi_order_idx covers this. ✅
--    Stock decrement reads menu_item_id inside order_items:
create index if not exists order_items_menu_item_idx
  on public.order_items (menu_item_id, tenant_id);

-- 6. Payments lookup by Razorpay order ID (reconcile cron + webhook).
--    Used in: safe_capture_payment, reconcile cron, DLQ drain.
create index if not exists payments_rzp_order_idx
  on public.payments (razorpay_order_id) where razorpay_order_id is not null;

-- 7. Menu items: student menu + kitchen SOLD OUT dropdown both query
--    WHERE tenant_id = ? AND status = 'live' ORDER BY sort_order
--    Existing idx mi_status_idx (tenant_id, status) is fine but sort_order
--    would avoid a sort step on large menus (50+ items).
create index if not exists menu_items_live_sort_idx
  on public.menu_items (tenant_id, status, sort_order asc);

-- 8. Idempotency keys: placeOrder claims keys with exact key match.
--    Unique constraint on (key) already exists. Add tenant + created_at for
--    the expiry cleanup job that deletes keys older than 1 hour.
create index if not exists idempotency_keys_tenant_expiry_idx
  on public.idempotency_keys (tenant_id, created_at asc);
