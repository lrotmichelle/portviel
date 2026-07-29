import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = toString(request.headers.get('x-user-id') ?? body.userId, 'demo-user');
    const action = toString(body.action ?? body.mode, '').toLowerCase();
    const campaignId = toNumber(body.campaignId ?? body.id);

    if (!action || !campaignId) {
      return NextResponse.json({ error: 'Action and campaignId are required' }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, createdBy: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (action === 'join') {
      await prisma.campaignMember.upsert({
        where: { campaignId_userId: { campaignId, userId } },
        create: { campaignId, userId, status: 'active' },
        update: { status: 'active' },
      });

      return NextResponse.json({ ok: true, message: 'Joined campaign successfully' });
    }

    if (action === 'leave') {
      await prisma.campaignMember.updateMany({
        where: { campaignId, userId },
        data: { status: 'inactive' },
      });

      return NextResponse.json({ ok: true, message: 'Left campaign successfully' });
    }

    if (action === 'update') {
      if (campaign.createdBy !== userId) {
        return NextResponse.json({ error: 'Only the campaign creator can update it' }, { status: 403 });
      }

      const updateData: Record<string, unknown> = {};
      if (body.title) updateData.title = toString(body.title);
      if (body.description) updateData.description = toString(body.description);
      if (body.category) updateData.category = toString(body.category);
      if (body.status) updateData.status = toString(body.status);
      if (body.totalBudget !== undefined) updateData.totalBudget = toNumber(body.totalBudget);
      if (body.budgetUsed !== undefined) updateData.budgetUsed = toNumber(body.budgetUsed);
      if (body.viewsGenerated !== undefined) updateData.viewsGenerated = toNumber(body.viewsGenerated);
      if (body.likesGenerated !== undefined) updateData.likesGenerated = toNumber(body.likesGenerated);
      if (body.timeRemainingDays !== undefined) updateData.timeRemainingDays = toNumber(body.timeRemainingDays);

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ ok: true, message: 'No updates provided' });
      }

      await prisma.campaign.update({
        where: { id: campaignId },
        data: { ...updateData, updatedAt: new Date() },
      });

      return NextResponse.json({ ok: true, message: 'Campaign updated successfully' });
    }

    if (action === 'pause' || action === 'resume') {
      if (campaign.createdBy !== userId) {
        return NextResponse.json({ error: `Only the campaign creator can ${action} it` }, { status: 403 });
      }

      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: action === 'pause' ? 'paused' : 'active',
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({ ok: true, message: `Campaign ${action}d` });
    }

    if (action === 'delete') {
      if (campaign.createdBy !== userId) {
        return NextResponse.json({ error: 'Only the campaign creator can delete it' }, { status: 403 });
      }

      await prisma.campaign.delete({ where: { id: campaignId } });
      return NextResponse.json({ ok: true, message: 'Campaign deleted' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Campaign management failed', error);
    return NextResponse.json({ error: 'Unable to process request' }, { status: 500 });
  }
}
