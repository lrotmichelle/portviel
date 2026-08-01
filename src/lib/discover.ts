import type { JobOffer } from '@/components/job-card/data';
import { and, desc, eq, inArray } from 'drizzle-orm';

import { engagementEvents, vacancies } from '@/db/schema';
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
    handle: vacancy.handle ?? 'employer',
    rating: toNumber(vacancy.rating, 4.5),
    title: vacancy.title,
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

export async function getDiscoverJobs(): Promise<JobOffer[]> {
  const vacancyRows = await db.select().from(vacancies)
    .orderBy(desc(vacancies.createdAt))
    .limit(20);

  const activityRows = await db.select().from(engagementEvents)
    .where(and(eq(engagementEvents.entityType, 'vacancy'), eq(engagementEvents.actorId, 'demo-user'), inArray(engagementEvents.action, ['apply', 'withdraw'])))
    .orderBy(desc(engagementEvents.createdAt))
    .limit(200);

  const latestActionByVacancy = new Map<string, string>();

  for (const event of activityRows) {
    const vacancyId = String(event.entityId);
    if (!latestActionByVacancy.has(vacancyId)) {
      latestActionByVacancy.set(vacancyId, event.action);
    }
  }

  return vacancyRows.map((vacancy: any) =>
    mapVacancyToJob(vacancy, latestActionByVacancy.get(String(vacancy.id)) === 'apply')
  );
}
