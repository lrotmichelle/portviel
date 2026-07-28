import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

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
  // Create base vacancies table
  await query(`
    CREATE TABLE IF NOT EXISTS vacancies (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Add expected vacancy card columns
  await query(`ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS employer_name TEXT DEFAULT 'Employer'`);
  await query(`ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS handle TEXT DEFAULT 'employer'`);
  await query(`ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 5.0`);
  await query(`ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS days_remaining INTEGER DEFAULT 14`);
  await query(`ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS required_people INTEGER DEFAULT 1`);
  await query(`ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS applicants INTEGER DEFAULT 0`);
  await query(`ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS accepted INTEGER DEFAULT 0`);
  await query(`ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS requirements TEXT DEFAULT ''`);
  await query(`ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS min_salary INTEGER DEFAULT 0`);
  await query(`ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS max_salary INTEGER DEFAULT 0`);
  await query(`ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'apply'`);
  await query(`ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ DEFAULT NOW()`);

  // Create base campaigns table
  await query(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT DEFAULT 'Technology',
      created_by TEXT NOT NULL,
      status TEXT DEFAULT 'Active',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Add expected campaign card columns
  await query(`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS niche_hashtag TEXT DEFAULT 'growth'`);
  await query(`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS total_budget INTEGER DEFAULT 1000`);
  await query(`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS budget_used INTEGER DEFAULT 0`);
  await query(`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS time_remaining_days INTEGER DEFAULT 14`);
  await query(`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS publisher_rating NUMERIC DEFAULT 4.8`);
  await query(`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS publisher_profile_icon TEXT DEFAULT '/images/publisher-placeholder.png'`);
  await query(`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS community_size INTEGER DEFAULT 12000`);
  await query(`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS views_generated INTEGER DEFAULT 10000`);
  await query(`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS likes_generated INTEGER DEFAULT 1500`);
  await query(`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS highest_mcp INTEGER DEFAULT 100`);
  await query(`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS required_platforms TEXT DEFAULT ''`);
  await query(`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS start_date DATE`);
  await query(`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS min_payout INTEGER DEFAULT 0`);
  await query(`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS max_payout INTEGER DEFAULT 0`);
  await query(`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS publish_fee INTEGER DEFAULT 1000`);

  // Create base market_listings table
  await query(`
    CREATE TABLE IF NOT EXISTS market_listings (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      price NUMERIC DEFAULT 0,
      created_by TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Add expected market listing card columns
  await query(`ALTER TABLE market_listings ADD COLUMN IF NOT EXISTS profile_url TEXT`);
  await query(`ALTER TABLE market_listings ADD COLUMN IF NOT EXISTS platform TEXT`);
  await query(`ALTER TABLE market_listings ADD COLUMN IF NOT EXISTS handle TEXT`);
  await query(`ALTER TABLE market_listings ADD COLUMN IF NOT EXISTS followers INTEGER DEFAULT 0`);
  await query(`ALTER TABLE market_listings ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0`);
  await query(`ALTER TABLE market_listings ADD COLUMN IF NOT EXISTS engagement_rate NUMERIC DEFAULT 0`);
  await query(`ALTER TABLE market_listings ADD COLUMN IF NOT EXISTS niche TEXT DEFAULT 'Growth'`);

  // Create engagement_events table
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
    status: toString(row.status ?? 'Active', 'Active'),
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
    await ensureSchema();

    const userId = toString(request.headers.get('x-user-id'), 'demo-user');

    const [vacancies, campaigns, marketListings, activity] = await Promise.all([
      query<Record<string, unknown>>('SELECT * FROM vacancies ORDER BY created_at DESC LIMIT 20'),
      query<Record<string, unknown>>('SELECT * FROM campaigns ORDER BY created_at DESC LIMIT 20'),
      query<Record<string, unknown>>('SELECT * FROM market_listings ORDER BY created_at DESC LIMIT 20'),
      query<Record<string, unknown>>('SELECT * FROM engagement_events ORDER BY created_at DESC LIMIT 50'),
    ]);

    const joinedCampaignIds = new Set(
      activity
        .filter((entry) => entry.entity_type === 'campaign' && entry.action === 'join' && entry.actor_id === userId)
        .map((entry) => String(entry.entity_id))
    );

    const participatedCampaignIds = new Set(
      activity
        .filter((entry) => entry.entity_type === 'campaign' && entry.action === 'participate' && entry.actor_id === userId)
        .map((entry) => String(entry.entity_id))
    );

    const joinedCampaigns = campaigns
      .filter((campaign) => joinedCampaignIds.has(String(campaign.id)))
      .map((campaign) => ({
        ...mapCampaignRow(campaign),
        submitted: participatedCampaignIds.has(String(campaign.id)),
      }));

    return NextResponse.json({
      vacancies: vacancies.map(mapVacancyRow),
      campaigns: campaigns.map(mapCampaignRow),
      marketListings: marketListings.map(mapMarketRow),
      activity: activity.map(mapActivityRow),
      joinedCampaigns,
    });
  } catch (error) {
    console.error('Secure API failed', error);
    return NextResponse.json({ error: 'Unable to load secure data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureSchema();

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
      const vacant = Number(body.vacant ?? body.requiredPeople ?? body.required_people) || 1;
      const minSalary = Number(body.minSalary ?? body.min_salary) || 0;
      const maxSalary = Number(body.maxSalary ?? body.max_salary) || 0;
      
      const requirementsArray = Array.isArray(body.skills ?? body.requirements)
        ? (body.skills ?? body.requirements)
        : [];
      const requirements = requirementsArray.join(',');

      if (!title || !description) {
        return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
      }

      const created = await queryOne<Record<string, unknown>>(
        `INSERT INTO vacancies (
          title, description, category, employer_name, handle, rating, 
          days_remaining, required_people, min_salary, max_salary, requirements, status, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          title, description, category, employerName, handle, rating,
          daysRemaining, vacant, minSalary, maxSalary, requirements, 'apply', userId
        ]
      );

      return NextResponse.json({ ok: true, item: mapVacancyRow(created ?? {}), role });
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

      if (!title || !description) {
        return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
      }

      const publishFee = Number(body.publishFee ?? body.publish_fee) || 1000;

      const requiredPlatforms = Array.isArray(body.requiredPlatforms)
        ? body.requiredPlatforms.filter((platform: string) => typeof platform === 'string' && platform.trim()).map((platform: string) => platform.trim().toLowerCase())
        : typeof body.requiredPlatforms === 'string'
          ? body.requiredPlatforms.split(',').map((platform: string) => platform.trim().toLowerCase()).filter(Boolean)
          : [];

      const created = await queryOne<Record<string, unknown>>(
        `INSERT INTO campaigns (
          title, description, category, niche_hashtag, total_budget, budget_used, 
          time_remaining_days, publisher_rating, publisher_profile_icon, community_size, 
          views_generated, likes_generated, highest_mcp, required_platforms, status, start_date, min_payout, max_payout, publish_fee, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING *`,
        [
          title, description, category, nicheHashtag, totalBudget, 0,
          timeRemainingDays, 4.8, '/images/publisher-placeholder.png', 12000,
          10000, 1500, 100, requiredPlatforms.join(','), 'Active', startDate || null, minPayout, maxPayout, publishFee, userId
        ]
      );

      await query(
        'INSERT INTO engagement_events (entity_type, entity_id, actor_id, action, message) VALUES ($1, $2, $3, $4, $5)',
        ['campaign', created?.id ?? 0, userId, 'create', `Campaign created by ${userId}`]
      );

      return NextResponse.json({ ok: true, item: mapCampaignRow(created ?? {}), role });
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
        } catch {}
      }

      if (!title || !description) {
        return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
      }

      const created = await queryOne<Record<string, unknown>>(
        `INSERT INTO market_listings (
          title, description, price, profile_url, platform, handle, followers, likes, engagement_rate, niche, created_by, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          title, description, price, profileUrl, platform, handle, 3500, 12000, 4.5, niche, userId, 'open'
        ]
      );

      await query(
        'INSERT INTO engagement_events (entity_type, entity_id, actor_id, action, message) VALUES ($1, $2, $3, $4, $5)',
        ['market', created?.id ?? 0, userId, 'create', `Market listing created by ${userId}`]
      );

      return NextResponse.json({ ok: true, item: mapMarketRow(created ?? {}), role });
    }

    if (mode === 'pause_vacancy') {
      const entityId = Number(body.entityId ?? body.entity_id);
      if (!entityId) {
        return NextResponse.json({ error: 'Vacancy id is required' }, { status: 400 });
      }

      const updated = await queryOne<Record<string, unknown>>(
        `UPDATE vacancies 
         SET status = CASE WHEN status = 'paused' THEN 'apply' ELSE 'paused' END,
             status_updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [entityId]
      );

      return NextResponse.json({ ok: true, item: mapVacancyRow(updated ?? {}) });
    }

    if (mode === 'delete_vacancy') {
      const entityId = Number(body.entityId ?? body.entity_id);
      if (!entityId) {
        return NextResponse.json({ error: 'Vacancy id is required' }, { status: 400 });
      }

      await query('DELETE FROM vacancies WHERE id = $1', [entityId]);
      await query('DELETE FROM engagement_events WHERE entity_type = \'vacancy\' AND entity_id = $1', [entityId]);

      return NextResponse.json({ ok: true });
    }

    if (mode === 'pause_campaign') {
      const entityId = Number(body.entityId ?? body.entity_id);
      if (!entityId) {
        return NextResponse.json({ error: 'Campaign id is required' }, { status: 400 });
      }

      const updated = await queryOne<Record<string, unknown>>(
        `UPDATE campaigns 
         SET status = CASE WHEN status = 'Paused' THEN 'Active' ELSE 'Paused' END
         WHERE id = $1
         RETURNING *`,
        [entityId]
      );

      return NextResponse.json({ ok: true, item: mapCampaignRow(updated ?? {}) });
    }

    if (mode === 'delete_campaign') {
      const entityId = Number(body.entityId ?? body.entity_id);
      if (!entityId) {
        return NextResponse.json({ error: 'Campaign id is required' }, { status: 400 });
      }

      await query('DELETE FROM campaigns WHERE id = $1', [entityId]);
      await query('DELETE FROM engagement_events WHERE entity_type = \'campaign\' AND entity_id = $1', [entityId]);

      return NextResponse.json({ ok: true });
    }

    if (mode === 'pause_listing') {
      const entityId = Number(body.entityId ?? body.entity_id);
      if (!entityId) {
        return NextResponse.json({ error: 'Market listing id is required' }, { status: 400 });
      }

      const updated = await queryOne<Record<string, unknown>>(
        `UPDATE market_listings 
         SET status = CASE WHEN status = 'paused' THEN 'open' ELSE 'paused' END
         WHERE id = $1
         RETURNING *`,
        [entityId]
      );

      return NextResponse.json({ ok: true, item: mapMarketRow(updated ?? {}) });
    }

    if (mode === 'delete_listing') {
      const entityId = Number(body.entityId ?? body.entity_id);
      if (!entityId) {
        return NextResponse.json({ error: 'Market listing id is required' }, { status: 400 });
      }

      await query('DELETE FROM market_listings WHERE id = $1', [entityId]);
      await query('DELETE FROM engagement_events WHERE entity_type = \'market\' AND entity_id = $1', [entityId]);

      return NextResponse.json({ ok: true });
    }

    if (mode === 'interact') {
      const entityType = toString(body.entityType ?? body.entity_type, 'campaign');
      const entityId = toNumber(body.entityId ?? body.entity_id, 0);
      const action = toString(body.actionType ?? body.action ?? 'interact', 'interact');
      const message = toString(body.message ?? `${action} by ${userId}`, '');

      if (!entityId) {
        return NextResponse.json({ error: 'An entity id is required' }, { status: 400 });
      }

      await query(
        'INSERT INTO engagement_events (entity_type, entity_id, actor_id, action, message) VALUES ($1, $2, $3, $4, $5)',
        [entityType, entityId, userId, action, message]
      );

      return NextResponse.json({ ok: true, role, entityType, entityId, action, message });
    }

    if (mode === 'update_campaign') {
      const entityId = toNumber(body.entityId ?? body.entity_id ?? body.campaignId, 0);
      const minPayout = body.minPayout !== undefined || body.min_payout !== undefined ? Number(body.minPayout ?? body.min_payout ?? 0) : undefined;
      const maxPayout = body.maxPayout !== undefined || body.max_payout !== undefined ? Number(body.maxPayout ?? body.max_payout ?? 0) : undefined;
      const startDate = body.startDate !== undefined || body.start_date !== undefined ? toString(body.startDate ?? body.start_date, '') : undefined;
      if (!entityId) return NextResponse.json({ error: 'An entity id is required' }, { status: 400 });

      const updates: string[] = [];
      const values: unknown[] = [];
      if (minPayout !== undefined) {
        updates.push(`min_payout = $${values.length + 1}`);
        values.push(minPayout);
      }
      if (maxPayout !== undefined) {
        updates.push(`max_payout = $${values.length + 1}`);
        values.push(maxPayout);
      }
      if (startDate !== undefined) {
        updates.push(`start_date = $${values.length + 1}`);
        values.push(startDate || null);
      }
      if (!updates.length) return NextResponse.json({ error: 'No campaign updates provided' }, { status: 400 });

      await query(`UPDATE campaigns SET ${updates.join(', ')} WHERE id = $${values.length + 1}`, [...values, entityId]);
      await query(
        'INSERT INTO engagement_events (entity_type, entity_id, actor_id, action, message) VALUES ($1, $2, $3, $4, $5)',
        ['campaign', entityId, userId, 'update', `Campaign updated by ${userId}`]
      );

      return NextResponse.json({ ok: true, entityId });
    }

    if (mode === 'update_campaign_status') {
      const entityId = toNumber(body.entityId ?? body.entity_id ?? body.campaignId, 0);
      const status = toString(body.status ?? body.newStatus ?? 'paused', 'paused');
      if (!entityId) return NextResponse.json({ error: 'An entity id is required' }, { status: 400 });

      await query('UPDATE campaigns SET status = $1 WHERE id = $2', [status, entityId]);
      await query(
        'INSERT INTO engagement_events (entity_type, entity_id, actor_id, action, message) VALUES ($1, $2, $3, $4, $5)',
        ['campaign', entityId, userId, 'status_update', `Status changed to ${status} by ${userId}`]
      );

      return NextResponse.json({ ok: true, entityId, status });
    }

    if (mode === 'approve_campaign_submission') {
      const entityId = toNumber(body.entityId ?? body.entity_id ?? body.campaignId, 0);
      const approved = body.approved !== undefined ? Boolean(body.approved) : true;
      if (!entityId) return NextResponse.json({ error: 'An entity id is required' }, { status: 400 });

      const nextStatus = approved ? 'Approved' : 'Pending Approval';
      await query('UPDATE campaigns SET status = $1 WHERE id = $2', [nextStatus, entityId]);
      await query(
        'INSERT INTO engagement_events (entity_type, entity_id, actor_id, action, message) VALUES ($1, $2, $3, $4, $5)',
        ['campaign', entityId, userId, 'approval', `Campaign submission ${approved ? 'approved' : 'submitted'} by ${userId}`]
      );

      return NextResponse.json({ ok: true, entityId, status: nextStatus });
    }

    if (mode === 'delete_campaign') {
      const entityId = toNumber(body.entityId ?? body.entity_id ?? body.campaignId, 0);
      if (!entityId) return NextResponse.json({ error: 'An entity id is required' }, { status: 400 });

      await query('DELETE FROM campaigns WHERE id = $1', [entityId]);
      await query('DELETE FROM engagement_events WHERE entity_type = $1 AND entity_id = $2', ['campaign', entityId]);

      await query(
        'INSERT INTO engagement_events (entity_type, entity_id, actor_id, action, message) VALUES ($1, $2, $3, $4, $5)',
        ['campaign', entityId, userId, 'delete', `Campaign deleted by ${userId}`]
      );

      return NextResponse.json({ ok: true, deleted: true, entityId });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to process secure action', error);
    return NextResponse.json({ error: 'Unable to process your request' }, { status: 500 });
  }
}
