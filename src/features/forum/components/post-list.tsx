'use client';

import { FC } from 'react';
import { cn } from '@/shared/utils';
import { Skeleton } from '@/shared/ui/skeleton';
import { Pagination } from '@/shared/ui/pagination';
import { PostCard } from './post-card';
import type { PostView, PaginationMeta } from '../types';

interface PostListProps {
  posts: PostView[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Classified Chronicle list of counter-signals (replies). Each card is
 * a PostCard with mustard-dossier / navy-signal framing. Empty state uses
 * dossier voice: "NO COUNTER-SIGNALS RECEIVED."
 */
export const PostList: FC<PostListProps> = ({
  posts,
  pagination,
  isLoading,
  onPageChange,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-5 border-l-4"
            style={{
              backgroundColor: 'var(--obsidian-panel)',
              borderLeftColor: 'var(--navy-signal)',
              borderTop: '1px solid var(--navy-signal)',
              borderRight: '1px solid var(--navy-signal)',
              borderBottom: '1px solid var(--navy-signal)',
            }}
          >
            <div className="flex gap-4">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div
        className={cn(
          'py-12 text-center border border-dashed',
          className,
        )}
        style={{ borderColor: 'var(--navy-signal)' }}
      >
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] mb-2"
          style={{ color: 'var(--mustard-dossier)' }}
        >
          EMPTY CHANNEL
        </p>
        <p
          className="font-display leading-[1.2]"
          style={{
            fontSize: 'clamp(1.25rem, 2.4vw, 1.75rem)',
            color: 'var(--bone-text)',
          }}
        >
          NO COUNTER-SIGNALS RECEIVED.
          <br />
          BE THE FIRST TRANSMISSION.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          className="pt-4"
        />
      )}
    </div>
  );
};
