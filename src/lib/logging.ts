/**
 * Structured logging utility for Tray (production-grade, minimal, extensible).
 *
 * Philosophy (matches senior-dev requirements from hardening plan):
 * - Every important action (payments, order state changes, webhooks, status updates, tenant ops) MUST log with rich context.
 * - Context keys: tenant_id, order_id, payment_id (razorpay or internal), user_id, razorpay_order_id, latency_ms, + arbitrary.
 * - Easy to swap backend later (Pino, Sentry, Datadog, etc.) without touching call sites.
 * - Starts with console + JSON for immediate observability on Vercel/Supabase logs.
 * - Graceful degradation: never throw on logging failure.
 *
 * Usage:
 *   import { logger } from "@/lib/logging";
 *   logger.info("order placed", { tenant_id, order_id, user_id, total_paise: total });
 *   const end = Date.now();
 *   logger.info("webhook processed", { ..., latency_ms: Date.now() - start });
 *
 * For per-request/request-scoped context:
 *   const log = logger.withContext({ tenant_id, request_id });
 *   log.warn("race avoided via guard", { order_id });
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = {
  tenant_id?: string;
  order_id?: string;
  payment_id?: string; // internal or razorpay_payment_id
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  user_id?: string;
  actor_user_id?: string;
  event_type?: string;
  status_from?: string;
  status_to?: string;
  latency_ms?: number;
  amount_paise?: number;
  error_code?: string;
  [key: string]: unknown; // allow arbitrary safe context
};

export interface Logger {
  debug(msg: string, ctx?: LogContext): void;
  info(msg: string, ctx?: LogContext): void;
  warn(msg: string, ctx?: LogContext): void;
  error(msg: string, err?: unknown, ctx?: LogContext): void;
  withContext(base: LogContext): Logger;
}

function format(level: LogLevel, msg: string, ctx?: LogContext, err?: unknown) {
  const ts = new Date().toISOString();
  const base = {
    ts,
    level,
    msg,
    ...ctx,
  };
  if (err) {
    (base as any).error = err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err;
  }
  return JSON.stringify(base);
}

function emit(level: LogLevel, msg: string, ctx?: LogContext, err?: unknown) {
  const line = format(level, msg, ctx, err);
  if (level === "error") {
    console.error(line);
    // Report to Sentry — lazy import so the logger stays usable in edge/middleware
    // and in tests where @sentry/nextjs is not loaded.
    if (typeof process !== "undefined" && process.env.SENTRY_DSN) {
      import("@sentry/nextjs").then(({ captureException, captureMessage, withScope }) => {
        withScope((scope) => {
          if (ctx) {
            Object.entries(ctx).forEach(([k, v]) => {
              if (v !== undefined) scope.setTag(k, String(v));
            });
          }
          scope.setTag("log_msg", msg);
          if (err instanceof Error) {
            captureException(err);
          } else {
            captureMessage(msg, "error");
          }
        });
      }).catch(() => {
        // Sentry not available — silently continue
      });
    }
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

function createLogger(baseCtx: LogContext = {}): Logger {
  const log = (level: LogLevel, msg: string, ctx?: LogContext, err?: unknown) => {
    const merged = { ...baseCtx, ...ctx };
    try {
      emit(level, msg, merged, err);
    } catch {
      // Never let logging break the app
      console.error("[logging] failed to emit", { level, msg });
    }
  };

  return {
    debug: (msg, ctx) => log("debug", msg, ctx),
    info: (msg, ctx) => log("info", msg, ctx),
    warn: (msg, ctx) => log("warn", msg, ctx),
    error: (msg, err, ctx) => log("error", msg, ctx, err),
    withContext: (extra) => createLogger({ ...baseCtx, ...extra }),
  };
}

export const logger: Logger = createLogger();

// Convenience for the most common "critical path" wrapper
export function withRequestContext(ctx: LogContext) {
  return logger.withContext(ctx);
}

// Example integration points (to be wired in Phase 1+):
// - webhook route: logger.withContext({ tenant_id, razorpay_payment_id, order_id }).info("webhook processed")
// - placeOrder: logger.withContext({ tenant_id, user_id }).info("order placed", { order_id, total_paise })
// - kitchen actions: logger.withContext({ tenant_id, actor_user_id: user.id }).info("status transition", { order_id, from, to })
// - reconcile cron: logger.info("reconcile run", { reconciled, refunded, tenant_count: ... })

export default logger;
