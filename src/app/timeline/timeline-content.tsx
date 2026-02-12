'use client';

import { TimelineHorizontal } from '@/components/features/timeline';
import timelineData from '@/data/timeline.json';
import type { TimelineData } from '@/types';

export function TimelineContent() {
  const data = timelineData as TimelineData;

  return <TimelineHorizontal events={data.events} />;
}
