import type { Metadata } from 'next';
import { TopicContent } from '@/features/forum';

export const runtime = 'nodejs';

interface TopicPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const title = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return {
    title: `${title} — Forum`,
    description: `Browse ${title} discussions in the Bharatvarsh forum.`,
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  return <TopicContent slug={slug} />;
}
