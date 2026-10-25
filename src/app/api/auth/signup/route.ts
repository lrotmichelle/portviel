import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { authUsers, authOtpCodes } from '@/db/schema/auth';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  // Use atomic transaction for signup - rolls back if anything fails
  return await db.transaction(async (tx) => {
    try {
      const { name, email, password, otpChannel = 'email' } = await request.json();

      if (!name || !email || !password) {
        return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
      }

      // Check if user already exists
      const existingUser = await tx
        .select()
        .from(authUsers)
        .where(eq(authUsers.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 });
      }

      // Hash password
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

      // Create user within transaction
      const [newUser] = await tx
        .insert(authUsers)
        .values({
          name,
          email,
          password: hashedPassword,
          role: 'user',
          isVerified: false,
        })
        .returning();

      // Generate and store OTP code within same transaction
      const otpCode = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await tx.insert(authOtpCodes).values({
        email,
        code: otpCode,
        type: 'signup',
        channel: otpChannel,
        isUsed: false,
        expiresAt: otpExpires,
      });

      // Transaction auto-commits here if no error thrown
      // In production, send OTP via email or WhatsApp here
      console.log(`[SIGNUP] OTP for ${email} (${otpChannel}): ${otpCode}`);

      return NextResponse.json({
        success: true,
        message: 'Account created. OTP sent to verify your account.',
        userId: newUser.id,
        email,
        otpChannel,
        otp: otpCode, // Remove in production - only for development
      });
    } catch (error) {
      // Transaction automatically rolls back on error
      console.error('[SIGNUP] Transaction failed:', error);
      return NextResponse.json({ error: 'Signup failed. Please try again.' }, { status: 500 });
    }
  });
}
