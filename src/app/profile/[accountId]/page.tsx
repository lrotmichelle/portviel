import Link from 'next/link';

export default function ProfilePage({ params }: { params: { accountId: string } }) {
  const { accountId } = params;

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-2">
          <Link href="/discover" className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 underline">
            ← Back to Discover
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-zinc-400 text-sm">Account ID: {accountId}</p>
        </header>

        <section className="rounded-2xl border border-zinc-800/60 bg-black p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
          <div className="space-y-3 text-sm text-zinc-300">
            <p><span className="font-semibold text-zinc-400 uppercase tracking-[0.1em] text-xs">Account ID</span>{accountId}</p>
            <p><span className="font-semibold text-zinc-400 uppercase tracking-[0.1em] text-xs">Status</span><span className="text-emerald-400">Active</span></p>
            <p><span className="font-semibold text-zinc-400 uppercase tracking-[0.1em] text-xs">Platform</span>Discover</p>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800/60 bg-black p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Actions</h2>
          <div className="grid w-full gap-3 md:grid-cols-2">
            <Link href="/office" className="rounded-xl border border-emerald-500/40 px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-emerald-300 hover:bg-emerald-500 hover:text-black transition-colors duration-200">
              Go to Office
            </Link>
            <Link href="/office/resume" className="rounded-xl border border-zinc-700 px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors duration-200">
              View Resume
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
