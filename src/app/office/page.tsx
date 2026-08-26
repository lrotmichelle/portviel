import PaymentMethods from '@/components/office/finance/payment-methods';
import Withdrawals from '@/components/office/finance/withdrawals';
import Deposit from '@/components/office/finance/deposit';
import RecentTransactions from '@/components/office/finance/recent-transactions';
import ProfileForm from '@/components/office/profile/profile-form';
import Resumes from '@/components/office/profile/resumes';
import Applications from '@/components/office/profile/applications';

export default function OfficePage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Office</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Your workspace</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">Manage your profile, finances, applications, and account activity from one place.</p>
        </header>

        <section className="grid gap-6 lg:grid-cols-2" aria-label="Finance">
          <PaymentMethods />
          <div className="space-y-6">
            <Withdrawals />
            <Deposit />
          </div>
          <RecentTransactions />
        </section>

        <section className="grid gap-6 lg:grid-cols-3" aria-label="Profile">
          <ProfileForm />
          <Resumes />
          <Applications />
        </section>
      </div>
    </main>
  );
}
