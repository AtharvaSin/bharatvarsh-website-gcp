'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils';

interface EventRow {
    id: string;
    name: string;
    payload: Record<string, unknown> | null;
    userId: string | null;
    sessionId: string | null;
    createdAt: string;
}

const EVENT_BADGE_COLORS: Record<string, string> = {
    page_view: 'bg-[var(--status-info)]/20 text-[var(--status-info)]',
    signup: 'bg-[var(--status-success)]/20 text-[var(--status-success)]',
    chapter_read: 'bg-[var(--event-era)]/20 text-[var(--event-era)]',
    ai_chat: 'bg-[var(--faction-mesh)]/20 text-[var(--faction-mesh)]',
    forum_post: 'bg-[var(--mustard-500)]/20 text-[var(--mustard-500)]',
};

const DEFAULT_BADGE = 'bg-[var(--obsidian-700)] text-[var(--text-secondary)]';

export const EventExplorer: FC = () => {
    const [events, setEvents] = useState<EventRow[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(25);
    const [loading, setLoading] = useState(true);
    const [nameFilter, setNameFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        if (nameFilter) params.set('name', nameFilter);
        if (userFilter) params.set('userId', userFilter);

        try {
            const res = await fetch(`/api/admin/events?${params}`);
            const json = await res.json();
            setEvents(json.data ?? []);
            setTotal(json.total ?? 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, nameFilter, userFilter]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="space-y-5">
            <h1 className="font-display text-3xl text-[var(--powder-300)]">
                Event Log
            </h1>

            {/* Filters */}
            <div className="glass rounded-xl p-4 flex flex-wrap items-end gap-3 border border-[var(--obsidian-700)]">
                <div className="flex-1 min-w-[180px]">
                    <label className="block text-xs text-[var(--text-muted)] mb-1">
                        Event Name
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. page_view"
                        value={nameFilter}
                        onChange={(e) => {
                            setNameFilter(e.target.value);
                            setPage(1);
                        }}
                        className="w-full bg-[var(--obsidian-800)] border border-[var(--obsidian-700)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--mustard-500)]"
                    />
                </div>
                <div className="flex-1 min-w-[180px]">
                    <label className="block text-xs text-[var(--text-muted)] mb-1">
                        User ID
                    </label>
                    <input
                        type="text"
                        placeholder="Filter by user"
                        value={userFilter}
                        onChange={(e) => {
                            setUserFilter(e.target.value);
                            setPage(1);
                        }}
                        className="w-full bg-[var(--obsidian-800)] border border-[var(--obsidian-700)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--mustard-500)]"
                    />
                </div>
                <button
                    onClick={() => { setPage(1); fetchEvents(); }}
                    className="px-4 py-2 bg-[var(--mustard-500)] text-[var(--navy-900)] rounded-lg text-sm font-medium hover:bg-[var(--mustard-600)] transition-colors"
                >
                    <Search className="w-4 h-4 inline mr-1" />
                    Apply
                </button>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-[var(--obsidian-700)] bg-[var(--obsidian-800)] overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[var(--obsidian-700)]">
                            <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                                Timestamp
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                                Event
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                                User
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                                Payload
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i}>
                                    <td colSpan={4} className="px-4 py-3">
                                        <div className="h-4 rounded bg-[var(--obsidian-700)] animate-pulse" />
                                    </td>
                                </tr>
                            ))
                        ) : events.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="text-center text-[var(--text-muted)] py-16"
                                >
                                    No events match your filters.
                                </td>
                            </tr>
                        ) : (
                            events.map((evt, idx) => (
                                <>
                                    <tr
                                        key={evt.id}
                                        className={cn(
                                            'border-b border-[var(--obsidian-700)] hover:bg-[var(--obsidian-700)] transition-colors cursor-pointer',
                                            idx % 2 === 0
                                                ? 'bg-[var(--obsidian-800)]'
                                                : 'bg-[var(--obsidian-850)]',
                                        )}
                                        onClick={() =>
                                            setExpandedId(expandedId === evt.id ? null : evt.id)
                                        }
                                    >
                                        <td className="px-4 py-3 font-mono text-xs text-[var(--text-secondary)] whitespace-nowrap">
                                            {new Date(evt.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={cn(
                                                    'text-xs px-2 py-0.5 rounded-full font-medium',
                                                    EVENT_BADGE_COLORS[evt.name] ?? DEFAULT_BADGE,
                                                )}
                                            >
                                                {evt.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-[var(--text-secondary)]">
                                            {evt.userId ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                                            {evt.payload ? '{ … } ▶' : '—'}
                                        </td>
                                    </tr>
                                    {expandedId === evt.id && evt.payload && (
                                        <tr key={`${evt.id}-detail`}>
                                            <td
                                                colSpan={4}
                                                className="px-6 py-3 bg-[var(--obsidian-850)]"
                                            >
                                                <pre className="font-mono text-xs text-[var(--powder-300)] whitespace-pre-wrap break-all">
                                                    {JSON.stringify(evt.payload, null, 2)}
                                                </pre>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
                    <span>
                        Showing {(page - 1) * pageSize + 1}–
                        {Math.min(page * pageSize, total)} of {total.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                            className="p-2 rounded-lg hover:bg-[var(--obsidian-700)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            const p = i + 1;
                            return (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={cn(
                                        'w-8 h-8 rounded-lg text-sm transition-colors',
                                        p === page
                                            ? 'bg-[var(--mustard-500)] text-[var(--navy-900)] font-medium'
                                            : 'hover:bg-[var(--obsidian-700)] text-[var(--text-secondary)]',
                                    )}
                                >
                                    {p}
                                </button>
                            );
                        })}
                        {totalPages > 5 && (
                            <span className="px-1 text-[var(--text-muted)]">…</span>
                        )}
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(page + 1)}
                            className="p-2 rounded-lg hover:bg-[var(--obsidian-700)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
