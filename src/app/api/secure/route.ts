import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';

import { campaigns, engagementEvents, marketListings, vacancies } from '@/db/schema';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function parseArray(raw: unknown) {
  if (Array.isArray(raw)) {
    return raw.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
  }

  if (typeof raw === 'string') {
    return raw.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function mapCampaignRow(row: Record<string, unknown>) {
  return {
    id: toString(row.id ?? row.campaign_id ?? row.campaignId, 'campaign-1'),
    publisherProfileIcon: toString(row.publisher_profile_icon ?? row.publisherProfileIcon, '/images/publisher-placeholder.png'),
    projectName: toString(row.title ?? row.project_name ?? row.projectName ?? 'Campaign', 'Campaign'),
    publisherUsername: toString(row.created_by ?? row.publisher_username ?? row.publisherUsername ?? 'publisher', 'publisher'),
    publisherRating: toNumber(row.publisher_rating ?? row.publisherRating, 4.5),
    timeRemainingDays: toNumber(row.time_remaining_days ?? row.timeRemainingDays, 14),
    nicheHashtag: toString(row.niche_hashtag ?? row.nicheHashtag, 'growth'),
    description: toString(row.description ?? 'Live campaign listing', 'Live campaign listing'),
    category: toString(row.category ?? 'Technology', 'Technology'),
    status: toString(row.status ?? 'active', 'active'),
    communitySize: toNumber(row.community_size ?? row.communitySize, 12000),
    viewsGenerated: toNumber(row.views_generated ?? row.viewsGenerated, 10000),
    likesGenerated: toNumber(row.likes_generated ?? row.likesGenerated, 1500),
    totalBudget: toNumber(row.total_budget ?? row.totalBudget, 1000),
    budgetUsed: toNumber(row.budget_used ?? row.budgetUsed, 0),
    highestMcp: toNumber(row.highest_mcp ?? row.highestMcp, 100),
    requiredPlatforms: (toString(row.required_platforms ?? row.requiredPlatforms, '')).split(',').map((platform) => platform.trim()).filter(Boolean),
    hasJoined: Boolean(row.has_joined ?? row.hasJoined ?? false),
    startDate: toString(row.start_date ?? row.startDate, ''),
    minPayout: toNumber(row.min_payout ?? row.minPayout, 0),
    maxPayout: toNumber(row.max_payout ?? row.maxPayout, 0),
  };
}

function mapVacancyRow(row: Record<string, unknown>) {
  const reqs = toString(row.requirements, '');
  return {
    id: toString(row.id, 'vacancy-1'),
    title: toString(row.title, 'Open role'),
    description: toString(row.description, 'Vacancy listing'),
    category: toString(row.category, 'general'),
    employerName: toString(row.employer_name, 'Employer'),
    handle: toString(row.handle, 'employer'),
    rating: toNumber(row.rating, 4.8),
    daysRemaining: toNumber(row.days_remaining, 14),
    requiredPeople: toNumber(row.required_people, 1),
    applicants: toNumber(row.applicants, 0),
    accepted: toNumber(row.accepted, 0),
    requirements: reqs ? reqs.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    minSalary: toNumber(row.min_salary, 0),
    maxSalary: toNumber(row.max_salary, 0),
    status: toString(row.status, 'apply'),
    createdBy: toString(row.created_by, 'anonymous'),
    createdAt: row.created_at,
  };
}

function mapMarketRow(row: Record<string, unknown>) {
  return {
    id: toString(row.id, 'market-1'),
    title: toString(row.title, 'Market listing'),
    description: toString(row.description, 'Live market listing'),
    price: toNumber(row.price, 0),
    profileUrl: toString(row.profile_url, ''),
    platform: toString(row.platform, 'instagram.com'),
    handle: toString(row.handle, 'seller'),
    followers: toNumber(row.followers, 3500),
    likes: toNumber(row.likes, 12000),
    engagementRate: toNumber(row.engagement_rate, 4.5),
    niche: toString(row.niche, 'Growth'),
    createdBy: toString(row.created_by, 'anonymous'),
    status: toString(row.status, 'open'),
    createdAt: row.created_at,
  };
}

function mapActivityRow(row: Record<string, unknown>) {
  return {
    id: toString(row.id, 'activity-1'),
    entityType: toString(row.entity_type, 'campaign'),
    entityId: toNumber(row.entity_id, 0),
    actorId: toString(row.actor_id, 'anonymous'),
    action: toString(row.action, 'interact'),
    message: toString(row.message, 'Activity recorded'),
    createdAt: row.created_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const userId = toString(request.headers.get('x-user-id'), 'demo-user');

    const [vacancyRows, campaignRows, marketRows, activityRows] = await Promise.all([
      db.select().from(vacancies).orderBy(desc(vacancies.createdAt)).limit(20),
      db.select().from(campaigns).orderBy(desc(campaigns.createdAt)).limit(20),
      db.select().from(marketListings).where(eq(marketListings.createdBy, userId)).orderBy(desc(marketListings.createdAt)).limit(20),
      db.select().from(engagementEvents).orderBy(desc(engagementEvents.createdAt)).limit(50),
    ]);

    const joinedCampaignIds = new Set(
      activityRows
        .filter((entry) => entry.entityType === 'campaign' && entry.action === 'join' && entry.actorId === userId)
        .map((entry) => String(entry.entityId))
    );

    const participatedCampaignIds = new Set(
      activityRows
        .filter((entry) => entry.entityType === 'campaign' && entry.action === 'participate' && entry.actorId === userId)
        .map((entry) => String(entry.entityId))
    );

    const joinedCampaigns = campaignRows
      .filter((campaign) => joinedCampaignIds.has(String(campaign.id)))
      .map((campaign) => ({
        ...mapCampaignRow(campaign as Record<string, unknown>),
        submitted: participatedCampaignIds.has(String(campaign.id)),
      }));

    return NextResponse.json({
      vacancies: vacancyRows.map((vacancy) => mapVacancyRow(vacancy as Record<string, unknown>)),
      campaigns: campaignRows.map((campaign) => mapCampaignRow(campaign as Record<string, unknown>)),
      marketListings: marketRows.map((listing) => mapMarketRow(listing as Record<string, unknown>)),
      activity: activityRows.map((eventItem) => mapActivityRow(eventItem as Record<string, unknown>)),
      joinedCampaigns,
    });
  } catch (error) {
    console.error('Secure API failed', error);
    return NextResponse.json({ error: 'Unable to load secure data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = toString(request.headers.get('x-user-id') ?? body.userId ?? body.createdBy ?? body.actorId, 'demo-user');
    const role = toString(request.headers.get('x-user-role') ?? body.role ?? 'member', 'member');

    if (!userId) {
      return NextResponse.json({ error: 'A user identity is required' }, { status: 401 });
    }

    const mode = toString(body.mode ?? body.action ?? body.type, '');

    if (mode === 'create_discover') {
      const title = toString(body.title, '');
      const description = toString(body.description, '');
      const category = toString(body.category ?? body.niche, 'general');
      const employerName = toString(body.employerName ?? body.employer_name, 'Employer');
      const handle = employerName.toLowerCase().replace(/\s+/g, '') || 'employer';
      const rating = 4.8;
      const daysRemaining = Number(body.daysRemaining ?? body.days_remaining) || 14;
      const requiredPeople = Number(body.vacant ?? body.requiredPeople ?? body.required_people) || 1;
      const minSalary = Number(body.minSalary ?? body.min_salary) || 0;
      const maxSalary = Number(body.maxSalary ?? body.max_salary) || 0;
      const requirements = parseArray(body.skills ?? body.requirements).join(',');

      if (!title || !description) {
        return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
      }

      const [created] = await db.insert(vacancies).values({
        title,
        description,
        category,
        employerName,
        handle,
        rating,
        daysRemaining,
        requiredPeople,
        applicants: 0,
        accepted: 0,
        requirements,
        minSalary,
        maxSalary,
        status: 'apply',
        statusUpdatedAt: new Date(),
        createdBy: userId,
      }).returning();

      return NextResponse.json({ ok: true, item: mapVacancyRow(created as unknown as Record<string, unknown>), role });
    }

    if (mode === 'create_campaign') {
      const title = toString(body.title, '');
      const description = toString(body.description, '');
      const category = toString(body.category, 'Technology');
      const nicheHashtag = toString(body.nicheHashtag ?? body.niche_hashtag, 'growth');
      const totalBudget = Number(body.totalBudget ?? body.total_budget) || 1000;
      const timeRemainingDays = Number(body.timeRemainingDays ?? body.time_remaining_days) || 14;
      const startDate = toString(body.startDate ?? body.start_date, '');
      const minPayout = Number(body.minPayout ?? body.min_payout) || 0;
      const maxPayout = Number(body.maxPayout ?? body.max_payout) || 0;
      const publishFee = Number(body.publishFee ?? body.publish_fee) || 1000;
      const requiredPlatforms = parseArray(body.requiredPlatforms ?? body.required_platforms).join(',');

      if (!title || !description) {
        return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
      }

      const [created] = await db.insert(campaigns).values({
        title,
        description,
        category,
        nicheHashtag,
        totalBudget,
        budgetUsed: 0,
        timeRemainingDays,
        publisherRating: 4.8,
        publisherProfileIcon: '/images/publisher-placeholder.png',
        communitySize: 12000,
        viewsGenerated: 10000,
        likesGenerated: 1500,
        highestMcp: 100,
        requiredPlatforms,
        status: 'active',
        startDate: startDate ? new Date(startDate) : null,
        minPayout,
        maxPayout,
        publishFee,
        createdBy: userId,
      }).returning();

      await db.insert(engagementEvents).values({
        entityType: 'campaign',
        entityId: created.id,
        actorId: userId,
        action: 'create',
        message: `Campaign created by ${userId}`,
      });

      return NextResponse.json({ ok: true, item: mapCampaignRow(created as unknown as Record<string, unknown>), role });
    }

    if (mode === 'create_market') {
      const title = toString(body.title, '');
      const description = toString(body.description, '');
      const price = toNumber(body.price, 0);
      const profileUrl = toString(body.profileUrl ?? body.profile_url, '');
      const niche = toString(body.niche, 'Growth');

      let platform = 'instagram.com';
      let handle = 'seller';
      if (profileUrl) {
        try {
          const parsed = new URL(profileUrl);
          platform = parsed.hostname.toLowerCase().replace(/^www\./, '');
          const pathParts = parsed.pathname.split('/').filter(Boolean);
          handle = pathParts[0] ? pathParts[0].replace(/^@/, '') : 'seller';
        } catch {
          // ignore invalid URL
        }
      }

      if (!title || !description) {
        return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
      }

      const [created] = await db.insert(marketListings).values({
        title,
        description,
        price,
        profileUrl,
        platform,
        handle,
        followers: 3500,
        likes: 12000,
        engagementRate: 4.5,
        niche,
        createdBy: userId,
        status: 'open',
      }).returning();

      await db.insert(engagementEvents).values({
        entityType: 'market',
        entityId: created.id,
        actorId: userId,
        action: 'create',
        message: `Market listing created by ${userId}`,
      });

      return NextResponse.json({ ok: true, item: mapMarketRow(created as unknown as Record<string, unknown>), role });
    }

    const entityId = Number(body.entityId ?? body.entity_id ?? body.campaignId ?? 0);

    if (mode === 'pause_vacancy') {
      if (!entityId) {
        return NextResponse.json({ error: 'Vacancy id is required' }, { status: 400 });
      }

      const [vacancy] = await db.select().from(vacancies).where(eq(vacancies.id, entityId)).limit(1);
      if (!vacancy) {
        return NextResponse.json({ error: 'Vacancy not found' }, { status: 404 });
      }

      const [updated] = await db.update(vacancies)
        .set({
          status: vacancy.status === 'paused' ? 'apply' : 'paused',
          statusUpdatedAt: new Date(),
        })
        .where(eq(vacancies.id, entityId))
        .returning();

      return NextResponse.json({ ok: true, item: mapVacancyRow(updated as unknown as Record<string, unknown>) });
    }

    if (mode === 'delete_vacancy') {
      if (!entityId) {
        return NextResponse.json({ error: 'Vacancy id is required' }, { status: 400 });
      }

      await db.delete(engagementEvents).where(and(eq(engagementEvents.entityType, 'vacancy'), eq(engagementEvents.entityId, entityId)));
      await db.delete(vacancies).where(eq(vacancies.id, entityId));

      return NextResponse.json({ ok: true });
    }

    if (mode === 'pause_campaign') {
      if (!entityId) {
        return NextResponse.json({ error: 'Campaign id is required' }, { status: 400 });
      }

      const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, entityId)).limit(1);
      if (!campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }

      const nextStatus = campaign.status.toLowerCase() === 'paused' ? 'active' : 'paused';
      const [updated] = await db.update(campaigns)
        .set({ status: nextStatus })
        .where(eq(campaigns.id, entityId))
        .returning();

      return NextResponse.json({ ok: true, item: mapCampaignRow(updated as unknown as Record<string, unknown>) });
    }

    if (mode === 'delete_campaign') {
      if (!entityId) {
        return NextResponse.json({ error: 'Campaign id is required' }, { status: 400 });
      }

      await db.delete(engagementEvents).where(and(eq(engagementEvents.entityType, 'campaign'), eq(engagementEvents.entityId, entityId)));
      await db.delete(campaigns).where(eq(campaigns.id, entityId));

      await db.insert(engagementEvents).values({
        entityType: 'campaign',
        entityId,
        actorId: userId,
        action: 'delete',
        message: `Campaign deleted by ${userId}`,
      });

      return NextResponse.json({ ok: true, deleted: true, entityId });
    }

    if (mode === 'pause_listing') {
      if (!entityId) {
        return NextResponse.json({ error: 'Market listing id is required' }, { status: 400 });
      }

      const [listing] = await db.select().from(marketListings).where(eq(marketListings.id, entityId)).limit(1);
      if (!listing) {
        return NextResponse.json({ error: 'Market listing not found' }, { status: 404 });
      }

      const nextStatus = listing.status === 'paused' ? 'open' : 'paused';
      const [updated] = await db.update(marketListings)
        .set({ status: nextStatus })
        .where(eq(marketListings.id, entityId))
        .returning();

      return NextResponse.json({ ok: true, item: mapMarketRow(updated as unknown as Record<string, unknown>) });
    }

    if (mode === 'update_listing') {
      if (!entityId) {
        return NextResponse.json({ error: 'Market listing id is required' }, { status: 400 });
      }

      const newPrice = toNumber(body.price ?? body.newPrice ?? body.amount, NaN);
      if (!Number.isFinite(newPrice) || newPrice < 0) {
        return NextResponse.json({ error: 'A valid new price is required' }, { status: 400 });
      }

      const [listing] = await db.select().from(marketListings).where(eq(marketListings.id, entityId)).limit(1);
      if (!listing) {
        return NextResponse.json({ error: 'Market listing not found' }, { status: 404 });
      }

      const [updated] = await db.update(marketListings)
        .set({ price: newPrice })
        .where(eq(marketListings.id, entityId))
        .returning();

      await db.insert(engagementEvents).values({
        entityType: 'market',
        entityId,
        actorId: userId,
        action: 'update_price',
        message: `Market listing price updated to ${newPrice} by ${userId}`,
      });

      return NextResponse.json({ ok: true, item: mapMarketRow(updated as unknown as Record<string, unknown>) });
    }

    if (mode === 'delete_listing') {
      if (!entityId) {
        return NextResponse.json({ error: 'Market listing id is required' }, { status: 400 });
      }

      await db.delete(engagementEvents).where(and(eq(engagementEvents.entityType, 'market'), eq(engagementEvents.entityId, entityId)));
      await db.delete(marketListings).where(eq(marketListings.id, entityId));

      return NextResponse.json({ ok: true });
    }

    if (mode === 'interact') {
      const entityType = toString(body.entityType ?? body.entity_type, 'campaign');
      const action = toString(body.actionType ?? body.action ?? 'interact', 'interact');
      const message = toString(body.message ?? `${action} by ${userId}`, '');

      if (!entityId) {
        return NextResponse.json({ error: 'An entity id is required' }, { status: 400 });
      }

      await db.insert(engagementEvents).values({
        entityType,
        entityId,
        actorId: userId,
        action,
        message,
      });

      return NextResponse.json({ ok: true, role, entityType, entityId, action, message });
    }

    if (mode === 'update_campaign') {
      if (!entityId) {
        return NextResponse.json({ error: 'An entity id is required' }, { status: 400 });
      }

      const data: Record<string, unknown> = {};
      if (body.minPayout !== undefined || body.min_payout !== undefined) {
        data.minPayout = Number(body.minPayout ?? body.min_payout ?? 0);
      }
      if (body.maxPayout !== undefined || body.max_payout !== undefined) {
        data.maxPayout = Number(body.maxPayout ?? body.max_payout ?? 0);
      }
      if (body.startDate !== undefined || body.start_date !== undefined) {
        const value = toString(body.startDate ?? body.start_date, '');
        data.startDate = value ? new Date(value) : null;
      }

      if (!Object.keys(data).length) {
        return NextResponse.json({ error: 'No campaign updates provided' }, { status: 400 });
      }

      await db.update(campaigns).set(data).where(eq(campaigns.id, entityId));
      await db.insert(engagementEvents).values({
        entityType: 'campaign',
        entityId,
        actorId: userId,
        action: 'update',
        message: `Campaign updated by ${userId}`,
      });

      return NextResponse.json({ ok: true, entityId });
    }

    if (mode === 'update_campaign_status') {
      const status = toString(body.status ?? body.newStatus ?? 'paused', 'paused');
      if (!entityId) {
        return NextResponse.json({ error: 'An entity id is required' }, { status: 400 });
      }

      await db.update(campaigns).set({ status }).where(eq(campaigns.id, entityId));
      await db.insert(engagementEvents).values({
        entityType: 'campaign',
        entityId,
        actorId: userId,
        action: 'status_update',
        message: `Status changed to ${status} by ${userId}`,
      });

      return NextResponse.json({ ok: true, entityId, status });
    }

    if (mode === 'approve_campaign_submission') {
      const approved = body.approved !== undefined ? Boolean(body.approved) : true;
      if (!entityId) {
        return NextResponse.json({ error: 'An entity id is required' }, { status: 400 });
      }

      const nextStatus = approved ? 'approved' : 'pending approval';
      await db.update(campaigns).set({ status: nextStatus }).where(eq(campaigns.id, entityId));
      await db.insert(engagementEvents).values({
        entityType: 'campaign',
        entityId,
        actorId: userId,
        action: 'approval',
        message: `Campaign submission ${approved ? 'approved' : 'submitted'} by ${userId}`,
      });

      return NextResponse.json({ ok: true, entityId, status: nextStatus });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to process secure action', error);
    return NextResponse.json({ error: 'Unable to process your request' }, { status: 500 });
  }
}
