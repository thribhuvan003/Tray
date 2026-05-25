-- Migration: 20260525174000_execute_idempotent_payment_capture.sql
-- Path: supabase/migrations/20260525174000_execute_idempotent_payment_capture.sql

-- 1. Add reconciliation attempts tracker to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS reconciliation_attempts INT NOT NULL DEFAULT 0;

-- 2. Transactional locking payment capture RPC
CREATE OR REPLACE FUNCTION execute_idempotent_payment_capture(
  p_order_id UUID,
  p_tenant_id UUID,
  p_payment_id TEXT,
  p_razorpay_order_id TEXT,
  p_amount_paise INT,
  p_raw_event_id TEXT
) RETURNS JSON AS $$
DECLARE
  v_current_status TEXT;
BEGIN
  -- 1. Acquire an exclusive write-lock on the specific order row
  SELECT status::TEXT INTO v_current_status
  FROM public.orders
  WHERE id = p_order_id AND tenant_id = p_tenant_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Order not found');
  END IF;

  -- 2. Idempotency Check: Short-circuit if the update has already processed
  IF v_current_status IN ('placed', 'preparing', 'ready', 'collected', 'refunded') THEN
    RETURN json_build_object('success', true, 'updated', false);
  END IF;

  -- 3. Upsert payment record atomically
  INSERT INTO public.payments (
    tenant_id,
    order_id,
    razorpay_order_id,
    razorpay_payment_id,
    amount_paise,
    status,
    raw_event_id
  ) VALUES (
    p_tenant_id,
    p_order_id,
    p_razorpay_order_id,
    p_payment_id,
    p_amount_paise,
    'captured',
    p_raw_event_id
  )
  ON CONFLICT (raw_event_id) DO NOTHING;

  -- 4. Update order status to 'placed'
  UPDATE public.orders
  SET 
    status = 'placed',
    updated_at = NOW()
  WHERE id = p_order_id AND tenant_id = p_tenant_id;

  RETURN json_build_object('success', true, 'updated', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to authenticated role (used by webhook client) and anon (if needed)
GRANT EXECUTE ON FUNCTION execute_idempotent_payment_capture(UUID, UUID, TEXT, TEXT, INT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_idempotent_payment_capture(UUID, UUID, TEXT, TEXT, INT, TEXT) TO anon;
