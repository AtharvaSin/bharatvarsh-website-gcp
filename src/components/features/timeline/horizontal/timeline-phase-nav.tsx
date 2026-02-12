'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { TimelinePhase } from '@/data/timeline-phases';
import { cn } from '@/lib/utils';

interface TimelinePhaseNavProps {
  phases: TimelinePhase[];
  activePhaseIndex: number;
  onPhaseClick: (phaseIndex: number) => void;
  className?: string;
}

/**
 * Phase navigation bar with clickable phase buttons
 * Shows active phase and allows quick jumping between phases
 */
export const TimelinePhaseNav: FC<TimelinePhaseNavProps> = ({
  phases,
  activePhaseIndex,
  onPhaseClick,
  className,
}) => {
  return (
    <nav
      className={cn(
        'flex items-center justify-center',
        'py-3 px-4',
        'bg-[var(--obsidian-800)]/90 backdrop-blur-md',
        'border-b border-[var(--obsidian-700)]',
        className
      )}
      aria-label="Timeline phases navigation"
    >
      <ul className="flex items-center gap-1 md:gap-2">
        {phases.map((phase, index) => {
          const isActive = activePhaseIndex === index;

          return (
            <li key={phase.id}>
              <motion.button
                onClick={() => onPhaseClick(index)}
                className={cn(
                  'relative px-3 py-1.5 md:px-4 md:py-2 rounded-full',
                  'text-xs md:text-sm font-medium',
                  'transition-colors duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mustard-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--obsidian-800)]',
                  isActive
                    ? 'text-[var(--navy-900)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                )}
                whileHover={{ scale: isActive ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-current={isActive ? 'true' : undefined}
              >
                {/* Background highlight for active phase */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-[var(--powder-300)]"
                    layoutId="activePhase"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Phase name */}
                <span className="relative z-10">{phase.shortName}</span>
              </motion.button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
