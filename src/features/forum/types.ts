import { z } from 'zod';

// ─── Zod Schemas ────────────────────────────────────

export const threadCreateSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be under 200 characters'),
  body: z
    .string()
    .min(10, 'Body must be at least 10 characters')
    .max(50000, 'Body must be under 50,000 characters'),
  topicSlugs: z
    .array(z.string())
    .min(1, 'Select at least one topic')
    .max(3, 'Maximum 3 topics'),
});

export const threadUpdateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  body: z.string().min(10).max(50000).optional(),
});

export const postCreateSchema = z.object({
  body: z
    .string()
    .min(1, 'Reply cannot be empty')
    .max(20000, 'Reply must be under 20,000 characters'),
  parentId: z.string().optional(),
});

export const postUpdateSchema = z.object({
  body: z.string().min(1).max(20000),
});

export const reactionSchema = z.object({
  type: z.enum(['UPVOTE', 'DOWNVOTE', 'INSIGHTFUL', 'FLAME']),
});

export const reportCreateSchema = z
  .object({
    reason: z.enum([
      'SPAM',
      'HARASSMENT',
      'HATE_SPEECH',
      'MISINFORMATION',
      'OFF_TOPIC',
      'SPOILERS',
      'OTHER',
    ]),
    description: z.string().max(2000).optional(),
    threadId: z.string().optional(),
    postId: z.string().optional(),
  })
  .refine((data) => data.threadId || data.postId, {
    message: 'Either threadId or postId is required',
  });

// ─── TypeScript Types ───────────────────────────────

export type ThreadCreateInput = z.infer<typeof threadCreateSchema>;
export type ThreadUpdateInput = z.infer<typeof threadUpdateSchema>;
export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type PostUpdateInput = z.infer<typeof postUpdateSchema>;
export type ReactionInput = z.infer<typeof reactionSchema>;
export type ReportCreateInput = z.infer<typeof reportCreateSchema>;

export interface ThreadListParams {
  topicSlug?: string;
  page?: number;
  limit?: number;
  sort?: 'latest' | 'popular' | 'unanswered';
}

export interface PostListParams {
  page?: number;
  limit?: number;
  sort?: 'oldest' | 'newest';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  code: string;
  details?: z.ZodIssue[];
}

export interface TopicView {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  threadCount: number;
}

export interface ThreadView {
  id: string;
  title: string;
  slug: string;
  body: string;
  bodyHtml: string | null;
  excerpt: string | null;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  status: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    role: string;
  };
  tags: { id: string; name: string; slug: string; color: string | null }[];
  reactionCounts: {
    UPVOTE: number;
    DOWNVOTE: number;
    INSIGHTFUL: number;
    FLAME: number;
  };
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ThreadListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    role: string;
  };
  tags: { name: string; slug: string; color: string | null }[];
  reactionCounts: {
    UPVOTE: number;
    DOWNVOTE: number;
    INSIGHTFUL: number;
    FLAME: number;
  };
  postCount: number;
  createdAt: string;
}

export interface PostView {
  id: string;
  body: string;
  bodyHtml: string | null;
  status: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    role: string;
  };
  parentId: string | null;
  reactionCounts: {
    UPVOTE: number;
    DOWNVOTE: number;
    INSIGHTFUL: number;
    FLAME: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type SortOption = 'latest' | 'popular' | 'unanswered';
export type PostSortOption = 'oldest' | 'newest';
