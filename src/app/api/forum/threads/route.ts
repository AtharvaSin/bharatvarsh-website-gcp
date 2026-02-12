export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { auth } from '@/server/auth';
import { threadCreateSchema } from '@/features/forum/types';
import { slugify } from '@/shared/utils';
import { FORUM_LIMITS } from '@/features/forum/constants';
import { checkContent } from '@/server/ai/content-check';
import { runHeuristicChecks } from '@/server/ai/toxicity';
import { autoTagThread } from '@/server/ai/auto-tagger';
import { createApiContext, applyRateLimit } from '@/server/api-helpers';
import { checkRateLimit, rateLimitHeaders } from '@/server/rate-limit';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const ctx = createApiContext(request);
  const start = performance.now();

  try {
    const rlResponse = applyRateLimit(ctx.clientIp, 'read');
    if (rlResponse) return rlResponse;

    ctx.logger.info('Fetching thread list', { action: 'threads.list' });

    const { searchParams } = request.nextUrl;
    const topicSlug = searchParams.get('topicSlug');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(
      50,
      Math.max(
        1,
        parseInt(
          searchParams.get('limit') || String(FORUM_LIMITS.THREADS_PER_PAGE),
        ),
      ),
    );
    const sort = searchParams.get('sort') || 'latest';

    const where: Record<string, unknown> = {
      deletedAt: null,
      status: 'PUBLISHED',
    };

    if (topicSlug) {
      where.tags = {
        some: {
          topic: { slug: topicSlug },
        },
      };
    }

    const orderBy: Record<string, string>[] = [];
    orderBy.push({ isPinned: 'desc' });

    if (sort === 'popular') {
      orderBy.push({ viewCount: 'desc' });
    }
    orderBy.push({ createdAt: 'desc' });

    if (sort === 'unanswered') {
      where.posts = { none: {} };
    }

    const [threads, total] = await Promise.all([
      prisma.thread.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: {
            select: { id: true, name: true, image: true, role: true },
          },
          tags: {
            include: {
              topic: {
                select: { name: true, slug: true, color: true },
              },
            },
          },
          reactions: {
            select: { type: true },
          },
          _count: {
            select: { posts: true },
          },
        },
      }),
      prisma.thread.count({ where }),
    ]);

    const data = threads.map((t) => {
      const reactionCounts = {
        UPVOTE: 0,
        DOWNVOTE: 0,
        INSIGHTFUL: 0,
        FLAME: 0,
      };
      for (const r of t.reactions) {
        reactionCounts[r.type]++;
      }

      return {
        id: t.id,
        title: t.title,
        slug: t.slug,
        excerpt: t.excerpt,
        isPinned: t.isPinned,
        isLocked: t.isLocked,
        viewCount: t.viewCount,
        author: t.author,
        tags: t.tags.map((tag) => tag.topic),
        reactionCounts,
        postCount: t._count.posts,
        createdAt: t.createdAt.toISOString(),
      };
    });

    const latencyMs = Math.round(performance.now() - start);
    ctx.logger.info('Thread list fetched', {
      action: 'threads.list',
      latencyMs,
      metadata: { total, page, sort },
    });

    const response = NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

    const rl = checkRateLimit(ctx.clientIp, 'read');
    for (const [k, v] of Object.entries(rateLimitHeaders(rl))) {
      response.headers.set(k, v);
    }
    return response;
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    ctx.logger.error('Failed to fetch threads', {
      action: 'threads.list',
      latencyMs,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json(
      { error: 'Failed to fetch threads', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ctx = createApiContext(request);
  const start = performance.now();

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    const userCtx = createApiContext(request, session.user.id);

    const rlResponse = applyRateLimit(session.user.id, 'create');
    if (rlResponse) return rlResponse;

    userCtx.logger.info('Creating thread', { action: 'thread.create' });

    // Check ban status
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

    if (user.bannedAt && (!user.bannedUntil || user.bannedUntil > new Date())) {
      return NextResponse.json(
        { error: 'Your account is suspended', code: 'BANNED' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = threadCreateSchema.safeParse(body);
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

    const { title, body: threadBody, topicSlugs } = parsed.data;

    // Verify topics exist
    const topics = await prisma.topic.findMany({
      where: { slug: { in: topicSlugs } },
      select: { id: true, slug: true, isLocked: true },
    });

    if (topics.length !== topicSlugs.length) {
      return NextResponse.json(
        { error: 'One or more topics not found', code: 'INVALID_TOPICS' },
        { status: 400 },
      );
    }

    const lockedTopic = topics.find((t) => t.isLocked);
    if (lockedTopic) {
      return NextResponse.json(
        {
          error: `Topic "${lockedTopic.slug}" is locked`,
          code: 'TOPIC_LOCKED',
        },
        { status: 403 },
      );
    }

    // Generate unique slug
    let slug = slugify(title);
    const existing = await prisma.thread.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // ── AI Content Moderation (Phase 5) ──────────────────────
    let contentStatus: 'PUBLISHED' | 'QUARANTINED' = 'PUBLISHED';
    let aiCheckResult: 'PASS' | 'FLAGGED' | 'BLOCKED' | 'SKIPPED' = 'PASS';

    // 1. Run heuristic checks first (fast, no AI cost)
    const heuristic = runHeuristicChecks(`${title}\n${threadBody}`);
    if (heuristic.flagged) {
      contentStatus = 'QUARANTINED';
      aiCheckResult = 'FLAGGED';
    } else {
      // 2. Run AI content check
      const aiResult = await checkContent({
        content: `${title}\n\n${threadBody}`,
        contentType: 'thread',
        authorId: session.user.id,
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

    const thread = await prisma.thread.create({
      data: {
        title,
        slug,
        body: threadBody,
        status: contentStatus,
        aiCheckResult,
        authorId: session.user.id,
        tags: {
          create: topics.map((t) => ({ topicId: t.id })),
        },
      },
      include: {
        author: {
          select: { id: true, name: true, image: true, role: true },
        },
        tags: {
          include: {
            topic: { select: { name: true, slug: true, color: true } },
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'thread.create',
        entityType: 'thread',
        entityId: thread.id,
        userId: session.user.id,
        changes: { title, topicSlugs, contentStatus, aiCheckResult },
      },
    });

    // Trigger async auto-tagging for published content (non-blocking)
    if (contentStatus === 'PUBLISHED') {
      autoTagThread(thread.id).catch(() => {});
    }

    const latencyMs = Math.round(performance.now() - start);
    userCtx.logger.info('Thread created', {
      action: 'thread.create',
      latencyMs,
      metadata: { threadId: thread.id, contentStatus },
    });

    return NextResponse.json(
      { data: thread, aiStatus: contentStatus === 'QUARANTINED' ? 'QUARANTINED' : 'PASS' },
      { status: 201 },
    );
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    ctx.logger.error('Failed to create thread', {
      action: 'thread.create',
      latencyMs,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json(
      { error: 'Failed to create thread', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
