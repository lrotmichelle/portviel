'use client';

import { useSession } from 'next-auth/react';
import ProfilePage from '@/components/profile/ProfilePage';

export default function OfficeProfilePage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <main className="min-h-screen bg-black px-4 py-8 text-zinc-400">Loading your profile...</main>;
  }

  if (!session?.user?.id) {
    return <main className="min-h-screen bg-black px-4 py-8 text-zinc-400">Sign in to view your profile.</main>;
  }

  return (
    <main className="flex min-h-full flex-1 flex-col bg-black">
      <ProfilePage />
    </main>
  );
}
