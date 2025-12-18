import { useState, useMemo } from 'react';
import { useAuthen } from '@/context/AuthenProvider';
import { useReviewsList, useReplies, useReviewActions } from '@/hooks/reviews/useReviews';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import { ThumbsUp, ThumbsDown, MessageSquare, Trash2, Send, ChevronDown, ChevronUp, User as UserIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function ReviewItem({ item, isOwner, onVote, onDelete, filmId, type, user }) {
  const [open, setOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  const { data: replies, isLoading: loadingReplies, isError: errorReplies } = useReplies(item.id, open);
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

          <div className="mt-3 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className={cn('gap-1', item.likedByMe && 'border-blue-500 text-blue-600')}
              onClick={() => handleVote(1)}
              disabled={false}
            >
              <ThumbsUp className="w-4 h-4" /> Like
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn('gap-1', item.disLikedByMe && 'border-rose-500 text-rose-600')}
              onClick={() => handleVote(-1)}
              disabled={false}
            >
              <ThumbsDown className="w-4 h-4" /> Dislike
            </Button>

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
              ) : Array.isArray(replies) && replies.length > 0 ? (
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
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn('gap-1', rep.likedByMe && 'border-blue-500 text-blue-600')}
                              onClick={() => {
                                if (!user) return onVote?.('auth');
                                const current = rep.likedByMe ? 1 : rep.disLikedByMe ? -1 : 0;
                                const next = current === 1 ? 0 : 1;
                                vote.mutate({ reviewId: rep.id, value: next, parentId: item.id });
                              }}
                            >
                              <ThumbsUp className="w-3 h-3" /> Like
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn('gap-1', rep.disLikedByMe && 'border-rose-500 text-rose-600')}
                              onClick={() => {
                                if (!user) return onVote?.('auth');
                                const current = rep.likedByMe ? 1 : rep.disLikedByMe ? -1 : 0;
                                const next = current === -1 ? 0 : -1;
                                vote.mutate({ reviewId: rep.id, value: next, parentId: item.id });
                              }}
                            >
                              <ThumbsDown className="w-3 h-3" /> Dislike
                            </Button>
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
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No replies yet.</div>
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

export default function Reviews({ filmId, type }) {
  const { user, setShowLoginModal } = useAuthen();
  const [content, setContent] = useState('');

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useReviewsList(filmId, type);

  const { createReview } = useReviewActions(filmId, type);

  const items = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flat();
  }, [data]);

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
          <div className="text-muted-foreground">No reviews yet. Be the first to write one!</div>
        ) : (
          items.map((item) => (
            <ReviewItem
              key={item.id}
              item={item}
              isOwner={user && user.id === item.user?.id}
              filmId={filmId}
              type={type}
              user={user}
              onVote={(why) => why === 'auth' && setShowLoginModal?.(true)}
            />
          ))
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
