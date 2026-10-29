import type { JobOffer } from '@/components/job-card/data';
import { desc, eq, inArray } from 'drizzle-orm';

import { vacancies, vacancyApplications } from '@/db/schema';
import { authUsers } from '@/db/schema/auth';
import { db } from '@/lib/db';

function toNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function mapVacancyToJob(vacancy: any, hasApplied: boolean): JobOffer {
  return {
    id: String(vacancy.id),
    employerName: vacancy.employerName ?? 'Employer',
    employerAccountId: vacancy.createdBy ? `acc-${vacancy.createdBy}` : 'acc-employer-1',
    handle: vacancy.handle ?? 'employer',
    rating: toNumber(vacancy.rating, 4.5),
    title: vacancy.title,
    location: vacancy.location ?? 'Location not specified',
    salaryPeriod: vacancy.salaryPeriod ?? 'month',
    niche: vacancy.category ?? 'General',
    daysRemaining: vacancy.daysRemaining,
    requiredPeople: vacancy.requiredPeople,
    applicants: vacancy.applicants,
    accepted: vacancy.accepted,
    requirements: toStringArray(vacancy.requirements ?? ''),
    minSalary: vacancy.minSalary,
    maxSalary: vacancy.maxSalary,
    description: vacancy.description,
    status: (vacancy.status as JobOffer['status']) ?? 'apply',
    statusUpdatedAt: vacancy.statusUpdatedAt ?? vacancy.createdAt,
    increaseCount: 0,
    hasApplied,
  };
}

export async function getDiscoverJobs(viewerId?: string): Promise<JobOffer[]> {
  const vacancyRows = await db.select().from(vacancies)
    .orderBy(desc(vacancies.createdAt))
    .limit(20);

  const authorIds = [...new Set(vacancyRows.map((vacancy: any) => Number(vacancy.createdBy)).filter((id: number) => Number.isSafeInteger(id) && id > 0))];
  const authors = authorIds.length
    ? await db.select({ id: authUsers.id, username: authUsers.username }).from(authUsers).where(inArray(authUsers.id, authorIds))
    : [];
  const usernames = new Map(authors.map((author) => [String(author.id), author.username]));
  const numericViewerId = Number(viewerId);
  const viewerApplications = Number.isSafeInteger(numericViewerId) && numericViewerId > 0
    ? await db.select({ vacancyId: vacancyApplications.vacancyId })
      .from(vacancyApplications)
      .where(eq(vacancyApplications.applicantId, numericViewerId))
    : [];
  const appliedVacancyIds = new Set(viewerApplications.map((application) => String(application.vacancyId)));

  return vacancyRows.map((vacancy: any) =>
    {
      const username = usernames.get(String(vacancy.createdBy));
      const job = mapVacancyToJob(vacancy, appliedVacancyIds.has(String(vacancy.id)));
      return { ...job, status: vacancy.status === 'paused' ? 'paused' : job.status, ...(username ? { handle: username } : {}) };
    }
  );
}
