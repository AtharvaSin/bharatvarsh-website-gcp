/**
 * Centralised feature flags and forum limit constants for Bharatvarsh.
 *
 * Feature flags are read from environment variables (prefixed NEXT_PUBLIC_ so
 * they are available on the client) with sensible defaults.
 *
 * Forum limits are static constants used for input validation on both client
 * and server.
 */

// ─── Feature Flags ──────────────────────────────────────────

export const featureFlags = {
  /** Master switch: set NEXT_PUBLIC_FORUM_ENABLED=true to activate the forum. */
  FORUM_ENABLED: process.env.NEXT_PUBLIC_FORUM_ENABLED === 'true',

  /** When true, unauthenticated visitors cannot browse forum content at all. */
  FORUM_REQUIRE_AUTH_TO_READ: false,

  /** When true, AI content moderation is active (requires VERTEX_AI_PROJECT). */
  AI_MODERATION_ENABLED: process.env.NEXT_PUBLIC_AI_MODERATION_ENABLED === 'true',

  /** When true, heuristic spam checks run before AI moderation. */
  HEURISTIC_CHECKS_ENABLED: true,
} as const;

// ─── Rate Limiting Configuration ────────────────────────────

export const rateLimitConfig = {
  /** Rate limits per tier (requests per minute). */
  tiers: {
    read: 60,
    create: 10,
    react: 30,
    report: 5,
    ai: 5,
    admin: 30,
  },

  /** Whether rate limiting is enabled. Disable for local development. */
  ENABLED: process.env.NEXT_PUBLIC_RATE_LIMIT_ENABLED !== 'false',
} as const;

// ─── Cache Configuration ────────────────────────────────────

export const cacheConfig = {
  /** Cache TTL for topic listings (seconds). Topics change rarely. */
  TOPICS_TTL: 300,

  /** Cache TTL for thread listings (seconds). */
  THREAD_LIST_TTL: 30,

  /** Cache TTL for individual thread detail (seconds). */
  THREAD_DETAIL_TTL: 15,

  /** Cache TTL for user profiles (seconds). */
  USER_PROFILE_TTL: 60,

  /** Stale-while-revalidate window (seconds). */
  SWR_WINDOW: 60,
} as const;

// ─── Forum Content Limits ───────────────────────────────────

export const forumLimits = {
  /** Minimum length for a thread title. */
  THREAD_TITLE_MIN: 3,

  /** Maximum length for a thread title. */
  THREAD_TITLE_MAX: 200,

  /** Minimum length for a thread body (Markdown source). */
  THREAD_BODY_MIN: 10,

  /** Maximum length for a thread body (Markdown source). */
  THREAD_BODY_MAX: 50_000,

  /** Minimum length for a post / reply body. */
  POST_BODY_MIN: 1,

  /** Maximum length for a post / reply body. */
  POST_BODY_MAX: 20_000,

  /** Maximum number of topics (tags) that can be attached to a single thread. */
  MAX_TOPICS_PER_THREAD: 3,

  /** Number of threads returned per page in listings. */
  THREADS_PER_PAGE: 20,

  /** Number of posts returned per page in a thread view. */
  POSTS_PER_PAGE: 30,

  /** Maximum number of content reports a user can file per calendar day. */
  MAX_REPORTS_PER_DAY: 10,
} as const;
