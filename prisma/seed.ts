/**
 * Prisma seed script — populates default forum topics and test users.
 * Run with: npx prisma db seed
 */

import { PrismaClient, UserRole, ContentStatus, AiCheckResult } from '@prisma/client';
import { forumSeedThreads } from './forum-seed-threads';

const prisma = new PrismaClient();

/** Simple slugify for seed script (avoids importing from src/) */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .trim();
}

const DEFAULT_TOPICS = [
  {
    name: 'General Discussion',
    slug: 'general',
    description: 'Open conversation about Bharatvarsh and the community.',
    icon: 'MessageSquare',
    color: '--powder-500',
    sortOrder: 0,
  },
  {
    name: 'Plot & Theories',
    slug: 'plot-theories',
    description:
      'Discuss plot points, speculate on future events, and share your theories.',
    icon: 'Lightbulb',
    color: '--mustard-500',
    sortOrder: 1,
  },
  {
    name: 'Characters',
    slug: 'characters',
    description:
      'Deep dives into character analysis, motivations, and development.',
    icon: 'Users',
    color: '--navy-500',
    sortOrder: 2,
  },
  {
    name: 'World Building',
    slug: 'world-building',
    description:
      'Explore the alternate history, factions, technology, and lore of the Bharatvarsh universe.',
    icon: 'Globe',
    color: '--event-era',
    sortOrder: 3,
  },
  {
    name: 'Announcements',
    slug: 'announcements',
    description:
      'Official announcements from the Bharatvarsh team. Only admins can create threads here.',
    icon: 'Megaphone',
    color: '--status-warning',
    sortOrder: 4,
    isLocked: false,
  },
];

const TEST_USERS = [
  {
    name: 'Admin User',
    email: 'admin@bharatvarsh.dev',
    role: UserRole.ADMIN,
    bio: 'Forum administrator.',
  },
  {
    name: 'Moderator User',
    email: 'mod@bharatvarsh.dev',
    role: UserRole.MODERATOR,
    bio: 'Community moderator.',
  },
  {
    name: 'Test Member',
    email: 'member@bharatvarsh.dev',
    role: UserRole.MEMBER,
    bio: 'A regular forum member who loves alternate history.',
  },
];

async function main(): Promise<void> {
  console.log('Seeding default topics...');
  for (const topic of DEFAULT_TOPICS) {
    await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: {},
      create: topic,
    });
  }
  console.log(`  Created ${DEFAULT_TOPICS.length} topics.`);

  console.log('Seeding test users...');
  for (const user of TEST_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        emailVerified: new Date(),
      },
    });
  }
  console.log(`  Created ${TEST_USERS.length} test users.`);

  // --- Forum seed threads ---
  // Wipe-and-reseed strategy: every run of `npm run db:seed` deletes ALL
  // threads previously authored by the admin user and recreates the canonical
  // 9 from prisma/forum-seed-threads.ts. This guarantees that the live forum
  // always matches the file — old seed content (from earlier iterations of
  // forum-seed-threads.ts) gets removed instead of lingering forever because
  // its slug already exists in the DB.
  //
  // SAFETY NOTE: real users post under their own user accounts, not the
  // admin@bharatvarsh.dev account. This wipe ONLY targets admin-authored
  // threads, which are exclusively the seeded canonical set.
  console.log('Seeding forum threads (wipe-and-reseed)...');

  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@bharatvarsh.dev' },
  });
  if (!adminUser) {
    throw new Error('Admin user not found — cannot seed threads');
  }

  // Step 1: delete all admin-authored threads. Cascades drop their tag links,
  // posts, reactions, and view counters per the schema's onDelete: Cascade.
  // Reports have an optional Thread FK without an explicit onDelete cascade,
  // so detach them first to avoid an FK constraint failure on databases where
  // the migration recorded NO ACTION instead of SET NULL.
  const adminThreadIds = await prisma.thread.findMany({
    where: { authorId: adminUser.id },
    select: { id: true },
  });
  if (adminThreadIds.length > 0) {
    await prisma.report.updateMany({
      where: { threadId: { in: adminThreadIds.map((t) => t.id) } },
      data: { threadId: null },
    });
  }
  const wiped = await prisma.thread.deleteMany({
    where: { authorId: adminUser.id },
  });
  if (wiped.count > 0) {
    console.log(`  Wiped ${wiped.count} stale admin-authored thread(s).`);
  }

  // Step 2: re-insert every thread from forum-seed-threads.ts.
  let created = 0;
  let skippedNoTopic = 0;
  for (const thread of forumSeedThreads) {
    const slug = slugify(thread.title);

    const topics = await prisma.topic.findMany({
      where: { slug: { in: thread.topicSlugs } },
    });
    if (topics.length === 0) {
      console.warn(`  Skipped (no matching topics): ${thread.title}`);
      skippedNoTopic++;
      continue;
    }

    await prisma.thread.create({
      data: {
        title: thread.title,
        slug,
        body: thread.body,
        isPinned: thread.isPinned,
        status: ContentStatus.PUBLISHED,
        aiCheckResult: AiCheckResult.SKIPPED,
        authorId: adminUser.id,
        tags: {
          create: topics.map((t) => ({ topicId: t.id })),
        },
      },
    });
    created++;
    console.log(`  Created: ${thread.title} [${thread.topicSlugs.join(', ')}]${thread.isPinned ? ' (pinned)' : ''}`);
  }
  console.log(`  Processed ${forumSeedThreads.length} forum threads — created ${created}, skipped ${skippedNoTopic}.`);

  console.log('Seed complete.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
