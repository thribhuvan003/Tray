-- Tray — Atomic order events on payment capture / failure
--
-- Previously, the Node.js webhook handler called safe_capture_payment (which
-- updated orders.status → placed in one DB transaction) and then — in a
-- separate round-trip — inserted into order_events and order_status_logs.
-- If the Node.js process died or timed out between those two calls, the order
-- would be in 'placed' status but the kitchen's Realtime subscription would
-- never fire. The 20s poll would eventually catch it, but that's a 20-second
-- delay during rush hour.
--
-- This migration moves the order_events + order_status_logs inserts INTO
-- the Postgres function itself. Now the entire chain:
--   payment captured → orders.status = placed → Realtime notification fires
-- is a single atomic DB transaction. There is no window where the transition
-- can happen without the notification.
--
-- Also adds safe_fail_payment for the payment.failed webhook path.

-- ═════════════════════════════════════════════════════════════════════════════
-- 1. safe_capture_payment — now inserts order_events + order_status_logs
-- ═════════════════════════════════════════════════════════════════════════════

create or replace function public.safe_capture_payment(
  p_order_id        uuid,
  p_tenant_id       uuid,
  p_razorpay_pid    text,
  p_razorpay_oid    text,
  p_amount_paise    bigint,
  p_raw_event_id    text
) returns text   -- 'captured' | 'already_captured' | 'not_found'
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status   text;
  v_order_id uuid;
begin
  -- Lock the order row to prevent concurrent capture
  select id, status into v_order_id, v_status
  from orders
  where id = p_order_id
    and tenant_id = p_tenant_id
  for update;

  if v_order_id is null then
    return 'not_found';
  end if;

  if v_status <> 'pending_payment' then
    return 'already_captured';
  end if;

  -- Idempotent payments upsert — raw_event_id unique constraint is the final guard
  insert into payments (tenant_id, order_id, razorpay_order_id, razorpay_payment_id, amount_paise, status, raw_event_id)
  values (p_tenant_id, p_order_id, p_razorpay_oid, p_razorpay_pid, p_amount_paise, 'captured', p_raw_event_id)
  on conflict (raw_event_id) do nothing;

  -- Transition order status
  update orders
  set status = 'placed'
  where id = p_order_id
    and tenant_id = p_tenant_id
    and status = 'pending_payment';

  -- Fire the Realtime notification in the SAME transaction.
  -- Kitchen board subscribes to postgres_changes on order_events INSERT.
  -- Because this insert is in the same txn as the status update, it is
  -- impossible for the order to be 'placed' without the notification firing.
  insert into order_events (tenant_id, order_id, event_type, payload)
  values (
    p_tenant_id,
    p_order_id,
    'status_changed',
    jsonb_build_object(
      'from', 'pending_payment',
      'to',   'placed',
      'source', 'razorpay_webhook'
    )
  );

  -- Audit trail
  insert into order_status_logs (tenant_id, order_id, from_status, to_status, note)
  values (
    p_tenant_id,
    p_order_id,
    'pending_payment'::public.order_status,
    'placed'::public.order_status,
    'Razorpay captured'
  );

  return 'captured';
end;
$$;

comment on function public.safe_capture_payment is
  'Atomic payment capture: FOR UPDATE row lock + payments upsert + orders status update + order_events INSERT + order_status_logs — all in one transaction. Realtime notification is guaranteed to fire if and only if the order transitions.';

-- ═════════════════════════════════════════════════════════════════════════════
-- 2. safe_fail_payment — atomic payment failure path
-- ═════════════════════════════════════════════════════════════════════════════

create or replace function public.safe_fail_payment(
  p_order_id        uuid,
  p_tenant_id       uuid,
  p_razorpay_oid    text
) returns text   -- 'failed' | 'already_resolved' | 'not_found'
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status   text;
  v_order_id uuid;
begin
  -- Lock the order row
  select id, status into v_order_id, v_status
  from orders
  where id = p_order_id
    and tenant_id = p_tenant_id
  for update;

  if v_order_id is null then
    return 'not_found';
  end if;

  if v_status <> 'pending_payment' then
    return 'already_resolved';
  end if;

  -- Mark payment failed
  update payments
  set status = 'failed'
  where razorpay_order_id = p_razorpay_oid
    and tenant_id = p_tenant_id;

  -- Transition order status
  update orders
  set status = 'payment_failed'
  where id = p_order_id
    and tenant_id = p_tenant_id
    and status = 'pending_payment';

  -- Realtime notification — student track page reacts immediately
  insert into order_events (tenant_id, order_id, event_type, payload)
  values (
    p_tenant_id,
    p_order_id,
    'payment_failed',
    jsonb_build_object(
      'source', 'razorpay_webhook',
      'razorpay_order_id', p_razorpay_oid
    )
  );

  -- Audit trail
  insert into order_status_logs (tenant_id, order_id, from_status, to_status, note)
  values (
    p_tenant_id,
    p_order_id,
    'pending_payment'::public.order_status,
    'payment_failed'::public.order_status,
    'Razorpay payment.failed event'
  );

  return 'failed';
end;
$$;

comment on function public.safe_fail_payment is
  'Atomic payment failure: FOR UPDATE row lock + payments update + orders status update + order_events INSERT + order_status_logs — all in one transaction. Student track page Realtime notification is guaranteed.';
