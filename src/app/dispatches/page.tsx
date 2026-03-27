import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';
import { BreadcrumbJsonLd } from '@/components/seo/json-ld';
import { DispatchesContent } from '@/features/dispatches';

export const metadata: Metadata = pageMetadata.dispatches;

export default function DispatchesPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://welcometobharatvarsh.com' },
          { name: 'Dispatches', url: 'https://welcometobharatvarsh.com/dispatches' },
        ]}
      />
      <DispatchesContent />
    </>
  );
}
