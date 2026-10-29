export interface MockPublicProfile {
  accountId: string;
  name: string;
  username: string;
  role: string;
  bio: string;
  dateJoined: string;
  rating: number;
  totalRatings: number;
  sales: number;
  invested: number;
  verified: boolean;
  verificationType: 'kyc' | 'admin' | null;
  discoverJobs: { title: string; vacants: number; recruited: number }[];
  campaigns: { name: string; members: number; rank: number; amount: number }[];
  createdCampaigns?: MockCampaign[];
  joinedCampaigns?: MockCampaign[];
  marketTransactions: { account: string; type: 'sold' | 'purchased'; amount: number }[];
}

export interface MockCampaign {
  id: string;
  name: string;
  members: number;
  rank: number;
  amount: number;
  budget: number;
  budgetUsed: number;
  views: number;
  cpm: number;
  stars: number;
  status: 'active' | 'paused' | 'ended';
  ownerName: string;
  ownerUsername: string;
  ownerAccountId: string;
  participantIds: string[];
  leaders: { id: string; name: string; rank: number; views: number; amount: number }[];
}

const profiles: Record<string, MockPublicProfile> = {
  'david-ochieng': {
    accountId: 'acc-david-ochieng',
    name: 'David Ochieng',
    username: 'david.ochieng',
    role: 'Campaign Creator',
    bio: 'Building connections between Uganda’s farmers, makers, and local buyers. I create practical campaigns that help small businesses reach new communities.',
    dateJoined: '12 | 03 | 2023',
    rating: 4.7,
    totalRatings: 38,
    sales: 1850000,
    invested: 1000000,
    verified: true,
    verificationType: 'kyc',
    discoverJobs: [
      { title: 'Market Outreach Coordinator', vacants: 2, recruited: 1 },
      { title: 'Fresh Produce Photographer', vacants: 1, recruited: 0 },
    ],
    campaigns: [
      { name: 'Uganda Farmers Market', members: 12, rank: 1, amount: 800000 },
      { name: 'Lake Region Retail Network', members: 8, rank: 3, amount: 200000 },
    ],
    marketTransactions: [
      { account: 'Kampala Fresh Produce Co-op', type: 'sold', amount: 560000 },
      { account: 'Lake Region Retailers', type: 'sold', amount: 420000 },
      { account: 'Wandegeya Growers Group', type: 'purchased', amount: 185000 },
    ],
  },
  'sarah-akello': {
    accountId: 'acc-sarah-akello',
    name: 'Sarah Akello',
    username: 'sarahakello',
    role: 'Creator & Community Lead',
    bio: 'I help local brands tell better stories through creator partnerships, community events, and thoughtful digital campaigns.',
    dateJoined: '04 | 08 | 2022',
    rating: 4.9,
    totalRatings: 52,
    sales: 3240000,
    invested: 1760000,
    verified: true,
    verificationType: 'kyc',
    discoverJobs: [{ title: 'Community Campaign Coordinator', vacants: 2, recruited: 1 }],
    campaigns: [
      { name: 'Kampala Tech Expo Promo', members: 24, rank: 1, amount: 500000 },
      { name: 'Women in Business Week', members: 16, rank: 2, amount: 320000 },
      { name: 'Kampala Creator Connect', members: 21, rank: 4, amount: 245000 },
      { name: 'Local Makers Spotlight', members: 14, rank: 3, amount: 190000 },
      { name: 'Digital Skills Weekend', members: 31, rank: 8, amount: 125000 },
      { name: 'Small Business Growth Lab', members: 17, rank: 5, amount: 90000 },
    ],
    createdCampaigns: [
      {
        id: 'mock-sarah-created-open', name: 'Women in Business Week', members: 16, rank: 1, amount: 320000,
        budget: 1800000, budgetUsed: 950000, views: 420000, cpm: 1100, stars: 48, status: 'active',
        ownerName: 'Sarah Akello', ownerUsername: 'sarahakello', ownerAccountId: 'acc-sarah-akello',
        participantIds: ['usr_1', 'usr_3', 'usr_9'],
        leaders: [
          { id: 'usr_3', name: 'Grace Lamwaka', rank: 1, views: 98000, amount: 125000 },
          { id: 'usr_9', name: 'Sarah Akello', rank: 2, views: 91000, amount: 110000 },
          { id: 'usr_1', name: 'Sarah Akello', rank: 5, views: 35000, amount: 320000 },
        ],
      },
      {
        id: 'mock-sarah-created-joined', name: 'Kampala Creator Connect', members: 21, rank: 4, amount: 245000,
        budget: 2400000, budgetUsed: 1360000, views: 615000, cpm: 1350, stars: 67, status: 'active',
        ownerName: 'Sarah Akello', ownerUsername: 'sarahakello', ownerAccountId: 'acc-sarah-akello',
        participantIds: ['usr_9481a82f', 'usr_1', 'usr_4', 'usr_5'],
        leaders: [
          { id: 'usr_9', name: 'Sarah Akello', rank: 1, views: 142000, amount: 245000 },
          { id: 'usr_5', name: 'Rebecca Nanyondo', rank: 2, views: 106000, amount: 190000 },
          { id: 'usr_9481a82f', name: 'Mukisa Calcus', rank: 6, views: 48000, amount: 80000 },
        ],
      },
      {
        id: 'mock-sarah-created-paused', name: 'Nakasero Market Stories', members: 13, rank: 2, amount: 175000,
        budget: 1250000, budgetUsed: 1250000, views: 310000, cpm: 900, stars: 29, status: 'paused',
        ownerName: 'Sarah Akello', ownerUsername: 'sarahakello', ownerAccountId: 'acc-sarah-akello',
        participantIds: ['usr_1', 'usr_2', 'usr_11'],
        leaders: [
          { id: 'usr_2', name: 'David Ochieng', rank: 1, views: 87000, amount: 100000 },
          { id: 'usr_11', name: 'Paul Ssebuwufu', rank: 2, views: 68000, amount: 90000 },
          { id: 'usr_1', name: 'Sarah Akello', rank: 4, views: 39000, amount: 175000 },
        ],
      },
    ],
    joinedCampaigns: [
      {
        id: 'mock-sarah-joined-open', name: 'Kampala Tech Expo Promo', members: 24, rank: 1, amount: 500000,
        budget: 3200000, budgetUsed: 1850000, views: 965000, cpm: 1100, stars: 45, status: 'active',
        ownerName: 'David Ochieng', ownerUsername: 'david.ochieng', ownerAccountId: 'acc-david-ochieng',
        participantIds: ['usr_1', 'usr_2', 'usr_3', 'usr_5'],
        leaders: [
          { id: 'usr_2', name: 'David Ochieng', rank: 1, views: 188000, amount: 240000 },
          { id: 'usr_3', name: 'Grace Lamwaka', rank: 2, views: 134000, amount: 165000 },
          { id: 'usr_1', name: 'Sarah Akello', rank: 4, views: 92000, amount: 500000 },
        ],
      },
      {
        id: 'mock-sarah-joined-together', name: 'Local Makers Spotlight', members: 14, rank: 3, amount: 190000,
        budget: 1450000, budgetUsed: 720000, views: 338000, cpm: 980, stars: 32, status: 'active',
        ownerName: 'Rebecca Nanyondo', ownerUsername: 'rebeccananyondo', ownerAccountId: 'acc-usr_5',
        participantIds: ['usr_1', 'usr_9481a82f', 'usr_5', 'usr_6'],
        leaders: [
          { id: 'usr_5', name: 'Rebecca Nanyondo', rank: 1, views: 97000, amount: 225000 },
          { id: 'usr_6', name: 'Paul Ssebuwufu', rank: 2, views: 74000, amount: 120000 },
          { id: 'usr_9481a82f', name: 'Mukisa Calcus', rank: 3, views: 63000, amount: 190000 },
          { id: 'usr_1', name: 'Sarah Akello', rank: 6, views: 30000, amount: 95000 },
        ],
      },
      {
        id: 'mock-sarah-joined-paused', name: 'Digital Skills Weekend', members: 31, rank: 8, amount: 125000,
        budget: 2100000, budgetUsed: 2100000, views: 790000, cpm: 850, stars: 58, status: 'paused',
        ownerName: 'John Okello', ownerUsername: 'johnokello', ownerAccountId: 'acc-usr_4',
        participantIds: ['usr_1', 'usr_4', 'usr_3'],
        leaders: [
          { id: 'usr_4', name: 'John Okello', rank: 1, views: 212000, amount: 310000 },
          { id: 'usr_3', name: 'Grace Lamwaka', rank: 2, views: 175000, amount: 205000 },
          { id: 'usr_1', name: 'Sarah Akello', rank: 8, views: 34000, amount: 125000 },
        ],
      },
    ],
    marketTransactions: [{ account: 'Kampala Tech Expo', type: 'sold', amount: 720000 }, { account: 'Nakasero Creators', type: 'purchased', amount: 165000 }],
  },
  'mukisa-calcus': {
    accountId: 'acc-usr_9481a82f',
    name: 'Mukisa Calcus',
    username: 'mukisacalcus',
    role: 'Entrepreneur & Campaign Manager',
    bio: 'Growing PortVille by connecting ambitious businesses with trusted local talent and creators.',
    dateJoined: '15 | 01 | 2024',
    rating: 4.8,
    totalRatings: 24,
    sales: 2450000,
    invested: 1800000,
    verified: true,
    verificationType: 'kyc',
    discoverJobs: [{ title: 'Growth Marketing Specialist', vacants: 2, recruited: 1 }, { title: 'Visual Content Designer', vacants: 1, recruited: 0 }],
    campaigns: [{ name: 'PortVille Early Sellers Sprint', members: 48, rank: 1, amount: 1200000 }, { name: 'Kampala Urban Wear Drop', members: 32, rank: 3, amount: 600000 }],
    marketTransactions: [{ account: 'PortVille Agency', type: 'sold', amount: 850000 }, { account: 'Kololo Digital', type: 'purchased', amount: 420000 }],
  },
  'grace-lamwaka': {
    accountId: 'acc-usr_3', name: 'Grace Lamwaka', username: 'gracelamwaka', role: 'Small Business Owner',
    bio: 'Making handcrafted Ugandan home goods and helping independent makers find new customers.', dateJoined: '21 | 06 | 2024', rating: 4.6, totalRatings: 17,
    sales: 980000, invested: 245000, verified: false, verificationType: null, discoverJobs: [],
    campaigns: [{ name: 'Uganda Craft Traders Network', members: 19, rank: 2, amount: 150000 }],
    marketTransactions: [{ account: 'Wandegeya Craft Collective', type: 'sold', amount: 310000 }],
  },
  'john-okello': {
    accountId: 'acc-usr_4', name: 'John Okello', username: 'johnokello', role: 'Digital Marketer',
    bio: 'Helping growing teams turn clear ideas into measurable digital campaigns.', dateJoined: '10 | 11 | 2023', rating: 4.5, totalRatings: 11,
    sales: 640000, invested: 120000, verified: false, verificationType: null, discoverJobs: [], campaigns: [],
    marketTransactions: [{ account: 'Nakasero Venture', type: 'purchased', amount: 120000 }],
  },
  'rebecca-nanyondo': {
    accountId: 'acc-usr_5', name: 'Rebecca Nanyondo', username: 'rebeccananyondo', role: 'Fashion Entrepreneur',
    bio: 'Designing everyday apparel inspired by Kampala street style and local craftsmanship.', dateJoined: '03 | 02 | 2024', rating: 4.8, totalRatings: 29,
    sales: 1720000, invested: 430000, verified: true, verificationType: 'admin', discoverJobs: [],
    campaigns: [{ name: 'Kampala Urban Wear Drop', members: 32, rank: 1, amount: 200000 }],
    marketTransactions: [{ account: 'Kampala Urban Wear', type: 'sold', amount: 490000 }],
  },
  'paul-ssebuwufu': {
    accountId: 'acc-usr_6', name: 'Paul Ssebuwufu', username: 'paulssebuwufu', role: 'Content Creator',
    bio: 'Creating product stories and short-form video for growing local brands.', dateJoined: '18 | 05 | 2024', rating: 4.4, totalRatings: 9,
    sales: 520000, invested: 90000, verified: false, verificationType: null,
    discoverJobs: [
      { title: 'Short-form Video Editor', vacants: 2, recruited: 1 },
      { title: 'Product Story Photographer', vacants: 1, recruited: 0 },
    ],
    campaigns: [
      { name: 'Kampala Creator Stories', members: 18, rank: 2, amount: 460000 },
      { name: 'Uganda Farmers Market', members: 12, rank: 3, amount: 85000 },
    ],
    createdCampaigns: [{
      id: 'mock-paul-created-1', name: 'Kampala Creator Stories', members: 18, rank: 1, amount: 460000,
      budget: 1200000, budgetUsed: 740000, views: 385000, cpm: 1200, stars: 34, status: 'active',
      ownerName: 'Paul Ssebuwufu', ownerUsername: 'paulssebuwufu', ownerAccountId: 'acc-usr_6',
      participantIds: ['usr_6', 'usr_9', 'usr_3'],
      leaders: [
        { id: 'usr_9', name: 'Sarah Akello', rank: 1, views: 98000, amount: 180000 },
        { id: 'usr_3', name: 'Grace Lamwaka', rank: 2, views: 72000, amount: 125000 },
        { id: 'usr_6', name: 'Paul Ssebuwufu', rank: 5, views: 31000, amount: 46000 },
      ],
    }],
    joinedCampaigns: [{
      id: 'mock-paul-joined-1', name: 'Uganda Farmers Market', members: 12, rank: 3, amount: 85000,
      budget: 1000000, budgetUsed: 800000, views: 345000, cpm: 700, stars: 23, status: 'active',
      ownerName: 'David Ochieng', ownerUsername: 'david.ochieng', ownerAccountId: 'acc-david-ochieng',
      participantIds: ['usr_11', 'usr_2', 'usr_6'],
      leaders: [
        { id: 'usr_11', name: 'David Ochieng', rank: 1, views: 92000, amount: 180000 },
        { id: 'usr_2', name: 'Sarah Akello', rank: 2, views: 84000, amount: 120000 },
        { id: 'usr_6', name: 'Paul Ssebuwufu', rank: 5, views: 31000, amount: 85000 },
      ],
    }],
    marketTransactions: [{ account: 'Kampala Creative Hub', type: 'sold', amount: 180000 }],
  },
};

const aliases: Record<string, keyof typeof profiles> = {
  'usr_9481a82f': 'mukisa-calcus',
  mukisacalcus: 'mukisa-calcus',
  sarahakello: 'sarah-akello',
  'david.ochieng': 'david-ochieng',
  gracelamwaka: 'grace-lamwaka',
  johnokello: 'john-okello',
  rebeccananyondo: 'rebecca-nanyondo',
  paulssebuwufu: 'paul-ssebuwufu',
  usr_1: 'sarah-akello',
  usr_2: 'david-ochieng',
  usr_3: 'grace-lamwaka',
  usr_4: 'john-okello',
  usr_5: 'rebecca-nanyondo',
  usr_6: 'paul-ssebuwufu',
  usr_9: 'sarah-akello',
  usr_10: 'mukisa-calcus',
  usr_11: 'david-ochieng',
  usr_12: 'mukisa-calcus',
};

export function getMockPublicProfile(accountId: string): MockPublicProfile | null {
  const normalizedId = accountId.replace(/^acc-/, '').toLowerCase();
  const key = aliases[normalizedId] ?? normalizedId;
  if (profiles[key]) return profiles[key];

  const normalizedName = normalizedId.replace(/[^a-z0-9]/g, '');
  return Object.values(profiles).find((profile) =>
    profile.username.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedName ||
    profile.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedName
  ) ?? null;
}
