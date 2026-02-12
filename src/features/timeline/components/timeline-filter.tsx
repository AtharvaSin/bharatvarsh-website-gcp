'use client';

import { FC } from 'react';
import { cn } from '@/shared/utils';

interface TimelineFilterProps {
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
  className?: string;
}

const EVENT_TYPES = [
  { id: 'economic', label: 'Economic', color: '#F1C232' },
  { id: 'political', label: 'Political', color: '#0B2742' },
  { id: 'conflict', label: 'Conflict', color: '#DC2626' },
  { id: 'governance', label: 'Governance', color: '#10B981' },
  { id: 'era', label: 'Era', color: '#8B5CF6' },
];

export const TimelineFilter: FC<TimelineFilterProps> = ({
  activeFilter,
  onFilterChange,
  className,
}) => {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="text-sm text-[var(--text-muted)] mr-2">Filter:</span>

      <button
        onClick={() => onFilterChange(null)}
        className={cn(
          'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
          !activeFilter
            ? 'bg-[var(--powder-500)] text-[var(--navy-900)]'
            : 'bg-[var(--obsidian-700)] text-[var(--text-secondary)] hover:bg-[var(--obsidian-600)]'
        )}
      >
        All
      </button>

      {EVENT_TYPES.map((type) => (
        <button
          key={type.id}
          onClick={() => onFilterChange(type.id)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
            activeFilter === type.id
              ? 'text-[var(--navy-900)]'
              : 'text-[var(--text-secondary)] hover:opacity-80'
          )}
          style={{
            backgroundColor:
              activeFilter === type.id ? type.color : `${type.color}20`,
            color: activeFilter === type.id ? '#0F1419' : type.color,
          }}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
};

export default TimelineFilter;
