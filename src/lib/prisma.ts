import 'server-only';

import { and, asc, desc, eq, inArray } from 'drizzle-orm';

import { campaignMembers, campaigns, engagementEvents, marketListings, vacancies } from '@/db/schema';
import { db } from '@/lib/db';

function toNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function normalizeOrderBy(orderBy?: Record<string, 'asc' | 'desc'>) {
  return Object.entries(orderBy ?? {}).map(([field, direction]) => {
    if (field === 'createdAt') {
      return direction === 'asc' ? asc(campaigns.createdAt) : desc(campaigns.createdAt);
    }

    return direction === 'asc' ? asc(campaigns.createdAt) : desc(campaigns.createdAt);
  });
}

async function selectCampaignRows(args: any = {}) {
  const where = args.where ?? {};
  const take = Math.max(1, toNumber(args.take, 20));
  const orderBy = args.orderBy ?? { createdAt: 'desc' };

  const conditions = [] as any[];
  if (where.createdBy) conditions.push(eq(campaigns.createdBy, where.createdBy));
  if (where.status) conditions.push(eq(campaigns.status, where.status));
  if (where.id !== undefined) conditions.push(eq(campaigns.id, Number(where.id)));

  const rows = await db.select().from(campaigns)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(...normalizeOrderBy(orderBy))
    .limit(take);

  if (!args.include?.members) {
    return rows;
  }

  const userId = toString(args.include.members.where?.userId, '');
  const status = toString(args.include.members.where?.status, 'active');

  const membersByCampaign = new Map<number, Array<{ id: number }>>();
  if (userId) {
    const memberRows = await db.select().from(campaignMembers)
      .where(and(eq(campaignMembers.userId, userId), eq(campaignMembers.status, status)));

    for (const member of memberRows) {
      const existing = membersByCampaign.get(member.campaignId) ?? [];
      existing.push({ id: member.id });
      membersByCampaign.set(member.campaignId, existing);
    }
  }

  return rows.map((row) => ({
    ...row,
    members: membersByCampaign.get(row.id) ?? [],
  }));
}

async function selectVacancyRows(args: any = {}) {
  const where = args.where ?? {};
  const take = Math.max(1, toNumber(args.take, 20));
  const conditions = [] as any[];

  if (where.createdBy) conditions.push(eq(vacancies.createdBy, where.createdBy));
  if (where.id !== undefined) conditions.push(eq(vacancies.id, Number(where.id)));
  if (where.entityType) conditions.push(eq(vacancies.category, where.entityType));

  const rows = await db.select().from(vacancies)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(vacancies.createdAt))
    .limit(take);

  return rows;
}

async function selectMarketRows(args: any = {}) {
  const where = args.where ?? {};
  const take = Math.max(1, toNumber(args.take, 20));
  const conditions = [] as any[];

  if (where.createdBy) conditions.push(eq(marketListings.createdBy, where.createdBy));
  if (where.id !== undefined) conditions.push(eq(marketListings.id, Number(where.id)));
  if (where.status) conditions.push(eq(marketListings.status, where.status));

  return db.select().from(marketListings)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(marketListings.createdAt))
    .limit(take);
}

async function selectActivityRows(args: any = {}) {
  const where = args.where ?? {};
  const take = Math.max(1, toNumber(args.take, 20));
  const conditions = [] as any[];

  if (where.entityType) conditions.push(eq(engagementEvents.entityType, where.entityType));
  if (where.actorId) conditions.push(eq(engagementEvents.actorId, where.actorId));
  if (where.entityId !== undefined) conditions.push(eq(engagementEvents.entityId, Number(where.entityId)));
  if (where.action?.in) conditions.push(inArray(engagementEvents.action, where.action.in));

  return db.select().from(engagementEvents)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(engagementEvents.createdAt))
    .limit(take);
}

export const prisma: any = {
  campaign: {
    findMany: async (args: any = {}) => selectCampaignRows(args),
    findUnique: async ({ where }: any = {}) => {
      const rows = await selectCampaignRows({ where, take: 1 });
      return rows[0] ?? null;
    },
    create: async ({ data }: any = {}) => {
      const [row] = await db.insert(campaigns).values(data).returning();
      return row;
    },
    update: async ({ where, data }: any = {}) => {
      const [row] = await db.update(campaigns)
        .set(data)
        .where(eq(campaigns.id, Number(where.id)))
        .returning();
      return row;
    },
    delete: async ({ where }: any = {}) => {
      await db.delete(campaigns).where(eq(campaigns.id, Number(where.id)));
    },
    deleteMany: async ({ where }: any = {}) => {
      if (where?.id !== undefined) {
        await db.delete(campaigns).where(eq(campaigns.id, Number(where.id)));
      }
    },
  },
  vacancy: {
    findMany: async (args: any = {}) => selectVacancyRows(args),
    findUnique: async ({ where }: any = {}) => {
      const rows = await selectVacancyRows({ where, take: 1 });
      return rows[0] ?? null;
    },
    create: async ({ data }: any = {}) => {
      const [row] = await db.insert(vacancies).values(data).returning();
      return row;
    },
    update: async ({ where, data }: any = {}) => {
      const [row] = await db.update(vacancies)
        .set(data)
        .where(eq(vacancies.id, Number(where.id)))
        .returning();
      return row;
    },
    deleteMany: async ({ where }: any = {}) => {
      if (where?.id !== undefined) {
        await db.delete(vacancies).where(eq(vacancies.id, Number(where.id)));
      }
    },
  },
  marketListing: {
    findMany: async (args: any = {}) => selectMarketRows(args),
    findUnique: async ({ where }: any = {}) => {
      const rows = await selectMarketRows({ where, take: 1 });
      return rows[0] ?? null;
    },
    create: async ({ data }: any = {}) => {
      const [row] = await db.insert(marketListings).values(data).returning();
      return row;
    },
    update: async ({ where, data }: any = {}) => {
      const [row] = await db.update(marketListings)
        .set(data)
        .where(eq(marketListings.id, Number(where.id)))
        .returning();
      return row;
    },
    deleteMany: async ({ where }: any = {}) => {
      if (where?.id !== undefined) {
        await db.delete(marketListings).where(eq(marketListings.id, Number(where.id)));
      }
    },
  },
  engagementEvent: {
    findMany: async (args: any = {}) => selectActivityRows(args),
    create: async ({ data }: any = {}) => {
      const [row] = await db.insert(engagementEvents).values(data).returning();
      return row;
    },
    deleteMany: async ({ where }: any = {}) => {
      if (where?.entityType && where?.entityId !== undefined) {
        await db.delete(engagementEvents)
          .where(and(eq(engagementEvents.entityType, where.entityType), eq(engagementEvents.entityId, Number(where.entityId))));
      }
    },
  },
};
