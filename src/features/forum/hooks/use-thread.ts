'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ThreadView } from '../types';

/**
 * Fetches a single thread by its ID, including full body content
 * and reaction counts.
 */
export function useThread(threadId: string) {
  const [thread, setThread] = useState<ThreadView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThread = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/forum/threads/${threadId}`);
      if (!res.ok) throw new Error('Thread not found');
      const json = await res.json();
      setThread(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  return { thread, isLoading, error, refetch: fetchThread };
}
