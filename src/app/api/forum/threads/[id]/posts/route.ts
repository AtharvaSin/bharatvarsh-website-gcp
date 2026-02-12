export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { auth } from '@/server/auth';
import { postCreateSchema } from '@/features/forum/types';
import { FORUM_LIMITS } from '@/features/forum/constants';
import { checkContent } from '@/server/ai/content-check';
import { runHeuristicChecks } from '@/server/ai/toxicity';
import { createApiContext, applyRateLimit } from '@/server/api-helpers';
import { checkRateLimit, rateLimitHeaders } from '@/server/rate-limit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const ctx = createApiContext(request);
  const start = performance.now();

  try {
    // Rate limit by client IP
    const rlResponse = applyRateLimit(ctx.clientIp, 'read');
    if (rlResponse) return rlResponse;

    ctx.logger.info('Handling request', { action: 'posts.list' });

    const { id: threadId } = await params;
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(
      50,
      Math.max(
        1,
        parseInt(
          searchParams.get('limit') || String(FORUM_LIMITS.POSTS_PER_PAGE),
        ),
      ),
    );
    const sort = searchParams.get('sort') || 'oldest';

    const where = {
      threadId,
      deletedAt: null,
      status: 'PUBLISHED' as const,
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: sort === 'newest' ? 'desc' : 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: {
            select: { id: true, name: true, image: true, role: true },
          },
          reactions: { select: { type: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    const data = posts.map((p) => {
      const reactionCounts = {
        UPVOTE: 0,
        DOWNVOTE: 0,
        INSIGHTFUL: 0,
        FLAME: 0,
      };
      for (const r of p.reactions) {
        reactionCounts[r.type]++;
      }
      return {
        id: p.id,
        body: p.body,
        bodyHtml: p.bodyHtml,
        status: p.status,
        author: p.author,
        parentId: p.parentId,
        reactionCounts,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      };
    });

    const latencyMs = Math.round(performance.now() - start);
    ctx.logger.info('Request completed', { action: 'posts.list', latencyMs });

    const response = NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

    // Add rate limit headers
    const rlResult = checkRateLimit(ctx.clientIp, 'read');
    for (const [k, v] of Object.entries(rateLimitHeaders(rlResult))) {
      response.headers.set(k, v);
    }
    // Dynamic response — do not cache at CDN level
    response.headers.set('Cache-Control', 'no-store');

    return response;
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    ctx.logger.error('Request failed', {
      action: 'posts.list',
      latencyMs,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json(
      { error: 'Failed to fetch posts', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const ctx = createApiContext(request);
  const start = performance.now();

  try {
    const { id: threadId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    // Update logger with userId
    const userCtx = createApiContext(request, session.user.id);

    // Rate limit by userId
    const rlResponse = applyRateLimit(session.user.id, 'create');
    if (rlResponse) return rlResponse;

    userCtx.logger.info('Handling request', { action: 'post.create' });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, bannedAt: true, bannedUntil: true },
    });

    if (!user || user.role === 'VISITOR') {
      return NextResponse.json(
        { error: 'Members only', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    if (
      user.bannedAt &&
      (!user.bannedUntil || user.bannedUntil > new Date())
    ) {
      return NextResponse.json(
        { error: 'Your account is suspended', code: 'BANNED' },
        { status: 403 },
      );
    }

    // Check thread exists and is not locked
    const thread = await prisma.thread.findFirst({
      where: { id: threadId, deletedAt: null },
      select: { isLocked: true },
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    if (thread.isLocked) {
      return NextResponse.json(
        { error: 'Thread is locked', code: 'THREAD_LOCKED' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = postCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    // ── AI Content Moderation (Phase 5) ──────────────────────
    let contentStatus: 'PUBLISHED' | 'QUARANTINED' = 'PUBLISHED';
    let aiCheckResult: 'PASS' | 'FLAGGED' | 'BLOCKED' | 'SKIPPED' = 'PASS';

    // 1. Heuristic checks (fast, no AI cost)
    const heuristic = runHeuristicChecks(parsed.data.body);
    if (heuristic.flagged) {
      contentStatus = 'QUARANTINED';
      aiCheckResult = 'FLAGGED';
    } else {
      // 2. AI content check
      const aiResult = await checkContent({
        content: parsed.data.body,
        contentType: 'post',
        authorId: session.user.id,
        context: `Thread: ${threadId}`,
      });

      if (aiResult.decision === 'BLOCKED') {
        return NextResponse.json(
          {
            error: 'Content blocked by moderation',
            code: 'AI_CONTENT_BLOCKED',
            reasons: aiResult.reasons,
          },
          { status: 422 },
        );
      }

      if (aiResult.decision === 'FLAGGED') {
        contentStatus = 'QUARANTINED';
        aiCheckResult = 'FLAGGED';
      }
    }

    const post = await prisma.post.create({
      data: {
        body: parsed.data.body,
        parentId: parsed.data.parentId || null,
        status: contentStatus,
        aiCheckResult,
        authorId: session.user.id,
        threadId,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true, role: true },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'post.create',
        entityType: 'post',
        entityId: post.id,
        userId: session.user.id,
        changes: { threadId, contentStatus, aiCheckResult },
      },
    });

    const latencyMs = Math.round(performance.now() - start);
    userCtx.logger.info('Request completed', { action: 'post.create', latencyMs });

    const response = NextResponse.json(
      { data: post, aiStatus: contentStatus === 'QUARANTINED' ? 'QUARANTINED' : 'PASS' },
      { status: 201 },
    );

    // Add rate limit headers
    const rlResult = checkRateLimit(session.user.id, 'create');
    for (const [k, v] of Object.entries(rateLimitHeaders(rlResult))) {
      response.headers.set(k, v);
    }

    return response;
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    ctx.logger.error('Request failed', {
      action: 'post.create',
      latencyMs,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json(
      { error: 'Failed to create post', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
