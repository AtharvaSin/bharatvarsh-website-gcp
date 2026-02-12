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

/** Renders a paginated list of post cards with loading skeletons and empty state. */
export const PostList: FC<PostListProps> = ({
  posts,
  pagination,
  isLoading,
  onPageChange,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-lg border border-[var(--obsidian-600)] bg-[var(--obsidian-800)]/50"
          >
            <div className="flex gap-3">
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
          'text-center py-8 text-[var(--text-muted)]',
          className
        )}
      >
        No replies yet. Be the first to respond!
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
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
