'use client';

import ProfileComponent from '@/components/profile/profile-component';

export default function OfficeProfilePage() {
  return (
    <main className="min-h-screen bg-black px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <ProfileComponent accountId="acc-employee-1" />
      </div>
    </main>
  );
}
