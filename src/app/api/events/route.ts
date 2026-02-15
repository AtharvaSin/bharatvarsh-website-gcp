/**
 * POST /api/events — Lightweight event ingestion endpoint.
 *
 * Accepts { name, payload?, sessionId? } and writes a row to the Event table.
 * If the caller is authenticated the userId is attached automatically.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { auth } from '@/server/auth';
import type { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, payload, sessionId } = body as {
            name?: string;
            payload?: Record<string, unknown>;
            sessionId?: string;
        };

        if (!name || typeof name !== 'string') {
            return NextResponse.json(
                { error: 'Missing or invalid "name" field' },
                { status: 400 },
            );
        }

        // Attach userId when the caller is signed in
        let userId: string | undefined;
        try {
            const session = await auth();
            userId = session?.user?.id;
        } catch {
            // Anonymous — no user id
        }

        await prisma.event.create({
            data: {
                name: name.trim(),
                payload: (payload ?? undefined) as Prisma.InputJsonValue | undefined,
                userId: userId ?? null,
                sessionId: sessionId ?? null,
            },
        });

        return NextResponse.json({ ok: true }, { status: 201 });
    } catch (err) {
        console.error('[events] ingestion error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}
