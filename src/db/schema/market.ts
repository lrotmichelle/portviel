import { pgTable, serial, text, timestamp, integer, doublePrecision, varchar } from 'drizzle-orm/pg-core';
import { authUsers } from './auth';

/* ============================================================================
   MARKET SCHEMA (market.*)
   Logical separation: market listings, market transactions
   ============================================================================ */

export const marketListings = pgTable('market_listings', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  price: doublePrecision('price').notNull().default(0),
  profileUrl: varchar('profile_url', { length: 500 }),
  platform: varchar('platform', { length: 100 }),
  handle: varchar('handle', { length: 100 }),
  followers: integer('followers').notNull().default(0),
  likes: integer('likes').notNull().default(0),
  engagementRate: doublePrecision('engagement_rate').notNull().default(0),
  niche: varchar('niche', { length: 100 }),
  createdBy: integer('created_by').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).notNull().default('open'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const marketTransactions = pgTable('market_transactions', {
  id: serial('id').primaryKey(),
  listingId: integer('listing_id').notNull().references(() => marketListings.id, { onDelete: 'cascade' }),
  buyerId: integer('buyer_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  sellerId: integer('seller_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  amount: doublePrecision('amount').notNull().default(0),
  type: varchar('type', { length: 50 }).notNull(), // 'purchase', 'sale'
  status: varchar('status', { length: 50 }).notNull().default('completed'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
