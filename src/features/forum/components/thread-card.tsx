'use client';

import { FC } from 'react';
import Link from 'next/link';
import { MessageSquare, Eye, Pin, Lock } from 'lucide-react';
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
    (Date.now() - new Date(dateStr).getTime()) / 1000,
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

/**
 * Classified Chronicle thread list card. Consumed by thread-list (which
 * backs /forum/topic/[slug]) and ProfileContent (/forum/me). Layout:
 * - Left meta rail: net reaction score
 * - Center: pinned/locked chips + title + excerpt + mono metadata row
 * - Right: join transmission CTA (on hover, pin icon if pinned)
 * Pinned threads get a mustard-dossier left stripe.
 */
export const ThreadCard: FC<ThreadCardProps> = ({ thread, className }) => {
  const netScore =
    thread.reactionCounts.UPVOTE +
    thread.reactionCounts.INSIGHTFUL +
    thread.reactionCounts.FLAME -
    thread.reactionCounts.DOWNVOTE;

  return (
    <Link
      href={`/forum/thread/${thread.id}`}
      className={cn(
        'group block p-5 border-l-4 transition-colors',
        className,
      )}
      style={{
        backgroundColor: 'var(--obsidian-panel)',
        borderLeftColor: thread.isPinned
          ? 'var(--mustard-dossier)'
          : 'var(--navy-signal)',
        borderTop: '1px solid var(--navy-signal)',
        borderRight: '1px solid var(--navy-signal)',
        borderBottom: '1px solid var(--navy-signal)',
      }}
    >
      <div className="flex gap-4">
        {/* ── Left meta rail: net score ──────────────────────────────── */}
        <div className="shrink-0 w-12 flex flex-col items-center justify-start gap-1 pt-1">
          <span
            className="font-display leading-none"
            style={{
              fontSize: '1.75rem',
              color:
                netScore < 0
                  ? 'var(--redaction)'
                  : netScore > 0
                    ? 'var(--mustard-dossier)'
                    : 'var(--shadow-text)',
            }}
          >
            {netScore > 0 ? `+${netScore}` : netScore}
          </span>
          <span
            className="font-mono text-[9px] uppercase tracking-[0.18em]"
            style={{ color: 'var(--shadow-text)' }}
          >
            ▲ SIGNAL
          </span>
        </div>

        {/* ── Center: content ────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Chips row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <UserAvatar
              name={thread.author.name}
              image={thread.author.image}
              role={thread.author.role}
              size="sm"
            />
            {thread.isPinned && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] border"
                style={{
                  color: 'var(--mustard-dossier)',
                  borderColor: 'var(--mustard-dossier)',
                }}
              >
                <Pin className="w-2.5 h-2.5" /> PINNED
              </span>
            )}
            {thread.isLocked && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] border"
                style={{
                  color: 'var(--redaction)',
                  borderColor: 'var(--redaction)',
                }}
              >
                <Lock className="w-2.5 h-2.5" /> LOCKED
              </span>
            )}
            {thread.tags.map((tag) => (
              <TopicBadge
                key={tag.slug}
                name={tag.name}
                color={tag.color}
                maxChars={20}
              />
            ))}
          </div>

          {/* Title */}
          <h3
            className="font-display uppercase leading-tight mb-1 line-clamp-2"
            style={{
              fontSize: 'clamp(1.125rem, 1.6vw, 1.375rem)',
              color: 'var(--bone-text)',
            }}
          >
            {thread.title}
          </h3>

          {/* Excerpt */}
          {thread.excerpt && (
            <p
              className="font-sans text-sm leading-relaxed line-clamp-1 mb-3"
              style={{ color: 'var(--shadow-text)' }}
            >
              {thread.excerpt}
            </p>
          )}

          {/* Metadata row */}
          <div
            className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.15em]"
            style={{ color: 'var(--shadow-text)' }}
          >
            <span>{thread.author.name || 'ANONYMOUS'}</span>
            <span>{timeAgo(thread.createdAt)}</span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {thread.postCount} REPLIES
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {thread.viewCount} VIEWS
            </span>
          </div>
        </div>

        {/* ── Right: CTA ─────────────────────────────────────────────── */}
        <div className="shrink-0 hidden md:flex flex-col items-end justify-start">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.22em] opacity-60 group-hover:opacity-100 transition-opacity"
            style={{ color: 'var(--mustard-dossier)' }}
          >
            JOIN →
          </span>
        </div>
      </div>
    </Link>
  );
};
