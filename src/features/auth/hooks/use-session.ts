'use client';

import { useSession as useNextAuthSession } from 'next-auth/react';
import type { SessionUser, RequiredRole } from '../types';
import { hasRequiredRole } from '../types';

/**
 * Typed session hook wrapping next-auth's useSession.
 * Provides role-based helpers (isMember, isModerator, isAdmin)
 * and a generic hasRole() check against the role hierarchy.
 */
export function useSession() {
  const { data: session, status } = useNextAuthSession();

  const user = session?.user as SessionUser | undefined;
  const isAuthenticated = status === 'authenticated' && !!user;
  const isLoading = status === 'loading';

  const hasRole = (role: RequiredRole): boolean => {
    if (!user) return false;
    return hasRequiredRole(user.role, role);
  };

  return {
    session,
    user,
    status,
    isAuthenticated,
    isLoading,
    hasRole,
    isMember: isAuthenticated && hasRole('member'),
    isModerator: isAuthenticated && hasRole('moderator'),
    isAdmin: isAuthenticated && hasRole('admin'),
  };
}
