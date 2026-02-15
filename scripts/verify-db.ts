
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.vectorStore.count();
        console.log(`VectorStore count: ${count}`);

        const sample = await prisma.vectorStore.findFirst();
        console.log('Sample metadata:', sample?.metadata);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
