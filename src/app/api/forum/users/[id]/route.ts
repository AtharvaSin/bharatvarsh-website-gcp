export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { auth } from '@/server/auth';
import { isAdmin } from '@/server/moderation';
import { createApiContext, applyRateLimit } from '@/server/api-helpers';
import { checkRateLimit, rateLimitHeaders } from '@/server/rate-limit';

/**
 * Zod schema for self-profile updates (name, bio, image).
 */
const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  bio: z.string().max(500).optional(),
  image: z.string().url('Invalid image URL').optional(),
});

/**
 * Zod schema for admin role updates.
 */
const roleUpdateSchema = z.object({
  role: z.enum(['VISITOR', 'MEMBER', 'MODERATOR', 'ADMIN']),
});

/**
 * Combined schema: accepts either profile fields or a role field.
 */
const userPatchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  image: z.string().url().optional(),
  role: z.enum(['VISITOR', 'MEMBER', 'MODERATOR', 'ADMIN']).optional(),
});

/**
 * GET /api/forum/users/[id]
 *
 * Public user profile. Returns basic user info, thread count,
 * and post count. Does not expose email or ban details.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const ctx = createApiContext(request);
  const start = performance.now();

  try {
    const { id } = await params;

    const rlResponse = applyRateLimit(ctx.clientIp, 'read');
    if (rlResponse) return rlResponse;

    ctx.logger.info('Fetching user profile', { action: 'user.profile', metadata: { userId: id } });

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            threads: {
              where: { deletedAt: null, status: 'PUBLISHED' },
            },
            posts: {
              where: { deletedAt: null, status: 'PUBLISHED' },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    const latencyMs = Math.round(performance.now() - start);
    ctx.logger.info('User profile fetched', {
      action: 'user.profile',
      latencyMs,
      metadata: { userId: id },
    });

    const response = NextResponse.json({
      data: {
        id: user.id,
        name: user.name,
        image: user.image,
        bio: user.bio,
        role: user.role,
        threadCount: user._count.threads,
        postCount: user._count.posts,
        joinedAt: user.createdAt.toISOString(),
      },
    });

    const rl = checkRateLimit(ctx.clientIp, 'read');
    for (const [k, v] of Object.entries(rateLimitHeaders(rl))) {
      response.headers.set(k, v);
    }
    return response;
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    ctx.logger.error('Failed to fetch user profile', {
      action: 'user.profile',
      latencyMs,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json(
      { error: 'Failed to fetch user profile', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/forum/users/[id]
 *
 * Update a user profile. Two modes:
 *   1. Self-update: authenticated user can update their own name, bio, image.
 *   2. Admin update: admin can change any user's role.
 *
 * Admin cannot demote themselves.
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
    const rlResponse = applyRateLimit(session.user.id, 'create');
    if (rlResponse) return rlResponse;

    userCtx.logger.info('Updating user', { action: 'user.update', metadata: { targetUserId: id } });

    const body = await request.json();
    const parsed = userPatchSchema.safeParse(body);
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

    const { name, bio, image, role } = parsed.data;

    // Fetch the requesting user's role
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    // Verify the target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, bio: true, image: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    // Handle role changes (admin only)
    if (role !== undefined) {
      if (!isAdmin(currentUser.role)) {
        return NextResponse.json(
          { error: 'Admin access required to change roles', code: 'FORBIDDEN' },
          { status: 403 },
        );
      }

      // Admin cannot demote themselves
      if (id === session.user.id) {
        return NextResponse.json(
          { error: 'You cannot change your own role', code: 'FORBIDDEN' },
          { status: 403 },
        );
      }

      // Validate role value explicitly
      const roleResult = roleUpdateSchema.safeParse({ role });
      if (!roleResult.success) {
        return NextResponse.json(
          {
            error: 'Invalid role value',
            code: 'VALIDATION_ERROR',
            details: roleResult.error.issues,
          },
          { status: 400 },
        );
      }

      await prisma.$transaction([
        prisma.user.update({
          where: { id },
          data: { role },
        }),
        prisma.moderationAction.create({
          data: {
            action: 'ROLE_CHANGE',
            reason: `Role changed from ${targetUser.role} to ${role}`,
            metadata: { previousRole: targetUser.role, newRole: role },
            moderatorId: session.user.id,
            targetUserId: id,
          },
        }),
        prisma.auditLog.create({
          data: {
            action: 'user.role_change',
            entityType: 'user',
            entityId: id,
            userId: session.user.id,
            changes: {
              previousRole: targetUser.role,
              newRole: role,
            },
          },
        }),
      ]);

      const updated = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
          role: true,
          createdAt: true,
        },
      });

      const latencyMs = Math.round(performance.now() - start);
      userCtx.logger.info('User role updated', {
        action: 'user.update',
        latencyMs,
        metadata: { targetUserId: id, newRole: role },
      });

      return NextResponse.json({
        data: {
          id: updated!.id,
          name: updated!.name,
          image: updated!.image,
          bio: updated!.bio,
          role: updated!.role,
          joinedAt: updated!.createdAt.toISOString(),
        },
      });
    }

    // Handle profile updates (self only)
    if (id !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only update your own profile', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    // Validate profile fields
    const profileResult = profileUpdateSchema.safeParse({ name, bio, image });
    if (!profileResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: profileResult.error.issues,
        },
        { status: 400 },
      );
    }

    // Build the update data, only including provided fields
    const updateData: Record<string, string> = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (image !== undefined) updateData.image = image;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        role: true,
        createdAt: true,
      },
    });

    // Build the changes object for the audit log
    const changes: Record<string, { before: string | null; after: string }> = {};
    if (name !== undefined) {
      changes.name = { before: targetUser.name, after: name };
    }
    if (bio !== undefined) {
      changes.bio = { before: targetUser.bio, after: bio };
    }
    if (image !== undefined) {
      changes.image = { before: targetUser.image, after: image };
    }

    await prisma.auditLog.create({
      data: {
        action: 'user.profile_update',
        entityType: 'user',
        entityId: id,
        userId: session.user.id,
        changes,
      },
    });

    const latencyMs = Math.round(performance.now() - start);
    userCtx.logger.info('User profile updated', {
      action: 'user.update',
      latencyMs,
      metadata: { targetUserId: id },
    });

    return NextResponse.json({
      data: {
        id: updated.id,
        name: updated.name,
        image: updated.image,
        bio: updated.bio,
        role: updated.role,
        joinedAt: updated.createdAt.toISOString(),
      },
    });
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    ctx.logger.error('Failed to update user', {
      action: 'user.update',
      latencyMs,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json(
      { error: 'Failed to update user', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
