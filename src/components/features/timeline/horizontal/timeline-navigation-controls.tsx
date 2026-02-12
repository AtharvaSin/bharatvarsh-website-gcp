'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineNavigationControlsProps {
  currentPhaseIndex: number;
  totalPhases: number;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
}

/**
 * Floating navigation controls for explicit phase navigation
 * Provides previous/next buttons at the bottom of the timeline
 */
export const TimelineNavigationControls: FC<TimelineNavigationControlsProps> = ({
  currentPhaseIndex,
  totalPhases,
  onPrevious,
  onNext,
  className,
}) => {
  const isAtStart = currentPhaseIndex === 0;
  const isAtEnd = currentPhaseIndex === totalPhases - 1;

  return (
    <motion.div
      className={cn(
        'fixed bottom-8 left-1/2 -translate-x-1/2 z-40',
        'flex items-center gap-4',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      {/* Previous Phase Button */}
      <motion.button
        onClick={onPrevious}
        disabled={isAtStart}
        className={cn(
          'flex items-center gap-2 px-4 py-3',
          'rounded-xl',
          'bg-[var(--obsidian-800)]/90 backdrop-blur-md',
          'border border-[var(--obsidian-600)]',
          'text-[var(--text-primary)]',
          'transition-all duration-200',
          isAtStart
            ? 'opacity-40 cursor-not-allowed'
            : 'hover:bg-[var(--obsidian-700)] hover:border-[var(--obsidian-500)] hover:scale-105',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mustard-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
        )}
        whileTap={isAtStart ? undefined : { scale: 0.95 }}
        aria-label="Previous phase"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">Previous</span>
      </motion.button>

      {/* Phase Indicator */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--obsidian-900)]/80 backdrop-blur-sm border border-[var(--obsidian-700)]">
        <span className="text-sm font-mono text-[var(--text-secondary)]">
          Phase
        </span>
        <span className="text-sm font-mono font-bold text-[var(--mustard-500)]">
          {currentPhaseIndex + 1}
        </span>
        <span className="text-sm font-mono text-[var(--text-muted)]">
          / {totalPhases}
        </span>
      </div>

      {/* Next Phase Button */}
      <motion.button
        onClick={onNext}
        disabled={isAtEnd}
        className={cn(
          'flex items-center gap-2 px-4 py-3',
          'rounded-xl',
          'bg-[var(--obsidian-800)]/90 backdrop-blur-md',
          'border border-[var(--obsidian-600)]',
          'text-[var(--text-primary)]',
          'transition-all duration-200',
          isAtEnd
            ? 'opacity-40 cursor-not-allowed'
            : 'hover:bg-[var(--obsidian-700)] hover:border-[var(--obsidian-500)] hover:scale-105',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mustard-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
        )}
        whileTap={isAtEnd ? undefined : { scale: 0.95 }}
        aria-label="Next phase"
      >
        <span className="text-sm font-medium hidden sm:inline">Next</span>
        <ChevronRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
};

export default TimelineNavigationControls;
