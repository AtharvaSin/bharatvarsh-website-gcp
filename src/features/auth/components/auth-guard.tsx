'use client';

import { FC, ReactNode } from 'react';
import { signIn } from 'next-auth/react';
import { Shield } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/utils';
import { useSession } from '../hooks/use-session';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

/**
 * Wraps content that requires authentication.
 * Shows a loading spinner while session loads, a sign-in prompt when
 * unauthenticated, or the children when authenticated.
 */
export const AuthGuard: FC<AuthGuardProps> = ({ children, fallback, className }) => {
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-16', className)}>
        <div className="h-8 w-8 border-2 border-[var(--mustard-500)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) return <>{fallback}</>;

    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center py-16 gap-4 text-center',
          className
        )}
      >
        <Shield className="w-12 h-12 text-[var(--text-muted)]" />
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Sign in required
        </h2>
        <p className="text-[var(--text-secondary)] max-w-md">
          You need to be signed in to access this content. Join the Bharatvarsh
          community to participate in discussions.
        </p>
        <Button variant="primary" onClick={() => signIn()}>
          Sign In to Continue
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};
