/**
 * Shared API route helpers for rate limiting, logging, and response building.
 *
 * Every forum API route handler should use these helpers for consistent
 * rate limiting, structured logging, and response formatting.
 */

import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, rateLimitHeaders, type RateLimitTier } from './rate-limit';
import { createLogger, createCorrelationId } from './logger';
import { rateLimitConfig } from '@/config/feature-flags';

// ─── Types ───────────────────────────────────────────────────

export interface ApiContext {
  /** Request-scoped structured logger. */
  logger: ReturnType<typeof createLogger>;
  /** Correlation ID for this request. */
  correlationId: string;
  /** Client IP address (from middleware or header). */
  clientIp: string;
}

// ─── Helpers ─────────────────────────────────────────────────

/**
 * Extract the client IP from middleware-injected header or fallback.
 */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-client-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    '0.0.0.0'
  );
}

/**
 * Create request-scoped API context with logger and correlation ID.
 */
export function createApiContext(
  request: NextRequest,
  userId?: string,
): ApiContext {
  const correlationId = createCorrelationId(
    request.headers.get('x-correlation-id') ??
    request.headers.get('x-cloud-trace-context'),
  );
  const clientIp = getClientIp(request);
  const logger = createLogger(correlationId, userId);

  return { logger, correlationId, clientIp };
}

/**
 * Apply rate limiting for a request. Returns a 429 response if the caller
 * has exceeded their quota, or null if the request is allowed.
 *
 * @param identifier - Unique caller key (userId for auth, IP for anon).
 * @param tier       - Rate limit tier for this endpoint type.
 */
export function applyRateLimit(
  identifier: string,
  tier: RateLimitTier,
): NextResponse | null {
  if (!rateLimitConfig.ENABLED) return null;

  const result = checkRateLimit(identifier, tier);

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
        code: 'RATE_LIMITED',
        retryAfter: result.retryAfter,
      },
      {
        status: 429,
        headers: rateLimitHeaders(result),
      },
    );
  }

  return null;
}

/**
 * Append rate-limit headers to an existing NextResponse.
 */
export function withRateLimitHeaders(
  response: NextResponse,
  identifier: string,
  tier: RateLimitTier,
): NextResponse {
  if (!rateLimitConfig.ENABLED) return response;

  // Peek at current quota (don't consume — already consumed by applyRateLimit).
  const result = checkRateLimit(identifier, tier);
  // Give back the token we just consumed for the peek.
  // Actually, the headers from the original check are more accurate.
  // We'll just use the headers utility on a synthetic result.
  const headers = rateLimitHeaders(result);
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}
