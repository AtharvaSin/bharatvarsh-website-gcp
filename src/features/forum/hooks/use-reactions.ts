'use client';

import { useState, useCallback } from 'react';

type ReactionType = 'UPVOTE' | 'DOWNVOTE' | 'INSIGHTFUL' | 'FLAME';

interface ReactionCounts {
  UPVOTE: number;
  DOWNVOTE: number;
  INSIGHTFUL: number;
  FLAME: number;
}

/**
 * Manages reaction state for a thread with optimistic updates.
 * Toggles reactions on/off via the API and reverts on failure.
 */
export function useReactions(threadId: string, initialCounts: ReactionCounts) {
  const [counts, setCounts] = useState<ReactionCounts>(initialCounts);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleReaction = useCallback(
    async (type: ReactionType) => {
      if (isSubmitting) return;
      setIsSubmitting(true);

      // Optimistic update
      const prevCounts = { ...counts };
      setCounts((prev) => ({
        ...prev,
        [type]: prev[type] + 1,
      }));

      try {
        const res = await fetch(`/api/forum/threads/${threadId}/reactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type }),
        });

        if (!res.ok) {
          setCounts(prevCounts);
          return;
        }

        const json = await res.json();
        if (json.data?.removed) {
          // Was a toggle-off: we added 1 optimistically but it was removed, so subtract 2
          setCounts((prev) => ({
            ...prev,
            [type]: Math.max(0, prev[type] - 2),
          }));
        }
      } catch {
        setCounts(prevCounts);
      } finally {
        setIsSubmitting(false);
      }
    },
    [threadId, counts, isSubmitting]
  );

  return { counts, toggleReaction, isSubmitting };
}
