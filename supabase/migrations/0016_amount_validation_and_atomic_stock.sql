-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 0016: Amount validation in safe_capture_payment +
--                 Atomic stock decrement for checkout
-- Implements priorities 2 and 7 from the 9/10 production readiness audit.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 1. Replace safe_capture_payment with amount-validated version ─────────────
--
-- Returns: 'captured' | 'already_captured' | 'not_found' | 'amount_mismatch'
--
-- The new guard compares the webhook/verify amount against orders.total_paise.
-- Any underpayment (even ₹1 short) is rejected into the DLQ, not captured.
-- This closes the "pay ₹1 for ₹185 order" exploit identified in the audit.

create or replace function public.safe_capture_payment(
  p_order_id        uuid,
  p_tenant_id       uuid,
  p_razorpay_pid    text,
  p_razorpay_oid    text,
  p_amount_paise    bigint,
  p_raw_event_id    text
) returns text   -- 'captured' | 'already_captured' | 'not_found' | 'amount_mismatch'
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status        text;
  v_order_id      uuid;
  v_total_paise   bigint;
begin
  -- Lock the order row + read total to prevent concurrent captures
  select id, status, total_paise
  into   v_order_id, v_status, v_total_paise
  from   orders
  where  id        = p_order_id
    and  tenant_id = p_tenant_id
  for update;

  if v_order_id is null then
    return 'not_found';
  end if;

  -- ── Priority 2: Amount validation ────────────────────────────────────────────
  -- Reject if the paid amount is less than the order total.
  -- Tolerance: allow ±1 paise for floating-point rounding in some UPI apps.
  if p_amount_paise < (v_total_paise - 1) then
    -- Log the mismatch for forensics without blocking the response
    insert into order_events (tenant_id, order_id, event_type, payload)
    values (
      p_tenant_id,
      p_order_id,
      'payment_amount_mismatch',
      jsonb_build_object(
        'expected_paise', v_total_paise,
        'received_paise', p_amount_paise,
        'razorpay_payment_id', p_razorpay_pid,
        'razorpay_order_id',   p_razorpay_oid
      )
    );
    return 'amount_mismatch';
  end if;

  -- Idempotency: upsert the payment row; unique(raw_event_id) dedupes retries
  insert into payments (
    tenant_id, order_id, razorpay_order_id, razorpay_payment_id,
    amount_paise, status, raw_event_id
  )
  values (
    p_tenant_id, p_order_id, p_razorpay_oid, p_razorpay_pid,
    p_amount_paise, 'captured', p_raw_event_id
  )
  on conflict (raw_event_id) do nothing;

  -- If we lost the race (another path already captured), return early
  if v_status != 'pending_payment' then
    return 'already_captured';
  end if;

  -- Transition order to placed
  update orders
  set    status = 'placed'
  where  id        = p_order_id
    and  tenant_id = p_tenant_id
    and  status    = 'pending_payment';

  -- Emit Realtime event in same transaction — kitchen board picks this up atomically
  insert into order_events (tenant_id, order_id, event_type, payload)
  values (
    p_tenant_id,
    p_order_id,
    'status_changed',
    jsonb_build_object(
      'from',                  'pending_payment',
      'to',                    'placed',
      'razorpay_payment_id',   p_razorpay_pid,
      'amount_paise',          p_amount_paise,
      'source',                'payment_captured'
    )
  );

  insert into order_status_logs (tenant_id, order_id, from_status, to_status, note)
  values (
    p_tenant_id,
    p_order_id,
    'pending_payment',
    'placed',
    format('Captured via Razorpay webhook. amount=%s paise. pid=%s', p_amount_paise, p_razorpay_pid)
  );

  return 'captured';
end;
$$;

grant execute on function public.safe_capture_payment(uuid, uuid, text, text, bigint, text)
  to service_role;


-- ── 2. Atomic stock decrement for checkout (Priority 7) ───────────────────────
--
-- Called from placeOrder server action BEFORE creating the order row.
-- Uses SELECT ... FOR UPDATE to lock each item row, then decrements stock_qty
-- only if sufficient quantity exists. Fails immediately if any item is sold out.
--
-- Returns: 'ok' | 'out_of_stock:<item_name>' | 'item_not_found:<item_id>'
--
-- Design notes:
--   - Only decrements when stock_qty IS NOT NULL (unlimited items skip this check).
--   - in_stock = false immediately returns out_of_stock without decrement.
--   - The lock prevents two concurrent checkouts from both succeeding on the last item.

create or replace function public.atomic_decrement_stock(
  p_tenant_id  uuid,
  p_items      jsonb   -- [{menu_item_id: uuid, qty: int}, ...]
) returns text   -- 'ok' | 'out_of_stock:<name>' | 'item_not_found:<id>'
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item        record;
  v_menu_item   record;
begin
  -- Process each requested item
  for v_item in select * from jsonb_to_recordset(p_items) as x(menu_item_id uuid, qty int)
  loop
    -- Lock the row and read current stock state
    select id, name, in_stock, stock_qty, status
    into   v_menu_item
    from   menu_items
    where  id        = v_item.menu_item_id
      and  tenant_id = p_tenant_id
    for update;

    -- Item doesn't exist in this tenant
    if not found then
      return format('item_not_found:%s', v_item.menu_item_id);
    end if;

    -- Item was disabled or marked sold out
    if v_menu_item.status != 'live' or not v_menu_item.in_stock then
      return format('out_of_stock:%s', v_menu_item.name);
    end if;

    -- stock_qty IS NULL = unlimited; skip decrement
    if v_menu_item.stock_qty is not null then
      if v_menu_item.stock_qty < v_item.qty then
        return format('out_of_stock:%s', v_menu_item.name);
      end if;
      -- Atomic decrement — safe even under 500 concurrent requests
      update menu_items
      set    stock_qty = stock_qty - v_item.qty
      where  id        = v_item.menu_item_id
        and  tenant_id = p_tenant_id
        and  stock_qty >= v_item.qty;  -- double-guard prevents negative stock

      -- If 0 rows updated, a concurrent request beat us to the last item
      if not found then
        return format('out_of_stock:%s', v_menu_item.name);
      end if;

      -- Auto-mark item as out-of-stock when stock reaches 0
      update menu_items
      set    in_stock = false
      where  id        = v_item.menu_item_id
        and  tenant_id = p_tenant_id
        and  stock_qty = 0;
    end if;
  end loop;

  return 'ok';
end;
$$;

grant execute on function public.atomic_decrement_stock(uuid, jsonb)
  to service_role;


-- ── 3. Realtime publication — single canonical set (Priority 5) ───────────────
--
-- Both setup.sql and migration 0011 published different table sets, causing
-- silent realtime failures. This migration creates ONE authoritative publication
-- that all portals rely on. Safe to re-run (create or replace semantics).
--
-- Tables published (with replica identity full for row-level filters):
--   order_events       — kitchen board, student tracker, admin dashboard
--   orders             — pay-panel redirect, student polling fallback
--   order_status_logs  — admin audit feed
--   menu_items         — live menu updates to student portal
--   tenants            — canteen open/closed status to all portals

-- Ensure replica identity is FULL so postgres_changes filters work correctly
alter table if exists public.order_events       replica identity full;
alter table if exists public.orders             replica identity full;
alter table if exists public.order_status_logs  replica identity full;
alter table if exists public.menu_items         replica identity full;
alter table if exists public.tenants            replica identity full;

-- Drop any legacy publications to avoid split-brain
drop publication if exists supabase_realtime;

-- Re-create with the canonical table set
create publication supabase_realtime
  for table
    public.order_events,
    public.orders,
    public.order_status_logs,
    public.menu_items,
    public.tenants;
