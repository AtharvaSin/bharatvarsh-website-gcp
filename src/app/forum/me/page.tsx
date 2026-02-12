import type { Metadata } from 'next';
import { ProfileContent } from '@/features/forum';

export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'My Profile — Forum',
  description: 'View your Bharatvarsh forum profile and activity.',
};

export default function ProfilePage() {
  return <ProfileContent />;
}
