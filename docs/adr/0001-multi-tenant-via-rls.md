# ADR 0001: Multi-tenancy via Postgres RLS + header-driven session var

## Context
Tray serves many colleges from a single Postgres + a single Next.js deployment. The cost of a tenant data leak is catastrophic (one college sees another's revenue/customers/menu). We need isolation that is impossible to forget in application code.

## Decision
Every tenant-scoped row carries `tenant_id`. Row-Level Security is enabled on every such table. Policies key off `current_tenant_id()`, which reads the session variable `app.current_tenant`. The session variable is set by a `pre_request` PostgREST hook that reads the `x-tenant-id` HTTP header on every request. The Next.js middleware resolves subdomain → slug → tenant id, and both the server and browser Supabase clients send that header automatically.

## Consequences
- The application *cannot* leak across tenants by accident — even a forgotten `.eq("tenant_id", …)` is caught by RLS.
- Webhooks (Razorpay) use the service-role client which bypasses RLS; those handlers must filter by tenant explicitly.
- Realtime channels are filtered by `tenant_id` at the client. Supabase's Realtime RLS must remain enabled at the project level.
