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
  console.log('Seeding forum threads...');

  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@bharatvarsh.dev' },
  });
  if (!adminUser) {
    throw new Error('Admin user not found — cannot seed threads');
  }

  for (const thread of forumSeedThreads) {
    const slug = slugify(thread.title);
    const existing = await prisma.thread.findUnique({ where: { slug } });
    if (existing) {
      console.log(`  Skipped (exists): ${thread.title}`);
      continue;
    }

    // Resolve topic IDs from slugs
    const topics = await prisma.topic.findMany({
      where: { slug: { in: thread.topicSlugs } },
    });
    if (topics.length === 0) {
      console.warn(`  Skipped (no matching topics): ${thread.title}`);
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
    console.log(`  Created: ${thread.title} [${thread.topicSlugs.join(', ')}]${thread.isPinned ? ' (pinned)' : ''}`);
  }
  console.log(`  Processed ${forumSeedThreads.length} forum threads.`);

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
