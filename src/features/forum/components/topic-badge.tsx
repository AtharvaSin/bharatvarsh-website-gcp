'use client';

import { FC } from 'react';
import { cn } from '@/shared/utils';

interface TopicBadgeProps {
  name: string;
  color?: string | null;
  size?: 'sm' | 'md';
  className?: string;
}

/** Displays a styled badge for a forum topic with optional color override. */
export const TopicBadge: FC<TopicBadgeProps> = ({
  name,
  color,
  size = 'sm',
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        'bg-[var(--obsidian-700)] text-[var(--text-secondary)] border border-[var(--obsidian-600)]',
        className
      )}
      style={
        color
          ? { borderColor: `var(${color})`, color: `var(${color})` }
          : undefined
      }
    >
      {name}
    </span>
  );
};
