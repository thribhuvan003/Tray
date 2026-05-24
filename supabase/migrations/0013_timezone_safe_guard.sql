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
declare t record;
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
    if ((now() at time zone 'Asia/Kolkata')::time) not between t.opens_at and t.closes_at then
      raise exception 'canteen_closed' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;
