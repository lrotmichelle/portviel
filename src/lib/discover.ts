import type { JobOffer } from '@/components/job-card/data';
import type { Vacancy } from '@/generated/prisma/client';
import { prisma } from './prisma';

function toNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback;
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

function mapVacancyToJob(vacancy: Vacancy, hasApplied: boolean): JobOffer {
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
  const vacancies = await prisma.vacancy.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const events = await prisma.engagementEvent.findMany({
    where: {
      entityType: 'vacancy',
      actorId: 'demo-user',
      action: { in: ['apply', 'withdraw'] },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const latestActionByVacancy = new Map<string, string>();

  for (const event of events) {
    const vacancyId = String(event.entityId);
    if (!latestActionByVacancy.has(vacancyId)) {
      latestActionByVacancy.set(vacancyId, event.action);
    }
  }

  return vacancies.map((vacancy) =>
    mapVacancyToJob(vacancy, latestActionByVacancy.get(String(vacancy.id)) === 'apply')
  );
}
