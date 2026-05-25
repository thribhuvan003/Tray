-- Migration: 20260525181000_harden_payment_capture_idempotency.sql
-- Path: supabase/migrations/20260525181000_harden_payment_capture_idempotency.sql

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
  IF p_payment_id IS NOT NULL AND EXISTS (
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
  -- If order status is NOT 'pending_payment' or 'expired', do not change status.
  IF v_current_status NOT IN ('pending_payment', 'expired') THEN
    -- If already paid and active, no-op success
    IF v_current_status IN ('placed', 'preparing', 'ready', 'collected') THEN
      RETURN json_build_object('success', true, 'updated', false);
    ELSE
      -- The order is in a terminal failure state (rejected, etc.).
      -- We still record the payment captured status to prevent discrepancy, but don't change order status.
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
    );
  END IF;

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
