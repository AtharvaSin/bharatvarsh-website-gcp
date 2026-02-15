'use client';

import { FC, useEffect, useState } from 'react';
import { Users, UserPlus, Activity, MessageSquare } from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { StatCard } from './StatCard';

interface OverviewData {
    kpis: {
        totalUsers: number;
        newUsers: { value: number; trend: number };
        events: { value: number; trend: number };
        aiSessions: { value: number; trend: number };
    };
    dailyTrend: { date: string; count: number }[];
    topEvents: { name: string; count: number }[];
}

const BAR_COLORS = [
    '#C9DBEE', '#A8C5DD', '#87AFCC', '#F1C232', '#F5D56A',
    '#15506E', '#1A607D', '#8B5CF6', '#10B981', '#3B82F6',
];

export const OverviewDashboard: FC = () => {
    const [data, setData] = useState<OverviewData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/overview')
            .then((r) => r.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="h-28 rounded-xl bg-[var(--obsidian-800)]"
                        />
                    ))}
                </div>
                <div className="h-72 rounded-xl bg-[var(--obsidian-800)]" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="h-64 rounded-xl bg-[var(--obsidian-800)]" />
                    <div className="h-64 rounded-xl bg-[var(--obsidian-800)]" />
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <p className="text-center text-[var(--text-muted)] py-16">
                Failed to load dashboard data.
            </p>
        );
    }

    const { kpis, dailyTrend, topEvents } = data;

    return (
        <div className="space-y-6">
            {/* Page heading */}
            <div>
                <h1 className="font-display text-3xl text-[var(--powder-300)]">
                    Overview
                </h1>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                    Last 7 days vs. previous 7 days
                </p>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<Users className="w-5 h-5" />}
                    label="Total Users"
                    value={kpis.totalUsers}
                />
                <StatCard
                    icon={<UserPlus className="w-5 h-5" />}
                    label="New Users (7d)"
                    value={kpis.newUsers.value}
                    trend={kpis.newUsers.trend}
                />
                <StatCard
                    icon={<Activity className="w-5 h-5" />}
                    label="Events (7d)"
                    value={kpis.events.value}
                    trend={kpis.events.trend}
                />
                <StatCard
                    icon={<MessageSquare className="w-5 h-5" />}
                    label="AI Sessions (7d)"
                    value={kpis.aiSessions.value}
                    trend={kpis.aiSessions.trend}
                />
            </div>

            {/* Daily activity area chart */}
            <div className="rounded-xl border border-[var(--obsidian-700)] bg-[var(--obsidian-800)] p-5">
                <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-4">
                    Daily Activity (30 days)
                </h2>
                {dailyTrend.length === 0 ? (
                    <p className="text-center text-[var(--text-muted)] py-12">
                        No event data yet.
                    </p>
                ) : (
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={dailyTrend}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor="var(--powder-300)"
                                        stopOpacity={0.4}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--powder-300)"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--obsidian-700)"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                                tickFormatter={(d: string) => {
                                    const dt = new Date(d);
                                    return `${dt.getMonth() + 1}/${dt.getDate()}`;
                                }}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                                width={40}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--obsidian-800)',
                                    border: '1px solid var(--obsidian-700)',
                                    borderRadius: 8,
                                    color: 'var(--text-primary)',
                                    fontSize: 12,
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="var(--powder-300)"
                                strokeWidth={2}
                                fill="url(#colorCount)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Bottom row: top events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top events */}
                <div className="rounded-xl border border-[var(--obsidian-700)] bg-[var(--obsidian-800)] p-5">
                    <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-4">
                        Top Events (7d)
                    </h2>
                    {topEvents.length === 0 ? (
                        <p className="text-center text-[var(--text-muted)] py-12">
                            No events yet.
                        </p>
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart
                                data={topEvents}
                                layout="vertical"
                                margin={{ left: 10, right: 10 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="var(--obsidian-700)"
                                    horizontal={false}
                                />
                                <XAxis
                                    type="number"
                                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                                    width={110}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--obsidian-800)',
                                        border: '1px solid var(--obsidian-700)',
                                        borderRadius: 8,
                                        color: 'var(--text-primary)',
                                        fontSize: 12,
                                    }}
                                />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                    {topEvents.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={BAR_COLORS[i % BAR_COLORS.length]}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Placeholder for workflow funnel — will render once page_view events are tracked */}
                <div className="rounded-xl border border-[var(--obsidian-700)] bg-[var(--obsidian-800)] p-5">
                    <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-4">
                        Workflow Funnel
                    </h2>
                    <div className="py-12 text-center text-[var(--text-muted)] text-sm space-y-2">
                        <p>Home → Novel → Lore → Timeline → Forum</p>
                        <p className="text-xs">
                            Funnel data will populate once page_view events are tracked.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
