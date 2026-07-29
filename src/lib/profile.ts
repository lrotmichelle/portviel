export interface ProfileSummary {
  ownerName: string;
  handle: string;
  role: string;
  location: string;
  bio: string;
  discover: {
    created: number;
    applied: number;
    hired: number;
    pending: number;
    rejected: number;
  };
}

export async function getProfileSummary(): Promise<ProfileSummary> {
  return {
    ownerName: 'Martha',
    handle: '@martha',
    role: 'Buyer',
    location: 'Kampala, Uganda',
    bio: 'Creator-focused buyer profile.',
    discover: {
      created: 12,
      applied: 8,
      hired: 5,
      pending: 15,
      rejected: 10,
    },
  };
}
