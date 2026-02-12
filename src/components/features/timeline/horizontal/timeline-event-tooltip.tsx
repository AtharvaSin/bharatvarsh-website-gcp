'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { TimelineEvent } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TimelineEventTooltipProps {
  event: TimelineEvent;
  prefersReducedMotion: boolean;
}

/**
 * Tooltip preview that appears on hover over event markers
 * Shows title, date, type badge, and brief description
 */
export const TimelineEventTooltip: FC<TimelineEventTooltipProps> = ({
  event,
  prefersReducedMotion,
}) => {
  // Truncate description to ~80 characters
  const truncatedDescription =
    event.description.length > 100
      ? `${event.description.slice(0, 100).trim()}...`
      : event.description;

  return (
    <motion.div
      className={cn(
        'absolute bottom-full left-1/2 -translate-x-1/2 mb-16',
        'w-72 p-4',
        'bg-[var(--obsidian-800)]/95 backdrop-blur-md',
        'border border-[var(--obsidian-600)]',
        'rounded-lg shadow-xl',
        'pointer-events-none z-50'
      )}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.2,
        ease: 'easeOut',
      }}
    >
      {/* Arrow pointing down */}
      <div
        className={cn(
          'absolute -bottom-2 left-1/2 -translate-x-1/2',
          'w-4 h-4 rotate-45',
          'bg-[var(--obsidian-800)] border-r border-b border-[var(--obsidian-600)]'
        )}
      />

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant={event.metadata.event_type}>
            {event.metadata.event_type}
          </Badge>
          <span className="font-mono text-xs text-[var(--text-muted)]">
            {event.date.is_range
              ? `${event.date.start_year}-${event.date.end_year}`
              : event.date.start_year}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-base font-semibold text-[var(--text-primary)] mb-2 leading-tight">
          {event.title}
        </h4>

        {/* Description */}
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {truncatedDescription}
        </p>

        {/* Click hint */}
        <p className="text-xs text-[var(--text-muted)] mt-3 flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-[var(--obsidian-700)] rounded text-[10px]">
            Click
          </kbd>
          to view full details
        </p>
      </div>
    </motion.div>
  );
};
