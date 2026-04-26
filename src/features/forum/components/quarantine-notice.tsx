'use client';

import { FC } from 'react';
import { AlertTriangle, ShieldX } from 'lucide-react';
import { EyebrowLabel } from '@/shared/ui/EyebrowLabel';
import { cn } from '@/shared/utils';

interface QuarantineNoticeProps {
  status: string;
  className?: string;
}

/** Displays a Classified Chronicle moderation banner when content is quarantined or removed. */
export const QuarantineNotice: FC<QuarantineNoticeProps> = ({ status, className }) => {
  if (status === 'QUARANTINED') {
    return (
      <div
        className={cn(
          'flex items-start gap-3 p-4 border-l-4',
          className,
        )}
        style={{
          backgroundColor: 'var(--obsidian-deep)',
          borderLeftColor: 'var(--status-warning)',
          borderTop: '1px solid var(--status-warning)',
          borderRight: '1px solid var(--status-warning)',
          borderBottom: '1px solid var(--status-warning)',
        }}
      >
        <AlertTriangle
          className="w-5 h-5 shrink-0 mt-0.5"
          style={{ color: 'var(--status-warning)' }}
        />
        <div className="flex-1">
          <EyebrowLabel
            segments={['CONTENT UNDER REVIEW', 'AWAITING MODERATION']}
            className="mb-2"
          />
          <p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--steel-text)' }}>
            Mesh heuristics flagged this transmission for review. It will surface
            publicly once cleared by a moderator.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'REMOVED') {
    return (
      <div
        className={cn(
          'flex items-start gap-3 p-4 border-l-4',
          className,
        )}
        style={{
          backgroundColor: 'var(--obsidian-deep)',
          borderLeftColor: 'var(--redaction)',
          borderTop: '1px solid var(--redaction)',
          borderRight: '1px solid var(--redaction)',
          borderBottom: '1px solid var(--redaction)',
        }}
      >
        <ShieldX
          className="w-5 h-5 shrink-0 mt-0.5"
          style={{ color: 'var(--redaction)' }}
        />
        <div className="flex-1">
          <EyebrowLabel
            segments={['TRANSMISSION REMOVED', 'MODERATOR ORDER']}
            className="mb-2"
          />
          <p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--steel-text)' }}>
            This transmission was pulled from the channel for violating field
            protocols.
          </p>
        </div>
      </div>
    );
  }

  return null;
};
