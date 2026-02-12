'use client';

import { FC } from 'react';
import { Pin, Lock, Clock, Eye, MoreHorizontal, Flag } from 'lucide-react';
import { cn } from '@/shared/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/ui/dropdown-menu';
import { UserAvatar } from './user-avatar';
import { UserBadge } from './user-badge';
import { TopicBadge } from './topic-badge';
import { ReactionBar } from './reaction-bar';
import { ReportDialog } from './report-dialog';
import { QuarantineNotice } from './quarantine-notice';
import { ContentStatusBadge } from './content-status-badge';
import { useReactions } from '../hooks/use-reactions';
import type { ThreadView } from '../types';

interface ThreadDetailProps {
  thread: ThreadView;
  className?: string;
}

/** Formats an ISO date string into a user-friendly long date with time. */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Full thread view including title, body, author info, tags, and reactions. */
export const ThreadDetail: FC<ThreadDetailProps> = ({ thread, className }) => {
  const { counts, toggleReaction } = useReactions(
    thread.id,
    thread.reactionCounts
  );

  return (
    <article className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {thread.isPinned && (
            <span className="inline-flex items-center gap-1 text-xs text-[var(--mustard-500)]">
              <Pin className="w-3.5 h-3.5" /> Pinned
            </span>
          )}
          {thread.isLocked && (
            <span className="inline-flex items-center gap-1 text-xs text-[var(--status-alert)]">
              <Lock className="w-3.5 h-3.5" /> Locked
            </span>
          )}
          {thread.tags.map((tag) => (
            <TopicBadge
              key={tag.slug}
              name={tag.name}
              color={tag.color}
              size="md"
            />
          ))}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] leading-tight">
          {thread.title}
        </h1>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserAvatar
              name={thread.author.name}
              image={thread.author.image}
              role={thread.author.role}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {thread.author.name || 'Anonymous'}
                </span>
                <UserBadge role={thread.author.role} />
                <ContentStatusBadge status={thread.status} />
              </div>
              <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(thread.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {thread.viewCount} views
                </span>
              </div>
            </div>
          </div>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--obsidian-700)] transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <ReportDialog
                contentType="thread"
                contentId={thread.id}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Flag className="w-4 h-4 mr-2" />
                    Report Thread
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quarantine / Removed Notice */}
      <QuarantineNotice status={thread.status} />

      {/* Body */}
      <div className="prose prose-invert prose-sm max-w-none p-4 md:p-6 rounded-lg bg-[var(--obsidian-800)] border border-[var(--obsidian-600)]">
        <div className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
          {thread.body}
        </div>
      </div>

      {/* Reactions */}
      <ReactionBar counts={counts} onReact={toggleReaction} />
    </article>
  );
};
