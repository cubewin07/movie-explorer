import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, Lock, Sparkles, Star } from 'lucide-react';
import { useAuthen } from '@/context/AuthenProvider';
import { LoginNotificationModal } from '@/components/react_components/Modal/LoginNotificationModal';
import { useMemberRecommendations } from '@/hooks/API/recommendations';

const Motion = motion;
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

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
            const score = Number(item?.score);
            const rating = Number(item?.rating);

            return {
                id: Number(item?.filmId),
                type: recommendationType,
                title: item?.title || 'Untitled',
                year: dateValue ? dateValue.slice(0, 4) : '',
                image: resolveBackdrop(item?.backgroundImg),
                rating: Number.isFinite(rating) ? rating.toFixed(1) : null,
                matchScore: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score * 100))) : null,
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
            <span className="relative inline-flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-lime-500 opacity-70 animate-ping [animation-delay:350ms]" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime-500" />
            </span>
            <span>Member feature only</span>
        </div>
    );
}

function RecommendationSkeletonCard({ index }) {
    return (
        <Motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.06 }}
            className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/80 shadow-sm dark:border-slate-700/70 dark:bg-slate-800/60"
        >
            <div className="h-44 w-full animate-pulse bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-3 p-4">
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3.5 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3.5 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
        </Motion.div>
    );
}

function RecommendationCard({ item, onOpen }) {
    return (
        <Motion.button
            type="button"
            onClick={() => onOpen(item)}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="group relative overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-white to-emerald-50/60 text-left shadow-lg shadow-emerald-100/70 transition-all duration-300 hover:border-emerald-300 hover:shadow-xl dark:border-emerald-500/30 dark:from-slate-900 dark:to-emerald-950/30 dark:shadow-emerald-950/30"
        >
            <div className="relative h-44 w-full overflow-hidden">
                <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(event) => {
                        event.currentTarget.src = '/placeholder.svg';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-emerald-200 backdrop-blur-sm">
                    <span className="relative inline-flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 animate-ping" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </span>
                    <span>{item.type === 'SERIES' ? 'TV PICK' : 'MOVIE PICK'}</span>
                </div>

                {item.matchScore !== null && (
                    <div className="absolute right-3 top-3 rounded-full border border-emerald-300/60 bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-100 backdrop-blur-sm">
                        {item.matchScore}% match
                    </div>
                )}

                <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="line-clamp-2 text-lg font-bold text-white drop-shadow-md">{item.title}</h3>
                    <div className="mt-2 flex items-center gap-3 text-xs font-medium text-emerald-100/95">
                        {item.year && (
                            <span className="inline-flex items-center gap-1">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {item.year}
                            </span>
                        )}
                        {item.rating && (
                            <span className="inline-flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 fill-current" />
                                {item.rating}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Motion.button>
    );
}

export default function MemberRecommendationsSection() {
    const navigate = useNavigate();
    const { user } = useAuthen();
    const [showLoginModal, setShowLoginModal] = useState(false);

    const {
        memberRecommendations,
        isLoadingMemberRecommendations,
        isErrorMemberRecommendations,
    } = useMemberRecommendations(Boolean(user));

    const normalizedRecommendations = useMemo(
        () => normalizeRecommendations(memberRecommendations).slice(0, 8),
        [memberRecommendations]
    );

    const openRecommendation = (item) => {
        const path = item.type === 'SERIES' ? `/tv/${item.id}` : `/movie/${item.id}`;
        navigate(path);
    };

    return (
        <>
            <section className="mb-12">
                <Motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="relative overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-teal-50/80 to-white p-5 shadow-2xl shadow-emerald-100/70 sm:p-7 dark:border-emerald-500/35 dark:from-emerald-950/35 dark:via-slate-900 dark:to-slate-900 dark:shadow-emerald-950/40"
                >
                    <Motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-14 -top-16 h-52 w-52 rounded-full bg-emerald-400/20 blur-3xl"
                        animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0.45, 0.2] }}
                        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <Motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute -left-16 -bottom-16 h-52 w-52 rounded-full bg-lime-400/20 blur-3xl"
                        animate={{ scale: [1.08, 0.95, 1.08], opacity: [0.18, 0.35, 0.18] }}
                        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    <div className="relative z-10">
                        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <MemberFeatureChip />
                                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                                    Recommended For You
                                </h2>
                                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base dark:text-slate-300">
                                    Smart picks ranked from your activity and saved films. Fresh, personal, and updated as your taste evolves.
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

                        {!user && (
                            <Motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35 }}
                                className="rounded-2xl border border-emerald-300/70 bg-white/80 p-5 shadow-inner shadow-emerald-100/80 dark:border-emerald-500/40 dark:bg-slate-900/70 dark:shadow-emerald-950/20"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-lime-500 p-2.5 text-white shadow-lg shadow-emerald-500/30">
                                            <Sparkles className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                                This lane is reserved for members
                                            </h3>
                                            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                                                Sign in to view your personalized recommendation stream and jump directly to high-match titles.
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

                        {user && isLoadingMemberRecommendations && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <RecommendationSkeletonCard key={`member-rec-skeleton-${index}`} index={index} />
                                ))}
                            </div>
                        )}

                        {user && isErrorMemberRecommendations && (
                            <div className="rounded-2xl border border-amber-300/70 bg-amber-50/80 p-5 text-amber-900 dark:border-amber-500/40 dark:bg-amber-900/20 dark:text-amber-200">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <span className="relative inline-flex h-2.5 w-2.5">
                                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-70 animate-ping" />
                                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                    </span>
                                    Member feature only
                                </div>
                                <p className="mt-2 text-sm leading-relaxed">
                                    Recommendations are temporarily unavailable. Please refresh in a moment.
                                </p>
                            </div>
                        )}

                        {user && !isLoadingMemberRecommendations && !isErrorMemberRecommendations && normalizedRecommendations.length === 0 && (
                            <div className="rounded-2xl border border-emerald-300/60 bg-emerald-50/70 p-5 dark:border-emerald-500/40 dark:bg-emerald-900/20">
                                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                                    <span className="relative inline-flex h-2.5 w-2.5">
                                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-70 animate-ping" />
                                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                    </span>
                                    Member feature only
                                </div>
                                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                                    Your member recommendation queue is warming up. Add a few titles to your watchlist for better personalization.
                                </p>
                            </div>
                        )}

                        {user && !isLoadingMemberRecommendations && !isErrorMemberRecommendations && normalizedRecommendations.length > 0 && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {normalizedRecommendations.map((item) => (
                                    <RecommendationCard key={`${item.type}-${item.id}`} item={item} onOpen={openRecommendation} />
                                ))}
                            </div>
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
