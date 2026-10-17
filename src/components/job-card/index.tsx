import { Header } from './header';
import { Content } from './content';
import { Footer } from './footer';

type AccountType = 'employer' | 'employee';

export default function JobCard({ job, onApply, currentAccount }: { job: any; onApply?: (job: any) => void; currentAccount?: { type: AccountType; id: string } | null }) {
  const isOwnJob = currentAccount?.type === 'employer' && currentAccount.id === job.employerAccountId;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between h-full hover:border-zinc-700 transition-all duration-200 shadow-xl">
      <div>
        <Header 
          name={job.employerName} 
          handle={job.handle || '@company'} 
          rating={job.rating || 5.0} 
          daysRemaining={job.daysRemaining} 
          niche={job.title} 
          maxSalary={job.maxSalary} 
        />
        <div className="my-4">
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
      <Footer status={job.status} onApply={() => onApply?.(job)} isOwnJob={isOwnJob} />
    </div>
  );
}