import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.upsert({
        where: { email: 'atharvasingh.24@gmail.com' },
        update: { role: 'ADMIN' },
        create: {
            email: 'atharvasingh.24@gmail.com',
            name: 'Atharva Singh',
            role: 'ADMIN',
            emailVerified: new Date(),
        },
        select: { id: true, email: true, name: true, role: true },
    });
    console.log('Done:', JSON.stringify(user, null, 2));
}

main()
    .catch((e) => { console.error('Error:', e.message); process.exit(1); })
    .finally(() => prisma.$disconnect());
