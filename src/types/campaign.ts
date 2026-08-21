export interface CampaignCardData {
  id: string;
  publisherProfileIcon: string;
  projectName: string;
  publisherUsername: string;
  publisherRating: number;
  timeRemainingDays: number;
  nicheHashtag: string;
  description: string;
  category: string;
  status: string;
  communitySize: number;
  viewsGenerated: number;
  likesGenerated: number;
  totalBudget: number;
  budgetUsed: number;
  highestMcp: number;
  hasJoined: boolean;
  requiredPlatforms?: string[];
  startDate?: string;
  minPayout?: number;
  maxPayout?: number;
  lastEditedAt?: string;
  participants?: Array<{
    id: string;
    name: string;
    progress: number;
    submitted: boolean;
    approved: boolean;
  }>;
  feedback?: string;
  incomeReceived?: number;
  debt?: number;
  rank?: number;
  platformStats?: Array<{
    platform: string;
    views?: number;
    likes?: number;
    members?: number;
  }>;
}
