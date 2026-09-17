'use client';

import React from 'react';
import Link from 'next/link';

interface SectionProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  buttons: { label: string; href: string; variant: 'amber' | 'emerald' | 'blue' | 'red' }[];
}

function Section({ title, subtitle, children, buttons }: SectionProps) {
  const variantClasses = {
    amber: 'border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-white active:bg-amber-500 active:text-white',
    emerald: 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-white active:bg-emerald-500 active:text-white',
    blue: 'border-blue-500/40 text-blue-300 hover:bg-blue-500 hover:text-white active:bg-blue-500 active:text-white',
    red: 'border-red-500/40 text-red-300 hover:bg-red-500 hover:text-white active:bg-red-500 active:text-white',
  };

  return (
    <section className="rounded-2xl border border-zinc-800/60 bg-black p-6">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <p className="mt-1 text-sm uppercase tracking-[0.2em] text-zinc-400">{subtitle}</p>
      <div className="mt-4 text-sm text-zinc-300 leading-relaxed">{children}</div>
      <div className="mt-5 flex flex-wrap gap-3">
        {buttons.map((btn) => (
          <Link
            key={btn.label}
            href={btn.href}
            className={`rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors duration-200 ${variantClasses[btn.variant]}`}
          >
            {btn.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
    </svg>
  );
}

function SnapchatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.206.793c.99 0 4.347.276 5.93 4.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301a.42.42 0 01.17-.025c.115 0 .316.042.501.315.113.164.168.39.132.625a4.067 4.067 0 01-.278 1.18c-.148.354-.393.667-.698.88-.22.148-.466.264-.738.356a.436.436 0 00-.224.09.414.414 0 00-.131.368c.015.204.106.421.288.619.182.198.466.35.856.453a.424.424 0 01.26.14.416.416 0 01.076.32c-.096.25-.323.448-.693.596a5.38 5.38 0 01-1.296.555c-.453.132-.933.227-1.443.28-.33.036-.671.053-1.023.05a10.872 10.872 0 01-1.023-.05 5.381 5.381 0 01-1.296-.555c-.37-.148-.597-.346-.693-.596a.416.416 0 01.076-.32.424.424 0 01.26-.14c.39-.103.674-.255.856-.453a1.68 1.68 0 00.288-.619.414.414 0 00-.131-.368.436.436 0 00-.224-.09c-.272-.092-.518-.208-.738-.356-.305-.213-.55-.526-.698-.88a4.067 4.067 0 01-.278-1.18c-.036-.235.019-.461.132-.625.185-.273.386-.315.501-.315.06 0 .118.01.17.025.374.181.733.285 1.033.301.198 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.859 1.07 11.216.793 12.206.793zM12 2.8c-.85 0-3.78.24-5.18 3.93-.345.912-.244 2.686-.153 4.106a.424.424 0 00.18.273c.13.081.3.135.527.135.32 0 .628-.098.922-.294a.396.396 0 01.22-.073c.15 0 .334.053.556.216.222.163.422.414.6.753.178.339.267.74.267 1.201 0 .36-.059.707-.176.99-.117.283-.308.518-.574.703a1.61 1.61 0 01-.928.336h-.001a1.607 1.607 0 01-.928-.336 1.944 1.944 0 01-.574-.703c-.117-.283-.176-.63-.176-.99 0-.461.089-.862.267-1.201a3.63 3.63 0 01.6-.753c.222-.163.406-.216.556-.216a.396.396 0 01.22.073c.294.196.602.294.922.294.227 0 .397-.054.527-.135a.424.424 0 00.18-.273c.091-1.42.192-3.194-.153-4.106C15.78 3.04 12.85 2.8 12 2.8z" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="text-center">
          <div className="flex items-center justify-center gap-3">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
              <FacebookIcon className="h-5 w-5" />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
              <TikTokIcon className="h-5 w-5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a href="https://snapchat.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
              <SnapchatIcon className="h-5 w-5" />
            </a>
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">Social Media</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Your social media command center.</h1>
          <p className="mt-4 text-lg text-zinc-400">Discover opportunities, run campaigns, buy or sell accounts, all in one place.</p>
        </header>

        <Section
          title="Discover"
          subtitle="Get hired or hire"
          buttons={[{ label: 'Discover', href: '/campaign', variant: 'emerald' }]}
        >
          <p className="text-white">
            <span className="font-semibold">Hire</span> You need workers. Post a vacancy on the Discover page, describe the worker you need, then wait for the applications to come in.
          </p>
          <p className="mt-2 text-zinc-400">
            <span className="font-semibold">Get hired</span> Someone needs you. Create a professional CV either with us or upload your custom CV. Don&apos;t lose your energy, keep applying. You will be recruited. You&apos;re waiting in the Discover section.
          </p>
        </Section>

        <Section
          title="Campaign"
          subtitle="Need engagement or money"
          buttons={[
            { label: '+ Campaign', href: '/campaign-manager/manage', variant: 'amber' },
            { label: '+ Campaign', href: '/campaign-manager/joined', variant: 'amber' },
          ]}
        >
          <p className="text-white">
            <span className="font-semibold">Engagement</span> You need more customers or you want to get famous. You can have it all at your own budget. Create a hashtag, hire influencers, let it have uncontrolled traffic as you drive it to millions. It will increase your engagement with your customers, making clear the brand ambassador that fits well for your brand. This is a giveaway to your customers too, so expect much love and feedback.
          </p>
          <p className="mt-2 text-zinc-400">
            <span className="font-semibold">Make money</span> No funds shall be embezzled. Whoever participates shall be rewarded according to their performance in views. This is a better distribution of the brand advertisement fees. You will be much appreciated by the brands and be friends with them. This will also boost your engagement with fair chances to be chosen as their brand ambassador. Take your share.
          </p>
        </Section>

        <Section
          title="Market"
          subtitle="Sale or buy no scams"
          buttons={[
            { label: '+ Sale', href: '/market', variant: 'red' },
            { label: 'Market', href: '/market', variant: 'blue' },
          ]}
        >
          <p className="text-white">
            <span className="font-semibold">Sale</span> You need money? Sell your social media account right here for accounts greater than 3k followers. Your price, your account, but keep it fair.
          </p>
          <p className="mt-2 text-zinc-400">
            <span className="font-semibold">Buy</span> You want a big account or account with great engagement? Go through the Market page, choose what fits your budget, business, or yourself.
          </p>
        </Section>

        <section className="rounded-2xl border border-zinc-800/60 bg-black p-6">
          <h2 className="text-2xl font-bold text-white">Office</h2>
          <p className="mt-1 text-sm uppercase tracking-[0.2em] text-zinc-400">Orchestrator</p>
          <div className="mt-4 space-y-2 text-sm text-zinc-300">
            <p><span className="font-semibold">Finance</span> All incomes shall be stored here: deposit or withdraw.</p>
            <p><span className="font-semibold">Discover</span> Applications and resumes shall be viewed here.</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/office" className="rounded-lg border border-emerald-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300 transition-colors duration-200 hover:bg-emerald-500 hover:text-white active:bg-emerald-500 active:text-white">Office</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
