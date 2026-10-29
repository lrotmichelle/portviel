import { Suspense } from 'react';
import ManageComponent from '../manage';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 p-8 text-white">Loading...</div>}>
      <ManageComponent />
    </Suspense>
  );
}
