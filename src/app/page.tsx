import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { signInWithGoogle } from '@/app/auth/actions';

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.45 13.72 17.74 9.5 24 9.5Z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.4-4.55H24v9.02h12.9c-.58 2.96-2.25 5.47-4.73 7.16l7.65 5.94c4.47-4.13 7.16-10.2 7.16-17.57Z" />
      <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.12.77-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.88l-7.65-5.94C30.13 37.83 27.3 38.75 24 38.75c-6.26 0-11.55-4.22-13.46-9.91l-7.98 6.19C6.51 41.62 14.62 48 24 48Z" />
    </svg>
  );
}

export default async function WelcomePage() {
  const session = await auth();
  if (session) redirect('/discover');

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-16 text-white sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.2),transparent_42%),radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.12),transparent_38%)]" />
      <div className="w-full max-w-5xl">
        <div className="grid overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 shadow-2xl shadow-black/40 backdrop-blur-xl md:grid-cols-[1.1fr_0.9fr]">
          <section className="flex flex-col justify-between p-8 sm:p-12 lg:p-16">
            <div>
              <Link href="/" className="inline-flex items-center gap-3 text-lg font-bold tracking-tight">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 font-black text-slate-950">P</span>
                PortVille
              </Link>
              <p className="mt-16 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">Your next opportunity starts here</p>
              <h1 className="mt-5 max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                One place to build, grow, and trade.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-slate-300 sm:text-lg">
                Discover work, join campaigns, and explore a trusted marketplace—all with your PortVille account.
              </p>
            </div>
            <p className="mt-16 text-xs text-slate-500">A connected marketplace for people, creators, and businesses.</p>
          </section>

          <section className="flex items-center border-t border-white/10 bg-black/20 p-8 sm:p-12 md:border-l md:border-t-0 lg:p-16">
            <div className="mx-auto w-full max-w-sm">
              <p className="text-sm font-medium text-emerald-300">Welcome to PortVille</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">Sign in to continue</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">Create an account or sign in to access the platform.</p>

              <div className="mt-8 space-y-3">
                <form action={signInWithGoogle}>
                  <input type="hidden" name="callbackUrl" value="/discover" />
                  <button type="submit" className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                    <GoogleIcon />
                    Sign in with Google
                  </button>
                </form>
                <form action={signInWithGoogle}>
                  <input type="hidden" name="callbackUrl" value="/discover" />
                  <button type="submit" className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3.5 text-sm font-semibold text-white transition hover:border-emerald-300/40 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                    <GoogleIcon />
                    Sign up with Google
                  </button>
                </form>
              </div>

              <div className="my-6 flex items-center gap-4 text-xs text-slate-500">
                <span className="h-px flex-1 bg-white/10" />
                or
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <Link href="/auth/login" className="block w-full rounded-xl border border-emerald-300/40 px-5 py-3.5 text-center text-sm font-semibold text-emerald-200 transition hover:bg-emerald-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
                Sign in with email
              </Link>
              <p className="mt-5 text-center text-xs leading-5 text-slate-500">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="text-slate-300 underline underline-offset-4 hover:text-white">Terms</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-slate-300 underline underline-offset-4 hover:text-white">Privacy Policy</Link>.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
