import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge to resolve conflicts
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a year for display
 */
export function formatYear(year: number): string {
  return `${year} AD`;
}

/**
 * Format a year range for display
 */
export function formatYearRange(start: number, end: number): string {
  if (start === end) {
    return formatYear(start);
  }
  return `${start} - ${end} AD`;
}

/**
 * Format a date object from timeline events
 */
export function formatEventDate(date: {
  start_year: number;
  end_year: number;
  is_range: boolean;
}): string {
  if (date.is_range) {
    return formatYearRange(date.start_year, date.end_year);
  }
  return formatYear(date.start_year);
}

/**
 * Get event type color based on type
 */
export function getEventTypeColor(type: string): string {
  const colors: Record<string, string> = {
    economic: 'var(--event-economic)',
    political: 'var(--event-political)',
    conflict: 'var(--event-conflict)',
    governance: 'var(--event-governance)',
    era: 'var(--event-era)',
  };
  return colors[type] || 'var(--text-muted)';
}

/**
 * Get faction color based on faction ID
 */
export function getFactionColor(factionId: string): string {
  const colors: Record<string, string> = {
    'military-council': 'var(--faction-military)',
    'the-mesh': 'var(--faction-mesh)',
    'eastern-resistance': 'var(--faction-resistance)',
    'old-republic': 'var(--faction-republic)',
    'guild-networks': 'var(--faction-guild)',
  };
  return colors[factionId] || 'var(--text-muted)';
}

/**
 * Get role badge variant based on character role
 */
export function getRoleVariant(
  role: string
): 'protagonist' | 'antagonist' | 'supporting' | 'mystery' | 'default' {
  const variants: Record<string, 'protagonist' | 'antagonist' | 'supporting' | 'mystery'> = {
    protagonist: 'protagonist',
    deuteragonist: 'protagonist',
    antagonist: 'antagonist',
    supporting: 'supporting',
    complex: 'mystery',
    mystery: 'mystery',
    hidden: 'mystery',
  };
  return variants[role] || 'default';
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Generate a slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .trim();
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Check if we're in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (!isBrowser()) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
