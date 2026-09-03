export interface MyApplication {
  id: string;
  date: string;
  time: string;
  role: string;
  employer: string;
  status: 'pending' | 'accepted' | 'rejected';
  resumeType: 'generated' | 'uploaded';
}

export const myApplications: MyApplication[] = [
  { id: 'my-1', date: '26|08|26', time: '09:30', role: 'Presidential campaign', employer: 'PortVille HR', status: 'pending', resumeType: 'generated' },
  { id: 'my-2', date: '20|08|26', time: '16:45', role: 'Growth campaign', employer: 'Martha Media', status: 'accepted', resumeType: 'uploaded' },
  { id: 'my-3', date: '15|08|26', time: '11:20', role: 'Product launch', employer: 'Market House', status: 'rejected', resumeType: 'generated' },
  { id: 'my-4', date: '12|08|26', time: '14:10', role: 'Brand campaign', employer: 'PortVille HR', status: 'pending', resumeType: 'generated' },
  { id: 'my-5', date: '10|08|26', time: '08:55', role: 'Social media manager', employer: 'Martha Media', status: 'pending', resumeType: 'uploaded' },
  { id: 'my-6', date: '08|08|26', time: '16:30', role: 'Content writer', employer: 'Market House', status: 'accepted', resumeType: 'generated' },
  { id: 'my-7', date: '05|08|26', time: '13:15', role: 'Campaign creator', employer: 'PortVille HR', status: 'pending', resumeType: 'generated' },
  { id: 'my-8', date: '02|08|26', time: '10:40', role: 'Graphic designer', employer: 'Martha Media', status: 'rejected', resumeType: 'uploaded' },
];
