'use client';

import { FC } from 'react';
import { cn } from '@/shared/utils';

interface TopicBadgeProps {
  name: string;
  color?: string | null;
  size?: 'sm' | 'md';
  maxChars?: number;
  className?: string;
}

/**
 * Maps legacy design tokens (recorded in prisma/seed.ts Topic.color) to
 * Classified Chronicle palette aliases. This keeps the seed file untouched
 * while letting the rendered pill honour the new palette. Unknown values
 * pass through unchanged.
 */
const COLOR_ALIAS: Record<string, string> = {
  '--powder-500': '--powder-signal',
  '--powder-400': '--powder-signal',
  '--mustard-500': '--mustard-dossier',
  '--mustard-400': '--mustard-hot',
  '--navy-500': '--navy-signal',
  '--text-muted': '--shadow-text',
  '--text-secondary': '--steel-text',
  '--text-primary': '--bone-text',
  // --event-era, --status-warning, --status-alert, --status-success
  // pass through unchanged — they're unique accents not in the Classified core.
};

function resolveColor(raw?: string | null): string | null {
  if (!raw) return null;
  const aliased = COLOR_ALIAS[raw] ?? raw;
  return aliased;
}

/**
 * Displays a forum topic as a Classified Chronicle hard-rect mono chip.
 * Colour is sourced from the Topic record in the database and mapped
 * through COLOR_ALIAS so legacy seed tokens resolve to the new palette.
 */
export const TopicBadge: FC<TopicBadgeProps> = ({
  name,
  color,
  size = 'sm',
  maxChars,
  className,
}) => {
  const resolved = resolveColor(color);
  const display =
    maxChars && name.length > maxChars ? name.slice(0, maxChars) : name;

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono uppercase tracking-[0.15em]',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        'border rounded-none',
        className,
      )}
      style={{
        borderColor: resolved ? `var(${resolved})` : 'var(--steel-text)',
        color: resolved ? `var(${resolved})` : 'var(--steel-text)',
        backgroundColor: 'color-mix(in srgb, var(--obsidian-void) 80%, transparent)',
      }}
    >
      {display}
    </span>
  );
};
