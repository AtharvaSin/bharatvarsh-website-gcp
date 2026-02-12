'use client';

import { FC } from 'react';
import { Avatar } from '@/shared/ui/avatar';
import { Shield, Crown } from 'lucide-react';
import { cn } from '@/shared/utils';

interface UserAvatarProps {
  name: string | null;
  image: string | null;
  role: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** Forum-specific avatar with a small role badge overlay for moderators and admins. */
export const UserAvatar: FC<UserAvatarProps> = ({
  name,
  image,
  role,
  size = 'md',
  className,
}) => {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div className={cn('relative inline-flex', className)}>
      <Avatar src={image} fallback={initials} size={size} />
      {(role === 'MODERATOR' || role === 'ADMIN') && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full p-0.5',
            role === 'ADMIN'
              ? 'bg-[var(--mustard-500)]'
              : 'bg-[var(--powder-500)]'
          )}
        >
          {role === 'ADMIN' ? (
            <Crown className="w-2.5 h-2.5 text-[var(--navy-900)]" />
          ) : (
            <Shield className="w-2.5 h-2.5 text-[var(--navy-900)]" />
          )}
        </span>
      )}
    </div>
  );
};
