'use client';

import { FC } from 'react';
import { Check, Clock, ShieldX, Trash2 } from 'lucide-react';
import { cn } from '@/shared/utils';

interface ContentStatusBadgeProps {
  status: string;
  className?: string;
}

interface StatusConfig {
  label: string;
  color: string;
  icon: typeof Check;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  PUBLISHED: { label: 'PUBLISHED', color: 'var(--declassified)', icon: Check },
  QUARANTINED: { label: 'UNDER REVIEW', color: 'var(--status-warning)', icon: Clock },
  REMOVED: { label: 'REMOVED', color: 'var(--redaction)', icon: ShieldX },
  DELETED: { label: 'DELETED', color: 'var(--shadow-text)', icon: Trash2 },
  DRAFT: { label: 'DRAFT', color: 'var(--shadow-text)', icon: Clock },
};

/** Displays a small status badge for content moderation state. Hidden for published content. */
export const ContentStatusBadge: FC<ContentStatusBadgeProps> = ({ status, className }) => {
  const config = STATUS_CONFIG[status];

  if (!config) return null;

  // Published is the normal state; no badge needed
  if (status === 'PUBLISHED') return null;

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[9px] font-mono uppercase tracking-[0.18em] border',
        className
      )}
      style={{
        color: config.color,
        borderColor: config.color,
        backgroundColor: `color-mix(in srgb, ${config.color} 12%, transparent)`,
      }}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};
