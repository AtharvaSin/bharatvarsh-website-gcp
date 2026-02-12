/**
 * Data Loading Abstraction
 *
 * Provides a centralized way to load and access mock data throughout the application.
 * This abstraction layer makes it easy to:
 * - Swap to a real API later
 * - Add caching or request deduplication
 * - Type-check data at import time
 */

import type { TimelineEvent, LoreItem, NovelData } from '@/types';

// Import JSON data directly for sync access in client components
import timelineJsonData from '@/content/data/timeline.json';
import loreItemsJsonData from '@/content/data/lore-items.json';

// Re-export types for convenience
export type { TimelineEvent, LoreItem, NovelData };

/**
 * Timeline data structure from timeline.json
 */
export interface TimelineData {
  timeline: {
    title: string;
    subtitle: string;
    total_events: number;
    time_span: {
      start: number;
      end: number;
    };
  };
  events: TimelineEvent[];
}

// =============================================================================
// DATA LOADERS
// =============================================================================

/**
 * Load timeline data
 * Returns the complete timeline including metadata and events
 */
export async function getTimelineData(): Promise<TimelineData> {
  const data = await import('@/content/data/timeline.json');
  return data.default as TimelineData;
}

/**
 * Load timeline events only
 * Convenience function when you just need the events array
 */
export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  const data = await getTimelineData();
  return data.events;
}

/**
 * Load lore items (characters, locations, factions, technology)
 * Combined data from lore-items.json
 */
export async function getLoreItems(): Promise<LoreItem[]> {
  const data = await import('@/content/data/lore-items.json');
  return (data.default as { lore: LoreItem[] }).lore;
}

/**
 * Load lore items filtered by category
 */
export async function getLoreItemsByCategory(
  category: 'characters' | 'locations' | 'factions' | 'technology'
): Promise<LoreItem[]> {
  const items = await getLoreItems();
  return items.filter((item) => item.category === category);
}

/**
 * Load novel data
 */
export async function getNovelData(): Promise<NovelData> {
  const data = await import('@/content/data/novel.json');
  return data.default as NovelData;
}

// =============================================================================
// SYNC DATA ACCESSORS (for client components that need immediate access)
// =============================================================================

/**
 * Synchronously import timeline data (use in client components with useEffect)
 * Note: This is a sync import, use getTimelineData() for async contexts
 */
export function useTimelineData(): TimelineData {
  return timelineJsonData as TimelineData;
}

/**
 * Synchronously import lore items
 * Note: This is a sync import, use getLoreItems() for async contexts
 */
export function useLoreItems(): LoreItem[] {
  return (loreItemsJsonData as { lore: LoreItem[] }).lore;
}

// =============================================================================
// DATA UTILITIES
// =============================================================================

/**
 * Get a single timeline event by ID
 */
export async function getTimelineEventById(id: number): Promise<TimelineEvent | undefined> {
  const events = await getTimelineEvents();
  return events.find((event) => event.id === id);
}

/**
 * Get a single timeline event by slug
 */
export async function getTimelineEventBySlug(slug: string): Promise<TimelineEvent | undefined> {
  const events = await getTimelineEvents();
  return events.find((event) => event.slug === slug);
}

/**
 * Get a single lore item by ID
 */
export async function getLoreItemById(id: string): Promise<LoreItem | undefined> {
  const items = await getLoreItems();
  return items.find((item) => item.id === id);
}

/**
 * Get timeline events filtered by type
 */
export async function getTimelineEventsByType(
  eventType: 'economic' | 'political' | 'conflict' | 'governance' | 'era'
): Promise<TimelineEvent[]> {
  const events = await getTimelineEvents();
  return events.filter((event) => event.metadata.event_type === eventType);
}

/**
 * Get featured lore items (for homepage or hero sections)
 */
export async function getFeaturedLoreItems(): Promise<LoreItem[]> {
  const items = await getLoreItems();
  return items.filter((item) => item.featured);
}

/**
 * Get lore items by classification
 */
export async function getLoreItemsByClassification(
  classification: 'classified' | 'declassified'
): Promise<LoreItem[]> {
  const items = await getLoreItems();
  return items.filter((item) => item.classification === classification);
}
