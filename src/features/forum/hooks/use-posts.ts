'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PostView, PaginationMeta, PostSortOption } from '../types';

/**
 * Fetches paginated posts (replies) for a given thread.
 * Supports sorting by oldest or newest first.
 */
export function usePosts(threadId: string, initialSort: PostSortOption = 'oldest') {
  const [posts, setPosts] = useState<PostView[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<PostSortOption>(initialSort);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      searchParams.set('page', String(page));
      searchParams.set('sort', sort);

      const res = await fetch(`/api/forum/threads/${threadId}/posts?${searchParams}`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      const json = await res.json();
      setPosts(json.data);
      setPagination(json.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [threadId, page, sort]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, pagination, isLoading, error, refetch: fetchPosts, setPage, setSort };
}
