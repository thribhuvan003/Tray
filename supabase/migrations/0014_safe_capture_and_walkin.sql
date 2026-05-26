-- Tray — DB-level payment safety + walk-in order support
--
-- 1. safe_capture_payment: SECURITY DEFINER function with FOR UPDATE row lock
--    Ensures true atomic payment capture — no TOCTOU race even under extreme concurrency.
--    Called from the webhook handler instead of the bare UPDATE + status guard.
--
-- 2. Walk-in orders: payments table already supports method=cash via status='captured'.
--    No schema change needed — the kitchen action inserts directly with status='placed'.

-- ═════════════════════════════════════════════════════════════════════════════
-- 1. SAFE_CAPTURE_PAYMENT — atomic row-locked payment capture
-- ═════════════════════════════════════════════════════════════════════════════

create or replace function public.safe_capture_payment(
  p_order_id        uuid,
  p_tenant_id       uuid,
  p_razorpay_pid    text,
  p_razorpay_oid    text,
  p_amount_paise    bigint,
  p_raw_event_id    text
) returns text   -- returns: 'captured' | 'already_captured' | 'wrong_status' | 'not_found'
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

  return 'captured';
end;
$$;

comment on function public.safe_capture_payment is
  'Atomic payment capture with FOR UPDATE row lock. Replaces the bare UPDATE+guard pattern in the webhook handler. Returns captured|already_captured|wrong_status|not_found for structured logging.';

-- ═════════════════════════════════════════════════════════════════════════════
-- 2. INDEX on payments(raw_event_id) if not already present
-- ═════════════════════════════════════════════════════════════════════════════

create unique index if not exists payments_raw_event_id_key on public.payments (raw_event_id)
  where raw_event_id is not null;
