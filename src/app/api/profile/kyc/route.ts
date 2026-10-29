import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/db/client';
import { authUsers } from '@/db/schema/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = Number(session?.user?.id);
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();
    const legalName = body && typeof body === 'object' && 'legalName' in body
      ? (body as { legalName?: unknown }).legalName
      : undefined;

    if (typeof legalName !== 'string' || legalName.trim().length < 2 || legalName.trim().length > 255) {
      return NextResponse.json({ error: 'Enter the legal name exactly as it appears on your government ID.' }, { status: 400 });
    }

    const [user] = await db.select().from(authUsers).where(eq(authUsers.id, userId)).limit(1);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.isKycVerified || user.nameLocked) {
      return NextResponse.json({ error: 'Your verified name is locked. Contact support to request a legal name change.' }, { status: 409 });
    }
    if (user.kycStatus === 'pending') {
      return NextResponse.json({ error: 'Your identity review is already pending.' }, { status: 409 });
    }

    const [updated] = await db
      .update(authUsers)
      .set({ legalName: legalName.trim(), kycStatus: 'pending', kycRequestedAt: new Date(), updatedAt: new Date() })
      .where(eq(authUsers.id, userId))
      .returning();

    return NextResponse.json({ status: updated.kycStatus, message: 'Identity review requested. Your profile name will be locked only after a reviewer verifies your ID.' }, { status: 202 });
  } catch (error) {
    console.error('KYC request error:', error);
    return NextResponse.json({ error: 'Could not submit identity review.' }, { status: 500 });
  }
}
