
import { PrismaClient } from '@prisma/client';
import { getEmbedding, streamContent } from '../src/lib/vertex-ai';
import { BHOOMI_SYSTEM_PROMPT } from '../src/lib/bhoomi-config';

const prisma = new PrismaClient();

async function main() {
    const query = "Who is Bhoomi?";
    const spoilerMode = "S1";

    console.log(`Testing RAG for query: "${query}" [Mode: ${spoilerMode}]`);

    // 1. Embedding
    console.log('Generating embedding...');
    const embedding = await getEmbedding(query);

    // 2. Retrieval
    console.log('Querying Vector Store...');
    const vectorQuery = `[${embedding.join(',')}]`;
    const similarDocs = await prisma.$queryRaw`
      SELECT id, content, metadata, 1 - (embedding <=> ${vectorQuery}::vector) as similarity
      FROM "VectorStore"
      ORDER BY embedding <=> ${vectorQuery}::vector
      LIMIT 3;
    ` as any[];

    console.log(`Found ${similarDocs.length} chunks.`);
    similarDocs.forEach((doc, i) => {
        console.log(`\n[Chunk ${i + 1}] Sim: ${doc.similarity.toFixed(4)} | Meta:`, doc.metadata);
        console.log(`Content: ${doc.content.substring(0, 100)}...`);
    });

    // 3. Generation
    console.log('\nGenerating Answer...');
    const contextText = similarDocs.map((doc, i) => `[Context ${i + 1}]: ${doc.content}`).join('\n\n');
    const fullSystemPrompt = `${BHOOMI_SYSTEM_PROMPT}\n\nRELEVANT CANON CONTEXT:\n${contextText}`;

    const stream = await streamContent(query, fullSystemPrompt);

    process.stdout.write('Bhoomi: ');
    for await (const chunk of stream) {
        const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text || '';
        process.stdout.write(text);
    }
    console.log('\n\nDone.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
