import type { CampaignCardData } from '@/types/campaign';

export interface CampaignMetric {
  campaignId: string;
  campaignName: string;
  platform: string;
  views: number;
  likes: number;
  members: number;
  percentage: number;
  rank?: number;
}

export interface CampaignSummary {
  campaignId: string;
  campaignName: string;
  totalViews: number;
  totalLikes: number;
  totalMembers: number;
  metrics: CampaignMetric[];
  myRank?: number;
}

export function calculatePlatformPercentages(campaign: CampaignCardData): CampaignMetric[] {
  const platforms = campaign.requiredPlatforms ?? [];
  if (platforms.length === 0) return [];

  const totalViews = campaign.viewsGenerated || 0;
  const totalLikes = campaign.likesGenerated || 0;
  const totalMembers = campaign.communitySize || 0;

  if (totalViews <= 0 && totalLikes <= 0 && totalMembers <= 0) {
    return platforms.map((platform) => ({
      campaignId: campaign.id,
      campaignName: campaign.projectName,
      platform,
      views: 0,
      likes: 0,
      members: 0,
      percentage: 100 / platforms.length,
    }));
  }

  const platformStats = campaign.platformStats ?? [];
  const metrics = platforms.map((platform) => {
    const stat = platformStats.find((s) => s.platform === platform);
    return {
      campaignId: campaign.id,
      campaignName: campaign.projectName,
      platform,
      views: stat?.views ?? 0,
      likes: stat?.likes ?? 0,
      members: stat?.members ?? 0,
      percentage: 0,
    };
  });

  const totalPercentage = metrics.reduce((sum, m) => sum + m.percentage, 0);

  if (totalPercentage > 0) {
    metrics.forEach((m) => {
      m.percentage = (m.percentage / totalPercentage) * 100;
    });
  } else {
    const equalShare = 100 / platforms.length;
    metrics.forEach((m) => {
      m.percentage = equalShare;
    });
  }

  return metrics;
}

export function buildCampaignSummary(campaign: CampaignCardData): CampaignSummary {
  const metrics = calculatePlatformPercentages(campaign);

  return {
    campaignId: campaign.id,
    campaignName: campaign.projectName,
    totalViews: campaign.viewsGenerated || 0,
    totalLikes: campaign.likesGenerated || 0,
    totalMembers: campaign.communitySize || 0,
    metrics,
    myRank: campaign.rank,
  };
}

export function getSuperiorMetrics(campaigns: CampaignCardData[]) {
  const summaries = campaigns.map(buildCampaignSummary);

  const bestViews = summaries.reduce((best, curr) => (curr.totalViews > best.totalViews ? curr : best), summaries[0]);
  const bestLikes = summaries.reduce((best, curr) => (curr.totalLikes > best.totalLikes ? curr : best), summaries[0]);
  const bestMembers = summaries.reduce((best, curr) => (curr.totalMembers > best.totalMembers ? curr : best), summaries[0]);

  return {
    bestViewsCampaign: bestViews?.campaignName ?? '-',
    bestLikesCampaign: bestLikes?.campaignName ?? '-',
    bestMembersCampaign: bestMembers?.campaignName ?? '-',
    summaries,
  };
}
