import type { Metadata } from 'next';
import { ThreadContent } from '@/features/forum';
import { prisma } from '@/server/db';

export const runtime = 'nodejs';

interface ThreadPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ThreadPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const thread = await prisma.thread.findUnique({
      where: { id },
      select: { title: true, body: true },
    });

    if (thread) {
      return {
        title: `${thread.title} — Forum`,
        description:
          thread.body?.substring(0, 155).replace(/\n/g, ' ') ||
          'Read and discuss this thread in the Bharatvarsh forum.',
      };
    }
  } catch {
    // Fall through to default metadata
  }

  return {
    title: 'Thread — Forum',
    description: 'Read and discuss threads in the Bharatvarsh forum.',
  };
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { id } = await params;
  return <ThreadContent threadId={id} />;
}
