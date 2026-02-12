'use client';

import { forwardRef, useEffect, useRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/utils';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoResize = false, onChange, ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);

    const handleResize = () => {
      const el = internalRef.current;
      if (el && autoResize) {
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
      }
    };

    useEffect(() => {
      handleResize();
    }, [props.value]);

    return (
      <textarea
        ref={(node) => {
          internalRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border border-[var(--obsidian-600)] bg-[var(--obsidian-800)] px-4 py-3',
          'text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mustard-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--obsidian-900)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors duration-150',
          autoResize && 'resize-none overflow-hidden',
          className
        )}
        onChange={(e) => {
          onChange?.(e);
          handleResize();
        }}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
