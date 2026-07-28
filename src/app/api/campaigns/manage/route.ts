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
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

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
}

/**
 * POST /api/campaigns/manage
 * 
 * Actions:
 * - join: User joins a campaign
 * - leave: User leaves a campaign
 * - update: Campaign creator updates campaign details
 * - pause: Campaign creator pauses campaign
 * - resume: Campaign creator resumes campaign
 * - delete: Campaign creator deletes campaign
 */
export async function POST(request: NextRequest) {
  try {
    await ensureSchema();

    const body = await request.json().catch(() => ({}));
    const userId = toString(request.headers.get('x-user-id') ?? body.userId, 'demo-user');
    const action = toString(body.action ?? body.mode, '').toLowerCase();
    const campaignId = toNumber(body.campaignId ?? body.id);

    if (!action || !campaignId) {
      return NextResponse.json({ error: 'Action and campaignId are required' }, { status: 400 });
    }

    // JOIN action
    if (action === 'join') {
      const campaign = await query<Record<string, unknown>>(
        'SELECT id FROM campaigns WHERE id = $1',
        [campaignId]
      );

      if (!campaign.length) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }

      await query(
        'INSERT INTO campaign_members (campaign_id, user_id, status) VALUES ($1, $2, $3) ON CONFLICT (campaign_id, user_id) DO UPDATE SET status = $3',
        [campaignId, userId, 'active']
      );

      return NextResponse.json({ ok: true, message: 'Joined campaign successfully' });
    }

    // LEAVE action
    if (action === 'leave') {
      await query(
        'UPDATE campaign_members SET status = $1 WHERE campaign_id = $2 AND user_id = $3',
        ['inactive', campaignId, userId]
      );

      return NextResponse.json({ ok: true, message: 'Left campaign successfully' });
    }

    // UPDATE action (creator only)
    if (action === 'update') {
      const campaign = await query<Record<string, unknown>>(
        'SELECT created_by FROM campaigns WHERE id = $1',
        [campaignId]
      );

      if (!campaign.length) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }

      if (campaign[0].created_by !== userId) {
        return NextResponse.json({ error: 'Only the campaign creator can update it' }, { status: 403 });
      }

      const title = body.title ? toString(body.title) : undefined;
      const description = body.description ? toString(body.description) : undefined;
      const category = body.category ? toString(body.category) : undefined;
      const status = body.status ? toString(body.status) : undefined;
      const budget = body.totalBudget !== undefined ? toNumber(body.totalBudget) : undefined;
      const budgetUsed = body.budgetUsed !== undefined ? toNumber(body.budgetUsed) : undefined;
      const viewsGenerated = body.viewsGenerated !== undefined ? toNumber(body.viewsGenerated) : undefined;
      const likesGenerated = body.likesGenerated !== undefined ? toNumber(body.likesGenerated) : undefined;
      const timeRemaining = body.timeRemainingDays !== undefined ? toNumber(body.timeRemainingDays) : undefined;

      const updates: string[] = [];
      const values: unknown[] = [];
      let paramIdx = 1;

      if (title !== undefined) {
        updates.push(`title = $${paramIdx++}`);
        values.push(title);
      }
      if (description !== undefined) {
        updates.push(`description = $${paramIdx++}`);
        values.push(description);
      }
      if (category !== undefined) {
        updates.push(`category = $${paramIdx++}`);
        values.push(category);
      }
      if (status !== undefined) {
        updates.push(`status = $${paramIdx++}`);
        values.push(status);
      }
      if (budget !== undefined) {
        updates.push(`total_budget = $${paramIdx++}`);
        values.push(budget);
      }
      if (budgetUsed !== undefined) {
        updates.push(`budget_used = $${paramIdx++}`);
        values.push(budgetUsed);
      }
      if (viewsGenerated !== undefined) {
        updates.push(`views_generated = $${paramIdx++}`);
        values.push(viewsGenerated);
      }
      if (likesGenerated !== undefined) {
        updates.push(`likes_generated = $${paramIdx++}`);
        values.push(likesGenerated);
      }
      if (timeRemaining !== undefined) {
        updates.push(`time_remaining_days = $${paramIdx++}`);
        values.push(timeRemaining);
      }

      if (updates.length === 0) {
        return NextResponse.json({ ok: true, message: 'No updates provided' });
      }

      updates.push(`updated_at = NOW()`);
      values.push(campaignId);

      await query(
        `UPDATE campaigns SET ${updates.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
        values
      );

      return NextResponse.json({ ok: true, message: 'Campaign updated successfully' });
    }

    // PAUSE action (creator only)
    if (action === 'pause') {
      const campaign = await query<Record<string, unknown>>(
        'SELECT created_by FROM campaigns WHERE id = $1',
        [campaignId]
      );

      if (!campaign.length) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }

      if (campaign[0].created_by !== userId) {
        return NextResponse.json({ error: 'Only the campaign creator can pause it' }, { status: 403 });
      }

      await query(
        'UPDATE campaigns SET status = $1, updated_at = NOW() WHERE id = $2',
        ['paused', campaignId]
      );

      return NextResponse.json({ ok: true, message: 'Campaign paused' });
    }

    // RESUME action (creator only)
    if (action === 'resume') {
      const campaign = await query<Record<string, unknown>>(
        'SELECT created_by FROM campaigns WHERE id = $1',
        [campaignId]
      );

      if (!campaign.length) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }

      if (campaign[0].created_by !== userId) {
        return NextResponse.json({ error: 'Only the campaign creator can resume it' }, { status: 403 });
      }

      await query(
        'UPDATE campaigns SET status = $1, updated_at = NOW() WHERE id = $2',
        ['active', campaignId]
      );

      return NextResponse.json({ ok: true, message: 'Campaign resumed' });
    }

    // DELETE action (creator only)
    if (action === 'delete') {
      const campaign = await query<Record<string, unknown>>(
        'SELECT created_by FROM campaigns WHERE id = $1',
        [campaignId]
      );

      if (!campaign.length) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }

      if (campaign[0].created_by !== userId) {
        return NextResponse.json({ error: 'Only the campaign creator can delete it' }, { status: 403 });
      }

      await query('DELETE FROM campaign_members WHERE campaign_id = $1', [campaignId]);
      await query('DELETE FROM campaigns WHERE id = $1', [campaignId]);

      return NextResponse.json({ ok: true, message: 'Campaign deleted' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Campaign management failed', error);
    return NextResponse.json({ error: 'Unable to process request' }, { status: 500 });
  }
}
