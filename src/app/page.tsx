import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';
import { HomeContent } from '@/features/home/HomeContent';
import { getForumStats } from '@/features/home/getForumStats';

export const metadata: Metadata = pageMetadata.home;

// Cached for 5 min so the count queries don't run on every homepage render
export const revalidate = 300;

export default async function HomePage() {
  const stats = await getForumStats();
  return <HomeContent stats={stats} />;
}
