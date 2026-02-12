'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/utils';
import { useSession } from '@/features/auth';
import { TopicNav } from './components/topic-nav';
import { ThreadList } from './components/thread-list';
import { useThreads } from './hooks/use-threads';
import { useTopics } from './hooks/use-topics';

interface ForumContentProps {
  className?: string;
}

/** Forum home page composition: topic navigation and thread list. */
export const ForumContent: FC<ForumContentProps> = ({ className }) => {
  const { topics } = useTopics();
  const { threads, pagination, isLoading, sort, setSort, setPage } =
    useThreads();
  const { isMember } = useSession();

  return (
    <div className={cn('min-h-screen bg-[var(--obsidian-900)]', className)}>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl tracking-wide text-[var(--powder-300)]">
              FORUM
            </h1>
            <p className="text-[var(--text-secondary)] mt-1">
              Discuss theories, characters, and the world of Bharatvarsh
            </p>
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

        {/* Topic Navigation */}
        <TopicNav topics={topics} className="mb-6" />

        {/* Thread List */}
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
