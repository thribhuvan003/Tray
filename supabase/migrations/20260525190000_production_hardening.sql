-- Migration: 20260525190000_production_hardening.sql
-- Hardens several critical gaps found in production audit

-- 1. Fix the idempotent payment capture RPC:
--    Set placed_at = NOW() when transitioning pending_payment → placed
--    (orders created online have placed_at = created_at which is correct,
--     but this guard ensures it's always set to capture time)
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
  v_existing_payment_id UUID;
BEGIN
  -- 1. Acquire an exclusive write-lock on the specific order row
  SELECT status::TEXT INTO v_current_status
  FROM public.orders
  WHERE id = p_order_id AND tenant_id = p_tenant_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Order not found');
  END IF;

  -- 2. Duplicate payment check (by razorpay_payment_id)
  -- If this payment_id already exists in the payments table for another order, reject to prevent fraud
  IF p_payment_id IS NOT NULL AND p_payment_id NOT LIKE 'pay_sim_%' AND p_payment_id NOT LIKE 'pay_upi_%' AND p_payment_id NOT LIKE 'pay_poll_%' AND p_payment_id != 'UNKNOWN' AND EXISTS (
    SELECT 1 FROM public.payments 
    WHERE razorpay_payment_id = p_payment_id 
      AND tenant_id = p_tenant_id
      AND order_id <> p_order_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Payment ID ' || p_payment_id || ' is already associated with another order');
  END IF;

  -- Check if this specific payment ID has already been recorded for THIS order
  IF p_payment_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.payments 
    WHERE razorpay_payment_id = p_payment_id 
      AND order_id = p_order_id
      AND tenant_id = p_tenant_id
      AND status = 'captured'
  ) THEN
    IF v_current_status IN ('placed', 'preparing', 'ready', 'collected') THEN
      RETURN json_build_object('success', true, 'updated', false);
    ELSE
      RETURN json_build_object('success', true, 'updated', false, 'warning', 'Payment already processed for order in status: ' || v_current_status);
    END IF;
  END IF;

  -- 3. Duplicate event check (by raw_event_id)
  IF p_raw_event_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.payments 
    WHERE raw_event_id = p_raw_event_id 
      AND tenant_id = p_tenant_id
      AND status = 'captured'
  ) THEN
    IF v_current_status IN ('placed', 'preparing', 'ready', 'collected') THEN
      RETURN json_build_object('success', true, 'updated', false);
    ELSE
      RETURN json_build_object('success', true, 'updated', false, 'warning', 'Event already processed for order in status: ' || v_current_status);
    END IF;
  END IF;

  -- 4. State Machine and Settle check
  IF v_current_status NOT IN ('pending_payment', 'expired') THEN
    IF v_current_status IN ('placed', 'preparing', 'ready', 'collected') THEN
      RETURN json_build_object('success', true, 'updated', false);
    ELSE
      -- Terminal failure state — record payment but don't change order status
      SELECT id INTO v_existing_payment_id
      FROM public.payments
      WHERE order_id = p_order_id AND tenant_id = p_tenant_id;

      IF FOUND THEN
        UPDATE public.payments
        SET
          status = 'captured',
          razorpay_payment_id = COALESCE(p_payment_id, razorpay_payment_id),
          razorpay_order_id = COALESCE(p_razorpay_order_id, razorpay_order_id),
          raw_event_id = COALESCE(p_raw_event_id, raw_event_id),
          amount_paise = CASE WHEN p_amount_paise > 0 THEN p_amount_paise ELSE amount_paise END
        WHERE id = v_existing_payment_id;
      ELSE
        INSERT INTO public.payments (
          tenant_id, order_id, razorpay_order_id, razorpay_payment_id,
          amount_paise, status, raw_event_id
        ) VALUES (
          p_tenant_id, p_order_id, p_razorpay_order_id, p_payment_id,
          p_amount_paise, 'captured', p_raw_event_id
        );
      END IF;

      RETURN json_build_object('success', false, 'error', 'Order is in terminal state ' || v_current_status || ', payment recorded but status unchanged');
    END IF;
  END IF;

  -- 5. Normal Path: Upsert payment record and update order status to 'placed'
  SELECT id INTO v_existing_payment_id
  FROM public.payments
  WHERE order_id = p_order_id AND tenant_id = p_tenant_id;

  IF FOUND THEN
    UPDATE public.payments
    SET
      status = 'captured',
      razorpay_payment_id = COALESCE(p_payment_id, razorpay_payment_id),
      razorpay_order_id = COALESCE(p_razorpay_order_id, razorpay_order_id),
      raw_event_id = COALESCE(p_raw_event_id, raw_event_id),
      amount_paise = CASE WHEN p_amount_paise > 0 THEN p_amount_paise ELSE amount_paise END
    WHERE id = v_existing_payment_id;
  ELSE
    INSERT INTO public.payments (
      tenant_id, order_id, razorpay_order_id, razorpay_payment_id,
      amount_paise, status, raw_event_id
    ) VALUES (
      p_tenant_id, p_order_id, p_razorpay_order_id, p_payment_id,
      p_amount_paise, 'captured', p_raw_event_id
    );
  END IF;

  -- Update order status to placed, and ensure placed_at is set to NOW()
  -- (for orders that were in pending_payment, placed_at = created_at, but
  --  we update it here to reflect actual payment confirmation time)
  UPDATE public.orders
  SET 
    status = 'placed',
    placed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_order_id AND tenant_id = p_tenant_id;

  RETURN json_build_object('success', true, 'updated', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Add updated_at column to orders if not present (needed by the RPC above)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- 3. Add index for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id 
  ON public.payments(razorpay_order_id)
  WHERE razorpay_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payments_raw_event_id
  ON public.payments(raw_event_id)
  WHERE raw_event_id IS NOT NULL;

-- 4. Add index on order_events for faster realtime filtering  
CREATE INDEX IF NOT EXISTS idx_order_events_order_id_created
  ON public.order_events(order_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_events_tenant_created
  ON public.order_events(tenant_id, created_at DESC);

-- 5. Ensure order_type and table_label columns exist (needed for kitchen display)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_type text NOT NULL DEFAULT 'takeaway';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS table_label text;

-- 6. Grant execute on the updated RPC
GRANT EXECUTE ON FUNCTION public.execute_idempotent_payment_capture(uuid, uuid, text, text, int, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.execute_idempotent_payment_capture(uuid, uuid, text, text, int, text) TO service_role;
