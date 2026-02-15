
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://postgres:bharatvarshdb@localhost:5433/bharatvarsh',
        },
    },
});

async function main() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        console.log('--- Users in Database ---');
        if (users.length === 0) {
            console.log('No users found.');
        } else {
            console.table(users);
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
