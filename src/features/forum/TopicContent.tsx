'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/button';
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

/** Topic-filtered thread list page with topic navigation and back link. */
export const TopicContent: FC<TopicContentProps> = ({ slug, className }) => {
  const { topics } = useTopics();
  const { threads, pagination, isLoading, sort, setSort, setPage } =
    useThreads({ topicSlug: slug });
  const { isMember } = useSession();
  const currentTopic = topics.find((t) => t.slug === slug);

  return (
    <div className={cn('min-h-screen bg-[var(--obsidian-900)]', className)}>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/forum"
            className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Forum
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-3xl md:text-4xl tracking-wide text-[var(--powder-300)]">
                {currentTopic?.name || slug.toUpperCase()}
              </h1>
              {currentTopic?.description && (
                <p className="text-[var(--text-secondary)] mt-1">
                  {currentTopic.description}
                </p>
              )}
            </div>
            {isMember && (
              <Button variant="primary" size="sm" asChild>
                <Link href="/forum/new">
                  <Plus className="w-4 h-4" />
                  New Thread
                </Link>
              </Button>
            )}
          </div>
        </div>

        <TopicNav topics={topics} activeSlug={slug} className="mb-6" />

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
