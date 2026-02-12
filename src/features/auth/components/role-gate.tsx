'use client';

import { FC, ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';
import { cn } from '@/shared/utils';
import { useSession } from '../hooks/use-session';
import type { RequiredRole } from '../types';

interface RoleGateProps {
  role: RequiredRole;
  children: ReactNode;
  fallback?: ReactNode;
  showDenied?: boolean;
  className?: string;
}

/**
 * Conditionally renders children only if the current user meets
 * the required role level. Can optionally show a "denied" message
 * or a custom fallback.
 */
export const RoleGate: FC<RoleGateProps> = ({
  role,
  children,
  fallback,
  showDenied = false,
  className,
}) => {
  const { hasRole, isAuthenticated, isLoading } = useSession();

  if (isLoading) return null;

  if (!isAuthenticated || !hasRole(role)) {
    if (fallback) return <>{fallback}</>;
    if (!showDenied) return null;

    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center py-12 gap-3 text-center',
          className
        )}
      >
        <ShieldAlert className="w-10 h-10 text-[var(--status-alert)]" />
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          Access Restricted
        </h3>
        <p className="text-[var(--text-secondary)] text-sm">
          This area requires {role} privileges.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
