-- Helper function: look up an auth user's UUID by email.
-- Used by createInstitution to recover from "email already exists" errors
-- instead of blocking the user with a confusing error message.
-- SECURITY DEFINER so it can query auth.users without exposing the schema via REST.
CREATE OR REPLACE FUNCTION public.find_auth_user_id_by_email(p_email TEXT)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path TO auth, public
AS $$
  SELECT id FROM auth.users WHERE lower(email) = lower(p_email) LIMIT 1;
$$;
