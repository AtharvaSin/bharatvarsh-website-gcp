'use client';

import { forwardRef, ComponentPropsWithoutRef } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/shared/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex items-center gap-1 rounded-lg bg-[var(--obsidian-800)] p-1 border border-[var(--obsidian-600)]',
      className
    )}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

const TabsTrigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium',
      'text-[var(--text-muted)] transition-all duration-150',
      'hover:text-[var(--text-secondary)]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mustard-500)]',
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[state=active]:bg-[var(--obsidian-700)] data-[state=active]:text-[var(--mustard-500)] data-[state=active]:shadow-sm',
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mustard-500)]',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
