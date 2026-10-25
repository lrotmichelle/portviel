import { pgTable, serial, text, timestamp, integer, doublePrecision, boolean, varchar } from 'drizzle-orm/pg-core';
import { authUsers } from './auth';

/* ============================================================================
   FINANCE SCHEMA (finance.*)
   Logical separation: wallet transactions, payment methods
   ============================================================================ */

export const financeWalletTransactions = pgTable('finance_wallet_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // 'deposit', 'withdrawal', 'payment', 'refund'
  amount: doublePrecision('amount').notNull().default(0),
  currency: varchar('currency', { length: 10 }).notNull().default('UGX'),
  status: varchar('status', { length: 50 }).notNull().default('completed'),
  reference: varchar('reference', { length: 255 }),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const financePaymentMethods = pgTable('finance_payment_methods', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // 'mobile_money', 'bank', 'card'
  provider: varchar('provider', { length: 100 }).notNull(),
  accountNumber: varchar('account_number', { length: 100 }).notNull(),
  accountName: varchar('account_name', { length: 255 }).notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
