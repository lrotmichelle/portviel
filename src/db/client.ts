import 'server-only';

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from '@/db/schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured');
}

const globalForDb = globalThis as typeof globalThis & {
  __db?: ReturnType<typeof drizzle>;
  __pool?: Pool;
};

const pool = globalForDb.__pool ?? new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30_000,
});

if (!globalForDb.__pool) {
  globalForDb.__pool = pool;
}

const db = globalForDb.__db ?? drizzle(pool, { schema });

if (!globalForDb.__db) {
  globalForDb.__db = db;
}

export { db, pool };
