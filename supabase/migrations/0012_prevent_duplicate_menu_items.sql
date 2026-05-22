-- Migration 0012: Prevent duplicate menu items & enable Realtime for tenants
--
-- 1. Create a case-insensitive unique index on (tenant_id, name) for non-archived menu items.
-- This ensures that admins cannot add two items with the same name (case-insensitive) under the same canteen.
create unique index if not exists menu_items_tenant_name_lower_idx 
  on public.menu_items(tenant_id, lower(name)) 
  where (status != 'archived');

-- 2. Add public.tenants to the supabase_realtime publication.
-- This lets client-side student portals receive immediate updates on canteen open/closed states
-- and new canteens appearing/disappearing.
do $$ begin
  alter publication supabase_realtime add table public.tenants;
exception when duplicate_object then null; end $$;
