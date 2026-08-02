import 'server-only';

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from '@/db/schema';

function loadEnvFromLocalFile() {
  if (process.env.DATABASE_URL) return;

  const localEnvPath = path.resolve(process.cwd(), 'local.env');
  if (!existsSync(localEnvPath)) return;

  const content = readFileSync(localEnvPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFromLocalFile();

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

async function ensureDatabaseSchema() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS campaigns (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Technology',
      niche_hashtag TEXT NOT NULL DEFAULT 'growth',
      created_by TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      publisher_rating DOUBLE PRECISION NOT NULL DEFAULT 4.8,
      publisher_profile_icon TEXT NOT NULL DEFAULT '/images/publisher-placeholder.png',
      community_size INTEGER NOT NULL DEFAULT 12000,
      views_generated INTEGER NOT NULL DEFAULT 0,
      likes_generated INTEGER NOT NULL DEFAULT 0,
      total_budget INTEGER NOT NULL DEFAULT 1000,
      budget_used INTEGER NOT NULL DEFAULT 0,
      highest_mcp INTEGER NOT NULL DEFAULT 100,
      time_remaining_days INTEGER NOT NULL DEFAULT 14,
      required_platforms TEXT NOT NULL DEFAULT '',
      start_date TIMESTAMP,
      min_payout INTEGER NOT NULL DEFAULT 0,
      max_payout INTEGER NOT NULL DEFAULT 0,
      publish_fee INTEGER NOT NULL DEFAULT 1000,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS campaign_members (
      id SERIAL PRIMARY KEY,
      campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      joined_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS vacancies (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      created_by TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      employer_name TEXT NOT NULL DEFAULT 'Employer',
      handle TEXT NOT NULL DEFAULT 'employer',
      rating DOUBLE PRECISION NOT NULL DEFAULT 5.0,
      days_remaining INTEGER NOT NULL DEFAULT 14,
      required_people INTEGER NOT NULL DEFAULT 1,
      applicants INTEGER NOT NULL DEFAULT 0,
      accepted INTEGER NOT NULL DEFAULT 0,
      requirements TEXT NOT NULL DEFAULT '',
      min_salary INTEGER NOT NULL DEFAULT 0,
      max_salary INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'apply',
      status_updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS market_listings (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      price DOUBLE PRECISION NOT NULL DEFAULT 0,
      profile_url TEXT,
      platform TEXT,
      handle TEXT,
      followers INTEGER NOT NULL DEFAULT 0,
      likes INTEGER NOT NULL DEFAULT 0,
      engagement_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
      niche TEXT,
      created_by TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS engagement_events (
      id SERIAL PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      actor_id TEXT NOT NULL,
      action TEXT NOT NULL,
      message TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
  ];

  for (const statement of statements) {
    await pool.query(statement);
  }
}

void ensureDatabaseSchema().catch((error) => {
  console.error('Failed to initialize database schema', error);
});

export { db, pool, ensureDatabaseSchema };
