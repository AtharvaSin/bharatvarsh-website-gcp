/**
 * Timeline Calculation Utilities
 * Functions for positioning events and calculating scroll progress
 */

import { TimelineEvent } from '@/types';
import { TIMELINE_CONSTANTS, TIMELINE_PHASES, TimelinePhase } from '@/content/data/timeline-phases';

/**
 * Calculate the total scrollable width based on number of phases
 * Each phase takes approximately one viewport width
 */
export function calculateTimelineWidth(phaseCount: number = TIMELINE_PHASES.length): number {
  return phaseCount * 100; // Returns percentage (500% for 5 phases)
}

/**
 * Convert a year to a normalized position (0-1) across the entire timeline
 */
export function yearToNormalizedPosition(year: number): number {
  const { START_YEAR, END_YEAR } = TIMELINE_CONSTANTS;
  const clampedYear = Math.max(START_YEAR, Math.min(END_YEAR, year));
  return (clampedYear - START_YEAR) / (END_YEAR - START_YEAR);
}

/**
 * Convert scroll progress (0-1) to a year
 */
export function scrollProgressToYear(progress: number): number {
  const { START_YEAR, END_YEAR } = TIMELINE_CONSTANTS;
  const clampedProgress = Math.max(0, Math.min(1, progress));
  return Math.round(START_YEAR + clampedProgress * (END_YEAR - START_YEAR));
}

/**
 * Calculate the horizontal position (in vw) for a specific year
 * Takes into account phase boundaries and distributes events proportionally
 */
export function yearToHorizontalPosition(year: number): number {
  const phaseIndex = getPhaseIndexForYear(year);
  const phase = TIMELINE_PHASES[phaseIndex];

  // Position within the phase (0-1)
  const phaseStart = phase.yearRange.start;
  const phaseEnd = phase.yearRange.end;
  const positionInPhase = (year - phaseStart) / (phaseEnd - phaseStart);

  // Each phase is 100vw, with events positioned within
  // Add padding (10vw on each side) to avoid edge placement
  const phaseWidthVw = 100;
  const paddingVw = 15;
  const usableWidth = phaseWidthVw - paddingVw * 2;

  return phaseIndex * phaseWidthVw + paddingVw + positionInPhase * usableWidth;
}

/**
 * Get the phase index for a given year
 */
export function getPhaseIndexForYear(year: number): number {
  for (let i = 0; i < TIMELINE_PHASES.length; i++) {
    const phase = TIMELINE_PHASES[i];
    if (year >= phase.yearRange.start && year <= phase.yearRange.end) {
      return i;
    }
    // Handle gaps between phases
    if (i < TIMELINE_PHASES.length - 1) {
      const nextPhase = TIMELINE_PHASES[i + 1];
      if (year > phase.yearRange.end && year < nextPhase.yearRange.start) {
        return i; // Assign to previous phase for gap years
      }
    }
  }
  return year < TIMELINE_PHASES[0].yearRange.start ? 0 : TIMELINE_PHASES.length - 1;
}

/**
 * Calculate phase index from scroll progress (0-1)
 */
export function scrollProgressToPhaseIndex(progress: number): number {
  const phaseCount = TIMELINE_PHASES.length;
  const index = Math.floor(progress * phaseCount);
  return Math.min(index, phaseCount - 1);
}

/**
 * Get scroll progress needed to reach a specific phase
 */
export function phaseIndexToScrollProgress(phaseIndex: number): number {
  const phaseCount = TIMELINE_PHASES.length;
  return phaseIndex / phaseCount;
}

/**
 * Get all events for a specific phase
 */
export function getEventsForPhase(
  events: TimelineEvent[],
  phase: TimelinePhase
): TimelineEvent[] {
  return events.filter((event) => phase.eventIds.includes(event.id));
}

/**
 * Calculate the scroll position (in pixels) to center on an event
 */
export function calculateScrollToEvent(
  eventYear: number,
  containerWidth: number,
  totalScrollWidth: number
): number {
  const normalizedPosition = yearToNormalizedPosition(eventYear);
  const targetPosition = normalizedPosition * totalScrollWidth;
  // Center the event in the viewport
  return Math.max(0, targetPosition - containerWidth / 2);
}

/**
 * Calculate the scroll position (in pixels) to reach a phase
 */
export function calculateScrollToPhase(
  phaseIndex: number,
  containerWidth: number
): number {
  return phaseIndex * containerWidth;
}

/**
 * Generate year markers for the timeline track
 * Returns key years to display (event years + milestone years)
 */
export function generateYearMarkers(events: TimelineEvent[]): number[] {
  const markers = new Set<number>();

  // Add event years
  events.forEach((event) => {
    markers.add(event.date.start_year);
    if (event.date.is_range && event.date.end_year !== event.date.start_year) {
      markers.add(event.date.end_year);
    }
  });

  // Add phase boundary years
  TIMELINE_PHASES.forEach((phase) => {
    markers.add(phase.yearRange.start);
  });

  // Add milestone years (every 50 years from 1750)
  for (let year = 1750; year <= 2022; year += 50) {
    if (year >= TIMELINE_CONSTANTS.START_YEAR && year <= TIMELINE_CONSTANTS.END_YEAR) {
      markers.add(year);
    }
  }

  return Array.from(markers).sort((a, b) => a - b);
}

/**
 * Determine marker size based on event significance
 */
export function getMarkerSize(significance: 1 | 2 | 3 | 4 | 5): 'sm' | 'md' | 'lg' {
  if (significance >= 5) return 'lg';
  if (significance >= 4) return 'md';
  return 'sm';
}

/**
 * Calculate opacity for parallax effect based on distance from viewport center
 */
export function calculateParallaxOpacity(
  elementPosition: number,
  scrollPosition: number,
  viewportWidth: number
): number {
  const distance = Math.abs(elementPosition - scrollPosition - viewportWidth / 2);
  const maxDistance = viewportWidth;
  const opacity = 1 - Math.min(distance / maxDistance, 1);
  return Math.max(0.3, opacity); // Minimum 30% opacity
}
