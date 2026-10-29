import type { CampaignCardData } from '@/types/campaign';

export interface MockCampaignPerson {
  id: string;
  accountId: string;
  username: string;
  name: string;
}

export interface MockCampaignFixture {
  id: string;
  name: string;
  owner: MockCampaignPerson;
  description: string;
  category: string;
  niche: string;
  status: 'Active' | 'Paused' | 'Expired';
  daysRemaining: number;
  budget: number;
  budgetUsed: number;
  paid: number;
  owe: number;
  cpm: number;
  views: number;
  likes: number;
  stars: number;
  participants: MockCampaignPerson[];
  participantMetrics: Record<string, { rank: number; views: number; amount: number; progress: number }>;
  platforms: string[];
  minPayout: number;
  maxPayout: number;
  createdAt: string;
}

export const mockCampaignPeople: MockCampaignPerson[] = [
  { id: 'usr_1', accountId: 'acc-sarah-akello', username: 'sarahakello', name: 'Sarah Akello' },
  { id: 'usr_9481a82f', accountId: 'acc-usr_9481a82f', username: 'mukisacalcus', name: 'Mukisa Calcus' },
  { id: 'usr_5', accountId: 'acc-usr_5', username: 'rebeccananyondo', name: 'Rebecca Nanyondo' },
  { id: 'usr_2', accountId: 'acc-david-ochieng', username: 'david.ochieng', name: 'David Ochieng' },
];

const categories = ['Technology', 'Lifestyle', 'Education', 'Food', 'Fashion', 'Community', 'Business', 'Entertainment'];
const niches = ['growth', 'local-makers', 'creator-stories', 'market-day', 'brand-launch', 'community', 'small-business', 'digital-skills'];
const descriptions = [
  'Grow local reach with creators and practical community-led promotion.',
  'Bring neighborhood businesses and customers together through digital stories.',
  'Create useful, authentic content that helps local brands reach new audiences.',
  'Support independent makers with a collaborative campaign and clear milestones.',
  'Promote a new product launch through short-form videos and social posts.',
  'Build awareness for a local event through creators, referrals, and community updates.',
  'Help small businesses improve visibility and connect with nearby customers.',
  'Share creator-made reviews and stories across selected social platforms.',
];
const platformSets = [['instagram'], ['tiktok'], ['youtube'], ['instagram', 'tiktok'], ['tiktok', 'youtube'], ['instagram', 'youtube']];

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0x100000000;
  };
}

function generateCampaignFixtures(): MockCampaignFixture[] {
  const random = seededRandom(20261029);
  const int = (min: number, max: number) => Math.floor(random() * (max - min + 1)) + min;

  return Array.from({ length: mockCampaignPeople.length * 16 }, (_, index) => {
    const ownerIndex = Math.floor(index / 16);
    const ownerCampaignIndex = index % 16;
    const owner = mockCampaignPeople[ownerIndex];
    const others = mockCampaignPeople.filter((_, personIndex) => personIndex !== ownerIndex);
    const [highShare, second, third] = [
      others[0],
      others[1],
      others[2],
    ].sort((a, b) => ((mockCampaignPeople.indexOf(a) - (ownerIndex + 1) + 4) % 4) - ((mockCampaignPeople.indexOf(b) - (ownerIndex + 1) + 4) % 4));
    const pairPatterns = [[highShare, second], [highShare, second], [highShare, third], [second, third]];
    const singlePatterns = [highShare, highShare, highShare, second, second, second, third, third];
    const participants = ownerCampaignIndex < 4
      ? pairPatterns[ownerCampaignIndex]
      : ownerCampaignIndex < 12
        ? [singlePatterns[ownerCampaignIndex - 4]]
        : [];
    const budget = int(450_000, 5_800_000);
    const budgetUsed = Math.round(budget * (0.25 + random() * 0.65));
    const paid = Math.round(budgetUsed * (0.55 + random() * 0.4));
    const views = int(45_000, 2_400_000);
    const likes = int(4_000, Math.max(5_000, Math.round(views * 0.12)));
    const daysRemaining = index % 11 === 10 ? 0 : int(2, 45);
    const status: MockCampaignFixture['status'] = daysRemaining === 0 ? 'Expired' : index % 7 === 5 ? 'Paused' : 'Active';
    const participantMetrics: MockCampaignFixture['participantMetrics'] = {};
    [...participants].map((person) => ({ person, score: int(20_000, 500_000) }))
      .sort((a, b) => b.score - a.score)
      .forEach(({ person, score }, rankIndex) => {
        participantMetrics[person.id] = {
          rank: rankIndex + 1,
          views: Math.round(score * (0.4 + random() * 0.6)),
          amount: Math.round((budgetUsed / Math.max(1, participants.length)) * (0.5 + random() * 0.8)),
          progress: int(20, 100),
        };
      });

    return {
      id: `mock-campaign-${String(index + 1).padStart(2, '0')}`,
      name: [
        'Kampala Creator Connect', 'Local Makers Spotlight', 'Uganda Farmers Market', 'Women in Business Week',
        'Digital Skills Weekend', 'Small Business Growth Lab', 'Nakasero Market Stories', 'City Brand Launch',
      ][ownerCampaignIndex % 8] + ` ${owner.name.split(' ')[0]} ${Math.floor(ownerCampaignIndex / 8) + 1}`,
      owner,
      description: descriptions[index % descriptions.length],
      category: categories[index % categories.length],
      niche: niches[index % niches.length],
      status,
      daysRemaining,
      budget,
      budgetUsed,
      paid,
      owe: Math.max(0, budgetUsed - paid),
      cpm: int(450, 2_400),
      views,
      likes,
      stars: int(8, 320),
      participants,
      participantMetrics,
      platforms: platformSets[index % platformSets.length],
      minPayout: int(15_000, 120_000),
      maxPayout: int(150_000, 650_000),
      createdAt: new Date(Date.UTC(2026, 8, 28 - (index % 27))).toISOString(),
    };
  });
}

const fixtures = generateCampaignFixtures();
const membershipStorageKey = 'mock-campaign-membership-overrides';

export function normalizeMockCampaignIdentity(identity = 'mukisacalcus'): MockCampaignPerson {
  const value = identity.toLowerCase().replace(/^acc-/, '');
  return mockCampaignPeople.find((person) => person.id.toLowerCase() === value || person.username === value || person.name.toLowerCase().replace(/[^a-z0-9]/g, '') === value || person.accountId.replace(/^acc-/, '') === value) ?? mockCampaignPeople[1];
}

export function getMockCampaignFixtures() {
  return fixtures;
}

export function setMockCampaignMembership(campaignId: string, identity: string, joined: boolean) {
  if (typeof window === 'undefined') return;
  const person = normalizeMockCampaignIdentity(identity);
  try {
    const stored = JSON.parse(localStorage.getItem(membershipStorageKey) ?? '{}') as Record<string, Record<string, boolean>>;
    stored[person.id] = { ...(stored[person.id] ?? {}), [campaignId]: joined };
    localStorage.setItem(membershipStorageKey, JSON.stringify(stored));
  } catch {
    localStorage.setItem(membershipStorageKey, JSON.stringify({ [person.id]: { [campaignId]: joined } }));
  }
}

function membershipOverrides(identity: MockCampaignPerson) {
  if (typeof window === 'undefined') return {} as Record<string, boolean>;
  try {
    const stored = JSON.parse(localStorage.getItem(membershipStorageKey) ?? '{}') as Record<string, Record<string, boolean>>;
    return stored[identity.id] ?? {};
  } catch {
    return {} as Record<string, boolean>;
  }
}

export function getMockCampaignMembershipOverrides(identity: string) {
  return membershipOverrides(normalizeMockCampaignIdentity(identity));
}

function fixtureWithMembership(campaign: MockCampaignFixture, person: MockCampaignPerson, overrides: Record<string, boolean> = {}): MockCampaignFixture {
  const override = overrides[campaign.id];
  if (override === undefined) return campaign;
  const isIncluded = campaign.participants.some((participant) => participant.id === person.id);
  return {
    ...campaign,
    participants: override
      ? isIncluded ? campaign.participants : [...campaign.participants, person]
      : campaign.participants.filter((participant) => participant.id !== person.id),
  };
}

export function getMockProfileCampaignFixtures(identity: string, overrides: Record<string, boolean> = {}) {
  const person = normalizeMockCampaignIdentity(identity);
  const personFixtures = fixtures.map((campaign) => fixtureWithMembership(campaign, person, overrides));
  return {
    person,
    created: personFixtures.filter((campaign) => campaign.owner.id === person.id),
    joined: personFixtures.filter((campaign) => campaign.owner.id !== person.id && campaign.participants.some((participant) => participant.id === person.id)),
  };
}

export function getMockProfileFinanceTotals(identity: string, marketTransactions: { type: string; amount: number }[]) {
  const person = normalizeMockCampaignIdentity(identity);
  const campaignIncome = fixtures.reduce((total, campaign) => {
    const membership = fixtureWithMembership(campaign, person);
    const metric = membership.participants.some((participant) => participant.id === person.id)
      ? campaign.participantMetrics[person.id]
      : undefined;
    return total + (metric?.amount ?? 0);
  }, 0);
  const campaignPayouts = fixtures
    .filter((campaign) => campaign.owner.id === person.id)
    .reduce((total, campaign) => total + campaign.paid, 0);
  const marketSales = marketTransactions
    .filter((transaction) => transaction.type.toLowerCase() === 'sold' || transaction.type.toLowerCase() === 'sale')
    .reduce((total, transaction) => total + (Number(transaction.amount) || 0), 0);
  const marketPurchases = marketTransactions
    .filter((transaction) => transaction.type.toLowerCase() === 'purchased' || transaction.type.toLowerCase() === 'purchase')
    .reduce((total, transaction) => total + (Number(transaction.amount) || 0), 0);

  return {
    income: campaignIncome + marketSales,
    invested: campaignPayouts + marketPurchases,
  };
}

export function toCampaignCardData(campaign: MockCampaignFixture, viewerIdentity = 'mukisacalcus', overrides: Record<string, boolean> = {}): CampaignCardData {
  const viewer = normalizeMockCampaignIdentity(viewerIdentity);
  const visibleCampaign = fixtureWithMembership(campaign, viewer, overrides);
  const platformWeightTotal = visibleCampaign.platforms.reduce((sum, _entry, index) => sum + index + 1, 0);
  const platformStats = visibleCampaign.platforms.map((platform, index) => {
    const share = (index + 1) / platformWeightTotal;
    return {
      platform,
      views: Math.round(visibleCampaign.views * share),
      likes: Math.round(visibleCampaign.likes * share),
      members: Math.round(visibleCampaign.participants.length * share),
    };
  });
  return {
    id: campaign.id,
    publisherProfileIcon: '/images/publisher-placeholder.png',
    projectName: campaign.name,
    publisherUsername: campaign.owner.username,
    publisherRating: 4.1 + ((campaign.stars % 9) / 10),
    timeRemainingDays: campaign.daysRemaining,
    nicheHashtag: campaign.niche,
    description: campaign.description,
    category: campaign.category,
    status: campaign.status,
    communitySize: visibleCampaign.participants.length,
    viewsGenerated: visibleCampaign.views,
    likesGenerated: visibleCampaign.likes,
    totalBudget: visibleCampaign.budget,
    budgetUsed: visibleCampaign.budgetUsed,
    debit: visibleCampaign.budgetUsed,
    paid: visibleCampaign.paid,
    owe: visibleCampaign.owe,
    highestMcp: visibleCampaign.cpm,
    stars: visibleCampaign.stars,
    hasJoined: visibleCampaign.participants.some((participant) => participant.id === viewer.id),
    requiredPlatforms: visibleCampaign.platforms,
    startDate: visibleCampaign.createdAt,
    minPayout: visibleCampaign.minPayout,
    maxPayout: visibleCampaign.maxPayout,
    lastEditedAt: visibleCampaign.createdAt,
    participants: visibleCampaign.participants.map((participant) => {
      const metrics = visibleCampaign.participantMetrics[participant.id];
      return {
        id: participant.id,
        name: participant.name,
        progress: metrics?.progress ?? 0,
        submitted: (metrics?.progress ?? 0) > 40,
        approved: (metrics?.progress ?? 0) > 75,
      };
    }),
    incomeReceived: visibleCampaign.paid,
    debt: visibleCampaign.owe,
    rank: visibleCampaign.participantMetrics[viewer.id]?.rank ?? 99,
    platformStats,
    rules: ['Publish original content for the campaign.', `Share campaign updates using #${visibleCampaign.niche}.`],
    resourceLink: 'https://drive.google.com/',
  };
}

export function getMockCampaigns(viewerIdentity = 'mukisacalcus', filter: 'created' | 'joined' | 'all' = 'all', overrides: Record<string, boolean> = {}): CampaignCardData[] {
  const person = normalizeMockCampaignIdentity(viewerIdentity);
  return fixtures
    .filter((campaign) => {
      if (filter === 'created') return campaign.owner.id === person.id;
      if (filter === 'joined') return campaign.owner.id !== person.id && fixtureWithMembership(campaign, person, overrides).participants.some((participant) => participant.id === person.id);
      return true;
    })
    .map((campaign) => toCampaignCardData(campaign, person.id, overrides));
}

/** Compatibility alias for campaign discovery fallback callers. */
export function generateMockCampaigns(count = 64): CampaignCardData[] {
  return getMockCampaigns('mukisacalcus', 'all').slice(0, count);
}
