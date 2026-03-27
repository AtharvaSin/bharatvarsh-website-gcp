'use client';

import { FC } from 'react';
import ReactMarkdown from 'react-markdown';
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
      <div className="max-w-none p-4 md:p-6 rounded-lg bg-[var(--obsidian-800)] border border-[var(--obsidian-600)]">
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className="text-2xl font-bold text-[var(--text-primary)] mt-6 mb-3">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold text-[var(--text-primary)] mt-6 mb-3">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-semibold text-[var(--mustard-500)] mt-5 mb-2">{children}</h3>,
            h4: ({ children }) => <h4 className="text-base font-semibold text-[var(--text-primary)] mt-4 mb-2">{children}</h4>,
            p: ({ children }) => <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">{children}</p>,
            strong: ({ children }) => <strong className="font-semibold text-[var(--text-primary)]">{children}</strong>,
            em: ({ children }) => <em className="italic text-[var(--powder-400)]">{children}</em>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-3 border-[var(--mustard-500)] pl-4 my-4 py-1 bg-[var(--obsidian-900)]/50 rounded-r">
                {children}
              </blockquote>
            ),
            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3 text-sm text-[var(--text-secondary)]">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3 text-sm text-[var(--text-secondary)]">{children}</ol>,
            li: ({ children }) => <li className="text-sm text-[var(--text-secondary)] leading-relaxed">{children}</li>,
            hr: () => <hr className="border-[var(--obsidian-600)] my-5" />,
            code: ({ children }) => (
              <code className="bg-[var(--obsidian-900)] text-[var(--mustard-400)] px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
            ),
            a: ({ href, children }) => (
              <a href={href} className="text-[var(--powder-500)] underline hover:text-[var(--powder-400)]" target="_blank" rel="noopener noreferrer">{children}</a>
            ),
          }}
        >
          {thread.body}
        </ReactMarkdown>
      </div>

      {/* Reactions */}
      <ReactionBar counts={counts} onReact={toggleReaction} />
    </article>
  );
};
