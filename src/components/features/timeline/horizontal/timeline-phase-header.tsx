'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { Scroll, Scale, Landmark, Flame, Shield } from 'lucide-react';
import { TimelinePhase } from '@/content/data/timeline-phases';
import { cn } from '@/shared/utils';

// Era-specific emblems
const PHASE_EMBLEMS = [
  { Icon: Scroll, label: 'Scroll' }, // Colonial Resistance
  { Icon: Scale, label: 'Scales' }, // Rise of Polities
  { Icon: Landmark, label: 'Capitol' }, // Unification & Democracy
  { Icon: Flame, label: 'Flames' }, // Civil Collapse
  { Icon: Shield, label: 'Shield' }, // Military Control
];

interface TimelinePhaseHeaderProps {
  phase: TimelinePhase;
  phaseIndex: number;
  isActive: boolean;
  prefersReducedMotion: boolean;
  className?: string;
}

/**
 * Phase header with name and tagline
 * Positioned at center of viewport for dramatic effect
 */
export const TimelinePhaseHeader: FC<TimelinePhaseHeaderProps> = ({
  phase,
  phaseIndex,
  isActive,
  prefersReducedMotion,
  className,
}) => {
  const Emblem = PHASE_EMBLEMS[phaseIndex]?.Icon;

  return (
    <motion.header
      className={cn(
        'relative flex flex-col items-center justify-center',
        'text-center',
        'pointer-events-none',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: isActive ? 1 : 0.3,
        scale: isActive ? 1 : 0.98,
      }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.5,
        ease: 'easeOut',
      }}
    >
      {/* Decorative Emblem Watermark - Centered behind content */}
      {Emblem && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: isActive ? 0.06 : 0.02,
            scale: isActive ? 1 : 0.9,
          }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.6,
            ease: 'easeOut',
          }}
        >
          <Emblem
            className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80"
            style={{ color: phase.themeColor }}
            strokeWidth={0.5}
            aria-hidden="true"
          />
        </motion.div>
      )}

      {/* Phase number */}
      <motion.span
        className={cn(
          'block font-mono text-xs uppercase tracking-[0.3em]',
          'text-[var(--text-muted)] mb-3'
        )}
        style={{ color: phase.themeColor }}
      >
        Phase {phaseIndex + 1}
      </motion.span>

      {/* Phase name */}
      <h2
        className={cn(
          'font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl',
          'text-[var(--text-primary)]',
          'leading-none tracking-tight'
        )}
      >
        {phase.name.split(' ').map((word, i) => (
          <motion.span
            key={i}
            className="inline-block mx-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: prefersReducedMotion ? 0 : i * 0.1,
              duration: prefersReducedMotion ? 0 : 0.5,
            }}
          >
            {word}
          </motion.span>
        ))}
      </h2>

      {/* Tagline */}
      <motion.p
        className={cn(
          'mt-6 text-lg md:text-xl lg:text-2xl',
          'text-[var(--text-secondary)]',
          'leading-relaxed max-w-2xl'
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 0.9 : 0.5 }}
        transition={{
          delay: prefersReducedMotion ? 0 : 0.3,
          duration: prefersReducedMotion ? 0 : 0.5,
        }}
      >
        &ldquo;{phase.tagline}&rdquo;
      </motion.p>

      {/* Year range indicator */}
      <motion.div
        className="flex items-center justify-center gap-3 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0.3 }}
        transition={{
          delay: prefersReducedMotion ? 0 : 0.4,
          duration: prefersReducedMotion ? 0 : 0.5,
        }}
      >
        <div
          className="w-12 h-0.5 rounded-full"
          style={{ backgroundColor: phase.themeColor }}
        />
        <span className="font-mono text-base text-[var(--text-muted)]">
          {phase.yearRange.start} — {phase.yearRange.end}
        </span>
        <div
          className="w-12 h-0.5 rounded-full"
          style={{ backgroundColor: phase.themeColor }}
        />
      </motion.div>
    </motion.header>
  );
};
