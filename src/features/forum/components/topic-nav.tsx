'use client';

import { FC } from 'react';
import Link from 'next/link';
import { cn } from '@/shared/utils';
import type { TopicView } from '../types';

interface TopicNavProps {
  topics: TopicView[];
  activeSlug?: string;
  className?: string;
}

/** Horizontal scrollable topic filter bar for the forum. */
export const TopicNav: FC<TopicNavProps> = ({
  topics,
  activeSlug,
  className,
}) => {
  return (
    <nav
      className={cn(
        'flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide',
        className
      )}
    >
      <Link
        href="/forum"
        className={cn(
          'shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          !activeSlug
            ? 'bg-[var(--mustard-500)] text-[var(--navy-900)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--obsidian-700)] border border-[var(--obsidian-600)]'
        )}
      >
        All Topics
      </Link>
      {topics.map((topic) => (
        <Link
          key={topic.slug}
          href={`/forum/topic/${topic.slug}`}
          className={cn(
            'shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeSlug === topic.slug
              ? 'bg-[var(--mustard-500)] text-[var(--navy-900)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--obsidian-700)] border border-[var(--obsidian-600)]'
          )}
        >
          {topic.name}
          <span className="ml-1.5 text-xs opacity-70">{topic.threadCount}</span>
        </Link>
      ))}
    </nav>
  );
};
