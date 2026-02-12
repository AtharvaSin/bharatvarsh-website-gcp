'use client';

import { FC, HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils';

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider',
  {
    variants: {
      variant: {
        default: 'bg-[var(--obsidian-600)] text-[var(--text-primary)]',
        outline:
          'bg-transparent border border-[var(--obsidian-500)] text-[var(--text-secondary)]',
        protagonist: 'bg-[var(--mustard-500)]/20 text-[var(--mustard-500)]',
        deuteragonist: 'bg-[var(--mustard-500)]/20 text-[var(--mustard-500)]',
        antagonist: 'bg-red-500/20 text-red-400',
        supporting: 'bg-[var(--powder-500)]/20 text-[var(--powder-400)]',
        complex: 'bg-purple-500/20 text-purple-400',
        mystery: 'bg-purple-500/20 text-purple-400',
        hidden: 'bg-gray-500/20 text-gray-400',
        // Event types
        economic: 'bg-[var(--event-economic)]/20 text-[var(--event-economic)]',
        political: 'bg-[var(--event-political)] text-[var(--text-primary)]',
        conflict: 'bg-[var(--event-conflict)]/20 text-[var(--event-conflict)]',
        governance:
          'bg-[var(--event-governance)]/20 text-[var(--event-governance)]',
        era: 'bg-[var(--event-era)]/20 text-[var(--event-era)]',
        // Faction status
        ruling: 'bg-[var(--navy-900)] text-[var(--powder-300)]',
        active: 'bg-[var(--status-success)]/20 text-[var(--status-success)]',
        underground: 'bg-red-500/20 text-red-400',
        dissolved: 'bg-gray-500/20 text-gray-400',
        regulated: 'bg-[var(--mustard-500)]/20 text-[var(--mustard-500)]',
        // Location types
        military: 'bg-[var(--navy-900)] text-[var(--powder-300)]',
        metropolis: 'bg-[var(--powder-500)]/20 text-[var(--powder-400)]',
        region: 'bg-[var(--status-success)]/20 text-[var(--status-success)]',
        infrastructure:
          'bg-[var(--event-era)]/20 text-[var(--event-era)]',
        // Special variants
        mustard: 'bg-[var(--mustard-500)] text-[var(--navy-900)] font-semibold',
        success: 'bg-[var(--status-success)] text-white',
        warning: 'bg-[var(--status-warning)] text-[var(--navy-900)]',
        alert: 'bg-[var(--status-alert)] text-white',
        // Lore classification
        classified: 'bg-red-500/20 text-red-400 border border-red-500/30',
        declassified: 'bg-[var(--status-success)]/20 text-[var(--status-success)] border border-[var(--status-success)]/30',
        // Lore categories
        characters: 'bg-[var(--mustard-500)]/20 text-[var(--mustard-500)]',
        factions: 'bg-[var(--navy-700)] text-[var(--powder-300)]',
        tech: 'bg-[var(--event-era)]/20 text-[var(--event-era)]',
        locations: 'bg-[var(--powder-500)]/20 text-[var(--powder-400)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge: FC<BadgeProps> = ({ className, variant, ...props }) => {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
};

export { Badge, badgeVariants };
