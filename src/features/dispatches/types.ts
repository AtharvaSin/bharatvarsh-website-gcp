/**
 * Dispatch — one entry in src/content/data/dispatches.json.
 * Renders as a card on /dispatches.
 *
 * Visibility rule (A1): an entry is shown iff publishedUrls exists AND
 * has at least one non-empty platform URL. No URLs → no card.
 */
export interface Dispatch {
  id: string;
  topic: string;
  hook: string;
  caption: string;
  storyAngle: 'bharatsena' | 'akakpen' | 'tribhuj';
  distillationFilter: string;
  contentChannel: 'declassified_report' | 'graffiti_photo' | 'news_article';
  channels: string[];
  scheduledDate: string;
  status: 'rendered' | 'planned';
  image: string;
  publishedUrls?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
}

export type DispatchPlatform = keyof NonNullable<Dispatch['publishedUrls']>;

/**
 * Returns true when a dispatch has at least one non-empty publishedUrls
 * value — the A1 visibility gate.
 */
export function hasAnyPublishedUrl(d: Dispatch): boolean {
  if (!d.publishedUrls) return false;
  return Object.values(d.publishedUrls).some((v) => typeof v === 'string' && v.length > 0);
}

/**
 * Returns the ordered list of platforms that have a URL on this dispatch.
 * Order: instagram → twitter → facebook (stable, for first-URL fallbacks).
 */
export function publishedPlatforms(d: Dispatch): DispatchPlatform[] {
  if (!d.publishedUrls) return [];
  const order: DispatchPlatform[] = ['instagram', 'twitter', 'facebook'];
  return order.filter((p) => d.publishedUrls?.[p] && d.publishedUrls[p]!.length > 0);
}

/**
 * Returns the URL the card-level "READ →" link should point to.
 * Priority: instagram → twitter → facebook. Returns null if none exist.
 */
export function primaryDispatchUrl(d: Dispatch): string | null {
  const first = publishedPlatforms(d)[0];
  return first ? d.publishedUrls![first]! : null;
}
