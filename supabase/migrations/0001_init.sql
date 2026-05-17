-- Tray — initial schema
-- Multi-tenant canteen platform. Every tenant-scoped row carries tenant_id.

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ── Helper: current tenant comes from a session-local var set by the app ──
create or replace function public.current_tenant_id() returns uuid
language sql stable as $$
  select nullif(current_setting('app.current_tenant', true), '')::uuid;
$$;

-- ── Enums ──
do $$ begin
  create type public.member_role as enum ('student','kitchen_staff','canteen_admin','super_admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.menu_item_status as enum ('draft','live','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.diet as enum ('veg','nonveg','egg');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum (
    'pending_payment','placed','preparing','ready','collected','rejected','expired'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('initiated','captured','failed','refunded');
exception when duplicate_object then null; end $$;

-- ── Core tables ──
create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  college_name text not null,
  allowed_domain text,
  logo_url text,
  hero_tagline text,
  upi_vpa text,                        -- canteen's UPI handle
  razorpay_key_id_enc text,            -- phase 2
  razorpay_key_secret_enc text,        -- phase 2
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  role public.member_role not null,
  display_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, tenant_id)
);
create index if not exists tm_user_idx on public.tenant_memberships(user_id);
create index if not exists tm_tenant_idx on public.tenant_memberships(tenant_id);

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists mc_tenant_idx on public.menu_categories(tenant_id);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  category_id uuid references public.menu_categories(id) on delete set null,
  name text not null,
  description text,
  price_paise int not null check (price_paise >= 0),
  diet public.diet not null default 'veg',
  image_url text,
  status public.menu_item_status not null default 'live',
  prep_target_seconds int not null default 480,        -- 8 min default SLA
  in_stock boolean not null default true,
  stock_qty int,                                       -- nullable: unlimited
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists mi_tenant_idx on public.menu_items(tenant_id);
create index if not exists mi_status_idx on public.menu_items(tenant_id, status);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  short_code text not null,                             -- e.g. T-2422
  status public.order_status not null default 'pending_payment',
  total_paise int not null check (total_paise >= 0),
  otp_hash text,                                        -- bcrypt; set when status->ready
  otp_attempts int not null default 0,
  customer_name text,
  customer_phone text,
  notes text,
  placed_at timestamptz not null default now(),
  ready_at timestamptz,
  collected_at timestamptz,
  payment_expires_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists orders_tenant_short_idx
  on public.orders(tenant_id, short_code);
create index if not exists orders_status_idx on public.orders(tenant_id, status);
create index if not exists orders_user_idx on public.orders(user_id);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  name_snapshot text not null,
  price_paise_snapshot int not null,
  diet_snapshot public.diet not null,
  qty int not null check (qty > 0)
);
create index if not exists oi_order_idx on public.order_items(order_id);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  amount_paise int not null,
  status public.payment_status not null default 'initiated',
  raw_event_id text unique,
  created_at timestamptz not null default now()
);
create index if not exists pay_order_idx on public.payments(order_id);

create table if not exists public.order_status_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists osl_order_idx on public.order_status_logs(order_id);

create table if not exists public.staff_invites (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  email text not null,
  role public.member_role not null,
  token text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists si_tenant_idx on public.staff_invites(tenant_id);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text,
  target_id uuid,
  meta jsonb,
  created_at timestamptz not null default now()
);
create index if not exists al_tenant_idx on public.audit_logs(tenant_id);
