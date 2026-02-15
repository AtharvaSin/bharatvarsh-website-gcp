/**
 * GET /api/admin/sessions
 *
 * Lists AI chat sessions with message count.  ADMIN‑only.
 *
 * Query params:
 *   page     — 1‑based (default 1)
 *   pageSize — rows per page (default 25, max 100)
 *   userId   — optional filter
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
    const userIdFilter = url.searchParams.get('userId') ?? undefined;

    const where = userIdFilter ? { userId: userIdFilter } : {};

    const [data, total] = await Promise.all([
        prisma.aiChatSession.findMany({
            where,
            orderBy: { startedAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                user: { select: { id: true, name: true, email: true } },
                _count: { select: { messages: true } },
            },
        }),
        prisma.aiChatSession.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, pageSize });
}
