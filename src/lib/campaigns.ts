import type { CampaignCardData } from '@/types/campaign';
import { desc, eq } from 'drizzle-orm';

import { campaignMembers, campaigns } from '@/db/schema';
import { db } from '@/lib/db';

function mapCampaignRow(row: any, hasJoined = false): CampaignCardData {
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
    requiredPlatforms: row.requiredPlatforms ? row.requiredPlatforms.split(',').map((platform: string) => platform.trim()).filter(Boolean) : [],
    startDate: row.startDate?.toISOString(),
    minPayout: row.minPayout,
    maxPayout: row.maxPayout,
    lastEditedAt: row.updatedAt?.toISOString(),
  };
}

export async function getCampaigns(): Promise<CampaignCardData[]> {
  const rows = await db.select().from(campaigns)
    .where(eq(campaigns.status, 'active'))
    .orderBy(desc(campaigns.createdAt))
    .limit(20);

  const memberRows = await db.select().from(campaignMembers)
    .where(eq(campaignMembers.userId, 'demo-user'));

  const joinedCampaignIds = new Set(memberRows.map((member) => String(member.campaignId)));

  return rows.map((row: any) => mapCampaignRow(row, joinedCampaignIds.has(String(row.id))));
}
