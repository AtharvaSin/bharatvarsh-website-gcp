'use client';

import { FC } from 'react';
import Link from 'next/link';
import { MessageSquare, Eye, Pin } from 'lucide-react';
import { cn } from '@/shared/utils';
import { UserAvatar } from './user-avatar';
import { TopicBadge } from './topic-badge';
import type { ThreadListItem } from '../types';

interface ThreadCardProps {
  thread: ThreadListItem;
  className?: string;
}

/**
 * Converts a date string into a human-readable relative time label
 * such as "just now", "5m ago", "3h ago", "2d ago", or "1mo ago".
 */
function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

/** A clickable card representing a single forum thread in a list view. */
export const ThreadCard: FC<ThreadCardProps> = ({ thread, className }) => {
  const totalReactions =
    thread.reactionCounts.UPVOTE +
    thread.reactionCounts.INSIGHTFUL +
    thread.reactionCounts.FLAME -
    thread.reactionCounts.DOWNVOTE;

  return (
    <Link
      href={`/forum/thread/${thread.id}`}
      className={cn(
        'block p-4 md:p-5 rounded-lg border border-[var(--obsidian-600)] bg-[var(--obsidian-800)]',
        'hover:border-[var(--powder-500)]/50 hover:bg-[var(--obsidian-800)]/80 transition-all duration-200',
        thread.isPinned && 'border-l-2 border-l-[var(--mustard-500)]',
        className
      )}
    >
      <div className="flex gap-3 md:gap-4">
        <UserAvatar
          name={thread.author.name}
          image={thread.author.image}
          role={thread.author.role}
          size="sm"
          className="mt-0.5 shrink-0 hidden sm:block"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            {thread.isPinned && (
              <Pin className="w-4 h-4 text-[var(--mustard-500)] shrink-0 mt-0.5" />
            )}
            <h3 className="text-base font-semibold text-[var(--text-primary)] line-clamp-2 leading-snug">
              {thread.title}
            </h3>
          </div>

          {thread.excerpt && (
            <p className="mt-1 text-sm text-[var(--text-muted)] line-clamp-2">
              {thread.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            {thread.tags.map((tag) => (
              <TopicBadge key={tag.slug} name={tag.name} color={tag.color} />
            ))}
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <span className="sm:hidden">
                <UserAvatar
                  name={thread.author.name}
                  image={thread.author.image}
                  role={thread.author.role}
                  size="sm"
                />
              </span>
              <span className="hidden sm:inline">
                {thread.author.name || 'Anonymous'}
              </span>
            </span>
            <span>{timeAgo(thread.createdAt)}</span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              {thread.postCount}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {thread.viewCount}
            </span>
            {totalReactions > 0 && (
              <span className="text-[var(--mustard-500)]">
                +{totalReactions}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
