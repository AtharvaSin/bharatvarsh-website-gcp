'use client';

import { FC, useState, useEffect, useCallback } from 'react';
import { Shield, ClipboardList, ScrollText, Users, Clock, User } from 'lucide-react';
import { cn } from '@/shared/utils';
import { Skeleton } from '@/shared/ui/skeleton';
import { Badge } from '@/shared/ui/badge';
import { Pagination } from '@/shared/ui/pagination';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs';
import { RoleGate, useSession } from '@/features/auth';
import { ModQueue } from './components/mod-queue';
import type { PaginationMeta } from './types';

interface ModerationContentProps {
  className?: string;
}

// ─── Audit Log Types ─────────────────────────────────

interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  user: { id: string; name: string | null };
  createdAt: string;
  changes: Record<string, unknown> | null;
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

// ─── Audit Log Tab (admin only) ──────────────────────

const AuditLogTab: FC = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLog = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      searchParams.set('page', String(page));
      searchParams.set('limit', '20');

      const res = await fetch(`/api/forum/moderation?${searchParams}`);
      if (!res.ok) throw new Error('Failed to fetch audit log');
      const json = await res.json();
      setEntries(json.data);
      setPagination(json.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchAuditLog();
  }, [fetchAuditLog]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-[var(--status-alert)]">
        {error}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <ScrollText className="w-10 h-10 text-[var(--text-muted)]" />
        <p className="text-sm text-[var(--text-muted)]">
          No audit log entries found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Table Header */}
      <div className="hidden md:grid grid-cols-[1fr_100px_120px_1fr_100px] gap-3 px-4 py-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
        <span>Action</span>
        <span>Entity Type</span>
        <span>Entity ID</span>
        <span>User</span>
        <span>When</span>
      </div>

      {/* Entries */}
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="p-4 rounded-lg border border-[var(--obsidian-600)] bg-[var(--obsidian-800)]/50"
        >
          {/* Desktop layout */}
          <div className="hidden md:grid grid-cols-[1fr_100px_120px_1fr_100px] gap-3 items-center">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {entry.action}
              </Badge>
            </div>
            <span className="text-xs text-[var(--text-secondary)]">
              {entry.entityType}
            </span>
            <span
              className="text-xs text-[var(--text-muted)] font-mono truncate"
              title={entry.entityId}
            >
              {entry.entityId.slice(0, 8)}...
            </span>
            <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
              <User className="w-3 h-3" />
              {entry.user.name || 'System'}
            </span>
            <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <Clock className="w-3 h-3" />
              {timeAgo(entry.createdAt)}
            </span>
          </div>

          {/* Mobile layout */}
          <div className="md:hidden space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {entry.action}
              </Badge>
              <span className="text-xs text-[var(--text-muted)]">
                {entry.entityType}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {entry.user.name || 'System'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(entry.createdAt)}
              </span>
            </div>
          </div>

          {/* Changes preview */}
          {entry.changes && Object.keys(entry.changes).length > 0 && (
            <details className="mt-2">
              <summary className="text-xs text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-secondary)] transition-colors">
                View changes
              </summary>
              <pre className="mt-1 p-2 rounded-md bg-[var(--obsidian-700)] text-xs text-[var(--text-muted)] overflow-x-auto">
                {JSON.stringify(entry.changes, null, 2)}
              </pre>
            </details>
          )}
        </div>
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

// ─── Main ModerationContent Composition ──────────────

/**
 * Moderation dashboard page composition. Protected by RoleGate requiring
 * MODERATOR role. Contains tabs for Reports Queue, Audit Log (admin-only),
 * and User Management (admin placeholder).
 */
export const ModerationContent: FC<ModerationContentProps> = ({
  className,
}) => {
  const { isAdmin } = useSession();

  return (
    <RoleGate role="moderator" showDenied>
      <div
        className={cn('min-h-screen bg-[var(--obsidian-900)]', className)}
      >
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
          {/* Page Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--mustard-500)]/10">
              <Shield className="w-5 h-5 text-[var(--mustard-500)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                Moderation Dashboard
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                Review reports, take actions, and manage community health
              </p>
            </div>
          </div>

          {/* Dashboard Tabs */}
          <Tabs defaultValue="reports">
            <TabsList>
              <TabsTrigger value="reports">
                <ClipboardList className="w-4 h-4 mr-1.5" />
                Reports Queue
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="audit">
                  <ScrollText className="w-4 h-4 mr-1.5" />
                  Audit Log
                </TabsTrigger>
              )}
              {isAdmin && (
                <TabsTrigger value="users">
                  <Users className="w-4 h-4 mr-1.5" />
                  User Management
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="reports">
              <ModQueue />
            </TabsContent>

            {isAdmin && (
              <TabsContent value="audit">
                <AuditLogTab />
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent value="users">
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <Users className="w-10 h-10 text-[var(--text-muted)]" />
                  <p className="text-sm text-[var(--text-muted)]">
                    User management coming soon.
                  </p>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </RoleGate>
  );
};
