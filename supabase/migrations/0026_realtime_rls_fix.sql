-- Fix Realtime sync for kitchen board and student tracking page.
--
-- Root cause: the existing "oe_tenant_read" policy uses current_tenant_id(),
-- which reads app.current_tenant set by the pre_request_set_tenant() PostgREST
-- hook. That hook fires on every HTTP request through PostgREST, but Supabase
-- Realtime uses a persistent WebSocket connection — the hook never runs, so
-- current_tenant_id() always returns null, and the RLS policy evaluates to
-- false for every row. No order_events ever reach Realtime subscribers, so
-- the kitchen board and student tracking page get no live updates.
--
-- Fix: add a second SELECT policy using tenant_memberships. Any authenticated
-- user who is an active member of the tenant can read its order_events. This
-- path does not need current_tenant_id() and works for both PostgREST and
-- WebSocket Realtime connections. The original oe_tenant_read policy stays
-- (it still gates server-side server-action reads).

drop policy if exists "oe_member_read" on public.order_events;
create policy "oe_member_read" on public.order_events
  for select using (
    tenant_id in (
      select tenant_id
      from public.tenant_memberships
      where user_id = auth.uid()
        and is_active = true
    )
  );

-- Same issue on order_status_logs (admin dashboard activity feed subscribes
-- to it for live updates). Add the same membership-based path.
drop policy if exists "osl_member_read" on public.order_status_logs;
create policy "osl_member_read" on public.order_status_logs
  for select using (
    tenant_id in (
      select tenant_id
      from public.tenant_memberships
      where user_id = auth.uid()
        and is_active = true
    )
  );
