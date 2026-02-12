/**
 * API Route: GET /api/health
 * Health check endpoint for Cloud Run and monitoring.
 * Tests database connectivity via Prisma.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
  let dbStatus: 'connected' | 'error' = 'error';
  let dbLatencyMs: number | null = null;

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - start;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'error';
  }

  const healthy = dbStatus === 'connected';

  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'degraded',
      db: dbStatus,
      dbLatencyMs,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  );
}
