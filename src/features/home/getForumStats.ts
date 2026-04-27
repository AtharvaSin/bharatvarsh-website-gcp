import 'server-only';
import { prisma } from '@/server/db';

export interface ForumStats {
  threadCount: number;
  memberCount: number;
  lastPostRelative: string | null;
}

/**
 * Format a date as a relative time string (e.g., "2 hours ago").
 * Returns a locale date string for dates more than 7 days ago.
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'just now';
  }
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
  return date.toLocaleDateString('en-IN');
}

export async function getForumStats(): Promise<ForumStats | null> {
  try {
    const [threadCount, distinctAuthors, lastPost] = await Promise.all([
      prisma.thread.count(),
      prisma.post.findMany({
        select: { authorId: true },
        distinct: ['authorId'],
      }),
      prisma.post.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    return {
      threadCount,
      memberCount: distinctAuthors.length,
      lastPostRelative: lastPost ? formatRelativeTime(lastPost.createdAt) : null,
    };
  } catch (err) {
    console.error('[getForumStats] failed:', err instanceof Error ? err.message : String(err));
    return null;
  }
}
