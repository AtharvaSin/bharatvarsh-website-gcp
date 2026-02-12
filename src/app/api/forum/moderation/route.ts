export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { auth } from '@/server/auth';
import {
  isAdmin,
  isModerator,
  removeContent,
  approveContent,
  warnUser,
  applyTempBan,
  applyPermBan,
  unbanUser,
  toggleThreadLock,
  toggleThreadPin,
} from '@/server/moderation';
import { createApiContext, applyRateLimit } from '@/server/api-helpers';
import { checkRateLimit, rateLimitHeaders } from '@/server/rate-limit';

/**
 * Zod schema for moderation action requests.
 * The `metadata` field carries action-specific data (e.g. ban duration).
 */
const moderationActionSchema = z.object({
  action: z.enum([
    'REMOVE_CONTENT',
    'APPROVE_CONTENT',
    'WARN_USER',
    'TEMP_BAN',
    'PERM_BAN',
    'UNBAN',
    'LOCK_THREAD',
    'UNLOCK_THREAD',
    'PIN_THREAD',
    'UNPIN_THREAD',
    'ROLE_CHANGE',
  ]),
  reason: z.string().min(1, 'Reason is required').max(2000),
  targetUserId: z.string().optional(),
  targetThreadId: z.string().optional(),
  targetPostId: z.string().optional(),
  metadata: z
    .object({
      banDuration: z.number().int().positive().optional(),
      newRole: z.enum(['VISITOR', 'MEMBER', 'MODERATOR', 'ADMIN']).optional(),
    })
    .optional(),
});

/**
 * GET /api/forum/moderation
 *
 * Fetch the audit log. Admin only.
 * Supports filtering by action, entityType, and userId.
 *
 * Query params:
 *   - page: page number (default 1)
 *   - limit: items per page (default 20, max 50)
 *   - action: filter by audit action string
 *   - entityType: filter by entity type
 *   - userId: filter by the user who performed the action
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

    userCtx.logger.info('Fetching audit log', { action: 'moderation.audit_log' });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !isAdmin(user.role)) {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const action = searchParams.get('action');
    const entityType = searchParams.get('entityType');
    const userId = searchParams.get('userId');

    const where: Record<string, unknown> = {};
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (userId) where.userId = userId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, image: true, role: true },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    const data = logs.map((log) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      changes: log.changes,
      user: log.user,
      createdAt: log.createdAt.toISOString(),
    }));

    const latencyMs = Math.round(performance.now() - start);
    userCtx.logger.info('Audit log fetched', {
      action: 'moderation.audit_log',
      latencyMs,
      metadata: { total },
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

    const rl = checkRateLimit(session.user.id, 'admin');
    for (const [k, v] of Object.entries(rateLimitHeaders(rl))) {
      response.headers.set(k, v);
    }
    return response;
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    ctx.logger.error('Failed to fetch audit log', {
      action: 'moderation.audit_log',
      latencyMs,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json(
      { error: 'Failed to fetch audit log', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/forum/moderation
 *
 * Execute a moderation action. Moderator+ role required.
 * Routes to the appropriate moderation function based on the action type.
 * Some actions (PERM_BAN, ROLE_CHANGE) require admin privileges.
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
    const rlResponse = applyRateLimit(session.user.id, 'admin');
    if (rlResponse) return rlResponse;

    userCtx.logger.info('Executing moderation action', { action: 'moderation.execute' });

    const moderator = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!moderator || !isModerator(moderator.role)) {
      return NextResponse.json(
        { error: 'Moderator access required', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = moderationActionSchema.safeParse(body);
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

    const {
      action,
      reason,
      targetUserId,
      targetThreadId,
      targetPostId,
      metadata,
    } = parsed.data;

    switch (action) {
      case 'REMOVE_CONTENT': {
        if (targetThreadId) {
          const thread = await prisma.thread.findFirst({
            where: { id: targetThreadId, deletedAt: null },
            select: { id: true },
          });
          if (!thread) {
            return NextResponse.json(
              { error: 'Thread not found', code: 'NOT_FOUND' },
              { status: 404 },
            );
          }
          await removeContent('thread', targetThreadId, reason, session.user.id);
        } else if (targetPostId) {
          const post = await prisma.post.findFirst({
            where: { id: targetPostId, deletedAt: null },
            select: { id: true },
          });
          if (!post) {
            return NextResponse.json(
              { error: 'Post not found', code: 'NOT_FOUND' },
              { status: 404 },
            );
          }
          await removeContent('post', targetPostId, reason, session.user.id);
        } else {
          return NextResponse.json(
            {
              error: 'targetThreadId or targetPostId is required for REMOVE_CONTENT',
              code: 'VALIDATION_ERROR',
            },
            { status: 400 },
          );
        }
        break;
      }

      case 'APPROVE_CONTENT': {
        if (targetThreadId) {
          const thread = await prisma.thread.findFirst({
            where: { id: targetThreadId, deletedAt: null },
            select: { id: true },
          });
          if (!thread) {
            return NextResponse.json(
              { error: 'Thread not found', code: 'NOT_FOUND' },
              { status: 404 },
            );
          }
          await approveContent('thread', targetThreadId, session.user.id);
        } else if (targetPostId) {
          const post = await prisma.post.findFirst({
            where: { id: targetPostId, deletedAt: null },
            select: { id: true },
          });
          if (!post) {
            return NextResponse.json(
              { error: 'Post not found', code: 'NOT_FOUND' },
              { status: 404 },
            );
          }
          await approveContent('post', targetPostId, session.user.id);
        } else {
          return NextResponse.json(
            {
              error: 'targetThreadId or targetPostId is required for APPROVE_CONTENT',
              code: 'VALIDATION_ERROR',
            },
            { status: 400 },
          );
        }
        break;
      }

      case 'WARN_USER': {
        if (!targetUserId) {
          return NextResponse.json(
            { error: 'targetUserId is required for WARN_USER', code: 'VALIDATION_ERROR' },
            { status: 400 },
          );
        }
        const targetUser = await prisma.user.findUnique({
          where: { id: targetUserId },
          select: { id: true },
        });
        if (!targetUser) {
          return NextResponse.json(
            { error: 'Target user not found', code: 'NOT_FOUND' },
            { status: 404 },
          );
        }
        await warnUser(targetUserId, reason, session.user.id);
        break;
      }

      case 'TEMP_BAN': {
        if (!targetUserId) {
          return NextResponse.json(
            { error: 'targetUserId is required for TEMP_BAN', code: 'VALIDATION_ERROR' },
            { status: 400 },
          );
        }
        const banDuration = metadata?.banDuration;
        if (!banDuration) {
          return NextResponse.json(
            {
              error: 'metadata.banDuration is required for TEMP_BAN',
              code: 'VALIDATION_ERROR',
            },
            { status: 400 },
          );
        }
        const targetUser = await prisma.user.findUnique({
          where: { id: targetUserId },
          select: { id: true, role: true },
        });
        if (!targetUser) {
          return NextResponse.json(
            { error: 'Target user not found', code: 'NOT_FOUND' },
            { status: 404 },
          );
        }
        // Cannot ban admins
        if (targetUser.role === 'ADMIN') {
          return NextResponse.json(
            { error: 'Cannot ban an admin', code: 'FORBIDDEN' },
            { status: 403 },
          );
        }
        await applyTempBan(targetUserId, reason, banDuration, session.user.id);
        break;
      }

      case 'PERM_BAN': {
        // Admin only
        if (!isAdmin(moderator.role)) {
          return NextResponse.json(
            { error: 'Admin access required for permanent bans', code: 'FORBIDDEN' },
            { status: 403 },
          );
        }
        if (!targetUserId) {
          return NextResponse.json(
            { error: 'targetUserId is required for PERM_BAN', code: 'VALIDATION_ERROR' },
            { status: 400 },
          );
        }
        const targetUser = await prisma.user.findUnique({
          where: { id: targetUserId },
          select: { id: true, role: true },
        });
        if (!targetUser) {
          return NextResponse.json(
            { error: 'Target user not found', code: 'NOT_FOUND' },
            { status: 404 },
          );
        }
        // Cannot ban admins
        if (targetUser.role === 'ADMIN') {
          return NextResponse.json(
            { error: 'Cannot ban an admin', code: 'FORBIDDEN' },
            { status: 403 },
          );
        }
        await applyPermBan(targetUserId, reason, session.user.id);
        break;
      }

      case 'UNBAN': {
        if (!targetUserId) {
          return NextResponse.json(
            { error: 'targetUserId is required for UNBAN', code: 'VALIDATION_ERROR' },
            { status: 400 },
          );
        }
        const targetUser = await prisma.user.findUnique({
          where: { id: targetUserId },
          select: { id: true, bannedAt: true },
        });
        if (!targetUser) {
          return NextResponse.json(
            { error: 'Target user not found', code: 'NOT_FOUND' },
            { status: 404 },
          );
        }
        if (!targetUser.bannedAt) {
          return NextResponse.json(
            { error: 'User is not banned', code: 'NOT_BANNED' },
            { status: 400 },
          );
        }
        await unbanUser(targetUserId, reason, session.user.id);
        break;
      }

      case 'LOCK_THREAD': {
        if (!targetThreadId) {
          return NextResponse.json(
            { error: 'targetThreadId is required for LOCK_THREAD', code: 'VALIDATION_ERROR' },
            { status: 400 },
          );
        }
        const thread = await prisma.thread.findFirst({
          where: { id: targetThreadId, deletedAt: null },
          select: { id: true },
        });
        if (!thread) {
          return NextResponse.json(
            { error: 'Thread not found', code: 'NOT_FOUND' },
            { status: 404 },
          );
        }
        await toggleThreadLock(targetThreadId, true, session.user.id);
        break;
      }

      case 'UNLOCK_THREAD': {
        if (!targetThreadId) {
          return NextResponse.json(
            { error: 'targetThreadId is required for UNLOCK_THREAD', code: 'VALIDATION_ERROR' },
            { status: 400 },
          );
        }
        const thread = await prisma.thread.findFirst({
          where: { id: targetThreadId, deletedAt: null },
          select: { id: true },
        });
        if (!thread) {
          return NextResponse.json(
            { error: 'Thread not found', code: 'NOT_FOUND' },
            { status: 404 },
          );
        }
        await toggleThreadLock(targetThreadId, false, session.user.id);
        break;
      }

      case 'PIN_THREAD': {
        if (!targetThreadId) {
          return NextResponse.json(
            { error: 'targetThreadId is required for PIN_THREAD', code: 'VALIDATION_ERROR' },
            { status: 400 },
          );
        }
        const thread = await prisma.thread.findFirst({
          where: { id: targetThreadId, deletedAt: null },
          select: { id: true },
        });
        if (!thread) {
          return NextResponse.json(
            { error: 'Thread not found', code: 'NOT_FOUND' },
            { status: 404 },
          );
        }
        await toggleThreadPin(targetThreadId, true, session.user.id);
        break;
      }

      case 'UNPIN_THREAD': {
        if (!targetThreadId) {
          return NextResponse.json(
            { error: 'targetThreadId is required for UNPIN_THREAD', code: 'VALIDATION_ERROR' },
            { status: 400 },
          );
        }
        const thread = await prisma.thread.findFirst({
          where: { id: targetThreadId, deletedAt: null },
          select: { id: true },
        });
        if (!thread) {
          return NextResponse.json(
            { error: 'Thread not found', code: 'NOT_FOUND' },
            { status: 404 },
          );
        }
        await toggleThreadPin(targetThreadId, false, session.user.id);
        break;
      }

      case 'ROLE_CHANGE': {
        // Admin only
        if (!isAdmin(moderator.role)) {
          return NextResponse.json(
            { error: 'Admin access required for role changes', code: 'FORBIDDEN' },
            { status: 403 },
          );
        }
        if (!targetUserId) {
          return NextResponse.json(
            { error: 'targetUserId is required for ROLE_CHANGE', code: 'VALIDATION_ERROR' },
            { status: 400 },
          );
        }
        const newRole = metadata?.newRole;
        if (!newRole) {
          return NextResponse.json(
            {
              error: 'metadata.newRole is required for ROLE_CHANGE',
              code: 'VALIDATION_ERROR',
            },
            { status: 400 },
          );
        }
        // Admin cannot demote themselves
        if (targetUserId === session.user.id) {
          return NextResponse.json(
            { error: 'You cannot change your own role', code: 'FORBIDDEN' },
            { status: 403 },
          );
        }
        const targetUser = await prisma.user.findUnique({
          where: { id: targetUserId },
          select: { id: true, role: true },
        });
        if (!targetUser) {
          return NextResponse.json(
            { error: 'Target user not found', code: 'NOT_FOUND' },
            { status: 404 },
          );
        }

        await prisma.$transaction([
          prisma.user.update({
            where: { id: targetUserId },
            data: { role: newRole },
          }),
          prisma.moderationAction.create({
            data: {
              action: 'ROLE_CHANGE',
              reason,
              metadata: { previousRole: targetUser.role, newRole },
              moderatorId: session.user.id,
              targetUserId,
            },
          }),
          prisma.auditLog.create({
            data: {
              action: 'moderation.role_change',
              entityType: 'user',
              entityId: targetUserId,
              userId: session.user.id,
              changes: {
                previousRole: targetUser.role,
                newRole,
                reason,
              },
            },
          }),
        ]);
        break;
      }
    }

    const latencyMs = Math.round(performance.now() - start);
    userCtx.logger.info('Moderation action executed', {
      action: 'moderation.execute',
      latencyMs,
      metadata: { moderationAction: action },
    });

    return NextResponse.json({
      data: { success: true, action, reason },
    });
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    ctx.logger.error('Failed to execute moderation action', {
      action: 'moderation.execute',
      latencyMs,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json(
      { error: 'Failed to execute moderation action', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
