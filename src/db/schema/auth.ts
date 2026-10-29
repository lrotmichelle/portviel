import { pgTable, serial, text, timestamp, integer, boolean, varchar, doublePrecision, uniqueIndex } from 'drizzle-orm/pg-core';

/* ============================================================================
   AUTH SCHEMA (auth.*)
   Logical separation: user accounts, sessions, OTP codes, device verifications
   ============================================================================ */

export const authUsers = pgTable('auth_users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 100 }),
  profileBio: text('profile_bio'),
  legalName: varchar('legal_name', { length: 255 }),
  nameLocked: boolean('name_locked').notNull().default(false),
  kycStatus: varchar('kyc_status', { length: 20 }).notNull().default('not_started'),
  kycRequestedAt: timestamp('kyc_requested_at'),
  kycVerifiedAt: timestamp('kyc_verified_at'),
  isKycVerified: boolean('is_kyc_verified').notNull().default(false),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('user'),
  isVerified: boolean('is_verified').notNull().default(false),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const authSessions = pgTable('auth_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 512 }).notNull().unique(),
  deviceId: varchar('device_id', { length: 255 }),
  deviceName: varchar('device_name', { length: 255 }),
  ipAddress: varchar('ip_address', { length: 100 }),
  userAgent: text('user_agent'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const authOtpCodes = pgTable('auth_otp_codes', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  code: varchar('code', { length: 10 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'signup', 'login', 'forgot-password', 'device-verification'
  channel: varchar('channel', { length: 50 }).notNull(), // 'email', 'whatsapp'
  isUsed: boolean('is_used').notNull().default(false),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const authDeviceVerifications = pgTable('auth_device_verifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  deviceId: varchar('device_id', { length: 255 }).notNull(),
  deviceName: varchar('device_name', { length: 255 }),
  isTrusted: boolean('is_trusted').notNull().default(false),
  lastVerifiedAt: timestamp('last_verified_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const authUserRatings = pgTable('auth_user_ratings', {
  id: serial('id').primaryKey(),
  targetUserId: integer('target_user_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  raterUserId: integer('rater_user_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  rating: doublePrecision('rating').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  uniqueIndex('auth_user_ratings_target_rater_unique').on(table.targetUserId, table.raterUserId),
]);

export const authCampaignStars = pgTable('campaign_star_votes', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').notNull(),
  userId: integer('user_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  uniqueIndex('campaign_star_votes_campaign_user_unique').on(table.campaignId, table.userId),
]);
