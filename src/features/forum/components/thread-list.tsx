'use client';

import { FC } from 'react';
import { cn } from '@/shared/utils';
import { Skeleton } from '@/shared/ui/skeleton';
import { Pagination } from '@/shared/ui/pagination';
import { MessageSquare } from 'lucide-react';
import { ThreadCard } from './thread-card';
import type { ThreadListItem, PaginationMeta, SortOption } from '../types';
import { SORT_OPTIONS } from '../constants';

interface ThreadListProps {
  threads: ThreadListItem[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  onPageChange: (page: number) => void;
  className?: string;
}

/** Renders a sortable, paginated list of thread cards with loading skeletons. */
export const ThreadList: FC<ThreadListProps> = ({
  threads,
  pagination,
  isLoading,
  sort,
  onSortChange,
  onPageChange,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-lg border border-[var(--obsidian-600)] bg-[var(--obsidian-800)]"
          >
            <div className="flex gap-4">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Sort Controls */}
      <div className="flex items-center gap-2">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onSortChange(option.value as SortOption)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              sort === option.value
                ? 'bg-[var(--obsidian-700)] text-[var(--text-primary)] font-medium'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Thread List */}
      {threads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MessageSquare className="w-12 h-12 text-[var(--text-muted)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            No threads yet
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Be the first to start a discussion!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} />
          ))}
        </div>
      )}

      {/* Pagination */}
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
