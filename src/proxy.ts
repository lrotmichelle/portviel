import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';

import authConfig from '@/auth.config';

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { pathname } = request.nextUrl;

  if (pathname === '/api/auth' || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    if (!request.auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  const isPublicPath =
    pathname === '/' ||
    pathname === '/auth/login' ||
    pathname.startsWith('/auth/login/') ||
    pathname === '/auth/signup' ||
    pathname.startsWith('/auth/signup/') ||
    pathname === '/api/auth' ||
    pathname.startsWith('/api/auth/');

  if (!isPublicPath && !request.auth) {
    const welcomeUrl = request.nextUrl.clone();
    welcomeUrl.pathname = '/';
    welcomeUrl.search = '';
    return NextResponse.redirect(welcomeUrl);
  }

  if (request.auth && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    const discoverUrl = request.nextUrl.clone();
    discoverUrl.pathname = '/discover';
    discoverUrl.search = '';
    return NextResponse.redirect(discoverUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};