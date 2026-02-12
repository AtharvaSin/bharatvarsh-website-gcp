export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { auth } from '@/server/auth';
import { isModerator, removeContent, warnUser } from '@/server/moderation';
import { createApiContext, applyRateLimit } from '@/server/api-helpers';

const reportResolveSchema = z.object({
  status: z.enum(['RESOLVED_REMOVED', 'RESOLVED_DISMISSED', 'RESOLVED_WARNED']),
  resolution: z.string().min(1, 'Resolution is required').max(2000),
});

/**
 * PATCH /api/forum/reports/[id] — Resolve a report.
 */
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

    const userCtx = createApiContext(request, session.user.id);
    const rlResponse = applyRateLimit(session.user.id, 'admin');
    if (rlResponse) return rlResponse;

    userCtx.logger.info('Resolving report', { action: 'report.resolve', metadata: { reportId: id } });

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

    const body = await request.json();
    const parsed = reportResolveSchema.safeParse(body);
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

    const { status, resolution } = parsed.data;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        thread: {
          select: {
            id: true,
            authorId: true,
            status: true,
          },
        },
        post: {
          select: {
            id: true,
            authorId: true,
            status: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    if (
      report.status === 'RESOLVED_REMOVED' ||
      report.status === 'RESOLVED_DISMISSED' ||
      report.status === 'RESOLVED_WARNED'
    ) {
      return NextResponse.json(
        { error: 'Report is already resolved', code: 'ALREADY_RESOLVED' },
        { status: 409 },
      );
    }

    if (status === 'RESOLVED_REMOVED') {
      if (report.thread) {
        await removeContent('thread', report.thread.id, resolution, session.user.id);
      }
      if (report.post) {
        await removeContent('post', report.post.id, resolution, session.user.id);
      }
    }

    if (status === 'RESOLVED_WARNED') {
      const authorId = report.thread?.authorId ?? report.post?.authorId;
      if (authorId) {
        await warnUser(authorId, resolution, session.user.id);
      }
    }

    const updated = await prisma.report.update({
      where: { id },
      data: {
        status,
        resolution,
        resolverId: session.user.id,
        resolvedAt: new Date(),
      },
      include: {
        filer: {
          select: { id: true, name: true, image: true, role: true },
        },
        resolver: {
          select: { id: true, name: true, image: true, role: true },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'report.resolve',
        entityType: 'report',
        entityId: id,
        userId: session.user.id,
        changes: {
          previousStatus: report.status,
          newStatus: status,
          resolution,
          targetThreadId: report.threadId,
          targetPostId: report.postId,
        },
      },
    });

    const latencyMs = Math.round(performance.now() - start);
    userCtx.logger.info('Report resolved', {
      action: 'report.resolve',
      latencyMs,
      metadata: { reportId: id, status },
    });

    return NextResponse.json({
      data: {
        id: updated.id,
        reason: updated.reason,
        description: updated.description,
        status: updated.status,
        resolution: updated.resolution,
        filer: updated.filer,
        resolver: updated.resolver,
        createdAt: updated.createdAt.toISOString(),
        resolvedAt: updated.resolvedAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    ctx.logger.error('Failed to resolve report', {
      action: 'report.resolve',
      latencyMs,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json(
      { error: 'Failed to resolve report', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
