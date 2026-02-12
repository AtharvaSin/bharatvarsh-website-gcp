import type { ReactNode } from 'react';

export const runtime = 'nodejs';

export default function ForumLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
