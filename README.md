PortVille is a Next.js 16 application using PostgreSQL, Drizzle ORM, and Auth.js v5.

## Local development

Use Node.js 20.19+ and npm 10+. Create a local `local.env` file with your development `DATABASE_URL`, `NEXTAUTH_SECRET` (or `AUTH_SECRET`), and Google OAuth client credentials. Never commit this file. Then run:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

The development server may select another port if 3000 is occupied.

## Deployment

The repository includes a Nixpacks configuration for Node.js 20. Set these variables in your hosting provider’s environment:

- `DATABASE_URL` — PostgreSQL connection string.
- `AUTH_SECRET` — a unique, randomly generated secret (`NEXTAUTH_SECRET` is also supported for compatibility).
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` — Google OAuth credentials.
- `AUTH_TRUST_HOST=true` when the app is behind a reverse proxy and the host does not otherwise configure trusted hosts.

Use `npm run build` as the build command and `npm run start` as the start command. Run `npm run db:migrate` as a release/pre-deploy step when database migrations are pending. Set Google’s production redirect URI to `https://<your-domain>/api/auth/callback/google`.

Production secrets belong in the hosting provider, never in Git or `local.env`.
