import { desc, eq, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { authUsers } from '@/db/schema/auth';
import { vacancies, vacancyApplications } from '@/db/schema';
import { db, ensureDatabaseSchema } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ vacancyId: string }> };

async function getVacancy(vacancyId: string) {
  const id = Number(vacancyId);
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  const [vacancy] = await db.select().from(vacancies).where(eq(vacancies.id, id)).limit(1);
  return vacancy ?? null;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await ensureDatabaseSchema();
    const { vacancyId } = await params;
    const vacancy = await getVacancy(vacancyId);
    if (!vacancy) return NextResponse.json({ error: 'Vacancy not found' }, { status: 404 });
    if (String(vacancy.createdBy) !== String(userId)) return NextResponse.json({ error: 'Only the vacancy owner can view applicants.' }, { status: 403 });

    const applications = await db.select({
      id: vacancyApplications.id,
      status: vacancyApplications.status,
      appliedAt: vacancyApplications.createdAt,
      name: authUsers.name,
      username: authUsers.username,
    })
      .from(vacancyApplications)
      .innerJoin(authUsers, eq(vacancyApplications.applicantId, authUsers.id))
      .where(eq(vacancyApplications.vacancyId, vacancy.id))
      .orderBy(desc(vacancyApplications.createdAt));

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Unable to load vacancy applications:', error);
    return NextResponse.json({ error: 'Unable to load applications.' }, { status: 500 });
  }
}

export async function POST(_request: Request, { params }: RouteContext) {
  const session = await auth();
  const userId = Number(session?.user?.id);
  if (!Number.isSafeInteger(userId) || userId <= 0) return NextResponse.json({ error: 'Sign in to apply.' }, { status: 401 });

  try {
    await ensureDatabaseSchema();
    const { vacancyId } = await params;
    const vacancy = await getVacancy(vacancyId);
    if (!vacancy) return NextResponse.json({ error: 'Vacancy not found' }, { status: 404 });
    if (String(vacancy.createdBy) === String(userId)) return NextResponse.json({ error: 'You cannot apply to your own vacancy.' }, { status: 403 });
    if (vacancy.status !== 'apply') return NextResponse.json({ error: 'This vacancy is not accepting applications.' }, { status: 409 });

    const [application] = await db.insert(vacancyApplications)
      .values({ vacancyId: vacancy.id, applicantId: userId })
      .onConflictDoNothing()
      .returning();
    if (!application) return NextResponse.json({ error: 'You have already applied.' }, { status: 409 });

    const [updated] = await db.update(vacancies)
      .set({ applicants: sql`${vacancies.applicants} + 1` })
      .where(eq(vacancies.id, vacancy.id))
      .returning({ applicants: vacancies.applicants });

    return NextResponse.json({ ok: true, status: 'pending', applicants: updated.applicants });
  } catch (error) {
    console.error('Unable to submit vacancy application:', error);
    return NextResponse.json({ error: 'Unable to submit your application.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await ensureDatabaseSchema();
    const { vacancyId } = await params;
    const vacancy = await getVacancy(vacancyId);
    if (!vacancy) return NextResponse.json({ error: 'Vacancy not found' }, { status: 404 });
    if (String(vacancy.createdBy) !== String(userId)) return NextResponse.json({ error: 'Only the vacancy owner can change its status.' }, { status: 403 });

    const body = await request.json().catch(() => ({}));
    const requestedStatus = body.status;
    if (!['apply', 'paused'].includes(requestedStatus) || (vacancy.status !== 'apply' && vacancy.status !== 'paused')) {
      return NextResponse.json({ error: 'Invalid vacancy status transition.' }, { status: 400 });
    }

    const [updated] = await db.update(vacancies)
      .set({ status: requestedStatus, statusUpdatedAt: new Date() })
      .where(eq(vacancies.id, vacancy.id))
      .returning({ status: vacancies.status });

    return NextResponse.json({ ok: true, status: updated.status });
  } catch (error) {
    console.error('Unable to update vacancy status:', error);
    return NextResponse.json({ error: 'Unable to update vacancy status.' }, { status: 500 });
  }
}
