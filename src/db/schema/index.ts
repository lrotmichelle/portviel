import * as authSchema from './auth';
import * as campaignSchema from './campaign';
import * as marketSchema from './market';
import * as discoverSchema from './discover';
import * as financeSchema from './finance';

export const schema = {
  ...authSchema,
  ...campaignSchema,
  ...marketSchema,
  ...discoverSchema,
  ...financeSchema,
};

export type AuthSchema = typeof authSchema;
export type CampaignSchema = typeof campaignSchema;
export type MarketSchema = typeof marketSchema;
export type DiscoverSchema = typeof discoverSchema;
export type FinanceSchema = typeof financeSchema;
