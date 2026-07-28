import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

async function ensureSchema() {
  // Create campaigns table
  await query(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT DEFAULT 'Technology',
      niche_hashtag TEXT DEFAULT 'growth',
      created_by TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      publisher_rating NUMERIC DEFAULT 4.8,
      publisher_profile_icon TEXT DEFAULT '/images/publisher-placeholder.png',
      community_size INTEGER DEFAULT 12000,
      views_generated INTEGER DEFAULT 0,
      likes_generated INTEGER DEFAULT 0,
      total_budget INTEGER DEFAULT 1000,
      budget_used INTEGER DEFAULT 0,
      highest_mcp INTEGER DEFAULT 100,
      time_remaining_days INTEGER DEFAULT 14,
      required_platforms TEXT DEFAULT '',
      start_date DATE,
      min_payout INTEGER DEFAULT 0,
      max_payout INTEGER DEFAULT 0,
      publish_fee INTEGER DEFAULT 1000,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Create campaign_members table to track joined campaigns
  await query(`
    CREATE TABLE IF NOT EXISTS campaign_members (
      id SERIAL PRIMARY KEY,
      campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      joined_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(campaign_id, user_id)
    )
  `);

  // Create engagement_events table for activities
  await query(`
    CREATE TABLE IF NOT EXISTS engagement_events (
      id SERIAL PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      actor_id TEXT NOT NULL,
      action TEXT NOT NULL,
      message TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

function mapCampaignRow(row: Record<string, unknown>, hasJoined = false) {
  return {
    id: toString(row.id ?? row.campaign_id, 'campaign-1'),
    publisherProfileIcon: toString(row.publisher_profile_icon, '/images/publisher-placeholder.png'),
    projectName: toString(row.title ?? row.project_name, 'Campaign'),
    publisherUsername: toString(row.created_by ?? row.publisher_username, 'publisher'),
    publisherRating: toNumber(row.publisher_rating, 4.8),
    timeRemainingDays: toNumber(row.time_remaining_days, 14),
    nicheHashtag: toString(row.niche_hashtag, 'growth'),
    description: toString(row.description, 'Live campaign listing'),
    category: toString(row.category, 'Technology'),
    status: toString(row.status, 'active'),
    communitySize: toNumber(row.community_size, 12000),
    viewsGenerated: toNumber(row.views_generated, 0),
    likesGenerated: toNumber(row.likes_generated, 0),
    totalBudget: toNumber(row.total_budget, 1000),
    budgetUsed: toNumber(row.budget_used, 0),
    highestMcp: toNumber(row.highest_mcp, 100),
    requiredPlatforms: (toString(row.required_platforms, '')).split(',').map((p) => p.trim()).filter(Boolean),
    hasJoined,
    startDate: toString(row.start_date, ''),
    minPayout: toNumber(row.min_payout, 0),
    maxPayout: toNumber(row.max_payout, 0),
    createdAt: row.created_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    await ensureSchema();

    const userId = toString(request.headers.get('x-user-id') ?? request.nextUrl.searchParams.get('userId'), 'demo-user');
    const filter = toString(request.nextUrl.searchParams.get('filter'), '');

    let query_str = 'SELECT c.* FROM campaigns c';
    const params: unknown[] = [];

    if (filter === 'created') {
      query_str += ' WHERE c.created_by = $1';
      params.push(userId);
    } else if (filter === 'joined') {
      query_str += ' INNER JOIN campaign_members cm ON c.id = cm.campaign_id WHERE cm.user_id = $1 AND cm.status = \'active\'';
      params.push(userId);
    } else {
      query_str += ' WHERE c.status = \'active\'';
    }

    query_str += ' ORDER BY c.created_at DESC LIMIT 50';

    const campaigns = await query<Record<string, unknown>>(query_str, params);

    if (filter === 'joined') {
      return NextResponse.json(campaigns.map((c) => mapCampaignRow(c, true)));
    }

    // Check which campaigns user has joined
    const memberRows = await query<Record<string, unknown>>(
      'SELECT campaign_id FROM campaign_members WHERE user_id = $1 AND status = \'active\'',
      [userId]
    );
    const joinedIds = new Set(memberRows.map((r) => Number(r.campaign_id)));

    return NextResponse.json(campaigns.map((c) => mapCampaignRow(c, joinedIds.has(toNumber(c.id)))));
  } catch (error) {
    console.error('Failed to load campaigns', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureSchema();

    const body = await request.json().catch(() => ({}));
    const userId = toString(request.headers.get('x-user-id') ?? body.userId ?? body.createdBy, 'demo-user');
    const title = toString(body.title, '');
    const description = toString(body.description, '');
    const category = toString(body.category, 'Technology');
    const nicheHashtag = toString(body.nicheHashtag ?? body.niche, 'growth');
    const totalBudget = toNumber(body.totalBudget ?? body.budget, 1000);
    const timeRemaining = toNumber(body.timeRemainingDays ?? body.daysRemaining, 14);
    const communitySize = toNumber(body.communitySize, 12000);
    const publisherRating = toNumber(body.publisherRating, 4.8);

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const created = await query<Record<string, unknown>>(
      `INSERT INTO campaigns (
        title, description, category, niche_hashtag, created_by, status,
        total_budget, time_remaining_days, community_size, publisher_rating
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, title, description, category, niche_hashtag, created_by, status,
        total_budget, budget_used, time_remaining_days, community_size, publisher_rating,
        views_generated, likes_generated, created_at`,
      [title, description, category, nicheHashtag, userId, 'active', totalBudget, timeRemaining, communitySize, publisherRating]
    );

    return NextResponse.json({ ok: true, item: mapCampaignRow(created[0]) });
  } catch (error) {
    console.error('Unable to create campaign', error);
    return NextResponse.json({ error: 'Unable to create campaign' }, { status: 500 });
  }
}
