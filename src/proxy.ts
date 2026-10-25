import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';

import authConfig from '@/auth.config';

const { auth } = NextAuth(authConfig);

export default auth(() => NextResponse.next());

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};