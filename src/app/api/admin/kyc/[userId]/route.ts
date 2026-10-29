import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/db/client';
import { authUsers } from '@/db/schema/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { userId: rawUserId } = await params;
  const userId = Number(rawUserId);
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  try {
    const body: unknown = await request.json();
    const status = body && typeof body === 'object' && 'status' in body
      ? (body as { status?: unknown }).status
      : undefined;
    if (status !== 'verified' && status !== 'rejected') {
      return NextResponse.json({ error: 'Status must be verified or rejected' }, { status: 400 });
    }

    const [user] = await db.select().from(authUsers).where(eq(authUsers.id, userId)).limit(1);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.kycStatus !== 'pending' || !user.legalName) {
      return NextResponse.json({ error: 'There is no pending identity review for this user.' }, { status: 409 });
    }

    const [updated] = await db
      .update(authUsers)
      .set(status === 'verified'
        ? {
            name: user.legalName,
            nameLocked: true,
            isKycVerified: true,
            kycStatus: 'verified',
            kycVerifiedAt: new Date(),
            updatedAt: new Date(),
          }
        : {
            nameLocked: false,
            isKycVerified: false,
            kycStatus: 'rejected',
            updatedAt: new Date(),
          })
      .where(eq(authUsers.id, userId))
      .returning({ id: authUsers.id, name: authUsers.name, kycStatus: authUsers.kycStatus, nameLocked: authUsers.nameLocked });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('KYC review error:', error);
    return NextResponse.json({ error: 'Could not update identity review.' }, { status: 500 });
  }
}
