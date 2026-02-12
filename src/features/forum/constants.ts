export const FORUM_LIMITS = {
  THREAD_TITLE_MIN: 3,
  THREAD_TITLE_MAX: 200,
  THREAD_BODY_MIN: 10,
  THREAD_BODY_MAX: 50000,
  POST_BODY_MIN: 1,
  POST_BODY_MAX: 20000,
  MAX_TOPICS_PER_THREAD: 3,
  THREADS_PER_PAGE: 20,
  POSTS_PER_PAGE: 30,
} as const;

export const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Popular' },
  { value: 'unanswered', label: 'Unanswered' },
] as const;

export const POST_SORT_OPTIONS = [
  { value: 'oldest', label: 'Oldest First' },
  { value: 'newest', label: 'Newest First' },
] as const;

export const REACTION_LABELS: Record<
  string,
  { label: string; emoji: string }
> = {
  UPVOTE: { label: 'Upvote', emoji: '\u{1F44D}' },
  DOWNVOTE: { label: 'Downvote', emoji: '\u{1F44E}' },
  INSIGHTFUL: { label: 'Insightful', emoji: '\u{1F4A1}' },
  FLAME: { label: 'Fire', emoji: '\u{1F525}' },
};

export const REPORT_REASONS = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'HATE_SPEECH', label: 'Hate Speech' },
  { value: 'MISINFORMATION', label: 'Misinformation' },
  { value: 'OFF_TOPIC', label: 'Off Topic' },
  { value: 'SPOILERS', label: 'Spoilers' },
  { value: 'OTHER', label: 'Other' },
] as const;
