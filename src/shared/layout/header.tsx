'use client';

import { FC, useState, useEffect, useLayoutEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/shared/utils';
import { Button } from '@/shared/ui/button';
import { SignInButton, UserMenu } from '@/features/auth';

interface HeaderProps {
  transparent?: boolean;
  className?: string;
}

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'The Novel', href: '/novel' },
  { label: 'Lore', href: '/lore' },
  { label: 'Timeline', href: '/timeline' },
  { label: 'Forum', href: '/forum' },
];

export const Header: FC<HeaderProps> = ({ transparent = false, className }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change - intentional pattern for navigation
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Menu close on navigation is intentional
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const showBackground = !transparent || isScrolled || isMobileMenuOpen;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-[var(--z-header)] transition-all duration-300',
        'safe-area-top', // Safe area padding for notched devices
        showBackground
          ? 'bg-[var(--obsidian-900)]/95 backdrop-blur-md border-b border-[var(--obsidian-700)]'
          : 'bg-transparent',
        className
      )}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16 safe-area-x">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-display text-2xl md:text-3xl tracking-wide text-[var(--powder-300)] group-hover:text-[var(--mustard-500)] transition-colors">
              BHARATVARSH
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors rounded-lg',
                  pathname === item.href ||
                    (item.href !== '/' && pathname.startsWith(item.href))
                    ? 'text-[var(--mustard-500)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--obsidian-800)]'
                )}
              >
                {item.label}
              </Link>
            ))}

            <Button variant="primary" size="sm" className="ml-4">
              Pre-order
            </Button>

            <SignInButton className="ml-2" />
            <UserMenu className="ml-1" />
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 touch-target flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] tap-highlight-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[var(--obsidian-900)] border-t border-[var(--obsidian-700)] overflow-hidden"
          >
            <nav className="px-4 py-4 space-y-1 safe-area-x">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block px-4 py-3 text-base font-medium rounded-lg transition-colors',
                    pathname === item.href ||
                      (item.href !== '/' && pathname.startsWith(item.href))
                      ? 'text-[var(--mustard-500)] bg-[var(--obsidian-800)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--obsidian-800)]'
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                <Button variant="primary" className="w-full">
                  Pre-order
                </Button>
                <SignInButton className="w-full" />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
