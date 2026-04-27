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
  { label: 'Dispatches', href: '/dispatches' },
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

  const showBackground = !transparent || isScrolled || isMobileMenuOpen || pathname === '/timeline';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 transition-all duration-300',
        'safe-area-top', // Safe area padding for notched devices
        isMobileMenuOpen ? 'z-[var(--z-max)]' : 'z-[var(--z-header)]',
        showBackground
          ? 'bg-[var(--obsidian-900)]/95 backdrop-blur-md border-b border-[var(--obsidian-700)]'
          : 'bg-transparent',
        className
      )}
    >
      <div className="relative z-50 max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16 safe-area-x">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2 group"
              aria-label="Bharatvarsh home"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- static SVG, no optimisation benefit */}
              <img
                src="/images/brand/bharatsena-logo-mustard.svg"
                alt=""
                aria-hidden="true"
                className="w-7 h-7 md:w-8 md:h-8 opacity-90 group-hover:opacity-100 transition-opacity"
              />
              <span className="font-display text-2xl md:text-3xl tracking-wide text-[var(--bone-text)] group-hover:text-[var(--mustard-dossier)] transition-colors">
                BHARATVARSH
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative px-4 py-2 font-mono uppercase text-[12px] tracking-[0.18em] transition-colors',
                  pathname === item.href ||
                    (item.href !== '/' && pathname.startsWith(item.href))
                    ? 'text-[var(--bone-text)]'
                    : 'text-[var(--shadow-text)] hover:text-[var(--bone-text)]'
                )}
              >
                {item.label.toUpperCase()}
                {(pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href))) && (
                  <span
                    aria-hidden="true"
                    className="absolute left-4 right-4 bottom-0 h-[2px] bg-[var(--mustard-dossier)]"
                  />
                )}
              </Link>
            ))}

            <a href="https://www.amazon.in/dp/B0GHS8127Z" target="_blank" rel="noopener noreferrer" className="ml-4">
              <Button variant="primary" size="sm">
                Buy Now
              </Button>
            </a>

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
            animate={{ opacity: 1, height: '100dvh' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed top-0 left-0 right-0 bottom-0 z-40 bg-black/90 backdrop-blur-2xl overflow-y-auto pt-20"
          >
            <nav className="px-4 py-8 space-y-2 safe-area-x flex flex-col items-center">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block w-full max-w-sm text-center px-4 py-4 text-lg font-display tracking-wide rounded-lg transition-all',
                    pathname === item.href ||
                      (item.href !== '/' && pathname.startsWith(item.href))
                      ? 'text-[var(--mustard-500)] bg-[var(--obsidian-800)]/80 border border-[var(--mustard-500)]/30'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--obsidian-800)]/50'
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-8 space-y-4 w-full max-w-sm">
                <a href="https://www.amazon.in/dp/B0GHS8127Z" target="_blank" rel="noopener noreferrer" className="block w-full">
                  <Button variant="primary" className="w-full py-6 text-lg">
                    Buy Now
                  </Button>
                </a>
                <div className="flex justify-center">
                  <SignInButton />
                </div>
              </div>

              {/* Lore Accurate Watermark */}
              <div className="mt-12 text-center pointer-events-none opacity-20">
                <span className="font-mono text-[10px] text-[var(--powder-300)] uppercase tracking-widest block mb-1">Mesh Node Connected</span>
                <span className="font-mono text-[10px] text-[var(--mustard-500)] uppercase tracking-widest">Order Feeds All</span>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
