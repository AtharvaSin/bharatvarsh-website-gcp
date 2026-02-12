'use client';

import { FC, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { TimelineEvent } from '@/types';
import { TimelinePhase } from '@/content/data/timeline-phases';
import { cn } from '@/shared/utils';
import { GlyphWatermark } from '@/shared/ui';
import { useIsPortrait } from '@/shared/hooks/use-media-query';
import { TimelinePhaseHeader } from './timeline-phase-header';
import { TimelineTrack } from './timeline-track';
import { TimelineEventMarker } from './timeline-event-marker';
import { yearToHorizontalPosition } from '../../utils/timeline-calculations';

// Phase-specific glyph mapping for atmospheric effect
const PHASE_GLYPHS: Record<number, 'trishul' | 'mesh' | 'treaty' | 'chakra' | 'script' | 'grid'> = {
  0: 'script',    // Colonial Resistance - traditional script
  1: 'chakra',    // Rise of Polities - enlightenment wheel
  2: 'treaty',    // Unification & Democracy - unity symbol
  3: 'trishul',   // Civil Collapse - destruction/power
  4: 'mesh',      // Military Control - surveillance mesh
};

// Phase-specific glyph colors
const PHASE_GLYPH_COLORS: Record<number, string> = {
  0: 'var(--mustard-500)',    // Golden for colonial era
  1: 'var(--event-era)',      // Purple for polities
  2: 'var(--event-governance)', // Green for democracy
  3: 'var(--status-alert)',   // Red for collapse
  4: 'var(--powder-500)',     // Blue for military
};

interface TimelinePhaseSectionProps {
  phase: TimelinePhase;
  events: TimelineEvent[];
  isActive: boolean;
  phaseIndex: number;
  hoveredEventId: number | null;
  onEventHover: (eventId: number | null) => void;
  onEventSelect: (eventId: number) => void;
  prefersReducedMotion: boolean;
}

/**
 * Individual phase section within the horizontal timeline
 * Contains the phase header, timeline track, and event markers
 */
export const TimelinePhaseSection: FC<TimelinePhaseSectionProps> = ({
  phase,
  events,
  isActive,
  phaseIndex,
  hoveredEventId,
  onEventHover,
  onEventSelect,
  prefersReducedMotion,
}) => {
  // Orientation-aware image selection
  const isPortrait = useIsPortrait();
  const currentBackgroundImage = isPortrait && phase.backgroundImagePortrait
    ? phase.backgroundImagePortrait
    : phase.backgroundImage;

  // Calculate event positions within this phase with collision detection
  const eventPositions = useMemo(() => {
    // Calculate base positions
    const basePositions = events.map((event) => ({
      event,
      position: yearToHorizontalPosition(event.date.start_year) - phaseIndex * 100,
    }));

    // Detect and resolve overlaps
    const OVERLAP_THRESHOLD = 2; // vw units - events within this are considered overlapping
    const OFFSET_AMOUNT = 5; // vw units to separate overlapping events

    // Sort by position for consistent ordering, then by event id for stability
    basePositions.sort((a, b) => {
      const posDiff = a.position - b.position;
      if (Math.abs(posDiff) < 0.1) {
        return a.event.id - b.event.id;
      }
      return posDiff;
    });

    // Track positions and apply offsets
    const resolvedPositions = basePositions.map((item, index) => {
      let offset = 0;

      // Check for previous events at similar positions
      for (let i = 0; i < index; i++) {
        const prevPos = basePositions[i].position;
        if (Math.abs(item.position - prevPos) < OVERLAP_THRESHOLD) {
          offset += OFFSET_AMOUNT;
        }
      }

      return {
        ...item,
        position: item.position + offset,
      };
    });

    return resolvedPositions;
  }, [events, phaseIndex]);

  return (
    <section
      id={`phase-${phase.id}`}
      className={cn(
        'relative w-screen flex-shrink-0',
        'flex flex-col'
      )}
      style={{
        // Use explicit calc instead of percentage - percentage heights don't work in flex containers
        height: 'var(--timeline-content-height, calc(100vh - 4rem - 6rem))',
        minHeight: 'var(--timeline-content-height, calc(100vh - 4rem - 6rem))',
      }}
      aria-label={`Phase: ${phase.name} (${phase.yearRange.start}-${phase.yearRange.end})`}
    >
      {/* Background Artwork Layer - Orientation-aware */}
      <div className="absolute inset-0 z-0">
        {currentBackgroundImage && (
          <Image
            src={currentBackgroundImage}
            alt=""
            fill
            className={cn(
              'object-cover transition-opacity duration-500',
              isPortrait ? 'object-center' : 'object-center'
            )}
            sizes="100vw"
            priority={phaseIndex <= 1}
            quality={85}
          />
        )}

        {/* Dark gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--obsidian-900)]/70 via-[var(--obsidian-900)]/50 to-[var(--obsidian-900)]/80" />

        {/* Additional overlay in header area for better contrast */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[var(--obsidian-900)]/60 to-transparent" />

        {/* Phase-specific Glyph Watermark */}
        <GlyphWatermark
          glyph={PHASE_GLYPHS[phaseIndex] || 'chakra'}
          opacity={isActive ? 0.04 : 0.02}
          size="60%"
          position="center"
          color={PHASE_GLYPH_COLORS[phaseIndex] || 'var(--powder-500)'}
          animate={isActive && !prefersReducedMotion}
          animationType="pulse"
        />
      </div>

      {/* Phase Background with Enhanced Gradient & Pattern */}
      <motion.div
        className="absolute inset-0 z-[1]"
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0.3 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
      >
        {/* Base gradient */}
        <div
          className={cn('absolute inset-0 bg-gradient-to-r', phase.backgroundGradient)}
        />

        {/* Pattern overlay based on phase */}
        {phaseIndex === 0 && (
          /* Colonial Resistance - Aged paper/scroll texture */
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                radial-gradient(ellipse at 20% 30%, rgba(241,194,50,0.15) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 70%, rgba(241,194,50,0.1) 0%, transparent 40%),
                url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F1C232' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
              `,
            }}
          />
        )}
        {phaseIndex === 1 && (
          /* Rise of Polities - Radiating rays */
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                conic-gradient(from 180deg at 50% 120%,
                  transparent 0deg,
                  rgba(139,92,246,0.1) 20deg,
                  transparent 40deg,
                  rgba(139,92,246,0.08) 60deg,
                  transparent 80deg,
                  rgba(139,92,246,0.1) 100deg,
                  transparent 120deg
                ),
                radial-gradient(ellipse at 50% 150%, rgba(139,92,246,0.2) 0%, transparent 60%)
              `,
            }}
          />
        )}
        {phaseIndex === 2 && (
          /* Unification & Democracy - Grid/mesh pattern */
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(16,185,129,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(16,185,129,0.1) 1px, transparent 1px),
                radial-gradient(ellipse at 30% 50%, rgba(16,185,129,0.15) 0%, transparent 50%)
              `,
              backgroundSize: '60px 60px, 60px 60px, 100% 100%',
            }}
          />
        )}
        {phaseIndex === 3 && (
          /* Civil Collapse - Crack/fracture pattern */
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `
                url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10 L30 25 L25 50 L45 55 L40 80 L60 90' stroke='%23DC2626' stroke-width='1' fill='none' opacity='0.3'/%3E%3Cpath d='M70 5 L65 30 L80 45 L75 70 L90 85' stroke='%23DC2626' stroke-width='1' fill='none' opacity='0.25'/%3E%3C/svg%3E"),
                radial-gradient(ellipse at 50% 50%, rgba(220,38,38,0.15) 0%, transparent 70%)
              `,
            }}
          />
        )}
        {phaseIndex === 4 && (
          /* Military Control - Tech grid/digital mesh */
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(11,39,66,0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(11,39,66,0.3) 1px, transparent 1px),
                radial-gradient(circle at 20% 80%, rgba(23,208,227,0.1) 0%, transparent 30%),
                radial-gradient(circle at 80% 20%, rgba(23,208,227,0.1) 0%, transparent 30%)
              `,
              backgroundSize: '40px 40px, 40px 40px, 100% 100%, 100% 100%',
            }}
          />
        )}
      </motion.div>

      {/* Phase Header - Upper portion, centered */}
      <div className="flex-[3] flex items-center justify-center relative z-10 px-8">
        <TimelinePhaseHeader
          phase={phase}
          phaseIndex={phaseIndex}
          isActive={isActive}
          prefersReducedMotion={prefersReducedMotion}
        />
      </div>

      {/* Timeline Track Area - Lower portion */}
      <div className="flex-[2] flex flex-col justify-center relative px-8 z-10">
        {/* Stylish Dark Strip Background for Track Legibility */}
        <div className="absolute inset-x-0 inset-y-0 overflow-hidden">
          {/* Main dark strip */}
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-32"
            style={{
              background: `linear-gradient(180deg,
                transparent 0%,
                rgba(10,13,18,0.6) 15%,
                rgba(10,13,18,0.85) 40%,
                rgba(10,13,18,0.85) 60%,
                rgba(10,13,18,0.6) 85%,
                transparent 100%)`,
            }}
          />

          {/* Subtle accent line at top edge */}
          <motion.div
            className="absolute inset-x-0 top-1/2 h-px"
            style={{
              marginTop: '-4rem',
              background: `linear-gradient(90deg,
                transparent 0%,
                ${phase.themeColor}20 20%,
                ${phase.themeColor}40 50%,
                ${phase.themeColor}20 80%,
                transparent 100%)`,
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: isActive ? 1 : 0.5 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: 0.2 }}
          />

          {/* Subtle accent line at bottom edge */}
          <motion.div
            className="absolute inset-x-0 top-1/2 h-px"
            style={{
              marginTop: '4rem',
              background: `linear-gradient(90deg,
                transparent 0%,
                ${phase.themeColor}15 20%,
                ${phase.themeColor}30 50%,
                ${phase.themeColor}15 80%,
                transparent 100%)`,
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: isActive ? 1 : 0.5 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: 0.3 }}
          />

          {/* Soft inner glow for depth */}
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-24 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 80% 100% at 50% 50%,
                ${phase.themeColor}08 0%,
                transparent 70%)`,
            }}
          />
        </div>

        {/* The Track Line */}
        <div className="relative">
          <TimelineTrack
            startYear={phase.yearRange.start}
            endYear={phase.yearRange.end}
            phaseColor={phase.themeColor}
          />

          {/* Event Markers positioned relative to track */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
            {eventPositions.map(({ event, position }) => (
              <TimelineEventMarker
                key={event.id}
                event={event}
                positionVw={position}
                isHovered={hoveredEventId === event.id}
                onHover={() => onEventHover(event.id)}
                onLeave={() => onEventHover(null)}
                onClick={() => onEventSelect(event.id)}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </div>
        </div>

        {/* Phase Year Range Indicator */}
        <div className="flex justify-between px-8 mt-8 pointer-events-none">
          <span
            className={cn(
              'font-mono text-sm tracking-wider',
              'text-[var(--text-muted)]'
            )}
          >
            {phase.yearRange.start}
          </span>
          <span
            className={cn(
              'font-mono text-sm tracking-wider',
              'text-[var(--text-muted)]'
            )}
          >
            {phase.yearRange.end}
          </span>
        </div>
      </div>
    </section>
  );
};
