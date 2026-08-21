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

function generatePlatformPercentages(count: number): number[] {
  if (count === 1) return [100];
  const percentages: number[] = [];
  let remaining = 100;
  for (let i = 0; i < count - 1; i++) {
    const maxForThis = remaining - (count - i - 1) * 5;
    const minForThis = Math.min(5, maxForThis);
    const value = randInt(minForThis, maxForThis);
    percentages.push(value);
    remaining -= value;
  }
  percentages.push(remaining);
  return percentages;
}

export function generateJoinedCampaigns(count = 30): CampaignCardData[] {
  const campaigns: CampaignCardData[] = [];
  for (let i = 0; i < count; i++) {
    const id = String(2000 + i);
    const totalBudget = randInt(50000, 5000000);
    const budgetUsed = Math.floor(totalBudget * (Math.random() * 0.9 + 0.1));
    const incomeReceived = Math.floor(budgetUsed * (Math.random() * 0.6 + 0.05));
    const debt = budgetUsed - incomeReceived;
    const timeRemainingDays = randInt(0, 60);
    const status = timeRemainingDays <= 0 ? 'Expired' : (Math.random() < 0.08 ? 'Paused' : (Math.random() < 0.12 ? 'Completed' : 'Active'));
    const platforms = ['tiktok', 'instagram', 'youtube'].slice(0, randInt(1, 4));
    const communitySize = randInt(1000, 100000);
    const viewsGenerated = randInt(5000, 1000000);
    const likesGenerated = randInt(500, 50000);
    const platformPercentages = generatePlatformPercentages(platforms.length);

    const platformStats = platforms.map((platform, idx) => {
      const pct = platformPercentages[idx] / 100;
      return {
        platform,
        views: Math.round(viewsGenerated * pct),
        likes: Math.round(likesGenerated * pct),
        members: Math.round(communitySize * pct),
      };
    });

    const participantCount = randInt(3, 12);
    const participants = Array.from({ length: participantCount }).map((_, idx) => ({
      id: String(idx + 1),
      name: idx === 0 ? 'You' : `Creator ${idx + 1}`,
      progress: randInt(20, 100),
      submitted: Math.random() < 0.7,
      approved: Math.random() < 0.4,
    }));

    campaigns.push({
      id,
      publisherProfileIcon: '/images/publisher-placeholder.png',
      projectName: `${randPick(sampleCategories)} Campaign ${i + 1}`,
      publisherUsername: `${randPick(sampleUsernames)}${randInt(1, 99)}`,
      publisherRating: parseFloat((3 + Math.random() * 2).toFixed(1)),
      timeRemainingDays,
      nicheHashtag: randPick(sampleNiches),
      description: randPick(sampleDescriptions),
      category: randPick(sampleCategories),
      status,
      communitySize,
      viewsGenerated,
      likesGenerated,
      totalBudget,
      budgetUsed,
      highestMcp: randInt(100, 1200),
      hasJoined: true,
      requiredPlatforms: platforms,
      startDate: new Date(Date.now() - randInt(1, 30) * 24 * 60 * 60 * 1000).toISOString(),
      minPayout: randInt(1000, 50000),
      maxPayout: randInt(50000, 500000),
      lastEditedAt: new Date(Date.now() - randInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
      participants,
      incomeReceived,
      debt,
      rank: randInt(1, participantCount),
      platformStats,
    });
  }
  return campaigns;
}
