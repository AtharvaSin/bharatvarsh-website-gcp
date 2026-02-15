
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import mammoth from 'mammoth';
import TurndownService from 'turndown';
import { getEmbedding } from '../src/lib/vertex-ai';

const prisma = new PrismaClient();

const OLD_CONFIG_DIR = path.join(process.cwd(), 'docs', 'Bhoomi Configure');
const NEW_RAG_DIR = path.join(process.cwd(), 'docs', 'New RAG');

const turndownService = new TurndownService();

// Metadata extraction helpers
const extractYear = (text: string, defaultYear?: number): number | undefined => {
    const match = text.match(/\b(1[7-9]\d{2}|20\d{2})\b/);
    return match ? parseInt(match[0]) : defaultYear;
};

// Map filenames to types and entities
const inferMetadata = (fileName: string) => {
    let type = 'general';
    let entity = 'Unknown';
    let spoiler_tier = 'S1';

    const lowerName = fileName.toLowerCase();

    if (lowerName.includes('character report') || lowerName.includes('bios')) {
        type = 'character';
        if (lowerName.includes('arshi')) entity = 'Arshi';
        if (lowerName.includes('hana')) entity = 'Hana';
        if (lowerName.includes('kaali')) entity = 'Kaali';
        if (lowerName.includes('kahaan')) entity = 'Kahaan';
        if (lowerName.includes('pratap')) entity = 'Pratap';
        if (lowerName.includes('rudra')) entity = 'Rudra';
        if (lowerName.includes('surya')) entity = 'Surya';
    } else if (lowerName.includes('region') || lowerName.includes('wilds') || lowerName.includes('plains') || lowerName.includes('metropoles') || lowerName.includes('hq')) {
        type = 'location';
        if (lowerName.includes('indrapur')) entity = 'Indrapur';
        if (lowerName.includes('northern')) entity = 'Northern Plains';
        if (lowerName.includes('eastern')) entity = 'Eastern Wilds';
        if (lowerName.includes('hypertech')) entity = 'Metropoles';
    } else if (lowerName.includes('lore') || lowerName.includes('world') || lowerName.includes('surveillance')) {
        type = 'lore';
    } else if (lowerName.includes('timeline')) {
        type = 'timeline';
    } else if (lowerName.includes('product')) {
        type = 'product';
    }

    if (lowerName.includes('surya') || lowerName.includes('classified')) {
        spoiler_tier = 'S2'; // Higher tier for sensitive docs
    }

    return { type, entity, spoiler_tier };
};

async function processFile(filePath: string) {
    const fileName = path.basename(filePath);
    console.log(`Processing ${fileName}...`);

    let content = '';
    let fileMetadata: any = {};

    if (fileName.endsWith('.docx')) {
        const buffer = fs.readFileSync(filePath);
        const result = await mammoth.extractRawText({ buffer: buffer });
        content = result.value;
    } else {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const parsed = matter(fileContent);
        content = parsed.content;
        fileMetadata = parsed.data;
    }

    const { type, entity, spoiler_tier } = inferMetadata(fileName);

    // Split by headers or paragraphs if headers absent
    // Improve chunking: Split by double newlines for now, but group small chunks
    const rawChunks = content.split(/\n\s*\n/);

    let currentChunk = '';

    for (const chunk of rawChunks) {
        if (currentChunk.length + chunk.length > 1000) {
            await embedAndStore(currentChunk, fileName, entity, type, { ...fileMetadata, spoiler_tier });
            currentChunk = '';
        }
        currentChunk += chunk + '\n\n';
    }

    if (currentChunk.trim().length > 0) {
        await embedAndStore(currentChunk, fileName, entity, type, { ...fileMetadata, spoiler_tier });
    }
}

async function embedAndStore(text: string, source: string, context: string, type: string, fileMeta: any) {
    if (text.trim().length < 50) return; // Skip tiny chunks

    const year = extractYear(text);

    // Check for inline spoiler tags
    const spoilerTier = text.includes('CLASSIFIED') || text.includes('S2') ? 'S2' :
        text.includes('S3') ? 'S3' : fileMeta.spoiler_tier || 'S1';

    const metadata = {
        source,
        context,
        type,
        year,
        spoiler_tier: spoilerTier,
        ...fileMeta
    };

    console.log(`  - Embedding chunk: ${context} (${type}) [${spoilerTier}]`);

    try {
        const embedding = await getEmbedding(text);

        await prisma.$executeRaw`
            INSERT INTO "VectorStore" (id, content, metadata, embedding, "updatedAt")
            VALUES (gen_random_uuid(), ${text}, ${metadata}, ${embedding}::vector, NOW())
        `;
    } catch (e) {
        console.error(`Error embedding chunk:`, e);
    }
}

async function main() {
    console.log("Cleaning old VectorStore entries...");
    // await prisma.vectorStore.deleteMany({}); // Uncomment to clear DB
    await prisma.$executeRaw`TRUNCATE TABLE "VectorStore"`;

    // Process Old Docs (txt/md)
    if (fs.existsSync(OLD_CONFIG_DIR)) {
        const oldFiles = fs.readdirSync(OLD_CONFIG_DIR).filter(f => f.endsWith('.txt') || f.endsWith('.md'));
        for (const file of oldFiles) {
            // Skip system prompts, only ingest content seeds
            if (file.includes('System') || file.includes('Behaviour')) continue;
            await processFile(path.join(OLD_CONFIG_DIR, file));
        }
    }

    // Process New Docs (docx)
    if (fs.existsSync(NEW_RAG_DIR)) {
        const newFiles = fs.readdirSync(NEW_RAG_DIR).filter(f => f.endsWith('.docx'));
        for (const file of newFiles) {
            await processFile(path.join(NEW_RAG_DIR, file));
        }
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
