import { NextRequest, NextResponse } from 'next/server';
import { marketListings } from '@/db/schema';
import { ensureDatabaseSchema } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function getDbClient() {
  try {
    const mod = await import('@/lib/db');
    return mod.db;
  } catch (error) {
    console.warn('Database unavailable for market API; continuing with fallback payload.', error);
    return null;
  }
}

async function getMarketCardsFromDb() {
  try {
    const mod = await import('@/lib/market');
    return await mod.getMarketCards();
  } catch (error) {
    console.warn('Unable to load market cards from the database.', error);
    return [];
  }
}

function parseSocialProfileUrl(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const supported = ['instagram.com', 'tiktok.com', 'twitter.com', 'x.com', 'youtube.com', 'facebook.com', 'linkedin.com', 'threads.net'];
    if (!supported.includes(host)) {
      throw new Error('Only social media profile URLs are supported.');
    }

    const pathParts = parsed.pathname.split('/').filter(Boolean);
    const handle = pathParts[0] ? pathParts[0].replace(/^@/, '') : '';
    if (!handle) {
      throw new Error('The profile URL must include a valid account handle.');
    }

    return { host, handle };
  } catch {
    throw new Error('Please provide a valid social media profile URL.');
  }
}

function extractNumericMetric(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const parsed = Number(match[1].replace(/,/g, '').replace(/\./g, ''));
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

async function verifySocialAccount(profileUrl: string) {
  const { host, handle } = parseSocialProfileUrl(profileUrl);

  try {
    if (host === 'instagram.com') {
      const apiUrl = `https://www.instagram.com/${handle}/?__a=1&__d=dis`;
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PortvilleBot/1.0)',
        },
        redirect: 'follow',
      });

      if (response.ok) {
        const payload = await response.json().catch(() => null);
        const user = payload?.graphql?.user || payload?.data?.user;
        if (user) {
          const followers = toNumber(user.edge_followed_by?.count ?? user.follower_count, 0);
          const recentPosts = (user.edge_owner_to_timeline_media?.edges ?? []).slice(0, 4);
          const recentVideoViews = recentPosts.reduce((total: number, post: { node?: { is_video?: boolean; video_view_count?: number; edge_liked_by?: { count?: number }; edge_media_preview_like?: { count?: number }; likes?: { count?: number }; edge_media_to_comment?: { count?: number }; comments?: { count?: number } } }) => {
            if (!post?.node?.is_video) return total;
            return total + toNumber(post.node.video_view_count, 0);
          }, 0);
          const recentLikes = recentPosts.reduce((total: number, post: { node?: { edge_liked_by?: { count?: number }; edge_media_preview_like?: { count?: number }; likes?: { count?: number } } }) => {
            return total + toNumber(post?.node?.edge_liked_by?.count ?? post?.node?.edge_media_preview_like?.count ?? post?.node?.likes?.count, 0);
          }, 0);

          const recentEngagementRates = recentPosts.map((post: { node?: { edge_liked_by?: { count?: number }; edge_media_preview_like?: { count?: number }; likes?: { count?: number }; edge_media_to_comment?: { count?: number }; comments?: { count?: number } } }) => {
            const likes = toNumber(post?.node?.edge_liked_by?.count ?? post?.node?.edge_media_preview_like?.count ?? post?.node?.likes?.count, 0);
            const comments = toNumber(post?.node?.edge_media_to_comment?.count ?? post?.node?.comments?.count, 0);
            const denominator = followers > 0 ? followers : 1;
            return denominator > 0 ? ((likes + comments) / denominator) * 100 : 0;
          });

          const engagementRate = recentEngagementRates.length
            ? Number((recentEngagementRates.reduce((sum: number, value: number) => sum + value, 0) / recentEngagementRates.length).toFixed(2))
            : 0;

          if (followers > 0 || recentLikes > 0 || recentVideoViews > 0 || engagementRate > 0) {
            return {
              platform: host,
              handle,
              followers,
              likes: recentLikes,
              views: recentVideoViews > 0 ? recentVideoViews : 0,
              engagementRate,
              profileUrl,
            };
          }
        }
      }
    }

    const response = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PortvilleBot/1.0)',
      },
      redirect: 'follow',
    });

    const text = await response.text();
    const lowered = text.toLowerCase();
    const notFoundSignals = ['page not found', 'this page is not available', 'this profile is private', 'content not found', 'sorry, this page isn\'t available', '404'];
    const missing = response.status === 404 || notFoundSignals.some((signal) => lowered.includes(signal));
    if (missing) {
      throw new Error('The social account could not be verified because it does not appear to exist.');
    }

    const followerMatch = extractNumericMetric(text, [/\b(\d[\d,\.]*)(\s*)(followers|subscribers|members)\b/i]);
    const likeMatch = extractNumericMetric(text, [/\b(\d[\d,\.]*)(\s*)(likes?)\b/i]);
    const viewMatch = extractNumericMetric(text, [/\b(\d[\d,\.]*)(\s*)(views?)\b/i]);
    const engagementMatch = extractNumericMetric(text, [/([0-9]+(?:\.[0-9]+)?)\s*%/i]);

    if (followerMatch || likeMatch || viewMatch || engagementMatch) {
      return {
        platform: host,
        handle,
        followers: followerMatch ?? 0,
        likes: likeMatch ?? 0,
        views: viewMatch ?? 0,
        engagementRate: engagementMatch ?? 0,
        profileUrl,
      };
    }

    throw new Error('We could not verify the account metrics from the supplied profile link.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'We could not verify the account metrics from the supplied profile link.';
    throw new Error(message);
  }
}

export async function GET() {
  try {
    const cards = await getMarketCardsFromDb();
    return NextResponse.json(cards);
  } catch (error) {
    console.error('Failed to load market cards', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseSchema();
    const body = await request.json().catch(() => ({}));
    const userId = toString(body.createdBy ?? body.userId ?? request.headers.get('x-user-id'), 'anonymous');
    const profileUrl = toString(body.profileUrl, '');
    const title = toString(body.title ?? body.profileUrl ? `Social account: ${profileUrl.split('/').filter(Boolean).pop() ?? 'listing'}` : '', 'Market listing');
    const description = toString(body.description, '');
    const niche = toString(body.niche, 'General');
    const price = toNumber(body.price, 0);

    if (!profileUrl) {
      return NextResponse.json({ error: 'Please provide a social media profile link.' }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json({ error: 'Please provide a short description.' }, { status: 400 });
    }

    const profile = await verifySocialAccount(profileUrl);
    const dbClient = await getDbClient();

    let item;
    if (dbClient) {
      const [created] = await dbClient.insert(marketListings).values({
        title,
        description,
        price,
        profileUrl: profile.profileUrl,
        platform: profile.platform,
        handle: profile.handle,
        followers: profile.followers,
        likes: profile.likes,
        engagementRate: profile.engagementRate,
        niche,
        createdBy: userId,
        status: 'open',
      }).returning();

      const views = Math.max(500, Math.round(created.followers * 2 + created.likes * 1.5 + created.engagementRate * 25));

      item = {
        id: String(created.id),
        title: `Social account: ${created.handle}`,
        description: created.description,
        price: created.price,
        profileUrl: created.profileUrl,
        platform: created.platform,
        handle: created.handle,
        followers: created.followers,
        likes: created.likes,
        views,
        engagementRate: created.engagementRate,
        niche,
        createdBy: created.createdBy,
        status: 'open',
        createdAt: created.createdAt.toISOString(),
      };
    } else {
      const fallbackViews = Math.max(500, Math.round(profile.followers * 2 + profile.likes * 1.5 + profile.engagementRate * 25));
      item = {
        id: `local-${Date.now()}`,
        title: `Social account: ${profile.handle}`,
        description,
        price,
        profileUrl: profile.profileUrl,
        platform: profile.platform,
        handle: profile.handle,
        followers: profile.followers,
        likes: profile.likes,
        views: fallbackViews,
        engagementRate: profile.engagementRate,
        niche,
        createdBy: userId,
        status: 'open',
        createdAt: new Date().toISOString(),
      };
    }

    return NextResponse.json({
      ok: true,
      item,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create listing';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
