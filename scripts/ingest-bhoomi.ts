import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getEmbedding } from '../src/lib/vertex-ai';

const prisma = new PrismaClient();

const CONFIG_DIR = path.join(process.cwd(), 'docs', 'Bhoomi Configure');

// Metadata extraction helpers
const extractYear = (text: string, defaultYear?: number): number | undefined => {
    const match = text.match(/\b(1[7-9]\d{2}|20\d{2})\b/);
    return match ? parseInt(match[0]) : defaultYear;
};

const extractEntities = (text: string): string[] => {
    // Simple heuristic: Capitalized words that are likely names (simplified)
    // In production, use NLP. Here we just rely on the content.
    return [];
};

async function processFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);

    console.log(`Processing ${fileName}...`);

    // Parse YAML frontmatter if exists (though usually these are .txt files, we treat them as md/txt)
    // If no frontmatter, matter returns empty data
    const { data: fileMetadata, content: fileContent } = matter(content);

    // Default metadata from filename/context
    const defaultSpoilerTier = fileName.includes('Canon Lore') ? 'S1' : 'S1';
    const docType = fileName.includes('Timeline') ? 'timeline' :
        fileName.includes('Lore') ? 'lore' :
            fileName.includes('Product') ? 'product' : 'general';

    // Split by headers (#, ##)
    // Regex to split but keep the delimiter
    const chunks = fileContent.split(/(^#{1,3}\s.*)/m).filter(Boolean);

    let currentHeader = 'General';
    let accumulatedChunk = '';

    for (const chunk of chunks) {
        if (chunk.trim().startsWith('#')) {
            // It's a header
            if (accumulatedChunk.trim().length > 0) {
                await embedAndStore(accumulatedChunk, fileName, currentHeader, docType, fileMetadata);
                accumulatedChunk = '';
            }
            currentHeader = chunk.trim();
            accumulatedChunk += chunk; // Include header in the content
        } else {
            accumulatedChunk += chunk;
        }
    }

    // Process last chunk
    if (accumulatedChunk.trim().length > 0) {
        await embedAndStore(accumulatedChunk, fileName, currentHeader, docType, fileMetadata);
    }
}

async function embedAndStore(text: string, source: string, context: string, type: string, fileMeta: any) {
    if (text.length < 50) return; // Skip tiny chunks

    const year = extractYear(text);
    const spoilerTier = text.includes('CLASSIFIED') || text.includes('S2') ? 'S2' :
        text.includes('S3') ? 'S3' : 'S1';

    const metadata = {
        source,
        context, // The header
        type,
        year,
        spoiler_tier: spoilerTier,
        ...fileMeta
    };

    console.log(`  - Embedding chunk: ${context.substring(0, 30)}... [${spoilerTier}]`);

    try {
        const embedding = await getEmbedding(text);

        // Use raw SQL for pgvector insertion since Prisma doesn't strictly support the native vector type directly in create yet 
        // OR use the TypedSQL/Extensions preview. 
        // Ideally Prisma 5.10+ supports pgvector with `vector` extension.
        // But `Unsupported("vector")` requires raw query for writes mostly or specific handling.

        await prisma.$executeRaw`
            INSERT INTO "VectorStore" (id, content, metadata, embedding, "updatedAt")
            VALUES (gen_random_uuid(), ${text}, ${metadata}, ${embedding}::vector, NOW())
        `;
    } catch (e) {
        console.error(`Error embedding chunk:`, e);
    }
}

async function main() {
    // 1. Clear existing vectors? (Optional, maybe flag)
    // await prisma.vectorStore.deleteMany({}); 

    const files = fs.readdirSync(CONFIG_DIR).filter(f => f.endsWith('.txt') || f.endsWith('.md'));

    for (const file of files) {
        await processFile(path.join(CONFIG_DIR, file));
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
