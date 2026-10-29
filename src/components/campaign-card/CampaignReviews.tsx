'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Ellipsis, Heart, MessageCircle, Star } from 'lucide-react';
import { mockCampaignPeople } from '@/lib/mockCampaigns';

interface CampaignReviewReply {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
  likes: string[];
}

interface CampaignReview {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
  likes: string[];
  replies: CampaignReviewReply[];
}

interface CampaignReviewsProps {
  campaignId: string;
  stars?: number;
  creatorUsername?: string;
  isCreator: boolean;
  viewerId: string;
  viewerName: string;
}

const reviewKey = (campaignId: string) => `campaign-reviews:${campaignId}`;
const starKey = (campaignId: string, viewerId: string) => `campaign-stars:${campaignId}:${viewerId}`;
// Each marquee slide holds enough reviews to fill two desktop rows at 3 columns.
const groupSize = 6;

function seedReviews(campaignId: string, creatorUsername: string): CampaignReview[] {
  const seed = campaignId.split('').reduce((value, char) => value + char.charCodeAt(0), 0);
  const reviewers = mockCampaignPeople.filter((person) => person.username !== creatorUsername);
  return Array.from({ length: Math.min(3, reviewers.length) }, (_, index) => {
    const person = reviewers[(seed + index) % reviewers.length];
    const daysAgo = (seed + index * 3) % 18 + 1;
    return {
      id: `seed-${campaignId}-${index}`,
      authorId: person.id,
      authorName: person.name,
      text: [
        'Clear campaign goals and a great chance to connect with local customers.',
        'Enjoyed taking part. The campaign team kept the details easy to follow.',
        'A useful project with a strong community and thoughtful creator support.',
      ][(seed + index) % 3],
      createdAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
      likes: Array.from({ length: (seed + index) % 5 }, (_, likeIndex) => `seed-like-${likeIndex}`),
      replies: [],
    };
  });
}

function relativeTime(date: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function CampaignReviews({ campaignId, stars = 0, creatorUsername = '', isCreator, viewerId, viewerName }: CampaignReviewsProps) {
  const [reviews, setReviews] = useState<CampaignReview[]>([]);
  const [starred, setStarred] = useState(false);
  const [starCount, setStarCount] = useState(stars);
  const [expanded, setExpanded] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [isReviewInputOpen, setIsReviewInputOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [menuId, setMenuId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const seeded = seedReviews(campaignId, creatorUsername);
    try {
      const stored = localStorage.getItem(reviewKey(campaignId));
      setReviews(stored ? JSON.parse(stored) as CampaignReview[] : seeded);
      const hasStarred = localStorage.getItem(starKey(campaignId, viewerId)) === 'starred';
      setStarred(hasStarred);
      setStarCount(stars + (hasStarred ? 1 : 0));
    } catch {
      setReviews(seeded);
      setStarred(false);
      setStarCount(stars);
    }
    setExpanded(false);
    setPage(0);
  }, [campaignId, creatorUsername, stars, viewerId]);

  const saveReviews = (next: CampaignReview[]) => {
    setReviews(next);
    localStorage.setItem(reviewKey(campaignId), JSON.stringify(next));
  };

  const pageGroups = useMemo(() => {
    const groups: CampaignReview[][] = [];
    for (let index = 0; index < reviews.length; index += groupSize) groups.push(reviews.slice(index, index + groupSize));
    return groups;
  }, [reviews]);

  useEffect(() => {
    if (expanded || pageGroups.length < 2) return;
    const timer = setInterval(() => setPage((current) => (current + 1) % pageGroups.length), 5000);
    return () => clearInterval(timer);
  }, [expanded, pageGroups.length]);

  useEffect(() => {
    if (!expanded) return;
    const collapse = () => setExpanded(false);
    const resetIdleTimer = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(collapse, 120000);
    };
    resetIdleTimer();
    window.addEventListener('pointerdown', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    window.addEventListener('touchstart', resetIdleTimer);
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      window.removeEventListener('pointerdown', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
      window.removeEventListener('touchstart', resetIdleTimer);
    };
  }, [expanded]);

  const toggleStar = () => {
    if (isCreator) return;
    const next = !starred;
    setStarred(next);
    setStarCount((count) => Math.max(0, count + (next ? 1 : -1)));
    localStorage.setItem(starKey(campaignId, viewerId), next ? 'starred' : '');
  };

  const submitReview = () => {
    const text = reviewText.trim().slice(0, 100);
    if (!text || isCreator) return;
    saveReviews([{ id: `review-${Date.now()}`, authorId: viewerId, authorName: viewerName, text, createdAt: new Date().toISOString(), likes: [], replies: [] }, ...reviews]);
    setReviewText('');
    setIsReviewInputOpen(false);
  };

  const submitReply = (review: CampaignReview) => {
    const text = replyText.trim().slice(0, 100);
    if (!text) return;
    const reply: CampaignReviewReply = { id: `reply-${Date.now()}`, authorId: viewerId, authorName: viewerName, text, createdAt: new Date().toISOString(), likes: [] };
    saveReviews(reviews.map((item) => item.id === review.id ? { ...item, replies: [...item.replies, reply] } : item));
    setReplyText('');
    setReplyTarget(null);
  };

  const toggleReviewLike = (review: CampaignReview) => {
    const liked = review.likes.includes(viewerId);
    saveReviews(reviews.map((item) => item.id === review.id ? { ...item, likes: liked ? item.likes.filter((id) => id !== viewerId) : [...item.likes, viewerId] } : item));
  };

  const toggleReplyLike = (review: CampaignReview, reply: CampaignReviewReply) => {
    const liked = reply.likes.includes(viewerId);
    saveReviews(reviews.map((item) => item.id === review.id ? {
      ...item,
      replies: item.replies.map((entry) => entry.id === reply.id ? { ...entry, likes: liked ? entry.likes.filter((id) => id !== viewerId) : [...entry.likes, viewerId] } : entry),
    } : item));
  };

  const menuAction = (review: CampaignReview) => {
    setMenuId(null);
    if (review.authorId !== viewerId) setReplyTarget(review.id);
    else saveReviews(reviews.filter((item) => item.id !== review.id));
  };

  const renderReview = (review: CampaignReview) => (
    <article key={review.id} className="min-w-0 rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-2.5">
      <header className="flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-[9px] font-bold text-emerald-300">{review.authorName.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>
        <span className="min-w-0 flex-1 truncate text-[10px] font-semibold text-white">{review.authorName}</span>
        <time className="shrink-0 text-[9px] text-zinc-500">{relativeTime(review.createdAt)}</time>
        <div className="relative shrink-0">
          <button type="button" aria-label="Review options" onClick={() => setMenuId((current) => current === review.id ? null : review.id)} className="rounded p-0.5 text-zinc-500 hover:bg-zinc-800 hover:text-white"><Ellipsis className="h-4 w-4" /></button>
          {menuId === review.id && <div className="absolute right-0 top-full z-20 min-w-20 rounded-lg border border-zinc-700 bg-zinc-950 p-1 shadow-xl">
            {review.authorId === viewerId ? <button type="button" onClick={() => { saveReviews(reviews.filter((item) => item.id !== review.id)); setMenuId(null); }} className="block w-full px-2 py-1 text-left text-[9px] text-rose-300 hover:bg-zinc-800">Delete</button> : <button type="button" onClick={() => menuAction(review)} className="block w-full px-2 py-1 text-left text-[9px] text-zinc-200 hover:bg-zinc-800">Reply</button>}
          </div>}
        </div>
      </header>
      <p className="mt-1.5 break-words text-[10px] leading-relaxed text-zinc-300">{review.text}</p>
      <div className="mt-1.5 flex items-center gap-3">
        <button type="button" onClick={() => toggleReviewLike(review)} className={`inline-flex items-center gap-1 text-[9px] ${review.likes.includes(viewerId) ? 'text-rose-300' : 'text-zinc-500 hover:text-rose-300'}`}><Heart className={`h-3 w-3 ${review.likes.includes(viewerId) ? 'fill-rose-300' : ''}`} />{review.likes.length}</button>
        <button type="button" onClick={() => setReplyTarget((current) => current === review.id ? null : review.id)} className="inline-flex items-center gap-1 text-[9px] text-zinc-500 hover:text-emerald-300"><MessageCircle className="h-3 w-3" />Reply{review.replies.length ? ` · ${review.replies.length}` : ''}</button>
      </div>
      {replyTarget === review.id && <div className="mt-2 flex gap-1.5"><input value={replyText} maxLength={100} onChange={(event) => setReplyText(event.target.value)} placeholder="Reply to campaign review…" className="min-w-0 flex-1 rounded-md border border-zinc-700 bg-black px-2 py-1.5 text-[9px] text-white outline-none focus:border-emerald-500" /><button type="button" onClick={() => submitReply(review)} disabled={!replyText.trim()} className="rounded-md border border-emerald-500/40 px-2 text-[9px] text-emerald-300 disabled:opacity-50">Send</button></div>}
      {review.replies.map((reply) => <div key={reply.id} className="mt-2 border-l border-zinc-700 pl-2"><p className="text-[9px] text-zinc-400"><span className="font-semibold text-zinc-200">{reply.authorName}: </span>{reply.text}</p><button type="button" onClick={() => toggleReplyLike(review, reply)} className="mt-1 inline-flex items-center gap-1 text-[9px] text-zinc-500"><Heart className="h-3 w-3" />{reply.likes.length}</button></div>)}
    </article>
  );

  const pages = pageGroups.length ? [...pageGroups, pageGroups[0]] : [];
  const viewerCanReview = !isCreator;

  return (
    <section className="space-y-1 border-t border-zinc-800/80 pt-2" aria-label="Campaign reviews">
      <div className="hidden min-[501px]:grid min-[501px]:grid-cols-[1fr_auto_auto_1fr] min-[501px]:items-center min-[501px]:gap-x-12">
        <h4 className="justify-self-start text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">Reviews <span className="text-zinc-300">({reviews.length})</span></h4>
        <div className="inline-flex items-center gap-1.5 justify-self-center" aria-label={`${starCount} campaign stars`}>
          <span className="relative inline-flex h-10 w-10 items-center justify-center">
            <button type="button" onClick={toggleStar} disabled={isCreator} aria-label={starred ? 'Remove campaign star' : 'Star campaign'} className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-amber-400/60 bg-amber-500/10 shadow-sm shadow-amber-950/30 transition hover:bg-amber-500/20 disabled:cursor-default">
              <Star className={`h-5 w-5 ${starred ? 'fill-amber-300 text-amber-300' : 'text-amber-300'}`} />
            </button>
            <Star aria-hidden="true" className="pointer-events-none absolute -top-1 left-0 h-2.5 w-2.5 fill-amber-300 text-amber-300" />
            <Star aria-hidden="true" className="pointer-events-none absolute -top-2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 fill-amber-300 text-amber-300" />
            <Star aria-hidden="true" className="pointer-events-none absolute -top-1 right-0 h-2.5 w-2.5 fill-amber-300 text-amber-300" />
          </span>
          <span className="min-w-4 text-center text-base font-black leading-none text-amber-200">{starCount}</span>
        </div>
        {viewerCanReview ? <button type="button" onClick={() => setIsReviewInputOpen((open) => !open)} className="justify-self-center rounded-lg border border-emerald-400/60 bg-emerald-500/15 px-4 py-2 text-xs font-black uppercase tracking-wider text-emerald-200 shadow-sm shadow-emerald-950/30 transition hover:border-emerald-300 hover:bg-emerald-500 hover:text-white">{isReviewInputOpen ? 'Cancel' : 'Review campaign'}</button> : <span />}
        <div className="justify-self-end">
          {reviews.length > 0 && <button type="button" onClick={() => { setExpanded((value) => !value); setPage(0); }} className="rounded-md px-2 py-1 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200">{expanded ? 'Show less' : 'View all'}</button>}
        </div>
      </div>
      <div className="flex min-[501px]:hidden flex-wrap items-center justify-center gap-7">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">Reviews <span className="text-zinc-300">({reviews.length})</span></h4>
        <div className="inline-flex items-center gap-1.5" aria-label={`${starCount} campaign stars`}>
          <span className="relative inline-flex h-10 w-10 items-center justify-center">
            <button type="button" onClick={toggleStar} disabled={isCreator} aria-label={starred ? 'Remove campaign star' : 'Star campaign'} className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-amber-400/60 bg-amber-500/10 shadow-sm shadow-amber-950/30 transition hover:bg-amber-500/20 disabled:cursor-default">
              <Star className={`h-5 w-5 ${starred ? 'fill-amber-300 text-amber-300' : 'text-amber-300'}`} />
            </button>
            <Star aria-hidden="true" className="pointer-events-none absolute -top-1 left-0 h-2.5 w-2.5 fill-amber-300 text-amber-300" />
            <Star aria-hidden="true" className="pointer-events-none absolute -top-2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 fill-amber-300 text-amber-300" />
            <Star aria-hidden="true" className="pointer-events-none absolute -top-1 right-0 h-2.5 w-2.5 fill-amber-300 text-amber-300" />
          </span>
          <span className="min-w-4 text-center text-base font-black leading-none text-amber-200">{starCount}</span>
        </div>
        {viewerCanReview && <button type="button" onClick={() => setIsReviewInputOpen((open) => !open)} className="rounded-lg border border-emerald-400/60 bg-emerald-500/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-200 shadow-sm shadow-emerald-950/30 transition hover:border-emerald-300 hover:bg-emerald-500 hover:text-white">{isReviewInputOpen ? 'Cancel' : 'Review'}</button>}
        {reviews.length > 0 && <button type="button" onClick={() => { setExpanded((value) => !value); setPage(0); }} className="rounded-md px-2 py-1 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200">{expanded ? 'Show less' : 'View all'}</button>}
      </div>
      <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2">
        <p className="text-[10px] font-semibold text-zinc-200">Enjoyed this campaign? Leave an honest review and star it to share your experience.</p>
        <p className="mt-1 text-[9px] leading-relaxed text-amber-200/80">Reviews and stars are optional, are not part of the campaign rules, and must never be forced. Pressuring users to give a star or post a false or persuasive review violates platform terms.</p>
      </div>
      {isReviewInputOpen && viewerCanReview && <div className="flex gap-2"><input value={reviewText} autoFocus onChange={(event) => setReviewText(event.target.value.slice(0, 100))} placeholder="Write a campaign review…" maxLength={100} className="min-w-0 flex-1 rounded-md border border-zinc-700 bg-black px-2 py-1.5 text-[10px] text-white" /><button type="button" onClick={submitReview} disabled={!reviewText.trim()} className="rounded-md border border-emerald-500/40 px-2 text-[9px] text-emerald-300 disabled:opacity-40">Post</button></div>}
      {!expanded ? (
        <div className="overflow-hidden">
          <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${page * 100}%)` }}>
            {pages.map((group, index) => (
              <div key={index} className="grid w-full shrink-0 grid-cols-1 gap-1.5 min-[501px]:grid-cols-2 xl:grid-cols-3">
                {group.map(renderReview)}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto">
          <div className="grid grid-cols-1 gap-1.5 min-[501px]:grid-cols-2 xl:grid-cols-3">{reviews.map(renderReview)}</div>
        </div>
      )}
      {!expanded && pageGroups.length > 1 && <div className="flex justify-center gap-1">{pageGroups.map((_, index) => <button key={index} type="button" aria-label={`Review group ${index + 1}`} onClick={() => setPage(index)} className={`h-1 w-3 rounded-full ${page % pageGroups.length === index ? 'bg-emerald-400' : 'bg-zinc-700'}`} />)}</div>}
    </section>
  );
}
