---
kind: build_system
name: Next.js + Drizzle Build & Deployment Pipeline
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - next.config.ts
    - .nixpacks.toml
    - drizzle.config.ts
    - scripts/run-migrations.mjs
    - eslint.config.mjs
    - postcss.config.mjs
    - tsconfig.json
    - local.env
---

## Build System Overview

This repository is a Next.js 16 (App Router) application built with TypeScript, Tailwind CSS v4, and Drizzle ORM for PostgreSQL. The build pipeline is minimal and centered around npm scripts in `package.json`, with database migrations executed as part of every lifecycle step.

## Toolchain & Versions

- **Runtime**: Node.js >=20.19.0, npm >=10.0.0 (enforced via `engines` in `package.json`).
- **Framework**: Next.js 16.2.x with React 19.2.4.
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss` (`postcss.config.mjs`) and `tailwind-merge`.
- **Linting**: ESLint 9 with `eslint-config-next` (`eslint.config.mjs`).
- **Database**: Drizzle ORM (`drizzle-orm` ^0.45.2) with PostgreSQL driver (`pg` ^8.22.0); schema migrations live under `drizzle/`.
- **Containerization**: Nixpacks-based deployment configured via `.nixpacks.toml`, which installs `nodejs_20` and `npm-9_x` during setup.

## Scripts & Lifecycle

All three primary lifecycle commands — `dev`, `build`, `start` — prepend execution of `scripts/run-migrations.mjs` before invoking the corresponding Next.js command:

| Script | Command | Behavior |
|---|---|---|
| `npm run dev` | `node scripts/run-migrations.mjs && next dev -H 0.0.0.0` | Runs migrations then starts the dev server bound to all interfaces. |
| `npm run build` | `node scripts/run-migrations.mjs && next build` | Runs migrations then produces the Next.js production bundle. |
| `npm run start` | `node scripts/run-migrations.mjs && next start` | Runs migrations then serves the production build. |
| `npm run lint` | `eslint` | Lints the project using ESLint 9 configuration. |

There are no separate test scripts; no dedicated test runner is declared.

## Migration Strategy

Migrations are managed by Drizzle Kit and applied at process startup via `scripts/run-migrations.mjs`. Key behaviors:

- Loads environment variables from `local.env` if present and `DATABASE_URL` is not already set (parses `KEY=VALUE` lines, ignoring comments and blank lines).
- In development (`NODE_ENV=development`), missing `DATABASE_URL` or unreachable database causes a warning and graceful exit(0) so the dev workflow can continue without a DB.
- In non-development environments, missing `DATABASE_URL` exits with code 1.
- Network errors (`ENETUNREACH`, `ECONNREFUSED`) are caught; in development mode they are treated as warnings and skipped.
- Migrations are read from the `drizzle/` directory (the output of `drizzle-kit generate`).

The Drizzle config (`drizzle.config.ts`) points to `./src/db/schema.ts` as the source of truth, outputs SQL snapshots into `./drizzle`, uses the `postgresql` dialect, and enforces strict mode.

## Configuration Files

- `next.config.ts`: Minimal configuration setting `allowedDevOrigins: ['localhost']`.
- `tsconfig.json`: TypeScript compilation settings (standard Next.js defaults).
- `postcss.config.mjs`: PostCSS pipeline for Tailwind CSS v4.
- `eslint.config.mjs`: ESLint 9 flat config.
- `.nixpacks.toml`: Declares Nixpacks build phases, installing Node.js 20 and npm 9.x.
- `local.env`: Local-only environment file loaded by the migration script.

## Deployment Target

The presence of `.nixpacks.toml` indicates the app is intended to be deployed on platforms that support Nixpacks (e.g., Railway, Render). There is no Dockerfile; containerization is handled declaratively by Nixpacks based on the detected Node.js project.

## Conventions Observed

- Database migrations are always applied before any Next.js process starts — this is enforced by prepending the migration script in every lifecycle npm script.
- Environment variable loading is centralized in `scripts/run-migrations.mjs`; it auto-loads `local.env` only when `DATABASE_URL` is absent, preventing accidental overrides of explicit env vars.
- Development workflows tolerate a missing or unreachable database; production workflows fail fast.
- No CI/CD pipeline files (e.g., GitHub Actions, GitLab CI) were found in the repository; build and deploy steps appear to rely on platform-native Nixpacks detection.
- Versioning is conventional semver via `package.json` (`"version": "0.1.0"`); no automated release scripts were found.