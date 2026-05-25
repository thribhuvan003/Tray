-- Migration: 20260525173500_fix_recursive_membership_rls.sql
-- Path: supabase/migrations/20260525173500_fix_recursive_membership_rls.sql

-- Drop policies on public.tenant_memberships
DROP POLICY IF EXISTS "memberships_self_read" ON public.tenant_memberships;
DROP POLICY IF EXISTS "Users can view members of same tenant" ON public.tenant_memberships;

-- Create the optimized, recursion-free select policy for tenant_memberships
CREATE POLICY "memberships_self_read" ON public.tenant_memberships
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR tenant_id = ((auth.jwt() -> 'user_metadata' ->> 'tenant_id')::UUID)
    OR tenant_id = public.current_tenant_id()
  );

-- Just in case there is a table named memberships in some database schema variations
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'memberships') THEN
    EXECUTE 'DROP POLICY IF EXISTS "memberships_self_read" ON public.memberships';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view members of same tenant" ON public.memberships';
    EXECUTE 'CREATE POLICY "memberships_self_read" ON public.memberships FOR SELECT USING (user_id = auth.uid() OR tenant_id = ((auth.jwt() -> ''user_metadata'' ->> ''tenant_id'')::UUID) OR tenant_id = public.current_tenant_id())';
  END IF;
END $$;
