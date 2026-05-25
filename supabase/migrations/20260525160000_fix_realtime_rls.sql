-- Create security definer helper to check if a user can read an order's events
create or replace function public.can_read_order_event(p_order_id uuid, p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.tenant_memberships m
    where m.user_id = auth.uid()
      and m.tenant_id = p_tenant_id
      and m.is_active
      and m.role in ('kitchen_staff','canteen_admin','super_admin')
  ) or exists (
    select 1 from public.orders o
    where o.id = p_order_id
      and o.user_id = auth.uid()
  );
$$;

grant execute on function public.can_read_order_event(uuid, uuid) to authenticated;

-- Create security definer helper to increment OTP attempts atomically
create or replace function public.increment_otp_attempts(p_order_id uuid, p_tenant_id uuid)
returns table(status text, otp_hash text, otp_attempts int)
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  r_status text;
  r_otp_hash text;
  r_attempts int;
begin
  update public.orders
  set otp_attempts = orders.otp_attempts + 1
  where id = p_order_id
    and tenant_id = p_tenant_id
    and orders.otp_attempts < 3
  returning orders.status::text, orders.otp_hash, orders.otp_attempts 
  into r_status, r_otp_hash, r_attempts;
  
  if found then
    return query select r_status, r_otp_hash, r_attempts;
  end if;
end;
$$;

grant execute on function public.increment_otp_attempts(uuid, uuid) to authenticated;

-- Rewrite order_events select policy to handle Realtime context (current_tenant_id() is null)
drop policy if exists "oe_tenant_read" on public.order_events;
create policy "oe_tenant_read" on public.order_events
  for select using (
    (current_tenant_id() is not null and tenant_id = current_tenant_id() and public.can_read_order_event(order_id, tenant_id))
    or
    (current_tenant_id() is null and public.can_read_order_event(order_id, tenant_id))
  );

-- Rewrite menu_items select policy to handle Realtime context
drop policy if exists "menu_items_read" on public.menu_items;
create policy "menu_items_read" on public.menu_items
for select
using (
  (current_tenant_id() is not null and tenant_id = current_tenant_id())
  or
  (current_tenant_id() is null and tenant_id is not null)
);

-- Rewrite menu_categories select policy to handle Realtime context
drop policy if exists "menu_cat_read" on public.menu_categories;
create policy "menu_cat_read" on public.menu_categories
for select
using (
  (current_tenant_id() is not null and tenant_id = current_tenant_id())
  or
  (current_tenant_id() is null and tenant_id is not null)
);

-- Rewrite orders select policy to handle Realtime context
drop policy if exists orders_owner_read on public.orders;
create policy orders_owner_read on public.orders
for select
using (
  (current_tenant_id() is not null and tenant_id = current_tenant_id() and (user_id = auth.uid() or public.is_tenant_staff(current_tenant_id())))
  or
  (current_tenant_id() is null and (user_id = auth.uid() or public.is_tenant_staff(tenant_id)))
);

-- Rewrite order_items select policy to handle Realtime context
drop policy if exists order_items_read on public.order_items;
create policy order_items_read on public.order_items
for select
using (
  (current_tenant_id() is not null and tenant_id = current_tenant_id() and exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and (o.user_id = auth.uid() or public.is_tenant_staff(current_tenant_id()))
  ))
  or
  (current_tenant_id() is null and exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and (o.user_id = auth.uid() or public.is_tenant_staff(order_items.tenant_id))
  ))
);

-- Rewrite order_status_logs select policy to handle Realtime context
drop policy if exists osl_read on public.order_status_logs;
create policy osl_read on public.order_status_logs
for select
using (
  (current_tenant_id() is not null and tenant_id = current_tenant_id() and exists (
    select 1 from public.orders o
    where o.id = order_status_logs.order_id
      and (o.user_id = auth.uid() or public.is_tenant_staff(current_tenant_id()))
  ))
  or
  (current_tenant_id() is null and exists (
    select 1 from public.orders o
    where o.id = order_status_logs.order_id
      and (o.user_id = auth.uid() or public.is_tenant_staff(order_status_logs.tenant_id))
  ))
);

-- Rewrite payments select policy to handle Realtime context
drop policy if exists payments_read on public.payments;
create policy payments_read on public.payments
for select
using (
  (current_tenant_id() is not null and tenant_id = current_tenant_id() and exists (
    select 1 from public.orders o
    where o.id = payments.order_id
      and (o.user_id = auth.uid() or public.is_tenant_admin(current_tenant_id()))
  ))
  or
  (current_tenant_id() is null and exists (
    select 1 from public.orders o
    where o.id = payments.order_id
      and (o.user_id = auth.uid() or public.is_tenant_admin(payments.tenant_id))
  ))
);
