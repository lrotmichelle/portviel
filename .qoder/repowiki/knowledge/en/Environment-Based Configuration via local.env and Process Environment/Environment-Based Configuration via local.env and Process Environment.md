---
kind: configuration_system
name: Environment-Based Configuration via local.env and Process Environment
category: configuration_system
scope:
    - '**'
source_files:
    - local.env
    - src/db/client.ts
    - scripts/run-migrations.mjs
    - drizzle.config.ts
    - next.config.ts
    - .nixpacks.toml
---

## What system/approach is used

The application uses a minimal, environment-variable-driven configuration approach centered on `process.env` with a custom fallback loader for the database connection string. There is no centralized config module, feature-flag system, or typed configuration schema. Configuration is consumed directly from Node.js process environment variables at runtime.

## Key files and packages

- `local.env` — repository-local file containing `DATABASE_URL`; ignored by version control (listed in `.gitignore`) and intended for developer-only use.
- `src/db/client.ts` — singleton Drizzle/PostgreSQL client that loads env vars, enforces presence of `DATABASE_URL`, and initializes the DB pool.
- `scripts/run-migrations.mjs` — standalone migration runner that also reads `DATABASE_URL` from the same source.
- `drizzle.config.ts` — Drizzle CLI configuration, loaded via `dotenv/config`, reading `DATABASE_URL` for schema introspection/migration generation.
- `next.config.ts` — Next.js runtime config; currently only sets `allowedDevOrigins: ['localhost']`. No `env` block or runtime config exposure to the browser.
- `.nixpacks.toml` — Nixpacks build-time configuration declaring Node.js 20 and npm 9 as required packages.

## Architecture and conventions

1. **Single source of truth for secrets**: The only secret in the repo is `DATABASE_URL` in `local.env`. It is never committed to version control.
2. **Custom `.env` loader**: Both `src/db/client.ts` and `scripts/run-migrations.mjs` implement an identical `loadEnvFromLocalFile()` helper that:
   - Reads `local.env` from `process.cwd()`.
   - Skips blank lines and comments (`#`).
   - Splits on the first `=` sign.
   - Strips surrounding quotes from values.
   - Only writes keys into `process.env` if they are not already set (so explicit env vars take precedence).
3. **Hard failure on missing DB URL**: `src/db/client.ts` throws `Error('DATABASE_URL is not configured')` if the variable is absent after loading `local.env`. The migration script exits with code 1 in non-development environments and warns + exits 0 in development when the database is unreachable.
4. **Singleton pattern for DB resources**: The DB pool and Drizzle instance are attached to `globalThis` under `__pool` and `__db` to prevent multiple connections across server-side module reloads.
5. **No runtime config exposure to the browser**: `next.config.ts` does not define a `publicRuntimeConfig` or `env` mapping, so environment variables are not baked into the client bundle.
6. **Schema bootstrapping**: In addition to Drizzle migrations, `src/db/client.ts` runs `CREATE TABLE IF NOT EXISTS` statements for `campaigns`, `campaign_members`, `vacancies`, `market_listings`, and `engagement_events` at startup, acting as a safety net for uninitialized databases.
7. **Drizzle CLI integration**: `drizzle.config.ts` imports `dotenv/config` so `npx drizzle-kit` can read `DATABASE_URL` from `local.env` without extra flags.

## Conventions and constraints

- **Environment variables are the only configuration mechanism.** All externalized settings are read from `process.env` at import time; there is no config object, validation layer, or default-value registry beyond the inline defaults in the `CREATE TABLE` statements.
- **`local.env` is developer-only.** Its contents are parsed line-by-line with simple key=value semantics; it is not meant to be shared or deployed.
- **Explicit env vars override `local.env`.** The loader checks `if (!process.env[key])` before writing, so any externally provided value (e.g., from a hosting platform) takes precedence.
- **Missing `DATABASE_URL` is fatal at runtime.** The DB client throws immediately; the migration script treats it as fatal outside development mode.
- **No feature flags, toggles, or per-environment configs.** The only branching based on environment is `process.env.NODE_ENV === 'development'` in the migration script to tolerate network errors gracefully during dev.
- **Build-time vs runtime separation:** `.nixpacks.toml` pins build-time tooling versions; `next.config.ts` holds Next.js-specific runtime options; `local.env` holds runtime secrets. There is no unified config schema tying these together.