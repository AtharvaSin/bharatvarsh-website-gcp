'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Twitter, Instagram, Facebook, Mail } from 'lucide-react';
import { cn } from '@/shared/utils';
import { DocumentStamp } from '@/shared/ui/DocumentStamp';

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
    {
      label: 'atharvasingh.24@gmail.com',
      href: 'mailto:atharvasingh.24@gmail.com',
      icon: Mail,
    },
    { label: 'Twitter/X', href: 'https://x.com/bharatvarshHQ', icon: Twitter },
    { label: 'Instagram', href: 'https://instagram.com/welcometobharatvarsh', icon: Instagram },
    { label: 'Facebook', href: 'https://www.facebook.com/share/1CC6oYMykq/', icon: Facebook },
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
            <Link
              href="/"
              className="inline-flex items-center gap-2 group"
              aria-label="Bharatvarsh home"
            >
              <span
                aria-hidden="true"
                className="font-[var(--font-devanagari)] text-2xl text-[var(--mustard-dossier)] opacity-90 group-hover:opacity-100 transition-opacity"
              >
                भा
              </span>
              <span className="font-display text-2xl tracking-wide text-[var(--bone-text)]">
                BHARATVARSH
              </span>
            </Link>
            <p className="mt-4 text-sm text-[var(--steel-text)] leading-relaxed">
              A dystopian chronicle of the subcontinent that wasn&rsquo;t.
            </p>
            <p className="mt-4 text-sm text-[var(--powder-signal)] font-serif italic">
              &ldquo;What would you sacrifice for the truth?&rdquo;
            </p>
          </div>

          {/* Explore Links */}
          <div>
            <h4 className="font-mono uppercase text-[11px] tracking-[0.18em] text-[var(--mustard-dossier)] mb-4">
              EXPLORE
            </h4>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
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
            <h4 className="font-mono uppercase text-[11px] tracking-[0.18em] text-[var(--mustard-dossier)] mb-4">
              ABOUT
            </h4>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
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
            <h4 className="font-mono uppercase text-[11px] tracking-[0.18em] text-[var(--mustard-dossier)] mb-4">
              CONNECT
            </h4>
            <ul className="space-y-3">
              {footerLinks.connect.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--navy-signal)] mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="font-mono uppercase text-[10px] tracking-[0.18em] text-[var(--shadow-text)]">
            &copy; {new Date().getFullYear()} BHARATVARSH &nbsp;&#9642;&nbsp; ALL DOSSIERS RESERVED
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="#privacy"
              className="font-mono uppercase text-[10px] tracking-[0.18em] text-[var(--shadow-text)] hover:text-[var(--bone-text)] transition-colors"
            >
              PRIVACY
            </Link>
            <Link
              href="#terms"
              className="font-mono uppercase text-[10px] tracking-[0.18em] text-[var(--shadow-text)] hover:text-[var(--bone-text)] transition-colors"
            >
              TERMS
            </Link>
            <DocumentStamp docId="BVR-0001" revision="REV 27" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
