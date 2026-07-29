import type { Campaign } from '@/generated/prisma/client';
import type { CampaignCardData } from '@/types/campaign';
import { prisma } from './prisma';

function toNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function mapCampaignRow(row: Campaign, hasJoined = false): CampaignCardData {
  return {
    id: String(row.id),
    publisherProfileIcon: row.publisherProfileIcon,
    projectName: row.title,
    publisherUsername: row.createdBy,
    publisherRating: row.publisherRating,
    timeRemainingDays: row.timeRemainingDays,
    nicheHashtag: row.nicheHashtag,
    description: row.description,
    category: row.category,
    status: row.status,
    communitySize: row.communitySize,
    viewsGenerated: row.viewsGenerated,
    likesGenerated: row.likesGenerated,
    totalBudget: row.totalBudget,
    budgetUsed: row.budgetUsed,
    highestMcp: row.highestMcp,
    hasJoined,
    requiredPlatforms: row.requiredPlatforms ? row.requiredPlatforms.split(',').map((platform) => platform.trim()).filter(Boolean) : [],
    startDate: row.startDate?.toISOString(),
    minPayout: row.minPayout,
    maxPayout: row.maxPayout,
    lastEditedAt: row.updatedAt?.toISOString(),
  };
}

export async function getCampaigns(): Promise<CampaignCardData[]> {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      members: {
        where: {
          userId: 'demo-user',
          status: 'active',
        },
        select: { id: true },
      },
    },
  });

  return campaigns.map((campaign) =>
    mapCampaignRow(campaign, (campaign.members?.length ?? 0) > 0)
  );
}
