import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { getEmbedding } from '@/lib/vertex-ai';

export async function POST(req: NextRequest) {
    try {
        // 1. Security Check
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.INTERNAL_API_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { query, spoilerMode = 'S1' } = await req.json();

        if (!query) {
            return NextResponse.json({ error: 'Missing query' }, { status: 400 });
        }

        // 2. Generate Embedding
        const embedding = await getEmbedding(query);

        // 3. Vector Search
        const vectorQuery = `[${embedding.join(',')}]`;
        const similarDocs = await prisma.$queryRaw`
            SELECT id, content, metadata, 1 - (embedding <=> ${vectorQuery}::vector) as similarity
            FROM "VectorStore"
            WHERE 1 - (embedding <=> ${vectorQuery}::vector) > 0.5
            ORDER BY embedding <=> ${vectorQuery}::vector
            LIMIT 3;
        ` as any[];

        // 4. Filter Context
        const validDocs = similarDocs.filter(doc => {
            const tier = doc.metadata?.spoiler_tier || 'S1';
            if (spoilerMode === 'S3') return true;
            if (spoilerMode === 'S2') return tier === 'S1' || tier === 'S2';
            return tier === 'S1';
        });

        // 5. Format Output
        const contextText = validDocs.map((doc, i) => `[Context ${i + 1}]: ${doc.content}`).join('\n\n');

        return NextResponse.json({
            context: contextText,
            docCount: validDocs.length
        });

    } catch (error: any) {
        console.error('[Internal RAG Error]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
