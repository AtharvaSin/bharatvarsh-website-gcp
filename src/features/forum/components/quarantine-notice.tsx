'use client';

import { FC } from 'react';
import { AlertTriangle, ShieldX } from 'lucide-react';
import { cn } from '@/shared/utils';

interface QuarantineNoticeProps {
  status: string;
  className?: string;
}

/** Displays a contextual banner when content is quarantined or removed by moderation. */
export const QuarantineNotice: FC<QuarantineNoticeProps> = ({ status, className }) => {
  if (status === 'QUARANTINED') {
    return (
      <div
        className={cn(
          'flex items-start gap-3 p-4 rounded-lg border',
          'bg-[var(--status-warning)]/10 border-[var(--status-warning)]/30',
          className
        )}
      >
        <AlertTriangle className="w-5 h-5 text-[var(--status-warning)] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-[var(--status-warning)]">
            This content is under review
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Our moderation system has flagged this content for review. It will be
            visible once approved by a moderator.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'REMOVED') {
    return (
      <div
        className={cn(
          'flex items-start gap-3 p-4 rounded-lg border',
          'bg-[var(--status-alert)]/10 border-[var(--status-alert)]/30',
          className
        )}
      >
        <ShieldX className="w-5 h-5 text-[var(--status-alert)] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-[var(--status-alert)]">
            This content has been removed
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            This content was removed by a moderator for violating community
            guidelines.
          </p>
        </div>
      </div>
    );
  }

  return null;
};
