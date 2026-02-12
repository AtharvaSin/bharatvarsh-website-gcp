'use client';

import { FC, useState } from 'react';
import {
  AlertTriangle,
  Trash2,
  XCircle,
  MessageSquareWarning,
  FileText,
  MessageSquare,
  User,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/utils';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { Pagination } from '@/shared/ui/pagination';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs';
import { Textarea } from '@/shared/ui/textarea';
import { useReports, type ReportView } from '../hooks/use-reports';
import { useModeration } from '../hooks/use-moderation';

interface ModQueueProps {
  className?: string;
}

/**
 * Converts a date string into a human-readable relative time label.
 */
function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

/** Maps report reason values to human-readable badge variants. */
const REASON_VARIANT: Record<string, string> = {
  SPAM: 'warning',
  HARASSMENT: 'alert',
  HATE_SPEECH: 'alert',
  MISINFORMATION: 'warning',
  OFF_TOPIC: 'default',
  SPOILERS: 'default',
  OTHER: 'outline',
};

/** Maps report reason values to display labels. */
const REASON_LABEL: Record<string, string> = {
  SPAM: 'Spam',
  HARASSMENT: 'Harassment',
  HATE_SPEECH: 'Hate Speech',
  MISINFORMATION: 'Misinfo',
  OFF_TOPIC: 'Off Topic',
  SPOILERS: 'Spoilers',
  OTHER: 'Other',
};

/** Truncates text to a maximum length with ellipsis. */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

// ─── Individual Report Card ─────────────────────────

interface ReportCardProps {
  report: ReportView;
  onAction: () => void;
}

const ReportCard: FC<ReportCardProps> = ({ report, onAction }) => {
  const { resolveReport, takeAction, isLoading } = useModeration();
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const contentPreview = report.thread
    ? report.thread.title
    : report.post
      ? truncate(report.post.body, 200)
      : 'Content unavailable';

  const contentAuthor = report.thread
    ? report.thread.author.name
    : report.post
      ? report.post.author.name
      : null;

  const contentType = report.thread ? 'thread' : 'post';

  const handleRemoveContent = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for removing this content.');
      return;
    }
    const targetThread = report.thread?.id;
    const targetPost = report.post?.id;
    const targetUser = report.thread?.author.id ?? report.post?.author.id;

    const actionSuccess = await takeAction({
      action: 'REMOVE_CONTENT',
      reason: reason.trim(),
      targetUserId: targetUser,
      targetThreadId: targetThread,
      targetPostId: targetPost,
    });

    if (actionSuccess) {
      const resolveSuccess = await resolveReport(
        report.id,
        'RESOLVED_REMOVED',
        reason.trim()
      );
      if (resolveSuccess) {
        toast.success('Content removed and report resolved.');
        setActiveAction(null);
        setReason('');
        onAction();
      }
    } else {
      toast.error('Failed to remove content. Please try again.');
    }
  };

  const handleDismiss = async () => {
    const success = await resolveReport(
      report.id,
      'RESOLVED_DISMISSED',
      'Report dismissed by moderator.'
    );
    if (success) {
      toast.success('Report dismissed.');
      onAction();
    } else {
      toast.error('Failed to dismiss report.');
    }
  };

  const handleWarnAuthor = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for the warning.');
      return;
    }
    const targetUser = report.thread?.author.id ?? report.post?.author.id;

    const actionSuccess = await takeAction({
      action: 'WARN_USER',
      reason: reason.trim(),
      targetUserId: targetUser,
      targetThreadId: report.thread?.id,
      targetPostId: report.post?.id,
    });

    if (actionSuccess) {
      const resolveSuccess = await resolveReport(
        report.id,
        'RESOLVED_WARNED',
        reason.trim()
      );
      if (resolveSuccess) {
        toast.success('Author warned and report resolved.');
        setActiveAction(null);
        setReason('');
        onAction();
      }
    } else {
      toast.error('Failed to warn author. Please try again.');
    }
  };

  return (
    <div className="p-4 rounded-lg border border-[var(--obsidian-600)] bg-[var(--obsidian-800)]/50 space-y-3">
      {/* Header: Reason badge + filer + timestamp */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={
            (REASON_VARIANT[report.reason] as 'warning' | 'alert' | 'default' | 'outline') ??
            'default'
          }
        >
          {REASON_LABEL[report.reason] ?? report.reason}
        </Badge>
        <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <User className="w-3 h-3" />
          {report.filer.name || 'Anonymous'}
        </span>
        <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <Clock className="w-3 h-3" />
          {timeAgo(report.createdAt)}
        </span>
      </div>

      {/* Content preview */}
      <div className="p-3 rounded-md bg-[var(--obsidian-700)]/50 border border-[var(--obsidian-600)]">
        <div className="flex items-center gap-1.5 mb-1">
          {contentType === 'thread' ? (
            <FileText className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          ) : (
            <MessageSquare className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          )}
          <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
            {contentType}
          </span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {contentPreview}
        </p>
        {contentAuthor && (
          <p className="text-xs text-[var(--text-muted)] mt-1.5">
            by {contentAuthor}
          </p>
        )}
      </div>

      {/* Report description if provided */}
      {report.description && (
        <p className="text-xs text-[var(--text-muted)] italic border-l-2 border-[var(--obsidian-600)] pl-3">
          &ldquo;{truncate(report.description, 300)}&rdquo;
        </p>
      )}

      {/* Action reason input (shown when Remove or Warn is active) */}
      {activeAction && (
        <div className="space-y-2 pt-1">
          <label className="text-xs font-medium text-[var(--text-secondary)]">
            {activeAction === 'remove'
              ? 'Reason for removal'
              : 'Warning message to author'}
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              activeAction === 'remove'
                ? 'Describe why this content is being removed...'
                : 'Describe the warning to the author...'
            }
            maxLength={1000}
            className="min-h-[60px]"
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {!activeAction ? (
          <>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setActiveAction('remove')}
              disabled={isLoading}
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Remove Content
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              loading={isLoading}
              icon={<XCircle className="w-3.5 h-3.5" />}
            >
              Dismiss
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveAction('warn')}
              disabled={isLoading}
              icon={<MessageSquareWarning className="w-3.5 h-3.5" />}
            >
              Warn Author
            </Button>
          </>
        ) : (
          <>
            <Button
              variant={activeAction === 'remove' ? 'danger' : 'primary'}
              size="sm"
              onClick={
                activeAction === 'remove'
                  ? handleRemoveContent
                  : handleWarnAuthor
              }
              loading={isLoading}
              disabled={!reason.trim()}
            >
              {activeAction === 'remove' ? 'Confirm Removal' : 'Send Warning'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveAction(null);
                setReason('');
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Loading Skeleton ────────────────────────────────

const QueueSkeleton: FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="p-4 rounded-lg border border-[var(--obsidian-600)] bg-[var(--obsidian-800)]/50 space-y-3"
      >
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-20 w-full rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Empty State ─────────────────────────────────────

const EmptyQueue: FC<{ label: string }> = ({ label }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
    <AlertTriangle className="w-10 h-10 text-[var(--text-muted)]" />
    <p className="text-sm text-[var(--text-muted)]">
      No {label} reports found.
    </p>
  </div>
);

// ─── Queue Tab Content ───────────────────────────────

interface QueueTabProps {
  status: string;
  label: string;
}

const QueueTab: FC<QueueTabProps> = ({ status, label }) => {
  const [page, setPage] = useState(1);
  const { reports, pagination, isLoading, refetch } = useReports({
    status,
    page,
    limit: 10,
  });

  if (isLoading) return <QueueSkeleton />;
  if (reports.length === 0) return <EmptyQueue label={label} />;

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} onAction={refetch} />
      ))}
      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          className="pt-4"
        />
      )}
    </div>
  );
};

// ─── Main ModQueue Component ─────────────────────────

/** Moderation queue with tab-based filtering for Open, In Review, and Resolved reports. */
export const ModQueue: FC<ModQueueProps> = ({ className }) => {
  return (
    <div className={cn('space-y-4', className)}>
      <Tabs defaultValue="open">
        <TabsList>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in_review">In Review</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value="open">
          <QueueTab status="OPEN" label="open" />
        </TabsContent>

        <TabsContent value="in_review">
          <QueueTab status="IN_REVIEW" label="in review" />
        </TabsContent>

        <TabsContent value="resolved">
          <QueueTab status="RESOLVED" label="resolved" />
        </TabsContent>
      </Tabs>
    </div>
  );
};
