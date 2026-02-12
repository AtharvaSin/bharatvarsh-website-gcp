'use client';

import { TimelineHorizontal } from '@/features/timeline';
import timelineData from '@/content/data/timeline.json';
import type { TimelineData } from '@/types';

export function TimelineContent() {
  const data = timelineData as TimelineData;

  return <TimelineHorizontal events={data.events} />;
}
