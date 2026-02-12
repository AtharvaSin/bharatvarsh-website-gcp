/**
 * Next.js Edge Middleware for Bharatvarsh.
 *
 * Responsibilities:
 * 1. Auth gate: Protects forum routes that require authentication.
 * 2. Rate limiting: Adds rate-limit metadata headers on forum API responses.
 *    (Actual token-bucket check happens in route handlers because Edge Runtime
 *    cannot import server-only modules. Middleware sets identifying headers.)
 * 3. IP-based abuse detection: Blocks IPs that exceed abuse thresholds.
 *
 * Because the project uses database-backed sessions (not JWT), the middleware
 * does NOT validate the token itself -- it only verifies the cookie is present.
 * Actual session validation happens server-side in route handlers and pages.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Auth: Protected Paths ───────────────────────────────────

const PROTECTED_PATHS = [
  '/forum/new',
  '/forum/me',
  '/forum/moderation',
] as const;

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function getSessionCookie(request: NextRequest): string | undefined {
  return (
    request.cookies.get('next-auth.session-token')?.value ??
    request.cookies.get('__Secure-next-auth.session-token')?.value
  );
}

// ─── IP-Based Abuse Detection (Phase 7) ─────────────────────

interface IpRecord {
  count: number;
  windowStart: number;
  blocked: boolean;
  blockedUntil: number;
}

/** In-memory IP tracking. Shared across requests in same instance. */
const ipTracker = new Map<string, IpRecord>();

/** Max requests per IP in the abuse window before blocking. */
const ABUSE_THRESHOLD = 300;

/** Abuse detection window (1 minute). */
const ABUSE_WINDOW_MS = 60_000;

/** Block duration for abusive IPs (5 minutes). */
const ABUSE_BLOCK_DURATION_MS = 5 * 60_000;

/** Cleanup stale entries every 2 minutes. */
const IP_CLEANUP_INTERVAL_MS = 2 * 60_000;

let ipCleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureIpCleanup(): void {
  if (ipCleanupTimer) return;
  ipCleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipTracker) {
      if (now - record.windowStart > ABUSE_WINDOW_MS && !record.blocked) {
        ipTracker.delete(ip);
      }
      if (record.blocked && now > record.blockedUntil) {
        ipTracker.delete(ip);
      }
    }
  }, IP_CLEANUP_INTERVAL_MS);
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '0.0.0.0'
  );
}

function checkIpAbuse(ip: string): boolean {
  ensureIpCleanup();

  const now = Date.now();
  let record = ipTracker.get(ip);

  if (!record) {
    record = { count: 1, windowStart: now, blocked: false, blockedUntil: 0 };
    ipTracker.set(ip, record);
    return false;
  }

  // Check if currently blocked.
  if (record.blocked) {
    if (now > record.blockedUntil) {
      // Unblock: reset the record.
      record.blocked = false;
      record.count = 1;
      record.windowStart = now;
      return false;
    }
    return true;
  }

  // Reset window if expired.
  if (now - record.windowStart > ABUSE_WINDOW_MS) {
    record.count = 1;
    record.windowStart = now;
    return false;
  }

  // Increment and check threshold.
  record.count++;
  if (record.count > ABUSE_THRESHOLD) {
    record.blocked = true;
    record.blockedUntil = now + ABUSE_BLOCK_DURATION_MS;
    return true;
  }

  return false;
}

// ─── Middleware Handler ──────────────────────────────────────

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // ── IP Abuse Check (forum API routes only) ─────────────────
  if (pathname.startsWith('/api/forum/')) {
    const ip = getClientIp(request);
    if (checkIpAbuse(ip)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests. Please try again later.',
          code: 'IP_BLOCKED',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil(ABUSE_BLOCK_DURATION_MS / 1000)),
          },
        },
      );
    }

    // Pass client IP and a correlation ID downstream for logging.
    const response = NextResponse.next();
    response.headers.set('x-client-ip', ip);
    response.headers.set(
      'x-correlation-id',
      request.headers.get('x-cloud-trace-context') ?? crypto.randomUUID(),
    );
    return response;
  }

  // ── Auth Gate (protected forum pages) ──────────────────────
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  const sessionToken = getSessionCookie(request);

  if (!sessionToken) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

// ─── Matcher ─────────────────────────────────────────────────

export const config = {
  matcher: [
    '/forum/new/:path*',
    '/forum/me/:path*',
    '/forum/moderation/:path*',
    '/api/forum/:path*',
  ],
};
