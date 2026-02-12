'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ThreadListItem, PaginationMeta, SortOption } from '../types';

interface UseThreadsParams {
  topicSlug?: string;
  sort?: SortOption;
  page?: number;
}

interface UseThreadsReturn {
  threads: ThreadListItem[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  setPage: (page: number) => void;
  setSort: (sort: SortOption) => void;
  sort: SortOption;
}

/**
 * Fetches a paginated, sortable list of forum threads.
 * Optionally filters by topic slug.
 */
export function useThreads(params: UseThreadsParams = {}): UseThreadsReturn {
  const [threads, setThreads] = useState<ThreadListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(params.page || 1);
  const [sort, setSort] = useState<SortOption>(params.sort || 'latest');

  const fetchThreads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      if (params.topicSlug) searchParams.set('topicSlug', params.topicSlug);
      searchParams.set('page', String(page));
      searchParams.set('sort', sort);

      const res = await fetch(`/api/forum/threads?${searchParams}`);
      if (!res.ok) throw new Error('Failed to fetch threads');
      const json = await res.json();
      setThreads(json.data);
      setPagination(json.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [params.topicSlug, page, sort]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return {
    threads,
    pagination,
    isLoading,
    error,
    refetch: fetchThreads,
    setPage,
    setSort,
    sort,
  };
}
