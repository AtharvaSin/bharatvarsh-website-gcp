'use client';

import { forwardRef, ComponentPropsWithoutRef } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/shared/utils';

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-[var(--z-tooltip)] overflow-hidden rounded-md',
        'bg-[var(--obsidian-700)] border border-[var(--obsidian-600)] px-3 py-1.5',
        'text-xs text-[var(--text-primary)] shadow-md',
        'animate-in fade-in-0 zoom-in-95',
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = 'TooltipContent';

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };
