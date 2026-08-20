---
kind: error_handling
name: Next.js API Route Error Handling with Localized try/catch and JSON Error Responses
category: error_handling
scope:
    - '**'
source_files:
    - src/app/api/campaigns/route.ts
    - src/app/api/campaigns/manage/route.ts
    - src/app/api/secure/route.ts
    - src/app/api/discover/route.ts
    - src/lib/db.ts
    - src/db/client.ts
---

## Overview

This Next.js App Router application handles errors exclusively at the API route layer using per-handler `try`/`catch` blocks that log via `console.error` and return structured JSON error responses through `NextResponse.json`. There is no centralized error middleware, no custom error class hierarchy, no global `unhandledrejection` handler, and no use of `throw new Error` for control flow. Errors are treated as local exceptions within each route function.

## Approach

- **Per-route try/catch**: Every exported `GET`, `POST`, or other handler wraps its body in a `try`/`catch` block. On exception, the handler logs the error object to `console.error` with a short contextual message (e.g. `'Failed to load campaigns'`, `'Campaign management failed'`, `'Secure API failed'`, `'Unable to create campaign'`) and returns a generic `{ error: '...' }` JSON body with HTTP status `500`.
- **Input validation returns 4xx directly**: Invalid or missing input is not thrown; handlers return early with `NextResponse.json({ error: '<message>' }, { status: 400 })` (or `401`, `403`, `404` where applicable). Examples include missing `action`, missing `campaignId`, missing `userId`, empty title/description, invalid price, unknown action, unsupported mode, and authorization failures like `'Only the campaign creator can update it'`.
- **No domain-level error types**: The `src/lib/` directory contains data-fetching helpers (`db.ts`, `discover.ts`, `market.ts`, `negotiations.ts`, etc.) but none define custom error classes or sentinel values. Database access goes through Drizzle ORM calls inside routes; any ORM or connection failure bubbles up into the enclosing `try`/`catch`.
- **No server-side middleware**: There is no `middleware.ts` file and no `next.config.ts` error hooks configured. Error handling lives entirely inside individual route files under `src/app/api/`.
- **Client-side state uses notifications, not errors**: Frontend state in `src/context/NegotiationContext.tsx`, `src/context/NotificationContext.tsx`, and `src/hooks/useNegotiationManager.ts` / `useNotification.ts` manages UI notifications and negotiation sessions; they do not define or propagate typed errors back to routes.

## Key Files

- `src/app/api/campaigns/route.ts` — GET lists campaigns, POST creates one; catches DB errors and returns `[]` on failure, `500` on creation failure.
- `src/app/api/campaigns/manage/route.ts` — Single POST endpoint dispatching `create`/`update`/`pause`/`resume`/`delete`; validates ownership (`createdBy === userId`) returning `403`; catches all exceptions and returns `500`.
- `src/app/api/secure/route.ts` — Centralized multi-action POST (`create_discover`, `create_campaign`, `create_market`, `pause_vacancy`, `delete_vacancy`, `pause_campaign`, `delete_campaign`, `pause_listing`, `update_listing`, `delete_listing`, `interact`, `update_campaign`, `update_campaign_status`, `approve_campaign_submission`); validates `userId` (`401`), entity existence (`404`), input fields (`400`), and falls through to `{ error: 'Unsupported action' }` (`400`) when `mode` is unrecognized.
- `src/app/api/discover/route.ts` — GET delegates to `getDiscoverJobs()` from `@/lib/discover`; POST creates vacancies; both wrapped in try/catch returning `500`.
- `src/app/api/market/route.ts`, `src/app/api/negotiations/route.ts`, `src/app/api/profile/route.ts` — Follow the same pattern (checked via grep).
- `src/lib/db.ts` — Thin re-export of `db`, `pool`, and `ensureDatabaseSchema` from `@/db/client`; no error wrapping.
- `src/db/client.ts` — Drizzle client initialization; database schema bootstrapping is invoked via `ensureDatabaseSchema()` before writes.

## Architecture & Conventions Observed

1. **HTTP status mapping**:
   - `400` — malformed/missing input, unknown action, unsupported mode, invalid numeric field.
   - `401` — missing user identity (`!userId`).
   - `403` — authorization failure (e.g. non-creator attempting update/pause/delete).
   - `404` — entity not found after lookup.
   - `500` — any unexpected exception caught by the outer `try`/`catch`.

2. **Error response shape**: All error responses use `{ error: '<human-readable string>' }`. Success responses use `{ ok: true, ... }` plus an `item` or `message` field. This uniform shape lets callers distinguish success vs. failure without inspecting the status code alone.

3. **Input coercion helpers**: Each route defines small local helpers (`toString`, `toNumber`, `parseArray`) that coerce incoming `unknown` request fields to safe defaults instead of throwing, so most malformed payloads are normalized rather than rejected.

4. **Ownership checks precede mutations**: Before mutating a campaign, vacancy, or listing, handlers fetch the entity and compare `createdBy` against the supplied `userId`, returning `403` if unauthorized.

5. **Engagement events as side-effect logging**: Mutations in `secure/route.ts` insert rows into `engagementEvents` to record actions (`create`, `join`, `participate`, `delete`, `update`, `status_update`, `approval`, `update_price`). These are not error-handling mechanisms but serve as an audit trail alongside the JSON error responses.

6. **No global error boundary**: There is no React error boundary, no `error.tsx` page, and no `instrumentation.ts` hook. Errors are only handled at the edge of each route function.

7. **No `throw` for control flow**: The codebase avoids `throw new Error(...)` for business logic; instead it returns early with `NextResponse.json(...)`. Exceptions are reserved for truly unexpected runtime failures (DB connection issues, parse errors) that bubble into the catch block.

## Constraints & Rules Enforced by Code

- Every route handler must be wrapped in `try`/`catch` that logs via `console.error` and returns a `500` JSON error — this is the consistent pattern across all examined routes.
- Input validation must return explicit `400` responses with an `error` message rather than throwing.
- Authorization checks must return `403` with a descriptive `error` message when the caller lacks permission.
- Missing entities must be detected via lookup and return `404` with `{ error: '... not found' }`.
- Unknown or unsupported `action`/`mode` values must fall through to a `400` response with `{ error: 'Unknown action' }` or `{ error: 'Unsupported action' }`.
- Database schema bootstrapping (`ensureDatabaseSchema()`) is called before write operations, ensuring schema readiness before mutation.