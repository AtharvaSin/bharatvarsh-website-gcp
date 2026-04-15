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

/**
 * A row of reaction buttons with counts, gated behind authentication.
 * Unauthenticated users still see the counts (so they can read the field's
 * sentiment); only the click is gated. Classified Chronicle treatment:
 * hard-rect mono chips, mustard-dossier active state, border-based idle.
 */
export const ReactionBar: FC<ReactionBarProps> = ({
  counts,
  onReact,
  disabled,
  className,
}) => {
  const { isAuthenticated } = useSession();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {reactions.map(({ type, icon: Icon, label }) => {
        const count = counts[type];
        const hasCount = count > 0;

        return (
          <button
            key={type}
            onClick={() => onReact(type)}
            disabled={disabled || !isAuthenticated}
            title={isAuthenticated ? label : 'Sign in to react'}
            aria-label={`${label} (${count})`}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none border font-mono text-[10px] uppercase tracking-[0.18em] transition-colors',
              'disabled:pointer-events-none',
            )}
            style={
              hasCount
                ? {
                    color: 'var(--mustard-dossier)',
                    borderColor: 'var(--mustard-dossier)',
                    backgroundColor: 'color-mix(in srgb, var(--mustard-dossier) 15%, transparent)',
                  }
                : {
                    color: 'var(--shadow-text)',
                    borderColor: 'var(--navy-signal)',
                    backgroundColor: 'transparent',
                  }
            }
          >
            <Icon className="w-3.5 h-3.5" />
            {/* Always show counts when non-zero, even for unauthenticated
                readers — lets them see how the field is voting. */}
            {hasCount && <span>{count}</span>}
          </button>
        );
      })}
    </div>
  );
};
