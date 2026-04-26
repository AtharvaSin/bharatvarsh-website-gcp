'use client';

import { FC } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/shared/utils';
import { EyebrowLabel } from '@/shared/ui/EyebrowLabel';
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

/**
 * Full thread view composition in Classified Chronicle voice.
 * Shell: FIELD NETWORK eyebrow + RETURN TO FIELD back link.
 * Content: ThreadDetail (header + body + reactions).
 * Replies: COUNTER-SIGNALS section with PostList + PostEditor or lock stamp.
 */
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

  // ── Loading state ─────────────────────────────────────────────────
  if (threadLoading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: 'var(--obsidian-void)' }}
      >
        <div className="max-w-[1240px] mx-auto px-8 py-16 space-y-6">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // ── Error / Not found ─────────────────────────────────────────────
  if (threadError || !thread) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--obsidian-void)' }}
      >
        <div className="text-center max-w-md px-8">
          <div
            className="font-display leading-none select-none mb-4"
            style={{
              fontSize: '180px',
              color: 'var(--mustard-dossier)',
              lineHeight: 1,
            }}
            aria-hidden="true"
          >
            404
          </div>
          <EyebrowLabel
            segments={['TRANSMISSION NOT FOUND']}
            className="mb-3 justify-center"
          />
          <p
            className="font-sans text-base mb-6"
            style={{ color: 'var(--steel-text)' }}
          >
            {threadError ||
              'This channel has been sealed or the file has been removed from the archive.'}
          </p>
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] transition-opacity hover:opacity-80"
            style={{ color: 'var(--mustard-dossier)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            RETURN TO FIELD
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('min-h-screen', className)}
      style={{ backgroundColor: 'var(--obsidian-void)' }}
    >
      <div className="max-w-[1240px] mx-auto px-8 py-16">
        {/* ── Top rail: eyebrow + back link ──────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <EyebrowLabel
            segments={['FIELD NETWORK', 'TRANSMISSION INDEX']}
          />
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] transition-opacity hover:opacity-80"
            style={{ color: 'var(--mustard-dossier)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            RETURN TO FIELD
          </Link>
        </div>

        {/* ── Main thread ────────────────────────────────────────────── */}
        <ThreadDetail thread={thread} />

        {/* ── Counter-signals (replies) section ──────────────────────── */}
        <div className="mt-20">
          <EyebrowLabel
            segments={[
              'COUNTER-SIGNALS',
              `${thread.postCount} ${thread.postCount === 1 ? 'TRANSMISSION' : 'TRANSMISSIONS'}`,
            ]}
            className="mb-4"
          />
          <h2
            className="font-display uppercase leading-[0.95] tracking-tight mb-4"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--bone-text)',
            }}
          >
            COUNTER-SIGNALS.
          </h2>
          <p
            className="font-serif italic mb-10"
            style={{
              color: 'var(--powder-signal)',
              fontSize: 'clamp(1rem, 1.6vw, 1.25rem)',
            }}
          >
            The field responds.
          </p>

          <PostList
            posts={posts}
            pagination={pagination}
            isLoading={postsLoading}
            onPageChange={setPage}
          />

          {/* ── Reply editor or locked stamp ─────────────────────────── */}
          <div className="mt-10">
            {!thread.isLocked ? (
              <PostEditor threadId={threadId} onSubmit={refetchPosts} />
            ) : (
              <div
                className="p-8 border-2 border-dashed text-center"
                style={{
                  borderColor: 'var(--redaction)',
                  backgroundColor: 'var(--obsidian-panel)',
                  transform: 'rotate(-1deg)',
                }}
              >
                <div
                  className="font-mono text-[10px] uppercase tracking-[0.22em] mb-2"
                  style={{ color: 'var(--redaction)' }}
                >
                  CHANNEL LOCKED
                </div>
                <p
                  className="font-display leading-[1.1]"
                  style={{
                    fontSize: 'clamp(1.5rem, 2.8vw, 2rem)',
                    color: 'var(--bone-text)',
                  }}
                >
                  NO NEW TRANSMISSIONS.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
