export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { auth } from '@/server/auth';
import { postUpdateSchema } from '@/features/forum/types';
import { createApiContext, applyRateLimit } from '@/server/api-helpers';

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
    const rlResponse = applyRateLimit(session.user.id, 'create');
    if (rlResponse) return rlResponse;

    userCtx.logger.info('Editing post', { action: 'post.edit', metadata: { postId: id } });

    const post = await prisma.post.findFirst({
      where: { id, deletedAt: null },
      select: { authorId: true, body: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own posts', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = postUpdateSchema.safeParse(body);
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

    const updated = await prisma.post.update({
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
        action: 'post.edit',
        entityType: 'post',
        entityId: id,
        userId: session.user.id,
        changes: { before: { body: post.body }, after: parsed.data },
      },
    });

    const latencyMs = Math.round(performance.now() - start);
    userCtx.logger.info('Post edited', { action: 'post.edit', latencyMs });

    return NextResponse.json({ data: updated });
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    ctx.logger.error('Failed to update post', {
      action: 'post.edit',
      latencyMs,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json(
      { error: 'Failed to update post', code: 'INTERNAL_ERROR' },
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

    const userCtx = createApiContext(request, session.user.id);
    const rlResponse = applyRateLimit(session.user.id, 'create');
    if (rlResponse) return rlResponse;

    userCtx.logger.info('Deleting post', { action: 'post.delete', metadata: { postId: id } });

    const post = await prisma.post.findFirst({
      where: { id, deletedAt: null },
      select: { authorId: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isMod = user?.role === 'MODERATOR' || user?.role === 'ADMIN';
    if (post.authorId !== session.user.id && !isMod) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    await prisma.post.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'DELETED' },
    });

    await prisma.auditLog.create({
      data: {
        action: 'post.delete',
        entityType: 'post',
        entityId: id,
        userId: session.user.id,
      },
    });

    const latencyMs = Math.round(performance.now() - start);
    userCtx.logger.info('Post deleted', { action: 'post.delete', latencyMs });

    return NextResponse.json({ success: true });
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    ctx.logger.error('Failed to delete post', {
      action: 'post.delete',
      latencyMs,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json(
      { error: 'Failed to delete post', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
