'use client';

import OfficeSidebar from '@/components/office/OfficeSidebar';
import OfficeOverview from '@/components/office/OfficeOverview';

export default function OfficePage() {
  return (
    <main className="min-h-screen w-full bg-black text-zinc-100">
      <div className="flex min-h-screen w-full flex-col xl:flex-row">
        <OfficeSidebar />
        <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <OfficeOverview />
        </div>
      </div>
    </main>
  );
}
