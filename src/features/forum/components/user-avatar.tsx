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

/**
 * Forum-specific avatar with Classified Chronicle treatment:
 * - ADMIN role → mustard-dossier ring + Crown pod
 * - MODERATOR role → powder-signal ring + Shield pod
 * - Everyone else → navy-signal hairline
 * The underlying shared Avatar renders initials on the navy/powder palette
 * which already reads as "dossier tag," so we only dress the outer wrapper.
 */
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

  const ringColor =
    role === 'ADMIN'
      ? 'var(--mustard-dossier)'
      : role === 'MODERATOR'
        ? 'var(--powder-signal)'
        : 'var(--navy-signal)';

  return (
    <div
      className={cn('relative inline-flex rounded-full', className)}
      style={{
        // 2px ring around the avatar — admin mustard, mod powder, else navy
        boxShadow: `0 0 0 2px ${ringColor}`,
      }}
    >
      <Avatar src={image} fallback={initials} size={size} />
      {(role === 'MODERATOR' || role === 'ADMIN') && (
        <span
          className="absolute -bottom-0.5 -right-0.5 rounded-full p-0.5"
          style={{
            backgroundColor:
              role === 'ADMIN'
                ? 'var(--mustard-dossier)'
                : 'var(--powder-signal)',
          }}
        >
          {role === 'ADMIN' ? (
            <Crown
              className="w-2.5 h-2.5"
              style={{ color: 'var(--obsidian-void)' }}
            />
          ) : (
            <Shield
              className="w-2.5 h-2.5"
              style={{ color: 'var(--obsidian-void)' }}
            />
          )}
        </span>
      )}
    </div>
  );
};
