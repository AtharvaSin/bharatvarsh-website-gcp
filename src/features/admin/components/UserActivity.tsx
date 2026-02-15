'use client';

import { FC, useCallback, useEffect, useState, useMemo } from 'react';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { cn } from '@/shared/utils';

interface UserRow {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
    eventCount: number;
    sessionCount: number;
}

const ROLE_BADGE: Record<string, string> = {
    ADMIN: 'bg-[var(--mustard-500)]/20 text-[var(--mustard-500)]',
    MEMBER: 'bg-[var(--powder-400)]/20 text-[var(--powder-400)]',
    MODERATOR: 'bg-[var(--event-era)]/20 text-[var(--event-era)]',
    VISITOR: 'bg-[var(--obsidian-600)] text-[var(--text-muted)]',
};

type SortKey = 'createdAt' | 'eventCount' | 'sessionCount';
type SortDir = 'asc' | 'desc';

export const UserActivity: FC = () => {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(25);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [sortKey, setSortKey] = useState<SortKey>('createdAt');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize),
        });
        if (search) params.set('search', search);

        try {
            const res = await fetch(`/api/admin/users?${params}`);
            const json = await res.json();
            setUsers(json.data ?? []);
            setTotal(json.total ?? 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, search]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const totalPages = Math.ceil(total / pageSize);

    const sortedUsers = useMemo(() => {
        const sorted = [...users].sort((a, b) => {
            let valA: number, valB: number;
            if (sortKey === 'createdAt') {
                valA = new Date(a.createdAt).getTime();
                valB = new Date(b.createdAt).getTime();
            } else {
                valA = a[sortKey];
                valB = b[sortKey];
            }
            return sortDir === 'asc' ? valA - valB : valB - valA;
        });
        return sorted;
    }, [users, sortKey, sortDir]);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    };

    const SortIcon: FC<{ column: SortKey }> = ({ column }) => {
        if (sortKey !== column) return null;
        return sortDir === 'asc' ? (
            <ChevronUp className="w-3 h-3 inline ml-1" />
        ) : (
            <ChevronDown className="w-3 h-3 inline ml-1" />
        );
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="font-display text-3xl text-[var(--powder-300)]">
                    User Activity
                </h1>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                    type="text"
                    placeholder="Search by name or email…"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-[var(--obsidian-800)] border border-[var(--obsidian-700)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--mustard-500)]"
                />
            </div>

            {/* Table */}
            <div className="rounded-xl border border-[var(--obsidian-700)] bg-[var(--obsidian-800)] overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[var(--obsidian-700)]">
                            <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                                Name
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                                Email
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                                Role
                            </th>
                            <th
                                onClick={() => toggleSort('createdAt')}
                                className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-secondary)]"
                            >
                                Joined
                                <SortIcon column="createdAt" />
                            </th>
                            <th
                                onClick={() => toggleSort('eventCount')}
                                className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-secondary)]"
                            >
                                Events
                                <SortIcon column="eventCount" />
                            </th>
                            <th
                                onClick={() => toggleSort('sessionCount')}
                                className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-secondary)]"
                            >
                                Sessions
                                <SortIcon column="sessionCount" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i}>
                                    <td colSpan={6} className="px-4 py-3">
                                        <div className="h-4 rounded bg-[var(--obsidian-700)] animate-pulse" />
                                    </td>
                                </tr>
                            ))
                        ) : sortedUsers.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="text-center text-[var(--text-muted)] py-16"
                                >
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            sortedUsers.map((user, idx) => (
                                <>
                                    <tr
                                        key={user.id}
                                        onClick={() =>
                                            setExpandedId(expandedId === user.id ? null : user.id)
                                        }
                                        className={cn(
                                            'border-b border-[var(--obsidian-700)] hover:bg-[var(--obsidian-700)] transition-colors cursor-pointer',
                                            idx % 2 === 0
                                                ? 'bg-[var(--obsidian-800)]'
                                                : 'bg-[var(--obsidian-850)]',
                                        )}
                                    >
                                        <td className="px-4 py-3 text-[var(--text-primary)]">
                                            <span className="mr-1">
                                                {expandedId === user.id ? (
                                                    <ChevronDown className="w-3 h-3 inline" />
                                                ) : (
                                                    <ChevronRight className="w-3 h-3 inline" />
                                                )}
                                            </span>
                                            {user.name ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-[var(--text-secondary)]">
                                            {user.email}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={cn(
                                                    'text-xs px-2 py-0.5 rounded-full font-medium',
                                                    ROLE_BADGE[user.role] ?? ROLE_BADGE.VISITOR,
                                                )}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-[var(--text-secondary)] tabular-nums">
                                            {user.eventCount.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-[var(--text-secondary)] tabular-nums">
                                            {user.sessionCount}
                                        </td>
                                    </tr>
                                    {expandedId === user.id && (
                                        <tr key={`${user.id}-detail`}>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-4 bg-[var(--obsidian-850)] border-l-2 border-[var(--powder-300)]"
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                                    <div>
                                                        <p className="font-medium text-[var(--text-secondary)] mb-2">
                                                            User Details
                                                        </p>
                                                        <p className="text-[var(--text-muted)]">
                                                            ID:{' '}
                                                            <span className="font-mono text-[var(--powder-300)]">
                                                                {user.id}
                                                            </span>
                                                        </p>
                                                        <p className="text-[var(--text-muted)] mt-1">
                                                            Joined:{' '}
                                                            <span className="text-[var(--text-secondary)]">
                                                                {new Date(user.createdAt).toLocaleString()}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-[var(--text-secondary)] mb-2">
                                                            Activity Summary
                                                        </p>
                                                        <p className="text-[var(--text-muted)]">
                                                            Total events:{' '}
                                                            <span className="text-[var(--powder-300)]">
                                                                {user.eventCount.toLocaleString()}
                                                            </span>
                                                        </p>
                                                        <p className="text-[var(--text-muted)] mt-1">
                                                            AI chat sessions:{' '}
                                                            <span className="text-[var(--powder-300)]">
                                                                {user.sessionCount}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
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
