-- ── verify_and_increment_otp_limit: OTP check with atomic database-side lock and lockout count ──
create or replace function public.verify_and_increment_otp_limit(
  p_order_id uuid,
  p_tenant_id uuid,
  p_input_otp text,
  p_expected_hash text
) returns json
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  v_current_attempts int;
  v_current_status text;
  v_otp_valid boolean;
begin
  -- Perform an atomic row-level block on the target order row
  select status::text, otp_attempts into v_current_status, v_current_attempts
  from public.orders
  where id = p_order_id and tenant_id = p_tenant_id
  for update;

  if not found then
    return json_build_object('ok', false, 'error', 'Order not found');
  end if;

  if v_current_status != 'ready' then
    return json_build_object('ok', false, 'error', 'Order is not ready for pickup');
  end if;

  if v_current_attempts >= 3 then
    return json_build_object('ok', false, 'error', 'Security lock active — threshold exceeded');
  end if;

  -- Validate hash matching configurations directly in database execution path
  -- pin_hash/otp_hash uses pgcrypto crypt() with bf algorithm
  select (crypt(p_input_otp, p_expected_hash) = p_expected_hash) into v_otp_valid;

  if not v_otp_valid then
    update public.orders 
    set otp_attempts = otp_attempts + 1 
    where id = p_order_id and tenant_id = p_tenant_id;
    
    return json_build_object('ok', false, 'error', 'Invalid token provided', 'attemptsLeft', 3 - (v_current_attempts + 1));
  END IF;

  -- Advance status securely if validations match completely
  update public.orders 
  set status = 'collected', collected_at = now() 
  where id = p_order_id and tenant_id = p_tenant_id;

  return json_build_object('ok', true);
end;
$$;

grant execute on function public.verify_and_increment_otp_limit(uuid, uuid, text, text) to authenticated;
