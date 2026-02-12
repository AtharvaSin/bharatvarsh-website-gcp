import type { Metadata } from 'next';
import { ForumContent } from '@/features/forum';

export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Forum',
  description:
    'Join the Bharatvarsh community — discuss theories, characters, and the alternate history world.',
};

export default function ForumPage() {
  return <ForumContent />;
}
