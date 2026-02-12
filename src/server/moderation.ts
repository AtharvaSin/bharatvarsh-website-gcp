/**
 * Moderation business logic module for the Bharatvarsh Forum.
 *
 * Provides RBAC helpers, ban management, content moderation,
 * and thread management functions. All mutations are wrapped
 * in transactions with audit log entries.
 *
 * Server-only module -- do not import from client components.
 */

import 'server-only';

import { prisma } from '@/server/db';

// ─── RBAC HELPERS ───────────────────────────────────────────

/** Numeric weight for each role in the hierarchy. */
const ROLE_HIERARCHY: Record<string, number> = {
  VISITOR: 0,
  MEMBER: 1,
  MODERATOR: 2,
  ADMIN: 3,
};

/**
 * Check whether a user's role meets or exceeds the required role level.
 * Unknown roles default to weight 0 (VISITOR equivalent).
 */
export function hasMinRole(
  userRole: string,
  requiredRole: string,
): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
}

/** Returns true if the role is MODERATOR or higher. */
export function isModerator(role: string): boolean {
  return hasMinRole(role, 'MODERATOR');
}

/** Returns true if the role is ADMIN. */
export function isAdmin(role: string): boolean {
  return hasMinRole(role, 'ADMIN');
}

// ─── BAN HELPERS ────────────────────────────────────────────

/**
 * Determine whether a user is currently banned.
 * A user is banned if `bannedAt` is set AND either:
 *   - `bannedUntil` is null (permanent ban), or
 *   - `bannedUntil` is in the future.
 */
export function isUserBanned(user: {
  bannedAt: Date | null;
  bannedUntil: Date | null;
}): boolean {
  if (!user.bannedAt) return false;
  if (!user.bannedUntil) return true; // permanent
  return user.bannedUntil > new Date();
}

/**
 * Apply a temporary ban to a user.
 * Creates a ModerationAction and AuditLog entry within a transaction.
 */
export async function applyTempBan(
  userId: string,
  reason: string,
  durationDays: number,
  moderatorId: string,
): Promise<void> {
  const bannedUntil = new Date();
  bannedUntil.setDate(bannedUntil.getDate() + durationDays);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { bannedAt: new Date(), bannedUntil, bannedReason: reason },
    }),
    prisma.moderationAction.create({
      data: {
        action: 'TEMP_BAN',
        reason,
        metadata: { durationDays },
        moderatorId,
        targetUserId: userId,
      },
    }),
    prisma.auditLog.create({
      data: {
        action: 'moderation.temp_ban',
        entityType: 'user',
        entityId: userId,
        userId: moderatorId,
        changes: { reason, durationDays },
      },
    }),
  ]);
}

/**
 * Apply a permanent ban to a user (admin only).
 * Sets `bannedUntil` to null to indicate permanence.
 */
export async function applyPermBan(
  userId: string,
  reason: string,
  moderatorId: string,
): Promise<void> {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { bannedAt: new Date(), bannedUntil: null, bannedReason: reason },
    }),
    prisma.moderationAction.create({
      data: {
        action: 'PERM_BAN',
        reason,
        moderatorId,
        targetUserId: userId,
      },
    }),
    prisma.auditLog.create({
      data: {
        action: 'moderation.perm_ban',
        entityType: 'user',
        entityId: userId,
        userId: moderatorId,
        changes: { reason, permanent: true },
      },
    }),
  ]);
}

/**
 * Remove a ban from a user, clearing all ban-related fields.
 */
export async function unbanUser(
  userId: string,
  reason: string,
  moderatorId: string,
): Promise<void> {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { bannedAt: null, bannedUntil: null, bannedReason: null },
    }),
    prisma.moderationAction.create({
      data: {
        action: 'UNBAN',
        reason,
        moderatorId,
        targetUserId: userId,
      },
    }),
    prisma.auditLog.create({
      data: {
        action: 'moderation.unban',
        entityType: 'user',
        entityId: userId,
        userId: moderatorId,
        changes: { reason },
      },
    }),
  ]);
}

// ─── CONTENT MODERATION ─────────────────────────────────────

/**
 * Remove content by setting its status to REMOVED.
 * Works for both threads and posts.
 */
export async function removeContent(
  entityType: 'thread' | 'post',
  entityId: string,
  reason: string,
  moderatorId: string,
): Promise<void> {
  const model = entityType === 'thread' ? prisma.thread : prisma.post;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (model as any).update({
    where: { id: entityId },
    data: { status: 'REMOVED' },
  });

  await prisma.$transaction([
    prisma.moderationAction.create({
      data: {
        action: 'REMOVE_CONTENT',
        reason,
        moderatorId,
        ...(entityType === 'thread'
          ? { targetThreadId: entityId }
          : { targetPostId: entityId }),
      },
    }),
    prisma.auditLog.create({
      data: {
        action: `moderation.remove_${entityType}`,
        entityType,
        entityId,
        userId: moderatorId,
        changes: { reason },
      },
    }),
  ]);
}

/**
 * Approve quarantined content, setting status to PUBLISHED
 * and aiCheckResult to PASS.
 */
export async function approveContent(
  entityType: 'thread' | 'post',
  entityId: string,
  moderatorId: string,
): Promise<void> {
  const model = entityType === 'thread' ? prisma.thread : prisma.post;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (model as any).update({
    where: { id: entityId },
    data: { status: 'PUBLISHED', aiCheckResult: 'PASS' },
  });

  await prisma.$transaction([
    prisma.moderationAction.create({
      data: {
        action: 'APPROVE_CONTENT',
        reason: 'Manually approved by moderator',
        moderatorId,
        ...(entityType === 'thread'
          ? { targetThreadId: entityId }
          : { targetPostId: entityId }),
      },
    }),
    prisma.auditLog.create({
      data: {
        action: `moderation.approve_${entityType}`,
        entityType,
        entityId,
        userId: moderatorId,
        changes: { previousStatus: 'QUARANTINED', newStatus: 'PUBLISHED' },
      },
    }),
  ]);
}

/**
 * Issue a warning to a user. Creates a ModerationAction and audit entry
 * without affecting the user's ban status.
 */
export async function warnUser(
  userId: string,
  reason: string,
  moderatorId: string,
): Promise<void> {
  await prisma.$transaction([
    prisma.moderationAction.create({
      data: {
        action: 'WARN_USER',
        reason,
        moderatorId,
        targetUserId: userId,
      },
    }),
    prisma.auditLog.create({
      data: {
        action: 'moderation.warn',
        entityType: 'user',
        entityId: userId,
        userId: moderatorId,
        changes: { reason },
      },
    }),
  ]);
}

// ─── THREAD MANAGEMENT ──────────────────────────────────────

/**
 * Lock or unlock a thread. Locked threads cannot receive new posts.
 */
export async function toggleThreadLock(
  threadId: string,
  lock: boolean,
  moderatorId: string,
): Promise<void> {
  await prisma.$transaction([
    prisma.thread.update({
      where: { id: threadId },
      data: { isLocked: lock },
    }),
    prisma.moderationAction.create({
      data: {
        action: lock ? 'LOCK_THREAD' : 'UNLOCK_THREAD',
        reason: lock
          ? 'Thread locked by moderator'
          : 'Thread unlocked by moderator',
        moderatorId,
        targetThreadId: threadId,
      },
    }),
    prisma.auditLog.create({
      data: {
        action: `moderation.${lock ? 'lock' : 'unlock'}_thread`,
        entityType: 'thread',
        entityId: threadId,
        userId: moderatorId,
        changes: { isLocked: lock },
      },
    }),
  ]);
}

/**
 * Pin or unpin a thread. Pinned threads appear at the top of listings.
 */
export async function toggleThreadPin(
  threadId: string,
  pin: boolean,
  moderatorId: string,
): Promise<void> {
  await prisma.$transaction([
    prisma.thread.update({
      where: { id: threadId },
      data: { isPinned: pin },
    }),
    prisma.moderationAction.create({
      data: {
        action: pin ? 'PIN_THREAD' : 'UNPIN_THREAD',
        reason: pin
          ? 'Thread pinned by moderator'
          : 'Thread unpinned by moderator',
        moderatorId,
        targetThreadId: threadId,
      },
    }),
    prisma.auditLog.create({
      data: {
        action: `moderation.${pin ? 'pin' : 'unpin'}_thread`,
        entityType: 'thread',
        entityId: threadId,
        userId: moderatorId,
        changes: { isPinned: pin },
      },
    }),
  ]);
}
