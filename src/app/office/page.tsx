import PaymentMethods from '@/components/office/finance/payment-methods';
import Withdrawals from '@/components/office/finance/withdrawals';
import Deposit from '@/components/office/finance/deposit';
import RecentTransactions from '@/components/office/finance/recent-transactions';
import ProfileForm from '@/components/office/profile/profile-form';
import Resumes from '@/components/office/profile/resumes';
import Applications from '@/components/office/profile/applications';

export default function OfficePage() {
  return (
    <main className="min-h-screen bg-black px-4 py-8 text-zinc-100 sm:px-6 lg:px-8 max-[500px]:px-2 max-[500px]:overflow-x-hidden no-scrollbar">
      <div className="mx-auto max-w-7xl space-y-8 max-[500px]:w-full max-[500px]:max-w-none no-scrollbar">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Office</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Your workspace</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">Manage your profile, finances, applications, and account activity from one place.</p>
        </header>

        <section className="flex flex-col gap-6 lg:grid-cols-2 lg:grid" aria-label="Finance">
          <PaymentMethods />
          <div className="flex flex-col gap-6">
            <Withdrawals />
            <Deposit />
          </div>
          <RecentTransactions />
        </section>

        <section className="flex flex-col gap-6 lg:grid-cols-3 lg:grid" aria-label="Profile">
          <ProfileForm />
          <Resumes />
          <Applications />
        </section>
      </div>
    </main>
  );
}
