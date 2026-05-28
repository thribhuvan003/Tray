-- Atomic payment failure handler called by the Razorpay webhook on payment.failed events.
-- Mirrors safe_capture_payment: row-locks the order, updates both payments and orders
-- tables atomically, and emits event rows for Realtime listeners.
CREATE OR REPLACE FUNCTION public.safe_fail_payment(
  p_order_id    uuid,
  p_tenant_id   uuid,
  p_razorpay_oid text
) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_status   text;
  v_order_id uuid;
BEGIN
  SELECT id, status
  INTO   v_order_id, v_status
  FROM   orders
  WHERE  id = p_order_id AND tenant_id = p_tenant_id
  FOR UPDATE;

  IF v_order_id IS NULL THEN RETURN 'not_found'; END IF;
  IF v_status != 'pending_payment' THEN RETURN 'already_processed'; END IF;

  UPDATE payments
  SET    status = 'failed'
  WHERE  order_id          = p_order_id
    AND  tenant_id         = p_tenant_id
    AND  razorpay_order_id = p_razorpay_oid;

  UPDATE orders
  SET    status = 'payment_failed'
  WHERE  id        = p_order_id
    AND  tenant_id = p_tenant_id
    AND  status    = 'pending_payment';

  INSERT INTO order_events (tenant_id, order_id, event_type, payload)
  VALUES (p_tenant_id, p_order_id, 'status_changed',
    jsonb_build_object(
      'from', 'pending_payment', 'to', 'payment_failed',
      'razorpay_order_id', p_razorpay_oid,
      'source', 'razorpay_webhook'));

  INSERT INTO order_status_logs (tenant_id, order_id, from_status, to_status, note)
  VALUES (p_tenant_id, p_order_id, 'pending_payment', 'payment_failed',
    format('Payment failed via webhook. rzp_oid=%s', p_razorpay_oid));

  RETURN 'failed';
END;
$$;
