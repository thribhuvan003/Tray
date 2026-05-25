-- =====================================================================
-- PAYMENT TRUST & AUDIT MIGRATION
-- Adds a upi_payment_logs table to track every UPI-direct payment event
-- so admins can see exactly which payments came in and reconcile manually
-- if there's ever a dispute. Also adds missing index for fast lookup.
-- =====================================================================

-- 1. UPI payment event log (trust-but-verify audit trail)
CREATE TABLE IF NOT EXISTS public.upi_payment_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount_paise    INTEGER NOT NULL,
  upi_vpa         TEXT NOT NULL,        -- the VPA money was sent TO (admin's UPI)
  student_name    TEXT,
  short_code      TEXT,
  trust_event     TEXT NOT NULL DEFAULT 'student_confirmed', -- how we learned payment happened
  client_ua       TEXT,                 -- user-agent of the device that confirmed
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_upi_logs_tenant_created
  ON public.upi_payment_logs (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_upi_logs_order
  ON public.upi_payment_logs (order_id);

-- 2. Add upi_vpa column to payments table so we record which UPI received money
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS upi_vpa TEXT;

-- 3. Ensure payments table has index on order_id for fast lookup
CREATE INDEX IF NOT EXISTS idx_payments_order_id_lookup
  ON public.payments (order_id, tenant_id, created_at DESC);

-- 4. RLS for upi_payment_logs
ALTER TABLE public.upi_payment_logs ENABLE ROW LEVEL SECURITY;

-- Admins and kitchen staff can read their tenant's UPI logs
CREATE POLICY "upi_logs_tenant_read" ON public.upi_payment_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tenant_memberships tm
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = upi_payment_logs.tenant_id
        AND tm.role IN ('canteen_admin', 'kitchen_staff', 'super_admin')
        AND tm.is_active = true
    )
  );

-- Service role can insert (via server actions only)
CREATE POLICY "upi_logs_service_insert" ON public.upi_payment_logs
  FOR INSERT
  WITH CHECK (true); -- restricted to service_role by admin client

COMMENT ON TABLE public.upi_payment_logs IS
  'Audit trail for UPI-direct payments. Each row records when a student confirmed payment and the UPI VPA the money was sent to. Used for admin reconciliation.';
