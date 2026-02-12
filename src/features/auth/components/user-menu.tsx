'use client';

import { FC, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { User, LogOut, MessageSquare, Shield } from 'lucide-react';
import { cn } from '@/shared/utils';
import { useSession } from '../hooks/use-session';

interface UserMenuProps {
  className?: string;
}

/**
 * Dropdown menu shown in the header when a user is signed in.
 * Displays avatar/initials, links to forum and profile, and
 * a moderation link for moderators+.
 */
export const UserMenu: FC<UserMenuProps> = ({ className }) => {
  const { user, isAuthenticated, isModerator } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) return null;

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--obsidian-700)] transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-[var(--navy-700)] flex items-center justify-center text-sm font-medium text-[var(--powder-300)]">
          {user.image ? (
            <img
              src={user.image}
              alt=""
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <span className="text-sm text-[var(--text-secondary)] hidden lg:block max-w-[120px] truncate">
          {user.name || user.email}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-lg bg-[var(--obsidian-800)] border border-[var(--obsidian-600)] shadow-lg py-1 z-[var(--z-dropdown)]">
          {/* User info */}
          <div className="px-4 py-3 border-b border-[var(--obsidian-600)]">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              {user.name || 'Anonymous'}
            </p>
            <p className="text-xs text-[var(--text-muted)] truncate">
              {user.email}
            </p>
          </div>

          {/* Navigation links */}
          <Link
            href="/forum"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--obsidian-700)] hover:text-[var(--text-primary)] transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Forum
          </Link>

          <Link
            href="/forum/me"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--obsidian-700)] hover:text-[var(--text-primary)] transition-colors"
          >
            <User className="w-4 h-4" />
            My Profile
          </Link>

          {isModerator && (
            <Link
              href="/forum/moderation"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--obsidian-700)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Shield className="w-4 h-4" />
              Moderation
            </Link>
          )}

          {/* Sign out */}
          <div className="border-t border-[var(--obsidian-600)] mt-1 pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: '/' });
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[var(--text-muted)] hover:bg-[var(--obsidian-700)] hover:text-[var(--status-alert)] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
