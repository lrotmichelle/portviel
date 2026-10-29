import { avg, count, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/db/client';
import { authUserRatings, authUsers } from '@/db/schema/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: Promise<{ accountId: string }> }) {
  const session = await auth();
  const raterId = Number(session?.user?.id);
  if (!Number.isSafeInteger(raterId) || raterId <= 0) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { accountId } = await params;
  const targetId = Number(accountId.replace(/^acc-/, ''));
  if (!Number.isSafeInteger(targetId) || targetId <= 0) {
    return NextResponse.json({ error: 'Invalid profile' }, { status: 400 });
  }
  if (targetId === raterId) {
    return NextResponse.json({ error: 'You cannot rate your own profile.' }, { status: 400 });
  }

  try {
    const body: unknown = await request.json();
    const rating = body && typeof body === 'object' && 'rating' in body
      ? Number((body as { rating: unknown }).rating)
      : Number.NaN;
    if (!Number.isFinite(rating) || rating < 1 || rating > 5 || rating * 2 % 1 !== 0) {
      return NextResponse.json({ error: 'Choose a rating from 1 to 5 in half-star increments.' }, { status: 400 });
    }

    const [target] = await db.select().from(authUsers).where(eq(authUsers.id, targetId)).limit(1);
    if (!target) return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });

    await db.insert(authUserRatings).values({ targetUserId: targetId, raterUserId: raterId, rating })
      .onConflictDoUpdate({
        target: [authUserRatings.targetUserId, authUserRatings.raterUserId],
        set: { rating, updatedAt: new Date() },
      });

    const [summary] = await db.select({ rating: avg(authUserRatings.rating), total: count(authUserRatings.id) })
      .from(authUserRatings).where(eq(authUserRatings.targetUserId, targetId));
    const ratingCap = target.isKycVerified ? 4.8 : 3.5;

    return NextResponse.json({
      rating: Math.min(Number(summary?.rating ?? 0), ratingCap),
      totalRatings: Number(summary?.total ?? 0),
      ratingCap,
    });
  } catch (error) {
    console.error('Profile rating error:', error);
    return NextResponse.json({ error: 'Could not submit rating.' }, { status: 500 });
  }
}
