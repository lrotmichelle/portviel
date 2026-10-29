'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Ellipsis, Heart, MessageCircle, Search, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ReviewReply {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
  likedBy: string[];
  replies: ReviewReply[];
  replyToName?: string;
}

interface ProfileReview {
  id: string;
  authorId: string;
  authorName: string;
  authorImage: string | null;
  stars: number;
  text: string;
  createdAt: string;
  likedBy: string[];
  replies: ReviewReply[];
}

interface RatingComponentProps {
  onRatingSubmit: (rating: number) => void;
  className?: string;
  accountId?: string;
  viewerId?: string;
  viewerName?: string;
  viewerImage?: string | null;
}

function timeSince(dateString: string) {
  const elapsed = Math.max(0, Date.now() - new Date(dateString).getTime());
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

const createReviewId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function RatingComponent({
  onRatingSubmit,
  className = '',
  accountId = '',
  viewerId = 'guest',
  viewerName = 'PortVille member',
  viewerImage = null,
}: RatingComponentProps) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState<ProfileReview[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewSearch, setReviewSearch] = useState('');
  const [marqueeIndex, setMarqueeIndex] = useState(0);
  const [marqueeTransition, setMarqueeTransition] = useState(true);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ reviewId: string; replyId?: string } | null>(null);
  const [replyText, setReplyText] = useState('');
  const marqueeIndexRef = useRef(0);

  const reviewStorageKey = `profile-reviews-${accountId}`;

  useEffect(() => {
    marqueeIndexRef.current = 0;
    setMarqueeIndex(0);
  }, [reviews.length, showAllReviews]);

  useEffect(() => {
    if (showAllReviews || reviews.length < 2) return;
    let resetTimer: ReturnType<typeof setTimeout> | undefined;
    const interval = setInterval(() => {
      const currentIndex = marqueeIndexRef.current;
      if (currentIndex >= reviews.length - 1) {
        marqueeIndexRef.current = reviews.length;
        setMarqueeIndex(reviews.length);
        resetTimer = setTimeout(() => {
          setMarqueeTransition(false);
          marqueeIndexRef.current = 0;
          setMarqueeIndex(0);
          requestAnimationFrame(() => setMarqueeTransition(true));
        }, 550);
      } else {
        const nextIndex = currentIndex + 1;
        marqueeIndexRef.current = nextIndex;
        setMarqueeIndex(nextIndex);
      }
    }, 5000);
    return () => {
      clearInterval(interval);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, [reviews.length, showAllReviews]);

  useEffect(() => {
    const storedRating = localStorage.getItem(`rated-${window.location.pathname}`);
    if (storedRating) {
      setHasRated(true);
      setSelectedStar(Number.parseInt(storedRating, 10));
    }

    const storedReviews = localStorage.getItem(reviewStorageKey);
    if (storedReviews) {
      try {
        const parsed = JSON.parse(storedReviews) as ProfileReview[];
        const normalizeReply = (reply: ReviewReply): ReviewReply => ({
          ...reply,
          likedBy: Array.isArray(reply.likedBy) ? reply.likedBy : [],
          replies: Array.isArray(reply.replies) ? reply.replies.map(normalizeReply) : [],
        });
        setReviews(parsed.map((review) => ({
          ...review,
          likedBy: Array.isArray(review.likedBy) ? review.likedBy : [],
          replies: Array.isArray(review.replies) ? review.replies.map(normalizeReply) : [],
        })));
        return;
      } catch {
        localStorage.removeItem(reviewStorageKey);
      }
    }

    // Migrate the first single-review format used by the earlier profile preview.
    const legacyReview = accountId ? localStorage.getItem(`profile-review-${accountId}`) : null;
    if (legacyReview) {
      const migrated: ProfileReview = {
        id: `review-${Date.now()}`,
        authorId: viewerId,
        authorName: viewerName,
        authorImage: viewerImage,
        stars: Number(storedRating) || 5,
        text: legacyReview.trim().slice(0, 100),
        createdAt: new Date().toISOString(),
        likedBy: [],
        replies: [],
      };
      setReviews([migrated]);
      localStorage.setItem(reviewStorageKey, JSON.stringify([migrated]));
    }
  }, [accountId, reviewStorageKey, viewerId, viewerName, viewerImage]);

  const persistReviews = (nextReviews: ProfileReview[]) => {
    setReviews(nextReviews);
    localStorage.setItem(reviewStorageKey, JSON.stringify(nextReviews));
  };

  const handleRating = (star: number) => {
    if (hasRated) {
      setSelectedStar(star);
      return;
    }
    setSelectedStar(star);
    setHasRated(true);
    localStorage.setItem(`rated-${window.location.pathname}`, star.toString());
    onRatingSubmit(star);
  };

  const submitReview = () => {
    const text = reviewText.trim().slice(0, 100);
    if (!text || !accountId) return;
    const now = new Date().toISOString();
    if (editingReviewId) {
      persistReviews(reviews.map((review) => review.id === editingReviewId ? { ...review, text } : review));
    } else {
      persistReviews([{
        id: `review-${Date.now()}`,
        authorId: viewerId,
        authorName: viewerName,
        authorImage: viewerImage,
        stars: selectedStar || 5,
        text,
        createdAt: now,
        likedBy: [],
        replies: [],
      }, ...reviews]);
    }
    setReviewText('');
    setEditingReviewId(null);
    setIsReviewOpen(false);
  };

  const startEdit = (review: ProfileReview) => {
    setEditingReviewId(review.id);
    setReviewText(review.text.slice(0, 100));
    setIsReviewOpen(true);
    setOpenMenuId(null);
  };

  const deleteReview = (reviewId: string) => {
    persistReviews(reviews.filter((review) => review.id !== reviewId));
    setOpenMenuId(null);
  };

  const toggleLike = (review: ProfileReview) => {
    const hasLiked = review.likedBy.includes(viewerId);
    persistReviews(reviews.map((item) => item.id === review.id ? {
      ...item,
      likedBy: hasLiked ? item.likedBy.filter((id) => id !== viewerId) : [...item.likedBy, viewerId],
    } : item));
  };

  const submitReply = (review: ProfileReview) => {
    const text = replyText.trim().slice(0, 100);
    if (!text) return;
    const targetReply = replyingTo?.replyId ? findReply(review.replies, replyingTo.replyId) : null;
    const reply: ReviewReply = {
      id: createReviewId('reply'),
      authorId: viewerId,
      authorName: viewerName,
      text,
      createdAt: new Date().toISOString(),
      likedBy: [],
      replies: [],
      ...(targetReply ? { replyToName: targetReply.authorName } : {}),
    };
    const addReply = (replies: ReviewReply[]): ReviewReply[] => {
      if (!replyingTo?.replyId) return [...replies, reply];
      return replies.map((item) => item.id === replyingTo.replyId
        ? { ...item, replies: [...item.replies, reply] }
        : { ...item, replies: addReply(item.replies) });
    };
    persistReviews(reviews.map((item) => item.id === review.id ? { ...item, replies: addReply(item.replies) } : item));
    setReplyText('');
    setReplyingTo(null);
    setOpenMenuId(null);
  };

  const findReply = (replies: ReviewReply[], replyId: string): ReviewReply | null => {
    for (const reply of replies) {
      if (reply.id === replyId) return reply;
      const nested = findReply(reply.replies, replyId);
      if (nested) return nested;
    }
    return null;
  };

  const updateReplyTree = (replies: ReviewReply[], replyId: string, update: (reply: ReviewReply) => ReviewReply): ReviewReply[] => replies.map((reply) => reply.id === replyId
    ? update(reply)
    : { ...reply, replies: updateReplyTree(reply.replies, replyId, update) });

  const toggleReplyLike = (reviewId: string, replyId: string) => {
    persistReviews(reviews.map((review) => review.id === reviewId ? {
      ...review,
      replies: updateReplyTree(review.replies, replyId, (reply) => {
        const liked = reply.likedBy.includes(viewerId);
        return { ...reply, likedBy: liked ? reply.likedBy.filter((id) => id !== viewerId) : [...reply.likedBy, viewerId] };
      }),
    } : review));
  };

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 1);
  const searchTerm = reviewSearch.trim().toLowerCase();
  const searchedReviews = visibleReviews.filter((review) => {
    if (!searchTerm) return true;
    const replyTextContent = (replies: ReviewReply[]): string => replies.map((reply) => `${reply.authorName} ${reply.replyToName ?? ''} ${reply.text} ${replyTextContent(reply.replies)}`).join(' ');
    return `${review.authorName} ${review.text} ${replyTextContent(review.replies)}`.toLowerCase().includes(searchTerm);
  });

  const renderReplyTree = (review: ProfileReview, replies: ReviewReply[], depth = 0): React.ReactNode => replies.map((reply) => {
    const liked = reply.likedBy.includes(viewerId);
    const isReplying = replyingTo?.reviewId === review.id && replyingTo.replyId === reply.id;
    return (
      <div key={reply.id} className={`mt-2 border-l border-zinc-700 pl-2.5 ${depth > 2 ? 'ml-1' : 'ml-2'}`}>
        <p className="break-words text-[10px] leading-relaxed text-zinc-400">
          <Link href={`/profile/${encodeURIComponent(`acc-${reply.authorId}`)}`} className="font-semibold text-zinc-200 hover:text-emerald-300 hover:underline">{reply.authorName}</Link>
          {reply.replyToName && <span className="text-zinc-500"> {' '}to {reply.replyToName}</span>}{': '}{reply.text.slice(0, 100)}
          <time className="ml-1 text-zinc-600">· {timeSince(reply.createdAt)}</time>
        </p>
        <div className="mt-1 flex items-center gap-3">
          <button type="button" onClick={() => toggleReplyLike(review.id, reply.id)} aria-pressed={liked} className={`inline-flex items-center gap-1 text-[9px] ${liked ? 'text-rose-300' : 'text-zinc-500 hover:text-rose-300'}`}><Heart className={`h-3 w-3 ${liked ? 'fill-rose-300' : ''}`} />{reply.likedBy.length}</button>
          <button type="button" onClick={() => { setReplyingTo(isReplying ? null : { reviewId: review.id, replyId: reply.id }); setReplyText(''); }} className="inline-flex items-center gap-1 text-[9px] text-zinc-500 hover:text-emerald-300"><MessageCircle className="h-3 w-3" />Reply{reply.replies.length > 0 ? ` · ${reply.replies.length}` : ''}</button>
        </div>
        {isReplying && <div className="mt-2 flex gap-2"><input value={replyText} onChange={(event) => setReplyText(event.target.value)} maxLength={100} placeholder={`Reply to ${reply.authorName}…`} className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-2 text-[10px] text-white outline-none focus:border-emerald-500/60" /><button type="button" onClick={() => submitReply(review)} disabled={!replyText.trim()} className="rounded-lg border border-emerald-500/40 px-2.5 text-[10px] font-semibold text-emerald-300 disabled:opacity-50">Send</button></div>}
        {renderReplyTree(review, reply.replies, depth + 1)}
      </div>
    );
  });

  return (
    <section className={`w-full ${className}`} aria-label="Profile ratings and reviews">
      <div className="flex w-full min-w-0 items-center justify-between gap-1.5 sm:gap-2">
        <div className="flex min-w-0 items-center gap-1.5" aria-label="Rate this account">
          <div className="flex shrink-0 items-center gap-0">
          {[1, 2, 3, 4, 5].map((star) => {
            const active = star <= (hoveredStar || selectedStar);
            return (
              <button
                key={star}
                type="button"
                disabled={hasRated}
                aria-label={`Rate ${star} out of 5`}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => handleRating(star)}
                className="shrink-0 p-0 disabled:cursor-not-allowed"
              >
                <Star className={`h-4 w-4 sm:h-5 sm:w-5 ${active ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}`} />
              </button>
            );
          })}
          </div>
          <span className="shrink-0 whitespace-nowrap text-[8px] font-medium text-zinc-500 sm:text-[9px]">Rate account</span>
        </div>
        <button type="button" onClick={() => { setEditingReviewId(null); setReviewText(''); setIsReviewOpen(true); }} className="inline-flex shrink-0 items-center justify-center rounded-lg border border-emerald-500/40 px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 sm:px-4">
          Review
        </button>
      </div>

      {reviews.length > 0 && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">Reviews <span className="text-zinc-600">({reviews.length})</span></h3>
            <button type="button" onClick={() => { setShowAllReviews((show) => !show); marqueeIndexRef.current = 0; setMarqueeIndex(0); }} className="text-[10px] font-semibold text-emerald-300 hover:text-emerald-200">{showAllReviews ? 'Show less' : 'View all'}</button>
          </div>

          {showAllReviews && (
            <label className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 focus-within:border-emerald-500/60">
              <Search className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
              <input value={reviewSearch} onChange={(event) => setReviewSearch(event.target.value)} placeholder="Search reviews and replies…" className="min-w-0 flex-1 bg-transparent text-xs text-zinc-200 outline-none placeholder:text-zinc-600" />
            </label>
          )}

          <div className={showAllReviews ? 'space-y-2' : 'overflow-hidden'}>
          <div className={`${showAllReviews ? 'flex flex-col gap-2' : 'flex'} ${marqueeTransition ? 'transition-transform duration-500 ease-in-out motion-reduce:transition-none' : 'transition-none'}`} style={!showAllReviews ? { transform: `translateX(-${marqueeIndex * 100}%)` } : undefined}>
          {(showAllReviews ? searchedReviews : reviews.length > 1 ? [...reviews, reviews[0]] : reviews).map((review, reviewIndex) => {
            const isAuthor = review.authorId === viewerId;
            const liked = review.likedBy.includes(viewerId);
            return (
              <article key={`${review.id}-${reviewIndex}`} className={`${showAllReviews ? 'w-full' : 'w-full shrink-0'} rounded-xl bg-zinc-900/70 p-3`}>
                <header className="flex min-w-0 items-start justify-between gap-2">
                  <Link href={`/profile/${encodeURIComponent(`acc-${review.authorId}`)}`} className="group flex min-w-0 items-center gap-2 rounded-lg border border-transparent p-1 transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/10 focus-visible:border-emerald-500/50 focus-visible:bg-emerald-500/10 focus-visible:outline-none">
                    {review.authorImage ? <Image src={review.authorImage} alt={`${review.authorName} profile`} width={36} height={36} unoptimized className="h-9 w-9 shrink-0 rounded-full border border-transparent object-cover transition-colors group-hover:border-emerald-400" /> : <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-transparent bg-emerald-500/15 text-[10px] font-bold text-emerald-300 transition-colors group-hover:border-emerald-400">{review.authorName.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>}
                    <span className="min-w-0"><span className="block truncate text-xs font-semibold text-white group-hover:text-emerald-200">{review.authorName}</span><span className="mt-0.5 flex items-center gap-1.5"><span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-300"><Star className="h-3 w-3 fill-amber-300" />{review.stars}/5</span><time className="text-[9px] text-zinc-500">{timeSince(review.createdAt)}</time></span></span>
                  </Link>
                  <div className="relative shrink-0">
                    <button type="button" aria-label="Review options" aria-expanded={openMenuId === review.id} onClick={() => setOpenMenuId((id) => id === review.id ? null : review.id)} className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"><Ellipsis className="h-4 w-4" /></button>
                    {openMenuId === review.id && <div className="absolute right-0 top-full z-20 mt-1 min-w-24 rounded-lg border border-zinc-700 bg-zinc-950 p-1 shadow-xl">
                      {isAuthor ? <>
                        <button type="button" onClick={() => startEdit(review)} className="block w-full rounded px-2 py-1.5 text-left text-[10px] text-zinc-200 hover:bg-zinc-800">Edit</button>
                        <button type="button" onClick={() => deleteReview(review.id)} className="block w-full rounded px-2 py-1.5 text-left text-[10px] text-rose-300 hover:bg-zinc-800">Delete</button>
                      </> : <button type="button" onClick={() => { setReplyingTo({ reviewId: review.id }); setOpenMenuId(null); }} className="block w-full rounded px-2 py-1.5 text-left text-[10px] text-zinc-200 hover:bg-zinc-800">Reply</button>}
                    </div>}
                  </div>
                </header>
                <p className="mt-2 break-words text-xs leading-relaxed text-zinc-300">{review.text.slice(0, 100)}</p>
                <div className="mt-2 flex items-center gap-3">
                  <button type="button" onClick={() => toggleLike(review)} aria-pressed={liked} className={`inline-flex items-center gap-1 text-[10px] ${liked ? 'text-rose-300' : 'text-zinc-500 hover:text-rose-300'}`}><Heart className={`h-3.5 w-3.5 ${liked ? 'fill-rose-300' : ''}`} />{review.likedBy.length}</button>
                  <button type="button" onClick={() => { setReplyingTo(replyingTo?.reviewId === review.id && !replyingTo.replyId ? null : { reviewId: review.id }); setReplyText(''); }} className="inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-emerald-300"><MessageCircle className="h-3.5 w-3.5" />Reply{review.replies.length > 0 ? ` · ${review.replies.length}` : ''}</button>
                </div>
                {replyingTo?.reviewId === review.id && !replyingTo.replyId && <div className="mt-2 flex gap-2"><input value={replyText} onChange={(event) => setReplyText(event.target.value)} maxLength={100} placeholder="Write a reply…" className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-2 text-[10px] text-white outline-none focus:border-emerald-500/60" /><button type="button" onClick={() => submitReply(review)} disabled={!replyText.trim()} className="rounded-lg border border-emerald-500/40 px-2.5 text-[10px] font-semibold text-emerald-300 disabled:opacity-50">Send</button></div>}
                {renderReplyTree(review, review.replies)}
              </article>
            );
          })}
          {showAllReviews && searchedReviews.length === 0 && <p className="w-full rounded-xl bg-zinc-900/70 p-4 text-center text-xs text-zinc-500">No reviews or replies match “{reviewSearch}”.</p>}
          </div>
          </div>
          {!showAllReviews && reviews.length > 1 && (
            <div className="mt-2 flex items-center justify-center gap-1.5" aria-label={`Review ${Math.min(marqueeIndex + 1, reviews.length)} of ${reviews.length}`}>
              {reviews.map((review, index) => {
                const activeIndex = marqueeIndex >= reviews.length ? 0 : marqueeIndex;
                return <button key={review.id} type="button" onClick={() => { marqueeIndexRef.current = index; setMarqueeIndex(index); }} aria-label={`Show review ${index + 1}`} aria-current={activeIndex === index ? 'true' : undefined} className={`h-1.5 rounded-full transition-all ${activeIndex === index ? 'w-4 bg-emerald-400' : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'}`} />;
              })}
            </div>
          )}
        </div>
      )}

      {isReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" role="presentation" onClick={() => setIsReviewOpen(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="profile-review-title" onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-950 p-4 shadow-2xl">
            <h2 id="profile-review-title" className="text-sm font-bold text-white">{editingReviewId ? 'Edit review' : 'Write a review'}</h2>
            <p className="mt-1 text-xs text-zinc-400">Rate the account first, then add a comment up to 100 characters.</p>
            <div className="mt-3 flex items-center gap-1" aria-label="Choose a rating before submitting a review">
              {[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" aria-label={`Rate ${star} out of 5`} onClick={() => handleRating(star)} className="p-0.5"><Star className={`h-6 w-6 ${star <= (hoveredStar || selectedStar) ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}`} /></button>)}
              <span className="ml-1 text-[10px] text-zinc-500">{selectedStar ? `${selectedStar}/5` : 'Required'}</span>
            </div>
            <textarea value={reviewText} onChange={(event) => setReviewText(event.target.value.slice(0, 100))} rows={3} maxLength={100} placeholder={selectedStar ? 'Share your experience…' : 'Choose a star rating first'} disabled={!selectedStar} className="mt-3 w-full resize-none rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-emerald-500/60 disabled:cursor-not-allowed disabled:opacity-50" />
            <div className="mt-1 text-right text-[10px] text-zinc-500">{reviewText.length}/100</div>
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={() => { setIsReviewOpen(false); setEditingReviewId(null); }} className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800">Cancel</button>
              <button type="button" onClick={submitReview} disabled={!selectedStar || !reviewText.trim()} className="rounded-lg border border-emerald-500/40 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50">{editingReviewId ? 'Save changes' : 'Submit review'}</button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
