import Link from 'next/link';
import { EyebrowLabel } from '@/shared/ui';
import type { ForumStats } from './getForumStats';

interface CitizenChannelCTAProps {
  stats: ForumStats | null;
}

export function CitizenChannelCTA({ stats }: CitizenChannelCTAProps) {
  return (
    <section className="flex gap-6 items-start">
      <div className="flex-1 min-w-0">
        <EyebrowLabel segments={['CITIZEN CHANNEL']} />

        <h2
          className="font-display text-3xl sm:text-4xl mt-3 mb-4"
          style={{ color: 'var(--mustard-dossier)' }}
        >
          Find others who have read what you&apos;ve read.
        </h2>

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
          className="mt-6 inline-block font-mono uppercase"
          style={{
            background: 'var(--mustard-dossier)',
            color: 'var(--obsidian-900)',
            padding: '0.75rem 1.25rem',
            fontSize: '11px',
            letterSpacing: '0.18em',
          }}
        >
          Enter the Forum <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
