import { Header } from './header';
import { Content } from './content';
import { Footer } from './footer';

type AccountType = 'employer' | 'employee';

export default function JobCard({ job, onApply, onEdit, currentAccount, applicationStatus }: { job: any; onApply?: (job: any) => void; onEdit?: (job: any) => void; currentAccount?: { type: AccountType; id: string } | null; applicationStatus?: 'pending' | 'accepted' | 'rejected' | null }) {
  const isOwnJob = currentAccount?.id === job.employerAccountId;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between h-full hover:border-zinc-700 transition-all duration-200 shadow-xl">
      <div className="flex flex-col flex-1">
        <Header 
          name={job.employerName} 
          handle={job.handle || '@company'} 
          accountId={job.employerAccountId || 'acc-unknown'}
          rating={job.rating || 5.0} 
          daysRemaining={job.daysRemaining} 
          niche={job.title} 
          maxSalary={job.maxSalary} 
        />
        <div className="my-4 flex-1">
          <Content 
            title={job.title} 
            requiredPeople={job.requiredPeople} 
            applicants={job.applicants} 
            accepted={job.accepted} 
            description={job.description} 
            requirements={job.requirements} 
          />
        </div>
      </div>
      <Footer status={job.status} onApply={() => onApply?.(job)} onEdit={() => onEdit?.(job)} isOwnJob={isOwnJob} applicationStatus={applicationStatus} />
    </div>
  );
}