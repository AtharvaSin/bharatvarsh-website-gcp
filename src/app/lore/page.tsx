import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';
import { LoreContent } from './lore-content';

export const metadata: Metadata = pageMetadata.lore;

export default function LorePage() {
  return <LoreContent />;
}
