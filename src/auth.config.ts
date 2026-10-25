import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';

const publicPaths = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/api/auth',
  '/privacy',
  '/terms',
];

const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (publicPaths.some((path) => pathname.startsWith(path))) return true;
      return Boolean(auth);
    },
    jwt({ token, user, account }) {
      if (user) token.role = user.role;
      if (account) token.provider = account.provider;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
        session.user.role = token.role as string | undefined;
        session.user.provider = token.provider as string | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;