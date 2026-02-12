'use client';

import { useState, useCallback } from 'react';

interface ModerationAction {
  action: string;
  reason: string;
  targetUserId?: string;
  targetThreadId?: string;
  targetPostId?: string;
  metadata?: Record<string, unknown>;
}

interface UseModerationReturn {
  resolveReport: (
    reportId: string,
    status: string,
    resolution: string
  ) => Promise<boolean>;
  takeAction: (action: ModerationAction) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Provides moderation action methods: resolving reports and taking
 * moderation actions (remove content, warn user, etc.).
 * Returns success/failure booleans for callers to handle UI accordingly.
 */
export function useModeration(): UseModerationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveReport = useCallback(
    async (
      reportId: string,
      status: string,
      resolution: string
    ): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/forum/reports/${reportId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, resolution }),
        });

        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || 'Failed to resolve report');
        }
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const takeAction = useCallback(
    async (action: ModerationAction): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/forum/moderation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action),
        });

        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || 'Failed to perform moderation action');
        }
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { resolveReport, takeAction, isLoading, error };
}
