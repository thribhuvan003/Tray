-- Migration: 20260525180000_harden_otp_atomic_verification.sql
-- Path: supabase/migrations/20260525180000_harden_otp_atomic_verification.sql

-- Drop the old version with 4 arguments to allow signature changes
DROP FUNCTION IF EXISTS public.verify_and_increment_otp_limit(uuid, uuid, text, text);

-- Create the hardened atomic verification function
CREATE OR REPLACE FUNCTION public.verify_and_increment_otp_limit(
  p_order_id uuid,
  p_tenant_id uuid,
  p_input_otp text
) RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_attempts int;
  v_current_status text;
  v_otp_hash text;
  v_otp_valid boolean;
BEGIN
  -- Perform an atomic row-level block on the target order row
  SELECT status::text, otp_attempts, otp_hash INTO v_current_status, v_current_attempts, v_otp_hash
  FROM public.orders
  WHERE id = p_order_id AND tenant_id = p_tenant_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'error', 'Order not found');
  END IF;

  IF v_current_status != 'ready' THEN
    RETURN json_build_object('ok', false, 'error', 'Order is not ready for pickup');
  END IF;

  IF v_otp_hash IS NULL THEN
    RETURN json_build_object('ok', false, 'error', 'Order does not have a pickup code set');
  END IF;

  IF v_current_attempts >= 3 THEN
    RETURN json_build_object('ok', false, 'error', 'Security lock active — threshold exceeded');
  END IF;

  -- Validate hash matching configurations directly in database execution path
  -- pin_hash/otp_hash uses pgcrypto crypt() with bf algorithm
  SELECT (crypt(p_input_otp, v_otp_hash) = v_otp_hash) INTO v_otp_valid;

  IF NOT v_otp_valid THEN
    UPDATE public.orders 
    SET otp_attempts = otp_attempts + 1 
    WHERE id = p_order_id AND tenant_id = p_tenant_id;
    
    RETURN json_build_object('ok', false, 'error', 'Invalid token provided', 'attemptsLeft', 3 - (v_current_attempts + 1));
  END IF;

  -- Advance status securely if validations match completely
  UPDATE public.orders 
  SET status = 'collected', collected_at = now() 
  WHERE id = p_order_id AND tenant_id = p_tenant_id;

  RETURN json_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_and_increment_otp_limit(uuid, uuid, text) TO authenticated;
