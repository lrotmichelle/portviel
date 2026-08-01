import { integer, pgTable, serial, text, timestamp, doublePrecision, boolean } from 'drizzle-orm/pg-core';

export const campaigns = pgTable('campaigns', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull().default('Technology'),
  nicheHashtag: text('niche_hashtag').notNull().default('growth'),
  createdBy: text('created_by').notNull(),
  status: text('status').notNull().default('active'),
  publisherRating: doublePrecision('publisher_rating').notNull().default(4.8),
  publisherProfileIcon: text('publisher_profile_icon').notNull().default('/images/publisher-placeholder.png'),
  communitySize: integer('community_size').notNull().default(12000),
  viewsGenerated: integer('views_generated').notNull().default(0),
  likesGenerated: integer('likes_generated').notNull().default(0),
  totalBudget: integer('total_budget').notNull().default(1000),
  budgetUsed: integer('budget_used').notNull().default(0),
  highestMcp: integer('highest_mcp').notNull().default(100),
  timeRemainingDays: integer('time_remaining_days').notNull().default(14),
  requiredPlatforms: text('required_platforms').notNull().default(''),
  startDate: timestamp('start_date'),
  minPayout: integer('min_payout').notNull().default(0),
  maxPayout: integer('max_payout').notNull().default(0),
  publishFee: integer('publish_fee').notNull().default(1000),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const campaignMembers = pgTable('campaign_members', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  status: text('status').notNull().default('active'),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const vacancies = pgTable('vacancies', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull().default('general'),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  employerName: text('employer_name').notNull().default('Employer'),
  handle: text('handle').notNull().default('employer'),
  rating: doublePrecision('rating').notNull().default(5.0),
  daysRemaining: integer('days_remaining').notNull().default(14),
  requiredPeople: integer('required_people').notNull().default(1),
  applicants: integer('applicants').notNull().default(0),
  accepted: integer('accepted').notNull().default(0),
  requirements: text('requirements').notNull().default(''),
  minSalary: integer('min_salary').notNull().default(0),
  maxSalary: integer('max_salary').notNull().default(0),
  status: text('status').notNull().default('apply'),
  statusUpdatedAt: timestamp('status_updated_at').notNull().defaultNow(),
});

export const marketListings = pgTable('market_listings', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  price: doublePrecision('price').notNull().default(0),
  profileUrl: text('profile_url'),
  platform: text('platform'),
  handle: text('handle'),
  followers: integer('followers').notNull().default(0),
  likes: integer('likes').notNull().default(0),
  engagementRate: doublePrecision('engagement_rate').notNull().default(0),
  niche: text('niche'),
  createdBy: text('created_by').notNull(),
  status: text('status').notNull().default('open'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const engagementEvents = pgTable('engagement_events', {
  id: serial('id').primaryKey(),
  entityType: text('entity_type').notNull(),
  entityId: integer('entity_id').notNull(),
  actorId: text('actor_id').notNull(),
  action: text('action').notNull(),
  message: text('message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
