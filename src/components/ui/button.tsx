'use client';

import { FC, ButtonHTMLAttributes, forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mustard-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--obsidian-900)] disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--mustard-500)] text-[var(--navy-900)] hover:bg-[var(--mustard-400)] hover:-translate-y-0.5 active:translate-y-0',
        secondary:
          'bg-transparent border border-[var(--powder-500)] text-[var(--powder-300)] hover:bg-[var(--powder-500)] hover:text-[var(--navy-900)]',
        ghost:
          'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--obsidian-700)]',
        outline:
          'bg-transparent border border-[var(--obsidian-600)] text-[var(--text-secondary)] hover:border-[var(--powder-500)] hover:text-[var(--text-primary)]',
        danger:
          'bg-[var(--status-alert)] text-white hover:bg-red-700',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm rounded-md',
        md: 'px-5 py-2.5 text-base rounded-lg',
        lg: 'px-7 py-3 text-lg rounded-lg',
        icon: 'h-10 w-10 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      icon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Spinner size={size} />
        ) : (
          icon
        )}
        {children}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'icon' | null;
}

const Spinner: FC<SpinnerProps> = ({ size }) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    icon: 'h-4 w-4',
  };

  return (
    <svg
      className={cn('animate-spin', sizeClasses[size || 'md'])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

export { Button, buttonVariants };
