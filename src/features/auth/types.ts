import type { UserRole } from '@prisma/client';

export interface SessionUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
}

export interface AuthSession {
  user: SessionUser;
  expires: string;
}

export type RequiredRole = 'member' | 'moderator' | 'admin';

/**
 * Checks whether a user's role meets or exceeds the required role level.
 * Role hierarchy: VISITOR (0) < MEMBER (1) < MODERATOR (2) < ADMIN (3)
 */
export function hasRequiredRole(userRole: UserRole, required: RequiredRole): boolean {
  const hierarchy: Record<string, number> = {
    VISITOR: 0,
    MEMBER: 1,
    MODERATOR: 2,
    ADMIN: 3,
  };
  const requiredMap: Record<RequiredRole, number> = {
    member: 1,
    moderator: 2,
    admin: 3,
  };
  return (hierarchy[userRole] ?? 0) >= (requiredMap[required] ?? 0);
}
