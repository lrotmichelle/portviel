import type { CampaignCardData } from '@/types/campaign';
import { query } from './db';

function toNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function mapCampaignRow(row: Record<string, unknown>): CampaignCardData {
  return {
    id: toString(row.id ?? row.campaign_id ?? row.campaignId, 'campaign-1'),
    publisherProfileIcon: toString(row.publisher_profile_icon ?? row.publisherProfileIcon ?? '', ''),
    projectName: toString(row.title ?? row.project_name ?? row.projectName ?? row.name ?? 'Campaign', 'Campaign'),
    publisherUsername: toString(row.publisher_username ?? row.publisherUsername ?? row.username ?? 'publisher', 'publisher'),
    publisherRating: toNumber(row.publisher_rating ?? row.publisherRating, 4.5),
    timeRemainingDays: toNumber(row.time_remaining_days ?? row.timeRemainingDays, 7),
    nicheHashtag: toString(row.niche_hashtag ?? row.nicheHashtag ?? 'growth', 'growth'),
    description: toString(row.description ?? row.summary ?? 'Live campaign listing', 'Live campaign listing'),
    category: toString(row.category ?? row.category_name ?? 'General', 'General'),
    status: toString(row.status ?? 'Active', 'Active'),
    communitySize: toNumber(row.community_size ?? row.communitySize, 10000),
    viewsGenerated: toNumber(row.views_generated ?? row.viewsGenerated, 25000),
    likesGenerated: toNumber(row.likes_generated ?? row.likesGenerated, 3000),
    totalBudget: toNumber(row.total_budget ?? row.totalBudget, 1000),
    budgetUsed: toNumber(row.budget_used ?? row.budgetUsed, 200),
    highestMcp: toNumber(row.highest_mcp ?? row.highestMcp, 100),
    hasJoined: Boolean(row.has_joined ?? row.hasJoined ?? false),
  };
}

export async function getCampaigns(): Promise<CampaignCardData[]> {
  const tables = ['campaigns', 'campaign_listings', 'brand_campaigns'];

  for (const table of tables) {
    try {
      const rows = await query<Record<string, unknown>>(`
        SELECT t.*,
          EXISTS(
            SELECT 1 FROM engagement_events e
            WHERE e.entity_type = 'campaign'
              AND e.entity_id = t.id
              AND e.actor_id = 'demo-user'
              AND e.action = 'join'
              AND NOT EXISTS (
                SELECT 1 FROM engagement_events e2
                WHERE e2.entity_type = 'campaign'
                  AND e2.entity_id = t.id
                  AND e2.actor_id = 'demo-user'
                  AND e2.action = 'exit'
                  AND e2.created_at > e.created_at
              )
          ) AS has_joined
        FROM ${table} t
        ORDER BY t.created_at DESC
        LIMIT 20
      `);
      return rows.map(mapCampaignRow);
    } catch (error) {
      console.warn(`Unable to query ${table}`, error);
    }
  }

  return [];
}
