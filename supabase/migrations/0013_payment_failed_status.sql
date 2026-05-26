-- Tray — add payment_failed to order_status enum
-- Guards the payment.failed webhook transition path.

alter type public.order_status add value if not exists 'payment_failed';
