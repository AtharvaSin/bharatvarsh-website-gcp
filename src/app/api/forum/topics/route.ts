export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { createApiContext, applyRateLimit } from '@/server/api-helpers';
import { checkRateLimit, rateLimitHeaders } from '@/server/rate-limit';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const ctx = createApiContext(request);
  const start = performance.now();

  try {
    const rlResponse = applyRateLimit(ctx.clientIp, 'read');
    if (rlResponse) return rlResponse;

    ctx.logger.info('Fetching topics', { action: 'topics.list' });

    const topics = await prisma.topic.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            threadTags: true,
          },
        },
      },
    });

    const data = topics.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      icon: t.icon,
      color: t.color,
      threadCount: t._count.threadTags,
    }));

    const latencyMs = Math.round(performance.now() - start);
    ctx.logger.info('Topics fetched', { action: 'topics.list', latencyMs, metadata: { count: data.length } });

    const response = NextResponse.json({ data });

    const rl = checkRateLimit(ctx.clientIp, 'read');
    for (const [k, v] of Object.entries(rateLimitHeaders(rl))) {
      response.headers.set(k, v);
    }
    return response;
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    ctx.logger.error('Failed to fetch topics', {
      action: 'topics.list',
      latencyMs,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json(
      { error: 'Failed to fetch topics', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
