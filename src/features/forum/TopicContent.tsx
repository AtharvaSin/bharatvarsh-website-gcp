'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { EyebrowLabel } from '@/shared/ui/EyebrowLabel';
import { cn } from '@/shared/utils';
import { useSession } from '@/features/auth';
import { TopicNav } from './components/topic-nav';
import { ThreadList } from './components/thread-list';
import { useThreads } from './hooks/use-threads';
import { useTopics } from './hooks/use-topics';

interface TopicContentProps {
  slug: string;
  className?: string;
}

/**
 * Classified Chronicle topic-filtered thread list page.
 * Eyebrow + display headline + italic serif description + back link.
 * Renders TopicNav (channel pills) above the ThreadList.
 */
export const TopicContent: FC<TopicContentProps> = ({ slug, className }) => {
  const { topics } = useTopics();
  const { threads, pagination, isLoading, sort, setSort, setPage } =
    useThreads({ topicSlug: slug });
  const { isMember } = useSession();
  const currentTopic = topics.find((t) => t.slug === slug);

  const channelLabel = (currentTopic?.name ?? slug).toUpperCase();
  const threadCount = pagination?.total ?? 0;

  return (
    <div
      className={cn('min-h-screen', className)}
      style={{ backgroundColor: 'var(--obsidian-void)' }}
    >
      <div className="max-w-[1240px] mx-auto px-8 py-16">
        {/* ── Top rail: eyebrow + back link ──────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <EyebrowLabel
            segments={[
              'CHANNEL',
              channelLabel,
              `${threadCount} ${threadCount === 1 ? 'TRANSMISSION' : 'TRANSMISSIONS'}`,
            ]}
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

        {/* ── Channel title ──────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 mb-12">
          <div className="flex-1 min-w-0">
            <h1
              className="font-display uppercase leading-[0.95] tracking-tight"
              style={{
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                color: 'var(--bone-text)',
              }}
            >
              {channelLabel}
            </h1>
            {currentTopic?.description && (
              <p
                className="font-serif italic mt-4 max-w-[60ch]"
                style={{
                  fontSize: 'clamp(1rem, 1.6vw, 1.25rem)',
                  color: 'var(--powder-signal)',
                }}
              >
                {currentTopic.description}
              </p>
            )}
          </div>
          {isMember && (
            <Button variant="primary" size="sm" asChild>
              <Link href="/forum/new">
                <Plus className="w-4 h-4" />
                NEW TRANSMISSION
              </Link>
            </Button>
          )}
        </div>

        <TopicNav topics={topics} activeSlug={slug} className="mb-8" />

        <ThreadList
          threads={threads}
          pagination={pagination}
          isLoading={isLoading}
          sort={sort}
          onSortChange={setSort}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};
