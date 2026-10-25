import { pgTable, serial, text, timestamp, integer, doublePrecision, varchar } from 'drizzle-orm/pg-core';
import { authUsers } from './auth';

/* ============================================================================
   DISCOVER SCHEMA (discover.*)
   Logical separation: vacancies, job applications
   ============================================================================ */

export const discoverVacancies = pgTable('discover_vacancies', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }).notNull().default('general'),
  createdBy: integer('created_by').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  employerName: varchar('employer_name', { length: 255 }).notNull().default('Employer'),
  handle: varchar('handle', { length: 255 }).notNull().default('employer'),
  rating: doublePrecision('rating').notNull().default(5.0),
  daysRemaining: integer('days_remaining').notNull().default(14),
  requiredPeople: integer('required_people').notNull().default(1),
  applicants: integer('applicants').notNull().default(0),
  accepted: integer('accepted').notNull().default(0),
  requirements: varchar('requirements', { length: 1000 }).notNull().default(''),
  minSalary: integer('min_salary').notNull().default(0),
  maxSalary: integer('max_salary').notNull().default(0),
  status: varchar('status', { length: 50 }).notNull().default('apply'),
  statusUpdatedAt: timestamp('status_updated_at').notNull().defaultNow(),
});

export const discoverApplications = pgTable('discover_applications', {
  id: serial('id').primaryKey(),
  vacancyId: integer('vacancy_id').notNull().references(() => discoverVacancies.id, { onDelete: 'cascade' }),
  applicantId: integer('applicant_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  applicationId: varchar('application_id', { length: 255 }).notNull().unique(),
  resumeType: varchar('resume_type', { length: 100 }),
  appliedAt: timestamp('applied_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
