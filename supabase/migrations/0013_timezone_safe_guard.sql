-- Migration 0013: Operating hours timezone-safe check
--
-- Overrides the timezone-dependent localtime check inside public.guard_canteen_open()
-- to explicitly query Indian Standard Time (IST - Asia/Kolkata) which canteens operate under,
-- preventing server-side UTC timezone clashing.

create or replace function public.guard_canteen_open()
returns trigger
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare 
  t record;
  current_time_ist time;
  is_open_hours boolean;
begin
  select is_open, opens_at, closes_at, paused_until into t
  from public.tenants where id = new.tenant_id;
  if not t.is_open then
    raise exception 'canteen_closed' using errcode = 'P0001';
  end if;
  if t.paused_until is not null and t.paused_until > now() then
    raise exception 'canteen_paused' using errcode = 'P0001';
  end if;
  if t.opens_at is not null and t.closes_at is not null then
    current_time_ist := (now() at time zone 'Asia/Kolkata')::time;
    if t.opens_at <= t.closes_at then
      is_open_hours := current_time_ist >= t.opens_at and current_time_ist <= t.closes_at;
    else
      is_open_hours := current_time_ist >= t.opens_at or current_time_ist <= t.closes_at;
    end if;
    
    if not is_open_hours then
      raise exception 'canteen_closed' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;
