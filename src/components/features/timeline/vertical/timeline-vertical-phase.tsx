'use client';

import { FC } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils';
import { GlyphWatermark } from '@/shared/ui';
import { TimelinePhase } from '@/data/timeline-phases';
import { TimelineEvent } from '@/types';
import { TimelineVerticalEventCard } from './timeline-vertical-event-card';

// Phase-specific glyph mapping (consistent with horizontal timeline)
const PHASE_GLYPHS: Record<number, 'trishul' | 'mesh' | 'treaty' | 'chakra' | 'script' | 'grid'> = {
  0: 'script',   // Colonial Resistance
  1: 'chakra',   // Rise of Polities
  2: 'treaty',   // Unification & Democracy
  3: 'trishul',  // Civil Collapse
  4: 'mesh',     // Military Control
};

const PHASE_GLYPH_COLORS: Record<number, string> = {
  0: 'var(--mustard-500)',
  1: 'var(--event-era)',
  2: 'var(--event-governance)',
  3: 'var(--status-alert)',
  4: 'var(--powder-500)',
};

interface TimelineVerticalPhaseProps {
  phase: TimelinePhase;
  events: TimelineEvent[];
  phaseIndex: number;
  totalPhases: number;
  isActive: boolean;
  onEventSelect: (event: TimelineEvent) => void;
}

/**
 * Full-viewport phase section for mobile vertical timeline
 * Displays phase background with scrollable event cards overlay
 */
export const TimelineVerticalPhase: FC<TimelineVerticalPhaseProps> = ({
  phase,
  events,
  phaseIndex,
  totalPhases,
  isActive,
  onEventSelect,
}) => {
  // Use portrait image for mobile, fallback to landscape
  const backgroundImage = phase.backgroundImagePortrait || phase.backgroundImage;

  return (
    <section
      id={`mobile-phase-${phase.id}`}
      className={cn(
        'relative w-full min-h-screen flex-shrink-0',
        'snap-start snap-always',
        'overflow-hidden'
      )}
      aria-label={`Phase ${phaseIndex + 1}: ${phase.name} (${phase.yearRange.start}-${phase.yearRange.end})`}
    >
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage}
          alt={`${phase.name} era background`}
          fill
          className="object-cover"
          sizes="100vw"
          priority={phaseIndex <= 1}
          quality={85}
        />

        {/* Dark gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--obsidian-900)]/85 via-[var(--obsidian-900)]/50 to-[var(--obsidian-900)]/85" />

        {/* Glyph Watermark */}
        <GlyphWatermark
          glyph={PHASE_GLYPHS[phaseIndex] || 'chakra'}
          opacity={isActive ? 0.06 : 0.03}
          size="70%"
          position="center"
          color={PHASE_GLYPH_COLORS[phaseIndex] || 'var(--powder-500)'}
          animate={false} // Disable animation on mobile for performance
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen flex flex-col px-4 pt-24 pb-6 safe-area-y">
        {/* Phase Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 flex-shrink-0"
        >
          {/* Phase Number */}
          <span className="inline-block font-mono text-xs tracking-[0.3em] text-[var(--text-muted)] mb-2 uppercase">
            Phase {phaseIndex + 1} of {totalPhases}
          </span>

          {/* Year Range */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="font-mono text-base tracking-wider text-[var(--powder-400)]">
              {phase.yearRange.start}
            </span>
            <span className="w-12 h-px bg-gradient-to-r from-transparent via-[var(--powder-500)]/50 to-transparent" />
            <span className="font-mono text-base tracking-wider text-[var(--powder-400)]">
              {phase.yearRange.end}
            </span>
          </div>

          {/* Phase Name */}
          <h2
            className={cn(
              'font-display text-3xl sm:text-4xl tracking-wide uppercase mb-2',
              'text-[var(--text-primary)]'
            )}
            style={{ color: phase.themeColor }}
          >
            {phase.name}
          </h2>

          {/* Tagline */}
          <p className="text-sm text-[var(--text-secondary)] italic max-w-xs mx-auto">
            {phase.tagline}
          </p>
        </motion.header>

        {/* Events List - Scrollable within phase */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4 -mx-1 px-1 scrollbar-hide">
          {events.length > 0 ? (
            events.map((event, index) => (
              <TimelineVerticalEventCard
                key={event.id}
                event={event}
                index={index}
                onSelect={() => onEventSelect(event)}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center h-32"
            >
              <p className="text-[var(--text-muted)] text-sm italic">
                No major events recorded in this period
              </p>
            </motion.div>
          )}
        </div>

        {/* Phase Indicator Dots */}
        <div className="flex justify-center gap-2 pt-4 flex-shrink-0">
          {[...Array(totalPhases)].map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                i === phaseIndex
                  ? 'bg-[var(--powder-400)] scale-125'
                  : 'bg-[var(--obsidian-600)]'
              )}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

TimelineVerticalPhase.displayName = 'TimelineVerticalPhase';
