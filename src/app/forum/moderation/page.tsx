import type { Metadata } from 'next';
import { ModerationContent } from '@/features/forum';

export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Moderation | Bharatvarsh',
  description: 'Forum moderation dashboard',
};

export default function ModerationPage() {
  return <ModerationContent />;
}
