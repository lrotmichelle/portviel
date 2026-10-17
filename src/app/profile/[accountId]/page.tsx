import Link from 'next/link';
import { Star } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage({ params }: { params: { accountId: string } }) {
  const { accountId } = params;
  const [userRating, setUserRating] = useState(0);

  // Mock jobs created by this account
  const jobs = [
    { title: 'Social Media Manager', vacants: 3, recruited: 2 },
    { title: 'Frontend Developer', vacants: 5, recruited: 4 },
    { title: 'Graphics Illustrator', vacants: 2, recruited: 0 },
  ];

  const handleRate = (rating: number) => {
    setUserRating(rating);
  };

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-2">
          <Link href="/discover" className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 underline">
            ← Back to Discover
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-zinc-400 text-sm">Account ID: {accountId}</p>
        </header>

        {/* Account Summary */}
        <section className="rounded-2xl border border-zinc-800/60 bg-black p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Account Summary</h2>
          <div className="grid w-full gap-4 md:grid-cols-2">
            <div className="bg-zinc-900/50 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Account ID</p>
              <p className="text-white font-medium">{accountId}</p>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Status</p>
              <p className="text-emerald-400 font-medium">Active</p>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Platform</p>
              <p className="text-white font-medium">Discover</p>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Total Jobs</p>
              <p className="text-white font-medium">{jobs.length}</p>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Total Vacants</p>
              <p className="text-white font-medium">{jobs.reduce((sum, j) => sum + j.vacants, 0)}</p>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Total Recruited</p>
              <p className="text-white font-medium">{jobs.reduce((sum, j) => sum + j.recruited, 0)}</p>
            </div>
          </div>
        </section>

        {/* Jobs Created Table */}
        <section className="rounded-2xl border border-zinc-800/60 bg-black p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Jobs Created</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="pb-2 text-zinc-500 uppercase tracking-wide font-medium">Title</th>
                  <th className="pb-2 text-zinc-500 uppercase tracking-wide font-medium text-right">Vacants</th>
                  <th className="pb-2 text-zinc-500 uppercase tracking-wide font-medium text-right">Recruited</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, index) => (
                  <tr key={index} className="border-b border-zinc-800/60 hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3 text-zinc-200">{job.title}</td>
                    <td className="py-3 text-zinc-300 font-mono text-right">{job.vacants}</td>
                    <td className="py-3 text-zinc-300 font-mono text-right">{job.recruited}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Star Rating */}
        <section className="rounded-2xl border border-zinc-800/60 bg-black p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">Rate this account</h2>
              <span className={`ml-2 text-[12px] font-bold ${userRating > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                {userRating} / 5
              </span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRate(star)}
                  className={`w-8 h-8 rounded transition-colors duration-200 ${
                    star <= userRating
                      ? 'text-amber-400 fill-amber-400 stroke-amber-400'
                      : 'text-zinc-700 hover:text-amber-400'
                  }`}
                >
                  <Star className="w-full h-full fill-current stroke-current" />
                </button>
              ))}
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">
              {userRating === 0 ? 'Tap a star to rate this account' : `You rated this account ${userRating} star${userRating > 1 ? 's' : ''}`}
            </p>
          </div>
        </section>

        {/* Actions */}
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
