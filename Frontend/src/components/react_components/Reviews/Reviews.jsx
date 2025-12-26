import { useState, useMemo } from 'react';
import { useAuthen } from '@/context/AuthenProvider';
import { useReviewsList, useReplies, useReviewActions } from '@/hooks/reviews/useReviews';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Trash2, Send, ChevronDown, ChevronUp, User as UserIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function ReviewItem({ item, isOwner, onVote, filmId, type, user }) {
  const [open, setOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  const {
    data: repliesData,
    isLoading: loadingReplies,
    isError: errorReplies,
    fetchNextPage: fetchNextRepliesPage,
    hasNextPage: hasNextReplies,
    isFetchingNextPage: isFetchingNextReplies,
  } = useReplies(item.id, open);
  
  const replies = repliesData?.pages?.flat() || [];
  
  const { createReply, vote, deleteReview } = useReviewActions(filmId, type);

  const handleVote = (value) => {
    if (!user) return onVote?.('auth');
    const current = item.likedByMe ? 1 : item.disLikedByMe ? -1 : 0;
    const next = current === value ? 0 : value;
    vote.mutate({ reviewId: item.id, value: next });
  };

  const handleReply = () => {
    if (!user) return onVote?.('auth');
    if (!replyText.trim()) return;
    createReply.mutate({ content: replyText.trim(), replyToId: item.id });
    setReplyText('');
    if (!open) setOpen(true);
  };

  const handleDelete = () => {
    deleteReview.mutate({ reviewId: item.id, parentId: null });
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur p-4 md:p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center shrink-0">
          <UserIcon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-800 dark:text-white">{item.user?.username || item.user?.email || 'Unknown'}</span>
            <span className="opacity-60">•</span>
            <span>{formatDate(item.createdAt)}</span>
          </div>
          <p className="mt-2 text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{item.content}</p>

          <div className="mt-3 flex items-center gap-3">
            <div
              className={cn(
                'inline-flex items-center rounded-full border px-1 py-0.5 shadow-sm backdrop-blur transition-colors',
                'border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-950/40',
              )}
            >
              <motion.button
                type="button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className={cn(
                  'h-9 w-9 rounded-full grid place-items-center transition-colors',
                  'text-slate-500 hover:bg-orange-500/10 hover:text-orange-600 dark:hover:bg-orange-500/15',
                  item.likedByMe && 'bg-orange-500/15 text-orange-600 dark:bg-orange-500/20',
                )}
                onClick={() => handleVote(1)}
              >
                <ArrowBigUp className={cn('w-5 h-5', item.likedByMe && 'fill-orange-500')} />
              </motion.button>

              <motion.span
                key={Number.isFinite(item.score) ? item.score : 0}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className={cn(
                  'min-w-[2.5ch] px-1 text-sm font-extrabold tabular-nums text-center',
                  item.likedByMe
                    ? 'text-orange-600'
                    : item.disLikedByMe
                      ? 'text-blue-600'
                      : 'text-slate-800 dark:text-slate-200',
                )}
              >
                {Number.isFinite(item.score) ? item.score : 0}
              </motion.span>

              <motion.button
                type="button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className={cn(
                  'h-9 w-9 rounded-full grid place-items-center transition-colors',
                  'text-slate-500 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:bg-blue-500/15',
                  item.disLikedByMe && 'bg-blue-500/15 text-blue-600 dark:bg-blue-500/20',
                )}
                onClick={() => handleVote(-1)}
              >
                <ArrowBigDown className={cn('w-5 h-5', item.disLikedByMe && 'fill-blue-500')} />
              </motion.button>
            </div>

            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setOpen((v) => !v)}>
              <MessageSquare className="w-4 h-4" />
              {item.replyCount || 0}
              {open ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
            </Button>

            {isOwner && (
              <Button variant="destructive" size="sm" className="ml-auto" onClick={handleDelete} disabled={deleteReview.isPending}>
                {deleteReview.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span className="ml-1">Delete</span>
              </Button>
            )}
          </div>

          {open && (
            <div className="mt-4 pl-3 border-l-2 border-slate-200 dark:border-slate-800">
              {loadingReplies ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : errorReplies ? (
                <ErrorState title="Failed to load replies" message="Please try again later" fullScreen={false} showHomeButton={false} />
              ) : replies.length > 0 ? (
                <div className="space-y-3">
                  {replies.map((rep) => (
                    <div key={rep.id} className="">
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                          <UserIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-medium text-slate-700 dark:text-slate-200">{rep.user?.username || rep.user?.email}</span>
                            <span className="opacity-60">•</span>
                            <span>{formatDate(rep.createdAt)}</span>
                          </div>
                          <p className="mt-1 text-slate-700 dark:text-slate-200 text-sm">{rep.content}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <div
                              className={cn(
                                'inline-flex items-center rounded-full border px-1 py-0.5 shadow-sm',
                                'border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-950/30',
                              )}
                            >
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.92 }}
                                className={cn(
                                  'h-8 w-8 rounded-full grid place-items-center transition-colors',
                                  'text-slate-500 hover:bg-orange-500/10 hover:text-orange-600 dark:hover:bg-orange-500/15',
                                  rep.likedByMe && 'bg-orange-500/15 text-orange-600 dark:bg-orange-500/20',
                                )}
                                onClick={() => {
                                  if (!user) return onVote?.('auth');
                                  const current = rep.likedByMe ? 1 : rep.disLikedByMe ? -1 : 0;
                                  const next = current === 1 ? 0 : 1;
                                  vote.mutate({ reviewId: rep.id, value: next, parentId: item.id });
                                }}
                              >
                                <ArrowBigUp className={cn('w-4 h-4', rep.likedByMe && 'fill-orange-500')} />
                              </motion.button>

                              <motion.span
                                key={Number.isFinite(rep.score) ? rep.score : 0}
                                initial={{ opacity: 0, y: 3 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.18 }}
                                className={cn(
                                  'min-w-[2.5ch] px-1 text-xs font-extrabold tabular-nums text-center',
                                  rep.likedByMe
                                    ? 'text-orange-600'
                                    : rep.disLikedByMe
                                      ? 'text-blue-600'
                                      : 'text-slate-700 dark:text-slate-200',
                                )}
                              >
                                {Number.isFinite(rep.score) ? rep.score : 0}
                              </motion.span>

                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.92 }}
                                className={cn(
                                  'h-8 w-8 rounded-full grid place-items-center transition-colors',
                                  'text-slate-500 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:bg-blue-500/15',
                                  rep.disLikedByMe && 'bg-blue-500/15 text-blue-600 dark:bg-blue-500/20',
                                )}
                                onClick={() => {
                                  if (!user) return onVote?.('auth');
                                  const current = rep.likedByMe ? 1 : rep.disLikedByMe ? -1 : 0;
                                  const next = current === -1 ? 0 : -1;
                                  vote.mutate({ reviewId: rep.id, value: next, parentId: item.id });
                                }}
                              >
                                <ArrowBigDown className={cn('w-4 h-4', rep.disLikedByMe && 'fill-blue-500')} />
                              </motion.button>
                            </div>
                            {user && user.id === rep.user?.id && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteReview.mutate({ reviewId: rep.id, parentId: item.id })}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Load more replies button */}
                  {hasNextReplies && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchNextRepliesPage()}
                        disabled={isFetchingNextReplies}
                        className="w-full"
                      >
                        {isFetchingNextReplies ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load more replies'}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key="empty-replies"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.22 }}
                    className="rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/20 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center"
                      >
                        <MessageSquare className="w-4 h-4 text-slate-500" />
                      </motion.div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">No replies yet</div>
                        <div className="text-xs text-muted-foreground">Start the conversation with a quick reply.</div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Reply composer */}
              {user ? (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    className="flex-1 rounded-md bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm outline-none border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleReply();
                      }
                    }}
                  />
                  <Button size="sm" onClick={handleReply} disabled={createReply.isPending}>
                    {createReply.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Reviews({ filmId, type, episodeMetadata = null }) {
  const { user, setShowLoginModal } = useAuthen();
  const [content, setContent] = useState('');
  const [sort, setSort] = useState('top');

  // Validate filmId is a valid positive integer
  const validFilmId = Number.isInteger(Number(filmId)) && Number(filmId) > 0;
  if (!validFilmId) {
    return <ErrorState 
      title="Invalid Content" 
      message="Unable to load reviews - invalid content ID" 
      fullScreen={false} 
      showHomeButton={false} 
    />;
  }

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useReviewsList(filmId, type, episodeMetadata);

  const { createReview } = useReviewActions(filmId, type, episodeMetadata);
  
  const items = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.content);
  }, [data]);

  const sortedItems = useMemo(() => {
    let list = Array.isArray(items) ? [...items] : [];
    
    // Filter by episode metadata if provided
    // Support partial matches: season-only, episode-only, or both
    if (type === 'SERIES' && episodeMetadata) {
      const hasSeasonNumber = typeof episodeMetadata.seasonNumber === 'number';
      const hasEpisodeNumber = typeof episodeMetadata.episodeNumber === 'number';
      
      if (hasSeasonNumber && hasEpisodeNumber) {
        // Filter by exact season + episode
        list = list.filter(item => 
          item.episodeSeasonNumber === episodeMetadata.seasonNumber && 
          item.episodeNumber === episodeMetadata.episodeNumber
        );
      } else if (hasSeasonNumber) {
        // Filter by season only (any episode in that season)
        list = list.filter(item => 
          item.episodeSeasonNumber === episodeMetadata.seasonNumber
        );
      } else if (hasEpisodeNumber) {
        // Filter by episode only (any season with that episode number)
        list = list.filter(item => 
          item.episodeNumber === episodeMetadata.episodeNumber
        );
      }
    }
    
    const byDateAsc = (a, b) => {
      const at = new Date(a?.createdAt || 0).getTime();
      const bt = new Date(b?.createdAt || 0).getTime();
      return at - bt;
    };
    const byDateDesc = (a, b) => -byDateAsc(a, b);

    if (sort === 'new') return list.sort(byDateDesc);
    if (sort === 'old') return list.sort(byDateAsc);
    return list.sort((a, b) => {
      const as = typeof a?.score === 'number' ? a.score : 0;
      const bs = typeof b?.score === 'number' ? b.score : 0;
      if (bs !== as) return bs - as;
      return byDateDesc(a, b);
    });
  }, [items, sort, episodeMetadata, type]);

  if (isLoading) {
    return <LoadingState title="Loading Reviews" subtitle="Getting latest reviews..." fullScreen={false} className="py-6" />;
  }

  if (isError) {
    return <ErrorState title="Failed to load reviews" message="Please try again later" fullScreen={false} showHomeButton={false} />;
  }

  const handleCreate = () => {
    if (!user) {
      setShowLoginModal?.(true);
      return;
    }
    if (!content.trim()) return;
    createReview.mutate(content.trim());
    setContent('');
  };

  return (
    <div className="space-y-4">
      {/* Composer */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur p-4">
        {user ? (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <textarea
                className="w-full min-h-[60px] rounded-md bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm outline-none border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                placeholder={`Share your thoughts about this ${type === 'MOVIE' ? 'movie' : 'show'}...`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="mt-2 flex justify-end">
                <Button onClick={handleCreate} disabled={createReview.isPending}>
                  {createReview.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />} Submit
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Sign in to write a review and vote.</p>
            <Button onClick={() => setShowLoginModal?.(true)}>Sign in</Button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key="empty-reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-950/30 dark:to-slate-900/20 p-6"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <motion.div
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-lg"
                  animate={{ rotate: [0, -2, 2, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <MessageSquare className="w-6 h-6" />
                </motion.div>
                <div className="flex-1">
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white">No reviews yet</div>
                  <div className="text-sm text-muted-foreground">Be the first to share what you think. Upvotes help surface the best takes.</div>
                  <div className="mt-3 flex items-center gap-2">
                    <motion.div
                      className="h-1.5 w-1.5 rounded-full bg-blue-500"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                      className="h-1.5 w-1.5 rounded-full bg-purple-500"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                    />
                    <motion.div
                      className="h-1.5 w-1.5 rounded-full bg-indigo-500"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                    />
                  </div>
                </div>
                {!user ? (
                  <Button onClick={() => setShowLoginModal?.(true)} className="shrink-0">Sign in to review</Button>
                ) : null}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{sortedItems.length} Reviews</div>
              <div className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/30 p-1">
                <Button
                  variant={sort === 'top' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setSort('top')}
                >
                  Top
                </Button>
                <Button
                  variant={sort === 'new' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setSort('new')}
                >
                  New
                </Button>
                <Button
                  variant={sort === 'old' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setSort('old')}
                >
                  Old
                </Button>
              </div>
            </div>

            {sortedItems.map((item) => (
              <ReviewItem
                key={item.id}
                item={item}
                isOwner={user && user.id === item.user?.id}
                filmId={filmId}
                type={type}
                user={user}
                onVote={(why) => why === 'auth' && setShowLoginModal?.(true)}
              />
            ))}
          </>
        )}
      </div>

      {hasNextPage && (
        <div className="pt-2">
          <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="w-full md:w-auto">
            {isFetchingNextPage ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load more reviews'}
          </Button>
        </div>
      )}
    </div>
  );
}
