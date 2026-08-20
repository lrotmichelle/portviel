import type { CampaignCardData } from '@/types/campaign';

const sampleNiches = ['duet', 'sound', 'ugc', 'logo', 'clipping', 'growth', 'lifestyle', 'gaming', 'travel', 'food', 'fashion', 'fitness'];
const sampleCategories = ['Technology', 'Lifestyle', 'Gaming', 'Entertainment', 'Sports', 'Education', 'Luxury', 'Music', 'Travel', 'Food', 'Fashion', 'Fitness'];
const sampleDescriptions = [
  'Influencer campaign to promote a new product launch.',
  'Short-form video challenge to boost brand awareness.',
  'UGC creation campaign targeting lifestyle creators.',
  'Brand awareness push for seasonal sale.',
  'Product review campaign for tech accessories.',
  'Calling creators for logo reveal content.',
  'Micro-influencer campaign for local businesses.',
  'Compilation video series sponsorship.',
  'Travel vlog series featuring top destinations.',
  'Recipe creation challenge for new kitchen gadgets.',
  'Style and outfit showcase for upcoming collection.',
  'Workout and fitness motivation content series.',
];
const sampleUsernames = ['publisher1', 'publisher2', 'publisher3', 'publisher4', 'publisher5', 'publisher6', 'publisher7', 'publisher8', 'publisher9', 'publisher10'];

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randPick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function generateJoinedCampaigns(count = 50): CampaignCardData[] {
  const campaigns: CampaignCardData[] = [];
  for (let i = 0; i < count; i++) {
    const id = String(2000 + i);
    const totalBudget = randInt(50000, 5000000);
    const budgetUsed = Math.floor(totalBudget * (Math.random() * 0.9 + 0.1));
    const incomeReceived = Math.floor(budgetUsed * (Math.random() * 0.6 + 0.05));
    const debt = budgetUsed - incomeReceived;
    const status = Math.random() < 0.08 ? 'Paused' : (Math.random() < 0.12 ? 'Completed' : 'Active');

    campaigns.push({
      id,
      publisherProfileIcon: '/images/publisher-placeholder.png',
      projectName: `${randPick(sampleCategories)} Campaign ${i + 1}`,
      publisherUsername: `${randPick(sampleUsernames)}${randInt(1, 99)}`,
      publisherRating: parseFloat((3 + Math.random() * 2).toFixed(1)),
      timeRemainingDays: randInt(1, 60),
      nicheHashtag: randPick(sampleNiches),
      description: randPick(sampleDescriptions),
      category: randPick(sampleCategories),
      status,
      communitySize: randInt(1000, 100000),
      viewsGenerated: randInt(5000, 1000000),
      likesGenerated: randInt(500, 50000),
      totalBudget,
      budgetUsed,
      highestMcp: randInt(100, 1200),
      hasJoined: true,
      requiredPlatforms: ['tiktok', 'instagram', 'youtube'].slice(0, randInt(1, 3)),
      startDate: new Date(Date.now() - randInt(1, 30) * 24 * 60 * 60 * 1000).toISOString(),
      minPayout: randInt(1000, 50000),
      maxPayout: randInt(50000, 500000),
      lastEditedAt: new Date(Date.now() - randInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
      participants: Array.from({ length: randInt(1, 8) }).map((_, idx) => ({
        id: String(idx + 1),
        name: `Creator ${idx + 1}`,
        progress: randInt(20, 100),
        submitted: Math.random() < 0.7,
        approved: Math.random() < 0.4,
      })),
      incomeReceived,
      debt,
      rank: randInt(1, 100),
    });
  }
  return campaigns;
}
