import "server-only";
import { rateLimit } from "./index";

/**
 * Production-grade per-tenant + per-user rate limiting helper.
 *
 * This is a key "puzzle piece" for making the multi-tenant system safe at scale.
 *
 * It prevents:
 * - Noisy neighbor problems (one busy tenant overwhelming shared resources)
 * - Abuse by a single student or staff member
 * - Accidental or malicious load from one subdomain affecting others
 *
 * Usage:
 *   await tenantRateLimit(tenantId, "place_order", userId, { limit: 5, windowMs: 60_000 });
 *
 * Design goals (BlackRock/HFT production mindset):
 * - Simple, hard-to-misuse API
 * - Consistent key namespacing so limits are isolated per tenant
 * - Reuses the existing battle-tested rateLimit implementation
 * - Easy to extend with different limits per action type
 */

export type TenantRateLimitAction =
  | "place_order"
  | "verify_payment"
  | "kitchen_action"
  | "admin_action"
  | "general_api";

const DEFAULT_LIMITS: Record<TenantRateLimitAction, { limit: number; windowMs: number }> = {
  place_order: { limit: 8, windowMs: 60_000 },      // Students shouldn't hammer orders
  verify_payment: { limit: 10, windowMs: 60_000 },  // "I've paid" retries
  kitchen_action: { limit: 30, windowMs: 60_000 },  // Staff during rush (higher tolerance)
  admin_action: { limit: 20, windowMs: 60_000 },    // Admin panel usage
  general_api: { limit: 40, windowMs: 60_000 },     // Catch-all
};

export async function tenantRateLimit(
  tenantId: string,
  action: TenantRateLimitAction,
  userId?: string,
  overrides?: { limit?: number; windowMs?: number }
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const defaults = DEFAULT_LIMITS[action];
  const limit = overrides?.limit ?? defaults.limit;
  const windowMs = overrides?.windowMs ?? defaults.windowMs;

  // Strong namespacing: tenant → action → optional user
  const key = userId
    ? `tenant:${tenantId}:${action}:user:${userId}`
    : `tenant:${tenantId}:${action}`;

  return rateLimit(key, { limit, windowMs });
}
