import "server-only";
import { env, featureFlags } from "@/lib/env";

type Result = { success: boolean; limit: number; remaining: number; reset: number };

let _upstash: { Ratelimit: typeof import("@upstash/ratelimit").Ratelimit; rl: import("@upstash/ratelimit").Ratelimit } | null = null;

async function getUpstash() {
  if (_upstash || !featureFlags.upstashLive) return _upstash;
  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL!,
    token: env.UPSTASH_REDIS_REST_TOKEN!,
  });
  const rl = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "10 s"),
    analytics: false,
  });
  _upstash = { Ratelimit, rl };
  return _upstash;
}

// In-memory fallback when Upstash isn't configured.
const _mem = new Map<string, { count: number; reset: number }>();

export async function rateLimit(key: string, opts?: { limit?: number; windowMs?: number }): Promise<Result> {
  const limit = opts?.limit ?? 20;
  const windowMs = opts?.windowMs ?? 10_000;
  const u = await getUpstash();
  if (u) {
    const r = await u.rl.limit(key);
    return { success: r.success, limit: r.limit, remaining: r.remaining, reset: r.reset };
  }
  const now = Date.now();
  const cur = _mem.get(key);
  if (!cur || cur.reset < now) {
    _mem.set(key, { count: 1, reset: now + windowMs });
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
  }
  cur.count += 1;
  return {
    success: cur.count <= limit,
    limit,
    remaining: Math.max(0, limit - cur.count),
    reset: cur.reset,
  };
}
