export type AccountType = 'employer' | 'employee';

export interface HireApplication {
  id: string;
  applicationId: string;
  accountId: string;
  accountType: AccountType;
  date: string;
  time: string;
  applicant: string;
  role: string;
  resume: string;
  resumeType: 'generated' | 'uploaded';
  status: 'Pending' | 'Accepted' | 'Rejected';
}

export const hrApplications: HireApplication[] = [
  { id: 'hr-1', applicationId: 'app-1', accountId: 'acc-employer-1', accountType: 'employer', date: '26|08|26', time: '09:30', applicant: 'Aisha N.', role: 'Social media manager', resume: 'Aisha-N.pdf', resumeType: 'uploaded', status: 'Pending' },
  { id: 'hr-2', applicationId: 'app-2', accountId: 'acc-employer-2', accountType: 'employer', date: '24|08|26', time: '14:10', applicant: 'Kibuka Ali', role: 'Campaign creator', resume: 'Kibuka-Ali.pdf', resumeType: 'generated', status: 'Pending' },
];
