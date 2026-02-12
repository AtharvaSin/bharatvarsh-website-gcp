import type { Metadata } from 'next';
import { ThreadContent } from '@/features/forum';

export const runtime = 'nodejs';

interface ThreadPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Thread — Forum',
  description: 'Read and discuss threads in the Bharatvarsh forum.',
};

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { id } = await params;
  return <ThreadContent threadId={id} />;
}
