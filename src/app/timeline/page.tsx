import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';
import { TimelineContent } from './timeline-content';

export const metadata: Metadata = pageMetadata.timeline;

export default function TimelinePage() {
  return <TimelineContent />;
}
