import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';

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
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  callbacks: {
    // The Next.js proxy applies the site's public-route allowlist itself and
    // redirects to a URL based on the current request, not a stale AUTH_URL.
    authorized: () => true,
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