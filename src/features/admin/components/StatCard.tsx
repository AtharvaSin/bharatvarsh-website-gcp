'use client';

import { FC, ReactNode } from 'react';
import { cn } from '@/shared/utils';

interface StatCardProps {
    icon: ReactNode;
    label: string;
    value: string | number;
    trend?: number; // percentage, + or -
    className?: string;
}

export const StatCard: FC<StatCardProps> = ({
    icon,
    label,
    value,
    trend,
    className,
}) => {
    return (
        <div
            className={cn(
                'glass rounded-xl p-5 border border-[var(--obsidian-700)]',
                'hover:shadow-[var(--glow-mustard)] transition-shadow duration-300',
                className,
            )}
        >
            <div className="flex items-center justify-between mb-3">
                <span className="text-[var(--mustard-500)]">{icon}</span>
                {trend !== undefined && (
                    <span
                        className={cn(
                            'text-xs font-mono px-2 py-0.5 rounded-full',
                            trend >= 0
                                ? 'text-[var(--status-success)] bg-[var(--status-success)]/10'
                                : 'text-[var(--status-alert)] bg-[var(--status-alert)]/10',
                        )}
                    >
                        {trend >= 0 ? '+' : ''}
                        {trend}%
                    </span>
                )}
            </div>
            <p className="text-2xl font-semibold text-[var(--powder-300)] mb-1">
                {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            <p className="text-sm text-[var(--text-muted)]">{label}</p>
        </div>
    );
};
