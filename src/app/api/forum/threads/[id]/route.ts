export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { auth } from '@/server/auth';
import { threadUpdateSchema } from '@/features/forum/types';
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

    ctx.logger.info('Handling request', { action: 'thread.get' });

    const { id } = await params;

    const thread = await prisma.thread.findFirst({
      where: { id, deletedAt: null },
      include: {
        author: {
          select: { id: true, name: true, image: true, role: true },
        },
        tags: {
          include: {
            topic: {
              select: { id: true, name: true, slug: true, color: true },
            },
          },
        },
        reactions: { select: { type: true } },
        _count: { select: { posts: true } },
      },
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    // Increment view count (fire and forget)
    prisma.thread
      .update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {});

    const reactionCounts = {
      UPVOTE: 0,
      DOWNVOTE: 0,
      INSIGHTFUL: 0,
      FLAME: 0,
    };
    for (const r of thread.reactions) {
      reactionCounts[r.type]++;
    }

    const latencyMs = Math.round(performance.now() - start);
    ctx.logger.info('Request completed', { action: 'thread.get', latencyMs });

    const response = NextResponse.json({
      data: {
        id: thread.id,
        title: thread.title,
        slug: thread.slug,
        body: thread.body,
        bodyHtml: thread.bodyHtml,
        excerpt: thread.excerpt,
        isPinned: thread.isPinned,
        isLocked: thread.isLocked,
        viewCount: thread.viewCount,
        status: thread.status,
        author: thread.author,
        tags: thread.tags.map((t) => t.topic),
        reactionCounts,
        postCount: thread._count.posts,
        createdAt: thread.createdAt.toISOString(),
        updatedAt: thread.updatedAt.toISOString(),
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
      action: 'thread.get',
      latencyMs,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json(
      { error: 'Failed to fetch thread', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const ctx = createApiContext(request);
  const start = performance.now();

  try {
    const { id } = await params;
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

    userCtx.logger.info('Handling request', { action: 'thread.edit' });

    const thread = await prisma.thread.findFirst({
      where: { id, deletedAt: null },
      select: { authorId: true, title: true, body: true },
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    // Check ownership (author or moderator+)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isMod = user?.role === 'MODERATOR' || user?.role === 'ADMIN';
    if (thread.authorId !== session.user.id && !isMod) {
      return NextResponse.json(
        { error: 'You can only edit your own threads', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = threadUpdateSchema.safeParse(body);
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

    const updated = await prisma.thread.update({
      where: { id },
      data: parsed.data,
      include: {
        author: {
          select: { id: true, name: true, image: true, role: true },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'thread.edit',
        entityType: 'thread',
        entityId: id,
        userId: session.user.id,
        changes: {
          before: { title: thread.title, body: thread.body },
          after: parsed.data,
        },
      },
    });

    const latencyMs = Math.round(performance.now() - start);
    userCtx.logger.info('Request completed', { action: 'thread.edit', latencyMs });

    const response = NextResponse.json({ data: updated });

    // Add rate limit headers
    const rlResult = checkRateLimit(session.user.id, 'create');
    for (const [k, v] of Object.entries(rateLimitHeaders(rlResult))) {
      response.headers.set(k, v);
    }

    return response;
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    ctx.logger.error('Request failed', {
      action: 'thread.edit',
      latencyMs,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json(
      { error: 'Failed to update thread', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const ctx = createApiContext(request);
  const start = performance.now();

  try {
    const { id } = await params;
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

    userCtx.logger.info('Handling request', { action: 'thread.delete' });

    const thread = await prisma.thread.findFirst({
      where: { id, deletedAt: null },
      select: { authorId: true },
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isMod = user?.role === 'MODERATOR' || user?.role === 'ADMIN';
    if (thread.authorId !== session.user.id && !isMod) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    await prisma.thread.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'DELETED' },
    });

    await prisma.auditLog.create({
      data: {
        action: 'thread.delete',
        entityType: 'thread',
        entityId: id,
        userId: session.user.id,
      },
    });

    const latencyMs = Math.round(performance.now() - start);
    userCtx.logger.info('Request completed', { action: 'thread.delete', latencyMs });

    const response = NextResponse.json({ success: true });

    // Add rate limit headers
    const rlResult = checkRateLimit(session.user.id, 'create');
    for (const [k, v] of Object.entries(rateLimitHeaders(rlResult))) {
      response.headers.set(k, v);
    }

    return response;
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    ctx.logger.error('Request failed', {
      action: 'thread.delete',
      latencyMs,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json(
      { error: 'Failed to delete thread', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
