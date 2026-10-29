import { Suspense } from 'react';
import JoinedComponent from '../joined';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 p-8 text-white">Loading...</div>}>
      <JoinedComponent />
    </Suspense>
  );
}
