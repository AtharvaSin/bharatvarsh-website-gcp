/**
 * GET /api/admin/users
 *
 * Paginated user list with event / session counts.  ADMIN‑only.
 *
 * Query params:
 *   page     — 1‑based (default 1)
 *   pageSize — rows per page (default 25, max 100)
 *   search   — filter name / email (case‑insensitive contains)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { prisma } from '@/server/db';

export async function GET(req: NextRequest) {
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

    const url = req.nextUrl;
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') ?? '25', 10)));
    const search = url.searchParams.get('search') ?? undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = search
        ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ],
        }
        : {};

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        }),
        prisma.user.count({ where }),
    ]);

    // Enrich with event + session counts using raw queries
    const userIds = users.map((u) => u.id);

    let eventCounts: { userId: string; count: bigint }[] = [];
    let sessionCounts: { userId: string; count: bigint }[] = [];

    if (userIds.length > 0) {
        [eventCounts, sessionCounts] = await Promise.all([
            prisma.$queryRaw<{ userId: string; count: bigint }[]>`
        SELECT "userId", COUNT(*)::bigint AS count
        FROM "Event"
        WHERE "userId" = ANY(${userIds})
        GROUP BY "userId"
      `,
            prisma.$queryRaw<{ userId: string; count: bigint }[]>`
        SELECT "userId", COUNT(*)::bigint AS count
        FROM "AiChatSession"
        WHERE "userId" = ANY(${userIds})
        GROUP BY "userId"
      `,
        ]);
    }

    const eventCountMap = new Map(
        eventCounts.map((r) => [r.userId, Number(r.count)]),
    );
    const sessionCountMap = new Map(
        sessionCounts.map((r) => [r.userId, Number(r.count)]),
    );

    const data = users.map((u) => ({
        ...u,
        eventCount: eventCountMap.get(u.id) ?? 0,
        sessionCount: sessionCountMap.get(u.id) ?? 0,
    }));

    return NextResponse.json({ data, total, page, pageSize });
}
