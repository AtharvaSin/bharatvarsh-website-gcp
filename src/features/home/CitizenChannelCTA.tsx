import Link from 'next/link';
import { EyebrowLabel } from '@/shared/ui';
import type { ForumStats } from './getForumStats';

interface CitizenChannelCTAProps {
  stats: ForumStats | null;
}

export function CitizenChannelCTA({ stats }: CitizenChannelCTAProps) {
  return (
    <div
      className="relative border-t p-8"
      style={{
        background: 'var(--obsidian-panel)',
        borderColor: 'var(--navy-signal)',
      }}
    >
      <span
        aria-hidden="true"
        className="absolute top-8 right-8 font-display"
        style={{ fontSize: '4rem', color: 'var(--mustard-dossier)' }}
      >
        03
      </span>

      <EyebrowLabel segments={['PATH 03', 'CITIZEN CHANNEL']} />
      <h3
        className="font-display mt-2 mb-3"
        style={{ fontSize: '3rem', color: 'var(--bone-text)' }}
      >
        FIND YOUR PEOPLE
      </h3>

      <p style={{ color: 'var(--steel-text)' }}>
        Theories. Fan canon. Reading threads. Character debates.
        The forum runs on first-name terms.
      </p>

      {stats && (
        <ul
          className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs uppercase tracking-wider"
          style={{ color: 'var(--shadow-text)' }}
        >
          <li>▸ {stats.threadCount} discussions</li>
          <li>▸ {stats.memberCount} readers</li>
          {stats.lastPostRelative && (
            <li>▸ last post {stats.lastPostRelative}</li>
          )}
        </ul>
      )}

      <Link
        href="/forum"
        className="mt-6 inline-flex items-center gap-2 font-mono uppercase"
        style={{
          background: 'var(--mustard-dossier)',
          color: 'var(--obsidian-void)',
          padding: '0.75rem 1.5rem',
          fontSize: '12px',
          letterSpacing: '0.18em',
        }}
      >
        ENTER THE FORUM <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
