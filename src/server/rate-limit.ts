/**
 * In-memory token-bucket rate limiter for Bharatvarsh forum API.
 *
 * Uses a sliding-window token bucket per (identifier + endpoint-type).
 * Identifier is typically userId for authenticated requests, or IP for
 * unauthenticated readers.
 *
 * This is intentionally in-memory for the demo phase. For production
 * with multiple Cloud Run instances, swap to Redis
 * (e.g., @upstash/ratelimit) in Phase 7+.
 */

import 'server-only';

// ─── Rate Limit Configuration ────────────────────────────────

export type RateLimitTier =
  | 'read'
  | 'create'
  | 'react'
  | 'report'
  | 'ai'
  | 'admin';

interface TierConfig {
  /** Maximum requests allowed in the window. */
  maxTokens: number;
  /** Window duration in milliseconds. */
  windowMs: number;
}

const TIER_CONFIGS: Record<RateLimitTier, TierConfig> = {
  read: { maxTokens: 60, windowMs: 60_000 },
  create: { maxTokens: 10, windowMs: 60_000 },
  react: { maxTokens: 30, windowMs: 60_000 },
  report: { maxTokens: 5, windowMs: 60_000 },
  ai: { maxTokens: 5, windowMs: 60_000 },
  admin: { maxTokens: 30, windowMs: 60_000 },
};

// ─── Token Bucket State ──────────────────────────────────────

interface Bucket {
  tokens: number;
  lastRefill: number;
}

/** In-memory store: key = `${identifier}:${tier}` */
const buckets = new Map<string, Bucket>();

/** Periodic cleanup interval (5 minutes). */
const CLEANUP_INTERVAL_MS = 5 * 60_000;

/** Remove stale buckets that haven't been touched in 10 minutes. */
const STALE_THRESHOLD_MS = 10 * 60_000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (now - bucket.lastRefill > STALE_THRESHOLD_MS) {
        buckets.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
  // Prevent the timer from keeping the process alive.
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref();
  }
}

// ─── Public API ──────────────────────────────────────────────

export interface RateLimitResult {
  /** Whether the request is allowed. */
  allowed: boolean;
  /** Maximum tokens for this tier. */
  limit: number;
  /** Tokens remaining after this request. */
  remaining: number;
  /** Unix timestamp (seconds) when the bucket fully refills. */
  resetAt: number;
  /** Seconds until the caller should retry (only set when blocked). */
  retryAfter?: number;
}

/**
 * Check and consume a rate-limit token.
 *
 * @param identifier - Unique caller identifier (userId or IP).
 * @param tier       - The rate-limit tier for this endpoint type.
 * @returns Whether the request is allowed plus quota metadata.
 */
export function checkRateLimit(
  identifier: string,
  tier: RateLimitTier,
): RateLimitResult {
  ensureCleanup();

  const config = TIER_CONFIGS[tier];
  const key = `${identifier}:${tier}`;
  const now = Date.now();

  let bucket = buckets.get(key);

  if (!bucket) {
    bucket = { tokens: config.maxTokens, lastRefill: now };
    buckets.set(key, bucket);
  }

  // Refill tokens proportionally to elapsed time.
  const elapsed = now - bucket.lastRefill;
  const refillRate = config.maxTokens / config.windowMs;
  const refilled = Math.min(
    config.maxTokens,
    bucket.tokens + elapsed * refillRate,
  );
  bucket.tokens = refilled;
  bucket.lastRefill = now;

  // Calculate reset time (when bucket would be full again).
  const tokensNeeded = config.maxTokens - bucket.tokens;
  const msToFull = tokensNeeded > 0 ? tokensNeeded / refillRate : 0;
  const resetAt = Math.ceil((now + msToFull) / 1000);

  if (bucket.tokens < 1) {
    const retryAfterMs = (1 - bucket.tokens) / refillRate;
    return {
      allowed: false,
      limit: config.maxTokens,
      remaining: 0,
      resetAt,
      retryAfter: Math.ceil(retryAfterMs / 1000),
    };
  }

  // Consume one token.
  bucket.tokens -= 1;

  return {
    allowed: true,
    limit: config.maxTokens,
    remaining: Math.floor(bucket.tokens),
    resetAt,
  };
}

/**
 * Build standard rate-limit headers for an HTTP response.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.resetAt),
  };
  if (result.retryAfter !== undefined) {
    headers['Retry-After'] = String(result.retryAfter);
  }
  return headers;
}
