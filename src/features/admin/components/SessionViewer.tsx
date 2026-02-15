'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Clock, MessageSquare } from 'lucide-react';
import { cn } from '@/shared/utils';

interface SessionSummary {
    id: string;
    spoilerMode: string;
    startedAt: string;
    updatedAt: string;
    user: { id: string; name: string | null; email: string } | null;
    _count: { messages: number };
}

interface ChatMessage {
    id: string;
    role: string;
    content: string;
    metadata: Record<string, unknown> | null;
    createdAt: string;
}

interface SessionDetail {
    id: string;
    spoilerMode: string;
    startedAt: string;
    user: { id: string; name: string | null; email: string } | null;
    messages: ChatMessage[];
}

const SPOILER_BADGE: Record<string, string> = {
    S1: 'bg-[var(--status-success)]/20 text-[var(--status-success)]',
    S2: 'bg-[var(--status-warning)]/20 text-[var(--status-warning)]',
    S3: 'bg-[var(--status-alert)]/20 text-[var(--status-alert)]',
};

export const SessionViewer: FC = () => {
    const [sessions, setSessions] = useState<SessionSummary[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [detail, setDetail] = useState<SessionDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const pageSize = 20;

    const fetchSessions = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        try {
            const res = await fetch(`/api/admin/sessions?${params}`);
            const json = await res.json();
            setSessions(json.data ?? []);
            setTotal(json.total ?? 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    // Load detail when selected
    useEffect(() => {
        if (!selectedId) {
            setDetail(null);
            return;
        }
        setDetailLoading(true);
        fetch(`/api/admin/sessions/${selectedId}`)
            .then((r) => r.json())
            .then(setDetail)
            .catch(console.error)
            .finally(() => setDetailLoading(false));
    }, [selectedId]);

    const totalPages = Math.ceil(total / pageSize);

    const filteredSessions = searchTerm
        ? sessions.filter(
            (s) =>
                s.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.id.includes(searchTerm),
        )
        : sessions;

    return (
        <div className="space-y-5">
            <h1 className="font-display text-3xl text-[var(--powder-300)]">
                AI Chat Sessions
            </h1>

            <div className="flex flex-col lg:flex-row gap-4 min-h-[600px]">
                {/* Left panel — session list */}
                <div className="w-full lg:w-[380px] flex-shrink-0 rounded-xl border border-[var(--obsidian-700)] bg-[var(--obsidian-800)] flex flex-col overflow-hidden">
                    {/* Search */}
                    <div className="p-3 border-b border-[var(--obsidian-700)]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                            <input
                                type="text"
                                placeholder="Search sessions…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-[var(--obsidian-850)] border border-[var(--obsidian-700)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--mustard-500)]"
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            [...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="px-4 py-3 border-b border-[var(--obsidian-700)]"
                                >
                                    <div className="h-4 w-3/4 rounded bg-[var(--obsidian-700)] animate-pulse mb-2" />
                                    <div className="h-3 w-1/2 rounded bg-[var(--obsidian-700)] animate-pulse" />
                                </div>
                            ))
                        ) : filteredSessions.length === 0 ? (
                            <p className="text-center text-[var(--text-muted)] py-12 text-sm">
                                No sessions found.
                            </p>
                        ) : (
                            filteredSessions.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setSelectedId(s.id)}
                                    className={cn(
                                        'w-full text-left px-4 py-3 border-b border-[var(--obsidian-700)] transition-colors',
                                        selectedId === s.id
                                            ? 'bg-[var(--obsidian-700)] border-l-[3px] border-l-[var(--mustard-500)]'
                                            : 'hover:bg-[var(--obsidian-850)]',
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-[var(--text-primary)] truncate">
                                            {s.user?.email ?? s.user?.name ?? 'Anonymous'}
                                        </span>
                                        <span
                                            className={cn(
                                                'text-[10px] px-1.5 py-0.5 rounded font-mono',
                                                SPOILER_BADGE[s.spoilerMode] ?? SPOILER_BADGE.S1,
                                            )}
                                        >
                                            {s.spoilerMode}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                                        <span className="flex items-center gap-1">
                                            <MessageSquare className="w-3 h-3" />
                                            {s._count.messages} msgs
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(s.startedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 p-3 border-t border-[var(--obsidian-700)] text-sm">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(page - 1)}
                                className="p-1 rounded hover:bg-[var(--obsidian-700)] disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-[var(--text-muted)] text-xs">
                                {page} / {totalPages}
                            </span>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage(page + 1)}
                                className="p-1 rounded hover:bg-[var(--obsidian-700)] disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Right panel — message thread */}
                <div className="flex-1 rounded-xl border border-[var(--obsidian-700)] bg-[var(--obsidian-800)] flex flex-col overflow-hidden">
                    {!selectedId ? (
                        <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] text-sm">
                            Select a session to view the conversation.
                        </div>
                    ) : detailLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-[var(--mustard-500)] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : detail ? (
                        <>
                            {/* Session header */}
                            <div className="px-5 py-3 border-b border-[var(--obsidian-700)] flex items-center gap-4 text-sm">
                                <span className="font-mono text-xs text-[var(--text-muted)]">
                                    {detail.id.slice(0, 12)}…
                                </span>
                                <span className="text-[var(--text-secondary)]">
                                    {detail.user?.email ?? 'Anonymous'}
                                </span>
                                <span
                                    className={cn(
                                        'text-[10px] px-1.5 py-0.5 rounded font-mono',
                                        SPOILER_BADGE[detail.spoilerMode] ?? SPOILER_BADGE.S1,
                                    )}
                                >
                                    {detail.spoilerMode}
                                </span>
                                <span className="text-xs text-[var(--text-muted)]">
                                    {detail.messages.length} messages
                                </span>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                {detail.messages.map((msg) => {
                                    const isUser = msg.role === 'user';
                                    return (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                'max-w-[80%]',
                                                isUser ? 'ml-auto' : 'mr-auto',
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'rounded-xl px-4 py-3 text-sm',
                                                    isUser
                                                        ? 'bg-[var(--navy-700)] text-[var(--text-primary)]'
                                                        : 'bg-[var(--obsidian-700)] text-[var(--text-primary)]',
                                                )}
                                            >
                                                {msg.content}
                                            </div>
                                            {!isUser && msg.metadata && (
                                                <div className="flex items-center gap-3 mt-1 text-[10px] text-[var(--text-muted)] font-mono">
                                                    {(() => {
                                                        const meta = msg.metadata as Record<string, unknown>;
                                                        const latency = meta.latencyMs as number | undefined;
                                                        const ctxCount = meta.contextCount as number | undefined;
                                                        return (
                                                            <>
                                                                {latency != null && (
                                                                    <span>⏱ {latency / 1000}s</span>
                                                                )}
                                                                {ctxCount != null && (
                                                                    <span>{ctxCount} ctx</span>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] text-sm">
                            Session not found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
