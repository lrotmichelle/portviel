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
    /* ========================================================================
       AUTH SCHEMA
       ======================================================================== */
    `CREATE TABLE IF NOT EXISTS auth_users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      is_verified BOOLEAN NOT NULL DEFAULT FALSE,
      last_login_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS auth_sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      token VARCHAR(512) NOT NULL UNIQUE,
      device_id VARCHAR(255),
      device_name VARCHAR(255),
      ip_address VARCHAR(100),
      user_agent TEXT,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS auth_otp_codes (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      code VARCHAR(10) NOT NULL,
      type VARCHAR(50) NOT NULL,
      channel VARCHAR(50) NOT NULL,
      is_used BOOLEAN NOT NULL DEFAULT FALSE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS auth_device_verifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      device_id VARCHAR(255) NOT NULL,
      device_name VARCHAR(255),
      is_trusted BOOLEAN NOT NULL DEFAULT FALSE,
      last_verified_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,

    /* ========================================================================
       CAMPAIGN SCHEMA
       ======================================================================== */
    `CREATE TABLE IF NOT EXISTS campaign_campaigns (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(100) NOT NULL DEFAULT 'Technology',
      niche_hashtag VARCHAR(100) NOT NULL DEFAULT 'growth',
      created_by INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      publisher_rating DOUBLE PRECISION NOT NULL DEFAULT 4.8,
      publisher_profile_icon VARCHAR(500) NOT NULL DEFAULT '/images/publisher-placeholder.png',
      community_size INTEGER NOT NULL DEFAULT 12000,
      views_generated INTEGER NOT NULL DEFAULT 0,
      likes_generated INTEGER NOT NULL DEFAULT 0,
      total_budget INTEGER NOT NULL DEFAULT 1000,
      budget_used INTEGER NOT NULL DEFAULT 0,
      debit INTEGER NOT NULL DEFAULT 0,
      paid INTEGER NOT NULL DEFAULT 0,
      owe INTEGER NOT NULL DEFAULT 0,
      highest_mcp INTEGER NOT NULL DEFAULT 100,
      time_remaining_days INTEGER NOT NULL DEFAULT 14,
      required_platforms VARCHAR(500) NOT NULL DEFAULT '',
      start_date TIMESTAMP,
      min_payout INTEGER NOT NULL DEFAULT 0,
      max_payout INTEGER NOT NULL DEFAULT 0,
      publish_fee INTEGER NOT NULL DEFAULT 1000,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS campaign_members (
      id SERIAL PRIMARY KEY,
      campaign_id INTEGER NOT NULL REFERENCES campaign_campaigns(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      joined_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,

    /* ========================================================================
       MARKET SCHEMA
       ======================================================================== */
    `CREATE TABLE IF NOT EXISTS market_listings (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      price DOUBLE PRECISION NOT NULL DEFAULT 0,
      profile_url VARCHAR(500),
      platform VARCHAR(100),
      handle VARCHAR(100),
      followers INTEGER NOT NULL DEFAULT 0,
      likes INTEGER NOT NULL DEFAULT 0,
      engagement_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
      niche VARCHAR(100),
      created_by INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      status VARCHAR(50) NOT NULL DEFAULT 'open',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS market_transactions (
      id SERIAL PRIMARY KEY,
      listing_id INTEGER NOT NULL REFERENCES market_listings(id) ON DELETE CASCADE,
      buyer_id INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      seller_id INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      amount DOUBLE PRECISION NOT NULL DEFAULT 0,
      type VARCHAR(50) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'completed',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,

    /* ========================================================================
       DISCOVER SCHEMA
       ======================================================================== */
    `CREATE TABLE IF NOT EXISTS discover_vacancies (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(100) NOT NULL DEFAULT 'general',
      created_by INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      employer_name VARCHAR(255) NOT NULL DEFAULT 'Employer',
      handle VARCHAR(255) NOT NULL DEFAULT 'employer',
      rating DOUBLE PRECISION NOT NULL DEFAULT 5.0,
      days_remaining INTEGER NOT NULL DEFAULT 14,
      required_people INTEGER NOT NULL DEFAULT 1,
      applicants INTEGER NOT NULL DEFAULT 0,
      accepted INTEGER NOT NULL DEFAULT 0,
      requirements VARCHAR(1000) NOT NULL DEFAULT '',
      min_salary INTEGER NOT NULL DEFAULT 0,
      max_salary INTEGER NOT NULL DEFAULT 0,
      status VARCHAR(50) NOT NULL DEFAULT 'apply',
      status_updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS discover_applications (
      id SERIAL PRIMARY KEY,
      vacancy_id INTEGER NOT NULL REFERENCES discover_vacancies(id) ON DELETE CASCADE,
      applicant_id INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      application_id VARCHAR(255) NOT NULL UNIQUE,
      resume_type VARCHAR(100),
      applied_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,

    /* ========================================================================
       FINANCE SCHEMA
       ======================================================================== */
    `CREATE TABLE IF NOT EXISTS finance_wallet_transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      amount DOUBLE PRECISION NOT NULL DEFAULT 0,
      currency VARCHAR(10) NOT NULL DEFAULT 'UGX',
      status VARCHAR(50) NOT NULL DEFAULT 'completed',
      reference VARCHAR(255),
      description TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS finance_payment_methods (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      provider VARCHAR(100) NOT NULL,
      account_number VARCHAR(100) NOT NULL,
      account_name VARCHAR(255) NOT NULL,
      is_default BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,

    /* ========================================================================
       LEGACY TABLES (backward compatibility)
       ======================================================================== */
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
      debit INTEGER NOT NULL DEFAULT 0,
      paid INTEGER NOT NULL DEFAULT 0,
      owe INTEGER NOT NULL DEFAULT 0,
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
    `ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS debit INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS paid INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS owe INTEGER NOT NULL DEFAULT 0`,
    `CREATE TABLE IF NOT EXISTS campaign_members_legacy (
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
    `CREATE TABLE IF NOT EXISTS market_listings_legacy (
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
