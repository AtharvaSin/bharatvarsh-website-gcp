/**
 * Heuristic spam / toxicity detection for the Bharatvarsh Forum.
 *
 * These checks run *before* the Vertex AI call to catch obvious spam
 * without incurring AI costs. They are intentionally lightweight and
 * synchronous (except for the velocity check which hits the database).
 *
 * Server-only module -- do not import from client components.
 */

import 'server-only';

// ─── TYPES ─────────────────────────────────────────────────

interface ToxicityResult {
  flagged: boolean;
  reasons: string[];
}

// ─── PATTERNS ──────────────────────────────────────────────

/** URL regex pattern. */
const URL_PATTERN = /https?:\/\/[^\s]+/gi;

/** Common spam patterns. */
const SPAM_PATTERNS: RegExp[] = [
  /buy\s+now/i,
  /free\s+(?:money|gift|prize)/i,
  /click\s+here\s+to/i,
  /(?:crypto|bitcoin|nft)\s+(?:invest|trading|profit)/i,
  /earn\s+\$?\d+.*(?:per|a)\s+(?:day|hour|week)/i,
  /limited\s+time\s+offer/i,
];

// ─── HEURISTIC CHECKS ──────────────────────────────────────

/**
 * Runs fast heuristic checks before invoking the AI model.
 * Returns flagged=true if heuristics detect potential issues.
 */
export function runHeuristicChecks(content: string): ToxicityResult {
  const reasons: string[] = [];

  // 1. Link density check (>3 links = flag)
  const urls = content.match(URL_PATTERN);
  if (urls && urls.length > 3) {
    reasons.push(`High link density: ${urls.length} URLs detected`);
  }

  // 2. Spam pattern matching
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(content)) {
      reasons.push(`Spam pattern detected: ${pattern.source}`);
      break; // One match is enough
    }
  }

  // 3. Excessive caps (>60% uppercase in content longer than 50 chars)
  if (content.length > 50) {
    const upperCount = (content.match(/[A-Z]/g) || []).length;
    const letterCount = (content.match(/[a-zA-Z]/g) || []).length;
    if (letterCount > 0 && upperCount / letterCount > 0.6) {
      reasons.push('Excessive uppercase content');
    }
  }

  // 4. Repetitive content (same char repeated excessively)
  if (/(.)\1{10,}/.test(content)) {
    reasons.push('Excessive character repetition');
  }

  // 5. Very short content with URLs (likely spam)
  if (content.length < 50 && urls && urls.length > 0) {
    reasons.push('Short content with URLs');
  }

  return {
    flagged: reasons.length > 0,
    reasons,
  };
}

// ─── DUPLICATE DETECTION ───────────────────────────────────

/**
 * Generates a content hash for duplicate detection.
 * Normalizes whitespace and lowercases before hashing.
 */
export function contentHash(content: string): string {
  const normalized = content.toLowerCase().replace(/\s+/g, ' ').trim();
  // Simple hash for duplicate detection
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

// ─── VELOCITY CHECK ────────────────────────────────────────

/**
 * Prisma-compatible interface for the post model.
 * Accepts a subset of PrismaClient so callers can pass the real client
 * or a test double.
 */
interface PostCountClient {
  post: {
    count: (args: {
      where: { authorId: string; createdAt: { gte: Date } };
    }) => Promise<number>;
  };
}

/**
 * Checks posting velocity -- returns true if the user is posting too fast.
 * Limit: 5 posts per minute.
 */
export async function checkPostingVelocity(
  userId: string,
  prismaClient: PostCountClient,
): Promise<boolean> {
  const oneMinuteAgo = new Date(Date.now() - 60_000);
  const recentPosts = await prismaClient.post.count({
    where: {
      authorId: userId,
      createdAt: { gte: oneMinuteAgo },
    },
  });
  return recentPosts >= 5;
}
