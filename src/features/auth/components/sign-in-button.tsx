'use client';

import { FC } from 'react';
import { signIn } from 'next-auth/react';
import { LogIn } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/utils';
import { useSession } from '../hooks/use-session';

interface SignInButtonProps {
  className?: string;
}

/** Sign-in button that hides itself when the user is already authenticated. */
export const SignInButton: FC<SignInButtonProps> = ({ className }) => {
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return (
      <div
        className={cn(
          'h-9 w-20 bg-[var(--obsidian-700)] rounded-md animate-pulse',
          className
        )}
      />
    );
  }

  if (isAuthenticated) return null;

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => signIn()}
      className={className}
      icon={<LogIn className="w-4 h-4" />}
    >
      Sign In
    </Button>
  );
};
