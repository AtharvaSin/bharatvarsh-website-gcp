import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';
import { HomeContent } from './home-content';

export const metadata: Metadata = pageMetadata.home;

export default function HomePage() {
  return <HomeContent />;
}
