'use client';

import { FC } from 'react';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/utils';

interface UserBadgeProps {
  role: string;
  className?: string;
}

const roleConfig: Record<string, { label: string; variant: string }> = {
  ADMIN: { label: 'Admin', variant: 'mustard' },
  MODERATOR: { label: 'Mod', variant: 'ruling' },
  MEMBER: { label: 'Member', variant: 'default' },
  VISITOR: { label: 'Visitor', variant: 'outline' },
};

/** Displays a small badge indicating the user's forum role. */
export const UserBadge: FC<UserBadgeProps> = ({ role, className }) => {
  const config = roleConfig[role] || roleConfig.MEMBER;

  return (
    <Badge
      variant={config.variant as 'mustard' | 'ruling' | 'default' | 'outline'}
      className={cn('text-[10px]', className)}
    >
      {config.label}
    </Badge>
  );
};
