# Getting Started

<cite>
**Referenced Files in This Document**
- [package.json](file://package.json)
- [local.env](file://local.env)
- [drizzle.config.ts](file://drizzle.config.ts)
- [next.config.ts](file://next.config.ts)
- [README.md](file://README.md)
- [scripts/run-migrations.mjs](file://scripts/run-migrations.mjs)
- [src/db/client.ts](file://src/db/client.ts)
- [src/db/schema.ts](file://src/db/schema.ts)
- [drizzle/0000_init.sql](file://drizzle/0000_init.sql)
- [tsconfig.json](file://tsconfig.json)
</cite>

## Table of Contents
1. Introduction
2. Project Structure
3. Core Components
4. Architecture Overview
5. Detailed Component Analysis
6. Dependency Analysis
7. Performance Considerations
8. Troubleshooting Guide
9. Conclusion
10. Appendices

## Introduction
This guide helps you set up and run PortVille Market locally. You will install Node.js, install dependencies, configure environment variables, set up PostgreSQL, run Drizzle migrations, start the development server with hot reloading, and verify that everything works. The instructions are beginner-friendly and include expected outputs where applicable.

## Project Structure
PortVille Market is a Next.js application using TypeScript, Tailwind CSS, and Drizzle ORM for database access with PostgreSQL. Key directories:
- src/app: Next.js App Router pages and API routes
- src/components: Reusable UI components
- src/db: Database client and schema definitions
- drizzle: SQL migration files and metadata
- scripts: Utility scripts (e.g., running migrations)
- public: Static assets
- Configuration files at the root (package.json, next.config.ts, drizzle.config.ts, tsconfig.json)

```mermaid
graph TB
A["Next.js App<br/>src/app"] --> B["Components<br/>src/components"]
A --> C["API Routes<br/>src/app/api/*"]
C --> D["Database Client<br/>src/db/client.ts"]
D --> E["Schema<br/>src/db/schema.ts"]
D --> F["PostgreSQL"]
G["Migrations<br/>drizzle/*.sql"] --> F
H["Drizzle Config<br/>drizzle.config.ts"] --> G
I["Run Migrations Script<br/>scripts/run-migrations.mjs"] --> G
J["Environment<br/>local.env"] --> D
J --> I
```

**Diagram sources**
- [src/app/layout.tsx:1-43](file://src/app/layout.tsx#L1-L43)
- [src/db/client.ts:1-152](file://src/db/client.ts#L1-L152)
- [src/db/schema.ts:1-84](file://src/db/schema.ts#L1-L84)
- [drizzle/0000_init.sql:1-82](file://drizzle/0000_init.sql#L1-L82)
- [drizzle.config.ts:1-13](file://drizzle.config.ts#L1-L13)
- [scripts/run-migrations.mjs:1-67](file://scripts/run-migrations.mjs#L1-L67)
- [local.env:1-2](file://local.env#L1-L2)

**Section sources**
- [package.json:1-45](file://package.json#L1-L45)
- [next.config.ts:1-7](file://next.config.ts#L1-L7)
- [tsconfig.json:1-35](file://tsconfig.json#L1-L35)

## Core Components
- Next.js App Router: Pages and API routes under src/app
- Database layer: Drizzle ORM client and schema definitions in src/db
- Migrations: SQL files under drizzle managed by Drizzle
- Environment configuration: DATABASE_URL loaded from local.env or process environment
- Dev tooling: Scripts to run migrations before dev/build/start

Key behaviors:
- The app automatically loads environment variables from local.env if DATABASE_URL is not already set in the process environment.
- On startup, the database client ensures required tables exist; migrations can be run explicitly via the provided script.
- Development server starts on all interfaces and listens on port 3000 by default.

**Section sources**
- [src/db/client.ts:10-38](file://src/db/client.ts#L10-L38)
- [src/db/client.ts:61-149](file://src/db/client.ts#L61-L149)
- [scripts/run-migrations.mjs:8-38](file://scripts/run-migrations.mjs#L8-L38)
- [scripts/run-migrations.mjs:40-66](file://scripts/run-migrations.mjs#L40-L66)
- [package.json:9-13](file://package.json#L9-L13)

## Architecture Overview
The runtime flow during development:
- npm scripts execute the migration runner first, then start Next.js
- The migration script reads DATABASE_URL from environment/local.env and applies pending migrations
- The Next.js dev server starts with hot reloading enabled
- At runtime, the database client initializes a connection pool and ensures schema exists

```mermaid
sequenceDiagram
participant Dev as "Developer"
participant NPM as "npm scripts"
participant MIG as "run-migrations.mjs"
participant DB as "PostgreSQL"
participant NEXT as "Next.js Dev Server"
Dev->>NPM : npm run dev
NPM->>MIG : Execute migration script
MIG->>DB : Connect using DATABASE_URL
MIG-->>MIG : Apply pending migrations
MIG-->>NPM : Exit (success or skip in dev)
NPM->>NEXT : Start Next.js dev server
NEXT-->>Dev : App available at http : //localhost : 3000
```

**Diagram sources**
- [package.json:9-13](file://package.json#L9-L13)
- [scripts/run-migrations.mjs:28-49](file://scripts/run-migrations.mjs#L28-L49)
- [src/db/client.ts:45-59](file://src/db/client.ts#L45-L59)

## Detailed Component Analysis

### Installation and Setup
Follow these steps to get the project running locally.

1. Install Node.js
   - Required versions are enforced by the project. Use Node.js >= 20.19.0 and npm >= 10.0.0.
   - Verify your installation:
     - node --version
     - npm --version

2. Install dependencies
   - Run:
     - npm install
   - Expected output:
     - A list of packages being installed followed by a completion message.

3. Configure environment variables
   - The app uses DATABASE_URL to connect to PostgreSQL.
   - If DATABASE_URL is not set in your shell environment, the app will read it from local.env at runtime.
   - Ensure local.env contains a valid DATABASE_URL pointing to your PostgreSQL instance.
   - Example format:
     - DATABASE_URL=postgres://user:password@host:port/database

4. Set up PostgreSQL
   - Create a database user and database if needed.
   - Ensure the host, port, credentials, and database name in DATABASE_URL are correct.
   - Confirm network access (firewall/security groups) allows connections from your machine.

5. Run Drizzle migrations
   - Option A: Automatic (recommended)
     - The dev/build/start scripts run migrations automatically before starting the server.
   - Option B: Manual
     - Run:
       - node scripts/run-migrations.mjs
     - Expected output when successful:
       - Migrations complete
     - In development mode without a database, the script will warn and exit successfully so you can still develop.

6. Start the development server
   - Run:
     - npm run dev
   - Expected behavior:
     - Migrations run (if configured)
     - Next.js dev server starts
     - Open http://localhost:3000 in your browser

7. Verify installation
   - Visit http://localhost:3000 to confirm the app loads.
   - If you see errors about missing DATABASE_URL, ensure local.env is present and correctly formatted.
   - If you see database connection errors, verify your PostgreSQL credentials and network access.

**Section sources**
- [package.json:5-13](file://package.json#L5-L13)
- [local.env:1-2](file://local.env#L1-L2)
- [scripts/run-migrations.mjs:28-49](file://scripts/run-migrations.mjs#L28-L49)
- [src/db/client.ts:10-38](file://src/db/client.ts#L10-L38)
- [README.md:3-17](file://README.md#L3-L17)

### Hot Reloading and Development Workflow
- Hot reloading is enabled by default in Next.js development mode.
- Changes to pages, components, and styles are reflected instantly in the browser.
- The dev server binds to all interfaces by default in this project’s scripts, making it accessible on your local network if needed.

**Section sources**
- [package.json:9-13](file://package.json#L9-L13)
- [README.md:3-17](file://README.md#L3-L17)

### Initial Project Structure Navigation
- Frontend pages and layouts live under src/app.
- Shared UI components are in src/components.
- API endpoints are defined under src/app/api.
- Database client and schema are in src/db.
- Migrations are stored in drizzle.

Useful entry points:
- Root layout and providers: src/app/layout.tsx
- Database client initialization: src/db/client.ts
- Schema definitions: src/db/schema.ts

**Section sources**
- [src/app/layout.tsx:1-43](file://src/app/layout.tsx#L1-L43)
- [src/db/client.ts:1-152](file://src/db/client.ts#L1-L152)
- [src/db/schema.ts:1-84](file://src/db/schema.ts#L1-L84)

### Database Setup and Migrations
- The project uses Drizzle ORM with PostgreSQL.
- Migration files are located in drizzle.
- The migration script connects using DATABASE_URL and applies pending migrations.
- The database client also ensures core tables exist at runtime for convenience.

```mermaid
flowchart TD
Start(["Start"]) --> CheckEnv["Check DATABASE_URL"]
CheckEnv --> |Present| Connect["Connect to PostgreSQL"]
CheckEnv --> |Missing| LocalEnv["Read local.env"]
LocalEnv --> Connect
Connect --> Migrate{"Migrations applied?"}
Migrate --> |Yes| Ready["App ready"]
Migrate --> |No| Apply["Apply pending migrations"]
Apply --> Ready
```

**Diagram sources**
- [scripts/run-migrations.mjs:8-49](file://scripts/run-migrations.mjs#L8-L49)
- [src/db/client.ts:10-38](file://src/db/client.ts#L10-L38)
- [drizzle/0000_init.sql:1-82](file://drizzle/0000_init.sql#L1-L82)

**Section sources**
- [drizzle.config.ts:1-13](file://drizzle.config.ts#L1-L13)
- [scripts/run-migrations.mjs:28-66](file://scripts/run-migrations.mjs#L28-L66)
- [src/db/client.ts:61-149](file://src/db/client.ts#L61-L149)
- [drizzle/0000_init.sql:1-82](file://drizzle/0000_init.sql#L1-L82)

## Dependency Analysis
- Runtime dependencies include Next.js, React, Drizzle ORM, and PostgreSQL driver.
- Development dependencies include TypeScript, ESLint, and Tailwind tooling.
- Scripts orchestrate migration execution before dev/build/start.

```mermaid
graph LR
Pkg["package.json"] --> Next["Next.js"]
Pkg --> Drizzle["Drizzle ORM"]
Pkg --> Pg["pg driver"]
Pkg --> React["React"]
Pkg --> TS["TypeScript"]
Pkg --> Tailwind["Tailwind"]
```

**Diagram sources**
- [package.json:15-43](file://package.json#L15-L43)

**Section sources**
- [package.json:1-45](file://package.json#L1-L45)

## Performance Considerations
- Connection pooling: The database client configures a connection pool with a maximum size and idle timeout to manage resources efficiently.
- Migrations: Running migrations once per deployment or development session avoids repeated overhead.
- Hot reloading: Keep components modular to minimize rebuild times.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:

- Missing DATABASE_URL
  - Symptom: Error indicating DATABASE_URL is not configured.
  - Resolution: Add DATABASE_URL to your environment or create local.env with the correct value.
  - Note: The app reads local.env automatically if DATABASE_URL is not set in the process environment.

- Database unreachable or connection refused
  - Symptom: Network errors such as ENETUNREACH or ECONNREFUSED during migrations.
  - Resolution: Verify PostgreSQL is running, reachable, and credentials are correct. Check firewall rules and security groups.
  - Behavior: In development mode, the migration script will warn and continue so you can still run the app without a database.

- Port conflicts
  - Symptom: Unable to start the dev server due to port 3000 being in use.
  - Resolution: Stop the conflicting process or change the port in your environment or Next.js configuration.

- Incorrect Node.js version
  - Symptom: Errors related to unsupported Node.js features or engine checks.
  - Resolution: Upgrade to Node.js >= 20.19.0 and npm >= 10.0.0.

- TypeScript path aliases not resolving
  - Symptom: Import paths like @/... fail to resolve.
  - Resolution: Ensure tsconfig.json includes the path mapping and that your editor supports Next.js TypeScript settings.

Verification checklist:
- node --version and npm --version meet requirements
- npm install completes successfully
- local.env contains a valid DATABASE_URL
- node scripts/run-migrations.mjs prints “Migrations complete” (or skips gracefully in dev)
- npm run dev starts and serves http://localhost:3000

**Section sources**
- [src/db/client.ts:10-38](file://src/db/client.ts#L10-L38)
- [scripts/run-migrations.mjs:28-66](file://scripts/run-migrations.mjs#L28-L66)
- [package.json:5-13](file://package.json#L5-L13)
- [tsconfig.json:21-23](file://tsconfig.json#L21-L23)

## Conclusion
You now have a working local setup for PortVille Market. Use the development server for rapid iteration, rely on automatic migrations in scripts, and keep your DATABASE_URL secure and accurate. Refer to the troubleshooting section if you encounter common setup issues.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### Quick Commands Reference
- Install dependencies:
  - npm install
- Run migrations manually:
  - node scripts/run-migrations.mjs
- Start development server:
  - npm run dev
- Build for production:
  - npm run build
- Start production server:
  - npm start

**Section sources**
- [package.json:9-13](file://package.json#L9-L13)