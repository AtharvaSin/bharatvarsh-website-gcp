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
  PUBLISHED: { label: 'Published', color: 'var(--status-success)', icon: Check },
  QUARANTINED: { label: 'Under Review', color: 'var(--status-warning)', icon: Clock },
  REMOVED: { label: 'Removed', color: 'var(--status-alert)', icon: ShieldX },
  DELETED: { label: 'Deleted', color: 'var(--text-muted)', icon: Trash2 },
  DRAFT: { label: 'Draft', color: 'var(--text-muted)', icon: Clock },
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
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border',
        className
      )}
      style={{
        color: config.color,
        borderColor: `color-mix(in srgb, ${config.color} 30%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${config.color} 10%, transparent)`,
      }}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};
