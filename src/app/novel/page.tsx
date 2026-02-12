import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';
import { NovelContent } from '@/features/novel/NovelContent';

export const metadata: Metadata = pageMetadata.novel;

export default function NovelPage() {
  return <NovelContent />;
}
