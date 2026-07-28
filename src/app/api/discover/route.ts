import { NextRequest, NextResponse } from 'next/server';
import { getDiscoverJobs } from '@/lib/discover';
import { query } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

export async function GET() {
  try {
    const jobs = await getDiscoverJobs();
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Failed to load discover jobs', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const title = toString(body.title, '');
    const description = toString(body.description, '');
    const category = toString(body.category ?? body.niche, 'general');
    const createdBy = toString(body.createdBy ?? body.userId ?? request.headers.get('x-user-id'), 'anonymous');

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const employerName = toString(body.employerName ?? body.employer_name, 'Employer');
    const handle = employerName.toLowerCase().replace(/\s+/g, '') || 'employer';
    const rating = 4.8;
    const daysRemaining = Number(body.daysRemaining ?? body.days_remaining) || 14;
    const vacant = Number(body.vacant ?? body.requiredPeople ?? body.required_people) || 1;
    const minSalary = Number(body.minSalary ?? body.min_salary) || 0;
    const maxSalary = Number(body.maxSalary ?? body.max_salary) || 0;
    
    const requirementsArray = Array.isArray(body.skills ?? body.requirements)
      ? (body.skills ?? body.requirements)
      : typeof (body.skills ?? body.requirements) === 'string'
      ? (body.skills ?? body.requirements).split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];
    const requirements = requirementsArray.join(',');

    const created = await query<Record<string, unknown>>(
      `INSERT INTO vacancies (
        title, description, category, employer_name, handle, rating, 
        days_remaining, required_people, min_salary, max_salary, requirements, status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        title, description, category, employerName, handle, rating,
        daysRemaining, vacant, minSalary, maxSalary, requirements, 'apply', createdBy
      ]
    );

    return NextResponse.json({ ok: true, item: created[0] });
  } catch (error) {
    console.error('Unable to create discover vacancy', error);
    return NextResponse.json({ error: 'Unable to create discover vacancy' }, { status: 500 });
  }
}
