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
];

function createRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function generateCampaigns(count = 30): CampaignCardData[] {
  const random = createRandom(20260825);
  const randInt = (min: number, max: number) => Math.floor(random() * (max - min + 1)) + min;
  const campaigns: CampaignCardData[] = [];
  for (let i = 0; i < count; i++) {
    const id = String(3000 + i);
    const totalBudget = randInt(20000, 2000000);
    const debit = Math.floor(totalBudget * (0.35 + random() * 0.55));
    const paid = Math.floor(debit * (0.25 + random() * 0.65));
    const owe = debit - paid;
    const platforms = ['tiktok', 'instagram', 'youtube'].slice(0, randInt(1, 3));
    const communitySize = randInt(1000, 100000);
    const viewsGenerated = randInt(5000, 1000000);
    const likesGenerated = randInt(500, 50000);
    const shares = platforms.map(() => random());
    const shareTotal = shares.reduce((sum, share) => sum + share, 0);
    const platformStats = platforms.map((platform, index) => ({
      platform,
      views: Math.round(viewsGenerated * shares[index] / shareTotal),
      likes: Math.round(likesGenerated * shares[index] / shareTotal),
      members: Math.round(communitySize * shares[index] / shareTotal),
    }));
    const participantCount = randInt(3, 12);
    const participants = Array.from({ length: participantCount }, (_, index) => ({
      id: String(index + 1),
      name: index === 0 ? 'You' : `Creator ${index + 1}`,
      progress: randInt(20, 100),
      submitted: random() > 0.3,
      approved: random() > 0.6,
    }));
    const timeRemainingDays = randInt(0, 60);
    const status = timeRemainingDays === 0 ? 'Expired' : (random() < 0.1 ? 'Paused' : 'Active');

    campaigns.push({
      id,
      publisherProfileIcon: '/images/publisher-placeholder.png',
      projectName: `Campaign ${i + 1} — ${sampleCategories[i % sampleCategories.length]}`,
      publisherUsername: 'demo-manager',
      publisherRating: parseFloat((3 + random() * 2).toFixed(1)),
      timeRemainingDays,
      nicheHashtag: sampleNiches[i % sampleNiches.length],
      description: sampleDescriptions[i % sampleDescriptions.length],
      category: sampleCategories[i % sampleCategories.length],
      status,
      communitySize,
      viewsGenerated,
      likesGenerated,
      totalBudget,
      budgetUsed: debit,
      debit,
      paid,
      owe,
      highestMcp: randInt(50, 500),
      hasJoined: true,
      requiredPlatforms: platforms,
      startDate: new Date(Date.now() - randInt(1, 30) * 24 * 60 * 60 * 1000).toISOString(),
      minPayout: randInt(1000, 20000),
      maxPayout: randInt(20000, 100000),
      lastEditedAt: new Date(Date.now() - randInt(0, 20) * 24 * 60 * 60 * 1000).toISOString(),
      participants,
      incomeReceived: paid,
      debt: owe,
      rank: randInt(1, participantCount),
      platformStats,
      rules: ['Publish original content for the campaign.', 'Use the required campaign hashtag and platform.'],
      resourceLink: 'https://drive.google.com/',
    });
  }
  return campaigns;
}

// One in-memory ledger is shared by the manager and joined screens in this app session.
const mockCampaignLedger = generateCampaigns(30);

export function getMockCampaigns(): CampaignCardData[] {
  return mockCampaignLedger;
}

/** Kept as a compatibility alias for campaign discovery fallback code. */
export function generateMockCampaigns(count = 30): CampaignCardData[] {
  return count === mockCampaignLedger.length ? mockCampaignLedger : generateCampaigns(count);
}
