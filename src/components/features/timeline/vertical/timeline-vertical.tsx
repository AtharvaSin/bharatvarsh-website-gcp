'use client';

import { FC, useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils';
import { TimelineEvent } from '@/types';
import { TIMELINE_PHASES } from '@/data/timeline-phases';
import { getEventsForPhase } from '../utils/timeline-calculations';
import { TimelineVerticalPhase } from './timeline-vertical-phase';
import { TimelineEventModal } from '../horizontal/timeline-event-modal';

interface TimelineVerticalProps {
  events: TimelineEvent[];
  className?: string;
}

/**
 * Mobile vertical timeline with full-viewport phase sections
 * Uses CSS scroll-snap for smooth phase-by-phase navigation
 */
export const TimelineVertical: FC<TimelineVerticalProps> = ({
  events,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  // Track active phase via Intersection Observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const phaseId = entry.target.id.replace('mobile-phase-', '');
            const index = TIMELINE_PHASES.findIndex((p) => p.id === phaseId);
            if (index !== -1) {
              setActivePhaseIndex(index);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.5,
      }
    );

    // Observe all phase sections
    TIMELINE_PHASES.forEach((phase) => {
      const el = document.getElementById(`mobile-phase-${phase.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Event handlers
  const handleEventSelect = useCallback((event: TimelineEvent) => {
    setSelectedEvent(event);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          'relative h-screen overflow-y-auto',
          'snap-y snap-mandatory',
          'bg-[var(--obsidian-900)]',
          // Hide scrollbar for cleaner look
          'scrollbar-hide',
          className
        )}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
        role="region"
        aria-label="Interactive timeline of Bharatvarsh history. Scroll vertically through phases."
      >
        {/* Phase Sections */}
        {TIMELINE_PHASES.map((phase, index) => {
          const phaseEvents = getEventsForPhase(events, phase);
          return (
            <TimelineVerticalPhase
              key={phase.id}
              phase={phase}
              events={phaseEvents}
              phaseIndex={index}
              totalPhases={TIMELINE_PHASES.length}
              isActive={activePhaseIndex === index}
              onEventSelect={handleEventSelect}
            />
          );
        })}
      </div>

      {/* Event Detail Modal - Reuse from horizontal timeline */}
      <AnimatePresence>
        {selectedEvent && (
          <TimelineEventModal
            event={selectedEvent}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </>
  );
};

TimelineVertical.displayName = 'TimelineVertical';

export default TimelineVertical;
