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
    (Date.now() - new Date(dateStr).getTime()) / 1000
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

/** Displays a single forum reply post with author info and nested indent for replies. */
export const PostCard: FC<PostCardProps> = ({ post, className }) => {
  return (
    <div
      className={cn(
        'p-4 rounded-lg border border-[var(--obsidian-600)] bg-[var(--obsidian-800)]/50',
        post.parentId && 'ml-8 border-l-2 border-l-[var(--obsidian-600)]',
        className
      )}
    >
      <div className="flex gap-3">
        <UserAvatar
          name={post.author.name}
          image={post.author.image}
          role={post.author.role}
          size="sm"
          className="shrink-0 mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {post.author.name || 'Anonymous'}
              </span>
              <UserBadge role={post.author.role} />
              <ContentStatusBadge status={post.status} />
              <span className="text-xs text-[var(--text-muted)]">
                {timeAgo(post.createdAt)}
              </span>
              {post.updatedAt !== post.createdAt && (
                <span className="text-xs text-[var(--text-muted)] italic">
                  (edited)
                </span>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--obsidian-700)] transition-colors">
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
          <QuarantineNotice status={post.status} className="mb-2" />
          <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
            {post.body}
          </div>
        </div>
      </div>
    </div>
  );
};
