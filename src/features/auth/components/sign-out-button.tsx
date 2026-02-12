'use client';

import { FC } from 'react';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/utils';

interface SignOutButtonProps {
  className?: string;
}

/** Sign-out button with danger-hover styling. */
export const SignOutButton: FC<SignOutButtonProps> = ({ className }) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut({ callbackUrl: '/' })}
      className={cn(
        'text-[var(--text-muted)] hover:text-[var(--status-alert)]',
        className
      )}
      icon={<LogOut className="w-4 h-4" />}
    >
      Sign Out
    </Button>
  );
};
