import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db/client';
import { authUsers, authSessions, authOtpCodes, authDeviceVerifications } from '@/db/schema/auth';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function getDeviceId(request: NextRequest): string {
  return request.headers.get('x-device-id') || request.headers.get('user-agent') || 'unknown-device';
}

function getDeviceName(request: NextRequest): string {
  return request.headers.get('x-device-name') || 'Unknown Device';
}

function getIpAddress(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') || '0.0.0.0';
}

const TRUST_THRESHOLD_DAYS = 7;

export async function POST(request: NextRequest) {
  return await db.transaction(async (tx) => {
    try {
      const { email, password } = await request.json();

      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }

      const deviceId = getDeviceId(request);
      const deviceName = getDeviceName(request);
      const ipAddress = getIpAddress(request);

      // Find user
      const [user] = await tx
        .select()
        .from(authUsers)
        .where(eq(authUsers.email, email))
        .limit(1);

      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      // Verify password
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      if (user.password !== hashedPassword) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      // Check device trust status
      const [deviceVerification] = await tx
        .select()
        .from(authDeviceVerifications)
        .where(
          and(
            eq(authDeviceVerifications.userId, user.id),
            eq(authDeviceVerifications.deviceId, deviceId)
          )
        )
        .limit(1);

      const needsDeviceVerification =
        !deviceVerification ||
        !deviceVerification.isTrusted ||
        (deviceVerification.lastVerifiedAt &&
          Date.now() - deviceVerification.lastVerifiedAt.getTime() > TRUST_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);

      // Check last login - if more than 7 days ago, require re-verification
      const needsReVerification =
        user.lastLoginAt &&
        Date.now() - user.lastLoginAt.getTime() > TRUST_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

      if (needsDeviceVerification || needsReVerification) {
        // Generate verification OTP
        const otpCode = generateOTP();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await tx.insert(authOtpCodes).values({
          email: user.email,
          code: otpCode,
          type: 'device-verification',
          channel: 'email',
          isUsed: false,
          expiresAt: otpExpires,
        });

        // Update last login attempt
        await tx
          .update(authUsers)
          .set({ lastLoginAt: new Date() })
          .where(eq(authUsers.id, user.id));

        console.log(`[LOGIN] Device verification OTP for ${email}: ${otpCode}`);

        return NextResponse.json({
          requiresVerification: true,
          message: 'Verification code sent to your email. Please enter it to complete login.',
          userId: user.id,
          email,
          deviceId,
          otp: otpCode, // Remove in production
        });
      }

      // Device is trusted - create session
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await tx.insert(authSessions).values({
        userId: user.id,
        token,
        deviceId,
        deviceName,
        ipAddress,
        userAgent: request.headers.get('user-agent') || '',
        expiresAt,
      });

      // Mark device as trusted
      if (deviceVerification) {
        await tx
          .update(authDeviceVerifications)
          .set({ isTrusted: true, lastVerifiedAt: new Date() })
          .where(eq(authDeviceVerifications.id, deviceVerification.id));
      } else {
        await tx.insert(authDeviceVerifications).values({
          userId: user.id,
          deviceId,
          deviceName,
          isTrusted: true,
          lastVerifiedAt: new Date(),
        });
      }

      // Update last login
      await tx
        .update(authUsers)
        .set({ lastLoginAt: new Date() })
        .where(eq(authUsers.id, user.id));

      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      });

      response.cookies.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      return response;
    } catch (error) {
      console.error('[LOGIN] Transaction failed:', error);
      return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
    }
  });
}
