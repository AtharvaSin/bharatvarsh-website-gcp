'use client';

import { FC } from 'react';
import { ThumbsUp, ThumbsDown, Lightbulb, Flame } from 'lucide-react';
import { cn } from '@/shared/utils';
import { useSession } from '@/features/auth';

interface ReactionBarProps {
  counts: {
    UPVOTE: number;
    DOWNVOTE: number;
    INSIGHTFUL: number;
    FLAME: number;
  };
  onReact: (type: 'UPVOTE' | 'DOWNVOTE' | 'INSIGHTFUL' | 'FLAME') => void;
  disabled?: boolean;
  className?: string;
}

const reactions = [
  { type: 'UPVOTE' as const, icon: ThumbsUp, label: 'Upvote' },
  { type: 'DOWNVOTE' as const, icon: ThumbsDown, label: 'Downvote' },
  { type: 'INSIGHTFUL' as const, icon: Lightbulb, label: 'Insightful' },
  { type: 'FLAME' as const, icon: Flame, label: 'Fire' },
];

/** A row of reaction buttons with counts, gated behind authentication. */
export const ReactionBar: FC<ReactionBarProps> = ({
  counts,
  onReact,
  disabled,
  className,
}) => {
  const { isAuthenticated } = useSession();

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {reactions.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          onClick={() => onReact(type)}
          disabled={disabled || !isAuthenticated}
          title={isAuthenticated ? label : 'Sign in to react'}
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
            'border border-[var(--obsidian-600)]',
            counts[type] > 0
              ? 'text-[var(--mustard-500)] bg-[var(--mustard-500)]/10 border-[var(--mustard-500)]/30'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--obsidian-700)]',
            'disabled:opacity-40 disabled:pointer-events-none'
          )}
        >
          <Icon className="w-3.5 h-3.5" />
          {counts[type] > 0 && <span>{counts[type]}</span>}
        </button>
      ))}
    </div>
  );
};
