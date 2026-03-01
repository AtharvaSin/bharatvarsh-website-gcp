import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { auth } from '@/server/auth';
import { getEmbedding, streamContent, reformulateQuery } from '@/lib/vertex-ai';
import { getBhoomiSystemPrompt } from '@/lib/bhoomi-config';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        const { messages, spoilerMode = 'S1', sessionId } = await req.json();
        const lastMessage = messages[messages.length - 1];
        const userQuery = lastMessage.content;

        console.log(`[Bhoomi] Query: "${userQuery}" [Mode: ${spoilerMode}] [User: ${userId || 'Anonymous'}]`);

        // 0. Persist Session & User Message
        const chatSession = await prisma.aiChatSession.upsert({
            where: { id: sessionId },
            create: {
                id: sessionId,
                userId: userId,
                spoilerMode: spoilerMode,
            },
            update: {
                userId: userId, // Link if they logged in mid-conversation
                spoilerMode: spoilerMode,
                updatedAt: new Date(),
            }
        });

        // 0.1 Check Anonymous Limit (5 prompts)
        if (!userId) {
            const userMessageCount = await prisma.aiChatMessage.count({
                where: {
                    sessionId: chatSession.id,
                    role: 'user'
                }
            });

            if (userMessageCount >= 5) {
                const wallMessage = "Ah, traveler... I feel our bond growing, but my memory of the land is deep and requires a steadier anchor. To journey further into the heart of Bharatvarsh, I ask that you [Sign In](/auth/signin) or [Sign in with Google](#signin-google). Your footfalls will be remembered once we meet again.";

                // Still save the user's message so they see it in their history
                await prisma.aiChatMessage.create({
                    data: {
                        sessionId: chatSession.id,
                        role: 'user',
                        content: userQuery,
                    }
                });

                // Return static assistant wall message
                return new NextResponse(wallMessage, {
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                });
            }
        }

        await prisma.aiChatMessage.create({
            data: {
                sessionId: chatSession.id,
                role: 'user',
                content: userQuery,
            }
        });

        // 1. Reformulate Query (Conversational Memory Fix)
        const activeQuery = await reformulateQuery(messages);
        console.log(`[Bhoomi Debug] Original Query: "${userQuery}" | activeQuery: "${activeQuery}"`);

        // 2. Generate Embedding from Reformulated Query
        const embedding = await getEmbedding(activeQuery);

        // 3. Vector Search (Cosine Similarity)
        const vectorQuery = `[${embedding.join(',')}]`;

        const similarDocs = await prisma.$queryRaw`
      SELECT id, content, metadata, 1 - (embedding <=> ${vectorQuery}::vector) as similarity
      FROM "VectorStore"
      WHERE 1 - (embedding <=> ${vectorQuery}::vector) > 0.5  -- Threshold
      ORDER BY embedding <=> ${vectorQuery}::vector
      LIMIT 10;
    ` as Array<{ id: string, content: string, metadata: { spoiler_tier?: string }, similarity: number }>;

        // 4. Filter Context
        // Remove hard filter for unauthenticated users blocking S2.
        // Instead, NEVER return S3. 
        // Pass S1 and S2 to Bhoomi so she can tease S2 if unsigned.
        const validDocs = similarDocs.filter(doc => {
            const tier = doc.metadata?.spoiler_tier || 'S1';
            return tier === 'S1' || tier === 'S2'; // S3 is completely disabled for now
        });

        // Add [Tier: XX] tag to context for Bhoomi to understand the authorization level of the data
        const contextText = validDocs.map((doc, i) => `[Context ${i + 1}] [Tier: ${doc.metadata?.spoiler_tier || 'S1'}]: ${doc.content}`).join('\n\n');

        // 5. Construct Prompt
        const systemPrompt = getBhoomiSystemPrompt(!!userId);
        const fullSystemPrompt = `${systemPrompt}\n\nRELEVANT CANON CONTEXT:\n${contextText || "No specific canon context found for this query."}`;

        // 5. Stream Response & Persist Assistant Message
        const geminiStream = await streamContent(activeQuery, fullSystemPrompt);
        const startTime = Date.now();

        const stream = new ReadableStream({
            async start(controller) {
                let assistantResponse = '';
                try {
                    for await (const chunk of geminiStream) {
                        const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text || '';
                        if (text) {
                            assistantResponse += text;
                            controller.enqueue(new TextEncoder().encode(text));
                        }
                    }

                    // Save Assistant message after stream completes
                    await prisma.aiChatMessage.create({
                        data: {
                            sessionId: chatSession.id,
                            role: 'assistant',
                            content: assistantResponse,
                            metadata: {
                                latencyMs: Date.now() - startTime,
                                contextCount: validDocs.length,
                                spoilerMode: spoilerMode
                            }
                        }
                    });
                } catch (err) {
                    console.error('[Bhoomi Stream Error]', err);
                } finally {
                    controller.close();
                }
            }
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            }
        });

    } catch (error: unknown) {
        console.error('[Bhoomi Error]', error);
        // Return a more descriptive error in dev if needed, or keep it generic for security
        return NextResponse.json({
            error: 'Failed to process request',
            details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
        }, { status: 500 });
    }
}
