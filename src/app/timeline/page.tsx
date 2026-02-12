import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';
import { TimelineContent } from '@/features/timeline/TimelineContent';

export const metadata: Metadata = pageMetadata.timeline;

export default function TimelinePage() {
  return <TimelineContent />;
}
