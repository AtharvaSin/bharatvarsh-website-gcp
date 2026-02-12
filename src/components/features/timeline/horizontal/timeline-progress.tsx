'use client';

import { FC, useState } from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';
import { cn } from '@/shared/utils';
import { TIMELINE_CONSTANTS } from '@/data/timeline-phases';

interface TimelineProgressProps {
  scrollProgress: MotionValue<number>;
  currentYear: MotionValue<number>;
  className?: string;
}

// Key milestone years with their names
const MILESTONES = [
  { year: 1905, label: 'Sindhu-Dakhin Concord' },
  { year: 1975, label: 'End of Democracy' },
  { year: 1985, label: 'Year-Turn Decree' },
];

// Calculate position as percentage of total timeline
const getYearPosition = (year: number): number => {
  const { START_YEAR, TOTAL_YEARS } = TIMELINE_CONSTANTS;
  return ((year - START_YEAR) / TOTAL_YEARS) * 100;
};

/**
 * Top progress bar showing scroll position and current year
 * Fixed at top of viewport during horizontal scroll
 */
export const TimelineProgress: FC<TimelineProgressProps> = ({
  scrollProgress,
  currentYear,
  className,
}) => {
  const [hoveredMilestone, setHoveredMilestone] = useState<number | null>(null);

  // Transform scroll progress to width percentage
  const progressWidth = useTransform(scrollProgress, [0, 1], ['0%', '100%']);

  // Transform current year to rounded integer for display
  const displayYear = useTransform(currentYear, (year) => Math.round(year));

  return (
    <div
      className={cn(
        'w-full h-8 bg-[var(--obsidian-900)]/95 backdrop-blur-sm',
        'border-b border-[var(--obsidian-700)]',
        className
      )}
    >
      {/* Progress Track */}
      <div className="relative h-1 bg-[var(--obsidian-700)]">
        {/* Progress Fill */}
        <motion.div
          className="absolute left-0 top-0 h-full rounded-r-full"
          style={{
            width: progressWidth,
            background:
              'linear-gradient(90deg, var(--mustard-500) 0%, var(--powder-400) 100%)',
          }}
        />

        {/* Milestone Markers */}
        {MILESTONES.map((milestone) => (
          <div
            key={milestone.year}
            className="absolute top-0 h-full group"
            style={{ left: `${getYearPosition(milestone.year)}%` }}
            onMouseEnter={() => setHoveredMilestone(milestone.year)}
            onMouseLeave={() => setHoveredMilestone(null)}
          >
            {/* Milestone tick mark */}
            <div
              className={cn(
                'absolute top-0 left-0 -translate-x-1/2 w-0.5 h-2',
                'bg-[var(--powder-400)]/60 transition-all duration-200',
                hoveredMilestone === milestone.year && 'bg-[var(--powder-400)] h-3'
              )}
            />

            {/* Milestone tooltip */}
            {hoveredMilestone === milestone.year && (
              <motion.div
                className={cn(
                  'absolute top-full left-1/2 -translate-x-1/2 mt-1 z-10',
                  'px-2 py-1 rounded',
                  'bg-[var(--obsidian-700)] text-[var(--text-primary)]',
                  'text-xs whitespace-nowrap',
                  'shadow-lg border border-[var(--obsidian-600)]'
                )}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
              >
                <span className="font-mono text-[var(--mustard-500)]">
                  {milestone.year}
                </span>
                <span className="text-[var(--text-muted)] mx-1">—</span>
                <span>{milestone.label}</span>
              </motion.div>
            )}
          </div>
        ))}

        {/* Current Position Indicator */}
        <motion.div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
            'w-3 h-3 rounded-full',
            'bg-[var(--mustard-500)]',
            'shadow-[0_0_10px_var(--mustard-500)]'
          )}
          style={{
            left: progressWidth,
          }}
        />
      </div>

      {/* Year Display */}
      <div className="relative flex items-center justify-between h-7 px-4">
        <span className="font-mono text-xs text-[var(--text-muted)]">
          {TIMELINE_CONSTANTS.START_YEAR}
        </span>

        {/* Current Year - Centered in bar area */}
        <motion.span
          className={cn(
            'font-mono text-sm font-bold',
            'text-[var(--mustard-500)]',
            'bg-[var(--obsidian-900)]/90 px-2 rounded'
          )}
        >
          {displayYear}
        </motion.span>

        <span className="font-mono text-xs text-[var(--text-muted)]">
          {TIMELINE_CONSTANTS.END_YEAR}
        </span>
      </div>
    </div>
  );
};
