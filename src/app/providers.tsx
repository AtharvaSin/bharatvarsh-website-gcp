'use client';

import { FC, ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';

interface ProvidersProps {
  children: ReactNode;
}

/** Client-side providers wrapper. Wraps the app with SessionProvider for next-auth. */
export const Providers: FC<ProvidersProps> = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};
