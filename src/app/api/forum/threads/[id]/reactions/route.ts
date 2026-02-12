export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { auth } from '@/server/auth';
import { reactionSchema } from '@/features/forum/types';
import { createApiContext, applyRateLimit } from '@/server/api-helpers';

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

    const userCtx = createApiContext(request, session.user.id);
    const rlResponse = applyRateLimit(session.user.id, 'react');
    if (rlResponse) return rlResponse;

    const body = await request.json();
    const parsed = reactionSchema.safeParse(body);
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

    const { type } = parsed.data;

    // Check if reaction already exists (toggle)
    const existing = await prisma.reaction.findUnique({
      where: {
        userId_threadId_type: {
          userId: session.user.id,
          threadId,
          type,
        },
      },
    });

    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } });
      const latencyMs = Math.round(performance.now() - start);
      userCtx.logger.info('Reaction removed', { action: 'reaction.toggle', latencyMs, metadata: { type, threadId } });
      return NextResponse.json({ data: { type, removed: true } });
    }

    await prisma.reaction.create({
      data: {
        type,
        userId: session.user.id,
        threadId,
      },
    });

    const latencyMs = Math.round(performance.now() - start);
    userCtx.logger.info('Reaction added', { action: 'reaction.toggle', latencyMs, metadata: { type, threadId } });

    return NextResponse.json({ data: { type, removed: false } });
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    ctx.logger.error('Failed to react', {
      action: 'reaction.toggle',
      latencyMs,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json(
      { error: 'Failed to react', code: 'INTERNAL_ERROR' },
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
    const { id: threadId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    const userCtx = createApiContext(request, session.user.id);
    const rlResponse = applyRateLimit(session.user.id, 'react');
    if (rlResponse) return rlResponse;

    const body = await request.json();
    const parsed = reactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    const existing = await prisma.reaction.findUnique({
      where: {
        userId_threadId_type: {
          userId: session.user.id,
          threadId,
          type: parsed.data.type,
        },
      },
    });

    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } });
    }

    const latencyMs = Math.round(performance.now() - start);
    userCtx.logger.info('Reaction removed', { action: 'reaction.delete', latencyMs });

    return NextResponse.json({ success: true });
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    ctx.logger.error('Failed to remove reaction', {
      action: 'reaction.delete',
      latencyMs,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json(
      { error: 'Failed to remove reaction', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
