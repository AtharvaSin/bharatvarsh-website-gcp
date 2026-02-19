'use client';

import { FC } from 'react';
import Link from 'next/link';
import { cn } from '@/shared/utils';

interface FooterProps {
  className?: string;
}

const footerLinks = {
  explore: [
    { label: 'Characters', href: '/lore' },
    { label: 'Factions', href: '/lore' },
    { label: 'Locations', href: '/lore' },
    { label: 'Timeline', href: '/timeline' },
  ],
  about: [
    { label: 'The Novel', href: '/novel' },
    { label: 'The Author', href: '/novel' },
    { label: 'Forum', href: '/forum' },
  ],
  connect: [
    { label: 'Twitter/X', href: 'https://x.com/bharatvarsh_' },
    { label: 'Instagram', href: 'https://instagram.com/bharatvarsh_official' },
  ],
};

export const Footer: FC<FooterProps> = ({ className }) => {
  return (
    <footer
      className={cn(
        'bg-[var(--obsidian-950)] border-t border-[var(--obsidian-700)]',
        className
      )}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block">
              <span className="font-display text-2xl tracking-wide text-[var(--powder-300)]">
                BHARATVARSH
              </span>
            </Link>
            <p className="mt-4 text-sm text-[var(--text-muted)] leading-relaxed">
              An alternate reality thriller where truth is more dangerous than
              any weapon.
            </p>
            <p className="mt-4 text-sm text-[var(--text-muted)] font-serif italic">
              &ldquo;What would you sacrifice for the truth?&rdquo;
            </p>
          </div>

          {/* Explore Links */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--powder-400)] uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--powder-400)] uppercase tracking-wider mb-4">
              About
            </h4>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Links */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--powder-400)] uppercase tracking-wider mb-4">
              Connect
            </h4>
            <ul className="space-y-3">
              {footerLinks.connect.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--obsidian-700)] mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} Bharatvarsh. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="#privacy"
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="#terms"
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
