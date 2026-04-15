'use client';

import { FC } from 'react';
import { MoreHorizontal, Flag } from 'lucide-react';
import { cn } from '@/shared/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/ui/dropdown-menu';
import { UserAvatar } from './user-avatar';
import { UserBadge } from './user-badge';
import { ReportDialog } from './report-dialog';
import { QuarantineNotice } from './quarantine-notice';
import { ContentStatusBadge } from './content-status-badge';
import { DossierMarkdown } from './markdown-renderer';
import type { PostView } from '../types';

interface PostCardProps {
  post: PostView;
  className?: string;
}

/**
 * Converts a date string into a human-readable relative time label
 * such as "just now", "5m ago", "3h ago", "2d ago", or a locale date.
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
  return new Date(dateStr).toLocaleDateString();
}

/**
 * Classified Chronicle reply card. Renders inside PostList as a
 * counter-signal transmission. When post.parentId is set, gets a
 * mustard-dossier left stripe + "COUNTER-SIGNAL TO PRIOR TRANSMISSION"
 * header to signal it's a nested reply.
 */
export const PostCard: FC<PostCardProps> = ({ post, className }) => {
  const isReply = Boolean(post.parentId);

  return (
    <div
      className={cn(
        'p-5 border-l-4',
        isReply && 'ml-8',
        className,
      )}
      style={{
        backgroundColor: 'var(--obsidian-panel)',
        borderLeftColor: isReply
          ? 'var(--mustard-dossier)'
          : 'var(--navy-signal)',
        borderTop: '1px solid var(--navy-signal)',
        borderRight: '1px solid var(--navy-signal)',
        borderBottom: '1px solid var(--navy-signal)',
      }}
    >
      {isReply && (
        <div
          className="font-mono text-[9px] uppercase tracking-[0.22em] mb-3"
          style={{ color: 'var(--mustard-dossier)' }}
        >
          ▸ COUNTER-SIGNAL TO PRIOR TRANSMISSION
        </div>
      )}

      <div className="flex gap-4">
        <UserAvatar
          name={post.author.name}
          image={post.author.image}
          role={post.author.role}
          size="sm"
          className="shrink-0 mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3 gap-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span
                className="font-mono text-[11px] uppercase tracking-[0.18em]"
                style={{ color: 'var(--bone-text)' }}
              >
                {post.author.name || 'ANONYMOUS'}
              </span>
              <UserBadge role={post.author.role} />
              <ContentStatusBadge status={post.status} />
              <span
                className="font-mono text-[10px] uppercase tracking-[0.15em]"
                style={{ color: 'var(--shadow-text)' }}
              >
                {timeAgo(post.createdAt)}
              </span>
              {post.updatedAt !== post.createdAt && (
                <span
                  className="font-mono text-[9px] uppercase tracking-[0.15em]"
                  style={{ color: 'var(--shadow-text)' }}
                >
                  [EDITED]
                </span>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-1 border transition-colors"
                  style={{
                    borderColor: 'var(--navy-signal)',
                    color: 'var(--shadow-text)',
                  }}
                  aria-label="Post actions"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <ReportDialog
                  contentType="post"
                  contentId={post.id}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Flag className="w-4 h-4 mr-2" />
                      Report Reply
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <QuarantineNotice status={post.status} className="mb-3" />
          <DossierMarkdown body={post.body} density="reply" />
        </div>
      </div>
    </div>
  );
};
