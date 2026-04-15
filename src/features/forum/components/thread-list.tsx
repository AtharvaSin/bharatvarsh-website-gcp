'use client';

import { FC } from 'react';
import { cn } from '@/shared/utils';
import { Skeleton } from '@/shared/ui/skeleton';
import { Pagination } from '@/shared/ui/pagination';
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

/**
 * Classified Chronicle paginated thread list. Sort controls render as a
 * mono-button group matching the landing's sidebar pattern. Empty state
 * uses dossier voice. Consumed by TopicContent.
 */
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
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
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
              <Skeleton className="w-12 h-12 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* ── Sort Controls ────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-0 border"
        style={{ borderColor: 'var(--navy-signal)' }}
      >
        <span
          className="px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] border-r"
          style={{
            color: 'var(--shadow-text)',
            borderColor: 'var(--navy-signal)',
          }}
        >
          SORT BY
        </span>
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onSortChange(option.value as SortOption)}
            className={cn(
              'px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] border-r transition-colors',
            )}
            style={{
              borderColor: 'var(--navy-signal)',
              backgroundColor:
                sort === option.value
                  ? 'var(--mustard-dossier)'
                  : 'transparent',
              color:
                sort === option.value
                  ? 'var(--obsidian-void)'
                  : 'var(--shadow-text)',
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* ── Thread List or empty state ───────────────────────────────── */}
      {threads.length === 0 ? (
        <div
          className="py-16 text-center border border-dashed"
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
              fontSize: 'clamp(1.5rem, 2.8vw, 2.25rem)',
              color: 'var(--bone-text)',
            }}
          >
            NO TRANSMISSIONS IN THIS CHANNEL.
            <br />
            BE THE FIRST.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {threads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} />
          ))}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────────────── */}
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
