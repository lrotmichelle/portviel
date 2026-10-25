import { pgTable, serial, text, timestamp, integer, doublePrecision, boolean, varchar } from 'drizzle-orm/pg-core';
import { authUsers } from './auth';

/* ============================================================================
   CAMPAIGN SCHEMA (campaign.*)
   Logical separation: campaigns, campaign members
   ============================================================================ */

export const campaignCampaigns = pgTable('campaign_campaigns', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }).notNull().default('Technology'),
  nicheHashtag: varchar('niche_hashtag', { length: 100 }).notNull().default('growth'),
  createdBy: integer('created_by').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  publisherRating: doublePrecision('publisher_rating').notNull().default(4.8),
  publisherProfileIcon: varchar('publisher_profile_icon', { length: 500 }).notNull().default('/images/publisher-placeholder.png'),
  communitySize: integer('community_size').notNull().default(12000),
  viewsGenerated: integer('views_generated').notNull().default(0),
  likesGenerated: integer('likes_generated').notNull().default(0),
  totalBudget: integer('total_budget').notNull().default(1000),
  budgetUsed: integer('budget_used').notNull().default(0),
  debit: integer('debit').notNull().default(0),
  paid: integer('paid').notNull().default(0),
  owe: integer('owe').notNull().default(0),
  highestMcp: integer('highest_mcp').notNull().default(100),
  timeRemainingDays: integer('time_remaining_days').notNull().default(14),
  requiredPlatforms: varchar('required_platforms', { length: 500 }).notNull().default(''),
  startDate: timestamp('start_date'),
  minPayout: integer('min_payout').notNull().default(0),
  maxPayout: integer('max_payout').notNull().default(0),
  publishFee: integer('publish_fee').notNull().default(1000),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const campaignMembers = pgTable('campaign_members', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').notNull().references(() => campaignCampaigns.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});
