'use client';

import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils';
import { Badge } from '@/shared/ui/badge';
import type { TimelineEvent, EventType } from '@/types';

interface TimelineVerticalEventCardProps {
  event: TimelineEvent;
  index: number;
  onSelect: () => void;
}

/**
 * Glassmorphism event card for mobile vertical timeline
 * Displays as semi-transparent overlay on phase background
 */
export const TimelineVerticalEventCard: FC<TimelineVerticalEventCardProps> = memo(
  ({ event, index, onSelect }) => {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        onClick={onSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
        aria-label={`View details for ${event.title}`}
        className={cn(
          // Glassmorphism effect
          'backdrop-blur-md bg-[var(--obsidian-900)]/70',
          'border border-[var(--obsidian-600)]/50',
          'rounded-xl p-4',
          'cursor-pointer',
          'active:scale-[0.98] transition-all duration-200',
          // Glow effect on hover/focus
          'hover:border-[var(--powder-500)]/50',
          'hover:bg-[var(--obsidian-900)]/80',
          'focus:outline-none focus:ring-2 focus:ring-[var(--powder-500)]/50',
          'touch-target'
        )}
      >
        {/* Year Badge & Event Type */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-sm text-[var(--powder-400)] tracking-wide">
            {event.date.start_year}
            {event.date.is_range && ` - ${event.date.end_year}`}
          </span>
          <Badge variant={event.metadata.event_type as EventType}>
            {event.metadata.event_type}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-[var(--text-primary)] line-clamp-2 mb-2">
          {event.title}
        </h3>

        {/* Description Preview */}
        <p className="text-sm text-[var(--text-secondary)] line-clamp-3 mb-4 leading-relaxed">
          {event.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          {/* Significance Stars */}
          <div className="flex items-center gap-0.5" aria-label={`Significance: ${event.metadata.significance} out of 5`}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'w-3.5 h-3.5',
                  i < event.metadata.significance
                    ? 'text-[var(--mustard-500)] fill-[var(--mustard-500)]'
                    : 'text-[var(--obsidian-600)]'
                )}
              />
            ))}
          </div>

          {/* Location (if available) */}
          {event.metadata.locations?.[0] && (
            <div className="flex items-center gap-1 text-[var(--text-muted)]">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate max-w-[120px]">
                {event.metadata.locations[0]}
              </span>
            </div>
          )}

          {/* Tap indicator */}
          <div className="flex items-center gap-1 text-[var(--powder-400)]">
            <span className="text-xs">Details</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </motion.article>
    );
  }
);

TimelineVerticalEventCard.displayName = 'TimelineVerticalEventCard';
