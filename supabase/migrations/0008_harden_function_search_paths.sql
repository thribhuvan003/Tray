-- Pin search_path on the remaining helper functions so a session-level
-- search_path override can't redirect them to a shadow schema. Supabase
-- database-linter flagged these as function_search_path_mutable.

alter function public.current_tenant_id()         set search_path = public, pg_temp;
alter function public.touch_updated_at()          set search_path = public, pg_temp;
alter function public.next_order_short_code(uuid) set search_path = public, pg_temp;
alter function public.pre_request_set_tenant()    set search_path = public, pg_temp;
