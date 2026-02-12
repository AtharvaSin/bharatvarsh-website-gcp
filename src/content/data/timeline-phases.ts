/**
 * Timeline Phases Configuration
 * Organizes the 9 timeline events into 5 historical phases
 */

import { EventType } from '@/types';

export interface TimelinePhase {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  yearRange: {
    start: number;
    end: number;
  };
  themeColor: string;
  backgroundGradient: string;
  backgroundImage: string;
  /** Portrait variant of background image for mobile devices in portrait orientation */
  backgroundImagePortrait?: string;
  eventIds: number[];
}

export const TIMELINE_PHASES: TimelinePhase[] = [
  {
    id: 'colonial-resistance',
    name: 'Colonial Resistance',
    shortName: 'Resistance',
    tagline: 'A single decision that changed history',
    yearRange: { start: 1717, end: 1789 },
    themeColor: 'var(--event-economic)',
    backgroundGradient: 'from-amber-900/20 via-transparent to-transparent',
    backgroundImage: '/images/timeline/phases/phase-1-colonial-resistance.webp',
    backgroundImagePortrait: '/images/timeline/mobile/phase-1.webp',
    eventIds: [1],
  },
  {
    id: 'rise-of-polities',
    name: 'Rise of Polities',
    shortName: 'Polities',
    tagline: 'Enlightenment and divergence shape new powers',
    yearRange: { start: 1790, end: 1904 },
    themeColor: 'var(--event-era)',
    backgroundGradient: 'from-purple-900/20 via-transparent to-transparent',
    backgroundImage: '/images/timeline/phases/phase-2-rise-of-polities.webp',
    backgroundImagePortrait: '/images/timeline/mobile/phase-2.webp',
    eventIds: [2, 3],
  },
  {
    id: 'unification-democracy',
    name: 'Unification & Democracy',
    shortName: 'Democracy',
    tagline: 'The great experiment of collective governance',
    yearRange: { start: 1905, end: 1974 },
    themeColor: 'var(--event-governance)',
    backgroundGradient: 'from-emerald-900/20 via-transparent to-transparent',
    backgroundImage: '/images/timeline/phases/phase-3-unification-democracy.webp',
    backgroundImagePortrait: '/images/timeline/mobile/phase-3.webp',
    eventIds: [4, 5],
  },
  {
    id: 'civil-collapse',
    name: 'Civil Collapse',
    shortName: 'Collapse',
    tagline: 'A decade of blood and chaos',
    yearRange: { start: 1975, end: 1984 },
    themeColor: 'var(--event-conflict)',
    backgroundGradient: 'from-red-900/20 via-transparent to-transparent',
    backgroundImage: '/images/timeline/phases/phase-4-civil-collapse.webp',
    backgroundImagePortrait: '/images/timeline/mobile/phase-4.webp',
    eventIds: [6],
  },
  {
    id: 'military-control',
    name: 'Military Control',
    shortName: 'Control',
    tagline: 'Order through surveillance, stability through power',
    yearRange: { start: 1985, end: 2025 },
    themeColor: 'var(--event-political)',
    backgroundGradient: 'from-slate-900/30 via-transparent to-transparent',
    backgroundImage: '/images/timeline/phases/phase-5-military-control.webp',
    backgroundImagePortrait: '/images/timeline/mobile/phase-5.webp',
    eventIds: [7, 8, 9],
  },
];

/**
 * Timeline constants
 */
export const TIMELINE_CONSTANTS = {
  START_YEAR: 1717,
  END_YEAR: 2025,
  TOTAL_YEARS: 308,
  TOTAL_PHASES: 5,
  TOTAL_EVENTS: 9,
} as const;

/**
 * Event type to color mapping
 */
export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  economic: '#F1C232',
  political: '#0B2742',
  conflict: '#DC2626',
  governance: '#10B981',
  era: '#8B5CF6',
};

/**
 * Get phase by ID
 */
export function getPhaseById(id: string): TimelinePhase | undefined {
  return TIMELINE_PHASES.find((phase) => phase.id === id);
}

/**
 * Get phase by event ID
 */
export function getPhaseByEventId(eventId: number): TimelinePhase | undefined {
  return TIMELINE_PHASES.find((phase) => phase.eventIds.includes(eventId));
}

/**
 * Get phase index by year
 */
export function getPhaseIndexByYear(year: number): number {
  for (let i = 0; i < TIMELINE_PHASES.length; i++) {
    const phase = TIMELINE_PHASES[i];
    if (year >= phase.yearRange.start && year <= phase.yearRange.end) {
      return i;
    }
  }
  // If year is before first phase, return 0
  if (year < TIMELINE_PHASES[0].yearRange.start) {
    return 0;
  }
  // If year is after last phase, return last index
  return TIMELINE_PHASES.length - 1;
}
