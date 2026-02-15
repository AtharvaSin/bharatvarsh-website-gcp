
import { prisma } from './src/server/db';

async function main() {
    const users = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { email: true, name: true, role: true }
    });
    console.log('Admin Users:', JSON.stringify(users, null, 2));
}

main().catch(console.error);
