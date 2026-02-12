import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';
import { HomeContent } from '@/features/home/HomeContent';

export const metadata: Metadata = pageMetadata.home;

export default function HomePage() {
  return <HomeContent />;
}
