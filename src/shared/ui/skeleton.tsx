'use client';

import { FC, HTMLAttributes } from 'react';
import { cn } from '@/shared/utils';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

const Skeleton: FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-[var(--obsidian-700)]',
        className
      )}
      {...props}
    />
  );
};

export { Skeleton };
