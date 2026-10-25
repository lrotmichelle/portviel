'use client';

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInWithGoogle } from "@/app/auth/actions";

export default function SignupPage() {
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") || "/discover";

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-zinc-400 mt-2">
            Join PortVille today with your Google account
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-800"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-black px-2 text-zinc-500">Continue with</span>
          </div>
        </div>

        <form action={signInWithGoogle}>
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <button className="w-full py-3 bg-white text-zinc-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-100 disabled:opacity-50 transition-colors border border-zinc-200">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66v-2.77c-1.16-.78-1.95-1.94-2.21-3.31H12v-4.26H5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77c1.82 1.68 4.31 2.66 7.28 2.66"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.26-1.37-.2-2.25-.2-2.25s.07-1.53.2-2.25c1.16.78 1.95 1.94 2.21 3.31v2.77H2.57c-2.08-1.92-3.28-4.74-3.28-8.09 0-3.35 1.2-6.52 3.28-8.89v2.77c-1.16.78-1.95 1.94-2.21 3.31 1.16.78 1.95 1.94 2.21 3.31v2.77c-1.82 1.68-4.31 2.66-7.28 2.66"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64v2.77c-1.16-.78-1.95-1.94-2.21-3.31H12v-1.1c-1.62 0-3.06.56-4.21 1.64V5.38c2.97 0 5.46.98 7.28 2.66v2.77c-1.82-1.68-4.31-2.66-7.28-2.66"
            />
          </svg>
            Sign up with Google
          </button>
        </form>

        <div className="text-center space-y-2">
          <Link href="/auth/login" className="text-emerald-400 hover:underline text-sm">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
