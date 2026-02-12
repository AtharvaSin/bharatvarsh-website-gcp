'use client';

import { FC, useRef, useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion, useMotionValueEvent } from 'framer-motion';
import { TimelineEvent } from '@/types';
import { TIMELINE_PHASES, TIMELINE_CONSTANTS } from '@/data/timeline-phases';
import { getEventsForPhase } from '../utils/timeline-calculations';
import { useHorizontalScroll } from '../hooks/use-horizontal-scroll';
import { useDragToScroll } from '../hooks/use-drag-to-scroll';
import { useIsMobile, usePrefersReducedMotion } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { TimelineVertical } from '../vertical';
import { TimelinePhaseSection } from './timeline-phase';
import { TimelineProgress } from './timeline-progress';
import { TimelinePhaseNav } from './timeline-phase-nav';
import { TimelineNavigationControls } from './timeline-navigation-controls';
import { TimelineEventModal } from './timeline-event-modal';
import { TimelineOnboarding } from './timeline-onboarding';
import { TimelineScrollHint } from './timeline-scroll-hint';

interface TimelineHorizontalProps {
  events: TimelineEvent[];
  className?: string;
}

/**
 * Main horizontal timeline component
 * Renders a continuous horizontal scroll experience with phases
 * Falls back to vertical layout on mobile devices
 */
export const TimelineHorizontal: FC<TimelineHorizontalProps> = ({
  events,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();

  // State for interactions
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [hoveredEventId, setHoveredEventId] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showScrollHint, setShowScrollHint] = useState(true);

  // Horizontal scroll hook
  const {
    scrollXProgress,
    currentYear,
    currentPhaseIndex,
    scrollToPhase,
  } = useHorizontalScroll({ containerRef });

  // Drag-to-scroll functionality
  const {
    isDragging,
    onPanStart,
    onPan,
    onPanEnd,
    cursorClass,
  } = useDragToScroll({
    containerRef,
    enabled: true,
    decayRate: 0.95,
    minVelocity: 50,
  });

  // Update active phase based on scroll
  useMotionValueEvent(currentPhaseIndex, 'change', (latest) => {
    setActivePhaseIndex(Math.round(latest));
  });

  // Dismiss onboarding and scroll hint after user scrolls
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollLeft > 100) {
        if (showOnboarding) setShowOnboarding(false);
        if (showScrollHint) setShowScrollHint(false);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [showOnboarding, showScrollHint]);

  // Event handlers
  const handleEventHover = useCallback((eventId: number | null) => {
    setHoveredEventId(eventId);
  }, []);

  const handleEventSelect = useCallback(
    (eventId: number) => {
      const event = events.find((e) => e.id === eventId);
      if (event) {
        setSelectedEvent(event);
      }
    },
    [events]
  );

  const handleCloseModal = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  const handlePhaseClick = useCallback(
    (phaseIndex: number) => {
      scrollToPhase(phaseIndex);
    },
    [scrollToPhase]
  );

  // Navigation control handlers - MUST be before any early returns
  const handlePreviousPhase = useCallback(() => {
    if (activePhaseIndex > 0) {
      scrollToPhase(activePhaseIndex - 1);
    }
  }, [activePhaseIndex, scrollToPhase]);

  const handleNextPhase = useCallback(() => {
    if (activePhaseIndex < TIMELINE_PHASES.length - 1) {
      scrollToPhase(activePhaseIndex + 1);
    }
  }, [activePhaseIndex, scrollToPhase]);

  // Render vertical layout on mobile
  if (isMobile) {
    return <TimelineVertical events={events} className={className} />;
  }

  return (
    <div
      className={cn(
        'relative min-h-screen flex flex-col',
        'bg-[var(--obsidian-900)]',
        'pt-16 md:pt-20', // Space for site header (h-16 md:h-20)
        className
      )}
    >
      {/* Sticky Timeline Sub-Header (below site header) */}
      <div className="sticky top-16 md:top-20 left-0 right-0 z-40">
        {/* Progress Bar */}
        <TimelineProgress
          scrollProgress={scrollXProgress}
          currentYear={currentYear}
        />

        {/* Phase Navigation */}
        <TimelinePhaseNav
          phases={TIMELINE_PHASES}
          activePhaseIndex={activePhaseIndex}
          onPhaseClick={handlePhaseClick}
        />
      </div>

      {/* Horizontal Scroll Container with Drag-to-Pan */}
      <motion.main
        ref={containerRef}
        onPanStart={onPanStart}
        onPan={onPan}
        onPanEnd={onPanEnd}
        className={cn(
          'flex-1 overflow-x-auto overflow-y-hidden',
          'scrollbar-hide',
          cursorClass,
          isDragging && 'select-none'
        )}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          touchAction: 'pan-y', // Allow vertical scroll on touch devices
          height: 'calc(100vh - 4rem - 6rem)', // Viewport - site header - timeline header
          minHeight: 'calc(100vh - 4rem - 6rem)',
          // CSS variable for child components to use explicit height
          '--timeline-content-height': 'calc(100vh - 4rem - 6rem)',
        } as React.CSSProperties}
        role="region"
        aria-label="Interactive historical timeline of Bharatvarsh. Drag or scroll horizontally to explore."
      >
        <div
          className="flex items-stretch"
          style={{
            width: `${TIMELINE_PHASES.length * 100}vw`,
            height: '100%',
          }}
        >
          {TIMELINE_PHASES.map((phase, index) => {
            const phaseEvents = getEventsForPhase(events, phase);
            return (
              <TimelinePhaseSection
                key={phase.id}
                phase={phase}
                events={phaseEvents}
                isActive={activePhaseIndex === index}
                phaseIndex={index}
                hoveredEventId={hoveredEventId}
                onEventHover={handleEventHover}
                onEventSelect={handleEventSelect}
                prefersReducedMotion={prefersReducedMotion}
              />
            );
          })}
        </div>
      </motion.main>

      {/* Navigation Controls */}
      <TimelineNavigationControls
        currentPhaseIndex={activePhaseIndex}
        totalPhases={TIMELINE_PHASES.length}
        onPrevious={handlePreviousPhase}
        onNext={handleNextPhase}
      />

      {/* Hidden description for screen readers */}
      <p id="timeline-description" className="sr-only">
        Navigate through {TIMELINE_CONSTANTS.TOTAL_YEARS} years of history from{' '}
        {TIMELINE_CONSTANTS.START_YEAR} to {TIMELINE_CONSTANTS.END_YEAR}. Use
        horizontal scroll or arrow keys to explore. Click on events to view
        details.
      </p>

      {/* Subtle scroll left hint */}
      <TimelineScrollHint
        visible={showScrollHint}
        direction="left"
      />

      {/* Onboarding Overlay */}
      <TimelineOnboarding
        visible={showOnboarding}
        onDismiss={() => setShowOnboarding(false)}
      />

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <TimelineEventModal event={selectedEvent} onClose={handleCloseModal} />
        )}
      </AnimatePresence>
    </div>
  );
};
