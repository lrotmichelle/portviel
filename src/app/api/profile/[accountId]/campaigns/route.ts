import { and, eq, inArray } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/db/client';
import { authCampaignStars, authUsers } from '@/db/schema/auth';
import { campaignMembers, campaigns, vacancies, vacancyApplications } from '@/db/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function statusFor(campaign: typeof campaigns.$inferSelect) {
  const status = campaign.status.toLowerCase();
  if (['ended', 'complete', 'completed', 'expired'].includes(status) || campaign.timeRemainingDays <= 0) return 'ended';
  if (['paused', 'suspended'].includes(status)) return 'paused';
  return 'active';
}

export async function GET(_request: Request, { params }: { params: Promise<{ accountId: string }> }) {
  const session = await auth();
  const viewerId = session?.user?.id;
  if (!viewerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { accountId } = await params;
  const targetId = accountId.replace(/^acc-/, '');

  try {
    const [createdRows, targetMemberships, jobRows] = await Promise.all([
      db.select().from(campaigns).where(eq(campaigns.createdBy, targetId)).orderBy(campaigns.createdAt),
      db.select().from(campaignMembers).where(and(eq(campaignMembers.userId, targetId), eq(campaignMembers.status, 'active'))),
      db.select().from(vacancies).where(eq(vacancies.createdBy, targetId)).orderBy(vacancies.createdAt),
    ]);
    const viewerNumericId = Number(viewerId);
    const viewerApplications = Number.isSafeInteger(viewerNumericId) && viewerNumericId > 0 && jobRows.length
      ? await db.select({ vacancyId: vacancyApplications.vacancyId, status: vacancyApplications.status })
        .from(vacancyApplications)
        .where(and(inArray(vacancyApplications.vacancyId, jobRows.map((job) => job.id)), eq(vacancyApplications.applicantId, viewerNumericId)))
      : [];
    const applicationStatusByJob = new Map(viewerApplications.map((application) => [String(application.vacancyId), application.status]));

    const joinedRows = targetMemberships.length
      ? await db.select().from(campaigns).where(inArray(campaigns.id, targetMemberships.map((membership) => membership.campaignId))).orderBy(campaigns.createdAt)
      : [];
    const allRows = [...new Map([...createdRows, ...joinedRows].map((row) => [row.id, row])).values()];
    const ids = allRows.map((row) => row.id);

    const [members, starVotes] = ids.length
      ? await Promise.all([
          db.select().from(campaignMembers).where(and(inArray(campaignMembers.campaignId, ids), eq(campaignMembers.status, 'active'))).orderBy(campaignMembers.joinedAt),
          db.select().from(authCampaignStars).where(inArray(authCampaignStars.campaignId, ids)),
        ])
      : [[], []];

    const userIds = [...new Set([...members.map((member) => member.userId), ...allRows.map((row) => row.createdBy)])]
      .map(Number).filter((id) => Number.isSafeInteger(id) && id > 0);
    const users = userIds.length ? await db.select({ id: authUsers.id, name: authUsers.name, username: authUsers.username }).from(authUsers).where(inArray(authUsers.id, userIds)) : [];
    const names = new Map(users.map((user) => [String(user.id), user.name]));
    const usernames = new Map(users.map((user) => [String(user.id), user.username]));
    const membersByCampaign = new Map<number, typeof members>();
    members.forEach((member) => {
      const group = membersByCampaign.get(member.campaignId) ?? [];
      group.push(member);
      membersByCampaign.set(member.campaignId, group);
    });
    const starCounts = new Map<number, number>();
    starVotes.forEach((vote) => starCounts.set(vote.campaignId, (starCounts.get(vote.campaignId) ?? 0) + 1));
    const starredByViewer = new Set(starVotes.filter((vote) => String(vote.userId) === String(viewerId)).map((vote) => vote.campaignId));

    const serialize = (campaign: typeof campaigns.$inferSelect) => {
      const campaignMembers = [...(membersByCampaign.get(campaign.id) ?? [])]
        .sort((a, b) => (a.rank || Number.MAX_SAFE_INTEGER) - (b.rank || Number.MAX_SAFE_INTEGER) || b.viewsGenerated - a.viewsGenerated || b.amount - a.amount);
      const viewerIndex = campaignMembers.findIndex((member) => String(member.userId) === String(viewerId));
      const targetIndex = campaignMembers.findIndex((member) => String(member.userId) === String(targetId));
      const topLeaders = campaignMembers.slice(0, 2);
      const viewerIsTopLeader = topLeaders.some((member) => String(member.userId) === String(viewerId));
      const viewerIsOwner = String(campaign.createdBy) === String(viewerId);
      const viewerJoined = viewerIndex >= 0;
      const targetJoined = targetIndex >= 0;
      const rankLabel = (index: number) => index >= 0 ? `Member #${index + 1}` : 'Not joined';
      const status = statusFor(campaign);

      return {
        id: String(campaign.id),
        name: campaign.title,
        employerAccountId: campaign.createdBy,
        ownerName: names.get(campaign.createdBy) ?? campaign.createdBy,
        ownerUsername: usernames.get(campaign.createdBy) ?? names.get(campaign.createdBy)?.toLowerCase().replace(/\s+/g, ''),
        ownerAccountId: `acc-${campaign.createdBy}`,
        budgetUgx: campaign.totalBudget,
        remainingUgx: Math.max(0, campaign.totalBudget - campaign.budgetUsed),
        amount: campaign.paid,
        cpm: campaign.highestMcp,
        viewsGenerated: campaign.viewsGenerated,
        budgetUsed: campaign.budgetUsed,
        totalBudget: campaign.totalBudget,
        budgetPercentAvailable: campaign.totalBudget > 0
          ? Math.round((Math.max(0, campaign.totalBudget - campaign.budgetUsed) / campaign.totalBudget) * 100)
          : 0,
        membersCount: campaignMembers.length,
        status,
        stars: starCounts.get(campaign.id) ?? 0,
        isStarred: starredByViewer.has(campaign.id),
        hasJoined: viewerJoined,
        userStarred: false,
        viewerIsOwner,
        canJoin: status === 'active' && !viewerIsOwner && !viewerJoined,
        canLeave: status !== 'ended' && viewerJoined,
        statusLabel: status === 'active' ? 'Active' : status === 'paused' ? 'Paused' : 'Ended',
        members: topLeaders.map((member, index) => ({
          userId: member.userId,
          name: names.get(member.userId) ?? 'PortVille member',
          rank: member.rank > 0 ? member.rank : index + 1,
          views: member.viewsGenerated,
          amount: member.amount,
        })),
        viewerLeader: viewerJoined && !viewerIsTopLeader && viewerIndex >= 0
          ? {
              userId: campaignMembers[viewerIndex].userId,
              name: names.get(campaignMembers[viewerIndex].userId) ?? session.user.name ?? 'You',
              rank: campaignMembers[viewerIndex].rank > 0 ? campaignMembers[viewerIndex].rank : viewerIndex + 1,
              views: campaignMembers[viewerIndex].viewsGenerated,
              amount: campaignMembers[viewerIndex].amount,
            }
          : null,
        profileOwner: {
          name: names.get(targetId) ?? 'Profile owner',
          rank: rankLabel(targetIndex),
          isMember: targetJoined,
        },
        viewer: {
          name: session.user.name ?? 'You',
          rank: rankLabel(viewerIndex),
          isMember: viewerJoined,
        },
      };
    };

    return NextResponse.json({
      createdCampaigns: createdRows.map(serialize),
      joinedCampaigns: joinedRows.map(serialize),
      jobs: jobRows.map((job) => ({
        id: String(job.id),
        title: job.title,
        description: job.description,
        location: job.location || 'Location not specified',
        employerName: job.employerName,
        requiredPeople: job.requiredPeople,
        applicants: job.applicants,
        accepted: job.accepted,
        status: ['paused'].includes(job.status.toLowerCase()) ? 'paused' : ['filled', 'acquired', 'closed'].includes(job.status.toLowerCase()) || job.daysRemaining <= 0 ? 'closed' : 'active',
        minSalary: job.minSalary,
        maxSalary: job.maxSalary,
        salaryPeriod: job.salaryPeriod || 'month',
        applicationStatus: applicationStatusByJob.get(String(job.id)) ?? null,
      })),
    }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    console.error('Profile campaign load failed:', error);
    return NextResponse.json({ error: 'Unable to load profile campaigns.' }, { status: 500 });
  }
}
