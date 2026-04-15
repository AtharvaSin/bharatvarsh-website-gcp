'use client';

import { FC } from 'react';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/utils';

interface UserBadgeProps {
  role: string;
  className?: string;
}

/**
 * Classified Chronicle user role pill.
 * - ADMIN → [ADMIN] on mustard-dossier
 * - MODERATOR → [MOD] on navy-core (ruling variant)
 * - MEMBER → OPERATIVE (default)
 * - VISITOR → GUEST (outline)
 * Hidden for plain MEMBER role to avoid visual clutter on common posts.
 */
const roleConfig: Record<
  string,
  { label: string; variant: 'mustard' | 'ruling' | 'default' | 'outline'; show: boolean }
> = {
  ADMIN: { label: '[ADMIN]', variant: 'mustard', show: true },
  MODERATOR: { label: '[MOD]', variant: 'ruling', show: true },
  MEMBER: { label: 'OPERATIVE', variant: 'default', show: false },
  VISITOR: { label: 'GUEST', variant: 'outline', show: false },
};

export const UserBadge: FC<UserBadgeProps> = ({ role, className }) => {
  const config = roleConfig[role] ?? roleConfig.MEMBER;
  if (!config.show) return null;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'text-[9px] font-mono uppercase tracking-[0.18em] rounded-none px-1.5 py-0.5',
        className,
      )}
    >
      {config.label}
    </Badge>
  );
};
