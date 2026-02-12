import type { Metadata } from 'next';
import { NewThreadContent } from '@/features/forum';

export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'New Thread — Forum',
  description: 'Start a new discussion in the Bharatvarsh forum.',
};

export default function NewThreadPage() {
  return <NewThreadContent />;
}
