/**
 * GET /api/admin/overview
 *
 * Returns aggregated KPIs, daily‑event trend (30 d), top event names,
 * and workflow‑funnel data.  ADMIN‑only.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { prisma } from '@/server/db';

export async function GET() {
    // ── Auth gate ──────────────────────────────────────────
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });

    if (dbUser?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ── Date boundaries ────────────────────────────────────
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86_400_000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 86_400_000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000);

    // ── KPI counts ─────────────────────────────────────────
    const [
        totalUsers,
        newUsers7d,
        prevNewUsers7d,
        totalEvents7d,
        prevEvents7d,
        aiSessions7d,
        prevAiSessions7d,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        prisma.user.count({
            where: { createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
        }),
        prisma.event.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        prisma.event.count({
            where: { createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
        }),
        prisma.aiChatSession.count({ where: { startedAt: { gte: sevenDaysAgo } } }),
        prisma.aiChatSession.count({
            where: { startedAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
        }),
    ]);

    // ── Daily event trend (30 d) ───────────────────────────
    const dailyTrend: { date: string; count: bigint }[] = await prisma.$queryRaw`
    SELECT DATE("createdAt") AS date, COUNT(*)::bigint AS count
    FROM "Event"
    WHERE "createdAt" >= ${thirtyDaysAgo}
    GROUP BY DATE("createdAt")
    ORDER BY date ASC;
  `;

    // ── Top event names (7 d) ──────────────────────────────
    const topEvents = await prisma.event.groupBy({
        by: ['name'],
        where: { createdAt: { gte: sevenDaysAgo } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
    });

    // ── Helpers ────────────────────────────────────────────
    function trendPct(current: number, previous: number): number {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    }

    return NextResponse.json({
        kpis: {
            totalUsers,
            newUsers: { value: newUsers7d, trend: trendPct(newUsers7d, prevNewUsers7d) },
            events: { value: totalEvents7d, trend: trendPct(totalEvents7d, prevEvents7d) },
            aiSessions: { value: aiSessions7d, trend: trendPct(aiSessions7d, prevAiSessions7d) },
        },
        dailyTrend: dailyTrend.map((r) => ({
            date: String(r.date),
            count: Number(r.count),
        })),
        topEvents: topEvents.map((e) => ({
            name: e.name,
            count: e._count.id,
        })),
    });
}
