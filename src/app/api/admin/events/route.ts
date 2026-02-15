/**
 * GET /api/admin/events
 *
 * Paginated, filterable event log.  ADMIN‑only.
 *
 * Query params:
 *   page      — 1‑based page (default 1)
 *   pageSize  — rows per page (default 25, max 100)
 *   name      — filter by event name
 *   userId    — filter by userId
 *   from / to — ISO date range filter on createdAt
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { prisma } from '@/server/db';

export async function GET(req: NextRequest) {
    // ── Auth ───────────────────────────────────────────────
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

    // ── Parse params ───────────────────────────────────────
    const url = req.nextUrl;
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') ?? '25', 10)));
    const nameFilter = url.searchParams.get('name') ?? undefined;
    const userIdFilter = url.searchParams.get('userId') ?? undefined;
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    // ── Build where clause ─────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (nameFilter) where.name = nameFilter;
    if (userIdFilter) where.userId = userIdFilter;
    if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = new Date(from);
        if (to) where.createdAt.lte = new Date(to);
    }

    // ── Query ──────────────────────────────────────────────
    const [data, total] = await Promise.all([
        prisma.event.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.event.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, pageSize });
}
