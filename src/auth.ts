import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';
import type { DefaultSession } from 'next-auth';

import authConfig from '@/auth.config';
import { db } from '@/db/client';
import { authUsers } from '@/db/schema/auth';

declare module 'next-auth' {
  interface User {
    role?: string;
  }

  interface Session {
    user: {
      id: string;
      role?: string;
      provider?: string;
    } & DefaultSession['user'];
  }
}

async function findOrCreateGoogleUser(profile: {
  id: string;
  email?: string | null;
  name?: string | null;
}) {
  const email = profile.email;
  if (!email) return null;

  let [user] = await db
    .select()
    .from(authUsers)
    .where(eq(authUsers.email, email))
    .limit(1);

  if (!user) {
    [user] = await db
      .insert(authUsers)
      .values({
        name: profile.name ?? email,
        email,
        password: '',
        role: 'user',
        isVerified: true,
      })
      .returning();
  }

  return user;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== 'string' || typeof password !== 'string') return null;

        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        const [user] = await db
          .select()
          .from(authUsers)
          .where(eq(authUsers.email, email))
          .limit(1);

        if (!user || user.password !== hashedPassword) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
    ...authConfig.providers,
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account, profile, user: authUser }) {
      if (account?.provider !== 'google') return true;
      if (!profile?.email) return false;

      const user = await findOrCreateGoogleUser({
        id: String(profile.sub ?? ''),
        email: profile.email,
        name: profile.name,
      });
      if (user) {
        // Use the PortVille user ID in the Auth.js token and downstream session.
        authUser.id = String(user.id);
        authUser.role = user.role;
      }
      return Boolean(user);
    },
    jwt({ token, user, account }) {
      const claims = token as typeof token & { role?: string; provider?: string };
      if (user) claims.role = user.role;
      if (account) claims.provider = account.provider;
      return claims;
    },
    session({ session, token }) {
      const claims = token as typeof token & { role?: string; provider?: string };
      if (session.user) {
        session.user.id = token.sub ?? '';
        session.user.role = claims.role;
        session.user.provider = claims.provider;
      }
      return session;
    },
  },
});