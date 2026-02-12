export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { auth } from '@/server/auth';
import { reportCreateSchema } from '@/features/forum/types';
import { isModerator, isUserBanned } from '@/server/moderation';
import { createApiContext, applyRateLimit } from '@/server/api-helpers';
import { checkRateLimit, rateLimitHeaders } from '@/server/rate-limit';

/**
 * GET /api/forum/reports — Moderator queue.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
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
    const rlResponse = applyRateLimit(session.user.id, 'admin');
    if (rlResponse) return rlResponse;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !isModerator(user.role)) {
      return NextResponse.json(
        { error: 'Moderator access required', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    userCtx.logger.info('Fetching report queue', { action: 'reports.list' });

    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          filer: {
            select: { id: true, name: true, image: true, role: true },
          },
          resolver: {
            select: { id: true, name: true, image: true, role: true },
          },
          thread: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              author: {
                select: { id: true, name: true, image: true, role: true },
              },
            },
          },
          post: {
            select: {
              id: true,
              body: true,
              status: true,
              threadId: true,
              author: {
                select: { id: true, name: true, image: true, role: true },
              },
            },
          },
        },
      }),
      prisma.report.count({ where }),
    ]);

    const data = reports.map((r) => ({
      id: r.id,
      reason: r.reason,
      description: r.description,
      status: r.status,
      filer: r.filer,
      resolver: r.resolver,
      resolution: r.resolution,
      thread: r.thread,
      post: r.post,
      createdAt: r.createdAt.toISOString(),
      resolvedAt: r.resolvedAt?.toISOString() ?? null,
    }));

    const latencyMs = Math.round(performance.now() - start);
    userCtx.logger.info('Report queue fetched', { action: 'reports.list', latencyMs, metadata: { total } });

    const response = NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

    const rl = checkRateLimit(session.user.id, 'admin');
    for (const [k, v] of Object.entries(rateLimitHeaders(rl))) {
      response.headers.set(k, v);
    }
    return response;
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    ctx.logger.error('Failed to fetch reports', {
      action: 'reports.list',
      latencyMs,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json(
      { error: 'Failed to fetch reports', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/forum/reports — File a report.
 */
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
    const rlResponse = applyRateLimit(session.user.id, 'report');
    if (rlResponse) return rlResponse;

    userCtx.logger.info('Filing report', { action: 'report.create' });

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

    if (isUserBanned(user)) {
      return NextResponse.json(
        { error: 'Your account is suspended', code: 'BANNED' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = reportCreateSchema.safeParse(body);
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

    const { reason, description, threadId, postId } = parsed.data;

    if (threadId) {
      const thread = await prisma.thread.findFirst({
        where: { id: threadId, deletedAt: null },
        select: { id: true },
      });
      if (!thread) {
        return NextResponse.json(
          { error: 'Thread not found', code: 'NOT_FOUND' },
          { status: 404 },
        );
      }
    }

    if (postId) {
      const post = await prisma.post.findFirst({
        where: { id: postId, deletedAt: null },
        select: { id: true },
      });
      if (!post) {
        return NextResponse.json(
          { error: 'Post not found', code: 'NOT_FOUND' },
          { status: 404 },
        );
      }
    }

    const existingReport = await prisma.report.findFirst({
      where: {
        filerId: session.user.id,
        ...(threadId ? { threadId } : {}),
        ...(postId ? { postId } : {}),
        status: { in: ['OPEN', 'IN_REVIEW'] },
      },
    });

    if (existingReport) {
      return NextResponse.json(
        {
          error: 'You have already reported this content',
          code: 'DUPLICATE_REPORT',
        },
        { status: 409 },
      );
    }

    const report = await prisma.report.create({
      data: {
        reason,
        description: description ?? null,
        filerId: session.user.id,
        threadId: threadId ?? null,
        postId: postId ?? null,
      },
      include: {
        filer: {
          select: { id: true, name: true, image: true, role: true },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'report.create',
        entityType: 'report',
        entityId: report.id,
        userId: session.user.id,
        changes: { reason, threadId: threadId ?? null, postId: postId ?? null },
      },
    });

    const latencyMs = Math.round(performance.now() - start);
    userCtx.logger.info('Report filed', {
      action: 'report.create',
      latencyMs,
      metadata: { reportId: report.id, reason },
    });

    return NextResponse.json(
      {
        data: {
          id: report.id,
          reason: report.reason,
          description: report.description,
          status: report.status,
          filer: report.filer,
          createdAt: report.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    ctx.logger.error('Failed to create report', {
      action: 'report.create',
      latencyMs,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json(
      { error: 'Failed to create report', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
