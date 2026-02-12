'use client';

import { useState, useEffect } from 'react';
import type { TopicView } from '../types';

/**
 * Fetches all available forum topics for navigation and filtering.
 */
export function useTopics() {
  const [topics, setTopics] = useState<TopicView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopics() {
      try {
        const res = await fetch('/api/forum/topics');
        if (!res.ok) throw new Error('Failed to fetch topics');
        const json = await res.json();
        setTopics(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchTopics();
  }, []);

  return { topics, isLoading, error };
}
