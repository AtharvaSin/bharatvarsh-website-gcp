'use client';

import { forwardRef } from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/shared/utils';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
};

const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ src, alt, fallback, size = 'md', className }, ref) => {
    return (
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full',
          sizeClasses[size],
          className
        )}
      >
        {src && (
          <AvatarPrimitive.Image
            src={src}
            alt={alt || ''}
            className="aspect-square h-full w-full object-cover"
          />
        )}
        <AvatarPrimitive.Fallback
          className="flex h-full w-full items-center justify-center rounded-full bg-[var(--navy-700)] text-[var(--powder-300)] font-medium"
          delayMs={src ? 600 : 0}
        >
          {fallback}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };
