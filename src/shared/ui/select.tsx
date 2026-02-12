'use client';

import { forwardRef, ComponentPropsWithoutRef } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/shared/utils';

const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-10 w-full items-center justify-between rounded-lg border border-[var(--obsidian-600)] bg-[var(--obsidian-800)] px-3 py-2 text-sm',
      'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
      'focus:outline-none focus:ring-2 focus:ring-[var(--mustard-500)] focus:ring-offset-2 focus:ring-offset-[var(--obsidian-900)]',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon>
      <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = 'SelectTrigger';

const SelectContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      className={cn(
        'relative z-[var(--z-popover)] max-h-96 min-w-[8rem] overflow-hidden rounded-lg',
        'bg-[var(--obsidian-800)] border border-[var(--obsidian-600)] shadow-lg',
        position === 'popper' && 'translate-y-1',
        className
      )}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = 'SelectContent';

const SelectItem = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-3 text-sm',
      'text-[var(--text-secondary)] outline-none',
      'hover:bg-[var(--obsidian-700)] hover:text-[var(--text-primary)]',
      'focus:bg-[var(--obsidian-700)] focus:text-[var(--text-primary)]',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-[var(--mustard-500)]" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = 'SelectItem';

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
