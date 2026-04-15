'use client';

import { FC } from 'react';
import { Pin, Lock, Clock, Eye, MoreHorizontal, Flag } from 'lucide-react';
import { cn } from '@/shared/utils';
import { EyebrowLabel } from '@/shared/ui/EyebrowLabel';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/ui/dropdown-menu';
import { UserAvatar } from './user-avatar';
import { UserBadge } from './user-badge';
import { TopicBadge } from './topic-badge';
import { ReactionBar } from './reaction-bar';
import { ReportDialog } from './report-dialog';
import { QuarantineNotice } from './quarantine-notice';
import { ContentStatusBadge } from './content-status-badge';
import { DossierMarkdown } from './markdown-renderer';
import { useReactions } from '../hooks/use-reactions';
import type { ThreadView } from '../types';

interface ThreadDetailProps {
  thread: ThreadView;
  className?: string;
}

/** Formats an ISO date into a mono-caps dossier timestamp. */
function formatDate(dateStr: string): string {
  return new Date(dateStr)
    .toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    .toUpperCase();
}

/**
 * Classified Chronicle thread detail — full transmission page.
 * Header: eyebrow → title → topic pills → author row.
 * Body: dossier frame with mustard left stripe, DossierMarkdown inside.
 * Reactions: hard-rect mono chips below the body.
 */
export const ThreadDetail: FC<ThreadDetailProps> = ({ thread, className }) => {
  const { counts, toggleReaction } = useReactions(
    thread.id,
    thread.reactionCounts,
  );

  const caseId = thread.id.slice(0, 8).toUpperCase();

  return (
    <article className={cn('space-y-6', className)}>
      {/* ── Eyebrow row: transmission metadata ───────────────────────── */}
      <EyebrowLabel
        segments={[
          'FIELD TRANSMISSION',
          `CASE #${caseId}`,
          formatDate(thread.createdAt),
        ]}
      />

      {/* ── Status chips row: pinned / locked ────────────────────────── */}
      {(thread.isPinned || thread.isLocked) && (
        <div className="flex flex-wrap items-center gap-2">
          {thread.isPinned && (
            <span
              className="inline-flex items-center gap-1.5 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.22em] border"
              style={{
                color: 'var(--mustard-dossier)',
                borderColor: 'var(--mustard-dossier)',
                backgroundColor: 'color-mix(in srgb, var(--mustard-dossier) 12%, transparent)',
              }}
            >
              <Pin className="w-3 h-3" /> PINNED
            </span>
          )}
          {thread.isLocked && (
            <span
              className="inline-flex items-center gap-1.5 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.22em] border"
              style={{
                color: 'var(--redaction)',
                borderColor: 'var(--redaction)',
                backgroundColor: 'color-mix(in srgb, var(--redaction) 12%, transparent)',
              }}
            >
              <Lock className="w-3 h-3" /> LOCKED
            </span>
          )}
        </div>
      )}

      {/* ── Title ────────────────────────────────────────────────────── */}
      <h1
        className="font-display uppercase leading-[0.95] tracking-tight"
        style={{
          fontSize: 'clamp(2rem, 5vw, 4rem)',
          color: 'var(--bone-text)',
        }}
      >
        {thread.title}
      </h1>

      {/* ── Topic pills ──────────────────────────────────────────────── */}
      {thread.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {thread.tags.map((tag) => (
            <TopicBadge
              key={tag.slug}
              name={tag.name}
              color={tag.color}
              size="md"
            />
          ))}
        </div>
      )}

      {/* ── Author row with mustard hairline framing ─────────────────── */}
      <div
        className="flex items-center justify-between gap-4 py-4 border-t border-b"
        style={{
          borderTopColor: 'var(--mustard-dossier)',
          borderBottomColor: 'var(--navy-signal)',
        }}
      >
        <div className="flex items-center gap-4">
          <UserAvatar
            name={thread.author.name}
            image={thread.author.image}
            role={thread.author.role}
            size="md"
          />
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span
                className="font-mono text-xs uppercase tracking-[0.18em]"
                style={{ color: 'var(--bone-text)' }}
              >
                {thread.author.name || 'ANONYMOUS'}
              </span>
              <UserBadge role={thread.author.role} />
              <ContentStatusBadge status={thread.status} />
            </div>
            <div
              className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 font-mono text-[10px] uppercase tracking-[0.15em]"
              style={{ color: 'var(--shadow-text)' }}
            >
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(thread.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {thread.viewCount} VIEWS
              </span>
            </div>
          </div>
        </div>

        {/* Actions menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 border transition-colors shrink-0"
              style={{
                borderColor: 'var(--navy-signal)',
                color: 'var(--shadow-text)',
              }}
              aria-label="Thread actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <ReportDialog
              contentType="thread"
              contentId={thread.id}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Flag className="w-4 h-4 mr-2" />
                  Report Thread
                </DropdownMenuItem>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Quarantine / Removed notice ──────────────────────────────── */}
      <QuarantineNotice status={thread.status} />

      {/* ── Body — dossier page ──────────────────────────────────────── */}
      <div
        className="p-6 md:p-10 border-l-4"
        style={{
          backgroundColor: 'var(--obsidian-deep)',
          borderLeftColor: 'var(--mustard-dossier)',
          borderTop: '1px solid var(--navy-signal)',
          borderRight: '1px solid var(--navy-signal)',
          borderBottom: '1px solid var(--navy-signal)',
        }}
      >
        <DossierMarkdown body={thread.body} density="thread" />
      </div>

      {/* ── Reactions ────────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <ReactionBar counts={counts} onReact={toggleReaction} />
      </div>
    </article>
  );
};
