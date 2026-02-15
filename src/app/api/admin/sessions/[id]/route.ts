/**
 * GET /api/admin/sessions/[id]
 *
 * Returns a single AI chat session with all messages.  ADMIN‑only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { prisma } from '@/server/db';

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;

    const chatSession = await prisma.aiChatSession.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, name: true, email: true } },
            messages: { orderBy: { createdAt: 'asc' } },
        },
    });

    if (!chatSession) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(chatSession);
}
