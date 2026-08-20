import type { CampaignCardData } from '@/types/campaign';

const sampleNiches = ['duet', 'sound', 'ugc', 'logo', 'clipping', 'growth', 'lifestyle', 'gaming'];
const sampleCategories = ['Technology', 'Lifestyle', 'Gaming', 'Entertainment', 'Sports', 'Education', 'Luxury', 'Music'];
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

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMockCampaigns(count = 30): CampaignCardData[] {
  const campaigns: CampaignCardData[] = [];
  for (let i = 0; i < count; i++) {
    const id = String(1000 + i);
    const totalBudget = randInt(20000, 2000000);
    const budgetUsed = Math.floor(totalBudget * Math.random());
    const settled = Math.floor(budgetUsed * Math.random());
    const status = Math.random() < 0.1 ? 'Paused' : (Math.random() < 0.15 ? 'Approved' : 'Active');

    campaigns.push({
      id,
      publisherProfileIcon: '/images/publisher-placeholder.png',
      projectName: `Campaign ${i + 1} — ${sampleCategories[i % sampleCategories.length]}`,
      publisherUsername: `publisher${randInt(1, 50)}`,
      publisherRating: parseFloat((3 + Math.random() * 2).toFixed(1)),
      timeRemainingDays: randInt(3, 30),
      nicheHashtag: sampleNiches[i % sampleNiches.length],
      description: sampleDescriptions[i % sampleDescriptions.length],
      category: sampleCategories[i % sampleCategories.length],
      status,
      communitySize: randInt(500, 20000),
      viewsGenerated: randInt(1000, 50000),
      likesGenerated: randInt(50, 5000),
      totalBudget,
      budgetUsed,
      highestMcp: randInt(50, 500),
      hasJoined: Math.random() < 0.2,
      requiredPlatforms: ['tiktok'],
      startDate: '',
      minPayout: randInt(1000, 20000),
      maxPayout: randInt(20000, 100000),
      lastEditedAt: new Date(Date.now() - randInt(0, 20) * 24 * 60 * 60 * 1000).toISOString(),
      participants: Array.from({ length: randInt(0, 5) }).map((_, idx) => ({ id: String(idx + 1), name: `Creator ${idx + 1}`, progress: randInt(0, 100), submitted: Math.random() < 0.5, approved: Math.random() < 0.3 })),
    });
  }
  return campaigns;
}
