'use client';

import { FC } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { cn } from '@/shared/utils';
import { Skeleton } from '@/shared/ui/skeleton';
import { ThreadDetail } from './components/thread-detail';
import { PostList } from './components/post-list';
import { PostEditor } from './components/post-editor';
import { useThread } from './hooks/use-thread';
import { usePosts } from './hooks/use-posts';

interface ThreadContentProps {
  threadId: string;
  className?: string;
}

/** Full thread view composition: header, body, reactions, replies list, and reply editor. */
export const ThreadContent: FC<ThreadContentProps> = ({
  threadId,
  className,
}) => {
  const {
    thread,
    isLoading: threadLoading,
    error: threadError,
  } = useThread(threadId);
  const {
    posts,
    pagination,
    isLoading: postsLoading,
    setPage,
    refetch: refetchPosts,
  } = usePosts(threadId);

  if (threadLoading) {
    return (
      <div className="min-h-screen bg-[var(--obsidian-900)]">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (threadError || !thread) {
    return (
      <div className="min-h-screen bg-[var(--obsidian-900)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Thread not found
          </h2>
          <p className="text-[var(--text-muted)] mt-2">
            {threadError || 'This thread may have been deleted.'}
          </p>
          <Link
            href="/forum"
            className="text-[var(--mustard-500)] hover:underline mt-4 inline-block"
          >
            Back to Forum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen bg-[var(--obsidian-900)]', className)}>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <Link
          href="/forum"
          className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Forum
        </Link>

        <ThreadDetail thread={thread} />

        {/* Replies Section */}
        <div className="mt-8 space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
            <MessageSquare className="w-5 h-5" />
            Replies ({thread.postCount})
          </h2>

          <PostList
            posts={posts}
            pagination={pagination}
            isLoading={postsLoading}
            onPageChange={setPage}
          />

          {/* Reply Editor */}
          {!thread.isLocked ? (
            <div className="mt-6 pt-6 border-t border-[var(--obsidian-600)]">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">
                Write a Reply
              </h3>
              <PostEditor threadId={threadId} onSubmit={refetchPosts} />
            </div>
          ) : (
            <div className="mt-6 p-4 rounded-lg bg-[var(--obsidian-800)] border border-[var(--obsidian-600)] text-center">
              <p className="text-sm text-[var(--text-muted)]">
                This thread is locked. No new replies can be added.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
