import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

  const isSecure = process.env.NODE_ENV === 'production';

  // Clear Auth.js v5 and v4 session cookies during the migration.
  for (const name of [
    'authjs.session-token',
    '__Secure-authjs.session-token',
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
  ]) {
    response.cookies.set(name, '', {
      httpOnly: true,
      secure: isSecure || name.startsWith('__Secure-'),
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
  }

  // Clear legacy custom session cookie (backward compatibility)
  response.cookies.set('session', '', {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
