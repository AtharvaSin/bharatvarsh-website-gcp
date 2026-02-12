'use client';

import { FC, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TimelineTrackProps {
  startYear: number;
  endYear: number;
  phaseColor: string;
  className?: string;
}

/**
 * Horizontal timeline track with year markers
 * Displays a gradient line with tick marks at regular intervals
 */
export const TimelineTrack: FC<TimelineTrackProps> = ({
  startYear,
  endYear,
  phaseColor,
  className,
}) => {
  // Generate year markers for this phase
  const yearMarkers = useMemo(() => {
    const markers: number[] = [];
    const span = endYear - startYear;

    // Determine tick interval based on span
    let interval = 10;
    if (span > 50) interval = 25;
    if (span > 100) interval = 50;

    // Add markers
    for (let year = Math.ceil(startYear / interval) * interval; year <= endYear; year += interval) {
      if (year >= startYear) {
        markers.push(year);
      }
    }

    // Ensure start and end years are included
    if (!markers.includes(startYear)) markers.unshift(startYear);
    if (!markers.includes(endYear)) markers.push(endYear);

    return markers;
  }, [startYear, endYear]);

  // Calculate position for a year within this phase (0-100%)
  const getYearPosition = (year: number): number => {
    const span = endYear - startYear;
    if (span === 0) return 50;
    return ((year - startYear) / span) * 100;
  };

  return (
    <div
      className={cn(
        'relative w-full h-20',
        className
      )}
    >
      {/* Main Track Line */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1">
        {/* Background line */}
        <div className="absolute inset-0 bg-[var(--obsidian-600)] rounded-full" />

        {/* Gradient overlay */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(90deg,
              transparent 0%,
              ${phaseColor}40 20%,
              ${phaseColor}60 50%,
              ${phaseColor}40 80%,
              transparent 100%)`,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      {/* Year Markers */}
      {yearMarkers.map((year, index) => {
        const position = getYearPosition(year);
        const isEndpoint = index === 0 || index === yearMarkers.length - 1;

        return (
          <div
            key={year}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: `${position}%` }}
          >
            {/* Tick mark */}
            <motion.div
              className={cn(
                'w-0.5 bg-[var(--obsidian-500)]',
                isEndpoint ? 'h-6' : 'h-4'
              )}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            />

            {/* Year label (shown only for endpoints and major markers) */}
            {(isEndpoint || yearMarkers.length <= 5) && (
              <motion.span
                className={cn(
                  'absolute top-8 left-1/2 -translate-x-1/2',
                  'font-mono text-xs whitespace-nowrap',
                  isEndpoint
                    ? 'text-[var(--text-secondary)]'
                    : 'text-[var(--text-muted)]'
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 + 0.2, duration: 0.3 }}
              >
                {year}
              </motion.span>
            )}
          </div>
        );
      })}

      {/* Decorative glow effect */}
      <div
        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-8 pointer-events-none blur-xl opacity-20"
        style={{ backgroundColor: phaseColor }}
      />
    </div>
  );
};
