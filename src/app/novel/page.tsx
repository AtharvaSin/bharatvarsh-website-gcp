import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';
import { NovelContent } from './novel-content';

export const metadata: Metadata = pageMetadata.novel;

export default function NovelPage() {
  return <NovelContent />;
}
