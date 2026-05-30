-- Add admin_phone to tenants so Tray can SMS the canteen owner when a new order arrives.
-- Nullable — existing canteens don't have a phone yet; the feature is opt-in from Settings.

alter table public.tenants
  add column if not exists admin_phone text;
