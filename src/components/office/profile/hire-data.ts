export interface HireApplication {
  id: string;
  date: string;
  time: string;
  applicant: string;
  role: string;
  resume: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export const hrApplications: HireApplication[] = [
  { id: 'hr-1', date: '26|08|26', time: '09:30', applicant: 'Aisha N.', role: 'Social media manager', resume: 'Aisha-N.pdf', status: 'pending' },
  { id: 'hr-2', date: '24|08|26', time: '14:10', applicant: 'Kibuka Ali', role: 'Campaign creator', resume: 'Kibuka-Ali.pdf', status: 'pending' },
  { id: 'hr-3', date: '22|08|26', time: '11:45', applicant: 'Rita N.', role: 'Content writer', resume: 'Rita-N.pdf', status: 'accepted' },
  { id: 'hr-4', date: '20|08|26', time: '16:20', applicant: 'John D.', role: 'Graphic designer', resume: 'John-D.pdf', status: 'rejected' },
  { id: 'hr-5', date: '18|08|26', time: '08:15', applicant: 'Sarah K.', role: 'Social media manager', resume: 'Sarah-K.pdf', status: 'pending' },
  { id: 'hr-6', date: '15|08|26', time: '13:05', applicant: 'Alex M.', role: 'Campaign creator', resume: 'Alex-M.pdf', status: 'pending' },
  { id: 'hr-7', date: '12|08|26', time: '10:40', applicant: 'David M.', role: 'Content writer', resume: 'David-M.pdf', status: 'accepted' },
  { id: 'hr-8', date: '10|08|26', time: '15:55', applicant: 'Grace L.', role: 'Graphic designer', resume: 'Grace-L.pdf', status: 'pending' },
];
