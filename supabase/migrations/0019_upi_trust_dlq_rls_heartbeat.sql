-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 0019
-- A. P1-5: upi_trust_enabled flag on tenants (explicit opt-in for non-live mode)
-- B. P2-6: Restrict webhook_dlq to canteen_admin / super_admin only
-- C. P2-4: cron_heartbeats table for dead-man switch monitoring
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── A. UPI trust explicit opt-in ─────────────────────────────────────────────
-- When razorpayLive = false, verifyPaymentNow falls back to the "student claims
-- they paid" trust flow. This is acceptable in controlled pilots (college knows
-- their students), but NOT acceptable by default in any deployment.
-- Require the canteen admin to explicitly enable it per-tenant.
alter table public.tenants
  add column if not exists upi_trust_enabled boolean not null default false;

comment on column public.tenants.upi_trust_enabled is
  'When razorpayLive=false (no Razorpay keys), allow students to self-verify
   UPI payments via "I have paid" flow. Default false — must be explicitly enabled
   per tenant by a canteen_admin. Kitchen board shows ⚠️ UNVERIFIED badge for these orders.';


-- ── B. webhook_dlq RLS — admins only ─────────────────────────────────────────
-- The existing wd_tenant_read policy allows any authenticated user whose
-- session carries the right tenant_id to read DLQ entries, exposing Razorpay
-- payment IDs to students. Restrict to canteen_admin and super_admin roles.
drop policy if exists "wd_tenant_read" on public.webhook_dlq;

create policy "wd_admin_read" on public.webhook_dlq
  for select
  using (
    tenant_id = public.current_tenant_id()
    and exists (
      select 1 from public.tenant_memberships tm
      where tm.tenant_id = public.current_tenant_id()
        and tm.user_id = auth.uid()
        and tm.role in ('canteen_admin', 'super_admin')
        and tm.is_active = true
    )
  );


-- ── C. Cron heartbeats — dead-man switch ─────────────────────────────────────
-- Each cron job bumps last_run_at at the start of its run.
-- A monitoring query (or Sentry alert) can detect stale entries:
--   SELECT * FROM cron_heartbeats WHERE last_run_at < now() - interval '5 minutes'
-- This eliminates QStash as a single point of failure for order expiry.

create table if not exists public.cron_heartbeats (
  job_name    text primary key,
  last_run_at timestamptz not null default now(),
  last_ok     boolean not null default true,
  last_result jsonb
);

-- Restrict to service_role only (cron jobs use the service role)
alter table public.cron_heartbeats enable row level security;
create policy "heartbeat_service_only" on public.cron_heartbeats
  for all using (false);  -- no anon/authenticated access; service_role bypasses RLS

grant all on public.cron_heartbeats to service_role;
