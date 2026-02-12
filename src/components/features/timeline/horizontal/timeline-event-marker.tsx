'use client';

import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { TimelineEvent } from '@/types';
import { getMarkerSize } from '../utils/timeline-calculations';
import { cn } from '@/lib/utils';
import { TimelineEventTooltip } from './timeline-event-tooltip';

interface TimelineEventMarkerProps {
  event: TimelineEvent;
  positionVw: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
  prefersReducedMotion: boolean;
}

/**
 * Clickable event marker on the timeline track
 * Shows tooltip on hover and opens modal on click
 */
export const TimelineEventMarker: FC<TimelineEventMarkerProps> = ({
  event,
  positionVw,
  isHovered,
  onHover,
  onLeave,
  onClick,
  prefersReducedMotion,
}) => {
  const markerSize = getMarkerSize(event.metadata.significance);

  // Responsive size classes based on significance - larger for better visibility
  const sizeClasses = {
    sm: 'w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12',    // 32-48px
    md: 'w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14',  // 40-56px
    lg: 'w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16',  // 48-64px
  };

  // Responsive ring size classes
  const ringSizeClasses = {
    sm: 'w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20',
    md: 'w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24',
    lg: 'w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28',
  };

  return (
    <motion.div
      className="absolute top-1/2 -translate-y-1/2"
      style={{ left: `${positionVw}vw` }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
    >
      {/* Outer glow ring (animated on hover + pulse for significant events) */}
      <motion.div
        className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'rounded-full pointer-events-none',
          ringSizeClasses[markerSize]
        )}
        style={{
          backgroundColor: event.media.color,
          filter: 'blur(8px)',
        }}
        animate={{
          opacity: isHovered ? 0.5 : (event.metadata.significance >= 4 ? [0.15, 0.25, 0.15] : 0),
          scale: isHovered ? 1.3 : (event.metadata.significance >= 4 ? [1, 1.1, 1] : 1),
        }}
        transition={
          isHovered
            ? { duration: prefersReducedMotion ? 0 : 0.2 }
            : {
                duration: prefersReducedMotion ? 0 : 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
      />

      {/* Inner pulse ring for high significance events */}
      {event.metadata.significance >= 4 && !prefersReducedMotion && (
        <motion.div
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'rounded-full pointer-events-none border-2',
            sizeClasses[markerSize]
          )}
          style={{
            borderColor: event.media.color,
          }}
          animate={{
            opacity: [0.6, 0, 0.6],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}

      {/* Main marker button */}
      <motion.button
        className={cn(
          'relative rounded-full cursor-pointer overflow-hidden',
          'flex items-center justify-center',
          'border-2 border-white/20',
          'transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mustard-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--obsidian-900)]',
          sizeClasses[markerSize],
          isHovered && 'border-white/50'
        )}
        style={{
          backgroundColor: event.media.color,
          boxShadow: isHovered
            ? `0 0 20px ${event.media.color}60`
            : `0 0 10px ${event.media.color}30`,
        }}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        onClick={onClick}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.15 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
        aria-label={`${event.title}, ${event.date.original}. ${event.metadata.event_type} event. Significance: ${event.metadata.significance} out of 5. Click to view details.`}
      >
        {/* Image thumbnail or inner dot fallback */}
        {event.media.image ? (
          <div className="relative w-full h-full">
            <Image
              src={event.media.image}
              alt=""
              fill
              className="object-cover"
              sizes="40px"
            />
            {/* Subtle overlay for consistency */}
            <div
              className="absolute inset-0 mix-blend-overlay"
              style={{ backgroundColor: `${event.media.color}40` }}
            />
          </div>
        ) : (
          <motion.div
            className="w-2 h-2 rounded-full bg-white/50"
            animate={{
              scale: isHovered ? 0.8 : 1,
              opacity: isHovered ? 1 : 0.5,
            }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          />
        )}
      </motion.button>

      {/* Year label below marker - responsive sizing */}
      <motion.div
        className={cn(
          'absolute top-full left-1/2 -translate-x-1/2',
          'mt-4 md:mt-5 lg:mt-6',
          'text-center whitespace-nowrap'
        )}
        animate={{
          opacity: isHovered ? 1 : 0.7,
          y: isHovered ? 0 : 4,
        }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
      >
        <span className="font-mono text-xs md:text-sm text-[var(--text-secondary)]">
          {event.date.is_range
            ? `${event.date.start_year}-${event.date.end_year}`
            : event.date.start_year}
        </span>
        <p
          className={cn(
            'text-xs md:text-sm lg:text-base font-medium mt-1',
            'max-w-[120px] md:max-w-[150px] lg:max-w-[180px]',
            'text-[var(--text-primary)] leading-tight',
            'line-clamp-2'
          )}
        >
          {event.title}
        </p>
      </motion.div>

      {/* Tooltip (positioned above marker) */}
      <AnimatePresence>
        {isHovered && (
          <TimelineEventTooltip
            event={event}
            prefersReducedMotion={prefersReducedMotion}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
