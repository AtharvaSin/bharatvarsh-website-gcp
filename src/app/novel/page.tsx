import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';
import { NovelContent } from '@/features/novel/NovelContent';
import { BookJsonLd, BreadcrumbJsonLd } from '@/components/seo/json-ld';

export const metadata: Metadata = pageMetadata.novel;

export default function NovelPage() {
  return (
    <>
      <BookJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://welcometobharatvarsh.com' },
          { name: 'The Novel', url: 'https://welcometobharatvarsh.com/novel' },
        ]}
      />
      <NovelContent />
    </>
  );
}
