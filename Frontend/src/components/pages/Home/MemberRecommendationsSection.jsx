import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Sparkles, Check, Loader2, Plus } from 'lucide-react';
import { useAuthen } from '@/context/AuthenProvider';
import { LoginNotificationModal } from '@/components/react_components/Modal/LoginNotificationModal';
import { useMemberRecommendations } from '@/hooks/API/recommendations';
import { useRecommendationsFreshness } from '@/hooks/API/useRecommendationsFreshness';
import RecommendationFreshnessBanner from '@/components/ui/RecommendationFreshnessBanner';
import MovieGrid from '@/components/ui/MovieGrid';
import useWatchlist from '@/hooks/watchList/useWatchList';
import useAddToWatchlist from '@/hooks/watchList/useAddtoWatchList';
import { useRecommendationFreshnessContext } from '@/context/RecommendationFreshnessProvider';

const Motion = motion;
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';

function resolveBackdrop(imagePath) {
    if (!imagePath || typeof imagePath !== 'string') {
        return '/placeholder.svg';
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    return `${TMDB_IMAGE_BASE}${imagePath}`;
}

function normalizeRecommendations(items) {
    if (!Array.isArray(items)) {
        return [];
    }

    return items
        .map((item) => {
            const recommendationType = String(item?.type || '').toUpperCase() === 'SERIES' ? 'SERIES' : 'MOVIE';
            const dateValue = item?.date ? String(item.date) : '';

            return {
                id: Number(item?.filmId),
                type: recommendationType,
                title: item?.title || 'Untitled',
                year: dateValue ? dateValue.slice(0, 4) : '',
                image: resolveBackdrop(item?.backgroundImg),
            };
        })
        .filter((item) => Number.isInteger(item.id) && item.id > 0);
}

function MemberFeatureChip() {
    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/70 bg-emerald-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-800 shadow-sm dark:border-emerald-500/40 dark:bg-emerald-900/30 dark:text-emerald-200">
            <span className="relative inline-flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-70 animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            Member feature
        </div>
    );
}

function RecommendationSkeletonCard({ index }) {
    return (
        <Motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 dark:border-slate-700/50 dark:bg-slate-800/60"
        >
            <div className="aspect-[3/4] w-full animate-pulse bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-2 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
        </Motion.div>
    );
}

function RecommendationCard({ item, index, onOpen, isInWatchlist, onAddToWatchlist, isAdding, freshnessPhase, lastAddedItem }) {
    const isJustAdded = lastAddedItem && lastAddedItem.id === item.id && lastAddedItem.type === item.type;

    return (
        <Motion.div
            onClick={() => onOpen(item)}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.985 }}
            className="group cursor-pointer relative flex flex-col overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-white to-emerald-50/40 text-left shadow-lg shadow-emerald-100/40 transition-all duration-300 hover:border-emerald-300/80 hover:shadow-xl hover:shadow-emerald-100/60 dark:border-emerald-500/25 dark:from-slate-900 dark:to-emerald-950/20 dark:shadow-emerald-950/20 dark:hover:border-emerald-500/40 dark:hover:shadow-emerald-950/40 w-full"
        >
            {/* Poster — 3:4 ratio */}
            <div className="relative aspect-[3/4] w-full overflow-hidden">
                <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-600 ease-out group-hover:scale-[1.04]"
                    loading="lazy"
                    onError={(event) => {
                        event.currentTarget.src = '/placeholder.svg';
                    }}
                />
                {/* Gradient overlay + bottom fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

                {/* Type badge */}
                <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-200 backdrop-blur-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 animate-ping" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                    {item.type === 'SERIES' ? 'TV Pick' : 'Movie Pick'}
                </div>

                {/* Watchlist Indicator / Quick Add Button */}
                {isInWatchlist ? (
                    <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-600/90 dark:bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-md backdrop-blur-sm z-10 animate-fade-in">
                        {(isJustAdded && (freshnessPhase === 'refreshing' || freshnessPhase === 'unchanged')) ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin text-emerald-200" />
                                <span>Added (Computing...)</span>
                            </>
                        ) : (
                            <>
                                <Check className="h-3 w-3" />
                                <span>In Watchlist</span>
                            </>
                        )}
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={(e) => onAddToWatchlist(e, item)}
                        disabled={isAdding}
                        className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-emerald-600 hover:border-emerald-500 md:opacity-0 md:group-hover:opacity-100"
                    >
                        {isAdding ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Plus className="h-4 w-4" />
                        )}
                    </button>
                )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-1 p-4">
                <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-slate-800 dark:text-slate-100">
                    {item.title}
                </h3>
                {item.year && (
                    <span className="text-[12px] tabular-nums text-slate-400 dark:text-slate-500">
                        {item.year}
                    </span>
                )}
            </div>
        </Motion.div>
    );
}

export default function MemberRecommendationsSection() {
    const navigate = useNavigate();
    const { user, token } = useAuthen();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [addingId, setAddingId] = useState(null);
    const { lastAddedItem } = useRecommendationFreshnessContext();

    const {
        memberRecommendations,
        isLoadingMemberRecommendations,
        isErrorMemberRecommendations,
        isFetching: isFetchingMemberRecommendations,
    } = useMemberRecommendations(Boolean(user));

    const { data: watchlist } = useWatchlist({ enabled: Boolean(user) });
    const { mutate: addToWatchlist } = useAddToWatchlist(token);

    const isInWatchlist = (item) => {
        if (!watchlist || !item.id) return false;
        if (item.type === 'SERIES') {
            const seriesIds = Array.isArray(watchlist?.seriesId) ? watchlist.seriesId : [];
            return seriesIds.includes(item.id);
        }
        const movieIds = Array.isArray(watchlist?.moviesId) ? watchlist.moviesId : [];
        return movieIds.includes(item.id);
    };

    const handleAddToWatchlist = (e, item) => {
        e.stopPropagation();
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        setAddingId(item.id);
        addToWatchlist(
            { id: item.id, type: item.type, title: item.title },
            {
                onSettled: () => setAddingId(null),
            }
        );
    };

    const { phase: freshnessPhase, lastAddedTitle } = useRecommendationsFreshness({
        currentData: memberRecommendations,
        isFetching: isFetchingMemberRecommendations,
        enabled: Boolean(user) && !isLoadingMemberRecommendations && !isErrorMemberRecommendations,
    });

    const normalizedRecommendations = useMemo(
        () => normalizeRecommendations(memberRecommendations).slice(0, 12),
        [memberRecommendations]
    );

    const openRecommendation = (item) => {
        const path = item.type === 'SERIES' ? `/tv/${item.id}` : `/movie/${item.id}`;
        navigate(path);
    };

    const showBanner = Boolean(user);

    return (
        <>
            <section className="mb-12">
                <Motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="relative overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-teal-50/80 to-white p-6 shadow-2xl shadow-emerald-100/60 sm:p-7 dark:border-emerald-500/35 dark:from-emerald-950/35 dark:via-slate-900 dark:to-slate-900 dark:shadow-emerald-950/30"
                >
                    {/* Ambient glow */}
                    <Motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-14 -top-16 h-52 w-52 rounded-full bg-emerald-400/20 blur-3xl"
                        animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0.45, 0.2] }}
                        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <Motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute -left-16 -bottom-16 h-52 w-52 rounded-full bg-teal-400/15 blur-3xl"
                        animate={{ scale: [1.08, 0.95, 1.08], opacity: [0.15, 0.3, 0.15] }}
                        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    <div className="relative z-10">
                        {/* Section header */}
                        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <MemberFeatureChip />
                                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                                    Recommended For You
                                </h2>
                                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
                                    Smart picks ranked from your watchlist and activity. Fresh, personal, and updated as your taste evolves.
                                </p>
                            </div>

                            {!user && (
                                <button
                                    type="button"
                                    onClick={() => setShowLoginModal(true)}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700"
                                >
                                    <Lock className="h-4 w-4" />
                                    Unlock Member Picks
                                </button>
                            )}
                        </div>

                        {/* Freshness status */}
                        {showBanner && (
                            <RecommendationFreshnessBanner
                                phase={freshnessPhase}
                                lastAddedTitle={lastAddedTitle}
                            />
                        )}

                        {/* Not authenticated */}
                        {!user && (
                            <Motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35 }}
                                className="rounded-2xl border border-emerald-200/70 bg-white/80 p-5 shadow-inner shadow-emerald-100/60 dark:border-emerald-500/30 dark:bg-slate-900/70 dark:shadow-emerald-950/15"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 text-white shadow-lg shadow-emerald-500/30">
                                            <Sparkles className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                                This lane is reserved for members
                                            </h3>
                                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                                Sign in to view your personalized recommendation stream.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setShowLoginModal(true)}
                                        className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-900/25 dark:text-emerald-200 dark:hover:bg-emerald-900/35"
                                    >
                                        <span>Sign in now</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </Motion.div>
                        )}

                        {/* Loading */}
                        {user && isLoadingMemberRecommendations && (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <RecommendationSkeletonCard key={`member-rec-skeleton-${index}`} index={index} />
                                ))}
                            </div>
                        )}

                        {/* Error */}
                        {user && isErrorMemberRecommendations && (
                            <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/70 p-5 dark:border-emerald-500/25 dark:bg-emerald-900/15">
                                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                                    <span className="relative inline-flex h-2.5 w-2.5">
                                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-70 animate-ping" />
                                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                    </span>
                                    Member feature
                                </div>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                    Recommendations are temporarily unavailable. Please refresh in a moment.
                                </p>
                            </div>
                        )}

                        {/* Empty */}
                        {user && !isLoadingMemberRecommendations && !isErrorMemberRecommendations && normalizedRecommendations.length === 0 && (
                            <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/70 p-5 dark:border-emerald-500/25 dark:bg-emerald-900/15">
                                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                                    <span className="relative inline-flex h-2.5 w-2.5">
                                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-70 animate-ping" />
                                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                    </span>
                                    Member feature
                                </div>
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                    Your recommendation queue is warming up. Add a few titles to your watchlist for better personalization.
                                </p>
                            </div>
                        )}

                        {/* Cards grid — 6-column poster cards on desktop */}
                        {user && !isLoadingMemberRecommendations && !isErrorMemberRecommendations && normalizedRecommendations.length > 0 && (
                            <MovieGrid
                                items={normalizedRecommendations}
                                getKey={(item) => `${item.type}-${item.id}`}
                                columnsClassName="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                                gapClassName="gap-4"
                            >
                                {(item, idx) => (
                                    <RecommendationCard
                                        item={item}
                                        index={idx}
                                        onOpen={openRecommendation}
                                        isInWatchlist={isInWatchlist(item)}
                                        onAddToWatchlist={handleAddToWatchlist}
                                        isAdding={addingId === item.id}
                                        freshnessPhase={freshnessPhase}
                                        lastAddedItem={lastAddedItem}
                                    />
                                )}
                            </MovieGrid>
                        )}
                    </div>
                </Motion.div>
            </section>

            {showLoginModal && (
                <LoginNotificationModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onLoginSuccess={() => setShowLoginModal(false)}
                />
            )}
        </>
    );
}