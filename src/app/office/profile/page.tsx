'use client';

import { useSession } from 'next-auth/react';
import ProfileComponent from '@/components/profile/profile-component';

export default function OfficeProfilePage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <main className="min-h-screen bg-black px-4 py-8 text-zinc-400">Loading your profile...</main>;
  }

  const userId = session?.user?.id;
  if (!userId) {
    return <main className="min-h-screen bg-black px-4 py-8 text-zinc-400">Sign in to view your profile.</main>;
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <ProfileComponent accountId={`acc-${userId}`} userName={session.user.name} />
      </div>
    </main>
  );
}
