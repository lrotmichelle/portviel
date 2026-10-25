import { NextRequest, NextResponse } from 'next/server';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/db/client';
import { authUsers, authOtpCodes, authDeviceVerifications } from '@/db/schema/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return await db.transaction(async (tx) => {
    try {
      const { email, code, type } = await request.json();

      if (!email || !code || !type) {
        return NextResponse.json({ error: 'Email, code, and type are required' }, { status: 400 });
      }

      // Find the most recent unused OTP code for this email and type
      const [otp] = await tx
        .select()
        .from(authOtpCodes)
        .where(
          and(
            eq(authOtpCodes.email, email),
            eq(authOtpCodes.code, code),
            eq(authOtpCodes.type, type),
            eq(authOtpCodes.isUsed, false)
          )
        )
        .orderBy(desc(authOtpCodes.id))
        .limit(1);

      if (!otp) {
        return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
      }

      if (new Date(otp.expiresAt) < new Date()) {
        return NextResponse.json({ error: 'Verification code has expired' }, { status: 400 });
      }

      // Mark OTP as used
      await tx
        .update(authOtpCodes)
        .set({ isUsed: true })
        .where(eq(authOtpCodes.id, otp.id));

      const [user] = await tx.select().from(authUsers).where(eq(authUsers.email, email)).limit(1);

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (type === 'signup') {
        await tx
          .update(authUsers)
          .set({ isVerified: true })
          .where(eq(authUsers.id, user.id));

        return NextResponse.json({
          success: true,
          message: 'Account verified successfully!',
          user: { id: user.id, name: user.name, email: user.email, isVerified: true },
        });
      }

      if (type === 'device-verification') {
        const deviceId = request.headers.get('x-device-id') || 'unknown';
        await tx
          .update(authDeviceVerifications)
          .set({ isTrusted: true, lastVerifiedAt: new Date() })
          .where(
            and(
              eq(authDeviceVerifications.userId, user.id),
              eq(authDeviceVerifications.deviceId, deviceId)
            )
          );

        return NextResponse.json({
          success: true,
          message: 'Device verified successfully!',
          user: { id: user.id, name: user.name, email: user.email },
        });
      }

      if (type === 'forgot-password') {
        return NextResponse.json({
          success: true,
          message: 'Verification code validated. You can now reset your password.',
          email,
        });
      }

      return NextResponse.json({ error: 'Invalid OTP type' }, { status: 400 });
    } catch (error) {
      console.error('[VERIFY_OTP] Transaction failed:', error);
      return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
    }
  });
}
