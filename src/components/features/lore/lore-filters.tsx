'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LoreCategory } from '@/types';

type FilterValue = LoreCategory | 'all';

interface LoreFiltersProps {
  activeFilter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
  counts: Record<FilterValue, number>;
  className?: string;
}

interface FilterOption {
  value: FilterValue;
  label: string;
}

const filterOptions: FilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'characters', label: 'Characters' },
  { value: 'locations', label: 'Locations' },
  { value: 'factions', label: 'Factions' },
  { value: 'tech', label: 'Tech' },
];

export const LoreFilters: FC<LoreFiltersProps> = ({
  activeFilter,
  onFilterChange,
  counts,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-wrap gap-2 justify-center',
        className
      )}
      role="tablist"
      aria-label="Filter lore items by category"
    >
      {filterOptions.map((option) => {
        const isActive = activeFilter === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onFilterChange(option.value)}
            role="tab"
            aria-selected={isActive}
            className={cn(
              'relative px-4 py-2 rounded-full text-sm font-medium',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--powder-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--obsidian-900)]',
              isActive
                ? 'bg-[var(--mustard-500)] text-[var(--navy-900)]'
                : 'bg-[var(--obsidian-800)] text-[var(--text-secondary)] hover:bg-[var(--obsidian-700)] hover:text-[var(--text-primary)]',
              'border',
              isActive
                ? 'border-[var(--mustard-500)]'
                : 'border-[var(--obsidian-600)]'
            )}
          >
            <span className="flex items-center gap-2">
              {option.label}
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  isActive
                    ? 'bg-[var(--navy-900)]/20 text-[var(--navy-900)]'
                    : 'bg-[var(--obsidian-600)] text-[var(--text-muted)]'
                )}
              >
                {counts[option.value]}
              </span>
            </span>

            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="activeFilter"
                className="absolute inset-0 rounded-full bg-[var(--mustard-500)] -z-10"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default LoreFilters;
