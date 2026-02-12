'use client';

import { FC, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChevronDown, MapPin, Zap, Star } from 'lucide-react';
import { cn } from '@/shared/utils';
import { Badge } from '@/shared/ui/badge';
import type { TimelineEvent, EventType } from '@/types';

interface TimelineEventCardProps {
  event: TimelineEvent;
  index: number;
  isActive: boolean;
  onToggle: () => void;
}

export const TimelineEventCard: FC<TimelineEventCardProps> = ({
  event,
  index,
  isActive,
  onToggle,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.5) }}
      className="relative pl-16 md:pl-20"
    >
      {/* Timeline Marker */}
      <div
        className="absolute left-5 md:left-6 w-4 h-4 rounded-full border-4 border-[var(--obsidian-800)] z-10"
        style={{ backgroundColor: event.media.color }}
      />

      {/* Date Label */}
      <div className="absolute left-0 top-0 w-12 md:w-16 text-right pr-2">
        <span className="text-xs md:text-sm font-mono text-[var(--powder-400)]">
          {event.date.start_year}
        </span>
        {event.date.is_range && (
          <>
            <br />
            <span className="text-[10px] md:text-xs text-[var(--text-muted)]">
              to
            </span>
            <br />
            <span className="text-xs md:text-sm font-mono text-[var(--powder-400)]">
              {event.date.end_year}
            </span>
          </>
        )}
      </div>

      {/* Event Card */}
      <motion.article
        onClick={onToggle}
        className={cn(
          'cursor-pointer p-4 md:p-6 rounded-lg',
          'bg-gradient-to-br from-[var(--obsidian-800)] to-[var(--obsidian-700)]',
          'border border-[var(--obsidian-600)]',
          'transition-all duration-200',
          isActive && 'border-[var(--powder-500)] shadow-lg'
        )}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Badge
              variant={event.metadata.event_type as EventType}
              className="mb-2"
            >
              {event.metadata.event_type}
            </Badge>
            <h3 className="text-lg md:text-xl font-semibold text-[var(--text-primary)] line-clamp-2">
              {event.title}
            </h3>
          </div>
          <motion.div
            animate={{ rotate: isActive ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
          </motion.div>
        </div>

        {/* Preview (when collapsed) */}
        {!isActive && (
          <p className="mt-3 text-sm text-[var(--text-secondary)] line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Expanded Content */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-[var(--obsidian-600)]">
                <p className="text-[var(--text-secondary)] leading-relaxed text-sm md:text-base">
                  {event.description}
                </p>

                {/* Metadata */}
                <div className="mt-4 flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm">
                  {/* Locations */}
                  {event.metadata.locations &&
                    event.metadata.locations.length > 0 && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[var(--text-muted)]" />
                        <span className="text-[var(--text-muted)]">
                          {event.metadata.locations.join(', ')}
                        </span>
                      </div>
                    )}

                  {/* Impacts */}
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[var(--text-muted)]" />
                    <span className="text-[var(--text-muted)]">
                      {event.metadata.impacts.join(', ')}
                    </span>
                  </div>

                  {/* Significance */}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'w-3 h-3',
                          i < event.metadata.significance
                            ? 'text-[var(--mustard-500)] fill-[var(--mustard-500)]'
                            : 'text-[var(--obsidian-600)]'
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>
    </motion.div>
  );
};

export default TimelineEventCard;
