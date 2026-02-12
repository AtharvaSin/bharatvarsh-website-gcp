'use client';

import { FC, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { TimelineEventCard } from './timeline-event-card';
import { TimelineFilter } from './timeline-filter';
import type { TimelineEvent } from '@/types';

interface TimelineContainerProps {
  events: TimelineEvent[];
  className?: string;
}

export const TimelineContainer: FC<TimelineContainerProps> = ({
  events,
  className,
}) => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    if (!activeFilter) return events;
    return events.filter((e) => e.metadata.event_type === activeFilter);
  }, [events, activeFilter]);

  const handleToggle = (slug: string) => {
    setActiveEvent(activeEvent === slug ? null : slug);
  };

  return (
    <div className={cn('relative max-w-4xl mx-auto', className)}>
      {/* Filter */}
      <TimelineFilter
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        className="mb-8 md:mb-12"
      />

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-7 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--obsidian-600)] via-[var(--powder-500)] to-[var(--obsidian-600)]" />

        {/* Events */}
        <div className="space-y-8 md:space-y-12">
          {filteredEvents.map((event, index) => (
            <TimelineEventCard
              key={event.id}
              event={event}
              index={index}
              isActive={activeEvent === event.slug}
              onToggle={() => handleToggle(event.slug)}
            />
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--text-muted)]">
            No events found for this filter.
          </p>
          <button
            onClick={() => setActiveFilter(null)}
            className="mt-4 text-[var(--powder-400)] hover:text-[var(--powder-300)] underline"
          >
            Clear filter
          </button>
        </div>
      )}
    </div>
  );
};

export default TimelineContainer;
