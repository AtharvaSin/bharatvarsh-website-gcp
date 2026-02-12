/**
 * GA4 analytics hook for tracking forum events.
 *
 * Sends custom events to Google Analytics via the gtag global.
 * Gracefully no-ops when GA4 is not loaded (dev, SSR, ad-blockers).
 */

'use client';

import { useCallback } from 'react';

// ─── GA4 Event Types ─────────────────────────────────────────

type ForumEvent =
  | 'forum_thread_create'
  | 'forum_thread_view'
  | 'forum_post_create'
  | 'forum_reaction'
  | 'forum_report'
  | 'forum_sign_in'
  | 'forum_sign_out'
  | 'forum_search';

interface EventParams {
  /** The forum topic slug. */
  topic_slug?: string;
  /** Thread ID being viewed or acted upon. */
  thread_id?: string;
  /** Reaction type (UPVOTE, DOWNVOTE, INSIGHTFUL, FLAME). */
  reaction_type?: string;
  /** Report reason. */
  report_reason?: string;
  /** Search query. */
  search_query?: string;
  /** Sort method. */
  sort_method?: string;
  /** Content status after action. */
  content_status?: string;
  /** Generic label for additional context. */
  label?: string;
}

// ─── Gtag Typing ─────────────────────────────────────────────

declare global {
  interface Window {
    gtag?: (
      command: 'event',
      eventName: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

// ─── Hook ────────────────────────────────────────────────────

/**
 * Hook for tracking forum-specific events in GA4.
 *
 * @example
 * ```tsx
 * const { trackEvent } = useAnalytics();
 * trackEvent('forum_thread_create', { topic_slug: 'general' });
 * ```
 */
export function useAnalytics() {
  const trackEvent = useCallback(
    (event: ForumEvent, params?: EventParams): void => {
      if (typeof window === 'undefined' || !window.gtag) return;

      try {
        window.gtag('event', event, {
          event_category: 'forum',
          ...params,
        });
      } catch {
        // Silently ignore analytics errors — never block the user.
      }
    },
    [],
  );

  return { trackEvent };
}
